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

function minsToClock(m) {
  const n = ((Math.round(m) % 1440) + 1440) % 1440;
  return String(Math.floor(n / 60)).padStart(2, "0") + ":" + String(n % 60).padStart(2, "0");
}

function minDiffSim(start, end) {
  const sm = clockMins(start);
  const em = clockMins(end);
  if (sm === null || em === null) return 0;
  let diff = em - sm;
  if (diff < 0) diff += 1440;
  return diff;
}

function clockEntryFallsBeforeBedtimeStartSim(entry, bedStartMins) {
  const entryStart = clockMins(entry && (entry.time || entry.start || ""));
  if (entryStart === null || bedStartMins === null) return false;
  if (bedStartMins < 12 * 60 || entryStart < 12 * 60) return false;
  return entryStart < bedStartMins;
}

function clockIsNightWakeTimelineEntrySim(entry, bedStartMins = null) {
  const mins = clockMins(entry && (entry.time || entry.start || ""));
  const legacyNightWake = !!(entry && entry.type === "wake" && !entry.night && mins !== null && (mins >= 19 * 60 || mins < 5 * 60));
  const rawNightWake = !!(entry && ((entry.night && (entry.type === "wake" || entry.type === "feed")) || legacyNightWake));
  return rawNightWake && !clockEntryFallsBeforeBedtimeStartSim(entry, bedStartMins);
}

const TRACK_RELIABLE_NAP_MAX_MINS_SIM = 300;
function clockNapSpanMinsSim(entry) {
  if (!entry || entry.type !== "nap" || !entry.start || !entry.end || entry.end === entry.start) return 0;
  const span = Math.round(minDiffSim(entry.start, entry.end));
  return Number.isFinite(span) && span > 0 ? span : 0;
}

function clockNapExplicitDurationMinsSim(entry) {
  const explicit = Number(entry && (entry.durationMins ?? entry.duration ?? entry.minutes ?? entry.napDuration ?? 0));
  if (!Number.isFinite(explicit) || explicit <= 0) return 0;
  return Math.max(6, Math.min(240, Math.round(explicit)));
}

function clockNapHasRawImplausibleSpanSim(entry) {
  return clockNapSpanMinsSim(entry) >= TRACK_RELIABLE_NAP_MAX_MINS_SIM;
}

function clockNapNeedsTimerCheckSim(entry) {
  return !!(
    entry &&
    entry.type === "nap" &&
    entry._active !== true &&
    !clockNapExplicitDurationMinsSim(entry) &&
    (!entry.end || entry.end === entry.start || clockNapHasRawImplausibleSpanSim(entry))
  );
}

function clockNapDurationSim(entry) {
  const span = clockNapSpanMinsSim(entry);
  if (span && span < TRACK_RELIABLE_NAP_MAX_MINS_SIM) return span;
  const explicit = clockNapExplicitDurationMinsSim(entry);
  if (explicit) return explicit;
  return span || 0;
}

function clockNapDisplayEndSim(entry) {
  const start = clockMins(entry && entry.start);
  const duration = clockNapDurationSim(entry);
  return start !== null && duration ? minsToClock(start + duration) : "";
}

function shouldReplaceBedtimeWakeEntrySim(entry, bedEntryId, wakeTime) {
  if (!entry || entry.type !== "wake" || entry.night) return false;
  const mins = clockMins(entry.time || "");
  if (mins === null || mins < 5 * 60 || mins >= 13 * 60) return false;
  if (entry.bedEntryId && entry.bedEntryId === bedEntryId) return true;
  if (entry.source === "bedtime-wake-time") return true;
  if (entry.time === wakeTime) return true;
  return !entry.note && !entry.src && !entry.loggedBy && !entry.correctedFrom;
}

function saveBedtimeWakeTimeSim(days, bedDay, bedEntryId, wakeTime) {
  const wakeDay = (clockMins(wakeTime) ?? 9999) < 12 * 60 ? nextCalDay(bedDay) : bedDay;
  const wakeEntry = { id: "new-wake", type: "wake", time: wakeTime, night: false, nightLocked: true, note: "", source: "bedtime-wake-time", bedEntryId };
  const existing = days[wakeDay] || [];
  return {
    ...days,
    [wakeDay]: [...existing.filter(e => !shouldReplaceBedtimeWakeEntrySim(e, bedEntryId, wakeTime)), wakeEntry],
  };
}

function pendingNightWakeDurationMinsSim(entry, settleTime, pauseStartMs, nowMs) {
  const explicit = parseInt(entry && (entry.assistedDuration || entry.settleDuration || entry.wakeDuration || entry.duration || 0), 10) || 0;
  if (explicit > 0 && !entry.isPending) return explicit;
  const liveElapsed = (() => {
    if (pauseStartMs > 1000000000000) {
      const mins = Math.max(0, Math.round((nowMs - pauseStartMs) / 60000));
      if (mins >= 0 && mins <= 360) return mins;
      if (mins > 360) return 360;
    }
    return null;
  })();
  const wakeMins = clockMins(entry && entry.time || "");
  const settleMins = clockMins(settleTime || "");
  if (wakeMins !== null && settleMins !== null) {
    let diff = settleMins - wakeMins;
    if (diff < 0) diff += 24 * 60;
    if (diff >= 0 && diff <= 360) {
      if (liveElapsed !== null && diff > liveElapsed + 1) return liveElapsed;
      const nowDate = new Date(nowMs);
      const nowClock = String(nowDate.getHours()).padStart(2, "0") + ":" + String(nowDate.getMinutes()).padStart(2, "0");
      const nowMins = clockMins(nowClock);
      if (nowMins !== null) {
        let nowDiff = nowMins - wakeMins;
        if (nowDiff < 0) nowDiff += 24 * 60;
        if (nowDiff <= 360 && diff > nowDiff + 1) return nowDiff;
      }
      return diff;
    }
  }
  if (liveElapsed !== null) return liveElapsed;
  return 0;
}

function quickAddNightFlagSim(data, autoNight = false) {
  return data.nightLocked ? true : (data.night !== undefined ? !!data.night : autoNight);
}

function pauseBedTimerWakeEntrySim(time = "05:29") {
  return {
    type: "wake",
    time,
    night: true,
    nightLocked: true,
    note: "Night wake. settling...",
    _pendingSettle: true,
    modifiedAt: Date.parse("2026-05-09T05:29:00"),
    source: "bedtimer-night-wake",
  };
}

function clockVisibleEventsSim({ dayBoundary = "wake", dayKey, days }) {
  const entriesForDay = days[dayKey] || [];
  const nextDayKey = nextCalDay(dayKey);
  const nextEntriesForDay = days[nextDayKey] || [];
  const wakeStart = findMorningWake(entriesForDay) ? timeVal(findMorningWake(entriesForDay)) : null;
  const nextWakeStart = findMorningWake(nextEntriesForDay) ? timeVal(findMorningWake(nextEntriesForDay)) : null;
  const out = [];
  const beforeWakeStart = (entry, startMins) => dayBoundary === "wake" && startMins !== null && timeVal(entry) < startMins;
  const isNightWakeTimeline = entry => !!(entry && entry.night && (entry.type === "wake" || entry.type === "feed"));
  const isTimedNightWake = entry => isNightWakeTimeline(entry) && nightWakeDurationMinutes(entry) > 0;
  const shouldRenderBeforeWakeStart = entry => {
    if (!isNightWakeTimeline(entry)) return false;
    if (isTimedNightWake(entry)) return true;
    return entry.nightLocked || entry.source === "manual-night-wake" || entry.source === "bedtimer-night-wake";
  };
  const visualOpts = entry => {
    const start = timeVal(entry);
    const visualStart = start < 12 * 60 ? start + 1440 : start;
    return { visualStart, visualEnd: visualStart + Math.max(26, nightWakeDurationMinutes(entry)) };
  };
  const push = (entry, sourceDay, opts = {}) => out.push({ entry, sourceDay, logOnly: !!opts.logOnly, visualStart: opts.visualStart ?? timeVal(entry), visualEnd: opts.visualEnd ?? timeVal(entry) + Math.max(26, nightWakeDurationMinutes(entry)) });
  entriesForDay.forEach(entry => {
    if (beforeWakeStart(entry, wakeStart)) {
      if (shouldRenderBeforeWakeStart(entry)) push(entry, dayKey, visualOpts(entry));
      return;
    }
    push(entry, dayKey);
  });
  nextEntriesForDay.forEach(entry => {
    const carryLimit = nextWakeStart ?? 13 * 60;
    if (!beforeWakeStart(entry, carryLimit)) return;
    if (shouldRenderBeforeWakeStart(entry)) push(entry, nextDayKey, visualOpts(entry));
    else push(entry, nextDayKey, { logOnly: true });
  });
  return out;
}

function clockWakeWindowItemsSim({ dayKey, rows, nowMins = 12 * 60, clockBedOnThisDay = false }) {
  const clockLogOrderAnchor = 5 * 60;
  const clockLogOrderMins = item => item.start < clockLogOrderAnchor ? item.start + 1440 : item.start;
  const out = [];
  let awakeStart = null;
  [...rows].sort((a, b) => clockLogOrderMins(a) - clockLogOrderMins(b)).forEach(item => {
    const type = item.entry.type;
    const start = clockLogOrderMins(item);
    const end = item.end < clockLogOrderAnchor ? item.end + 1440 : item.end;
    if (type === "wake" && !item.entry.night && !(item.entry.nightLocked && item.entry.night !== false) && item.sourceDay === dayKey) {
      awakeStart = start;
      return;
    }
    if (((type === "nap" && !clockNapNeedsTimerCheckSim(item.entry)) || type === "sleep") && awakeStart !== null) {
      if (start > awakeStart + 5) out.push({ start: awakeStart, end: start, duration: start - awakeStart, target: type, isNow: false });
    }
    if (type === "nap" && !clockNapNeedsTimerCheckSim(item.entry)) awakeStart = !item.isNow ? Math.max(start, end) : null;
    else if (type === "sleep") awakeStart = null;
  });
  if (awakeStart !== null && !clockBedOnThisDay) {
    const nowForWindow = nowMins < (awakeStart % 1440) ? nowMins + 1440 : nowMins;
    if (nowForWindow > awakeStart + 5) out.push({ start: awakeStart, end: nowForWindow, duration: nowForWindow - awakeStart, target: "now", isNow: true });
  }
  return out.filter(item => item.duration >= 10).slice(0, 8);
}

function tickNextEventSim({ hasBedtime, planPred, bedMins, napsDone = 1, napRefusedChoice = null, napOverdue = false, lateDayNapCannotFit = false, fallbackBedMins = null }) {
  let nextNapMins = planPred && typeof planPred.napStart_min === "number" ? Math.round(planPred.napStart_min) : null;
  let napsComplete = false;
  let bridgeNapNeeded = !!(planPred && planPred.isBridge);
  let napBedConflict = false;
  if (!hasBedtime && lateDayNapCannotFit) {
    planPred = null;
    nextNapMins = null;
    napsComplete = true;
    bridgeNapNeeded = false;
    napBedConflict = true;
    if (fallbackBedMins !== null && (!bedMins || bedMins > fallbackBedMins + 20)) bedMins = fallbackBedMins;
  }
  if (hasBedtime) {
    planPred = null;
    nextNapMins = null;
    napsComplete = true;
    bridgeNapNeeded = false;
    napBedConflict = false;
  }
  const nextEvent = hasBedtime
    ? null
    : (planPred && typeof planPred.napStart_min === "number" && (!napOverdue || napRefusedChoice !== "skip"))
      ? { type: "nap", label: bridgeNapNeeded ? "Bridge nap" : "Nap " + (napsDone + 1), timeMins: nextNapMins }
      : bedMins
        ? { type: "bed", label: "Bedtime", timeMins: bedMins }
        : null;
  const nextPrediction = nextEvent ? nextEvent.label : null;
  return { nextEvent, nextPrediction, nextNapMins, napsComplete, bridgeNapNeeded, napBedConflict };
}

function clockShouldShowStandaloneNapPredictionSim({ nextEvent = null, td = {}, tdBedMins = null, mins = null, bedCurrent = true }) {
  if (nextEvent && (nextEvent.type === "bed" || nextEvent.type === "sleep")) return false;
  if (td.napsComplete && !td.bridgeNapNeeded) return false;
  if (td.bridgeNapNeeded || (nextEvent && nextEvent.type === "nap")) return true;
  const napStart = Number(mins);
  if (!Number.isFinite(napStart)) return false;
  if (tdBedMins !== null && bedCurrent && napStart >= tdBedMins - 30) return false;
  return true;
}

function applyChildSyncDeleteTombstonesSim(childId, child, deletedEntryIds = [], deletedDays = []) {
  const deletedIdSet = new Set(deletedEntryIds);
  const deletedDaySet = new Set(deletedDays);
  const nextDays = {};
  Object.entries((child && child.days) || {}).forEach(([dayKey, entries]) => {
    if (deletedDaySet.has(childId + ":" + dayKey)) return;
    nextDays[dayKey] = (Array.isArray(entries) ? entries : []).filter(entry => {
      const id = entry && entry.id;
      return !id || !deletedIdSet.has(id);
    });
  });
  return { ...(child || {}), days: nextDays };
}

