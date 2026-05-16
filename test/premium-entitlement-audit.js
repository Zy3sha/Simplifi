#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");
const nativePlugins = fs.readFileSync(path.join(root, "native-plugins.js"), "utf8");
const rules = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");
const nativePluginCopies = [
  "native-plugins.js",
  "public/native-plugins.js",
  "dist/native-plugins.js",
  "ios/App/App/public/native-plugins.js",
  "android/app/src/main/assets/public/native-plugins.js"
];

function assert(name, condition) {
  if (!condition) throw new Error(name);
  console.log("✓ " + name);
}

function snippetsFor(pattern, source) {
  const snippets = [];
  const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
  let match;
  while ((match = re.exec(source))) {
    const start = Math.max(0, match.index - 260);
    const end = Math.min(source.length, match.index + match[0].length + 260);
    snippets.push(source.slice(start, end));
  }
  return snippets;
}

assert("production owner premium override is disabled", app.includes("const _isOwner = false;"));
assert("premium is applied through a single access combiner", /function _applyPremiumAccess\(storePremium, cloudPremium\) \{[\s\S]{0,260}const has = !!\(_isOwner \|\| storePremium \|\| cloudPremium \|\| _villageActive\);/.test(app));
assert("native launch and resume refresh store entitlements", (app.match(/window\._purchases\.checkEntitlements\(\)\.then\(function\(_/g) || []).length >= 2);
assert("local premium cache is not an authoritative entitlement", app.includes("return _cloudPremium;") && app.includes('localStorage.removeItem("ob_premium");') && !/localStorage\.setItem\(["']ob_premium["']\s*,\s*["']1["']\)/.test(app) && !/localStorage\.getItem\(["']ob_premium["']\)\s*===\s*["']1["']/.test(app));
assert("purchase and restore only grant premium after native isPremium", (app.match(/if\(r && r\.isPremium\)\{[\s\S]{0,180}refreshPremiumAccess\(true\);/g) || []).length >= 3);
assert("native purchase bridge is only exposed inside Capacitor native runtime", /if \(isNative\(\)\) \{[\s\S]{0,260}window\._purchases = \{[\s\S]{0,260}checkEntitlements: OBStore\.checkEntitlements/.test(nativePlugins));
assert("packaged native assets include the purchase bridge", nativePluginCopies.every(rel => {
  const src = fs.readFileSync(path.join(root, rel), "utf8");
  return src.includes("window._purchases = {") && src.includes("checkEntitlements: OBStore.checkEntitlements") && src.includes("purchase: OBStore.purchase") && src.includes("restore: OBStore.restore");
}));
assert("web runtime does not expose a fake successful store bridge", !/window\._purchases\s*=\s*\{[\s\S]{0,260}isPremium:\s*true/.test(app + nativePlugins));
assert("complimentary grants are cached only after active grant validation", /function _cacheComplimentaryPremium\(username, data\) \{[\s\S]{0,220}if\(!key \|\| !_premiumGrantActive\(data\)\) return false;[\s\S]{0,220}localStorage\.setItem\("ob_premium_cloud", "1"\);/.test(app));
assert("complimentary grant cache is tied to the current username", app.includes("if(grantUser && localUser && grantUser !== localUser) return false;") && app.includes("if(grantUser && localUser && grantUser !== localUser) return;"));
assert("cached complimentary grant dates use bounded timestamp parsing", app.includes("const untilMs = safeTimestampMs(until, NaN);") && app.includes("Number.isFinite(untilMs) && untilMs > Date.now()") && !app.includes("Date.parse(until) > Date.now()"));
assert("premium entitlement documents are read-only to app clients", /match \/premium_entitlements\/\{username\} \{[\s\S]{0,220}allow get: if signedIn\(\) && usernameId\(username\);[\s\S]{0,120}allow list: if false;[\s\S]{0,120}allow create, update, delete: if false;/.test(rules));
assert("no premium entitlement writes exist in client code", !/fs(Set|Update)\("premium_entitlements"/.test(app));
assert("native free trial is exactly 14 days and expires from first install", app.includes("const TRIAL_DAYS = 14;") && app.includes("const _trialEndMs = _trialCandidateMs(trialEndsAt) || (_trialStartMs ? _trialStartMs + TRIAL_MS : null);") && app.includes("const trialActive = !!(_trialStartMs && !trialDeviceUsed && !trialAccountUsed && !_trialTimeExpired);"));
assert("expired trials are marked used and route premium taps to paywall", app.includes('if(_trialTimeExpired && !trialDeviceUsed) _markTrialUsed("time_expired");') && /function triggerPaywall\(context, force = true\) \{[\s\S]{0,180}if \(!STORE_READY \|\| isPremium\) return;[\s\S]{0,140}if \(trialActive && context !== "trial"\) return;/.test(app));
assert("post-trial banner is hidden for premium accounts and explicit locked features open the subscription sheet", app.includes("STORE_READY && !isPremium && trialExpired && !trialBannerDismissed") && app.includes('triggerPaywall("trial")') && app.includes('triggerPaywall("today_plan", true)') && app.includes('triggerPaywall("sleep_coach", true)') && app.includes('context="growth_charts"'));
assert("premium access is the only native unlock path after trial expiry", app.includes("const hasAccess = () => isPremium || trialActive || !STORE_READY;") && app.includes("var _nativeCountdownAccess = !!(isPremium || trialActive);") && app.includes("nextPredictionUnlocked: _nativeCountdownAccess"));
assert("clock plan predictions do not leak after trial expiry", app.includes('const clockTomorrowFlex = (()=>{try{return hasAccess() && clockBedtimeLogged ? tomorrowFlexSchedule() : null;}catch{return null;}})();') && app.includes('const clockTomorrowPredictedRows = (!hasAccess() ? [] : ((clockTomorrowFlex') && app.includes('data-testid="clock-plan-paywall"') && app.includes('triggerPaywall("plan_tomorrow", true)'));
assert("saved premium programs do not leak after trial expiry", app.includes('if (nightWeanProg && !hasAccess()) {') && app.includes("Your night-weaning progress is saved. Unlock Premium to continue the nightly steps and safety checks.") && app.includes('if(!hasAccess()){triggerPaywall("night_weaning",true);return;}setInsightFilter("nightwean")'));

console.log("Premium entitlement audit passed.");
