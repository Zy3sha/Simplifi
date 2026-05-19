#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const net = require("net");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const widths = [320, 340, 360, 375, 390, 414];
let failures = 0;
let activeCleanup = () => {};

function assert(name, condition, detail) {
  if (!condition) {
    failures += 1;
    console.error("FAIL " + name + (detail ? " :: " + detail : ""));
    return;
  }
  console.log("ok " + name);
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

async function waitForUrl(url, timeoutMs = 45000, context = {}) {
  const start = Date.now();
  let lastError = null;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      lastError = new Error("HTTP " + res.status);
    } catch (err) {
      lastError = err;
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  const details = [];
  if (context.name) details.push(context.name);
  details.push(url);
  if (context.process && context.process.exitCode !== null) details.push("process exited " + context.process.exitCode);
  if (context.stderr && context.stderr.trim()) details.push("stderr: " + context.stderr.trim().slice(-1200));
  if (context.stdout && context.stdout.trim()) details.push("stdout: " + context.stdout.trim().slice(-1200));
  const message = "Timed out waiting for " + details.join(" :: ");
  const err = new Error(message);
  if (lastError) err.cause = lastError;
  throw err;
}

function findChrome() {
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    process.env.CHROME_BIN,
  ].filter(Boolean);
  return candidates.find(p => fs.existsSync(p));
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 0;
    this.pending = new Map();
    this.eventWaiters = new Map();
  }
  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = event => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve: ok, reject: bad, timer } = this.pending.get(msg.id);
          clearTimeout(timer);
          this.pending.delete(msg.id);
          if (msg.error) bad(new Error(msg.error.message || JSON.stringify(msg.error)));
          else ok(msg.result);
          return;
        }
        if (msg.method && this.eventWaiters.has(msg.method)) {
          const waiters = this.eventWaiters.get(msg.method);
          this.eventWaiters.delete(msg.method);
          waiters.forEach(({ resolve: ok, timer }) => {
            clearTimeout(timer);
            ok(msg.params || {});
          });
        }
      };
    });
  }
  send(method, params = {}, timeoutMs = 10000) {
    const id = ++this.id;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(method + " timed out"));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.ws.send(payload);
    });
  }
  waitEvent(method, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const list = (this.eventWaiters.get(method) || []).filter(w => w.timer !== timer);
        if (list.length) this.eventWaiters.set(method, list);
        else this.eventWaiters.delete(method);
        reject(new Error(method + " timed out"));
      }, timeoutMs);
      const list = this.eventWaiters.get(method) || [];
      list.push({ resolve, reject, timer });
      this.eventWaiters.set(method, list);
    });
  }
  close() {
    for (const { reject, timer } of this.pending.values()) {
      clearTimeout(timer);
      try { reject(new Error("CDP connection closed")); } catch {}
    }
    this.pending.clear();
    for (const waiters of this.eventWaiters.values()) {
      waiters.forEach(({ reject, timer }) => {
        clearTimeout(timer);
        try { reject(new Error("CDP connection closed")); } catch {}
      });
    }
    this.eventWaiters.clear();
    try { this.ws.close(); } catch {}
  }
}

async function evaluateWithRetry(cdp, label, params, attempts = 2) {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await cdp.send("Runtime.evaluate", params, 30000);
    } catch (err) {
      lastError = err;
      if (!/timed out|Target closed|WebSocket/i.test(String(err && err.message || err)) || attempt === attempts) break;
      await new Promise(resolve => setTimeout(resolve, 900 * attempt));
    }
  }
  throw new Error(label + " failed after " + attempts + " attempt(s): " + (lastError && lastError.message || lastError));
}