function findBedtime(entries) {
  return (entries || [])
    .filter(e => e && e.type === "sleep" && !e.night && e.time && (clockMins(e.time) ?? -1) >= 12 * 60)
    .sort((a, b) => timeVal(b) - timeVal(a))[0] || null;
}

function findMorningWake(entries) {
  return (entries || [])
    .filter(e => e && e.type === "wake" && !e.night && !(e.nightLocked && e.night !== false) && e.time)
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

function nightEntryWriteDayKey(e) {
  const candidates = [e && e.createdAt, e && e.loggedAt, e && e._ts, e && e.modifiedAt];
  for (const value of candidates) {
    const ms = typeof value === "number" ? value : Date.parse(value || "");
    if (Number.isFinite(ms) && ms > 0) return new Date(ms).toISOString().slice(0, 10);
  }
  const idPrefix = String(e && e.id || "").slice(0, 8);
  if (/^[0-9a-z]{8}$/i.test(idPrefix)) {
    const idMs = parseInt(idPrefix, 36);
    if (Number.isFinite(idMs) && idMs >= Date.UTC(2020, 0, 1) && idMs <= Date.UTC(2035, 0, 1)) {
      return new Date(idMs).toISOString().slice(0, 10);
    }
  }
  return "";
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
  const sameDayMorningWake = findMorningWake(bedDayEnt);
  const sameDayMorningMins = sameDayMorningWake ? clockMins(sameDayMorningWake.time) : null;
  const morningNightEntries = (morningDayKey && morningDayKey !== bedtimeDayKey ? morningDayEnt : [])
    .filter(isNightWakeLikeEntry)
    .filter(e => {
      const m = clockMins(e && (e.time || e.start));
      if (m === null) return false;
      if (m >= 12 * 60) return false;
      return morningMins === null || m < morningMins;
    });
  const bedDayNightEntries = bedDayEnt
    .filter(isNightWakeLikeEntry)
    .filter(e => {
      const m = clockMins(e && (e.time || e.start));
      if (m === null) return false;
      if (m >= bedMins) return true;
      if (m < 12 * 60) {
        const writeDay = nightEntryWriteDayKey(e);
        if (writeDay) return writeDay > bedtimeDayKey;
        if (sameDayMorningMins !== null && m < sameDayMorningMins) return false;
        return true;
      }
      return false;
    });
  const raw = [
    ...bedDayNightEntries,
    ...morningNightEntries,
  ];
  const seenIds = new Set();
  const candidates = raw
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
  return dedupeNightWakeEvents(candidates);
}

function nightWakeEventScore(e) {
  return (e.type === "wake" ? 8 : 0)
    + (e.selfSettled ? 4 : 0)
    + ((parseInt(e.assistedDuration) || parseInt(e.settleDuration) || parseInt(e.duration) || 0) > 0 ? 3 : 0)
    + ((e.type === "feed" || e.feedType || isMilkOrBreastFeedEntry(e)) ? 2 : 0)
    + (e.note ? 1 : 0);
}

function breastFeedMinutes(e) {
  return (parseFloat(e && e.breastL) || 0) + (parseFloat(e && e.breastR) || 0);
}

function safeBreastMinutesInputSim(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(Math.round(n * 2) / 2, 24 * 60);
}

function breastTimerEditSaveSim({ left, right, side = "L", start = "10:00", nowMs }) {
  const now = Number(nowMs) || Date.parse("2026-05-13T10:15:00");
  const [h, m] = start.split(":").map(Number);
  const startDate = new Date(now);
  startDate.setHours(h, m, 0, 0);
  if (startDate.getTime() > now) startDate.setDate(startDate.getDate() - 1);
  const nextSec = {
    L: Math.round(safeBreastMinutesInputSim(left) * 60),
    R: Math.round(safeBreastMinutesInputSim(right) * 60),
  };
  if (nextSec.L + nextSec.R <= 0) {
    nextSec[side] = Math.max(0, Math.min(7200, Math.floor((now - startDate.getTime()) / 1000)));
  }
  return {
    sec: nextSec,
    timerStartMs: nextSec.L + nextSec.R > 0 ? now - (nextSec.L + nextSec.R) * 1000 : startDate.getTime(),
    log: {
      breastL: nextSec.L > 0 ? Math.max(1, Math.floor(nextSec.L / 60)) : 0,
      breastR: nextSec.R > 0 ? Math.max(1, Math.floor(nextSec.R / 60)) : 0,
    },
  };
}

function isMilkOrBreastFeedEntry(e) {
  return !!(e && (
    e.assistedType === "milk" ||
    e.feedType === "milk" ||
    e.feedType === "bottle" ||
    e.feedType === "breast" ||
    (parseFloat(e.amount) || 0) > 0 ||
    breastFeedMinutes(e) > 0
  ));
}

function isNightFeedSettlingEntry(e) {
  return !!(e && e.night && (
    e.type === "feed" ||
    isMilkOrBreastFeedEntry(e)
  ));
}

function isNightWakeSettlingContextEntry(e) {
  if (!e || e.type !== "wake") return false;
  const text = [e.id, e.source, e.note, e.assistedNote, e.reason, e.label, e.detail].filter(Boolean).join(" ").toLowerCase();
  return !!(e._settlingContext || e._settlingFeedIds || /\b(settle|settling|settled|context|detail|marker)\b/.test(text));
}

function nightWakeDurationMinutes(e) {
  const direct = Math.min(Math.max(parseInt(e.assistedDuration) || parseInt(e.settleDuration) || parseInt(e.wakeDuration) || parseInt(e.duration) || 0, 0), 240);
  if (direct > 0) return direct;
  const start = clockMins(e && (e.time || e.start));
  const end = clockMins(e && (e.end || e.stop || e.stoppedAt || e.settleTime || e.settledAt));
  if (start !== null && end !== null && end !== start) {
    let diff = end - start;
    if (diff < 0) diff += 24 * 60;
    if (diff > 0 && diff <= 240) return diff;
  }
  return 0;
}

function nightEventForwardGap(anchor, event) {
  const a = Number.isFinite(anchor._fromBedMin) ? anchor._fromBedMin : clockMins(anchor.time || anchor.start);
  const b = Number.isFinite(event._fromBedMin) ? event._fromBedMin : clockMins(event.time || event.start);
  if (a === null || b === null) return null;
  let gap = b - a;
  if (gap < -720) gap += 1440;
  if (gap < 0) return null;
  return gap;
}

function mergeNightWakeSettlingFeed(wake, feed, gapMin = 0) {
  const merged = { ...wake };
  const wakeDur = nightWakeDurationMinutes(wake);
  const feedDur = nightWakeDurationMinutes(feed);
  const wakeLooksOpen = /settling|in\s+progress|open/i.test(String(wake.note || "").toLowerCase());
  const combinedDur = wakeLooksOpen
    ? Math.max(wakeDur, feedDur ? gapMin + feedDur : gapMin)
    : Math.max(wakeDur, feedDur || 0);
  if (combinedDur > wakeDur) merged.wakeDuration = combinedDur;
  if ((parseFloat(feed.amount) || 0) > 0 && !(parseFloat(merged.amount) || 0)) merged.amount = feed.amount;
  if (feed.feedType && !merged.feedType) merged.feedType = feed.feedType;
  if ((parseFloat(feed.breastL) || 0) > 0 && !(parseFloat(merged.breastL) || 0)) merged.breastL = feed.breastL;
  if ((parseFloat(feed.breastR) || 0) > 0 && !(parseFloat(merged.breastR) || 0)) merged.breastR = feed.breastR;
  if (isMilkOrBreastFeedEntry(feed) && !merged.assistedType) merged.assistedType = "milk";
  if (isMilkOrBreastFeedEntry(feed)) {
    merged.selfSettled = false;
    merged.assisted = true;
  }
  merged._settlingFeedIds = Array.from(new Set([...(merged._settlingFeedIds || []), feed.id].filter(Boolean)));
  return merged;
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
      const forwardGap = nightEventForwardGap(last, e);
      const lastDur = nightWakeDurationMinutes(last);
      const lastLooksOpen = /settling|in\s+progress|open/i.test(String(last.note || "").toLowerCase());
      if (last.type === "wake" && isNightFeedSettlingEntry(e) && forwardGap !== null && forwardGap <= Math.max(45, lastDur + 20, lastLooksOpen ? 90 : 0)) {
        out[out.length - 1] = mergeNightWakeSettlingFeed(last, e, forwardGap);
        return;
      }
      if (isNightFeedSettlingEntry(last) && last.type !== "wake" && e.type === "wake" && forwardGap !== null) {
        const curDur = nightWakeDurationMinutes(e);
        const curLooksOpen = /settling|in\s+progress|open/i.test(String(e.note || "").toLowerCase());
        if (forwardGap <= Math.max(45, curDur + 20, lastDur + 20, curLooksOpen ? 90 : 0)) {
          out[out.length - 1] = mergeNightWakeSettlingFeed(e, last, 0);
          return;
        }
      }
      let gap = Math.abs(e._nightEventKey - last._nightEventKey);
      if (gap > 720) gap = 1440 - gap;
      if (gap <= 15) {
        if (e.type === "wake" && isNightFeedSettlingEntry(last)) out[out.length - 1] = mergeNightWakeSettlingFeed(e, last, 0);
        else if (nightWakeEventScore(e) > nightWakeEventScore(last)) out[out.length - 1] = e;
        return;
      }
    }
    out.push(e);
  });
  const wakeIndexes = out
    .map((entry, index) => entry && entry.type === "wake" ? { entry, index } : null)
    .filter(Boolean);
  if (!wakeIndexes.length) return out;
  const attachedFeedIndexes = new Set();
  const merged = out.map(entry => ({ ...entry }));
  out.forEach((entry, index) => {
    const entryIsWakeContext = entry.type === "wake";
    const entryDur = nightWakeDurationMinutes(entry);
    const shortSettlingWakeContext = entryIsWakeContext && entryDur <= 10 && isNightWakeSettlingContextEntry(entry);
    if (!isNightFeedSettlingEntry(entry) && !shortSettlingWakeContext) return;
    if (entryIsWakeContext && entryDur > 20) return;
    const feedKey = Number.isFinite(entry._fromBedMin) ? entry._fromBedMin : clockMins(entry.time || entry.start);
    if (feedKey === null) return;
    let best = null;
    wakeIndexes.forEach(candidate => {
      if (candidate.index === index) return;
      const wake = merged[candidate.index] || candidate.entry;
      const wakeKey = Number.isFinite(wake._fromBedMin) ? wake._fromBedMin : clockMins(wake.time || wake.start);
      if (wakeKey === null) return;
      const wakeDur = Math.max(5, nightWakeDurationMinutes(wake) || 0);
      let forwardFromWake = feedKey - wakeKey;
      if (forwardFromWake < -720) forwardFromWake += 1440;
      let backwardToWake = wakeKey - feedKey;
      if (backwardToWake < -720) backwardToWake += 1440;
      const feedAfterWake = forwardFromWake >= 0;
      if (entryIsWakeContext && !feedAfterWake) return;
      const distance = feedAfterWake
        ? Math.max(0, forwardFromWake - wakeDur)
        : backwardToWake >= 0
        ? backwardToWake
        : Math.abs(feedKey - wakeKey);
      const threshold = Math.max(90, wakeDur + 30);
      if (distance <= threshold && (!best || distance < best.distance)) {
        best = { ...candidate, distance, gapFromWake: feedAfterWake ? forwardFromWake : 0 };
      }
    });
    if (!best) return;
    merged[best.index] = mergeNightWakeSettlingFeed(merged[best.index], entry, best.gapFromWake || 0);
    attachedFeedIndexes.add(index);
  });
  return merged.filter((_, index) => !attachedFeedIndexes.has(index));
}

