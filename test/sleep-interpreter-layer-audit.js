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

assert("Sleep interpreter is a separate layer above the sleep maths engine", app.includes("function detectSleepInterpreterInsight") && app.includes("OBubba sleep interpreter layer") && app.includes("This sits above the maths engine") && app.includes("function sleepInterpreterDaySleepTarget"));
assert("Sleep interpreter covers skipped or overdue nap situations", app.includes('mk("nap_overdue"') && app.includes("Nap may have slipped past the window") && app.includes('primaryAction: {label:"Start nap", action:"start_nap"}') && app.includes('secondaryAction: {label:"Adjust today", action:"open_schedule"}'));
assert("Sleep interpreter covers stacked short naps and sleep debt", app.includes('mk("short_nap_stack"') && app.includes("Sleep pressure is building") && app.includes("short naps today") && app.includes("daySleepMins"));
assert("Sleep interpreter covers late nap, high day sleep, and bedtime risk", app.includes('mk("high_day_sleep"') && app.includes("Plenty of day sleep already") && app.includes('mk("late_nap_bedtime_risk"') && app.includes("Late nap may move bedtime") && app.includes('primaryAction: {label:"Plan bedtime", action:"open_schedule"}'));
assert("Sleep interpreter can surface false starts, long wakes and hard settling into Care Sleep", app.includes("analyzeLastNight(days, prevDay, dayKey)") && app.includes("diagnoseNightPattern(lastNight") && app.includes('primaryAction: {label:"Open sleep insight", action:"open_sleep_insight"}') && app.includes('["overtired","undertired","habit","hunger","developmental_disruption","split_night","false_start","bedtime_resistance","settling_difficulty","fragmented_night"]') && app.includes("False start after bedtime") && app.includes("Long wake night") && app.includes("Bedtime was hard") && app.includes("Hard settling night") && app.includes("Fragmented night") && !app.includes("Possible split night"));
assert("Long-wake explanation mentions correlations only when the data has one", app.includes("function buildSplitNightCrossLogWhy") && app.includes("No clear correlation is strong enough yet") && app.includes("The useful clues are:") && app.includes("humanizeSplitNightPrimaryPressure") && app.includes("splitNightCrossLogSignals") && app.includes("splitNightPrimaryPressure") && app.includes("logged daytime milk") && app.includes("wet nappies were") && app.includes("recent milestone logged") && app.includes("crossLogWhy: _crossLogWhy") && app.includes("_diag.crossLogWhy") && app.includes("diagnosis.crossLogWhy") && !app.includes("Looking across feeds, nappies, day sleep and development"));
assert("Last night's debrief shows intelligence signals instead of hiding them in the engine", app.includes("lastNight.intelligenceSignals") && app.includes('data-testid="last-night-intelligence-signals"') && app.includes("Long wake signal") && app.includes("wake within 1-2h of bedtime") && app.includes("Bedtime resistance") && app.includes("wakes need watching") && !app.includes("Split-night signal"));
assert("Night diagnosis reads notes and stored bedtime resistance before calling a night normal", app.includes("function nightWakeDurationMinutes") && app.includes("function nightWakeLooksDifficult") && app.includes("ob_bedtime_resistance_") && app.includes("I won't call it a normal night") && app.includes("I won't flatten this into a normal night") && app.includes("I won't call that normal just because"));
assert("Track renders only one calm interpreter card with action handlers", app.includes('data-testid="sleep-interpreter-insight-card"') && app.includes("getSleepTransitionInsight()) return null") && app.includes("handleSleepInterpreterAction") && app.includes("openTrackScheduleBuilder();") && app.includes('setInsightFilter("sleep"); setTab("insights");'));
assert("Interpreter cards can be dismissed and stored in What we noticed", app.includes("sleepInterpreterDismissTick") && app.includes("setSleepInterpreterDismissTick") && app.includes("sleepInterpreterDismissKey") && app.includes("addObservation(\"🌙\", insight.title, insight.body"));
assert("Sleep interpreter has dedicated glass styling", styles.includes("Sleep interpreter layer") && styles.includes(".ob-app-root .ob-sleep-interpreter-card") && styles.includes("One calm card, one next step"));
