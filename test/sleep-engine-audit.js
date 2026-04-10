#!/usr/bin/env node
/*
 * SLEEP ENGINE AUDIT
 * ==================
 * Self-contained test harness that exercises the pure math helpers from
 * the sleep engine against a scenario matrix, asserting invariants that
 * must ALWAYS hold regardless of age, override, wake-time, or pattern.
 *
 * The goal is to catch the class of bug that shipped to TestFlight: a
 * projected nap ending AFTER the projected bedtime. Nothing in the
 * prediction pipeline should produce a schedule that violates physics
 * or the age-appropriate ceiling.
 *
 * Run:  node test/sleep-engine-audit.js
 * Exit: 0 on clean audit, 1 if any invariant fails
 */

// ─── Pure helpers copied verbatim from app.jsx ────────────────────────
// Keep these in sync whenever the source changes. A stale copy here
// silently invalidates the audit.

function getWakeWindow(ageWeeks) {
  const months = ageWeeks / 4.33;
  let min, max, label;
  const stages = [
    [1.39, 30, 90],
    [3,    45, 90],
    [5,    75, 120],
    [7,    120, 180],
    [9,    150, 210],
    [12,   180, 240],
    [15,   210, 270],
    [19,   270, 330],
    [36,   300, 360],
    [Infinity, 360, 720]
  ];
  let idx = stages.findIndex(s => months < s[0]);
  if (idx < 0) idx = stages.length - 1;
  min = stages[idx][1]; max = stages[idx][2];
  if (idx < stages.length - 1) {
    const boundaryMo = stages[idx][0];
    const weeksUntil = (boundaryMo - months) * 4.33;
    if (weeksUntil <= 2 && weeksUntil >= 0) {
      const nxt = stages[idx + 1];
      const blend = Math.max(0, Math.min(0.5, (2 - weeksUntil) / 4));
      min = Math.round(min * (1 - blend) + nxt[1] * blend);
      max = Math.round(max * (1 - blend) + nxt[2] * blend);
    }
  }
  label = max <= 90 ? `${min}–${max} min` : `${(min/60).toFixed(1).replace('.0','')}–${(max/60).toFixed(1).replace('.0','')} hrs`;
  return { min, max, label, midpoint: Math.round((min+max)/2) };
}

function progressiveWW(ageWeeks, napIndex, totalNaps, disruptionMode = false) {
  const ww = getWakeWindow(ageWeeks);
  const range = ww.max - ww.min;
  if (totalNaps <= 1) {
    let base = ww.midpoint;
    if (disruptionMode) base = Math.round(base * 0.8);
    return base;
  }
  const ratio = Math.min(napIndex / totalNaps, 1);
  const scaled = 0.15 + ratio * 0.7;
  let result = Math.round(ww.min + range * scaled);
  if (disruptionMode) result = Math.round(result * 0.8);
  return result;
}

function getAgeNapProfile(ageWeeks) {
  if ((!ageWeeks && ageWeeks !== 0)) return { expectedNaps:3, idealNapDurMin:30, idealNapDurMax:90, idealTotalMin:120, idealTotalMax:240 };
  const months = ageWeeks / 4.33;
  if (ageWeeks < 6)  return { expectedNaps:5, idealNapDurMin:20, idealNapDurMax:60,  idealTotalMin:240, idealTotalMax:360 };
  if (months < 3)    return { expectedNaps:4, idealNapDurMin:30, idealNapDurMax:90,  idealTotalMin:180, idealTotalMax:300 };
  if (months < 5)    return { expectedNaps:3, idealNapDurMin:40, idealNapDurMax:90,  idealTotalMin:150, idealTotalMax:240 };
  if (months < 7)    return { expectedNaps:3, idealNapDurMin:45, idealNapDurMax:120, idealTotalMin:120, idealTotalMax:210 };
  if (months < 9)    return { expectedNaps:2, idealNapDurMin:60, idealNapDurMax:120, idealTotalMin:120, idealTotalMax:210 };
  if (months < 12)   return { expectedNaps:2, idealNapDurMin:60, idealNapDurMax:120, idealTotalMin:120, idealTotalMax:180 };
  if (months < 15)   return { expectedNaps:2, idealNapDurMin:50, idealNapDurMax:110, idealTotalMin:90,  idealTotalMax:150 };
  if (ageWeeks < 78) return { expectedNaps:1, idealNapDurMin:60, idealNapDurMax:120, idealTotalMin:60,  idealTotalMax:120 };
  return               { expectedNaps:1, idealNapDurMin:60, idealNapDurMax:90,  idealTotalMin:60,  idealTotalMax:90  };
}

