const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const mainActivity = fs.readFileSync(path.join(root, "android/app/src/main/java/com/obubba/app/MainActivity.java"), "utf8");
const appGradle = fs.readFileSync(path.join(root, "android/app/build.gradle"), "utf8");
const gradleProps = fs.readFileSync(path.join(root, "android/gradle.properties"), "utf8");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");
const nativePlugins = fs.readFileSync(path.join(root, "native-plugins.js"), "utf8");
const androidManifest = fs.readFileSync(path.join(root, "android/app/src/main/AndroidManifest.xml"), "utf8");
const androidPrintPlugin = fs.readFileSync(path.join(root, "android/app/src/main/java/com/obubba/app/plugins/PrintPlugin.java"), "utf8");
const androidWidgetPlugin = fs.readFileSync(path.join(root, "android/app/src/main/java/com/obubba/app/plugins/WidgetBridgePlugin.java"), "utf8");
const androidTimerPlugin = fs.readFileSync(path.join(root, "android/app/src/main/java/com/obubba/app/plugins/TimerServicePlugin.java"), "utf8");
const androidTimerService = fs.readFileSync(path.join(root, "android/app/src/main/java/com/obubba/app/services/TimerService.java"), "utf8");
const iosCareCardPlugin = fs.readFileSync(path.join(root, "ios/App/App/Plugins/CareCardPlugin.swift"), "utf8");
const iosNestedCareCardPlugin = fs.readFileSync(path.join(root, "ios/App/App/OBubba/Plugins/CareCardPlugin.swift"), "utf8");
const iosWidgetPlugin = fs.readFileSync(path.join(root, "ios/App/App/Plugins/WidgetBridgePlugin.swift"), "utf8");
const iosNestedWidgetPlugin = fs.readFileSync(path.join(root, "ios/App/App/OBubba/Plugins/WidgetBridgePlugin.swift"), "utf8");
const iosLiveActivityPlugin = fs.readFileSync(path.join(root, "ios/App/App/Plugins/LiveActivityPlugin.swift"), "utf8");
const iosNestedLiveActivityPlugin = fs.readFileSync(path.join(root, "ios/App/App/OBubba/Plugins/LiveActivityPlugin.swift"), "utf8");
const iosTravelTimePlugin = fs.readFileSync(path.join(root, "ios/App/App/Plugins/TravelTimePlugin.swift"), "utf8");
const iosNestedTravelTimePlugin = fs.readFileSync(path.join(root, "ios/App/App/OBubba/Plugins/TravelTimePlugin.swift"), "utf8");

function assert(name, ok) {
  if (!ok) {
    console.error("✗ " + name);
    process.exitCode = 1;
  } else {
    console.log("✓ " + name);
  }
}

