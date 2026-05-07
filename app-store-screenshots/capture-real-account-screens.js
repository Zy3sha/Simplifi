#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const net = require("net");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const rawDir = path.join(__dirname, "real-raw");
const username = String(process.env.OB_STORE_USERNAME || "").trim();
const pin = String(process.env.OB_STORE_PIN || "").trim();

if (!username || !/^\d{4}$/.test(pin)) {
  console.error("Set OB_STORE_USERNAME and OB_STORE_PIN=4 digits.");
  process.exit(2);
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

async function waitForUrl(url, timeoutMs = 22000) {
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
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  throw lastError || new Error("Timed out waiting for " + url);
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
  send(method, params = {}, timeoutMs = 25000) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(method + " timed out"));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  waitEvent(method, timeoutMs = 18000) {
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
    try { this.ws.close(); } catch {}
  }
}

function preLoginSeedSource() {
  return `(() => {
    localStorage.setItem("family_username", ${JSON.stringify(username)});
    localStorage.setItem("tut_v2", "1");
    localStorage.setItem("day_tut_v1", "1");
    localStorage.setItem("day_tut_v2", "1");
    localStorage.setItem("transition_6mo_v1", "1");
    localStorage.setItem("ob_last_letter_date", new Date().toISOString());
    localStorage.setItem("ob_no_judge_v1", "1");
    localStorage.setItem("ob_claim_dismissed", "1");
    localStorage.setItem("ob_pwa_mobile_move_prompt_v1", "done");
    localStorage.setItem("ob_review_last_prompt", String(Date.now()));
    localStorage.setItem("ob_account_prompt_dismissed", "1");
    localStorage.setItem("ob_curiosity_shown", "1");
    localStorage.setItem("ob_daily_log_reminder_prompt_v1", JSON.stringify({answer:"later", at:Date.now()}));
  })();`;
}

async function evalInPage(cdp, expression, timeoutMs = 25000) {
  return cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, timeoutMs);
}