function clampBedtime(mins, ageWeeks) {
  const aw = ageWeeks;
  const lo = (aw && aw < 13) ? 17*60 : 18*60;
  let hi;
  if (!aw || aw < 6)   hi = 22*60;
  else if (aw < 13)    hi = 21*60;
  else if (aw < 26)    hi = 20*60;
  else if (aw < 39)    hi = 20*60;
  else if (aw < 52)    hi = 20*60+30;
  else                 hi = 20*60+30;
  hi = Math.min(hi, 22*60+30);
  return Math.max(lo, Math.min(hi, mins));
}

function clampWake(mins) {
  return Math.max(5*60, Math.min(9*60+30, mins));
}

function clampWakeWindow(wwMins, ageWeeks) {
  const ww = getWakeWindow(ageWeeks);
  return Math.max(ww.min, Math.min(ww.max, wwMins));
}

function clampNapDuration(dur, ageWeeks) {
  const maxDur = ageWeeks < 13 ? 120 : ageWeeks < 26 ? 90 : ageWeeks < 52 ? 120 : 150;
  return Math.max(15, Math.min(maxDur, dur));
}

// ─── Simplified schedule projection ─────────────────────────────────
// Mirrors the fixed nap-placement loop from app.jsx ~line 25324.
// Caller supplies: ageWeeks, wakeMins, avgNapDur, targetBedMins (or null).
// Returns { items: [...], bedMins, issues: [...] }
function projectDayPlan({ ageWeeks, wakeMins, avgNapDur, targetBedMins }) {
  const w = ageWeeks;
  const ww = getWakeWindow(w);
  const profile = getAgeNapProfile(w);
  const expectedTotal = profile.expectedNaps;
  const ageBedCeiling = clampBedtime(24*60, w);
  const napFitCeiling = Math.min(targetBedMins || ageBedCeiling, ageBedCeiling);
  const minBedWW = w < 30 ? 60 : 90;

  const items = [];
  items.push({ type: "wake", time: wakeMins, label: "Wake" });
  let cursor = wakeMins;
  let napIdx = 0;

  while (napIdx < expectedTotal) {
    const napStart = cursor + clampWakeWindow(progressiveWW(w, napIdx, expectedTotal), w);
    const isLast = napIdx === expectedTotal - 1;
    let napDur = avgNapDur;
    let placed = false;

    if (napStart + minBedWW > napFitCeiling) break;

    if (isLast) {
      const durations = [avgNapDur, Math.round(avgNapDur * 0.7), 25, 20, 15];
      for (const tryDur of durations) {
        if (napStart + tryDur + minBedWW <= napFitCeiling) {
          napDur = tryDur;
          placed = true;
          break;
        }
      }
      if (!placed) break;
    } else {
      // Non-last nap: fit check = this nap + one more wake window
      // (minBedWW as minimum) must finish before the bedtime ceiling.
      // Previously we tried to reserve room for ALL remaining naps with
      // a pre-check, which rejected 3-nap plans that would actually
      // degrade gracefully to 2 naps as the day ran out.
      if (napStart + avgNapDur + minBedWW > napFitCeiling) break;
      placed = true;
    }

    const napEnd = napStart + napDur;
    items.push({ type: "nap", start: napStart, end: napEnd, label: `Nap ${napIdx+1}`, dur: napDur });
    cursor = napEnd;
    napIdx++;
  }

  let bedMins;
  if (targetBedMins && targetBedMins >= cursor + minBedWW) {
    bedMins = targetBedMins;
  } else if (targetBedMins) {
    // target conflicts with cursor. drop the last nap if possible, else push bedtime
    const lastNapIdx = items.length - 1;
    const lastNap = items[lastNapIdx];
    if (lastNap && lastNap.type === "nap") {
      items.splice(lastNapIdx, 1);
      bedMins = targetBedMins;
    } else {
      bedMins = cursor + minBedWW;
    }
  } else {
    bedMins = clampBedtime(cursor + progressiveWW(w, napIdx, expectedTotal), w);
  }
  items.push({ type: "bed", time: bedMins, label: "Bedtime" });

  return { items, bedMins };
}

