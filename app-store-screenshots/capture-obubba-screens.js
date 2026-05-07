#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const net = require("net");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const rawDir = path.join(__dirname, "raw");

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

async function waitForUrl(url, timeoutMs = 18000) {
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
  send(method, params = {}, timeoutMs = 20000) {
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
  waitEvent(method, timeoutMs = 15000) {
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

function demoSeedSource() {
  return `(() => {
    const today = new Date();
    const pad = n => String(n).padStart(2, "0");
    const key = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    const addDays = n => { const d = new Date(today); d.setDate(d.getDate() + n); return key(d); };
    const id = s => "store-" + s;
    const days = {};
    for (let i = -10; i <= 0; i++) {
      const dk = addDays(i);
      const late = i % 3 === 0;
      const longNap = i % 4 === 0;
      days[dk] = [
        {id:id(dk+"-wake"), type:"wake", time: late ? "07:38" : "07:06", night:false, note:"morning"},
        {id:id(dk+"-feed1"), type:"feed", feedType:"breast", time:"07:22", amount:0, breastL:9, breastR:11, note:"both sides"},
        {id:id(dk+"-nappy1"), type:"poop", time:"08:12", poopType:"wet", note:"wet"},
        {id:id(dk+"-nap1"), type:"nap", start: late ? "09:34" : "09:18", end: late ? "10:09" : "10:04", napLocation:"cot", note:"cot"},
        {id:id(dk+"-feed2"), type:"feed", feedType:"milk", time:"10:28", amount:110, note:"bottle"},
        {id:id(dk+"-solids"), type:"feed", feedType:"solids", time:"11:36", food: i % 2 ? "oat porridge with pear" : "chicken and lentil puree", note: i % 2 ? "oat porridge with pear" : "chicken and lentil puree", weaningEmoji: i % 2 ? "🥣" : "🍗"},
        {id:id(dk+"-nap2"), type:"nap", start:"12:42", end: longNap ? "14:55" : "14:18", napLocation:"cot", note:"cot"},
        {id:id(dk+"-feed3"), type:"feed", feedType:"breast", time:"15:12", amount:0, breastL:8, breastR:9, note:"snack feed"},
        {id:id(dk+"-nappy2"), type:"poop", time:"16:06", poopType:"wet", note:"wet"},
      ];
      if (i < 0) {
        days[dk].push({id:id(dk+"-bed"), type:"sleep", time: late ? "20:02" : "19:34", night:false, note:"bedtime"});
        if (i === -1 || i === -4 || i === -7) {
          days[dk].push({id:id(dk+"-nw"), type:"wake", time:"03:18", night:true, assisted:true, assistedType:"milk", assistedDuration:"12", settleDuration:"28", settleTime:"03:46", note:"settled with feed and cuddle"});
        }
      }
    }
    const active = "demo-maya";
    const child = {
      id: active,
      name: "Maya",
      dob: "2025-10-22",
      sex: "girl",
      unborn: false,
      createdAt: "2025-10-22T10:00:00.000Z",
      days,
      weights: [
        {date:addDays(-84), weight:6.2},
        {date:addDays(-56), weight:6.8},
        {date:addDays(-28), weight:7.25},
        {date:addDays(-2), weight:7.55}
      ],
      heights: [{date:addDays(-2), height:66}],
      headCircs: [{date:addDays(-2), head:42.2}],
      milestones: {
        rolling: {date:addDays(-42), note:"Rolling both ways"},
        sitting: {date:addDays(-9), note:"Sitting with less support"},
        babble: {date:addDays(-5), note:"Babbling lots"}
      },
      teething: [{date:addDays(-3), tooth:"lower central"}],
      weaning: [
        {id:"w1", date:addDays(-8), food:"carrot and swede mash", reaction:"liked", tryAgain:"yes", allergens:[]},
        {id:"w2", date:addDays(-4), food:"oat porridge with pear", reaction:"loved", tryAgain:"yes", allergens:["oats"]},
        {id:"w3", date:addDays(0), food:"chicken and lentil puree", reaction:"liked", tryAgain:"yes", allergens:[], tags:["iron-rich","protein"]}
      ],
      cryingHelps:{},
      weaningStyle:"mixed"
    };
    localStorage.setItem("children_v1", JSON.stringify({[active]: child}));
    localStorage.setItem("active_child", active);
    localStorage.setItem("bn_v2", "Maya");
    localStorage.setItem("dob_v1", "2025-10-22");
    localStorage.setItem("onboarded_v2", "1");
    localStorage.setItem("auth_verified", "1");
    localStorage.setItem("needs_child_setup_v1", "0");
    localStorage.setItem("tut_v2", "1");
    localStorage.setItem("day_tut_v1", "1");
    localStorage.setItem("day_tut_v2", "1");
    localStorage.setItem("transition_6mo_v1", "1");
    localStorage.setItem("ob_last_letter_date", new Date().toISOString());
    localStorage.setItem("ob_no_judge_v1", "1");
    localStorage.setItem("ob_claim_dismissed", "1");
    localStorage.setItem("ob_pwa_mobile_move_prompt_v1", "done");
    localStorage.setItem("ob_daily_log_reminder_prompt_v1", JSON.stringify({answer:"later", at:Date.now()}));
    localStorage.setItem("ob_review_last_prompt", String(Date.now()));
    localStorage.setItem("ob_village_unlocked", "1");
    localStorage.setItem("ob_village_end", new Date(Date.now() + 45*86400000).toISOString());
    localStorage.setItem("family_username", "maya-family");
    localStorage.setItem("backup_code", "DEMO-SYNC");
    localStorage.setItem("child_sync_codes_v1", JSON.stringify({[active]:"BUBBA-SYNC"}));
    localStorage.setItem("theme_override", JSON.stringify({mode:"light", until:Date.now() + 86400000}));
    localStorage.setItem("ob_clock_presence_preview", "1");
    localStorage.setItem("weaning_started_" + active, "1");
    localStorage.setItem("ob_wean_setup_" + active, "1");
    localStorage.setItem("ob_weaning_style_pref_" + active, "mixed");
  })();`;
}

async function evalInPage(cdp, expression, timeoutMs = 20000) {
  return cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, timeoutMs);
}

async function wait(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function clickText(cdp, text) {
  const expr = `(() => {
    const needle = ${JSON.stringify(text)}.toLowerCase();
    const els = Array.from(document.querySelectorAll("button,summary,[role='button']"));
    const el = els.find(e => (e.innerText || e.textContent || "").toLowerCase().includes(needle));
    if (el) { el.click(); return true; }
    return false;
  })()`;
  const res = await evalInPage(cdp, expr);
  return !!(res && res.result && res.result.value);
}

async function clickAria(cdp, label) {
  const expr = `(() => {
    const el = Array.from(document.querySelectorAll("button,[role='button']")).find(e => e.getAttribute("aria-label") === ${JSON.stringify(label)});
    if (el) { el.click(); return true; }
    return false;
  })()`;
  const res = await evalInPage(cdp, expr);
  return !!(res && res.result && res.result.value);
}

async function clickTestId(cdp, testId) {
  const expr = `(() => {
    const el = document.querySelector('[data-testid="${testId}"]');
    if (el) { el.click(); return true; }
    return false;
  })()`;
  const res = await evalInPage(cdp, expr);
  return !!(res && res.result && res.result.value);
}

async function preparePage(cdp, appUrl, query = "") {
  const load = cdp.waitEvent("Page.loadEventFired", 15000).catch(() => null);
  await cdp.send("Page.navigate", { url: appUrl + query });
  await load;
  await wait(2200);
  await evalInPage(cdp, `(() => {
    for (let i = 0; i < 4; i++) {
      const close = Array.from(document.querySelectorAll("button")).find(b => {
        const label = (b.getAttribute("aria-label") || "").trim();
        const text = (b.innerText || b.textContent || "").trim();
        return label === "Close" || text === "Not now" || text.includes("Let's grow together");
      });
      if (close) close.click();
    }
    window.scrollTo(0,0);
  })()`).catch(() => null);
  await wait(450);
}

async function capture(cdp, fileName) {
  await fs.promises.mkdir(rawDir, { recursive: true });
  const file = path.join(rawDir, fileName);
  await wait(700);
  const shot = await cdp.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false }, 60000);
  await fs.promises.writeFile(file, Buffer.from(shot.data, "base64"));
  console.log("captured " + file);
}

async function main() {
  const chrome = findChrome();
  if (!chrome) throw new Error("Chrome not found. Set CHROME_BIN.");
  const appPort = await freePort();
  const debugPort = await freePort();
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "obubba-store-"));
  const appUrl = "http://127.0.0.1:" + appPort + "/";
  const server = spawn("npx", ["vite", "--host", "127.0.0.1", "--port", String(appPort), "--strictPort"], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, BROWSER: "none" },
  });
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
    try { server.kill("SIGTERM"); } catch {}
    try { chromeProc.kill("SIGTERM"); } catch {}
    try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch {}
  };
  process.on("exit", cleanup);
  process.on("SIGINT", () => { cleanup(); process.exit(130); });

  try {
    await waitForUrl(appUrl);
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
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: demoSeedSource() });
    const shotOnly = process.env.OB_STORE_SHOT_ONLY || "";
    const shouldCapture = (id) => !shotOnly || shotOnly === id;

    if (shouldCapture("01")) {
      await preparePage(cdp, appUrl, "?storeShot=track-day&clockThemePreview=day");
      await clickAria(cdp, "Track tab");
      await capture(cdp, "01-track-day.png");
    }

    if (shouldCapture("02")) {
      await preparePage(cdp, appUrl, "?storeShot=track-night&clockThemePreview=night&presencePreview=1");
      await clickAria(cdp, "Track tab");
      await capture(cdp, "02-track-night.png");
    }

    if (shouldCapture("03")) {
      await preparePage(cdp, appUrl, "?storeShot=care");
      await clickAria(cdp, "Care tab");
      await wait(800);
      await capture(cdp, "03-care-tools.png");
    }

    if (shouldCapture("04")) {
      await preparePage(cdp, appUrl, "?storeShot=sleep");
      await clickAria(cdp, "Care tab");
      await wait(650);
      await clickTestId(cdp, "care-tile-sleep");
      await wait(900);
      await capture(cdp, "04-sleep-insight.png");
    }

    if (shouldCapture("05")) {
      await preparePage(cdp, appUrl, "?storeShot=weaning");
      await clickAria(cdp, "Care tab");
      await wait(650);
      await clickTestId(cdp, "care-tile-weaning");
      await wait(900);
      await capture(cdp, "05-weaning.png");
    }

    if (shouldCapture("06")) {
      await preparePage(cdp, appUrl, "?storeShot=parent-room");
      await clickAria(cdp, "Care tab");
      await wait(650);
      await clickTestId(cdp, "care-tile-parentroom");
      await wait(900);
      await capture(cdp, "06-parent-room.png");
    }

    if (shouldCapture("07")) {
      await preparePage(cdp, appUrl, "?storeShot=grow");
      await clickAria(cdp, "Grow tab");
      await wait(900);
      await capture(cdp, "07-grow.png");
    }

    if (shouldCapture("08")) {
      await preparePage(cdp, appUrl, "?storeShot=account");
      await clickAria(cdp, "Account tab");
      await wait(900);
      await capture(cdp, "08-sync-account.png");
    }

    if (shouldCapture("09")) {
      await preparePage(cdp, appUrl, "?storeShot=bubba-care");
      await clickAria(cdp, "Care tab");
      await wait(650);
      await clickTestId(cdp, "care-tile-bubbacare");
      await wait(900);
      await capture(cdp, "09-bubba-care.png");
    }

    if (shouldCapture("10")) {
      await preparePage(cdp, appUrl, "?storeShot=feeding");
      await clickAria(cdp, "Care tab");
      await wait(650);
      await clickTestId(cdp, "care-tile-feeding");
      await wait(900);
      await capture(cdp, "10-feeding-insight.png");
    }

    if (shouldCapture("11")) {
      await preparePage(cdp, appUrl, "?storeShot=travel");
      await clickAria(cdp, "Care tab");
      await wait(650);
      await clickTestId(cdp, "care-tile-travel");
      await wait(900);
      await capture(cdp, "11-travel-help.png");
    }

    if (shouldCapture("12")) {
      await preparePage(cdp, appUrl, "?storeShot=safe-sleep");
      await clickAria(cdp, "Care tab");
      await wait(650);
      await clickTestId(cdp, "care-tile-safesleep");
      await wait(900);
      await capture(cdp, "12-safe-sleep.png");
    }

    cdp.close();
  } finally {
    cleanup();
  }
}

main().catch(err => {
  console.error(err && err.stack || err);
  process.exit(1);
});
