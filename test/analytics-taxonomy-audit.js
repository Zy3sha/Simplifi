#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.jsx"), "utf8");
const androidStore = fs.readFileSync(path.join(root, "android/app/src/main/java/com/obubba/app/plugins/StorePlugin.java"), "utf8");
const iosStore = fs.readFileSync(path.join(root, "ios/App/App/Plugins/StorePlugin.swift"), "utf8");
const iosObubbaStore = fs.readFileSync(path.join(root, "ios/App/App/OBubba/Plugins/StorePlugin.swift"), "utf8");
const androidManifest = fs.readFileSync(path.join(root, "android/app/src/main/AndroidManifest.xml"), "utf8");
const iosInfo = fs.readFileSync(path.join(root, "ios/App/App/Info.plist"), "utf8");
const iosObubbaInfo = fs.readFileSync(path.join(root, "ios/App/OBubba/Info.plist"), "utf8");

function assert(name, condition) {
  if (!condition) throw new Error(name);
  console.log("✓ " + name);
}

function directTrackEvent(name) {
  return new RegExp("trackEvent\\(\\s*[\"']" + name + "[\"']").test(appSource);
}

[
  "normaliseAnalyticsEventName",
  "normaliseAnalyticsEventParams",
  "analyticsScreenName",
  "analyticsProductParams",
  "trackScreenView",
  "trackLogCreated"
].forEach(name => assert("analytics helper exists: " + name, appSource.includes(name)));

[
  "trial_started",
  "screen_view",
  "log_created",
  "first_log_created",
  "three_logs_created",
  "partner_invite_created",
  "partner_invite_tapped",
  "partner_joined",
  "carer_share_created",
  "purchase_started",
  "purchase_success",
  "purchase_cancelled",
  "purchase_failed",
  "restore_success",
  "restore_failed",
  "client_error",
  "delete_account_started",
  "delete_account_success",
  "delete_account_failed"
].forEach(eventName => assert("canonical event present: " + eventName, appSource.includes(eventName)));

[
  "paywall_view",
  "first_entry_logged",
  "entry_logged",
  "carer_portal_shared",
  "child_sync_created",
  "child_sync_regenerated",
  "child_sync_joined",
  "subscription_purchased",
  "subscription_cancelled",
  "subscription_restored"
].forEach(eventName => assert("no direct legacy analytics event: " + eventName, !directTrackEvent(eventName)));

assert("screen view uses canonical screen names", appSource.includes("analyticsScreenName(tab, daySubScreen, todayPanel)") && !appSource.includes("{ screen_name: tab"));
assert("native screen reports use explicit OBubba screen names", appSource.includes("_fa.setScreenName({ screenName: safeScreenName, nameOverride: \"OBubbaApp\" })") && appSource.includes("trackScreenView(analyticsScreenName(tab, daySubScreen, todayPanel))"));
assert("native screen reports also log canonical screen_view events", appSource.includes('_fa.logEvent({ name: "screen_view", params: screenParams })'));
assert("first-log marker remains backwards compatible", appSource.includes("ob_first_log_tracked_v1") && appSource.includes("ob_first_entry_tracked"));
assert("native automatic screen reporting is disabled so Firebase screen names stay useful", androidManifest.includes("google_analytics_automatic_screen_reporting_enabled") && iosInfo.includes("FirebaseAutomaticScreenReportingEnabled") && iosObubbaInfo.includes("FirebaseAutomaticScreenReportingEnabled"));
assert("purchase success also logs a standard purchase event when priced", appSource.includes("shouldLogStandardPurchaseEvent") && appSource.includes('name: "purchase"') && appSource.includes("items: [{"));
assert("analytics blocks obvious personal-data params", appSource.includes("ANALYTICS_BLOCKED_PARAM_KEYS") && appSource.includes("child_name") && appSource.includes("invite_code"));
assert("client errors are reported without raw console dependence", appSource.includes("function reportClientError") && appSource.includes("window.__obReportClientError") && appSource.includes('sendAnalyticsEventDirect("client_error"') && appSource.includes("react_error_boundary"));
assert("native store products expose currency codes", androidStore.includes("currencyCode") && iosStore.includes("currencyCode") && iosObubbaStore.includes("currencyCode"));

console.log("Analytics taxonomy audit passed.");