async function main() {
  const chrome = findChrome();
  assert("headless Chrome is available for viewport regression scans", !!chrome, "set CHROME_BIN if Chrome is installed elsewhere");
  if (!chrome) process.exit(1);

  const appPort = await freePort();
  const debugPort = await freePort();
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "obubba-viewport-"));
  const appUrl = "http://127.0.0.1:" + appPort + "/";
  const appShellUrl = appUrl + "app.html";
  const server = spawn("npx", ["vite", "--host", "127.0.0.1", "--port", String(appPort), "--strictPort"], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, BROWSER: "none" },
  });
  let serverStdout = "";
  let serverStderr = "";
  server.stdout.on("data", chunk => { serverStdout = (serverStdout + String(chunk)).slice(-4000); });
  server.stderr.on("data", chunk => { serverStderr = (serverStderr + String(chunk)).slice(-4000); });
  const chromeProc = spawn(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--remote-debugging-address=127.0.0.1",
    "--remote-debugging-port=" + debugPort,
    "--user-data-dir=" + profileDir,
    "--window-size=390,844",
    "about:blank",
  ], { stdio: ["ignore", "pipe", "pipe"] });
  let chromeStdout = "";
  let chromeStderr = "";
  chromeProc.stdout.on("data", chunk => { chromeStdout = (chromeStdout + String(chunk)).slice(-4000); });
  chromeProc.stderr.on("data", chunk => { chromeStderr = (chromeStderr + String(chunk)).slice(-4000); });

  const cleanup = () => {
    activeCleanup = () => {};
    try { if (typeof cdp !== "undefined" && cdp) cdp.close(); } catch {}
    try { server.kill("SIGTERM"); } catch {}
    try { chromeProc.kill("SIGTERM"); } catch {}
    try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch {}
  };
  activeCleanup = cleanup;
  process.on("exit", cleanup);
  process.on("SIGINT", () => { cleanup(); process.exit(130); });
  process.on("SIGTERM", () => { cleanup(); process.exit(143); });

  await waitForUrl(appUrl, 45000, {
    name: "vite preview server",
    process: server,
    stdout: serverStdout,
    stderr: serverStderr,
  });
  await waitForUrl("http://127.0.0.1:" + debugPort + "/json/version", 45000, {
    name: "headless Chrome debug endpoint",
    process: chromeProc,
    stdout: chromeStdout,
    stderr: chromeStderr,
  });

  const newTarget = await fetch("http://127.0.0.1:" + debugPort + "/json/new?" + encodeURIComponent(appShellUrl), { method: "PUT" }).then(r => r.json());
  var cdp = new CdpClient(newTarget.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `
      try {
        const pad = n => String(n).padStart(2, "0");
        const now = new Date();
        const day = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
        const sampleDays = {};
        sampleDays[day] = [
          { id: "audit-wake", type: "wake", time: "07:00", night: false, modifiedAt: Date.now() - 50000 },
          { id: "audit-feed", type: "feed", feedType: "milk", time: "08:15", amount: 120, night: false, modifiedAt: Date.now() - 40000 },
          { id: "audit-nap", type: "nap", start: "09:45", end: "10:25", duration: 40, night: false, modifiedAt: Date.now() - 30000 },
          { id: "audit-poop", type: "poop", time: "10:45", poopType: "wet", night: false, modifiedAt: Date.now() - 20000 }
        ];
        localStorage.setItem("tut_v2","1");
        localStorage.setItem("day_tut_v1","1");
        localStorage.setItem("day_tut_v2","1");
        localStorage.setItem("ob_no_judge_v1","1");
        localStorage.setItem("ob_dark_mode","0");
        localStorage.setItem("ob_children_v1", JSON.stringify({ active: "audit", items: { audit: { name: "Oliver", dob: "2025-10-20", sex: "boy", days: sampleDays } } }));
        localStorage.setItem("children_v1", JSON.stringify({ audit: { id: "audit", name: "Oliver", dob: "2025-10-20", sex: "boy", days: sampleDays } }));
        localStorage.setItem("active_child","audit");
        localStorage.setItem("onboarded_v2","1");
      } catch {}
    `,
  });

  for (const width of widths) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
      screenWidth: width,
      screenHeight: 844,
    });
    const load = cdp.waitEvent("Page.loadEventFired", 12000).catch(() => null);
    await cdp.send("Page.navigate", { url: appShellUrl + "?viewportAudit=" + width });
    await load;
    await new Promise(resolve => setTimeout(resolve, 1800));
    const metricsExpression = `(() => {
        const doc = document.documentElement;
        const body = document.body;
        const visible = Math.floor((window.visualViewport && window.visualViewport.width) || window.innerWidth || ${width});
        const limit = visible + 1;
        const offenders = Array.from(document.querySelectorAll("body *")).map(el => {
          const r = el.getBoundingClientRect();
          if (!r || r.width < 2 || r.height < 2) return null;
          const style = getComputedStyle(el);
          if (style.position === "fixed" && style.pointerEvents === "none") return null;
          const right = Math.ceil(r.right);
          const left = Math.floor(r.left);
          if (right <= limit && left >= -1) return null;
          let clippedBySafeParent = false;
          for (let parent = el.parentElement; parent && parent !== body; parent = parent.parentElement) {
            const parentStyle = getComputedStyle(parent);
            if (!/(hidden|clip|auto|scroll)/.test(parentStyle.overflowX || "")) continue;
            const pr = parent.getBoundingClientRect();
            const parentSafe = Math.ceil(pr.right) <= limit && Math.floor(pr.left) >= -1;
            const parentClips = right > Math.ceil(pr.right) + 1 || left < Math.floor(pr.left) - 1;
            if (parentSafe && parentClips) {
              clippedBySafeParent = true;
              break;
            }
          }
          if (clippedBySafeParent) return null;
          return {
            tag: el.tagName.toLowerCase(),
            cls: String(el.className || "").slice(0, 120),
            text: String(el.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 80),
            left,
            right,
            width: Math.ceil(r.width)
          };
        }).filter(Boolean).slice(0, 5);
        return {
          visible,
          docClientWidth: doc.clientWidth,
          docScrollWidth: doc.scrollWidth,
          bodyClientWidth: body.clientWidth,
          bodyScrollWidth: body.scrollWidth,
          scrollX: Math.round(window.scrollX || 0),
          docScrollLeft: Math.round(doc.scrollLeft || 0),
          bodyScrollLeft: Math.round(body.scrollLeft || 0),
          cssVw: getComputedStyle(doc).getPropertyValue("--ob-vw").trim(),
          offenders,
        };
      })()`;
    const result = await evaluateWithRetry(cdp, "viewport " + width + " initial metrics", {
      returnByValue: true,
      expression: metricsExpression,
    });
    const value = result && result.result && result.result.value ? result.result.value : {};
    assert("viewport " + width + " keeps document width inside the visible screen", value.docScrollWidth <= value.visible + 1, JSON.stringify(value));
    assert("viewport " + width + " keeps body width inside the visible screen", value.bodyScrollWidth <= value.visible + 1, JSON.stringify(value));
    assert("viewport " + width + " stays horizontally anchored on load", value.scrollX === 0 && value.docScrollLeft === 0 && value.bodyScrollLeft === 0, JSON.stringify(value));
    assert("viewport " + width + " has no visible offscreen UI", !value.offenders || value.offenders.length === 0, JSON.stringify(value.offenders));

    const quickFeed = await evaluateWithRetry(cdp, "viewport " + width + " quick feed click", {
      returnByValue: true,
      expression: `(() => {
	        const buttons = Array.from(document.querySelectorAll(".ob-clock-log-btn, button"));
	        const feed = buttons.find(btn => {
	          return /^Feed\\./.test(String(btn.getAttribute("aria-label") || "")) || String(btn.textContent || "").trim() === "🍼Feed";
	        });
        if (!feed) return false;
        feed.click();
        return true;
      })()`,
    });
    if (quickFeed && quickFeed.result && quickFeed.result.value) {
      await new Promise(resolve => setTimeout(resolve, 450));
      const afterFeed = await evaluateWithRetry(cdp, "viewport " + width + " post-feed metrics", {
        returnByValue: true,
        expression: metricsExpression,
      });
      const afterValue = afterFeed && afterFeed.result && afterFeed.result.value ? afterFeed.result.value : {};
      assert("viewport " + width + " stays horizontally anchored after quick feed", afterValue.scrollX === 0 && afterValue.docScrollLeft === 0 && afterValue.bodyScrollLeft === 0, JSON.stringify(afterValue));
      assert("viewport " + width + " keeps logged-feed UI inside the visible screen", afterValue.docScrollWidth <= afterValue.visible + 1 && afterValue.bodyScrollWidth <= afterValue.visible + 1 && (!afterValue.offenders || afterValue.offenders.length === 0), JSON.stringify(afterValue));
      await evaluateWithRetry(cdp, "viewport " + width + " dismiss post-feed prompt", {
        returnByValue: true,
        expression: `(() => {
          const buttons = Array.from(document.querySelectorAll("button"));
          const noThanks = buttons.find(btn => String(btn.textContent || "").trim() === "No thanks");
          if (noThanks) { noThanks.click(); return "dismissed"; }
          const close = buttons.find(btn => /^(×|✕|Cancel)$/.test(String(btn.textContent || "").trim()) || /close/i.test(String(btn.getAttribute("aria-label") || "")));
          if (close) { close.click(); return "closed"; }
          return "none";
        })()`,
      });
      await new Promise(resolve => setTimeout(resolve, 250));
    } else {
      assert("viewport " + width + " can find Feed clock-log button for post-log overflow check", false);
    }

    const openedLogs = await evaluateWithRetry(cdp, "viewport " + width + " open Logs tab", {
      returnByValue: true,
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll("button,[role=button]"));
        const logs = buttons.find(btn => String(btn.textContent || "").trim() === "Logs");
        if (!logs) return false;
        if (String(logs.className || "").includes("is-active")) return true;
        logs.click();
        return true;
      })()`,
    });
    assert("viewport " + width + " can open Logs for edit-window overflow check", !!(openedLogs && openedLogs.result && openedLogs.result.value));
    await new Promise(resolve => setTimeout(resolve, 350));
    const openedEditSheet = await evaluateWithRetry(cdp, "viewport " + width + " open first log edit sheet", {
      returnByValue: true,
      expression: `(() => {
        const rows = Array.from(document.querySelectorAll(".ob-clock-row, [data-testid='clock-log-tip-edit']"));
        const row = rows.find(el => /Feed|Nap|Wake|Nappy|Bottle|Milk/i.test(String(el.textContent || ""))) || rows[0];
        if (!row) return {ok:false, rows:Array.from(document.querySelectorAll("button")).slice(0,20).map(b=>String(b.textContent||"").trim()).filter(Boolean)};
        row.click();
        return {ok:true, text:String(row.textContent || "").replace(/\\s+/g, " ").trim().slice(0,80)};
      })()`,
    });
    const editValue = openedEditSheet && openedEditSheet.result && openedEditSheet.result.value;
    assert("viewport " + width + " can open a logged-item edit window", !!(editValue && editValue.ok), JSON.stringify(editValue));
    if (editValue && editValue.ok) {
      await new Promise(resolve => setTimeout(resolve, 450));
      const editMetrics = await evaluateWithRetry(cdp, "viewport " + width + " edit sheet metrics", {
        returnByValue: true,
        expression: metricsExpression,
      });
      const editMetricValue = editMetrics && editMetrics.result && editMetrics.result.value ? editMetrics.result.value : {};
      assert("viewport " + width + " stays horizontally anchored with edit window open", editMetricValue.scrollX === 0 && editMetricValue.docScrollLeft === 0 && editMetricValue.bodyScrollLeft === 0, JSON.stringify(editMetricValue));
      assert("viewport " + width + " keeps edit window inside the visible screen", editMetricValue.docScrollWidth <= editMetricValue.visible + 1 && editMetricValue.bodyScrollWidth <= editMetricValue.visible + 1 && (!editMetricValue.offenders || editMetricValue.offenders.length === 0), JSON.stringify(editMetricValue));
      await evaluateWithRetry(cdp, "viewport " + width + " close edit sheet", {
        returnByValue: true,
        expression: `(() => {
          const overlay = document.querySelector(".ob-sheet-overlay");
          if (overlay) { overlay.click(); return true; }
          const close = Array.from(document.querySelectorAll("button")).find(b => /^(×|✕|Cancel)$/.test(String(b.textContent || "").trim()) || /close/i.test(String(b.getAttribute("aria-label") || "")));
          if (close) { close.click(); return true; }
          return false;
        })()`,
      });
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  cdp.close();
  cleanup();
  assert("viewport overflow audit finished", failures === 0);
  if (failures) process.exit(1);
}

main().catch(err => {
  try { activeCleanup(); } catch {}
  console.error(err && err.stack || err);
  process.exit(1);
});
