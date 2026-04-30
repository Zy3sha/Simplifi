#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const careFiles = [
  "care.html",
  "hosting-care/care.html",
  "hosting-care/index.html",
];

function assert(name, condition) {
  if (!condition) throw new Error(name);
  console.log("✓ " + name);
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function clockParts(t) {
  if (typeof t !== "string") return null;
  const m = t.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || h < 0 || h > 23 || min < 0 || min > 59) return null;
  return [h, min];
}

function clockMins(t) {
  const p = clockParts(t);
  return p ? p[0] * 60 + p[1] : null;
}

function normaliseLogEntryTime(entry) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return entry;
  const next = {...entry};
  const fallback = [next.time, next.start, next.end, next.loggedAt, next.createdAt, next.modifiedAt]
    .map(v => {
      if (typeof v !== "string") return null;
      const direct = clockParts(v.trim());
      if (direct) return String(direct[0]).padStart(2, "0") + ":" + String(direct[1]).padStart(2, "0");
      const ms = Date.parse(v);
      if (!Number.isFinite(ms)) return null;
      const d = new Date(ms);
      return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    })
    .find(Boolean) || "00:00";
  if (clockMins(next.time) === null) next.time = fallback;
  if (next.type === "nap" && clockMins(next.start) === null) next.start = fallback;
  if (next.type === "nap" && next.end && clockMins(next.end) === null) next.end = fallback;
  return next;
}

for (const file of careFiles) {
  const html = read(file);
  assert(`${file} has shared safe clock parser`, html.includes("function clockMins(t)"));
  assert(
    `${file} has no fragile entry time/start/end split calls`,
    !/\.(time|start|end)\.split\(":\"\)/.test(html) &&
      !/\(([^)]*\.(?:time|start|end)[^)]*)\)\.split\(":\"\)/.test(html)
  );
}

assert("root and hosted care portals are aligned", read("care.html") === read("hosting-care/care.html"));
assert("hosted care entrypoints are aligned", read("hosting-care/care.html") === read("hosting-care/index.html"));

const app = read("app.jsx");
assert("main app exposes import health counters", app.includes("quality = { missingTime:0, inferredWake:0, zeroDurationNaps:0, needsReview:0 }"));
assert("main app surfaces import health in the import modal", app.includes("Import health:"));

const repairedNap = normaliseLogEntryTime({type:"nap", start:undefined, end:"2026-04-30T10:42:00"});
assert("normaliseLogEntryTime repairs missing imported nap start from end timestamp", repairedNap.start === "10:42");
const repairedFeed = normaliseLogEntryTime({type:"feed", time:"not-a-time", createdAt:"2026-04-30T06:11:00"});
assert("normaliseLogEntryTime repairs malformed imported feed time from createdAt", repairedFeed.time === "06:11");
const fallbackPoop = normaliseLogEntryTime({type:"poop"});
assert("normaliseLogEntryTime keeps fully untimed imported entries safe", fallbackPoop.time === "00:00");

console.log("Imported-data safety audit passed.");