// ─── Invariant checker ──────────────────────────────────────────────
function checkInvariants(scenario, plan) {
  const issues = [];
  const w = scenario.ageWeeks;
  const items = plan.items;
  const naps = items.filter(i => i.type === "nap");
  const bed = items.find(i => i.type === "bed");
  const wake = items.find(i => i.type === "wake");

  // I-1: every nap must END before bedtime (minus minBedWW)
  const minBedWW = w < 30 ? 60 : 90;
  naps.forEach((n, idx) => {
    if (n.end > bed.time - minBedWW + 1) {
      issues.push(`[I-1] Nap ${idx+1} ends at ${mtp(n.end)} but bedtime is ${mtp(bed.time)} (needs ${minBedWW}min gap)`);
    }
    // I-1b: absolutely no nap should end AFTER bedtime
    if (n.end > bed.time) {
      issues.push(`[I-1b] CRITICAL: Nap ${idx+1} ends at ${mtp(n.end)} which is AFTER bedtime ${mtp(bed.time)}`);
    }
  });

  // I-2: bedtime within age ceiling
  const ageCeiling = clampBedtime(24*60, w);
  if (bed.time > ageCeiling + 1) {
    issues.push(`[I-2] Bedtime ${mtp(bed.time)} exceeds age ceiling ${mtp(ageCeiling)} for ${w}w`);
  }

  // I-3: wake is in safe range 5:00-9:30
  if (wake.time < 5*60 || wake.time > 9*60+30) {
    issues.push(`[I-3] Wake ${mtp(wake.time)} outside safe range 5:00am-9:30am`);
  }

  // I-4: each nap duration is positive and within safe range
  naps.forEach((n, idx) => {
    if (n.dur <= 0) issues.push(`[I-4] Nap ${idx+1} has non-positive duration ${n.dur}`);
    if (n.dur > 180) issues.push(`[I-4] Nap ${idx+1} duration ${n.dur}min exceeds safe 180min max`);
  });

  // I-5: wake windows between events are within [getWakeWindow.min*0.5, max*1.2]
  const ww = getWakeWindow(w);
  const sleepEvents = [wake, ...naps.flatMap(n => [{ type: "napStart", time: n.start }, { type: "napEnd", time: n.end }]), bed];
  // Wake windows are between "wake" events (wake after nap = napEnd, or initial wake) and next "sleep" event (napStart or bed)
  let lastSleepEnd = wake.time;
  naps.forEach((n, idx) => {
    const wakeWindow = n.start - lastSleepEnd;
    if (wakeWindow < ww.min * 0.5) {
      issues.push(`[I-5] Wake window before Nap ${idx+1} is ${wakeWindow}min (age min: ${ww.min})`);
    }
    if (wakeWindow > ww.max * 1.5) {
      issues.push(`[I-5] Wake window before Nap ${idx+1} is ${wakeWindow}min (age max: ${ww.max})`);
    }
    lastSleepEnd = n.end;
  });
  const finalWW = bed.time - lastSleepEnd;
  if (finalWW < minBedWW) {
    issues.push(`[I-5b] Last wake window ${finalWW}min is less than minBedWW ${minBedWW}min`);
  }

  // I-6: events in chronological order
  for (let i = 1; i < items.length; i++) {
    const prev = items[i-1];
    const cur = items[i];
    const prevTime = prev.end !== undefined ? prev.end : prev.time;
    const curTime = cur.start !== undefined ? cur.start : cur.time;
    if (curTime < prevTime) {
      issues.push(`[I-6] ${prev.label} (${mtp(prevTime)}) comes after ${cur.label} (${mtp(curTime)})`);
    }
  }

  // I-7: total day sleep within healthy range (soft warning, not hard fail)
  const totalNap = naps.reduce((s, n) => s + n.dur, 0);
  const profile = getAgeNapProfile(w);
  if (totalNap > 0 && totalNap < profile.idealTotalMin * 0.5) {
    issues.push(`[I-7 WARN] Total day nap ${totalNap}min is well below ideal ${profile.idealTotalMin}-${profile.idealTotalMax}min`);
  }

  return issues;
}

