#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

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

function clockMins(value) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(value || "").trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isInteger(h) || !Number.isInteger(min) || h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

function isMilkOrBreastFeedEntry(entry) {
  if (!entry) return false;
  if (entry.assistedType === "milk") return true;
  if (entry.feedType === "milk" || entry.feedType === "bottle" || entry.feedType === "breast") return true;
  return (Number(entry.amount) || 0) > 0 || (Number(entry.breastL) || 0) + (Number(entry.breastR) || 0) > 0;
}

function findBedtime(entries) {
  let best = null;
  (entries || []).forEach(entry => {
    if (!entry || entry.type !== "sleep" || !entry.time || entry.night) return;
    const mins = clockMins(entry.time);
    if (mins !== null && mins >= 16 * 60) best = entry;
  });
  return best;
}

function classifyNightLikeApp(entries) {
  const bed = findBedtime(entries);
  if (!bed) return entries;
  const bedMins = clockMins(bed.time);
  return entries.map(entry => {
    if (!entry || entry.nightLocked) return entry;
    if (entry.type !== "wake" && entry.type !== "feed") return entry;
    if (entry.type === "feed") {
      const feedType = String(entry.feedType || "").toLowerCase();
      if (feedType === "pump" || feedType === "solids" || entry.dreamFeed) return entry;
      if (!isMilkOrBreastFeedEntry(entry)) return entry;
    }
    const mins = clockMins(entry.time || entry.start || "");
    if (mins === null) return entry;
    const hour = Math.floor(mins / 60);
    if (hour >= 5 && hour < 13) return { ...entry, night: false };
    const isNight = mins >= bedMins || mins < 5 * 60;
    return entry.night === isNight ? entry : { ...entry, night: isNight };
  });
}

function shouldKeepCatchUp({ selectedDay, todayKey, bedDay, bedStart, type, entry }) {
  const selectedIsHistorical = selectedDay < todayKey;
  const selectedIsBedtimeDay = selectedDay === bedDay;
  if (!bedDay || !todayKey || !selectedDay || (!selectedIsHistorical && !selectedIsBedtimeDay)) return false;
  if (entry && (entry.night || entry.nightLocked || entry.dreamFeed)) return false;
  if (!(type === "feed" || type === "poop" || type === "nap")) return false;
  const mins = clockMins(entry && (entry.time || entry.start) || "");
  if (selectedIsBedtimeDay && mins !== null) {
    const bedMins = clockMins(bedStart);
    if (bedMins !== null && mins >= bedMins) return false;
  }
  const hour = mins !== null ? Math.floor(mins / 60) : 12;
  return hour >= 6 && hour < 20;
}

function runClassifierChaosScenario() {
  const entries = classifyNightLikeApp([
    { id: "wake", type: "wake", time: "07:02", night: false },
    { id: "pre-bed-settle", type: "wake", time: "19:37", night: true, assistedDuration: 15 },
    { id: "bed", type: "sleep", time: "20:15", night: false },
    { id: "milk", type: "feed", time: "22:10", feedType: "milk", amount: 90, night: false },
    { id: "pump", type: "feed", time: "22:20", feedType: "pump", pumpL: 40, pumpR: 30, amount: 70, night: false },
    { id: "solids", type: "feed", time: "20:40", feedType: "solids", food: "porridge", amount: 0, night: false },
    { id: "nappy", type: "poop", time: "23:00", poopType: "wet", night: false },
  ]);
  const byId = Object.fromEntries(entries.map(entry => [entry.id, entry]));
  assert("post-bed milk feed becomes night care", byId.milk.night === true, JSON.stringify(byId.milk));
  assert("post-bed pump remains a pump, not a night feed", byId.pump.night === false, JSON.stringify(byId.pump));
  assert("post-bed solids remain solids, not a night feed", byId.solids.night === false, JSON.stringify(byId.solids));
  assert("nappy is never auto-converted by bedtime classifier", byId.nappy.night === false, JSON.stringify(byId.nappy));
  assert("pre-bed assisted wake is not locked by the classifier itself", byId["pre-bed-settle"].night === false, JSON.stringify(byId["pre-bed-settle"]));
}

function runCatchUpChaosScenario() {
  const ctx = { todayKey: "2026-05-17", bedDay: "2026-05-17", bedStart: "20:15" };
  assert("same-day pre-bed feed catch-up is allowed while bedtime timer is open", shouldKeepCatchUp({ ...ctx, selectedDay: "2026-05-17", type: "feed", entry: { time: "14:20", feedType: "milk", night: false } }));
  assert("same-day post-bed feed still goes through night/morning choice", !shouldKeepCatchUp({ ...ctx, selectedDay: "2026-05-17", type: "feed", entry: { time: "22:10", feedType: "milk", night: false } }));
  assert("previous-day nappy catch-up is allowed while bedtime timer is open", shouldKeepCatchUp({ ...ctx, selectedDay: "2026-05-16", type: "poop", entry: { time: "11:15", poopType: "wet", night: false } }));
  assert("future-day catch-up is still blocked", !shouldKeepCatchUp({ ...ctx, selectedDay: "2026-05-18", type: "feed", entry: { time: "11:15", feedType: "milk", night: false } }));
}

function runSourceGuards() {
  assert("live night classifier excludes pump, solids and dream feeds from auto-night", appSource.includes('feedType === "pump" || feedType === "solids" || e.dreamFeed') && appSource.includes("if (!_isMilkOrBreastFeedEntry(e)) return e;"));
  assert("live import rehome excludes after-midnight pump sessions", appSource.includes('const isNightMilk = entry.type === "feed" && entry.feedType !== "solids" && entry.feedType !== "pump";'));
  assert("live catch-up guard covers the bedtime day as well as historical days", appSource.includes("const selectedIsBedtimeDay = selectedDay === bedDay;") && appSource.includes("if (bedStart !== null && mins >= bedStart) return false;"));
}

runClassifierChaosScenario();
runCatchUpChaosScenario();
runSourceGuards();

if (failures) {
  console.error("\nReal-parent chaos audit failed with " + failures + " issue(s).");
  process.exit(1);
}

console.log("\nReal-parent chaos audit passed.");
