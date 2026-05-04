const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");
const native = fs.readFileSync(path.join(root, "native-plugins.js"), "utf8");

let failed = false;
function assert(name, condition) {
  if (condition) {
    console.log("✓ " + name);
  } else {
    failed = true;
    console.error("✗ " + name);
  }
}

assert("main app defines bounded share/copy payload helpers",
  app.includes("const SAFE_SHARE_TEXT_MAX = 12000") &&
  app.includes("const SAFE_COPY_TEXT_MAX = 24000") &&
  app.includes("function safeSharePayload(payload = {})") &&
  app.includes("function safeCopyTextPayload(value, fallback = \"\")"));

assert("clipboard writes use bounded payloads",
  app.includes("const value = safeCopyTextPayload(text);") &&
  !app.includes("const value = String(text || \"\");"));

assert("direct browser share calls are guarded globally",
  app.includes("function installSafeNavigatorShareGuard()") &&
  app.includes("async function safeNavigatorShare(payload)") &&
  app.includes("const nav = typeof navigator === \"undefined\" ? null : navigator;") &&
  app.includes("return originalShare(safeSharePayload(payload));"));

assert("browser share buttons use the safe wrapper",
  app.includes("return nav.share(safeSharePayload(payload));") &&
  (app.match(/navigator\.share\(/g) || []).length === 0 &&
  (app.match(/nav\.share\(/g) || []).length === 1 &&
  (app.match(/safeNavigatorShare\(\{/g) || []).length >= 20);

assert("direct Capacitor share calls in app use the safe wrapper",
  app.includes("async function safeCapacitorShare(plugin, payload)") &&
  !/window\.Capacitor\.Plugins\.Share\.share\(/.test(app) &&
  !/\b_(?:sp|share)\.share\(\{/.test(app));

assert("native bridge sanitises share and clipboard fallback payloads",
  native.includes("var _safeSharePayload = function(opts)") &&
  native.includes("var safeOpts = _safeSharePayload(opts);") &&
  native.includes("return navigator.share(safeOpts)") &&
  native.includes("return Share.share(safeOpts)"));

assert("share URLs are protocol allowlisted",
  app.includes("if (!/^(https?|file|blob):$/.test(url.protocol)) return \"\";") &&
  app.includes("typeof window !== \"undefined\"") &&
  native.includes("if (!/^(https?|file|blob):$/.test(url.protocol)) return '';"));

if (failed) process.exit(1);
