#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");

function assert(name, condition) {
  if (!condition) throw new Error(name);
  console.log("✓ " + name);
}

assert("Shared bedtime rescue guard exists", app.includes("function isBedtimeRescueWindow()"));
assert("Bedtime rescue guard lets explicit nap events stay nap-only", app.includes('if (nextEventType === "nap") return false;'));
assert("Bedtime rescue guard prioritises an active bed timer over stale nap predictions", app.indexOf("if (bedTimerDay) return true;") < app.indexOf('if (nextEventType === "nap") return false;'));
assert("Bedtime rescue guard uses the bed target window, not any distant bedtime", app.includes('if (nextEventType === "bed" && typeof td.nextEvent.targetMs === "number")') && app.includes("minsToBed <= 20 && minsToBed > -120"));
assert("Nap rescue tap redirects to bedtime rescue during bedtime window", /if \(isBedtimeRescueWindow\(\)\) \{\s*openBedtimeResistanceOptions\(\);\s*return;\s*\}/s.test(app));
assert("Overdue fallback nap pill is hidden during bedtime rescue window", app.includes("!_td.napsComplete && !_td.napBedConflict && !isBedtimeRescueWindow() && !napRefusedChoice"));
assert("Clock Track nap-not-happening action is hidden during bedtime rescue window", app.includes("const clockBedtimeResistanceReady = !!(") && app.includes("!clockRoutineStartReady") && app.includes("const clockNapOverdue = !!(clockLabIsToday && !activeTimer && !clockBedtimeLogged && !isBedtimeRescueWindow()") && app.includes("const clockNapNotHappeningReady = !!(!isBedtimeRescueWindow() &&") && app.includes('key:"nap-refused"'));
assert("Hero lower nap-not-happening button is hidden during bedtime rescue window", app.includes('!isBedtimeRescueWindow() && (_showAsNap || ((isNapNow || isOverdue) && !isBed))'));
assert("Main nap-not-happening card is hidden during bedtime rescue window", app.includes("!(tickDataRef.current||{}).napBedConflict && !isBedtimeRescueWindow() && (forceNapRefusedCard || napRefusedChoice==null)"));
assert("Nap-not-happening sheet cannot render during bedtime rescue window", app.includes("showNapRefusedSheet && !isBedtimeRescueWindow()"));
assert("Bedtime-not-happening chip waits for bedtime window", app.includes("isBed && !_showAsNap && !bedTimerDay && isBedtimeRescueWindow()"));
assert("Clock Track bedtime-not-happening helper waits for bedtime window", app.includes("if (clockBedtimeResistanceReady) {") && app.includes('key:"bed-resistance"') && app.includes('title:"Bedtime not happening?"'));
assert("Parent-facing bedtime rescue wording is clear", app.includes("Bedtime not happening?"));
assert("Old bedtime rescue wording is removed from UI", !app.includes("Bedtime not settling?"));

console.log("Sleep rescue copy/overlap audit passed.");