function getNightWakeEventsForDay(days, bedtimeDayKey, morningDayKey) {
  const bedDayEnt = days[bedtimeDayKey] || [];
  if (findBedtime(bedDayEnt)) {
    return collectLastNightWakeEntries(days, bedtimeDayKey, morningDayKey || nextCalDay(bedtimeDayKey));
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
      const durationMin = Math.min(Math.max(nightWakeDurationMinutes(e), 0), 120) || 5;
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

function estimateParentSleepFromCompletedNightSim(days, bedtimeDayKey) {
  const summary = analyzeLastNight(days, bedtimeDayKey, nextCalDay(bedtimeDayKey));
  if (!summary || summary.nightTotalMin === null) return null;
  let longestStretchMin = 0;
  let cursor = 0;
  summary.wakes.forEach(w => {
    longestStretchMin = Math.max(longestStretchMin, w.fromBedMin - cursor);
    cursor = w.fromBedMin + (w.durationMin || 0);
  });
  longestStretchMin = Math.max(longestStretchMin, summary.nightTotalMin - cursor);
  const totalSleepMin = Math.max(0, summary.nightTotalMin - summary.totalAwakeMin);
  if (summary.nightTotalMin < 3 * 60 || summary.nightTotalMin > 14 * 60) return null;
  if (totalSleepMin <= 0 || longestStretchMin <= 0) return null;
  return {
    totalSleepMin,
    longestStretchMin,
    parentSleepBlockMin: Math.min(8 * 60, longestStretchMin),
  };
}

function classifySettleMethod(e) {
  if (!e) return "assisted";
  if (e.selfSettled) return "self";
  if (e.feedType === "breast") return "breast";
  if (isMilkOrBreastFeedEntry(e)) return "milk";
  if (e.assistedType === "other") return "other";
  return "assisted";
}

function analyzeSettleMethods(days, windowDays, selDayKey) {
  const anchor = selDayKey || Object.keys(days || {}).sort().pop();
  const byMethod = {
    self: { count: 0, totalMin: 0 },
    breast: { count: 0, totalMin: 0 },
    milk: { count: 0, totalMin: 0 },
    assisted: { count: 0, totalMin: 0 },
    other: { count: 0, totalMin: 0 },
  };
  let totalWakes = 0;
  for (let i = 0; i < windowDays; i++) {
    const day = addCalDays(anchor, -i);
    getNightWakeEventsForDay(days, day, nextCalDay(day)).forEach(e => {
      const dur = nightWakeDurationMinutes(e);
      if (dur <= 0) return;
      const method = classifySettleMethod(e);
      byMethod[method].count++;
      byMethod[method].totalMin += dur;
      totalWakes++;
    });
  }
  return { byMethod, totalWakes };
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

  const frequentWakeTimes = ["20:30","21:30","22:30","23:30","00:30","01:30","02:30","03:30","04:30","05:30","06:30"];
  const frequentWakeDays = {};
  const frequentBedDays = ["2026-05-02","2026-05-04","2026-05-06","2026-05-08","2026-05-10"];
  frequentBedDays.forEach((day, index) => {
    const next = nextCalDay(day);
    const count = index === 4 ? 11 : 10;
    frequentWakeDays[day] = [
      { id: "bed-" + day, type: "sleep", time: "19:30", night: false },
      ...frequentWakeTimes.slice(0, count).map((time, wakeIndex) => ({
        id: "real-wake-" + day + "-" + wakeIndex,
        type: "wake",
        time,
        night: true,
        wakeDuration: 5
      }))
    ];
    frequentWakeDays[next] = [{ id: "am-" + next, type: "wake", time: "07:15", night: false }];
  });
  const frequentLastNight = analyzeLastNight(frequentWakeDays, "2026-05-10", "2026-05-11");
  const frequentAvg = Math.round(frequentBedDays.reduce((sum, day) => sum + getNightWakeEventCount(frequentWakeDays, day, nextCalDay(day)), 0) / frequentBedDays.length * 10) / 10;
  assert("frequent hourly short night wakes are not collapsed into one wake", frequentLastNight.wakeCount === 11, "got " + frequentLastNight.wakeCount + " " + JSON.stringify(frequentLastNight.wakes.map(w => w.time)));
  assert("frequent historical wake average is preserved after update", frequentAvg === 10.2, "got " + frequentAvg);

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
  const settlingFeedDays = {
    "2026-05-01": [
      { id: "bed", type: "sleep", time: "19:49", night: false },
      { id: "false-start", type: "wake", time: "20:36", night: true, wakeDuration: 77, selfSettled: true },
      { id: "settle-feed", type: "feed", time: "21:53", night: true, amount: 160, feedType: "milk", assistedType: "milk" },
    ],
    "2026-05-02": [{ id: "am", type: "wake", time: "08:53", night: false }],
  };
  const settlingFeedNight = analyzeLastNight(settlingFeedDays, "2026-05-01", "2026-05-02");
  assert("night feed inside the logged wake duration is a settling method, not a second wake", settlingFeedNight.wakeCount === 1, "got " + settlingFeedNight.wakeCount);
  assert("merged settling feed keeps the milk context on the wake", settlingFeedNight.wakes[0].amount === 160 && settlingFeedNight.wakes[0].assistedType === "milk", JSON.stringify(settlingFeedNight.wakes[0]));
  const settlingMethodTrend = analyzeSettleMethods(settlingFeedDays, 7, "2026-05-01");
  assert("settle-method trend counts a night wake plus settling feed as one wake", settlingMethodTrend.totalWakes === 1 && settlingMethodTrend.byMethod.milk.count === 1, JSON.stringify(settlingMethodTrend));
  const breastSettlingFeedDays = {
    "2026-05-01": [
      { id: "bed", type: "sleep", time: "19:49", night: false },
      { id: "false-start", type: "wake", time: "20:36", night: true, wakeDuration: 40, selfSettled: true },
      { id: "settle-breast", type: "feed", time: "20:49", night: true, amount: 0, feedType: "breast", breastL: 8, breastR: 4 },
    ],
    "2026-05-02": [{ id: "am", type: "wake", time: "08:53", night: false }],
  };
  const breastSettlingFeedNight = analyzeLastNight(breastSettlingFeedDays, "2026-05-01", "2026-05-02");
  assert("breastfeed inside a night wake is settling feed, not settled without feed", breastSettlingFeedNight.wakeCount === 1 && breastSettlingFeedNight.wakes[0].feedType === "breast" && breastSettlingFeedNight.wakes[0].assistedType === "milk" && breastSettlingFeedNight.wakes[0].selfSettled === false, JSON.stringify(breastSettlingFeedNight.wakes[0]));
  const completedWakeSettlingFeedDays = {
    "2026-05-08": [
      { id: "bed", type: "sleep", time: "20:01", night: false },
      { id: "false-start", type: "wake", time: "20:44", night: true, wakeDuration: 15, assistedType: "milk" },
      { id: "settle-feed", type: "feed", time: "21:18", night: true, amount: 100, feedType: "milk", assistedDuration: 6 },
    ],
    "2026-05-09": [{ id: "am", type: "wake", time: "09:27", night: false }],
  };
  const completedWakeSettlingFeedNight = analyzeLastNight(completedWakeSettlingFeedDays, "2026-05-08", "2026-05-09");
  assert("completed night wake plus nearby settling feed stays one visible wake", completedWakeSettlingFeedNight.wakeCount === 1 && completedWakeSettlingFeedNight.totalAwakeMin === 15 && completedWakeSettlingFeedNight.wakes[0].amount === 100, JSON.stringify(completedWakeSettlingFeedNight));
  const endedWakeSettlingFeedDays = {
    "2026-05-08": [
      { id: "bed", type: "sleep", time: "20:01", night: false },
      { id: "false-start", type: "wake", time: "20:44", end: "20:59", night: true, assistedType: "milk" },
      { id: "settle-feed", type: "feed", time: "21:05", night: true, amount: 100, feedType: "milk", assistedDuration: 6 },
    ],
    "2026-05-09": [{ id: "am", type: "wake", time: "09:27", night: false }],
  };
  const endedWakeSettlingFeedNight = analyzeLastNight(endedWakeSettlingFeedDays, "2026-05-08", "2026-05-09");
  assert("night wake duration falls back to logged end time before merging settling feed", endedWakeSettlingFeedNight.wakeCount === 1 && endedWakeSettlingFeedNight.totalAwakeMin === 15 && endedWakeSettlingFeedNight.wakes[0].amount === 100, JSON.stringify(endedWakeSettlingFeedNight));
  const feedLoggedBeforeWakeDetailDays = {
    "2026-05-08": [
      { id: "bed", type: "sleep", time: "20:01", night: false },
      { id: "settle-feed", type: "feed", time: "20:20", night: true, amount: 100, feedType: "milk", assistedDuration: 6 },
      { id: "false-start", type: "wake", time: "20:44", end: "20:59", night: true, assistedType: "milk" },
    ],
    "2026-05-09": [{ id: "am", type: "wake", time: "09:27", night: false }],
  };
  const feedLoggedBeforeWakeDetailNight = analyzeLastNight(feedLoggedBeforeWakeDetailDays, "2026-05-08", "2026-05-09");
  assert("settling feed logged before the wake detail still merges into that wake", feedLoggedBeforeWakeDetailNight.wakeCount === 1 && feedLoggedBeforeWakeDetailNight.totalAwakeMin === 15 && feedLoggedBeforeWakeDetailNight.wakes[0].amount === 100, JSON.stringify(feedLoggedBeforeWakeDetailNight));
  const delayedSettlingFeedDays = {
    "2026-05-08": [
      { id: "bed", type: "sleep", time: "19:49", night: false },
      { id: "false-start", type: "wake", time: "20:36", night: true, wakeDuration: 21, assistedType: "milk" },
      { id: "settle-feed", type: "feed", time: "21:53", night: true, amount: 160, feedType: "milk" },
    ],
    "2026-05-09": [{ id: "am", type: "wake", time: "09:27", night: false }],
  };
  const delayedSettlingFeedNight = analyzeLastNight(delayedSettlingFeedDays, "2026-05-08", "2026-05-09");
  assert("nearby delayed settling feed belongs to the nearest night wake, not a second wake", delayedSettlingFeedNight.wakeCount === 1 && delayedSettlingFeedNight.totalAwakeMin === 21 && delayedSettlingFeedNight.wakes[0].amount === 160, JSON.stringify(delayedSettlingFeedNight));
  const delayedMilkWakeContextDays = {
    "2026-05-08": [
      { id: "bed", type: "sleep", time: "19:49", night: false },
      { id: "false-start", type: "wake", time: "20:36", night: true, wakeDuration: 21 },
      { id: "milk-context", type: "wake", time: "21:53", night: true, wakeDuration: 6, amount: 160, assistedType: "milk", feedType: "milk" },
    ],
    "2026-05-09": [{ id: "am", type: "wake", time: "09:27", night: false }],
  };
  const delayedMilkWakeContextNight = analyzeLastNight(delayedMilkWakeContextDays, "2026-05-08", "2026-05-09");
  assert("nearby milk wake detail is settling context, not a second wake", delayedMilkWakeContextNight.wakeCount === 1 && delayedMilkWakeContextNight.totalAwakeMin === 21 && delayedMilkWakeContextNight.wakes[0].amount === 160, JSON.stringify(delayedMilkWakeContextNight));
  const delayedShortWakeContextDays = {
    "2026-05-08": [
      { id: "bed", type: "sleep", time: "19:49", night: false },
      { id: "false-start", type: "wake", time: "20:36", night: true, wakeDuration: 21 },
      { id: "settle-detail", type: "wake", time: "21:53", night: true, wakeDuration: 6 },
    ],
    "2026-05-09": [{ id: "am", type: "wake", time: "09:27", night: false }],
  };
  const delayedShortWakeContextNight = analyzeLastNight(delayedShortWakeContextDays, "2026-05-08", "2026-05-09");
  assert("nearby short settling detail is not counted as a second wake", delayedShortWakeContextNight.wakeCount === 1 && delayedShortWakeContextNight.totalAwakeMin === 21, JSON.stringify(delayedShortWakeContextNight));
  const delayedZeroWakeContextDays = {
    "2026-05-08": [
      { id: "bed", type: "sleep", time: "19:49", night: false },
      { id: "false-start", type: "wake", time: "20:36", night: true, wakeDuration: 16 },
      { id: "settle-marker", type: "wake", time: "21:53", night: true },
    ],
    "2026-05-09": [{ id: "am", type: "wake", time: "09:27", night: false }],
  };
  const delayedZeroWakeContextNight = analyzeLastNight(delayedZeroWakeContextDays, "2026-05-08", "2026-05-09");
  assert("nearby zero-duration settling marker is folded before the analysis default adds a fake wake", delayedZeroWakeContextNight.wakeCount === 1 && delayedZeroWakeContextNight.totalAwakeMin === 16, JSON.stringify(delayedZeroWakeContextNight));
  const standaloneNightFeedDays = {
    "2026-05-01": [
      { id: "bed", type: "sleep", time: "19:40", night: false },
      { id: "night-feed", type: "feed", time: "03:20", night: true, amount: 180, feedType: "milk" },
    ],
    "2026-05-02": [{ id: "am", type: "wake", time: "07:10", night: false }],
  };
  const standaloneNightFeed = analyzeLastNight(standaloneNightFeedDays, "2026-05-01", "2026-05-02");
  assert("standalone night feeds remain part of night-wake analysis", standaloneNightFeed.wakeCount === 1, "got " + standaloneNightFeed.wakeCount);
  const boundaryLeakDays = {
    "2026-05-07": [
      { id: "bed", type: "sleep", time: "19:49", night: false },
      { id: "open-wake", type: "wake", time: "20:36", night: true, note: "Night wake. settling..." },
      { id: "settle-feed", type: "feed", time: "21:53", night: true, amount: 160, feedType: "milk", assistedType: "milk" },
    ],
    "2026-05-08": [
      { id: "am", type: "wake", time: "08:53", night: false },
      { id: "tonight-wake", type: "wake", time: "20:44", night: true, note: "Night wake. settling..." },
      { id: "tonight-feed", type: "feed", time: "20:59", night: true, amount: 100, feedType: "milk", assistedType: "milk" },
    ],
  };
  const boundaryLeakNight = analyzeLastNight(boundaryLeakDays, "2026-05-07", "2026-05-08");
  assert("next evening night entries do not seep into the previous bedtime analysis", boundaryLeakNight.wakeCount === 1, "got " + boundaryLeakNight.wakeCount);
  assert("open settling wake plus later milk feed stays one false-start-length wake", boundaryLeakNight.wakes[0].durationMin === 77, "got " + boundaryLeakNight.wakes[0].durationMin);
  const sameDayAmLeakDays = {
    "2026-05-08": [
      { id: "prev-night-feed", type: "feed", time: "03:10", night: true, amount: 120, feedType: "milk", modifiedAt: Date.parse("2026-05-08T03:10:00") },
      { id: "fri-am", type: "wake", time: "08:53", night: false },
      { id: "fri-bed", type: "sleep", time: "19:49", night: false },
      { id: "fri-false-start", type: "wake", time: "20:36", night: true, wakeDuration: 43, modifiedAt: Date.parse("2026-05-08T20:36:00") },
    ],
    "2026-05-09": [{ id: "sat-am", type: "wake", time: "09:27", night: false }],
  };
  const sameDayAmLeakNight = analyzeLastNight(sameDayAmLeakDays, "2026-05-08", "2026-05-09");
  assert("same-calendar-day early-AM night entries do not seep into that evening's sleep analysis", sameDayAmLeakNight.wakeCount === 1 && sameDayAmLeakNight.wakes[0].time === "20:36", JSON.stringify(sameDayAmLeakNight.wakes));
  const idAt = iso => Date.parse(iso).toString(36) + "abc12345";
  const sameDayAmLeakWithoutModifiedAtDays = {
    "2026-05-08": [
      { id: idAt("2026-05-08T03:10:00Z"), type: "feed", time: "03:10", night: true, amount: 120, feedType: "milk" },
      { id: "fri-am", type: "wake", time: "08:53", night: false },
      { id: "fri-bed", type: "sleep", time: "19:49", night: false },
      { id: "fri-false-start", type: "wake", time: "20:36", night: true, wakeDuration: 43 },
    ],
    "2026-05-09": [{ id: "sat-am", type: "wake", time: "09:27", night: false }],
  };
  const sameDayAmLeakWithoutModifiedAtNight = analyzeLastNight(sameDayAmLeakWithoutModifiedAtDays, "2026-05-08", "2026-05-09");
  assert("entry ids prevent old early-AM logs without modifiedAt from leaking into that evening", sameDayAmLeakWithoutModifiedAtNight.wakeCount === 1 && sameDayAmLeakWithoutModifiedAtNight.wakes[0].time === "20:36", JSON.stringify(sameDayAmLeakWithoutModifiedAtNight.wakes));
  const sameDayAmLeakNoTimestampDays = {
    "2026-05-08": [
      { id: "legacy-3am-feed", type: "feed", time: "03:10", night: true, amount: 120, feedType: "milk" },
      { id: "legacy-4am-wake", type: "wake", time: "04:20", night: true, wakeDuration: 20 },
      { id: "fri-am", type: "wake", time: "08:53", night: false },
      { id: "fri-bed", type: "sleep", time: "19:49", night: false },
      { id: "fri-false-start", type: "wake", time: "20:36", night: true, wakeDuration: 43 },
    ],
    "2026-05-09": [{ id: "sat-am", type: "wake", time: "09:27", night: false }],
  };
  const sameDayAmLeakNoTimestampNight = analyzeLastNight(sameDayAmLeakNoTimestampDays, "2026-05-08", "2026-05-09");
  assert("legacy early-AM entries without a reliable write day do not leak into that evening's debrief", sameDayAmLeakNoTimestampNight.wakeCount === 1 && sameDayAmLeakNoTimestampNight.wakes[0].time === "20:36", JSON.stringify(sameDayAmLeakNoTimestampNight.wakes));
  const afterMidnightStoredOnBedDayDays = {
    "2026-05-08": [
      { id: "fri-am", type: "wake", time: "08:53", night: false },
      { id: "fri-bed", type: "sleep", time: "19:49", night: false },
      { id: idAt("2026-05-09T03:10:00Z"), type: "wake", time: "03:10", night: true, wakeDuration: 18 },
    ],
    "2026-05-09": [{ id: "sat-am", type: "wake", time: "09:27", night: false }],
  };
  const afterMidnightStoredOnBedDayNight = analyzeLastNight(afterMidnightStoredOnBedDayDays, "2026-05-08", "2026-05-09");
  assert("entry ids keep real after-midnight bed-timer wakes attached to the bedtime day", afterMidnightStoredOnBedDayNight.wakeCount === 1 && afterMidnightStoredOnBedDayNight.wakes[0].time === "03:10", JSON.stringify(afterMidnightStoredOnBedDayNight.wakes));

  const morningClosedDays = {
    "2026-05-01": [{ type: "sleep", time: "20:00", night: false }],
    "2026-05-02": [
      { id: "am", type: "wake", time: "06:20", night: false },
      { id: "late-night", type: "wake", time: "07:10", night: true, assistedDuration: "5" },
    ],
  };
  const closedNight = analyzeLastNight(morningClosedDays, "2026-05-01", "2026-05-02");
  assert("morning wake closes the night before later day wakes", closedNight.wakeCount === 0, "got " + closedNight.wakeCount);

  const timedNightWakeClockDay = {
    "2026-05-08": [
      { id: "am", type: "wake", time: "07:10", night: false },
      { id: "bed", type: "sleep", time: "19:45", night: false },
      { id: "nw-530", type: "wake", time: "05:30", night: true, wakeDuration: 69 },
    ],
    "2026-05-09": [
      { id: "sat-am", type: "wake", time: "06:45", night: false },
      { id: "nw-next-530", type: "wake", time: "05:30", night: true, wakeDuration: 69 },
    ],
  };
  const sameDayClockWake = clockVisibleEventsSim({ dayKey: "2026-05-08", days: timedNightWakeClockDay }).find(item => item.entry.id === "nw-530");
  const carriedClockWake = clockVisibleEventsSim({ dayKey: "2026-05-08", days: timedNightWakeClockDay }).find(item => item.entry.id === "nw-next-530");
  assert("timed 5:30-6:39 night wake on bedtime day renders as an overnight arc", sameDayClockWake && !sameDayClockWake.logOnly && sameDayClockWake.visualStart === 1770 && sameDayClockWake.visualEnd === 1839, JSON.stringify(sameDayClockWake));
  assert("timed 5:30-6:39 night wake carried from morning day renders as an overnight arc", carriedClockWake && !carriedClockWake.logOnly && carriedClockWake.visualStart === 1770 && carriedClockWake.visualEnd === 1839, JSON.stringify(carriedClockWake));

  const badEndGoodDurationNap = { id: "nap-bad-end", type: "nap", start: "14:30", end: "08:00", duration: 45, _active: false };
  assert("clock trusts saved nap duration when the stored end span is implausible", !clockNapNeedsTimerCheckSim(badEndGoodDurationNap) && clockNapDurationSim(badEndGoodDurationNap) === 45 && clockNapDisplayEndSim(badEndGoodDurationNap) === "15:15", JSON.stringify({ needsCheck: clockNapNeedsTimerCheckSim(badEndGoodDurationNap), duration: clockNapDurationSim(badEndGoodDurationNap), end: clockNapDisplayEndSim(badEndGoodDurationNap) }));
  const durationOnlyNap = { id: "nap-duration-only", type: "nap", start: "10:05", duration: 38, _active: false };
  assert("clock renders duration-only completed naps instead of asking for a timer check", !clockNapNeedsTimerCheckSim(durationOnlyNap) && clockNapDurationSim(durationOnlyNap) === 38 && clockNapDisplayEndSim(durationOnlyNap) === "10:43", JSON.stringify({ needsCheck: clockNapNeedsTimerCheckSim(durationOnlyNap), duration: clockNapDurationSim(durationOnlyNap), end: clockNapDisplayEndSim(durationOnlyNap) }));
  const badEndNoDurationNap = { id: "nap-bad-end-no-duration", type: "nap", start: "14:30", end: "08:00", _active: false };
  assert("clock still asks for review when both nap end span and duration are unreliable", clockNapNeedsTimerCheckSim(badEndNoDurationNap), JSON.stringify(badEndNoDurationNap));

  const pauseStartMs = Date.parse("2026-05-09T02:10:00");
  const saveLaterMs = Date.parse("2026-05-09T03:05:00");
  const babySleepingDuration = pendingNightWakeDurationMinsSim({ time: "02:10", isPending: true }, "02:45", pauseStartMs, saveLaterMs);
  assert("Baby Sleeping flow uses pause-to-tap time, not save-time drift", babySleepingDuration === 35, "got " + babySleepingDuration);
  const futureSettleDuration = pendingNightWakeDurationMinsSim({ time: "10:03", isPending: true, assistedDuration: 180 }, "13:03", Date.parse("2026-05-09T10:03:00"), Date.parse("2026-05-09T10:08:00"));
  assert("pending night wake details ignore stale future settle times", futureSettleDuration === 5, "got " + futureSettleDuration);
  assert("live app routes paused bedtime taps to Baby Sleeping details before resuming", appSource.includes("function openBabySleepingNightWakeDetails(settleMethod)") && appSource.includes("openBabySleepingNightWakeDetails(\"self\")") && appSource.includes("bedPaused ? \"Baby sleeping\" : \"Pause sleep timer\"") && appSource.includes("tap Baby sleeping when settled."));
	  assert("Baby Sleeping milk details stay a night wake and restart native timers", appSource.includes('const nightWakeEntryType = isPendingWakeDetailSave ? "wake" : hadMilk ? "feed" : "wake";') && appSource.includes("type: nightWakeEntryType") && appSource.includes('source: isPendingWakeDetailSave ? "bedtimer-night-wake" : "manual-night-wake"') && appSource.includes('if(hadMilk && !entry.assistedType) entry.assistedType = "milk";') && appSource.includes("if(isPendingWakeDetailSave) entry._pendingSettle = false;") && appSource.includes('_androidTimerStart({type:"sleep",babyName:babyName||"Baby",startTime:_virtualStart});'));
	  assert("nightLocked quick logs always save as night", quickAddNightFlagSim({ nightLocked: true }, false) === true);
	  assert("active bedtime quick feeds are locked night feeds", appSource.includes("function activeBedTimerDayForQuickLog()") && appSource.includes("const _isFeedDuringActiveBedTimer = !!(") && appSource.includes('source:data.source || "bedtimer-night-feed"') && appSource.includes("nightLocked:true") && appSource.includes('_feedTypeForNightTimer !== "pump"') && appSource.includes('_feedTypeForNightTimer !== "solids"'));
	  assert("active bedtime quick-feed routing follows the selected day model", appSource.includes('const dayKey = _isNightTimerFeedForAll ? (dayBoundary === "wake" ? _bedDayForAll : todayStr()) : selDay;') && appSource.includes('if (dayBoundary === "wake" && _isNightEntry && _btdEffective)') && appSource.includes('} else if (_isExplicitNight && dayBoundary === "midnight")'));
		  assert("clock bottle feed taps during bedtime ask night wake or morning wake", appSource.includes("function openBedtimeFeedChoice(data)") && appSource.includes("function logBedtimeFeedChoice(kind)") && appSource.includes("Night wake feed or morning wake?") && appSource.includes("Night wake</strong> means baby isn't ready to wake up for the day.") && appSource.includes("Morning wake</strong> means baby is ready to start the day.") && appSource.includes('openBedtimeFeedChoice(_feedData)'));
		  assert("clock breast tap during bedtime pauses bedtime and starts the L/R timer", appSource.includes("function startNightBreastTimerFromBed(sideArg)") && appSource.includes("const pendingFromPause = pauseBedTimer();") && appSource.includes("startBreastTimer(sideKey);") && appSource.includes('showToast("🤱 Night feed timer started"') && appSource.includes("if (clockBedOnThisDay && !bedPausedNow) {") && appSource.includes("startNightBreastTimerFromBed(sideKey);") && appSource.includes("if (bedPausedNow && bedtimeFeedChoiceBedDay()) { startBreastTimer(sideKey);"));
		  assert("night breastfeeding timer stop completes the pending night wake with L/R feed details and restarts sleep", appSource.includes('const breastLMin = settleMethod === "milk" ? safeBreastMinutesInput(opts && opts.breastL) : 0;') && appSource.includes('hasBreastDetails ? "breast"') && appSource.includes('breastL: _feedType === "breast" && breastLMin > 0 ? breastLMin : undefined') && appSource.includes('resumeBedTimer("milk", {') && appSource.includes("breastL: lMins") && appSource.includes("breastR: rMins") && appSource.includes("Night feed logged. sleep timer restarted"));
		  assert("bedtime active state wins over stale nap timer state", appSource.includes('function clearNapTimerState(reason = "timer_clear", opts = {})') && appSource.includes('clearNapTimerState("bedtime_timer_wins", {preserveMode:true, keepNativeTimer:true});') && appSource.includes('const clockNapSuppressedByBedtime = !!(clockBedOnThisDay && !bedPaused);') && appSource.includes('type: _bedActive ? "bed" : _breastActive ? "breast" : "nap"') && appSource.includes('if (localStorage.getItem("bed_timer_day") && localStorage.getItem("bed_paused") !== "1") return null;'));
	  assert("morning wake feed choice stops bedtime and logs feed on the new day", appSource.includes('logMorningWakeNextDay(baseData.time, {targetDay, bedDay:choice.bedDay});') && appSource.includes('source:"morning-wake-feed"') && appSource.includes("_targetDayOverride:targetDay") && appSource.includes("_skipWakePrompt:true") && appSource.includes("wakeTargetDayOverride ||"));
	  assert("clock treats active bedtime quick feeds as night wake/feed rows", appSource.includes('entry.source === "bedtimer-night-feed"') && appSource.includes('bedtimer-night-(wake|feed)'));
	  const editedBreastTimer = breastTimerEditSaveSim({ left: "7", right: "4", side: "R", nowMs: Date.parse("2026-05-13T10:15:00") });
	  assert("breast timer edit preserves split L/R duration for final log", editedBreastTimer.sec.L === 420 && editedBreastTimer.sec.R === 240 && editedBreastTimer.log.breastL === 7 && editedBreastTimer.log.breastR === 4 && editedBreastTimer.timerStartMs === Date.parse("2026-05-13T10:04:00"), JSON.stringify(editedBreastTimer));
	  const backdatedBreastTimer = breastTimerEditSaveSim({ left: "", right: "", side: "L", start: "10:00", nowMs: Date.parse("2026-05-13T10:15:00") });
	  assert("breast backdated start seeds elapsed duration on selected side", backdatedBreastTimer.sec.L === 900 && backdatedBreastTimer.sec.R === 0 && backdatedBreastTimer.log.breastL === 15, JSON.stringify(backdatedBreastTimer));
	  assert("breast timer pause and resume keep duration authoritative", appSource.includes("function resumeBreastTimer(side)") && appSource.includes("Date.now() - totalSec * 1000") && appSource.includes('localStorage.setItem("breast_startMs",String(timerStartMs))') && appSource.includes("breastActive?pauseBreastTimer():resumeBreastTimer") && appSource.includes("const sideKey = resumeBreastTimer(side);"));
	  const locked530Wake = pauseBedTimerWakeEntrySim("05:29");
  assert("explicit 5am night wake from bed timer stays night", locked530Wake.night === true && locked530Wake.nightLocked === true && locked530Wake._pendingSettle === true && locked530Wake.source === "bedtimer-night-wake", JSON.stringify(locked530Wake));
  assert("live app computes nightLocked before spreading data", appSource.includes("let nightFlag = data.nightLocked ? true : (data.night !== undefined ? !!data.night : _autoNight);") && appSource.includes("const _entryOut = {id:entryId,modifiedAt:_now,...data,night:nightFlag};"));
  assert("live app pauseBedTimer does not classify 5am night wakes as morning wakes", appSource.includes("showToast(\"🌙 Night wake logged. tap Baby sleeping when settled.\"") && !appSource.includes("showToast(_isMorningWake ? \"☀️ Morning wake logged.\""));

  const wakeEditedDays = saveBedtimeWakeTimeSim({
    "2026-05-05": [{ id: "bed", type: "sleep", time: "19:00", night: false }],
    "2026-05-06": [{ id: "stale-wake", type: "wake", time: "08:55", night: false, nightLocked: true, note: "" }],
  }, "2026-05-05", "bed", "09:55");
  const morningWakes = (wakeEditedDays["2026-05-06"] || []).filter(e => e.type === "wake" && !e.night);
  assert("bedtime wake edit keeps the user's 9:55am and removes stale 8:55am", morningWakes.length === 1 && morningWakes[0].time === "09:55", JSON.stringify(morningWakes));
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

function runPartnerSyncSimulations() {
  const cloudOldDays = {};
  const localDays = {};
  const deletedIds = [];
  for (let i = 0; i < 40; i++) {
    const id = "old-" + i;
    cloudOldDays["2026-05-" + String(1 + (i % 4)).padStart(2, "0")] = cloudOldDays["2026-05-" + String(1 + (i % 4)).padStart(2, "0")] || [];
    cloudOldDays["2026-05-" + String(1 + (i % 4)).padStart(2, "0")].push({ id, type: "feed", time: "10:00" });
    if (i < 20) deletedIds.push(id);
    else {
      localDays["2026-05-" + String(1 + (i % 4)).padStart(2, "0")] = localDays["2026-05-" + String(1 + (i % 4)).padStart(2, "0")] || [];
      localDays["2026-05-" + String(1 + (i % 4)).padStart(2, "0")].push({ id, type: "feed", time: "10:00" });
    }
  }
  const localCount = Object.values(localDays).reduce((sum, entries) => sum + entries.length, 0);
  const rawCloudCount = Object.values(cloudOldDays).reduce((sum, entries) => sum + entries.length, 0);
  const filteredCloud = applyChildSyncDeleteTombstonesSim("oliver", { days: cloudOldDays }, deletedIds);
  const filteredCloudCount = Object.values(filteredCloud.days).reduce((sum, entries) => sum + entries.length, 0);
  assert("partner sync overwrite guard ignores deleted cloud entries", localCount < rawCloudCount * 0.7 && localCount >= filteredCloudCount * 0.7, JSON.stringify({ localCount, rawCloudCount, filteredCloudCount }));
  assert("live partner sync writes growth tombstones through legacy family and child docs", appSource.includes("deletedGrowthMeasurements: JSON.stringify(_deletedGrowthMeasurementsForCloud)") && appSource.includes("deletedGrowthMeasurements: deletedGrowthMeasurementsJson"));
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
  assert("clock center can start the displayed upcoming nap before it is overdue", appSource.includes('if (nextEvent && nextEvent.type === "nap") return "nap";') && appSource.includes('if (predictionItem && predictionItem.kind === "nap") return "nap";') && appSource.includes('clockQueuedTimerKind === "nap"') && appSource.includes('try { startNap(); } catch(e) { console.warn("[OBubba] clock face nap start failed", e); }'));
  assert("clock center can start a visible bedtime countdown before it is overdue", appSource.includes('if (nextEvent && (nextEvent.type === "bed" || nextEvent.type === "sleep")) return "sleep";') && appSource.includes('if (predictionItem && predictionItem.kind === "sleep") return "sleep";') && appSource.includes('const queuedIsBedtime = /\\bbedtime\\b/i.test(queuedTitle);') && appSource.includes('queuedIsBedtime ? "sleep"') && appSource.includes('try { logBedtimeNow(); } catch(e) { console.warn("[OBubba] clock face bedtime start failed", e); }'));
  assert("live nap timer starts on calendar today even if another day is selected", appSource.includes("const timerDay = todayStr();") && appSource.includes("if (selDay !== timerDay)") && appSource.includes('localStorage.setItem("nap_start_day",timerDay);') && appSource.includes('firePlanSlotReminders("nap_start", {dayKey:timerDay, napNumber:_napNum2});'));
  assert("first daytime log before morning wake stays visible after Start of New Day", appSource.includes("const[wakePromptContext,setWakePromptContext]=useState(null);") && appSource.includes("const _promptWakeTime = _promptMins.length ? minsToTime(_promptMins[0]) : (data.time || nowTime());") && appSource.includes("setWakePromptContext({time:_promptWakeTime, dayKey:_targetDay, sourceType:type});") && appSource.includes("function logMorningWakeNextDay(wakeTimeOverride, opts)") && appSource.includes("const wakeTime = clockMins(wakeTimeOverride || \"\") !== null ? wakeTimeOverride : nowTime();") && appSource.includes("logMorningWakeNextDay(_wakeTime);"));
  assert("manual night wake catch-up saves to the selected bedtime day", appSource.includes("parents may be catching up on last night's wakes retroactively") && appSource.includes("const _selectedDay = safeDateKey(selDay) || _todayCal;") && appSource.includes("const _selectedHasBed = (d[_selectedDay]||[]).some(e=>e.type===\"sleep\"&&!e.night);") && appSource.includes("targetDay = _selectedHasBed ? _selectedDay : _prevHasBed ? _prevSelected : _selectedDay;") && appSource.includes('source: isPendingWakeDetailSave ? "bedtimer-night-wake" : "manual-night-wake"'));
  assert("active nap timers survive app reload past four hours without silently dropping at six hours", appSource.includes("Clearing at 4h") && appSource.includes("const clockLabNapElapsedSec = (() =>") && appSource.includes("Date.now() - startMsRaw") && appSource.includes("const OB_NAP_TIMER_RESTORE_MAX_HOURS = 16;") && appSource.includes("const maxRestoreHours = isBedTimerRestore ? OB_BED_TIMER_RESTORE_MAX_HOURS : OB_NAP_TIMER_RESTORE_MAX_HOURS") && appSource.includes("elapsedH > maxRestoreHours") && appSource.includes("recordNapTimerDrop(") && !appSource.includes("elapsedH > 4"));
  assert("timer resurrection never rewrites a stale active nap into a zero-length completed nap", appSource.includes("active nap entry is too old to auto-restore; leaving data unchanged for review") && !appSource.includes("found stale active nap entry, auto-closing") && !appSource.includes("{...e, end: e.start, _active: false}"));
  const snapTimerAt = appSource.indexOf("// Snap ALL timers to wall-clock");
  const snapTimerEnd = appSource.indexOf("// 1b. Refresh Live Activity", snapTimerAt);
  const snapTimerBlock = snapTimerAt >= 0 && snapTimerEnd > snapTimerAt ? appSource.slice(snapTimerAt, snapTimerEnd) : "";
  assert("stale timer cleanup clears timer state without inventing log end times", snapTimerBlock.includes("do not invent an end time for the saved log") && !snapTimerBlock.includes("duration: Math.round(elapsed / 60)") && !snapTimerBlock.includes("end: _staleEnd") && !snapTimerBlock.includes("end: _staleEnd2"));
  assert("active nap clock labels show now instead of the capped arc end", appSource.includes('if (item.entry.type === "nap" && isActiveClockNapLab(item.entry)) return entryTimeRangeLab(item.entry);'));
	  assert("clock logs do not fold or label daytime feeds as night-wake settling", appSource.includes("const clockSettlingFeedIsInsideNightSleepLab = (item) =>") && appSource.includes("feedMinute >= 16 * 60 || feedMinute < 6 * 60") && !appSource.includes("feedMinute >= 18 * 60 || feedMinute < 6 * 60 || clockIsInsideSleepCurveLab(item)") && appSource.includes("if (!clockSettlingFeedIsInsideNightSleepLab(item)) return \"\";") && appSource.includes("const clockLogDisplayEntryLab = (item) =>") && appSource.includes("if (clockEntryFallsBeforeBedtimeStartLab(entry, item?.sourceDay)) return {...entry, night:false, nightLocked:false, _clockBeforeBedtime:true};") && appSource.includes("return {...entry, night:false};"));
	  {
	    const bedtimeStart = clockMins("20:15");
	    const beforeBedWake = { type: "wake", time: "19:37", night: true, assistedDuration: 15, assistedType: "milk" };
	    const afterBedWake = { type: "wake", time: "22:15", night: true, assistedDuration: 13, assistedType: "milk" };
	    const overnightWake = { type: "wake", time: "03:32", night: true, assistedDuration: 6, assistedType: "milk" };
	    assert("same-evening wake before logged bedtime is not treated as a night wake", !clockIsNightWakeTimelineEntrySim(beforeBedWake, bedtimeStart));
	    assert("post-bedtime and after-midnight wakes remain night wakes", clockIsNightWakeTimelineEntrySim(afterBedWake, bedtimeStart) && clockIsNightWakeTimelineEntrySim(overnightWake, bedtimeStart));
	    assert("live app guards night-wake classification against same-evening pre-bedtime rows", appSource.includes("const clockEntryFallsBeforeBedtimeStartLab = (entry, sourceDayKey = dayKey) =>") && appSource.includes("if (bedStart < 12 * 60 || entryStart < 12 * 60) return false;") && appSource.includes("return entryStart < bedStart;") && appSource.includes("const clockIsNightWakeTimelineEntryLab = (entry, sourceDayKey = dayKey)") && appSource.includes("isNightWakeTimedLab(item.entry, item.sourceDay)"));
	  }
  assert("night-wake milk contributes to Track and report milk totals", appSource.includes("function isNightWakeMilkFeedEntry(e)") && appSource.includes("function babyMilkAmount(e)") && appSource.includes("clockLogEntriesLab.reduce((sum, entry) => sum + babyMilkAmount(entry), 0)") && appSource.includes("const nightFeedCount=nEs.filter(e=>e.type===\"feed\"||isNightWakeMilkFeedEntry(e)).length"));
  assert("clock log tab backfills every real visible clock dot", appSource.includes("const clockLogRowFromEventLab = (item, rowIndex, allowVisibleFallback = false) =>") && appSource.includes("const clockLogRowKeyLab = (row) =>") && appSource.includes("clockRenderEvents.forEach((item, rowIndex) =>") && appSource.includes("clockLogRowFromEventLab(item, rows.length + rowIndex, true)"));
  assert("wake-to-wake clock renders timed night wakes as visible overnight arcs", appSource.includes("const entryShouldRenderBeforeWakeDayStartLab = (entry, sourceDayKey) =>") && appSource.includes("if (isNightWakeTimedLab(entry, sourceDayKey)) return true;") && appSource.includes("const clockOvernightVisualOptsLab = (entry, sourceDayKey) =>") && appSource.includes("const visualStart = start + 1440;") && appSource.includes("pushVisualEntry(entry, dayKey, clockOvernightVisualOptsLab(entry, dayKey));") && appSource.includes("pushVisualEntry(entry, nextDayKey, clockOvernightVisualOptsLab(entry, nextDayKey));") && appSource.includes("else pushVisualEntry(entry, nextDayKey, {logOnly:true});") && appSource.includes("!item.logOnly && !clockTimelineSettlingFeedKeyLab(item)"));
  {
    const dayKey = "2026-05-09";
    const rows = [
      { entry: { id: "wake", type: "wake", time: "07:00", night: false }, sourceDay: dayKey, start: 420, end: 446 },
      { entry: { id: "nw", type: "wake", time: "05:30", end: "06:39", night: true }, sourceDay: dayKey, start: 330, end: 399 },
      { entry: { id: "nap1", type: "nap", start: "10:10", end: "10:45" }, sourceDay: dayKey, start: 610, end: 645 },
      { entry: { id: "nap2", type: "nap", start: "13:00", end: "13:45" }, sourceDay: dayKey, start: 780, end: 825 },
      { entry: { id: "bed", type: "sleep", time: "19:20" }, sourceDay: dayKey, start: 1160, end: 1440 },
      { entry: { id: "bed-wake", type: "wake", time: "22:10", end: "22:30", night: true }, sourceDay: dayKey, start: 1330, end: 1350 },
    ];
    const windows = clockWakeWindowItemsSim({ dayKey, rows, clockBedOnThisDay: true });
    assert("clock wake windows draw morning wake to Nap 1, Nap 1 to Nap 2, and last nap to bedtime", windows.length === 3 && windows[0].start === 420 && windows[0].end === 610 && windows[1].start === 645 && windows[1].end === 780 && windows[2].start === 825 && windows[2].end === 1160, JSON.stringify(windows));
    const beforeFirstNapOnly = clockWakeWindowItemsSim({ dayKey, rows: rows.slice(0, 3), clockBedOnThisDay: true });
    assert("clock wake windows include explicit morning-wake-to-Nap-1 arcs", beforeFirstNapOnly.length === 1 && beforeFirstNapOnly[0].start === 420 && beforeFirstNapOnly[0].end === 610, JSON.stringify(beforeFirstNapOnly));
    const noMorningWakeRows = rows.filter(row => row.entry.id !== "wake");
    assert("clock wake windows do not let night wakes stand in for missing morning wake", clockWakeWindowItemsSim({ dayKey, rows: noMorningWakeRows.slice(0, 2), clockBedOnThisDay: true }).length === 0);
    const afterNapOngoing = clockWakeWindowItemsSim({ dayKey, rows: rows.slice(0, 4), nowMins: 900, clockBedOnThisDay: false });
    assert("clock wake windows can show current awake time after the latest completed nap before bedtime", afterNapOngoing.length === 3 && afterNapOngoing[2].start === 825 && afterNapOngoing[2].end === 900 && afterNapOngoing[2].isNow, JSON.stringify(afterNapOngoing));
  }
		  {
		    const afterBed = tickNextEventSim({ hasBedtime: true, planPred: { napStart_min: 930 }, bedMins: 1140 });
		    const beforeBed = tickNextEventSim({ hasBedtime: false, planPred: { napStart_min: 930 }, bedMins: 1140 });
		    assert("clock tick clears nap predictions and toast material once bedtime is logged", afterBed.nextEvent === null && afterBed.nextPrediction === null && afterBed.nextNapMins === null && afterBed.napsComplete === true && beforeBed.nextEvent.type === "nap");
		    assert("delayed end-nap toast is guarded by bedtime state", appSource.includes("if (_td2 && _td2.hasBedtime) return;"));
		    const lateDay = tickNextEventSim({ hasBedtime: false, planPred: { napStart_min: 990 }, bedMins: 1200, napsDone: 2, lateDayNapCannotFit: true, fallbackBedMins: 1080 });
			    assert("clock tick promotes bedtime when a late-day remaining nap cannot safely fit", lateDay.nextEvent.type === "bed" && lateDay.nextEvent.timeMins === 1080 && lateDay.nextNapMins === null && lateDay.napsComplete === true && lateDay.napBedConflict === true);
				    assert("live clock has the late-day impossible-nap bedtime fallback", appSource.includes("const _lateDayNapCannotFit =") && appSource.includes("promoting bedtime as the next event"));
				    assert("clock tick recovers a nap prediction when the primary predictor is unavailable", appSource.includes('sourceLabel: "OBubba Sleep Engine fallback"') && appSource.includes("napsDone < expectedNaps && totalNapMins < (napProfile.idealTotalMax || Infinity)"));
				    assert("Today's Plan only stops projecting naps when naps are actually complete", appSource.includes("const _planBudgetExceeded = (tickDataRef.current || {}).napsComplete === true;") && appSource.includes("const _planBudgetExceeded = (tickDataRef.current||{}).napsComplete === true;") && !appSource.includes("const _planBudgetExceeded = !tickDataRef.current.pred"));
				    assert("Today's Plan varies suggested nap lengths and refuses late naps that cannot fit before bedtime", appSource.includes("function plannedNapDurationForPlan") && appSource.includes("function plannedNapFitDurations") && appSource.includes("plannedNapDurationLabel(napDur, _safeAvgNapDur, napIdx, expectedTotal, _ctxR)") && appSource.includes("napStart + _mustFitMinDur + minBedWW > _napFitCeiling") && appSource.includes("plannedNapFitDurations(_safePlannedNapDur, _safeAvgNapDur, w)"));
				    assert("clock bedtime CTA waits for a real bedtime-ready state", appSource.includes("const clockBedtimeActionReady = !!(") && appSource.includes("!clockNextEventIsNap && clockBedtimeActionReady"));
			    assert("clock bedtime tap does not also run endNap and trigger nap toasts", !appSource.includes("logBedtimeNow(); if(napOn) endNap();"));
			  }
	  {
	    const eightHourNight = {
	      "2026-05-08": [{ id: "bed", type: "sleep", time: "22:00", night: false }],
	      "2026-05-09": [{ id: "wake", type: "wake", time: "06:00", night: false }],
	    };
	    const longWakeButGoodSleep = {
	      "2026-05-08": [
	        { id: "bed", type: "sleep", time: "21:00", night: false },
	        { id: "nw", type: "wake", time: "05:30", end: "06:39", night: true },
	      ],
	      "2026-05-09": [{ id: "wake", type: "wake", time: "07:00", night: false }],
	    };
	    const fragmentedNight = {
	      "2026-05-08": [
	        { id: "bed", type: "sleep", time: "20:00", night: false },
	        { id: "w1", type: "wake", time: "21:30", duration: 60, night: true },
	        { id: "w2", type: "wake", time: "23:15", duration: 60, night: true },
	        { id: "w3", type: "wake", time: "01:00", duration: 60, night: true },
	        { id: "w4", type: "wake", time: "03:00", duration: 60, night: true },
	        { id: "w5", type: "wake", time: "05:00", duration: 60, night: true },
	      ],
	      "2026-05-09": [{ id: "wake", type: "wake", time: "06:30", night: false }],
	    };
	    const good = estimateParentSleepFromCompletedNightSim(eightHourNight, "2026-05-08");
	    const longWake = estimateParentSleepFromCompletedNightSim(longWakeButGoodSleep, "2026-05-08");
	    const fragmented = estimateParentSleepFromCompletedNightSim(fragmentedNight, "2026-05-08");
	    const isCritical = e => e && e.parentSleepBlockMin < 4 * 60 && e.totalSleepMin < 6 * 60;
	    assert("wellbeing parent-sleep estimate does not call an 8-hour night under four hours", good && good.totalSleepMin === 480 && good.parentSleepBlockMin === 480 && !isCritical(good), JSON.stringify(good));
	    assert("wellbeing parent-sleep estimate treats a 5:30-6:39 wake as awake time inside a longer sleep night", longWake && longWake.totalSleepMin === 531 && longWake.parentSleepBlockMin === 480 && !isCritical(longWake), JSON.stringify(longWake));
	    assert("wellbeing parent-sleep crisis still catches severely fragmented completed nights", isCritical(fragmented), JSON.stringify(fragmented));
	    assert("wellbeing warning uses completed-night sleep blocks instead of fixed allowance maths", appSource.includes("function estimateParentSleepFromCompletedNight(days, bedtimeDayKey)") && appSource.includes("estimateParentSleepFromCompletedNight(days, dk)") && appSource.includes("4-hour sleep block"));
	  }
  assert("clock Guidance debrief uses the selected clock day's visible night summary", appSource.includes("const clockGuidanceNightKeys = (() =>") && appSource.includes('source:"selected-clock-day"') && appSource.includes("const clockGuidanceNightMemo = (() =>") && appSource.includes("const clockGuidanceVisibleNightSummary = (() =>") && appSource.includes("const clockGuidanceDisplayNightMemo = clockGuidanceVisibleNightSummary") && appSource.includes("intelligenceSignals:clockGuidanceVisibleNightSummary.intelligenceSignals") && appSource.includes("sameMemoNight && _nightDiagnosisMemo && !clockGuidanceVisibleNightSummary") && appSource.includes("const clockGuidanceNightDiagnosis = (() =>") && appSource.includes("const clockLastNightWakeCount = Number(clockGuidanceDisplayNightMemo?.wakeCount || 0);") && !appSource.includes("const clockLastNightWakeCount = Number(_lastNightMemo?.wakeCount || 0);"));
  assert("clock prediction layer suppresses stale future nap arcs once bedtime is the selected next event", appSource.includes("const clockShouldShowStandaloneNapPredictionLab = (mins) =>") && appSource.includes('nextEvent.type === "bed" || nextEvent.type === "sleep"') && appSource.includes("td.napsComplete && !td.bridgeNapNeeded") && appSource.includes("td.bridgeNapNeeded || (nextEvent && nextEvent.type === \"nap\")") && appSource.includes('typeof td.nextNapMins === "number" && clockShouldShowStandaloneNapPredictionLab(td.nextNapMins)'));
  assert("clock prediction simulation keeps bedtime-only displays free of stale nap arcs",
    !clockShouldShowStandaloneNapPredictionSim({ nextEvent: { type: "bed" }, td: { nextNapMins: 1100 }, tdBedMins: 1102, mins: 1100 }) &&
    !clockShouldShowStandaloneNapPredictionSim({ nextEvent: null, td: { napsComplete: true, bridgeNapNeeded: false }, tdBedMins: 1102, mins: 1100 }) &&
    clockShouldShowStandaloneNapPredictionSim({ nextEvent: { type: "nap" }, td: { nextNapMins: 960 }, tdBedMins: 1140, mins: 960 }) &&
    clockShouldShowStandaloneNapPredictionSim({ nextEvent: null, td: { bridgeNapNeeded: true }, tdBedMins: 1140, mins: 1030 })
  );
  assert("clock dot labels distinguish pump from bottle feeds", appSource.includes('entry.feedType === "pump" ? "Pump"'));
  assert("clock close dot ticks fan out and stagger nearby logs by length", appSource.includes("const clockCloseMomentWindowLab = 22") && appSource.includes("const clockCloseMomentClusterLab = (item) =>") && appSource.includes("closeIndex") && appSource.includes("closeCount") && appSource.includes("const baseDotAngle = (item.start % 1440) / 1440 * 360;") && appSource.includes("baseDotAngle + (closeIndex - (closeCount - 1) / 2) * 8") && appSource.includes("const clockCloseDotTickGeometryLab = (dotPoint, isNow = false) =>") && appSource.includes("const maxDepth = 12") && appSource.includes("const minDepth = 4.5"));
	  assert("sleep wake counts use shared deduped night events beyond the main summary", appSource.includes("const nightEvents = getNightWakeEventsForDay(days, k, nextCalDay(k));") && appSource.includes("const _wakes = getNightWakeEventsForDay(days, _dk, _nextDk).filter(hasValidTime);") && appSource.includes("A settling feed inside a wake is the same wake.") && appSource.includes('if (_isNightFeedSettlingEntry(last) && last.type !== "wake" && e.type === "wake" && forwardGap !== null)') && appSource.includes("const threshold = Math.max(90, wakeDur + 30);") && appSource.includes("if (entryIsWakeContext && !feedAfterWake) return;"));
	  assert("night-wake comfort analysis counts merged milk or breast wake rows as fed", appSource.includes('const eventFed = _isMilkOrBreastFeedEntry(w) || classifySettleMethod(w) === "milk" || classifySettleMethod(w) === "breast";') && appSource.includes("fed: eventFed || fedAfter"));
	  const analyzeAt = appSource.indexOf("function analyzeLastNight(days, bedtimeDayKey, morningDayKey)");
  const analyzeEnd = appSource.indexOf("function resolveCompletedSleepSummaryKeys", analyzeAt);
  const analyzeBlock = analyzeAt > -1 && analyzeEnd > analyzeAt ? appSource.slice(analyzeAt, analyzeEnd) : "";
  assert("analyzeLastNight uses the shared night-wake collector without a second local dedupe", analyzeBlock.includes("const nightWakesRaw = collectLastNightWakeEntries(days, bedtimeDayKey, morningDayKey);") && !analyzeBlock.includes("const _dedupSorted") && !analyzeBlock.includes("const _nightRaw"));
  assert("bedtime wake-time saves replace stale generated morning wakes", appSource.includes("function shouldReplaceBedtimeWakeEntry") && appSource.includes('source:"bedtime-wake-time"') && appSource.includes("bedEntryId:e.id") && appSource.includes("!shouldReplaceBedtimeWakeEntry(x, e.id, form.wakeTime)") && appSource.includes("if(_wakeEntry) {"));
  assert("clock display quarantines implausibly long completed naps without rewriting saved logs", appSource.includes("const TRACK_RELIABLE_NAP_MAX_MINS = 300;") && appSource.includes("const CLOCK_NAP_REVIEW_MAX_MINS = TRACK_RELIABLE_NAP_MAX_MINS;") && appSource.includes("const clockNapExplicitDurationMinsLab = (entry) =>") && appSource.includes("const clockNapHasRawImplausibleSpanLab = (entry) =>") && appSource.includes("return clockNapHasRawImplausibleSpanLab(entry) && !clockNapExplicitDurationMinsLab(entry);") && appSource.includes("!clockNapExplicitDurationMinsLab(entry) &&") && appSource.includes("getMergedCompletedDayNaps(clockLogEntriesLab.filter(e => !clockNapNeedsTimerCheckLab(e) && !clockIsLateLongNapSleepLab(e)).map(clockNapResolvedEntryLab))") && appSource.includes("minDiff(e.start,e.end)>=TRACK_RELIABLE_NAP_MAX_MINS") && appSource.includes('"Nap · time needs review"') && appSource.includes('"End time needs review"'));
  assert("long late nap timers stay naps instead of being re-labelled as bedtime", appSource.includes("Bedtime is only created by bedtime flows.") && appSource.includes("Nap saved as a nap. edit the stop time if the timer was left running.") && !appSource.includes("long_nap_converted_to_bedtime") && !appSource.includes("logBedtimeNow({dayKey:_napDay,time:_endNapStartT});") && !appSource.includes('showToast("🌙 Converted to bedtime"'));
  assert("closed historical days are not auto-reclassified by launch or sync repairs", appSource.includes("function isClosedHistoricalAppDay(dayKey)") && appSource.includes("function autoClassifyOpenAppDay(dayKey, dayEntries, prevDayEntries)") && appSource.includes("if(isClosedHistoricalAppDay(dk)) return;") && appSource.includes("reclassifiedDays[date] = autoClassifyOpenAppDay(date, mergedDays[date]") && appSource.includes("reclassifiedDays[dayKey] = autoClassifyOpenAppDay(dayKey, mergedDays[dayKey]"));
  assert("clock bedtime arc follows the live bedtime log even when stored timer start is stale", appSource.includes("const activeSleepEntry = [...entriesForDay]") && appSource.includes(".filter(isClockLabLoggedBedtime)") && appSource.includes("const activeSleepStart = activeSleepEntry?.time || activeSleepEntry?.start || bedTimerStart || \"\";") && appSource.includes("const activeEntryMatches = !activeSleepEntry || entry.id === activeSleepEntry.id || entry.time === activeSleepEntry.time || entry.start === activeSleepEntry.start;") && appSource.includes("const activeEndTime = (() =>") && appSource.includes("return {time:activeEndTime, mins:Math.max(start + 6, start + clockLabMinDiff(rawStart, activeEndTime)), source:bedPaused ? \"paused\" : \"active\"};") && appSource.includes("const clockLabBedWallElapsedSec = (() =>") && !appSource.includes("window._bedArcDiag") && !appSource.includes("[Clock Nap Debug]"));
  assert("paused bedtime stops widget and partner active timer exports", appSource.includes("function forceWidgetTimerPaused(label = \"Night wake\")") && appSource.includes("const _bedPausedForCloud = localStorage.getItem(\"bed_paused\") === \"1\";") && appSource.includes("const _bedActive = !!localStorage.getItem(\"bed_timer_day\") && !_bedPausedForCloud;") && appSource.includes("forceWidgetTimerPaused(\"Night wake\");") && appSource.includes("const _partnerPendingBedWake = (() =>") && appSource.includes("Partner paused bedtime for a night wake"));
  assert("pending bedtime night wakes restore the paused timer and form from the real pause time", appSource.includes("Resurrecting paused bed timer") && appSource.includes("localStorage.setItem(\"bed_wake_entry_id\", _pendingBedWake.id)") && appSource.includes("forceWidgetTimerPaused(\"Night wake\")") && appSource.includes("const hasLivePendingWake = (()=>") && appSource.includes("if (hasLivePendingWake && openPendingOrNewNightWakeDetails()) return;") && appSource.includes("if (!pendingEntry) {") && appSource.includes("source === \"bedtimer-night-wake\""));
  assert("nap counts use saved completed nap logs while totals still use merged safe duration", appSource.includes("function getReliableCompletedDayNapLogs(entries, maxMins = CARE_RELIABLE_NAP_MAX_MINS)") && appSource.includes("const completedNapLogsForTiming = getReliableCompletedDayNapLogs(todayEntries)") && appSource.includes("const napsDone = Math.max(completedNapLogsForTiming.length, _mergedNaps.length);") && appSource.includes("completedNapLogsForTiming.forEach(n =>") && appSource.includes("const _sleepNapLogs = getReliableCompletedDayNapLogs(_sleepDayEntries);") && appSource.includes("Day sleep logged: {_sleepNapLogs.length} nap") && appSource.includes("const _rawToday = getReliableCompletedDayNapLogs(days[selDay]||[]);") && appSource.includes("const _yNapLogs = getReliableCompletedDayNapLogs(_yEnt);") && appSource.includes("const _yNapCount = Math.max(_yNapLogs.length, _yNaps.length);") && appSource.includes("Naps were on target (\" + _yNapCount + \" nap") && appSource.includes("_napNotes.push(_yNapCount + \" nap"));
  assert("overdue nap widget targets stay in the past instead of rolling to tomorrow", appSource.includes("const _tsForMins2 = (m, keepPast = false) =>") && appSource.includes("if (!keepPast && d.getTime() < Date.now() - 5*60*1000) d.setDate(d.getDate() + 1);") && appSource.includes("const _nextEventNapOverdue = !!(") && appSource.includes("targetMs: _tsForMins2(Math.round(_planPred.napStart_min), !!_nextEventNapOverdue)") && appSource.includes('if (_ne && _ne.type === "nap" && (_ne.overdue || (_rawTargetMs && _rawTargetMs <= Date.now())))'));
  assert("night fireflies use the dedicated hope kindness message", appSource.includes("const clockFireflyKindnessMessage = \"Fireflies are a symbol of hope. Each firefly you see is another parent up at the same time lighting your sky with hope 🤍\"") && appSource.includes("(!clockLabIsDay && clockPresenceGlyphs.length) ? clockFireflyKindnessMessage"));
  assert("pump logs open the pump edit form from clock and log rows", appSource.includes('feedType==="pump"?"Edit Pump"') && appSource.includes('["milk","breast","pump","solids"].map') && appSource.includes('pumpDuration:entry.pumpDuration?String(entry.pumpDuration):""') && appSource.includes('pumpDuration:Math.max(0,parseInt(form.pumpDuration, 10)||0),night:form.night==="yes"'));
  assert("Grow activity suggestions avoid small hard food choking-risk wording", appSource.includes('title:"Pick-up Practice"') && appSource.includes("without using small hard foods") && !appSource.includes("Scatter small puffs or cereal"));
  assert("Account Share & Sync can normalise participants outside App scope", appSource.includes("function normaliseUsername(value)") && appSource.includes("function ChildSyncCard({ child, cid, code, isShared, participants") && appSource.includes('normaliseUsername((localStorage.getItem("family_username") || "").toString())') && !appSource.includes("const normaliseUsername = (u) => u.trim()"));
  assert("Food Journal renders the same weaning evidence counted by the dashboard", appSource.includes("(weaningEvidence||weaning||[]).length === 0") && appSource.includes("[...(weaningEvidence||weaning||[])]") && appSource.includes("const _unique = new Set(_journalRows.map(w=>normaliseWeaningName(w && w.food)).filter(Boolean)).size;") && appSource.includes("const _toolWeaningLog = weaningEvidence || weaning || [];") && appSource.includes("const _toolUniqueFoods = new Set(_toolWeaningLog.map(w=>normaliseWeaningName(w && w.food)).filter(Boolean)).size;") && appSource.includes('sub:_toolUniqueFoods+" food"+(_toolUniqueFoods===1?"":"s")+" tried"') && appSource.includes("_sourceEntry && _sourceEntry.type === \"feed\" && _sourceEntry.feedType === \"solids\"") && appSource.includes("openEdit(_sourceEntry);") && appSource.includes("Logged from Track solids") && !appSource.includes('?"--"'));
  assert("Track solids display uses the food field when note is absent", appSource.includes("subDetail = e.food || e.note || e.name || e.title || e.recipe || null;") && appSource.includes('clockLogTextLab(entry.food || entry.note || entry.name || entry.title || entry.recipe || "solids", 34)') && appSource.includes('const editNote = entry.feedType === "solids" ? (entry.note || entry.food || entry.name || entry.title || "") : (entry.note || "");'));
  const ghostNapCleanupAt = appSource.indexOf("// Clean up ghost nap entries");
  const ghostNapCleanupEnd = appSource.indexOf("// One-time dedup sweep", ghostNapCleanupAt);
  const ghostNapCleanup = ghostNapCleanupAt > -1 && ghostNapCleanupEnd > ghostNapCleanupAt ? appSource.slice(ghostNapCleanupAt, ghostNapCleanupEnd) : "";
  assert("completed nap history is never rewritten into a live timer stub", ghostNapCleanup.includes("if (hasCompletedNapSpan(e) && e._active && Number(e.duration) > 0)") && ghostNapCleanup.includes("return {...e, _active: false};") && ghostNapCleanup.includes("return e;") && !ghostNapCleanup.includes("end:e.start") && !ghostNapCleanup.includes("duration:0"));
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

function runPredictionSimulations() {
  // Mirror the app's wake window table exactly
  function getWakeWindow(ageWeeks) {
    if (typeof ageWeeks !== "number" || isNaN(ageWeeks) || ageWeeks < 0) return { min: 30, max: 90 };
    const months = ageWeeks / 4.33;
    const stages = [[1.39,30,90],[3,45,90],[5,75,120],[7,120,180],[9,150,210],[12,180,240],[15,210,270],[19,270,330],[36,300,360],[48,360,480],[Infinity,420,720]];
    const idx = Math.max(0, stages.findIndex(s => months < s[0]));
    return { min: stages[idx][1], max: stages[idx][2] };
  }
  function getAgeNapProfile(ageWeeks) {
    if (!ageWeeks && ageWeeks !== 0) return { expectedNaps:3, idealTotalMin:120, idealTotalMax:240 };
    const months = ageWeeks / 4.33;
    if (ageWeeks < 6) return { expectedNaps:6, idealTotalMin:240, idealTotalMax:360 };
    if (ageWeeks < 8) return { expectedNaps:5, idealTotalMin:220, idealTotalMax:340 };
    if (months < 3) return { expectedNaps:4, idealTotalMin:180, idealTotalMax:300 };
    if (months < 5) return { expectedNaps:3, idealTotalMin:150, idealTotalMax:240 };
    if (months < 7) return { expectedNaps:3, idealTotalMin:120, idealTotalMax:210 };
    if (months < 9) return { expectedNaps:2, idealTotalMin:120, idealTotalMax:210 };
    if (months < 12) return { expectedNaps:2, idealTotalMin:120, idealTotalMax:180 };
    if (months < 15) return { expectedNaps:2, idealTotalMin:90, idealTotalMax:150 };
    if (ageWeeks < 78) return { expectedNaps:1, idealTotalMin:60, idealTotalMax:120 };
    return { expectedNaps:1, idealTotalMin:60, idealTotalMax:90 };
  }
  // Simulate a day: given wake time, age, nap count — predict nap times + bedtime
  function simulateDay(ageWeeks, wakeMins, napCount, napDurMin) {
    const ww = getWakeWindow(ageWeeks);
    const mid = Math.round((ww.min + ww.max) / 2);
    const naps = [];
    let cursor = wakeMins;
    for (let i = 0; i < napCount; i++) {
      const napStart = cursor + mid;
      const napEnd = napStart + napDurMin;
      naps.push({ start: napStart, end: napEnd });
      cursor = napEnd;
    }
    const bedtime = cursor + mid;
    return { naps, bedtime, ww, lastWW: mid };
  }

  // ── CONSULTANT REFERENCE (Taking Cara Babies / Sleep Foundation / NHS) ──
  // These are the gold standard wake window ranges by age.
  const consultantRanges = [
    { label: "Newborn (2wk)", ageWeeks: 2, wwMin: 30, wwMax: 90, napCount: [5,6], bedRange: [18*60, 22*60] },
    { label: "6 weeks", ageWeeks: 6, wwMin: 45, wwMax: 90, napCount: [4,5], bedRange: [18*60, 22*60] },
    { label: "3 months", ageWeeks: 13, wwMin: 75, wwMax: 120, napCount: [3,4], bedRange: [18*60, 21*60] },
    { label: "5 months", ageWeeks: 22, wwMin: 120, wwMax: 180, napCount: [3], bedRange: [18*60, 20*60] },
    { label: "7 months", ageWeeks: 30, wwMin: 150, wwMax: 210, napCount: [2,3], bedRange: [18*60, 20*60] },
    { label: "9 months", ageWeeks: 39, wwMin: 180, wwMax: 240, napCount: [2], bedRange: [18*60, 20*60] },
    { label: "12 months", ageWeeks: 52, wwMin: 180, wwMax: 270, napCount: [1,2], bedRange: [18*60, 20*60] },
    { label: "14 months", ageWeeks: 61, wwMin: 210, wwMax: 270, napCount: [1,2], bedRange: [18*60, 20*60] },
    { label: "18 months", ageWeeks: 78, wwMin: 270, wwMax: 330, napCount: [1], bedRange: [18*60+30, 20*60] },
    { label: "24 months", ageWeeks: 104, wwMin: 300, wwMax: 360, napCount: [1], bedRange: [18*60+30, 20*60+30] },
  ];

  consultantRanges.forEach(ref => {
    const ww = getWakeWindow(ref.ageWeeks);
    const profile = getAgeNapProfile(ref.ageWeeks);
    // Wake window range should overlap with consultant range
    const wwOverlaps = ww.max >= ref.wwMin && ww.min <= ref.wwMax;
    assert(ref.label + " wake window overlaps consultant range (" + ww.min + "-" + ww.max + " vs " + ref.wwMin + "-" + ref.wwMax + ")",
      wwOverlaps, "app=" + ww.min + "-" + ww.max + " consultant=" + ref.wwMin + "-" + ref.wwMax);
    // Nap count should match one of the expected values
    assert(ref.label + " nap count matches consultant (" + profile.expectedNaps + " vs " + ref.napCount.join("/") + ")",
      ref.napCount.includes(profile.expectedNaps), "app=" + profile.expectedNaps + " consultant=" + ref.napCount.join("/"));
  });

  // ── SCENARIO SIMULATIONS: Different mums, different wake times ──
  const scenarios = [
    { label: "Early riser 6mo (wake 6:00, 3 naps)", ageWeeks: 26, wakeMins: 360, napCount: 3, napDur: 45 },
    { label: "Late riser 6mo (wake 8:00, 3 naps)", ageWeeks: 26, wakeMins: 480, napCount: 3, napDur: 45 },
    { label: "Early riser 9mo (wake 6:00, 2 naps)", ageWeeks: 39, wakeMins: 360, napCount: 2, napDur: 75 },
    { label: "Late riser 9mo (wake 8:00, 2 naps)", ageWeeks: 39, wakeMins: 480, napCount: 2, napDur: 75 },
    { label: "Early riser 14mo (wake 6:00, 2 naps)", ageWeeks: 61, wakeMins: 360, napCount: 2, napDur: 60 },
    { label: "Late riser 14mo (wake 8:00, 2 naps)", ageWeeks: 61, wakeMins: 480, napCount: 2, napDur: 60 },
    { label: "Early riser 14mo (wake 6:00, 1 nap)", ageWeeks: 61, wakeMins: 360, napCount: 1, napDur: 120 },
    { label: "18mo single nap (wake 7:00)", ageWeeks: 78, wakeMins: 420, napCount: 1, napDur: 90 },
    { label: "2yr single nap (wake 7:00)", ageWeeks: 104, wakeMins: 420, napCount: 1, napDur: 90 },
    { label: "Newborn 4wk (wake 7:00, 5 naps)", ageWeeks: 4, wakeMins: 420, napCount: 5, napDur: 50 },
  ];

  scenarios.forEach(s => {
    const sim = simulateDay(s.ageWeeks, s.wakeMins, s.napCount, s.napDur);
    // Apply the same clamp the real app uses (17:00-23:30)
    const clampedBed = Math.max(17 * 60, Math.min(23 * 60 + 30, sim.bedtime));
    const bedH = Math.floor(clampedBed / 60);
    const bedM = clampedBed % 60;
    const bedStr = String(bedH).padStart(2, "0") + ":" + String(bedM).padStart(2, "0");
    const bedSane = clampedBed >= 17 * 60 && clampedBed <= 23 * 60 + 30;
    assert(s.label + " predicted bedtime is sane (" + bedStr + ")", bedSane, bedStr);
    // Last WW should be within the age wake window
    assert(s.label + " last WW within age range (" + sim.lastWW + "m)",
      sim.lastWW >= sim.ww.min && sim.lastWW <= sim.ww.max, sim.lastWW + " vs " + sim.ww.min + "-" + sim.ww.max);
    // Naps should not start before wake time
    if (sim.naps.length) {
      assert(s.label + " first nap after wake (" + sim.naps[0].start + " > " + s.wakeMins + ")",
        sim.naps[0].start > s.wakeMins);
    }
    // Total nap time should be reasonable
    const totalNapMins = sim.naps.reduce((sum, n) => sum + (n.end - n.start), 0);
    const profile = getAgeNapProfile(s.ageWeeks);
    assert(s.label + " total nap time within profile (" + totalNapMins + "m vs " + profile.idealTotalMin + "-" + profile.idealTotalMax + ")",
      totalNapMins >= profile.idealTotalMin * 0.5 && totalNapMins <= profile.idealTotalMax * 1.5,
      totalNapMins + " vs " + profile.idealTotalMin + "-" + profile.idealTotalMax);
  });

  // ── EDGE CASES ──
  // Very early wake + long wake windows should not push bedtime past 20:30 for babies
  const earlyLongWW = simulateDay(39, 330, 2, 75); // 5:30 wake, 9mo
  assert("5:30am wake 9mo bedtime before 20:30", earlyLongWW.bedtime <= 20*60+30, minsToClock(earlyLongWW.bedtime));

  // Very late wake should not push bedtime past 23:00
  const lateWake = simulateDay(26, 540, 3, 45); // 9:00 wake, 6mo
  assert("9:00am wake 6mo bedtime before 23:00", lateWake.bedtime <= 23*60, minsToClock(lateWake.bedtime));

  // Single nap 18mo should have bedtime 18:30-20:30
  const singleNap18 = simulateDay(78, 420, 1, 90); // 7:00 wake
  assert("18mo single nap bedtime in nap window (18:30-20:30)",
    singleNap18.bedtime >= 18*60+30 && singleNap18.bedtime <= 20*60+30,
    minsToClock(singleNap18.bedtime));

  // ── VERIFY APP SOURCE USES SAME TABLES ──
  assert("app wake window table matches simulation (spot check 9mo)",
    appSource.includes("[9,    150, 210]") || appSource.includes("[9, 150, 210]"),
    "9mo stage missing from app wake window table");
  assert("app wake window table matches simulation (spot check 15mo)",
    appSource.includes("[15,   210, 270]") || appSource.includes("[15, 210, 270]"),
    "15mo stage missing from app wake window table");
  assert("app nap profile uses consultant-aligned nap counts",
    appSource.includes("expectedNaps:2") && appSource.includes("expectedNaps:1") && appSource.includes("expectedNaps:3"));
  // Verify bedtime prediction applies night shift AND best-night anchor
  assert("bedtime prediction applies night diagnosis shift",
    appSource.includes("_mins += _nightShift || 0;") && appSource.includes("_nightShift"));
  assert("bedtime prediction blends with best-night anchor",
    appSource.includes("_mins * 0.8 + _bestNightBed * 0.2"));
  assert("bedtime prediction clamps to 17:00-23:30",
    appSource.includes("if (_mins < 17 * 60) _mins = 17 * 60") && appSource.includes("if (_mins > 23 * 60 + 30) _mins = 23 * 60 + 30"));
  // Verify false start root cause stabilises bedtime
	  assert("sleep consultation engine and false start analyzer exist and stabilise bedtime",
	    appSource.includes("function runSleepConsultation(") &&
	    appSource.includes("function diagnoseFalseStartRootCause(") &&
	    appSource.includes("function falseStartFeedResettleAdvice(") &&
		    appSource.includes("function activateFalseStartSchedulePlan(") &&
		    appSource.includes("function chooseBubbaRhythmForFalseStarts(") &&
		    appSource.includes("Back to Bubba rhythm") &&
		    appSource.includes("Clock and Today's Plan are using the adaptive sleep engine again, not the 7-night schedule.") &&
		    appSource.includes("tickDataRef.current = {};") &&
		    appSource.includes("data-testid=\"false-start-plan-choice\"") &&
	    appSource.includes("data-testid=\"false-start-plan-today-linked\"") &&
	    appSource.includes("data-testid=\"false-start-plan-clock-linked\"") &&
	    appSource.includes("if (!age || !days || !activeFalseStartPlan || activeFalseStartPlan.mode !== \"schedule\") return null;") &&
	    appSource.includes("_applyNightAdjustments(_nightDiagnosisMemo, _todayKey, days, {ageWeeks:_nightAdjustmentAgeWeeks})") &&
		    appSource.includes("runSleepConsultation(days, dayKey, _ageWeeks, null)") &&
		    appSource.includes("scheduleOverride, falseStartPlan, trialTick") &&
		    appSource.includes("_shift = 0; // full consultation active") &&
	    appSource.includes("_shift = 0; // false start stabiliser") &&
	    appSource.includes("bedtimeInconsistent") &&
	    !appSource.includes("This is almost always about sleep pressure, not hunger.") &&
	    !appSource.includes("a feed within 1–2 hours of bedtime is almost never hunger"));
  assert("single-night false-start diagnosis does not label an in-range or long final wake window as undertired",
    appSource.includes("const _minWW = _ctx.ageMinWW || 0;") &&
    appSource.includes("const _looksUndertired = _lastWW > 0 && _minWW > 0 && _lastWW < _minWW;") &&
    appSource.includes('type: _looksUndertired ? "undertired" : "false_start"') &&
    appSource.includes('title: _looksUndertired ? "Looks undertired" : "False start after bedtime"') &&
    !appSource.includes('type: (_lastWW > 0 && _maxWW > 0) ? "undertired" : "false_start"'));
  assert("sleep consultation uses reliable nap logs for false-start root-cause metrics",
    appSource.includes("const naps = getReliableCompletedDayNaps(ent, TRACK_RELIABLE_NAP_MAX_MINS);") &&
    appSource.includes("const napMins = naps.reduce((s,n) => s + Math.max(0, minDiff(n.start, n.end) || 0), 0);") &&
    appSource.includes("const napTotalMins = naps.reduce((s, n) => s + Math.max(0, minDiff(n.start, n.end) || 0), 0);") &&
    appSource.includes("const wake = findMorningWake(ent) || findMorningWake(morningEnt);"));
	}

console.log("\nOBubba user simulation audit");
console.log("============================\n");
runNightSimulations();
runCarerSimulations();
runPartnerSyncSimulations();
runPredictionSimulations();
runSourceWiringSimulations();
runEventHandlerBindingAudit();

if (failures > 0) {
  console.error("\nUser simulation audit failed with " + failures + " issue(s).");
  process.exit(1);
}

console.log("\nUser simulation audit passed.");
