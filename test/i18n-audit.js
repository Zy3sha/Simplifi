const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "i18n.js"), "utf8");

let failed = false;
function assert(name, condition) {
  if (condition) console.log("✓ " + name);
  else {
    failed = true;
    console.error("✗ " + name);
  }
}

const sandbox = {
  window: {
    addEventListener() {},
    dispatchEvent() {}
  },
  document: { documentElement: {} },
  navigator: { languages: ["en-GB"], language: "en-GB" },
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); }
  },
  CustomEvent: function CustomEvent(_name, init) { return init || {}; }
};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;
sandbox.window.navigator = sandbox.navigator;
sandbox.window.localStorage = sandbox.localStorage;

vm.runInNewContext(source, sandbox, { filename: "i18n.js" });

const api = sandbox.window.OBI18N;
const locales = api.getSupportedLocales().map(l => l.code).filter(l => l !== "system");
const englishKeys = Object.keys(api.messages["en-GB"]);

assert("i18n API is exposed", !!api && typeof api.t === "function" && typeof api.setLocale === "function");
assert("keeps English fallback", locales.includes("en-GB") && api.defaultLocale === "en-GB");
assert("supports high-confidence locale set", ["es-ES","fr-FR","de-DE","it-IT","pt-BR","nl-NL","pl-PL","zh-Hans"].every(l => locales.includes(l)));

for (const locale of locales) {
  const table = api.messages[locale] || {};
  const missing = englishKeys.filter(k => !(k in table));
  assert(`${locale} has every English key`, missing.length === 0);
}

api.setLocale("es-ES");
assert("manual locale changes translation output", api.t("nav.account") === "Cuenta");
api.setLocale("zh-CN");
assert("aliases resolve to supported locales", api.getLocale() === "zh-Hans" && api.t("nav.track") === "记录");
assert("does not map Traditional Chinese to Simplified Chinese", api.normaliseLocale("zh-TW") === "");
assert("does not map Portugal Portuguese to Brazilian Portuguese", api.normaliseLocale("pt-PT") === "");
assert("placeholders interpolate", api.t("daily.onAt", { time: "07:00" }).includes("07:00"));

const requiredAndroidDirs = ["values-es","values-fr","values-de","values-it","values-pt-rBR","values-nl","values-pl","values-zh-rCN"];
for (const dir of requiredAndroidDirs) {
  assert(`${dir}/strings.xml exists`, fs.existsSync(path.join(root, "android/app/src/main/res", dir, "strings.xml")));
}

if (failed) process.exit(1);
