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

function minDiff(start, end) {
  const sm = clockMins(start);
  const em = clockMins(end);
  if (sm === null || em === null) return 0;
  return em >= sm ? em - sm : em + 1440 - sm;
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
  if (next.type === "nap" && next.start && next.end && next.start !== next.end) {
    const span = Math.round(minDiff(next.start, next.end));
    if (span > 0) next.duration = span;
  }
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
  assert(`${file} escapes recent imported entry labels`, html.includes("const safeLabel = escapeHtml(labels[type] || type || \"Entry\")"));
  assert(`${file} escapes recent imported nappy detail`, html.includes("? ` · ${escapeHtml(e.poopType)}`"));
  assert(`${file} coerces recent feed amounts before rendering`, html.includes("const amount = Number(e.amount)"));
  assert(`${file} filters malformed entry objects before stats`, html.includes("function safeEntryList(arr)") || html.includes("const safeEntryList = (arr)"));
  assert(`${file} coerces imported nappy types before counting`, html.includes('String(p.poopType||"wet").toLowerCase()'));
  assert(`${file} hides malformed display times instead of echoing raw input`, html.includes('if(!p) return "";'));
  assert(`${file} sorts completed naps through the safe clock parser`, html.includes("function napEndSortMins(n)") && html.includes("clockMins(n && n.end)") && html.includes("sort((a,b)=>napEndSortMins(a)-napEndSortMins(b))") && !html.includes('(a.end||"").localeCompare(b.end||"")'));
  assert(`${file} coerces care-guide feed amounts before rendering`, html.includes("function safePositiveNumber(v)") && html.includes("safePositiveNumber(_t.lastFeed.amount)"));
  assert(`${file} accepts object or string Firestore payloads`, html.includes("function safeJsonValue(value, fallback)") && html.includes("const children = safeJsonValue(data.children, [])"));
  assert(`${file} ignores malformed historical day lists`, html.includes("flatMap(d => Array.isArray(d) ? d : [])"));
  assert(`${file} keeps medicine payloads array-only`, html.includes("familyContext.todayMeds = Array.isArray(meds) ? meds : []"));
  assert(`${file} coerces care portal prediction labels before matching`, html.includes('String(_pred0.nextPredictionLabel || "").toLowerCase().includes("bed")') && html.includes('const _predLabel = String(_pred.nextPredictionLabel || "Next")'));
  assert(`${file} coerces pinned-note text before allergy matching`, html.includes('const text=String((n&&n.text)||"").toLowerCase()'));
  assert(`${file} coerces medicine names before dose matching`, html.includes('var _medNameLower = String(m.name||"").toLowerCase();'));
  assert(`${file} escapes care-guide nappy type`, html.includes('${escapeHtml(_t.lastPoop.poopType||"wet")}'));
  assert(`${file} escapes live carer status text`, html.includes('<div class="status-text">${escapeHtml(statusText)}</div>'));
  assert(`${file} escapes live carer next action`, html.includes("${escapeHtml(nextAction)}"));
  assert(`${file} escapes prediction countdown chips`, html.includes('${escapeHtml(e)}</div>`'));
  assert(`${file} restricts baby photo image sources`, html.includes("function safeImageSrc(src)") && html.includes("const _babyPhotoSrc = safeImageSrc(familyContext.babyPhoto || \"\")") && html.includes("${_babyPhotoSrc ? `<img"));
  assert(`${file} avoids inline baby-photo error handlers`, html.includes('data-hide-on-error="baby-photo"') && html.includes('addEventListener("error", () => { img.style.display = "none"; }, { once: true })') && !html.includes("onerror="));
  assert(`${file} rejects non-portable blob photo URLs`, !html.includes("blob:[a-z0-9.+-]"));
}

assert("root and hosted care portals are aligned", read("care.html") === read("hosting-care/care.html"));
assert("hosted care entrypoints are aligned", read("hosting-care/care.html") === read("hosting-care/index.html"));

