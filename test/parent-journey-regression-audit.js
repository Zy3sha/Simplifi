#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.jsx"), "utf8");

let failures = 0;
let nextId = 1;

function assert(name, condition, detail) {
  if (!condition) {
    failures++;
    console.error("FAIL " + name + (detail ? " :: " + detail : ""));
    return;
  }
  console.log("ok " + name);
}

function uid(prefix = "e") {
  return prefix + "-" + nextId++;
}

function clockMins(value) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(value || "").trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isInteger(h) || !Number.isInteger(min) || h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

function minsToClock(mins) {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
}

function dayShift(dayKey, delta) {
  const d = new Date(dayKey + "T12:00:00");
  d.setDate(d.getDate() + delta);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function clockDateMs(dayKey, time) {
  return Date.parse(dayKey + "T" + time + ":00");
}

function diffMins(start, end) {
  const s = clockMins(start);
  const e = clockMins(end);
  if (s === null || e === null) return 0;
  return e >= s ? e - s : e + 1440 - s;
}

function normaliseUsername(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
}

function safeBreastMinutes(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(Math.round(n * 2) / 2, 24 * 60);
}

function safeSide(side) {
  return side === "R" || side === "right" ? "R" : "L";
}

function createNewAccountJourney({ username, babyName, dob, feedingMode, dayBoundary }) {
  const account = {
    username: normaliseUsername(username),
    familyUsername: normaliseUsername(username),
    trialStartedAtClient: "2026-05-13T08:00:00.000Z",
    trialFirstInstallAtClient: "2026-05-13T08:00:00.000Z",
    trialDeviceKey: "device-key-for-sim",
    trialUsed: false,
    appTourPending: "new_account",
    dayBoundary,
    children: {},
    activeChildId: normaliseUsername(babyName) || "baby",
  };
  account.children[account.activeChildId] = {
    id: account.activeChildId,
    name: babyName,
    dob,
    feedingMode,
    day1Profile: {
      concerns: feedingMode === "breast" ? ["feeding"] : ["feeding", "sleep"],
      factors: feedingMode === "combo" ? ["mixed_feeding"] : ["breastfeeding"],
      safety: ["none"],
    },
    days: {},
  };
  return account;
}

function createJourney(opts) {
  const account = createNewAccountJourney(opts);
  const child = account.children[account.activeChildId];
  return {
    account,
    child,
    days: child.days,
    dayBoundary: opts.dayBoundary,
    selectedDay: opts.startDay,
    today: opts.startDay,
    bedTimerDay: null,
    bedTimerStart: "",
    bedPaused: false,
    bedPauseStartMs: 0,
    bedWakeEntryId: null,
    lastBreastSide: null,
    breast: {
      active: false,
      side: null,
      startTime: "",
      startDay: "",
      startMs: 0,
      segmentStartMs: 0,
      sec: { L: 0, R: 0 },
    },
    activeNapId: null,
    deletedEntryIds: new Set(),
  };
}

function ensureDay(state, dayKey) {
  state.days[dayKey] = state.days[dayKey] || [];
  return state.days[dayKey];
}

function addEntry(state, dayKey, entry) {
  const out = { id: entry.id || uid(), modifiedAt: entry.modifiedAt || 1, ...entry };
  ensureDay(state, dayKey).push(out);
  return out;
}

function entries(state, dayKey) {
  return state.days[dayKey] || [];
}

function findEntry(state, id) {
  for (const [dayKey, list] of Object.entries(state.days)) {
    const found = (list || []).find(e => e && e.id === id);
    if (found) return { dayKey, entry: found };
  }
  return null;
}

function editEntry(state, id, patch) {
  const found = findEntry(state, id);
  if (!found) return null;
  Object.assign(found.entry, patch, { modifiedAt: (found.entry.modifiedAt || 0) + 1 });
  if (found.entry.type === "nap" && found.entry.start && Number.isFinite(Number(found.entry.durationMins))) {
    found.entry.end = minsToClock((clockMins(found.entry.start) || 0) + Number(found.entry.durationMins));
  }
  return found.entry;
}

function deleteEntry(state, id) {
  for (const [dayKey, list] of Object.entries(state.days)) {
    const next = (list || []).filter(e => e && e.id !== id);
    if (next.length !== list.length) {
      state.days[dayKey] = next;
      state.deletedEntryIds.add(id);
      return true;
    }
  }
  return false;
}

function findMorningWake(list) {
  return (list || [])
    .filter(e => e && e.type === "wake" && !e.night && !(e.nightLocked && e.night !== false) && clockMins(e.time) !== null)
    .filter(e => {
      const m = clockMins(e.time);
      return m >= 5 * 60 && m < 13 * 60;
    })
    .sort((a, b) => clockMins(a.time) - clockMins(b.time))[0] || null;
}

function findBedtime(list) {
  return (list || [])
    .filter(e => e && e.type === "sleep" && !e.night && clockMins(e.time || e.start) !== null)
    .filter(e => clockMins(e.time || e.start) >= 12 * 60)
    .sort((a, b) => clockMins(b.time || b.start) - clockMins(a.time || a.start))[0] || null;
}

function visibleDay(state, actualToday) {
  if (state.dayBoundary !== "wake") return actualToday;
  if (findMorningWake(entries(state, actualToday))) return actualToday;
  const bedDay = state.bedTimerDay || dayShift(actualToday, -1);
  if (bedDay < actualToday && findBedtime(entries(state, bedDay))) return bedDay;
  return actualToday;
}

function routeNightDay(state, actualDay) {
  return state.dayBoundary === "wake" && state.bedTimerDay ? state.bedTimerDay : actualDay;
}

function startBedTimer(state, dayKey, time) {
  state.today = dayKey;
  state.selectedDay = dayKey;
  state.bedTimerDay = dayKey;
  state.bedTimerStart = time;
  state.bedPaused = false;
  return addEntry(state, dayKey, { type: "sleep", time, night: false, source: "bedtimer" });
}

function morningWakeDayForBedTimer(state, wakeTime, bedDay) {
  const bedtime = findBedtime(entries(state, bedDay));
  const bedMins = bedtime ? clockMins(bedtime.time || bedtime.start) : null;
  const wakeMins = clockMins(wakeTime);
  if (bedMins !== null && wakeMins !== null && wakeMins < bedMins) return dayShift(bedDay, 1);
  if (bedDay < state.today && wakeMins !== null && wakeMins >= 5 * 60) return dayShift(bedDay, 1);
  return state.today;
}

function logMorningWakeNextDay(state, time, opts = {}) {
  const bedDay = opts.bedDay || state.bedTimerDay || state.selectedDay;
  const targetDay = opts.targetDay || morningWakeDayForBedTimer(state, time, bedDay);
  const wake = addEntry(state, targetDay, {
    type: "wake",
    time,
    night: false,
    nightLocked: true,
    source: "bedtime-wake-time",
    bedEntryId: findBedtime(entries(state, bedDay))?.id || "",
  });
  state.today = targetDay;
  state.selectedDay = targetDay;
  state.bedTimerDay = null;
  state.bedTimerStart = "";
  state.bedPaused = false;
  state.bedWakeEntryId = null;
  return wake;
}

function quickAddLog(state, type, data, actualDay = state.today) {
  const clock = data.time || data.start || "00:00";
  const mins = clockMins(clock);
  const isExplicitNight = !!(data.night || data.nightLocked);
  const isImplicitNight = state.dayBoundary === "wake" && mins !== null && mins < 6 * 60 && !!state.bedTimerDay && !isExplicitNight;
  const isNightEntry = isExplicitNight || isImplicitNight;
  const targetDay = data._targetDayOverride || (isNightEntry ? routeNightDay(state, actualDay) : state.selectedDay);
  const entry = addEntry(state, targetDay, { ...data, type, night: isNightEntry ? true : !!data.night });
  return entry;
}

function pauseBedTimer(state, time, actualDay = state.today) {
  if (!state.bedTimerDay) return null;
  const dayKey = routeNightDay(state, actualDay);
  const pending = addEntry(state, dayKey, {
    type: "wake",
    time,
    night: true,
    nightLocked: true,
    _pendingSettle: true,
    isPending: true,
    source: "bedtimer-night-wake",
    note: "Night wake. settling...",
  });
  state.bedPaused = true;
  state.bedWakeEntryId = pending.id;
  state.bedPauseStartMs = clockDateMs(actualDay, time);
  return pending;
}

function saveBabySleeping(state, settleTime, actualDay = state.today) {
  const found = state.bedWakeEntryId ? findEntry(state, state.bedWakeEntryId) : null;
  if (!found) return null;
  const duration = diffMins(found.entry.time, settleTime);
  Object.assign(found.entry, {
    end: settleTime,
    wakeDuration: duration,
    assistedDuration: String(duration),
    settleDuration: String(duration),
    _pendingSettle: false,
    isPending: false,
  });
  state.today = actualDay;
  state.bedPaused = false;
  state.bedWakeEntryId = null;
  return found.entry;
}

function logBedtimeFeedChoice(state, kind, data, actualDay = state.today) {
  const base = {
    type: "feed",
    time: data.time,
    feedType: data.feedType || "milk",
    amount: data.amount || 0,
    note: data.note || "",
  };
  if (kind === "night") {
    if (data._timer === "breast") {
      pauseBedTimer(state, data.time, actualDay);
      startBreastTimer(state, data.side || nextBreastSide(state), data.time, clockDateMs(actualDay, data.time), actualDay);
      return { timerStarted: true, kind: "night" };
    }
    return quickAddLog(state, "feed", {
      ...base,
      night: true,
      nightLocked: true,
      source: "bedtimer-night-feed",
      assistedType: base.feedType === "breast" ? "breast" : "milk",
      note: base.note || "Night wake feed",
    }, actualDay);
  }
  const bedDay = state.bedTimerDay;
  const targetDay = morningWakeDayForBedTimer(state, data.time, bedDay);
  logMorningWakeNextDay(state, data.time, { targetDay, bedDay });
  if (data._timer === "breast") {
    startBreastTimer(state, data.side || nextBreastSide(state), data.time, clockDateMs(targetDay, data.time), targetDay);
    return { timerStarted: true, kind: "morning", targetDay };
  }
  return quickAddLog(state, "feed", {
    ...base,
    night: false,
    nightLocked: false,
    source: "morning-wake-feed",
    note: base.note || "Morning wake feed",
    _targetDayOverride: targetDay,
  }, targetDay);
}

function startNightBreastTimerFromBed(state, data, actualDay = state.today) {
  const side = data.side || nextBreastSide(state);
  pauseBedTimer(state, data.time, actualDay);
  startBreastTimer(state, side, data.time, clockDateMs(actualDay, data.time), actualDay);
  return { timerStarted: true, kind: "night" };
}

function nextBreastSide(state) {
  return state.lastBreastSide === "L" ? "R" : "L";
}

function accrueBreast(state, nowMs) {
  const b = state.breast;
  if (!b.active || !b.side || !b.segmentStartMs) return;
  const add = Math.max(0, Math.floor((nowMs - b.segmentStartMs) / 1000));
  b.sec[b.side] = (b.sec[b.side] || 0) + add;
  b.segmentStartMs = nowMs;
}

function startBreastTimer(state, side, time, nowMs, dayKey = state.today) {
  const sideKey = safeSide(side);
  state.breast = {
    active: true,
    side: sideKey,
    startTime: time,
    startDay: dayKey,
    startMs: nowMs,
    segmentStartMs: nowMs,
    sec: { L: 0, R: 0 },
  };
  return state.breast;
}

function switchBreastSide(state, side, nowMs) {
  accrueBreast(state, nowMs);
  state.breast.active = true;
  state.breast.side = safeSide(side);
  state.breast.segmentStartMs = nowMs;
}

function pauseBreastTimer(state, nowMs) {
  accrueBreast(state, nowMs);
  state.breast.active = false;
}

function resumeBreastTimer(state, side, nowMs) {
  const totalSec = (state.breast.sec.L || 0) + (state.breast.sec.R || 0);
  state.breast.active = true;
  state.breast.side = safeSide(side || state.breast.side);
  state.breast.startMs = nowMs - totalSec * 1000;
  state.breast.segmentStartMs = nowMs;
}

function editBreastTimer(state, { left, right, side, start, nowMs, dayKey = state.today }) {
  const sideKey = safeSide(side || state.breast.side);
  const startMs = clockDateMs(dayKey, start);
  const nextSec = {
    L: Math.round(safeBreastMinutes(left) * 60),
    R: Math.round(safeBreastMinutes(right) * 60),
  };
  if (nextSec.L + nextSec.R <= 0) {
    nextSec[sideKey] = Math.max(0, Math.min(7200, Math.floor((nowMs - startMs) / 1000)));
  }
  const totalSec = nextSec.L + nextSec.R;
  state.breast = {
    active: true,
    side: sideKey,
    startTime: start,
    startDay: dayKey,
    startMs: totalSec > 0 ? nowMs - totalSec * 1000 : startMs,
    segmentStartMs: nowMs,
    sec: nextSec,
  };
}

function saveBreastFeed(state, actualDay = state.today) {
  accrueBreast(state, clockDateMs(actualDay, state.breast.startTime) + (state.breast.sec.L + state.breast.sec.R) * 1000);
  const lMins = state.breast.sec.L > 0 ? Math.max(1, Math.floor(state.breast.sec.L / 60)) : 0;
  const rMins = state.breast.sec.R > 0 ? Math.max(1, Math.floor(state.breast.sec.R / 60)) : 0;
  const nightMode = state.bedPaused && !!state.bedTimerDay;
  const targetDay = nightMode ? routeNightDay(state, actualDay) : state.selectedDay;
  if (nightMode && state.bedWakeEntryId) {
    deleteEntry(state, state.bedWakeEntryId);
    state.deletedEntryIds.delete(state.bedWakeEntryId);
  }
  const entry = addEntry(state, targetDay, {
    type: "feed",
    feedType: "breast",
    time: state.breast.startTime,
    amount: 0,
    breastL: lMins,
    breastR: rMins,
    night: nightMode,
    nightLocked: nightMode,
    source: nightMode ? "bedtimer-night-feed" : "breast-timer",
    note: nightMode ? "Night breast feed" : "",
  });
  const nextLastSide = rMins > lMins ? "R" : lMins > 0 ? "L" : state.lastBreastSide;
  state.lastBreastSide = nextLastSide;
  state.breast = { active: false, side: null, startTime: "", startDay: "", startMs: 0, segmentStartMs: 0, sec: { L: 0, R: 0 } };
  return entry;
}

function startNapTimer(state, dayKey, start) {
  state.today = dayKey;
  state.selectedDay = dayKey;
  const nap = addEntry(state, dayKey, { type: "nap", start, end: start, _active: true, source: "nap-timer" });
  state.activeNapId = nap.id;
  return nap;
}

function endNapTimer(state, end) {
  const found = state.activeNapId ? findEntry(state, state.activeNapId) : null;
  if (!found) return null;
  Object.assign(found.entry, {
    end,
    durationMins: diffMins(found.entry.start, end),
    _active: false,
  });
  state.activeNapId = null;
  return found.entry;
}

function cancelNapTimer(state) {
  const id = state.activeNapId;
  if (!id) return false;
  state.activeNapId = null;
  return deleteEntry(state, id);
}

function milkSummary(state, dayKey) {
  const list = entries(state, dayKey);
  return list.reduce((sum, e) => {
    if (e.type !== "feed") return sum;
    if (e.feedType === "pump" || e.feedType === "solids") return sum;
    return sum + (Number(e.amount) || 0);
  }, 0);
}

function feedCount(state, dayKey, opts = {}) {
  return entries(state, dayKey).filter(e => {
    if (!e || e.type !== "feed") return false;
    if (opts.night !== undefined && !!e.night !== opts.night) return false;
    return true;
  }).length;
}

function wakeWindowRows(state, dayKey) {
  const list = entries(state, dayKey).filter(e => !e.night || e.nightLocked);
  const morning = findMorningWake(list);
  if (!morning) return [];
  const rows = [];
  let awakeStart = clockMins(morning.time);
  list
    .filter(e => e.type === "nap" && e.start && e.end && !e._active)
    .sort((a, b) => clockMins(a.start) - clockMins(b.start))
    .forEach(nap => {
      const ns = clockMins(nap.start);
      const ne = clockMins(nap.end);
      if (ns !== null && ne !== null && ns > awakeStart) {
        rows.push({ start: awakeStart, end: ns, source: "morning-wake-or-nap" });
        awakeStart = ne;
      }
    });
  const bed = findBedtime(list);
  if (bed && clockMins(bed.time) > awakeStart) rows.push({ start: awakeStart, end: clockMins(bed.time), source: "bedtime" });
  return rows;
}

function clockCanStartBedtimeNow({ nextEvent, napOnDay, bedOnDay }) {
  const clockNextEventIsNap = !!(nextEvent && nextEvent.type === "nap");
  return !bedOnDay && !napOnDay && !clockNextEventIsNap;
}

function partnerActiveTimerSnapshot(state) {
  const pending = state.bedWakeEntryId ? findEntry(state, state.bedWakeEntryId)?.entry || null : null;
  const activeTimer = state.breast.active
    ? { type: "feed", side: state.breast.side, sec: { ...state.breast.sec } }
    : state.activeNapId
      ? { type: "nap", id: state.activeNapId }
      : state.bedTimerDay && !state.bedPaused
        ? { type: "sleep", dayKey: state.bedTimerDay }
        : null;
  return { activeTimer, pendingBedWake: pending };
}

function applyDeleteTombstones(days, deletedIds) {
  const del = new Set(deletedIds);
  return Object.fromEntries(Object.entries(days).map(([dayKey, list]) => [
    dayKey,
    (list || []).filter(e => !del.has(e.id)),
  ]));
}

function runOnboardingSimulation() {
  const account = createNewAccountJourney({
    username: " LizNol Family! ",
    babyName: "Amelia",
    dob: "2026-03-10",
    feedingMode: "breast",
    dayBoundary: "wake",
  });
  assert("new account simulation normalises family username", account.username === "liznolfamily");
  assert("new account simulation creates one active child with day-one profile", account.activeChildId === "amelia" && !!account.children.amelia.day1Profile);
  assert("new account simulation queues the app tour and trial fields", account.appTourPending === "new_account" && !!account.trialStartedAtClient && !!account.trialFirstInstallAtClient && !!account.trialDeviceKey);
}

function runBreastfeedingWakeModeJourney() {
  const state = createJourney({
    username: "bf-parent",
    babyName: "Lina",
    dob: "2026-03-11",
    feedingMode: "breast",
    dayBoundary: "wake",
    startDay: "2026-05-10",
  });
  state.lastBreastSide = "L";
  assert("breastfeeding mum starts on the opposite side from last feed", nextBreastSide(state) === "R");

  startBreastTimer(state, nextBreastSide(state), "07:05", clockDateMs("2026-05-10", "07:05"), "2026-05-10");
  switchBreastSide(state, "L", clockDateMs("2026-05-10", "07:11"));
  pauseBreastTimer(state, clockDateMs("2026-05-10", "07:14"));
  resumeBreastTimer(state, "L", clockDateMs("2026-05-10", "07:16"));
  switchBreastSide(state, "R", clockDateMs("2026-05-10", "07:18"));
  editBreastTimer(state, { left: "8", right: "5", side: "R", start: "07:05", nowMs: clockDateMs("2026-05-10", "07:18"), dayKey: "2026-05-10" });
  const feed = saveBreastFeed(state, "2026-05-10");
  assert("breast timer switch, pause, resume and edit save L/R duration", feed.breastL === 8 && feed.breastR === 5 && !feed.night, JSON.stringify(feed));
  assert("breast timer updates next-start side from the longer last side", state.lastBreastSide === "L" && nextBreastSide(state) === "R");

  editBreastTimer(state, { left: "", right: "", side: "L", start: "10:00", nowMs: clockDateMs("2026-05-10", "10:15"), dayKey: "2026-05-10" });
  const backdated = saveBreastFeed(state, "2026-05-10");
  assert("breast timer edit can seed duration from a backdated start time", backdated.breastL === 15 && backdated.breastR === 0, JSON.stringify(backdated));

  startBedTimer(state, "2026-05-10", "19:42");
  assert("wake-to-wake stays on bedtime day after midnight before morning wake", visibleDay(state, "2026-05-11") === "2026-05-10");
  const choice = startNightBreastTimerFromBed(state, { time: "02:12", feedType: "breast", side: nextBreastSide(state) }, "2026-05-11");
  assert("breastfeeding one-tap during bed timer pauses bedtime and starts a night feed timer", choice.timerStarted && state.bedPaused && state.breast.active && state.breast.side === "R");
  editBreastTimer(state, { left: "6", right: "9", side: "R", start: "02:12", nowMs: clockDateMs("2026-05-11", "02:28"), dayKey: "2026-05-11" });
  const nightFeed = saveBreastFeed(state, "2026-05-11");
  assert("night breast feed in wake mode logs on bedtime day and clears pending wake placeholder", nightFeed.night && nightFeed.breastL === 6 && nightFeed.breastR === 9 && findEntry(state, state.bedWakeEntryId) === null, JSON.stringify(nightFeed));
  const morningFeed = logBedtimeFeedChoice(state, "morning", { time: "06:41", feedType: "milk", amount: 90 }, "2026-05-11");
  assert("morning wake choice explains day start by logging wake and feed on the new day", morningFeed.source === "morning-wake-feed" && morningFeed.night === false && findMorningWake(entries(state, "2026-05-11")), JSON.stringify(entries(state, "2026-05-11")));
  assert("wake-to-wake moves to today once morning wake is logged", visibleDay(state, "2026-05-11") === "2026-05-11");
}

function runComboMidnightJourney() {
  const state = createJourney({
    username: "combo-parent",
    babyName: "Noah",
    dob: "2025-12-01",
    feedingMode: "combo",
    dayBoundary: "midnight",
    startDay: "2026-05-11",
  });
  quickAddLog(state, "wake", { type: "wake", time: "06:58", night: false }, "2026-05-11");
  const dayBottle = quickAddLog(state, "feed", { type: "feed", time: "12:15", feedType: "milk", amount: 140, night: false }, "2026-05-11");
  startBreastTimer(state, "L", "15:20", clockDateMs("2026-05-11", "15:20"), "2026-05-11");
  switchBreastSide(state, "R", clockDateMs("2026-05-11", "15:29"));
  editBreastTimer(state, { left: "9", right: "4", side: "R", start: "15:20", nowMs: clockDateMs("2026-05-11", "15:33"), dayKey: "2026-05-11" });
  const dayBreast = saveBreastFeed(state, "2026-05-11");
  startBedTimer(state, "2026-05-11", "20:05");
  const nightBottle = logBedtimeFeedChoice(state, "night", { time: "01:20", feedType: "milk", amount: 110 }, "2026-05-12");
  const morningWakeFeed = logBedtimeFeedChoice(state, "morning", { time: "07:12", feedType: "milk", amount: 100 }, "2026-05-12");
  quickAddLog(state, "feed", { type: "feed", time: "08:00", feedType: "pump", pumpL: 20, pumpR: 15, amount: 0, night: false }, "2026-05-12");
  quickAddLog(state, "feed", { type: "feed", time: "11:30", feedType: "solids", amount: 0, note: "banana", night: false }, "2026-05-12");

  assert("combo feeding day logs bottle and breast separately", dayBottle.amount === 140 && dayBreast.breastL === 9 && dayBreast.breastR === 4);
  assert("midnight mode puts after-midnight night bottle on calendar day", entries(state, "2026-05-12").includes(nightBottle) && nightBottle.night && milkSummary(state, "2026-05-12") === 210, JSON.stringify(entries(state, "2026-05-12")));
  assert("combo morning wake feed lands on the morning day and pump/solids do not inflate milk totals", morningWakeFeed.source === "morning-wake-feed" && feedCount(state, "2026-05-12") === 4 && milkSummary(state, "2026-05-12") === 210);
}

function runTimerEditAndClockJourney() {
  const state = createJourney({
    username: "timer-parent",
    babyName: "Kai",
    dob: "2026-01-08",
    feedingMode: "combo",
    dayBoundary: "wake",
    startDay: "2026-05-12",
  });
  const wake = quickAddLog(state, "wake", { type: "wake", time: "07:03", night: false }, "2026-05-12");
  const cancelled = startNapTimer(state, "2026-05-12", "08:45");
  assert("nap timer can start then cancel without leaving an active nap", cancelNapTimer(state) && !findEntry(state, cancelled.id) && !state.activeNapId);
  const nap = startNapTimer(state, "2026-05-12", "10:12");
  const ended = endNapTimer(state, "10:51");
  const stoppedDuration = ended.durationMins;
  editEntry(state, nap.id, { start: "10:08", durationMins: 44, location: "cot" });
  const bottle = quickAddLog(state, "feed", { type: "feed", time: "11:20", feedType: "milk", amount: 120, night: false }, "2026-05-12");
  editEntry(state, bottle.id, { time: "11:25", amount: 135, note: "paced bottle" });
  editEntry(state, wake.id, { time: "06:55", note: "happy wake" });
  startBedTimer(state, "2026-05-12", "19:34");
  const nightWake = pauseBedTimer(state, "22:18", "2026-05-12");
  saveBabySleeping(state, "22:36", "2026-05-12");
  deleteEntry(state, nightWake.id);

  const editedNap = findEntry(state, nap.id).entry;
  assert("nap timer stop and edit preserve start, calculated end, duration and location", stoppedDuration === 39 && editedNap.start === "10:08" && editedNap.end === "10:52" && editedNap.durationMins === 44 && editedNap.location === "cot", JSON.stringify(editedNap));
  const longNapState = createJourney({ username: "long-nap-parent", babyName: "Mia", dob: "2026-01-08", feedingMode: "combo", dayBoundary: "wake", startDay: "2026-05-12" });
  startNapTimer(longNapState, "2026-05-12", "15:55");
  const endedLongNap = endNapTimer(longNapState, "20:05");
  const bedtimeCountAfterLongNap = entries(longNapState, "2026-05-12").filter(e => e.type === "sleep" && !e.night).length;
  assert("long late nap timer remains a nap and does not create bedtime", endedLongNap.type === "nap" && endedLongNap.durationMins === 250 && bedtimeCountAfterLongNap === 0);
  assert("feed and wake edits update the original log instead of creating duplicates", entries(state, "2026-05-12").filter(e => e.id === bottle.id).length === 1 && bottle.amount === 135 && wake.time === "06:55");
  assert("deleted night wake is tombstoned for sync after user edits/deletes logs", state.deletedEntryIds.has(nightWake.id) && !findEntry(state, nightWake.id));

  const windows = wakeWindowRows(state, "2026-05-12");
  assert("clock wake windows use morning wake, not deleted or night wakes", windows.length >= 2 && windows[0].start === clockMins("06:55") && windows.some(w => w.end === clockMins("19:34")), JSON.stringify(windows));
  assert("clock does not show start bedtime when next event is a nap", clockCanStartBedtimeNow({ nextEvent: { type: "nap" }, napOnDay: false, bedOnDay: false }) === false);
  assert("clock can show bedtime start only when no nap is active or next", clockCanStartBedtimeNow({ nextEvent: { type: "bed" }, napOnDay: false, bedOnDay: false }) === true);
}

function runPartnerSyncJourney() {
  const state = createJourney({
    username: "sync-parent",
    babyName: "Maya",
    dob: "2026-02-14",
    feedingMode: "breast",
    dayBoundary: "wake",
    startDay: "2026-05-12",
  });
  startBedTimer(state, "2026-05-12", "19:50");
  let snap = partnerActiveTimerSnapshot(state);
  assert("partner sync exports active bedtime while bedtime timer is running", snap.activeTimer && snap.activeTimer.type === "sleep" && !snap.pendingBedWake);
  const pending = pauseBedTimer(state, "01:42", "2026-05-13");
  snap = partnerActiveTimerSnapshot(state);
  assert("partner sync hides paused bedtime and exports pending night wake context", !snap.activeTimer && snap.pendingBedWake && snap.pendingBedWake.id === pending.id);
  const cloudDays = {
    "2026-05-12": [
      { id: "keep", type: "feed", time: "10:00", amount: 100 },
      { id: pending.id, type: "wake", time: "01:42", night: true },
    ],
  };
  const filtered = applyDeleteTombstones(cloudDays, [pending.id]);
  assert("partner sync tombstones prevent deleted cloud night wakes from returning", filtered["2026-05-12"].length === 1 && filtered["2026-05-12"][0].id === "keep");
}

function runSourceWiringChecks() {
  const careLandingAt = appSource.indexOf("const _carePrimaryTools = [");
  const careLandingBlock = careLandingAt > -1 ? appSource.slice(careLandingAt, careLandingAt + 2000) : "";
  const breastActionAt = appSource.indexOf("const clockQuickBreastLog = () => {");
  const breastActionEnd = breastActionAt > -1 ? appSource.indexOf("const clockLabCoreActions", breastActionAt) : -1;
  const breastActionBlock = breastActionAt > -1 && breastActionEnd > breastActionAt ? appSource.slice(breastActionAt, breastActionEnd) : "";
  assert("live onboarding/new-account setup carries trial and app-tour state", appSource.includes("trialStartedAtClient") && appSource.includes("trialFirstInstallAtClient") && appSource.includes("trialDeviceKey") && appSource.includes('localStorage.setItem("ob_app_tour_pending_v1"') && appSource.includes("safeDay1Profile(activeChild?.day1Profile"));
  assert("live Care dashboard exposes the breastfeeding guide modal", careLandingBlock.includes('{id:"breastfeeding",label:"Breastfeeding"') && appSource.includes('if (f.id === "breastfeeding") { setBfHubSection(null); setShowBfHub(true); return; }') && appSource.includes("Breastfeeding Guide") && appSource.includes("{showBfHub&&("));
  assert("live Clock breast action exposes next L/R and active/paused L/R state", appSource.includes('const clockNextBreastSide = clockLastBreastSide === "L" ? "R" : "L";') && appSource.includes('const clockBreastSideBadge = clockFeedTimerOnThisDay ? clockBreastActionSide + (breastActive ? " active" : " paused") : "Next " + clockBreastActionSide;') && appSource.includes('data-testid="clock-breast-side-toggle"'));
  assert("live Clock breast tap starts or resumes the timer while long press owns edit", breastActionBlock.includes("startBreastTimer(sideKey);") && breastActionBlock.includes("resumeBreastTimer(clockActiveBreastSide)") && breastActionBlock.includes("Hold Breast to edit") && !breastActionBlock.includes("quickAddLog") && !breastActionBlock.includes("if (breastActive) { openBreastTimerEdit"));
  assert("live breastfeeding timer edit accepts start time and L/R duration", appSource.includes("function saveBreastTimerEdit()") && appSource.includes("safeBreastMinutesInput") && appSource.includes('localStorage.setItem("breast_startMs",String(timerStartMs))') && appSource.includes("Left (L) minutes") && appSource.includes("Right (R) minutes"));
  assert("live breast timer resume keeps duration authoritative through side switches", appSource.includes("function resumeBreastTimer(side)") && appSource.includes("Date.now() - totalSec * 1000") && appSource.includes("const sideKey = resumeBreastTimer(side);"));
  assert("live bedtime feed choice explains night wake versus morning wake", appSource.includes("function openBedtimeFeedChoice(data)") && appSource.includes("function logBedtimeFeedChoice(kind)") && appSource.includes("Night wake feed or morning wake?") && appSource.includes("Night wake</strong> means baby isn't ready to wake up for the day.") && appSource.includes("Morning wake</strong> means baby is ready to start the day."));
  assert("live night feed routing respects wake and midnight day modes", appSource.includes('const dayKey = _isNightTimerFeedForAll ? (dayBoundary === "wake" ? _bedDayForAll : todayStr()) : selDay;') && appSource.includes('if (dayBoundary === "wake" && _isNightEntry && _btdEffective)') && appSource.includes('} else if (_isExplicitNight && dayBoundary === "midnight")'));
  assert("live Clock blocks start bedtime while the next event is a nap", appSource.includes("const clockNextEventIsNap = !!(") && appSource.includes('nextEvent && nextEvent.type === "nap"') && appSource.includes("!clockNapOnThisDay && !clockNextEventIsNap"));
  assert("live Clock does not let stale nap state override active bedtime", appSource.includes('function clearNapTimerState(reason = "timer_clear", opts = {})') && appSource.includes('clearNapTimerState("bedtime_timer_wins", {preserveMode:true, keepNativeTimer:true});') && appSource.includes('const clockNapSuppressedByBedtime = !!(clockBedOnThisDay && !bedPaused);') && appSource.includes('type: _bedActive ? "bed" : _breastActive ? "breast" : "nap"'));
  assert("live partner sync stops paused bedtime timers from exporting as active", appSource.includes("function forceWidgetTimerPaused(label = \"Night wake\")") && appSource.includes("Partner paused bedtime for a night wake") && appSource.includes('forceWidgetTimerPaused("Night wake")') && appSource.includes('const _bedActive = !!localStorage.getItem("bed_timer_day") && !_bedPausedForCloud;'));
  assert("live Care Feeding adapts to breast, combo, bottle and solids", appSource.includes('data-testid="care-feeding-specialist-brief"') && appSource.includes('testId:"care-feeding-mode-breast"') && appSource.includes('testId:"care-feeding-mode-combi"') && appSource.includes('testId:"care-feeding-mode-bottle"') && appSource.includes('testId:"care-feeding-mode-solids"') && appSource.includes("Bottle ml is only the measured part"));
}

runOnboardingSimulation();
runBreastfeedingWakeModeJourney();
runComboMidnightJourney();
runTimerEditAndClockJourney();
runPartnerSyncJourney();
runSourceWiringChecks();

if (failures) {
  console.error("\nParent journey regression audit failed with " + failures + " issue(s).");
  process.exit(1);
}

console.log("\nParent journey regression audit passed.");
