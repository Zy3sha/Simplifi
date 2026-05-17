const fs = require("fs");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync("public/index.html", "utf8");
const inlineScripts = [...html.matchAll(/<script>\s*([\s\S]*?)<\/script>/g)].map((match) => match[1]);
const gateScript = inlineScripts.find((script) =>
  script.includes("__OBUBBA_DOWNLOAD_LANDING__") && script.includes("ob-download-preview=1")
);

assert(gateScript, "public/index.html must include the public download landing gate");
assert(html.includes('id="ob-download-now"'), "download landing must include a single Download now CTA");
assert(html.includes("https://apps.apple.com/gb/app/obubba/id6760968757"), "App Store URL is missing");
assert(html.includes("https://play.google.com/store/apps/details?id=com.obubba.app"), "Play Store URL is missing");
assert(
  html.includes("if (window.__OBUBBA_DOWNLOAD_LANDING__) return;"),
  "app scripts must be guarded so the public landing does not show auth/sign-in"
);

function runGate({ host, path = "/", search = "", ua = "", platform = "", maxTouchPoints = 0 }) {
  const window = { location: { hostname: host, pathname: path, search } };
  const navigator = { userAgent: ua, platform, maxTouchPoints };
  window.navigator = navigator;
  vm.runInNewContext(gateScript, { window, navigator });
  return window;
}

assert.strictEqual(
  runGate({ host: "obubba.com" }).__OBUBBA_DOWNLOAD_LANDING__,
  true,
  "obubba.com root should show the download landing"
);
assert.strictEqual(
  runGate({ host: "www.obubba.com", path: "/index.html" }).__OBUBBA_DOWNLOAD_LANDING__,
  true,
  "www.obubba.com/index.html should show the download landing"
);
assert.strictEqual(
  runGate({ host: "app.obubba.com" }).__OBUBBA_DOWNLOAD_LANDING__,
  false,
  "native Capacitor app host must keep the full app"
);
assert.strictEqual(
  runGate({ host: "localhost", search: "?ob-download-preview=1" }).__OBUBBA_DOWNLOAD_LANDING__,
  true,
  "local preview switch should show the landing for QA"
);

const androidWindow = runGate({ host: "obubba.com", ua: "Mozilla/5.0 (Linux; Android 15)" });
assert.strictEqual(
  androidWindow.__OBUBBA_STORE_URL_FOR_DEVICE__(),
  "https://play.google.com/store/apps/details?id=com.obubba.app",
  "Android users should go to Google Play"
);

const iosWindow = runGate({ host: "obubba.com", ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)" });
assert.strictEqual(
  iosWindow.__OBUBBA_STORE_URL_FOR_DEVICE__(),
  "https://apps.apple.com/gb/app/obubba/id6760968757",
  "iPhone users should go to the App Store"
);

console.log("Download landing audit passed");
