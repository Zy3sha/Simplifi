const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");
const nativePlugins = fs.readFileSync(path.join(root, "native-plugins.js"), "utf8");

let failed = false;
function assert(name, condition) {
  if (condition) {
    console.log("✓ " + name);
  } else {
    failed = true;
    console.error("✗ " + name);
  }
}

assert("main app has a shared native action allowlist",
  app.includes("const SAFE_NATIVE_ACTION_ALIASES = Object.freeze({") &&
  app.includes("function safeNativeAction(value)") &&
  app.includes("return SAFE_NATIVE_ACTION_ALIASES[key] || \"\";") &&
  app.includes("end_breast_timer: \"end_breast_timer\""));

assert("native action handler revalidates dispatched actions",
  app.includes("const action = safeNativeAction(e.detail?.action);") &&
  !app.includes("const action = e.detail?.action;"));

assert("deep links must be trusted OBubba URLs before dispatching actions",
  app.includes("function isTrustedObubbaUrl(value)") &&
  app.includes("if (!isTrustedObubbaUrl(url)) return;") &&
  app.includes("const action = safeNativeAction(u.searchParams.get('action'));"));

assert("push notification taps use the same action allowlist",
  app.includes("const action = safeNativeAction(notification?.data?.action || actionId);") &&
  !app.includes("const action = notification.data?.action;"));

assert("native URL bridge drops blank or oversized URLs before callback",
  nativePlugins.includes("var url = data && typeof data.url === 'string' ? data.url.trim() : '';") &&
  nativePlugins.includes("if (!url || url.length > 2048) return;") &&
  nativePlugins.includes("callback(url);") &&
  !nativePlugins.includes("callback(data.url);"));

if (failed) process.exit(1);
