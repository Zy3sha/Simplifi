const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const nativeFiles = [
  "android/app/src/main/java/com/obubba/app/widgets/OBubbaSummaryWidget.java",
  "android/app/src/main/java/com/obubba/app/plugins/CalendarPlugin.java",
  "ios/App/App/Plugins/CalendarPlugin.swift",
];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function assert(name, ok) {
  if (!ok) {
    console.error("✗ " + name);
    process.exitCode = 1;
  } else {
    console.log("✓ " + name);
  }
}

for (const file of nativeFiles) {
  const src = read(file);
  assert(`${file} has no direct colon time split`, !/\.split\(\s*["']:["']\s*\)/.test(src));
}

const widget = read(nativeFiles[0]);
assert("Android widget formats timer clock labels safely", widget.includes("private static String formatClockLabel(String time)") && widget.includes("return \"\";"));
assert("Android widget hides malformed timer clocks", widget.includes("if (!sinceLabel.isEmpty())") && widget.includes("v.setViewVisibility(R.id.tv_since, View.GONE);"));

const calendar = read(nativeFiles[1]);
assert("Android calendar validates date text before parsing", calendar.includes("DATE_PATTERN") && calendar.includes("parseDateParts"));
assert("Android calendar validates time text before parsing", calendar.includes("TIME_PATTERN") && calendar.includes("parseTimeParts"));
assert("Android calendar falls back from malformed times", calendar.includes("return new int[] { 9, 0 };"));
assert("Android calendar bounds text and reminders before native APIs", calendar.includes("private String safeText(String value, String fallback, int maxLen)") && calendar.includes("private int safeAlarm(Integer value)") && calendar.includes("Math.min(value, 10080)"));

const iosCalendar = read(nativeFiles[2]);
assert("iOS calendar validates date and time text before parsing", iosCalendar.includes("private func parseDateParts(_ value: String) -> [Int]?") && iosCalendar.includes("private func parseTimeParts(_ value: String) -> (Int, Int)?"));
assert("iOS calendar rejects malformed dates instead of silently using now", iosCalendar.includes('guard let date = call.getString("date"), makeDate(date: date, time: "00:00") != nil else { return nil }'));
assert("iOS calendar bounds text and reminders before native APIs", iosCalendar.includes("private func safeText(_ value: String?, fallback: String, maxLength: Int) -> String") && iosCalendar.includes("private func safeAlarm(_ value: Int?) -> Int") && iosCalendar.includes("return min(value, 10080)"));

if (!process.exitCode) console.log("Native time audit passed.");