async function wait(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function navigate(cdp, appUrl, query = "") {
  const load = cdp.waitEvent("Page.loadEventFired", 18000).catch(() => null);
  await cdp.send("Page.navigate", { url: appUrl + query });
  await load;
  await wait(1800);
  await closeNoise(cdp);
}

async function closeNoise(cdp) {
  await evalInPage(cdp, `(() => {
    localStorage.setItem("tut_v2", "1");
    localStorage.setItem("day_tut_v1", "1");
    localStorage.setItem("day_tut_v2", "1");
    localStorage.setItem("transition_6mo_v1", "1");
    localStorage.setItem("ob_last_letter_date", new Date().toISOString());
    const clickable = Array.from(document.querySelectorAll("button"));
    for (let i = 0; i < 5; i++) {
      const b = clickable.find(btn => {
        const label = (btn.getAttribute("aria-label") || "").trim();
        const text = (btn.innerText || btn.textContent || "").trim();
        return label === "Close" || text === "Not now" || text === "Maybe later" || text === "Skip";
      });
      if (b) b.click();
    }
    window.scrollTo(0, 0);
    return true;
  })()`).catch(() => null);
  await wait(350);
}

async function login(cdp) {
  await evalInPage(cdp, `(() => {
    const setValue = (el, value) => {
      const proto = Object.getPrototypeOf(el);
      const desc = Object.getOwnPropertyDescriptor(proto, "value") || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
      desc.set.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    };
    const inputs = Array.from(document.querySelectorAll("input"));
    const user = inputs.find(i => (i.type || "").toLowerCase() === "text") || inputs[0];
    const pass = inputs.find(i => (i.type || "").toLowerCase() === "tel") || inputs.find(i => /pin/i.test(i.placeholder || ""));
    if (user) setValue(user, ${JSON.stringify(username)});
    if (pass) setValue(pass, ${JSON.stringify(pin)});
    return {inputs: inputs.length, hasUser: !!user, hasPin: !!pass};
  })()`);
  await wait(500);
  await evalInPage(cdp, `(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(b => /sign in/i.test((b.innerText || b.textContent || "").trim()) && !b.disabled);
    if (btn) { btn.click(); return true; }
    return false;
  })()`);
  const start = Date.now();
  let last = "";
  while (Date.now() - start < 75000) {
    const res = await evalInPage(cdp, `(() => {
      const err = Array.from(document.querySelectorAll("div,span,p")).map(e => (e.innerText || e.textContent || "").trim()).filter(t => /incorrect pin|username not found|could not reach|account data|try again/i.test(t)).slice(0, 2).join(" | ");
      return {
        verified: localStorage.getItem("auth_verified") === "1",
        hasChildren: !!localStorage.getItem("children_v1"),
        name: (() => { try { const c = JSON.parse(localStorage.getItem("children_v1") || "{}"); return Object.values(c).map(x => x && x.name).filter(Boolean).join(", "); } catch { return ""; } })(),
        error: err
      };
    })()`);
    const value = res && res.result && res.result.value;
    if (value && value.verified && value.hasChildren) {
      await wait(5200);
      await closeNoise(cdp);
      return value;
    }
    if (value && value.error && value.error !== last) {
      last = value.error;
      console.log("login status: " + value.error);
    }
    await wait(900);
  }
  throw new Error("Timed out signing in. Last message: " + last);
}

async function clickAria(cdp, label) {
  const res = await evalInPage(cdp, `(() => {
    const el = Array.from(document.querySelectorAll("button,[role='button']")).find(e => e.getAttribute("aria-label") === ${JSON.stringify(label)});
    if (el) { el.click(); return true; }
    return false;
  })()`);
  await wait(650);
  await closeNoise(cdp);
  return !!(res && res.result && res.result.value);
}

async function clickText(cdp, text) {
  const res = await evalInPage(cdp, `(() => {
    const needle = ${JSON.stringify(text)}.toLowerCase();
    const els = Array.from(document.querySelectorAll("button,summary,[role='button']"));
    const el = els.find(e => (e.innerText || e.textContent || "").toLowerCase().includes(needle));
    if (el) { el.click(); return true; }
    return false;
  })()`);
  await wait(700);
  await closeNoise(cdp);
  return !!(res && res.result && res.result.value);
}

async function clickTestId(cdp, testId) {
  const res = await evalInPage(cdp, `(() => {
    const el = document.querySelector('[data-testid="${testId}"]');
    if (el) { el.click(); return true; }
    return false;
  })()`);
  await wait(850);
  await closeNoise(cdp);
  return !!(res && res.result && res.result.value);
}

async function capture(cdp, fileName) {
  await fs.promises.mkdir(rawDir, { recursive: true });
  await evalInPage(cdp, `(() => {
    let s = document.getElementById("ob-store-shot-freeze");
    if (!s) {
      s = document.createElement("style");
      s.id = "ob-store-shot-freeze";
      s.textContent = "*{animation-duration:0.001s!important;transition-duration:0.001s!important;scroll-behavior:auto!important}";
      document.head.appendChild(s);
    }
    window.scrollTo(0, 0);
    return true;
  })()`).catch(() => null);
  await wait(900);
  let shot;
  try {
    shot = await cdp.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
      optimizeForSpeed: true,
      clip: { x: 0, y: 0, width: 430, height: 932, scale: 3 },
    }, 60000);
  } catch (err) {
    await wait(1200);
    shot = await cdp.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
      clip: { x: 0, y: 0, width: 430, height: 932, scale: 3 },
    }, 60000);
  }
  const file = path.join(rawDir, fileName);
  await fs.promises.writeFile(file, Buffer.from(shot.data, "base64"));
  console.log("captured " + file);
}

async function scrollToTestId(cdp, testId, block = "start") {
  await evalInPage(cdp, `(() => {
    document.querySelectorAll("details").forEach(d => {
      if ((d.getAttribute("data-testid") || "").includes("drawer") || (d.getAttribute("data-testid") || "").includes("debrief")) d.open = true;
    });
    const el = document.querySelector('[data-testid="${testId}"]');
    if (el) el.scrollIntoView({block:${JSON.stringify(block)}, inline:"nearest"});
    return !!el;
  })()`);
  await wait(800);
}