const app = read("app.jsx");
assert("main app exposes import health counters", app.includes("quality = { missingTime:0, inferredWake:0, zeroDurationNaps:0, needsReview:0 }"));
assert("main app surfaces import health in the import modal", app.includes("Import health:"));
assert("main app importer support copy has no Baby Tracker typo", !app.includes("nighp"));
assert("main app import copy lists other baby apps, not OBubba as an external app", app.includes("Huckleberry · Baby Connect · Sprout Baby · Glow Baby") && app.includes("Baby Tracker") && !app.includes("Huckleberry · OBubba") && !app.includes("Import from a CSV exported by OBubba"));
assert("main app drops malformed day entries during canonical normalisation", app.includes('return Array.isArray(entries) ? entries.slice(0, 500).map(normaliseLogEntryTime).filter(e => e && typeof e === "object" && !Array.isArray(e)) : [];'));
assert("main app derives completed nap duration from saved start and end", app.includes('next.type === "nap" && hasCompletedNapSpan(next)') && app.includes("currentDuration !== span") && app.includes("next.duration = span;"));
assert("main app drops malformed day keys during canonical normalisation", app.includes(".map(([dayKey, entries]) => [safeDateKey(dayKey), entries])") && app.includes(".filter(([safeDay]) => safeDay)") && app.includes("out[safeDay] = normaliseDayEntries(entries);"));
assert("main app drops malformed child records during canonical normalisation", app.includes('if (!child || typeof child !== "object" || Array.isArray(child)) return null;') && app.includes("if (!normalisedChild) continue;"));
assert("main app normalises child-level imported collection shapes", app.includes("function normaliseChildPayload(child)") && app.includes("weights: normaliseWeightPayload(child.weights)") && app.includes("heights: normaliseHeightPayload(child.heights)") && app.includes("headCircs: normaliseHeadCircPayload(child.headCircs)") && app.includes("photos: normalisePhotosPayload(child.photos)") && app.includes("observations: normaliseObservationsPayload(child.observations)") && app.includes("dayPlans: normaliseDayPlansPayload(child.dayPlans)"));
assert("main app normalises imported child ids before using them as keys", app.includes("function safeChildId(value, fallback = \"\")") && app.includes("const safeId = safeChildId(id, child && child.id);") && app.includes("out[safeId] = normalisedChild;") && app.includes("const safeAct = safeChildId(act, \"\");") && app.includes("const _mirrorActiveId = safeChildId(mirror.activeChildId, \"\");") && app.includes("localStorage.setItem(\"active_child\", _safeTargetId);"));
assert("main app sanitizes imported profile and milestone photos during child hydration", app.includes("photo: safeAppImageSrc(child.photo, \"\")") && app.includes("const photo = safeAppImageSrc(milestone.photo, \"\")") && app.includes("if (photo) next.photo = photo;"));
assert("main app active-child selectors guard arrays and objects before UI use", app.includes("const weights     = Array.isArray(activeChild.weights) ? activeChild.weights : []") && app.includes("const photos = Array.isArray(activeChild.photos) ? activeChild.photos : []") && app.includes("const dayPlans = normaliseDayPlansPayload(activeChild.dayPlans)"));
assert("main app child collection mutators coerce malformed existing values", app.includes("const base = Array.isArray(cur.photos) ? cur.photos : []") && app.includes("const next = normalisePhotosPayload(typeof fn === \"function\" ? fn(base) : fn)") && app.includes("const next = normaliseMilestonesPayload(typeof fn === \"function\" ? fn(base) : fn)") && app.includes("const next = normaliseWeightPayload(typeof fn === \"function\" ? fn(base) : fn)") && app.includes("const next = normaliseTeethingPayload(typeof fn === \"function\" ? fn(base) : fn)"));
assert("main app child sync accepts object or string child payloads", app.includes("function safeObjectPayload(value, fallback = {})") && app.includes("safeObjectPayload(existingData.child)") && app.includes("safeObjectPayload(d.child)") && !app.includes("JSON.parse(existingData.child") && !app.includes("JSON.parse(d.child)"));
assert("main app family cloud restore accepts object or string children payloads", app.includes("normaliseChildrenPayload(safeObjectPayload(d.children))") && !app.includes("JSON.parse(d.children)"));
assert("main app imports OBubba nap ranges across dash variants", app.includes("function parseImportedNapRange(rangeText, fallbackTime)") && app.includes("raw.split(/\\s*(?:-|–|—|to)\\s*/i)") && app.includes("const range=parseImportedNapRange(amount, time)") && !app.includes('const times=(amount||"").split("-")'));
assert("main app bounds malformed Sprout sleep durations before import", app.includes("const _colonMatch = _rawDur.match(/^(\\d{1,2}):(\\d{2})$/);") && app.includes("const _validDurMin = Number.isFinite(durMin) && durMin > 0 && durMin <= 18 * 60") && app.includes("Imported duration needs review"));

const repairedNap = normaliseLogEntryTime({type:"nap", start:undefined, end:"2026-04-30T10:42:00"});
assert("normaliseLogEntryTime repairs missing imported nap start from end timestamp", repairedNap.start === "10:42");
const correctedNap = normaliseLogEntryTime({type:"nap", start:"10:29", end:"12:37", duration:360});
assert("normaliseLogEntryTime corrects stale nap duration from real start/end", correctedNap.duration === 128);
const repairedFeed = normaliseLogEntryTime({type:"feed", time:"not-a-time", createdAt:"2026-04-30T06:11:00"});
assert("normaliseLogEntryTime repairs malformed imported feed time from createdAt", repairedFeed.time === "06:11");
const fallbackPoop = normaliseLogEntryTime({type:"poop"});
assert("normaliseLogEntryTime keeps fully untimed imported entries safe", fallbackPoop.time === "00:00");

console.log("Imported-data safety audit passed.");
