#!/usr/bin/env node

function timeVal(e) {
  const t = e.time || e.start || "00:00";
  const parts = String(t).split(":").map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

function findMorningWake(entries) {
  if (!entries || !entries.length) return null;
  let best = null;
  let bestMins = Infinity;
  for (const e of entries) {
    if (!e || e.type !== "wake" || !e.time) continue;
    const h = parseInt(String(e.time).split(":")[0], 10);
    const m = timeVal(e);
    if (h >= 5 && h < 13 && m < bestMins) {
      best = e;
      bestMins = m;
    }
  }
  return best;
}

function findBedtime(entries) {
  if (!entries || !entries.length) return null;
  return entries
    .filter(e => e && e.type === "sleep" && !e.night && e.time && parseInt(String(e.time).split(":")[0], 10) >= 12)
    .sort((a, b) => timeVal(b) - timeVal(a))[0] || null;
}

function prevDayStr(day) {
  const d = new Date(day + "T12:00:00");
  d.setDate(d.getDate() - 1);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function boundaryVisibleDay({ mode, days, bedTimerDay, actualToday }) {
  if (mode !== "wake") return actualToday;
  if (findMorningWake(days[actualToday] || [])) return actualToday;
  const prevDay = prevDayStr(actualToday);
  const openBedDay = bedTimerDay || (findBedtime(days[prevDay] || []) ? prevDay : null);
  if (openBedDay && openBedDay < actualToday && findBedtime(days[openBedDay] || [])) return openBedDay;
  return actualToday;
}

function routeNightEntry({ mode, bedTimerDay, today }) {
  return mode === "wake" && bedTimerDay ? bedTimerDay : today;
}

let nextId = 1;
function movedId() {
  return "moved-" + nextId++;
}

function boundaryEntrySignature(e) {
  return [
    e.type || "",
    e.time || e.start || "",
    (e.night || e.nightLocked) ? 1 : 0,
    e.amount || e.ml || "",
    e.feedType || "",
    e.poopType || "",
    e.assistedType || "",
    e.selfSettled ? 1 : 0,
  ].join("|");
}

function isBoundaryNightEntry(e) {
  if (!e || !(e.night || e.nightLocked)) return false;
  if (!["wake", "feed", "poop"].includes(e.type)) return false;
  const h = parseInt(String(e.time || e.start || "").split(":")[0], 10);
  return !isNaN(h) && h >= 0 && h < 13;
}

function migrateDayBoundaryDays(sourceDays, nextMode, opts = {}) {
  const next = {};
  Object.entries(sourceDays || {}).forEach(([dk, arr]) => { next[dk] = Array.isArray(arr) ? [...arr] : arr; });
  const movedIds = [];
  const actualToday = opts.actualToday || "";
  const bedTimerDay = opts.bedTimerDay || null;

  function addMoved(targetDay, entry, fromDay) {
    const sig = boundaryEntrySignature(entry);
    const oldId = entry.id || null;
    const target = Array.isArray(next[targetDay]) ? next[targetDay] : [];
    const filtered = target.filter(x => {
      if (oldId && x.id === oldId) return false;
      return boundaryEntrySignature(x) !== sig;
    });
    next[targetDay] = [...filtered, { ...entry, id: movedId(), _boundaryMovedFrom: fromDay }];
    if (oldId) movedIds.push(oldId);
  }

  const original = sourceDays || {};
  Object.keys(original).sort().forEach(day => {
    const source = Array.isArray(original[day]) ? original[day] : [];
    const keep = [];
    const hasBed = !!findBedtime(source);
    source.forEach(entry => {
      let targetDay = null;
      if (nextMode === "midnight" && isBoundaryNightEntry(entry) && hasBed) {
        const candidateNext = nextDayStr(day);
        if (findMorningWake(original[candidateNext] || []) || bedTimerDay === day || candidateNext === actualToday) targetDay = candidateNext;
      }
      if (nextMode === "wake" && isBoundaryNightEntry(entry) && findBedtime(original[prevDayStr(day)] || [])) {
        if (findMorningWake(source) || day === actualToday) targetDay = prevDayStr(day);
      }
      if (targetDay && targetDay !== day) addMoved(targetDay, entry, day);
      else keep.push(entry);
    });
    next[day] = keep;
  });

  return { days: next, movedIds };
}

function nextDayStr(day) {
  const d = new Date(day + "T12:00:00");
  d.setDate(d.getDate() + 1);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function assertEqual(name, actual, expected) {
  if (actual !== expected) {
    throw new Error(name + " expected " + expected + " but got " + actual);
  }
  console.log("✓ " + name);
}

const days = {
  "2026-04-27": [
    { type: "wake", time: "07:05", night: false },
    { type: "sleep", time: "19:42", night: false },
  ],
  "2026-04-28": [],
};

assertEqual(
  "wake mode stays on bedtime day after midnight until morning wake",
  boundaryVisibleDay({ mode: "wake", days, bedTimerDay: "2026-04-27", actualToday: "2026-04-28" }),
  "2026-04-27"
);

assertEqual(
  "midnight mode moves visible day to calendar today",
  boundaryVisibleDay({ mode: "midnight", days, bedTimerDay: "2026-04-27", actualToday: "2026-04-28" }),
  "2026-04-28"
);

assertEqual(
  "wake mode night entries route to bedtime day",
  routeNightEntry({ mode: "wake", bedTimerDay: "2026-04-27", today: "2026-04-28" }),
  "2026-04-27"
);

assertEqual(
  "midnight mode night entries route to calendar today",
  routeNightEntry({ mode: "midnight", bedTimerDay: "2026-04-27", today: "2026-04-28" }),
  "2026-04-28"
);

days["2026-04-28"].push({ type: "wake", time: "06:51", night: false });
assertEqual(
  "wake mode moves to today once morning wake is logged",
  boundaryVisibleDay({ mode: "wake", days, bedTimerDay: "2026-04-27", actualToday: "2026-04-28" }),
  "2026-04-28"
);

const wakeModeDays = {
  "2026-04-27": [
    { id: "bed", type: "sleep", time: "19:42", night: false },
    { id: "feed-night", type: "feed", time: "02:10", night: true, nightLocked: true, feedType: "milk", amount: 120 },
  ],
  "2026-04-28": [
    { id: "wake-morning", type: "wake", time: "06:51", night: false },
    { id: "dup-target", type: "feed", time: "02:10", night: true, nightLocked: true, feedType: "milk", amount: 120 },
  ],
};
const midnightMigration = migrateDayBoundaryDays(wakeModeDays, "midnight", { actualToday: "2026-04-28", bedTimerDay: "2026-04-27" });
assertEqual(
  "midnight migration removes after-midnight night feed from bedtime day",
  midnightMigration.days["2026-04-27"].some(e => e.id === "feed-night"),
  false
);
assertEqual(
  "midnight migration keeps one copy on calendar day",
  midnightMigration.days["2026-04-28"].filter(e => e.type === "feed" && e.time === "02:10").length,
  1
);
assertEqual(
  "midnight migration tombstones moved source id",
  midnightMigration.movedIds.includes("feed-night"),
  true
);

const midnightModeDays = {
  "2026-04-27": [
    { id: "bed2", type: "sleep", time: "20:05", night: false },
  ],
  "2026-04-28": [
    { id: "wake2", type: "wake", time: "06:40", night: false },
    { id: "wake-night", type: "wake", time: "03:15", night: true, nightLocked: true },
  ],
};
const wakeMigration = migrateDayBoundaryDays(midnightModeDays, "wake", { actualToday: "2026-04-28" });
assertEqual(
  "wake migration removes after-midnight night wake from calendar day",
  wakeMigration.days["2026-04-28"].some(e => e.id === "wake-night"),
  false
);
assertEqual(
  "wake migration moves after-midnight night wake to bedtime day",
  wakeMigration.days["2026-04-27"].filter(e => e.type === "wake" && e.time === "03:15").length,
  1
);