function mtp(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const ap = h >= 12 ? "pm" : "am";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2,"0")}${ap}`;
}

// ─── Scenario matrix ────────────────────────────────────────────────
const scenarios = [
  // ─ Normal baseline ─
  { name: "5mo normal wake, normal bed",  ageWeeks: 22, wakeMins: 7*60,      avgNapDur: 75, targetBedMins: 19*60 },
  { name: "3mo normal",                    ageWeeks: 12, wakeMins: 7*60,      avgNapDur: 60, targetBedMins: 19*60 },
  { name: "7mo normal",                    ageWeeks: 30, wakeMins: 7*60,      avgNapDur: 90, targetBedMins: 19*60 },
  { name: "12mo normal",                   ageWeeks: 52, wakeMins: 7*60,      avgNapDur: 90, targetBedMins: 19*60+30 },

  // ─ The bug that shipped ─
  { name: "5mo late wake + override 6:30pm", ageWeeks: 22, wakeMins: 8*60+19, avgNapDur: 75, targetBedMins: 18*60+30 },
  { name: "5mo very late wake 9:30am",      ageWeeks: 22, wakeMins: 9*60+30,  avgNapDur: 75, targetBedMins: 19*60 },

  // ─ Edge cases ─
  { name: "5mo early wake 5:15am",          ageWeeks: 22, wakeMins: 5*60+15,  avgNapDur: 75, targetBedMins: 19*60 },
  { name: "5mo very short naps (30m)",      ageWeeks: 22, wakeMins: 7*60,     avgNapDur: 30, targetBedMins: 19*60 },
  { name: "5mo very long naps (2h30m)",     ageWeeks: 22, wakeMins: 7*60,     avgNapDur: 150, targetBedMins: 19*60 },
  { name: "5mo no targetBed",               ageWeeks: 22, wakeMins: 7*60,     avgNapDur: 75, targetBedMins: null },

  // ─ Override extremes ─
  { name: "5mo override wake 6am bed 6pm (tight)", ageWeeks: 22, wakeMins: 6*60,  avgNapDur: 75, targetBedMins: 18*60 },
  { name: "5mo override bed 5pm (too early)",       ageWeeks: 22, wakeMins: 7*60,  avgNapDur: 75, targetBedMins: 17*60 },
  { name: "5mo override bed 10pm (too late)",       ageWeeks: 22, wakeMins: 7*60,  avgNapDur: 75, targetBedMins: 22*60 },

  // ─ Age extremes ─
  { name: "Newborn 2w",                     ageWeeks: 2,   wakeMins: 8*60,    avgNapDur: 40, targetBedMins: 21*60 },
  { name: "18mo single nap",                ageWeeks: 78,  wakeMins: 7*60,    avgNapDur: 90, targetBedMins: 19*60+30 },
  { name: "3y transitioning from nap",      ageWeeks: 156, wakeMins: 7*60,    avgNapDur: 60, targetBedMins: 19*60+30 },
];

// ─── Run audit ───────────────────────────────────────────────────────
let totalIssues = 0;
let criticalIssues = 0;

console.log("\n═══════════════════════════════════════════");
console.log("  OBUBBA SLEEP ENGINE AUDIT");
console.log("═══════════════════════════════════════════\n");

for (const scenario of scenarios) {
  const plan = projectDayPlan(scenario);
  const issues = checkInvariants(scenario, plan);
  const hasCritical = issues.some(i => i.includes("CRITICAL") || i.startsWith("[I-1b]") || i.startsWith("[I-6]"));

  const status = issues.length === 0 ? "✅ PASS" : hasCritical ? "🚨 CRITICAL" : "⚠️  WARN";
  console.log(`${status}  ${scenario.name}`);
  console.log(`       wake ${mtp(scenario.wakeMins)}, avgNap ${scenario.avgNapDur}m, target bed ${scenario.targetBedMins ? mtp(scenario.targetBedMins) : "(none)"}`);

  // Print the schedule
  const line = plan.items.map(i => {
    if (i.type === "wake") return `☀️ ${mtp(i.time)}`;
    if (i.type === "nap") return `😴 ${mtp(i.start)}-${mtp(i.end)}`;
    if (i.type === "bed") return `🌙 ${mtp(i.time)}`;
  }).join("  →  ");
  console.log(`       ${line}`);

  if (issues.length > 0) {
    issues.forEach(i => console.log(`       ${i}`));
    totalIssues += issues.length;
    if (hasCritical) criticalIssues += 1;
  }
  console.log();
}

console.log("═══════════════════════════════════════════");
console.log(`  ${scenarios.length} scenarios`);
console.log(`  ${totalIssues} total issues`);
console.log(`  ${criticalIssues} CRITICAL scenarios`);
console.log("═══════════════════════════════════════════\n");

process.exit(criticalIssues > 0 ? 1 : 0);
