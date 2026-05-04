#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.jsx"), "utf8");

let failures = 0;

function assert(name, condition, detail) {
  if (!condition) {
    failures++;
    console.error("FAIL " + name + (detail ? " :: " + detail : ""));
    return;
  }
  console.log("ok " + name);
}

function clockMins(t) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(t || "").trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isInteger(h) || !Number.isInteger(min) || h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

function nextCalDay(dayKey) {
  const d = new Date(dayKey + "T12:00:00");
  d.setDate(d.getDate() + 1);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function prevCalDay(dayKey) {
  const d = new Date(dayKey + "T12:00:00");
  d.setDate(d.getDate() - 1);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function addCalDays(dayKey, delta) {
  const d = new Date(dayKey + "T12:00:00");
  d.setDate(d.getDate() + delta);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function timeVal(e) {
  return clockMins(e && (e.time || e.start)) ?? 0;
}

function findBedtime(entries) {
  return (entries || [])
    .filter(e => e && e.type === "sleep" && !e.night && e.time && (clockMins(e.time) ?? -1) >= 12 * 60)
    .sort((a, b) => timeVal(b) - timeVal(a))[0] || null;
}

function findMorningWake(entries) {
  return (entries || [])
    .filter(e => e && e.type === "wake" && !e.night && e.time)
    .filter(e => {
      const mins = clockMins(e.time);
      return mins !== null && mins >= 5 * 60 && mins < 13 * 60;
    })
    .sort((a, b) => timeVal(a) - timeVal(b))[0] || null;
}

function isNightWakeLikeEntry(e) {
  return !!(e && e.night && (e.type === "wake" || e.type === "feed"));
}

function nightEntryFromBedMin(e, bedMins) {
  const m = clockMins(e && (e.time || e.start));
  if (m === null || bedMins === null) return null;
  return m >= bedMins ? m - bedMins : (24 * 60 - bedMins) + m;
}

function collectLastNightWakeEntries(days, bedtimeDayKey, morningDayKey) {
  const bedDayEnt = days[bedtimeDayKey] || [];
  const bedEntry = findBedtime(bedDayEnt);
  if (!bedEntry) return [];
  const bedMins = clockMins(bedEntry.time);
  const morningDayEnt = morningDayKey ? (days[morningDayKey] || []) : [];
  const morningWake = findMorningWake(morningDayEnt.length ? morningDayEnt : bedDayEnt);
  const morningMins = morningWake ? clockMins(morningWake.time) : null;
  const morningFromBed = morningMins !== null
    ? (morningMins >= bedMins ? morningMins - bedMins : (24 * 60 - bedMins) + morningMins)
    : null;
  const raw = [
    ...bedDayEnt.filter(isNightWakeLikeEntry),
    ...(morningDayKey && morningDayKey !== bedtimeDayKey ? morningDayEnt.filter(isNightWakeLikeEntry) : []),
  ];
  const seenIds = new Set();
  return raw
    .map(e => {
      const fromBedMin = nightEntryFromBedMin(e, bedMins);
      return fromBedMin === null ? null : { ...e, _fromBedMin: fromBedMin };
    })
    .filter(Boolean)
    .filter(e => e._fromBedMin >= 0 && e._fromBedMin < 14 * 60)
    .filter(e => morningFromBed === null || e._fromBedMin < morningFromBed)
    .filter(e => {
      if (!e.id) return true;
      if (seenIds.has(e.id)) return false;
      seenIds.add(e.id);
      return true;
    })
    .sort((a, b) => a._fromBedMin - b._fromBedMin);
}

function nightWakeEventScore(e) {
  return (e.type === "wake" ? 8 : 0)
    + (e.selfSettled ? 4 : 0)
    + ((parseInt(e.assistedDuration) || parseInt(e.settleDuration) || parseInt(e.duration) || 0) > 0 ? 3 : 0)
    + ((e.type === "feed" || e.feedType || e.assistedType === "milk" || (e.amount || 0) > 0) ? 2 : 0)
    + (e.note ? 1 : 0);
}

function dedupeNightWakeEvents(entries) {
  const sorted = (entries || [])
    .filter(isNightWakeLikeEntry)
    .map(e => ({ ...e, _nightEventKey: Number.isFinite(e._fromBedMin) ? e._fromBedMin : clockMins(e.time || e.start) }))
    .filter(e => e._nightEventKey !== null)
    .sort((a, b) => a._nightEventKey - b._nightEventKey);
  const out = [];
  sorted.forEach(e => {
    const last = out[out.length - 1];
    if (last) {
      let gap = Math.abs(e._nightEventKey - last._nightEventKey);
      if (gap > 720) gap = 1440 - gap;
      if (gap <= 15) {
        if (nightWakeEventScore(e) > nightWakeEventScore(last)) out[out.length - 1] = e;
        return;
      }
    }
    out.push(e);
  });
  return out;
}

function getNightWakeEventsForDay(days, bedtimeDayKey, morningDayKey) {
  const bedDayEnt = days[bedtimeDayKey] || [];
  if (findBedtime(bedDayEnt)) {
    return dedupeNightWakeEvents(collectLastNightWakeEntries(days, bedtimeDayKey, morningDayKey || nextCalDay(bedtimeDayKey)));
  }
  return dedupeNightWakeEvents(bedDayEnt.filter(isNightWakeLikeEntry));
}

function getNightWakeEventCount(days, bedtimeDayKey, morningDayKey) {
  return getNightWakeEventsForDay(days, bedtimeDayKey, morningDayKey).length;
}

function analyzeLastNight(days, bedtimeDayKey, morningDayKey) {
  const bedDayEnt = days[bedtimeDayKey] || [];
  const bedEntry = findBedtime(bedDayEnt);
  if (!bedEntry) return null;
  const bedMins = clockMins(bedEntry.time);
  const morningWake = findMorningWake(days[morningDayKey] || []);
  const morningMins = morningWake ? clockMins(morningWake.time) : null;
  const morningFromBed = morningMins !== null
    ? (morningMins >= bedMins ? morningMins - bedMins : (24 * 60 - bedMins) + morningMins)
    : null;
  const wakes = getNightWakeEventsForDay(days, bedtimeDayKey, morningDayKey)
    .map(e => {
      const fromBedMin = Number.isFinite(e._fromBedMin) ? e._fromBedMin : nightEntryFromBedMin(e, bedMins);
      const durationMin = Math.min(Math.max(parseInt(e.assistedDuration) || parseInt(e.settleDuration) || parseInt(e.duration) || 0, 0), 120) || 5;
      return { ...e, fromBedMin, durationMin };
    })
    .filter(e => e.fromBedMin !== null)
    .sort((a, b) => a.fromBedMin - b.fromBedMin);
  const totalAwakeMin = wakes.reduce((s, w) => s + w.durationMin, 0);
  return {
    bedtimeMins: bedMins,
    wakes,
    wakeCount: wakes.length,
    totalAwakeMin,
    nightTotalMin: morningFromBed,
    totalSleepMin: morningFromBed !== null ? Math.max(0, morningFromBed - totalAwakeMin) : null,
    longestStretchMin: wakes.length ? wakes[0].fromBedMin : (morningFromBed || 0),
  };
}

function diagnoseNightPattern(lastNight, context = {}) {
  if (!lastNight) return null;
  const wakeCount = lastNight.wakeCount || 0;
  const ageWeeks = Number.isFinite(context.ageWeeks) ? context.ageWeeks : null;
  const inSixMonthWindow = ageWeeks !== null && ageWeeks >= 24 && ageWeeks <= 30;
  const recentTeethingCount = Number.isFinite(context.recentTeethingCount) ? context.recentTeethingCount : 0;
  const personalDisruption = !!context.personalDisruption;
  const recentWakeAvg = Number.isFinite(context.recentWakeAvg) ? context.recentWakeAvg : null;
  const baselineWakeAvg = Number.isFinite(context.baselineWakeAvg) ? context.baselineWakeAvg : null;
  const recentWakeNights = Number.isFinite(context.recentWakeNights) ? context.recentWakeNights : null;
  const baselineWakeNights = Number.isFinite(context.baselineWakeNights) ? context.baselineWakeNights : null;
  const meaningfulShift = recentWakeAvg !== null && baselineWakeAvg !== null && recentWakeAvg - baselineWakeAvg >= 0.5;
  if (wakeCount === 0) return { type: "great_night", title: "Dream night" };
  if (wakeCount >= 2 && (personalDisruption || recentTeethingCount > 0 || (inSixMonthWindow && wakeCount >= 3))) {
    const causeBits = [];
    if (meaningfulShift && baselineWakeNights >= 4 && recentWakeNights >= 2) {
      causeBits.push(`averaging ${Math.round(recentWakeAvg * 10) / 10} wakes/night over the last ${recentWakeNights} nights, versus ${Math.round(baselineWakeAvg * 10) / 10} over the previous ${baselineWakeNights}`);
    } else if (recentWakeAvg !== null && recentWakeNights >= 2) {
      causeBits.push(`averaging ${Math.round(recentWakeAvg * 10) / 10} wakes/night across the recent nights logged`);
    }
    return {
      type: "developmental_disruption",
      title: inSixMonthWindow ? "6-month sleep disruption" : "Sleep disruption pattern",
      detail: `${wakeCount} wakes logged last night.` + (causeBits.length ? " This is " + causeBits.join(", ") + "." : ""),
      likelyCauses: [
        ...(inSixMonthWindow ? ["developmental sleep shift"] : []),
        ...(recentTeethingCount > 0 ? ["teething discomfort"] : []),
        ...(ageWeeks !== null && ageWeeks >= 24 && ageWeeks <= 32 ? ["weaning/growth or daytime calories"] : []),
      ],
    };
  }
  return { type: "normal", title: wakeCount <= 2 ? "Normal night" : "Busy but manageable" };
}

function buildNightDiagnosisContext(days, bedtimeDayKey, ageWeeks, teething = []) {
  const keys = [];
  for (let i = 13; i >= 0; i--) keys.push(addCalDays(bedtimeDayKey, -i));
  const wakeCounts = keys.map(k => getNightWakeEventCount(days, k, nextCalDay(k)));
  const recentWindow = Math.min(3, Math.max(2, Math.ceil(wakeCounts.length / 4)));
  const recent = wakeCounts.slice(-recentWindow);
  const older = wakeCounts.slice(0, -recentWindow);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  return {
    ageWeeks,
    recentWakeAvg: recentAvg,
    baselineWakeAvg: olderAvg,
    recentWakeNights: recent.length,
    baselineWakeNights: older.length,
    baselineWasSleepingThrough: olderAvg <= 0.5,
    personalDisruption: recentAvg >= 2 && (olderAvg <= 0.75 || recentAvg >= olderAvg + 0.75),
    recentTeethingCount: teething.filter(t => t.date >= addCalDays(bedtimeDayKey, -14) && t.date <= bedtimeDayKey).length,
  };
}

function buildBaselineChangeDays({ start = "2026-04-20", recentWakeCounts = [2, 3, 2], morningMode = "wake" } = {}) {
  const days = {};
  for (let i = 0; i < 10; i++) {
    const day = addCalDays(start, i);
    const next = nextCalDay(day);
    days[day] = [{ id: "bed-" + day, type: "sleep", time: "19:35", night: false }];
    if (!days[next]) days[next] = [];
    days[next].push({ id: "am-" + next, type: "wake", time: "06:42", night: false });
    const recentIndex = i - 7;
    const wakes = recentIndex >= 0 ? recentWakeCounts[recentIndex] : 0;
    for (let w = 0; w < wakes; w++) {
      const wake = { id: "nw-" + day + "-" + w, type: "wake", time: w === 0 ? "00:45" : w === 1 ? "03:10" : "05:20", night: true, assistedDuration: "12" };
      if (morningMode === "midnight" && clockMins(wake.time) < 12 * 60) days[next].push(wake);
      else days[day].push(wake);
    }
  }
  return days;
}

function mergeCarerEntriesIntoParent(existingEntries, carerEntries) {
  const merged = [...existingEntries];
  const sig = e => e.carerEntryId ? "carer|" + e.carerEntryId : [e.type, e.time || e.start || "", e.night ? 1 : 0, e.amount || "", e.assistedDuration || ""].join("|");
  const seen = new Set(merged.map(sig));
  for (const e of carerEntries) {
    const key = sig(e);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push({ ...e, loggedBy: "carer" });
  }
  return merged;
}

function shouldParentPauseBedTimerForCarerEntry(entry, timer) {
  return !!(entry && entry.night && entry._activeNightWake && timer.bedTimerDay && !timer.bedPaused);
}

function runNightSimulations() {
  const wakeModeDays = buildBaselineChangeDays({ morningMode: "wake" });
  const bedDay = "2026-04-29";
  const morningDay = "2026-04-30";
  const wakeModeNight = analyzeLastNight(wakeModeDays, bedDay, morningDay);
  assert("wake-to-wake simulation counts night wakes stored on bedtime day", wakeModeNight.wakeCount === 2, "got " + wakeModeNight.wakeCount);
  assert("wake-to-wake simulation does not report slept-through when wakes exist", diagnoseNightPattern(wakeModeNight, buildNightDiagnosisContext(wakeModeDays, bedDay, 27, [{ date: "2026-04-28" }])).type !== "great_night");
  const wakeDiag = diagnoseNightPattern(wakeModeNight, buildNightDiagnosisContext(wakeModeDays, bedDay, 27, [{ date: "2026-04-28" }]));
  assert("6-month baseline-change simulation escalates to developmental disruption", wakeDiag.type === "developmental_disruption", wakeDiag.type);
  assert("6-month simulation cross-references teeth and development", wakeDiag.likelyCauses.includes("teething discomfort") && wakeDiag.likelyCauses.includes("developmental sleep shift"));
  const flatTrendDiag = diagnoseNightPattern(
    { wakeCount: 2 },
    { ageWeeks: 27, recentTeethingCount: 1, recentWakeAvg: 2.7, baselineWakeAvg: 2.7, recentWakeNights: 3, baselineWakeNights: 11 }
  );
  assert("flat wake averages do not produce fake up-from copy", !/up from|2\\.7\\s+to\\s+2\\.7|versus 2\\.7/.test(flatTrendDiag.detail), flatTrendDiag.detail);

  const midnightModeDays = buildBaselineChangeDays({ morningMode: "midnight" });
  const midnightNight = analyzeLastNight(midnightModeDays, bedDay, morningDay);
  assert("midnight-day simulation counts after-midnight night wakes stored on morning day", midnightNight.wakeCount === 2, "got " + midnightNight.wakeCount);

  const duplicateDays = {
    "2026-05-01": [
      { id: "bed", type: "sleep", time: "19:40", night: false },
      { id: "feed1", type: "feed", time: "01:10", night: true, amount: 120, feedType: "milk" },
      { id: "wake1", type: "wake", time: "01:14", night: true, assistedDuration: "18", assistedType: "milk" },
    ],
    "2026-05-02": [{ id: "am", type: "wake", time: "06:45", night: false }],
  };
  const duplicateNight = analyzeLastNight(duplicateDays, "2026-05-01", "2026-05-02");
  assert("night wake plus feed inside 15 minutes is one wake event", duplicateNight.wakeCount === 1, "got " + duplicateNight.wakeCount);
  assert("dedup prefers wake metadata over matching feed-only event", duplicateNight.wakes[0].type === "wake", duplicateNight.wakes[0].type);

  const morningClosedDays = {
    "2026-05-01": [{ type: "sleep", time: "20:00", night: false }],
    "2026-05-02": [
      { id: "am", type: "wake", time: "06:20", night: false },
      { id: "late-night", type: "wake", time: "07:10", night: true, assistedDuration: "5" },
    ],
  };
  const closedNight = analyzeLastNight(morningClosedDays, "2026-05-01", "2026-05-02");
  assert("morning wake closes the night before later day wakes", closedNight.wakeCount === 0, "got " + closedNight.wakeCount);
}

function runCarerSimulations() {
  const parentEntries = [{ id: "bed", type: "sleep", time: "19:30", night: false }];
  const carerSettledWake = {
    id: "remote-a",
    carerEntryId: "care-1",
    type: "wake",
    time: "02:05",
    night: true,
    _activeNightWake: false,
    assistedDuration: "16",
    settleDuration: "16",
  };
  const mergedOnce = mergeCarerEntriesIntoParent(parentEntries, [carerSettledWake]);
  const mergedTwice = mergeCarerEntriesIntoParent(mergedOnce, [carerSettledWake]);
  assert("Bubba Care merge simulation adds settled night wake once", mergedOnce.length === 2, "got " + mergedOnce.length);
  assert("Bubba Care merge simulation dedupes repeated snapshots", mergedTwice.length === 2, "got " + mergedTwice.length);
  assert("settled Bubba Care night wake does not pause parent bed timer", !shouldParentPauseBedTimerForCarerEntry(carerSettledWake, { bedTimerDay: "2026-05-01", bedPaused: false }));
  assert("active Bubba Care night wake does pause parent bed timer", shouldParentPauseBedTimerForCarerEntry({ ...carerSettledWake, carerEntryId: "care-2", _activeNightWake: true }, { bedTimerDay: "2026-05-01", bedPaused: false }));
}

function runSourceWiringSimulations() {
  assert("live app has a pattern normalizer for enhanced sleep results", appSource.includes("function advancedSleepPatternItems(result)"));
  assert("live app no longer checks enhanced sleep patterns via raw .length", !appSource.includes("_pats && _pats.length"));
  assert("sleep story is reachable from Reports", appSource.includes('data-testid="sleep-story-report-button"') && appSource.includes('data-testid="sleep-story-modal"'));
  assert("poo guide opens as a high-z portal", appSource.includes('data-testid="poop-guide-modal"') && appSource.includes("poopWhyOpen&&ReactDOM.createPortal") && appSource.includes("zIndex:10004"));
  assert("day 1 insight card can surface immediate questionnaire context", appSource.includes('data-testid="day1-insight-card"') && appSource.includes("Pattern support only. not medical advice."));
  assert("split-night discomfort tags use resolved day keys", appSource.includes('localStorage.getItem("ob_day_tag_" + rd.dayKey)') && !appSource.includes('localStorage.getItem("ob_day_tag_" + rd.date)'));
  assert("daily recap card handles object sleepScore results", appSource.includes("const _scRaw = sleepScore();") && !appSource.includes("const sc=sleepScore();"));
  assert("recovery word reset support is reachable from Account", appSource.includes('data-ob-recovery-word="1"') && appSource.includes("const ok = await saveRecoveryWord(word);"));
}

function runEventHandlerBindingAudit() {
  let ast;
  try {
    ast = parser.parse(appSource, {
      sourceType: "module",
      plugins: ["jsx", "classProperties", "optionalChaining", "nullishCoalescingOperator", "numericSeparator"],
      errorRecovery: true,
    });
  } catch (e) {
    assert("app JSX parses for event-handler simulation", false, e.message);
    return;
  }
  const allowedGlobals = new Set([
    "alert", "confirm", "prompt", "setTimeout", "clearTimeout", "setInterval", "clearInterval",
    "requestAnimationFrame", "cancelAnimationFrame", "parseInt", "parseFloat", "Number", "String",
    "Boolean", "Array", "Object", "Date", "Math", "JSON", "URL", "URLSearchParams", "Blob",
    "File", "FileReader", "Image", "FormData", "fetch", "encodeURIComponent", "decodeURIComponent",
  ]);
  const unresolved = new Set();

  traverse(ast, {
    JSXAttribute(attrPath) {
      const nameNode = attrPath.node.name;
      if (!nameNode || !/^on[A-Z]/.test(nameNode.name || "")) return;
      const valuePath = attrPath.get("value");
      if (!valuePath || !valuePath.isJSXExpressionContainer()) return;
      valuePath.traverse({
        CallExpression(callPath) {
          const callee = callPath.get("callee");
          if (!callee.isIdentifier()) return;
          const name = callee.node.name;
          if (allowedGlobals.has(name)) return;
          if (!callPath.scope.hasBinding(name)) {
            const loc = callPath.node.loc && callPath.node.loc.start ? ":" + callPath.node.loc.start.line : "";
            unresolved.add(name + loc);
          }
        },
      });
    },
  });

  assert("JSX event handlers do not call unresolved bare functions", unresolved.size === 0, Array.from(unresolved).slice(0, 20).join(", "));
}

console.log("\nOBubba user simulation audit");
console.log("============================\n");
runNightSimulations();
runCarerSimulations();
runSourceWiringSimulations();
runEventHandlerBindingAudit();

if (failures > 0) {
  console.error("\nUser simulation audit failed with " + failures + " issue(s).");
  process.exit(1);
}

console.log("\nUser simulation audit passed.");
