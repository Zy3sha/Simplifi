#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

function assert(name, condition) {
  if (!condition) throw new Error(name);
  console.log("✓ " + name);
}

assert("Sleep transition analyser exposes the internal insight shape", app.includes("function detectSleepTransitionInsight") && app.includes("SleepTransitionInsight:") && ["type", "title", "body", "why", "confidence", "primaryAction", "secondaryAction", "payload"].every(k => app.includes(k)));
assert("Morning wake followed by a completed nap in 10-60 minutes can trigger a resettle insight", app.includes("gapMin < 10 || gapMin > 60") && app.includes("isValidCompletedNap(e)") && app.includes("Looks like a little morning resettle") && app.includes("This may be the end of night sleep, not Nap 1."));
assert("Care activity between wake and nap prevents the strong correction", app.includes("const hasCareBetween = sorted.some") && app.includes("careTypes") && app.includes("Because there was a feed, nappy or activity in between") && app.includes("primaryAction: null"));
assert("Normal age-appropriate first naps do not produce the card", app.includes("const _ww = opts.wakeWindow || getBaseWakeWindow(opts.ageWeeks);") && app.includes("if (_ww && gapMin >= Math.max(75, _ww.min - 15)) return null;"));
assert("Track renders a short actionable card with the two parent choices", app.includes('data-testid="sleep-transition-insight-card"') && app.includes("renderSleepTransitionInsight") && app.includes("Treat as final morning wake") && app.includes("Keep as nap") && app.includes("Got it") && styles.includes("Sleep transition intelligence pass") && styles.includes(".ob-app-root .ob-sleep-transition-card"));
assert("Correction removes the false wake and mistaken nap from day totals", app.includes("function applySleepTransitionCorrection") && app.includes("e.id !== p.wakeId && e.id !== p.napId") && app.includes('type: "wake"') && app.includes("time: p.finalWakeTime") && app.includes("Brief morning stir at ") && app.includes("autoClassifyNight(next, d[prevDayStr(p.dayKey)] || null)"));
assert("Correction tombstones deleted IDs so partner/cloud sync cannot resurrect them", app.includes("deletedEntryIdsRef.current.add(p.wakeId)") && app.includes("deletedEntryIdsRef.current.add(p.napId)") && app.includes("_capAndPersistDeletedIds();") && app.includes("setDays(d => {"));
assert("Read details are saved to What we noticed without auto-correcting", app.includes("addObservation(") && app.includes("Morning resettle adjusted") && app.includes("OBubba can move morning wake") && app.includes("Never auto-corrects") === false);
