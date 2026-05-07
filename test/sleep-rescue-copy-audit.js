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
assert("Hero nap-not-happening secondary is hidden during bedtime rescue window", app.includes("if (!isBedtimeRescueWindow()) {\n            // Add \"Nap not happening?\" pill"));
assert("Hero lower nap-not-happening button is hidden during bedtime rescue window", app.includes('!isBedtimeRescueWindow() && (_showAsNap || ((isNapNow || isOverdue) && !isBed))'));
assert("Main nap-not-happening card is hidden during bedtime rescue window", app.includes("!(tickDataRef.current||{}).napBedConflict && !isBedtimeRescueWindow() && (forceNapRefusedCard || napRefusedChoice==null)"));
assert("Nap-not-happening sheet cannot render during bedtime rescue window", app.includes("showNapRefusedSheet && !isBedtimeRescueWindow()"));
assert("Bedtime-not-happening chip waits for bedtime window", app.includes("isBed && !_showAsNap && !bedTimerDay && isBedtimeRescueWindow()"));
assert("Hero bedtime-not-happening helper waits for bedtime window", app.includes("const _showBedtimeHelp = isBedtimeRescueWindow();") && app.includes("{_showBedtimeHelp && ("));
assert("Parent-facing bedtime rescue wording is clear", app.includes("Bedtime not happening?"));
assert("Old bedtime rescue wording is removed from UI", !app.includes("Bedtime not settling?"));

console.log("Sleep rescue copy/overlap audit passed.");
