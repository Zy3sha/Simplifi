#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const careFiles = [
  "care.html",
  "public/care.html",
  "dist/care.html",
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

function extractModuleScript(html) {
  const match = html.match(/<script type="module">([\s\S]*?)<\/script>/);
  return match ? match[1] : "";
}

for (const file of careFiles) {
  const html = read(file);
  const script = extractModuleScript(html);
  assert(`${file} has a module script`, script.length > 1000);
  const parseableScript = script.replace(/^import\s+[^;]+;\s*$/gm, "");
  new Function(parseableScript);
  assert(`${file} module script parses after CDN imports are stripped`, true);
  assert(`${file} shows a friendly offline/auth failure`, html.includes("Can't connect") && html.includes("Please check your internet and try again"));
  assert(`${file} shows a friendly expired care-link failure`, html.includes("Care link expired") && html.includes("share a fresh link from OBubba") && script.includes("if (!_resolvedToken)"));
  assert(`${file} protects ended carer sessions before loading data`, html.includes("CHECK SESSION LOCK BEFORE RENDERING") && html.includes("return; // Don't load or render anything"));
  assert(`${file} writes feed type expected by rules`, script.includes('logEntry({type:"feed", feedType:"bottle"'));
  assert(`${file} writes active nap state expected by rules`, script.includes('logEntry({type:"nap", start:s||nowTime(), end:s||nowTime(), _active:true'));
  assert(`${file} writes nap-end events expected by parent app`, script.includes('logEntry({type:"nap-end", end:_endT'));
  assert(`${file} keeps Bubba Care on the bedtime day in wake-boundary mode`,
    script.includes("function resolveCareDayKey(child)") &&
    script.includes('familyContext.dayBoundary === "midnight"') &&
    script.includes("previousBedtimeOpen && !hasMorningWakeToday") &&
    !script.includes("nowMins < 13 * 60") &&
    script.includes("familyContext._careDayKey"));
  assert(`${file} sends settled night-wake metadata without freezing the care day`,
    script.includes("nightLocked:true") &&
    script.includes("_nightWakeLog.assistedDuration = _settleMins") &&
    script.includes("_nightWakeLog.settleDuration = _settleMins") &&
    script.includes("entry.night ? (familyContext._careDayKey || todayStrLocal()) : todayStrLocal()"));
  assert(`${file} resumes the bedtime timer after a settled night wake`,
    script.includes("function isOpenNightSleep(entries, bedEntry, nowMins)") &&
    script.includes("function morningWakeClosesBed(entries, bedEntry)") &&
    script.includes("safeEntryList(entries).some(isSettledNightWakeEntry)") &&
    script.includes("_nightWakeSettledAt = Date.now()") &&
    script.includes("const clockLooksOvernight = bedtimeIsEvening && (nowMins >= bedMins || nowMins < 12 * 60)") &&
    script.includes("nightLocked: !!e.nightLocked"));
  assert(`${file} parses child DOB/due-date through a guarded date-key helper`,
    script.includes("function dateKeyMs(dateStr") &&
    script.includes("const dobMs = dateKeyMs(ch.dob, NaN);") &&
    script.includes("const _dobMs = dateKeyMs(_resolvedCh.dob, NaN);") &&
    script.includes("const _dueMs = dateKeyMs(_resolvedCh.dueDate, NaN);") &&
    !script.includes("new Date(ch.dob + \"T00:00:00\")") &&
    !script.includes("new Date(_resolvedCh.dob + \"T00:00:00\")") &&
    !script.includes("new Date(_resolvedCh.dueDate + \"T00:00:00\")"));
}

const app = read("app.jsx");
assert("parent app centralises Bubba Care URLs behind a CT-token allowlist",
  app.includes('const CARE_PORTAL_BASE_URL = "https://obubba-d9ccc.web.app/care.html";') &&
  app.includes("function safeCarePortalUrl(token, childId = \"\")") &&
  app.includes("if (!/^CT[A-Z2-9]{20}$/.test(safeToken)) return \"\";") &&
  (app.match(/safeCarePortalUrl\(/g) || []).length >= 4 &&
  !/https:\/\/obubba-d9ccc\.web\.app\/care\.html\?code=/.test(app));
assert("parent app does not pause the bed timer for already-settled Bubba Care night wakes",
  app.includes("_e.night && _e._activeNightWake && bedTimerDay && !bedPaused") &&
  app.includes("Carer started a night wake") &&
  !app.includes("Carer logged night wake — pausing bed timer"));
assert("parent app dedupes Bubba Care auto-merged entries by source id",
  app.includes('if (e && e.carerEntryId) return "carer|" + e.carerEntryId;') &&
  app.includes("const nextRaw = normaliseDaysPayload(typeof fn === \"function\" ? fn(baseDays) : fn);") &&
  app.includes("Object.fromEntries(Object.entries(nextRaw).map(([dayKey, entries]) => [dayKey, dedupEntries(entries)]))"));

assert("root and hosted carer portals are identical", read("care.html") === read("hosting-care/care.html"));
assert("hosted carer portal entrypoints are identical", read("hosting-care/care.html") === read("hosting-care/index.html"));
assert("public carer portal is deployed with the app shell", read("care.html") === read("public/care.html"));
assert("dist carer portal is deployed with the app shell", read("care.html") === read("dist/care.html"));

console.log("Carer portal audit passed.");