async function main() {
  const chrome = findChrome();
  if (!chrome) throw new Error("Chrome not found. Set CHROME_BIN.");

  let server = null;
  const appPort = 5173;
  const appUrl = "http://127.0.0.1:" + appPort + "/";
  try {
    await waitForUrl(appUrl, 2000);
  } catch {
    server = spawn("npx", ["vite", "--host", "127.0.0.1", "--port", String(appPort), "--strictPort"], {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, BROWSER: "none" },
    });
    await waitForUrl(appUrl);
  }

  const debugPort = await freePort();
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "obubba-real-store-"));
  const chromeProc = spawn(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--hide-scrollbars",
    "--remote-debugging-address=127.0.0.1",
    "--remote-debugging-port=" + debugPort,
    "--user-data-dir=" + profileDir,
    "--window-size=430,932",
    "about:blank",
  ], { stdio: ["ignore", "pipe", "pipe"] });

  const cleanup = () => {
    try { chromeProc.kill("SIGTERM"); } catch {}
    try { if (server) server.kill("SIGTERM"); } catch {}
    try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch {}
  };
  process.on("exit", cleanup);
  process.on("SIGINT", () => { cleanup(); process.exit(130); });

  try {
    await waitForUrl("http://127.0.0.1:" + debugPort + "/json/version");
    const newTarget = await fetch("http://127.0.0.1:" + debugPort + "/json/new?" + encodeURIComponent(appUrl), { method: "PUT" }).then(r => r.json());
    const cdp = new CdpClient(newTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 430,
      height: 932,
      deviceScaleFactor: 3,
      mobile: true,
      screenWidth: 430,
      screenHeight: 932,
    });
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: preLoginSeedSource() });

    await navigate(cdp, appUrl, "?realStoreShot=login");
    const loginInfo = await login(cdp);
    console.log("signed in: " + (loginInfo.name || "account loaded"));

    await navigate(cdp, appUrl, "?realStoreShot=track-day&clockThemePreview=day");
    await clickAria(cdp, "Track tab");
    await capture(cdp, "01-track-day-real.png");

    await navigate(cdp, appUrl, "?realStoreShot=track-night&clockThemePreview=night&presencePreview=1");
    await clickAria(cdp, "Track tab");
    await capture(cdp, "02-track-night-real.png");

    await clickText(cdp, "Guidance");
    await capture(cdp, "03-track-guidance-real.png");

    await clickText(cdp, "Plan");
    await capture(cdp, "04-track-plan-real.png");

    await clickAria(cdp, "Care tab");
    await capture(cdp, "05-care-tools-real.png");

    await clickTestId(cdp, "care-tile-sleep");
    await capture(cdp, "06-sleep-analysis-real.png");

    await scrollToTestId(cdp, "care-sleep-consultant-reasoning", "start");
    await capture(cdp, "07-sleep-reasoning-real.png");

    await clickAria(cdp, "Care tab");
    await clickTestId(cdp, "care-tile-feeding");
    await capture(cdp, "08-feeding-insight-real.png");

    await clickAria(cdp, "Care tab");
    await clickTestId(cdp, "care-tile-weaning");
    await capture(cdp, "09-weaning-real.png");

    await clickAria(cdp, "Care tab");
    await clickTestId(cdp, "care-tile-parentroom");
    await capture(cdp, "10-parent-room-real.png");

    await clickAria(cdp, "Grow tab");
    await capture(cdp, "11-grow-real.png");

    await clickAria(cdp, "Care tab");
    await clickTestId(cdp, "care-tile-bubbacare");
    await capture(cdp, "12-bubba-care-real.png");

    cdp.close();
  } finally {
    cleanup();
  }
}

main().catch(err => {
  console.error(err && err.stack || err);
  process.exit(1);
});
