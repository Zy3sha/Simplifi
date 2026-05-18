const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");

let failed = false;
function assert(name, condition) {
  if (condition) {
    console.log("✓ " + name);
  } else {
    failed = true;
    console.error("✗ " + name);
  }
}

assert("mailto actions use a bounded shared helper",
  app.includes("function safeMailtoHref(to, subject = \"\", body = \"\")") &&
  app.includes("function openSafeMailto(to, subject = \"\", body = \"\")") &&
  app.includes("safeTextPayload(body, \"\", 1800)") &&
  app.includes("window.location.href = safeMailtoHref(to, subject, body);") &&
  app.includes("openSafeMailto(\"hello@obubba.com\", \"OBubba Feedback\", body);") &&
  app.includes("openSafeMailto(\"hello@obubba.com\", \"OBubba Feedback\")") &&
  !app.includes("href=\"mailto:"));

assert("map destinations are capped before URL encoding",
  app.includes("function safeMapDestination(value)") &&
  app.includes("return safeTextPayload(value, \"\", 300).replace(/\\s+/g, \" \").trim();") &&
  app.includes("var destination = safeMapDestination(address);") &&
  app.includes("var destination = safeMapDestination(apptForm.location);"));

assert("calendar dates reject malformed imported dates",
  app.includes("function safeCalendarDateStr(value, fallback = \"\")") &&
  app.includes("if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== day) return fallback;") &&
  app.includes("const safeDate = safeCalendarDateStr(dateStr, \"\");"));

assert("calendar text fields are bounded before ICS/native/share output",
  app.includes("function safeCalendarText(value, fallback = \"\", maxLen = 500)") &&
  app.includes("const title=safeCalendarText(ev.title,\"OBubba appointment\",120);") &&
  app.includes("const location=safeCalendarText(ev.location,\"\",240);") &&
  app.includes("const note=safeCalendarText(ev.note,\"\",2000);") &&
  app.includes("const uidSafe=safeCalendarUid(ev.uid);"));

assert("Google Calendar fallback uses URLSearchParams and caps notes",
  app.includes("const params = new URLSearchParams();") &&
  app.includes("params.set(\"details\", safeCalendarText(n.note, \"\", 700));") &&
  !app.includes("let url=\"https://calendar.google.com/calendar/render?action=TEMPLATE\""));

if (failed) process.exit(1);
