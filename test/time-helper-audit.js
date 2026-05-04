#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");

function assert(name, condition) {
  if (!condition) throw new Error(name);
  console.log("✓ " + name);
}

function clockParts(t) {
  if (typeof t !== "string" && typeof t !== "number") return null;
  const match = String(t).trim().match(/^(\d{1,2}):(\d{1,2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (!Number.isFinite(h) || !Number.isFinite(m) || h < 0 || h >= 24 || m < 0 || m >= 60) return null;
  return [h, m];
}

function clockMins(t) {
  const p = clockParts(t);
  return p ? p[0] * 60 + p[1] : null;
}

function minsToTime(m) {
  if (typeof m !== "number" || !Number.isFinite(m)) return "";
  const n = ((Math.round(m) % 1440) + 1440) % 1440;
  return String(Math.floor(n / 60)).padStart(2, "0") + ":" + String(n % 60).padStart(2, "0");
}

function fmt12(t) {
  if (t === null || t === undefined || t === "") return "";
  if (typeof t === "number") t = minsToTime(t);
  const mins = clockMins(t);
  if (mins === null) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")}${h >= 12 ? "pm" : "am"}`;
}

assert("minsToTime normalises fractional rollover without :60", minsToTime(419.8) === "07:00");
assert("minsToTime wraps negative minutes safely", minsToTime(-1) === "23:59");
assert("fmt12 rejects malformed imported times", fmt12("25:00") === "" && fmt12("not-a-time") === "");
assert("clockParts accepts trimmed valid times", clockMins(" 7:05 ") === 425);
assert("clockParts rejects impossible minute values", clockMins("7:99") === null);

assert("app minsToTime normalises minutes before formatting", app.includes("const n = ((Math.round(m) % 1440) + 1440) % 1440;"));
assert("app fmt12 uses shared clock parser", /const fmt12 = t => \{[\s\S]*const mins = clockMins\(t\);/.test(app));
assert("app minDiff uses shared clock parser", /const minDiff = \(s,e\) => \{[\s\S]*const sm = clockMins\(s\), em = clockMins\(e\);/.test(app));
assert("app clockParts validates hour/minute range", app.includes("h < 0 || h >= 24 || m < 0 || m >= 60"));

console.log("Time helper audit passed.");