assert("Android native actions are normalized before dispatch", mainActivity.includes("String action = normalizeAction(intent.getStringExtra(\"action\"));"));
assert("Android native action bridge has an allowlist", mainActivity.includes("private String normalizeAction(String rawAction)") && mainActivity.includes("default:") && mainActivity.includes("return null;"));
assert("Android native action bridge JSON-quotes JS values", mainActivity.includes("JSONObject.quote(action)"));
assert("Android native action bridge does not concatenate raw intent action into JavaScript", !/eval\([^)]*['\"]\s*\+\s*action\s*\+/.test(mainActivity));
assert("Android widget actions remain supported", ["quick_feed", "quick_nappy", "toggle_nap", "stop_timer", "breast_left", "breast_right"].every(a => mainActivity.includes(`case "${a}":`)));
assert("Android compileSdk 35 warning is intentionally suppressed", gradleProps.includes("android.suppressUnsupportedCompileSdk=35"));
assert("native SQLite reads tolerate corrupted JSON rows", nativePlugins.includes("var _safeJsonParse = function(raw, fallback, label)") && nativePlugins.includes("_safeJsonParse(result.values[0].data, null, 'SQLite row')"));
assert("native SQLite list reads drop corrupted rows", nativePlugins.includes("_safeJsonParse(r.data, null, 'SQLite row')") && nativePlugins.includes("if (!parsed || typeof parsed !== 'object') return null;") && nativePlugins.includes("}).filter(Boolean);"));
assert("native SQLite table names are allowlisted before SQL concatenation", nativePlugins.includes("var OB_SQLITE_TABLES = { entries: true, children: true, milestones: true, settings: true };") && (nativePlugins.match(/var safeTable = _sqliteTableName\(table\);/g) || []).length === 3 && !nativePlugins.includes("' + table + '"));
assert("native notification fallback ids avoid Math.random", nativePlugins.includes("var _safeRandomInt = function(max)") && nativePlugins.includes("var notificationId = Number.isFinite(id) && id > 0 ? Math.floor(id) : _safeRandomInt(100000);") && nativePlugins.includes("id: notificationId") && !/id:\s*id\s*\|\|[\s\S]{0,80}Math\.random/.test(nativePlugins));
assert("Apple Sign-In state and nonce use secure randomness with a graceful fallback", nativePlugins.includes("var _safeRandomId = function()") && nativePlugins.includes("typeof cryptoApi.randomUUID === 'function'") && nativePlugins.includes("cryptoApi.getRandomValues(bytes)") && nativePlugins.includes("secure_random_unavailable") && nativePlugins.includes("state: state") && nativePlugins.includes("nonce: nonce") && !nativePlugins.includes("state: crypto.randomUUID()") && !nativePlugins.includes("nonce: crypto.randomUUID()"));
assert("native notification wrapper rejects malformed schedule inputs", nativePlugins.includes("opts = opts || {};") && nativePlugins.includes("var _safeScheduleDate = function(value)") && nativePlugins.includes("if (!scheduleDate) return Promise.resolve();") && nativePlugins.includes("schedule: { at: scheduleDate }"));
assert("native notification text and extras are bounded", nativePlugins.includes("var _safeNativeText = function(value, fallback, maxLen)") && nativePlugins.includes("var _safeNotificationExtra = function(extra)") && nativePlugins.includes("var title = _safeNativeText(opts.title, 'OBubba', 80);") && nativePlugins.includes("var body = _safeNativeText(opts.body, 'Tap to open OBubba.', 220);"));
assert("app direct local notification schedules use a shared sanitizer", app.includes("function safeLocalNotification(notification)") && app.includes("function scheduleSafeLocalNotifications(LN, notifications)") && !app.includes("window.Capacitor.Plugins.LocalNotifications.schedule({notifications"));
assert("app notification sanitizer bounds title body channel and extras", app.includes('title: safeNotificationText(notification.title, "OBubba", 80)') && app.includes('body: safeNotificationText(notification.body, "Tap to open OBubba.", 220)') && app.includes("extra: safeNotificationExtra(notification.extra)") && app.includes("slice(0, maxCount)"));
assert("smart and medicine notifications pass through the sanitizer", app.includes("const safeNotifications = safeLocalNotifications(notifications);") && app.includes("await scheduleSafeLocalNotifications(LN, safeNotifications)") && app.includes("await scheduleSafeLocalNotifications(LN, notifications);"));
assert("global haptics helper respects the Account preference", app.includes('const HAPTICS_DISABLED_KEY = "ob_haptics_disabled_v1"') && app.includes("function hapticsAreDisabled()") && app.includes("if(hapticsAreDisabled())return;") && app.includes('data-testid="account-haptics-toggle"'));
assert("daily log reminder is scheduled through the shared safe notification path", app.includes('const DAILY_LOG_REMINDER_KEY = "ob_daily_log_reminder_v1"') && app.includes("function normaliseDailyLogReminder(value)") && app.includes("normaliseDailyLogReminder(dailyLogReminder)") && app.includes('id:stableId("dailylog","main")') && app.includes('every:"day"') && app.includes('channelId:"obubba_reminders"'));
assert("smart notification quieting is deterministic across recalculations", app.includes("function stableProbability(...parts)") && app.includes('stableProbability("nap-alert", todayKey, td.napsDone || 0, _notifNapMins)') && !app.includes("Math.random() <= _quietFactor"));
assert("Android print WebViews disable script and file access", androidPrintPlugin.includes("private void configurePrintWebView(WebView webView)") && androidPrintPlugin.includes("setJavaScriptEnabled(false)") && androidPrintPlugin.includes("setAllowFileAccess(false)") && androidPrintPlugin.includes("setAllowContentAccess(false)") && !androidPrintPlugin.includes("setJavaScriptEnabled(true)"));
assert("Android PDF filenames are normalized before printing", androidPrintPlugin.includes("private String safePdfFileName(String rawName)") && androidPrintPlugin.includes('name.replaceAll("[\\\\\\\\/]+", "-")') && androidPrintPlugin.includes("safePdfFileName(call.getString(\"fileName\", \"document.pdf\"))"));
assert("iOS PDF filenames are normalized before temp writes", [iosCareCardPlugin, iosNestedCareCardPlugin].every(src => src.includes("private func safePDFFileName(_ rawName: String?) -> String") && src.includes("lastPathComponent") && src.includes("appendingPathComponent(safePDFFileName(fileName))")));
assert("Android widget bridge validates and bounds JSON payloads", androidWidgetPlugin.includes("MAX_WIDGET_DATA_BYTES = 16 * 1024") && androidWidgetPlugin.includes("private String safeWidgetJson(String rawJson)") && androidWidgetPlugin.includes("new JSONObject(rawJson);") && androidWidgetPlugin.includes("call.reject(\"Invalid widget data\")"));
assert("iOS widget bridge validates and bounds JSON payloads", [iosWidgetPlugin, iosNestedWidgetPlugin].every(src =>
  src.includes("private let maxWidgetDataBytes = 16 * 1024") &&
  src.includes("private func safeWidgetJSON(_ rawJSON: String?) throws -> String") &&
  src.includes("data.count <= maxWidgetDataBytes") &&
  src.includes("JSONSerialization.jsonObject(with: data")
));
assert("native widget theme values are allowlisted", androidWidgetPlugin.includes("private String safeWidgetTheme(String rawTheme)") && androidWidgetPlugin.includes("case \"lavender\":") && androidWidgetPlugin.includes("return \"auto\";") && [iosWidgetPlugin, iosNestedWidgetPlugin].every(src => src.includes("private func safeWidgetTheme(_ rawTheme: String?) -> String") && src.includes('case "auto", "rose", "lavender", "mint", "sky", "dark":')));
assert("iOS Live Activity payloads are bounded and allowlisted", [iosLiveActivityPlugin, iosNestedLiveActivityPlugin].every(src => src.includes("private func safeTimerType(_ value: String?) -> String") && src.includes("private func safeStartDate(_ startMs: Double?) -> Date") && src.includes("private func safePredictionDate(_ targetMs: Double?) -> Date?") && src.includes('call.reject("Invalid prediction target")')));
assert("iOS travel-time plugin does not invent a fallback location", [iosTravelTimePlugin, iosNestedTravelTimePlugin].every(src => src.includes("locationRequiredMessage") && src.includes("locationUnavailableMessage") && src.includes("call.reject(locationRequiredMessage)") && src.includes("call.reject(locationUnavailableMessage)") && !src.includes("latitude: 52.0") && !src.includes("longitude: -1.5")));
assert("travel-time UI avoids surfacing raw native errors", app.includes('showToast(_travelErr.includes("location permission") || _travelErr.includes("current location") ? "Allow location or set travel time below" : "Could not calculate travel time",3000);'));
assert("Android timer service payloads are bounded and allowlisted", androidTimerPlugin.includes("private String safeTimerType(String value)") && androidTimerPlugin.includes("private long safeStartTime(Long value)") && androidTimerPlugin.includes("private long safePredictionTarget(Long value)") && androidTimerPlugin.includes('call.reject("Invalid prediction target")'));
assert("Android timer side updates avoid fresh foreground-service starts", androidTimerPlugin.includes("private boolean hasSavedRunningTimer()") && androidTimerPlugin.includes('ret.put("reason", "no_running_timer")') && androidTimerPlugin.includes('ret.put("reason", "service_unavailable")') && !/public void updateTimer[\\s\\S]*?startForegroundService/.test(androidTimerPlugin));
assert("Android timer foreground service re-sanitizes persisted notification text", androidTimerService.includes("private String safeText(String value, String fallback, int maxLen)") && androidTimerService.includes("private String safeTimerType(String value)") && androidTimerService.includes("predictionTargetMs < System.currentTimeMillis() - 5 * 60000L"));
assert("Android storage permissions are scoped to legacy API levels", androidManifest.includes('android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32"') && androidManifest.includes('android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28"'));
assert("Android avoids Play-policy exact alarm permissions", !androidManifest.includes("android.permission.USE_EXACT_ALARM") && !androidManifest.includes("android.permission.SCHEDULE_EXACT_ALARM"));
assert("Android package namespace lives in Gradle, not the manifest", appGradle.includes('namespace "com.obubba.app"') && !androidManifest.includes('package="com.obubba.app"'));

if (!process.exitCode) console.log("Native bridge audit passed.");
