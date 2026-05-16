#!/usr/bin/env node
/**
 * OBubba Eternal Loop Test Runner
 *
 * Runs ALL test suites continuously in a loop. Each cycle runs every test,
 * reports results, then starts again. Stops on Ctrl+C.
 *
 * Covers: sleep engine, sync, timers, UI, security, native bridge, premium,
 * user simulation, data safety, privacy, analytics, and more.
 */

const { execSync } = require("child_process");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

// All test suites in execution order (fast tests first, slow tests last)
const SUITES = [
  // Core logic
  { name: "Time Helpers", cmd: "test:time-helpers" },
  { name: "Sleep Engine", cmd: "test:sleep" },
  { name: "Sleep Transitions", cmd: "test:sleep-transition" },
  { name: "Sleep Interpreter", cmd: "test:sleep-interpreter" },
  { name: "Sleep Rescue Copy", cmd: "test:sleep-rescue" },
  { name: "Day Boundaries", cmd: "test:day-boundary" },

  // Data integrity
  { name: "User Simulation", cmd: "test:user-sim" },
  { name: "Imported Data Safety", cmd: "test:imported-data" },
  { name: "App Safe Time Parser", cmd: "test:app-safe-time" },
  { name: "JSON Parse Safety", cmd: "test:json-parse" },
  { name: "Local Storage Shapes", cmd: "test:local-storage-shapes" },
  { name: "Runtime Safety", cmd: "test:runtime-safety" },
  { name: "Text Shapes", cmd: "test:text-shapes" },

  // Sync & cloud
  { name: "Sync V2", cmd: "test:sync-v2" },
  { name: "Firestore Rules", cmd: "test:firestore-rules" },
  { name: "Clock Presence", cmd: "test:clock-presence" },

  // Security & privacy
  { name: "Account Security", cmd: "test:account-security" },
  { name: "Session Cleanup", cmd: "test:session-cleanup" },
  { name: "Onboarding Account", cmd: "test:onboarding-account" },
  { name: "Logging Privacy", cmd: "test:logging-privacy" },
  { name: "Share Payloads", cmd: "test:share-payloads" },

  // Native
  { name: "Native Bridge", cmd: "test:native-bridge" },
  { name: "Native Actions", cmd: "test:native-actions" },
  { name: "Native Time", cmd: "test:native-time" },

  // UI & polish
  { name: "UI Polish", cmd: "test:ui-polish" },
  { name: "Viewport Overflow", cmd: "test:viewport-overflow" },
  { name: "App Images", cmd: "test:app-images" },

  // External
  { name: "External Links", cmd: "test:external-links" },
  { name: "Phone Links", cmd: "test:phone-links" },
  { name: "Outbound Actions", cmd: "test:outbound-actions" },
  { name: "Export HTML", cmd: "test:export-html" },
  { name: "Carer Portal", cmd: "test:carer-portal" },

  // Premium & store
  { name: "Premium Entitlement", cmd: "test:premium-entitlement" },
  { name: "Store Readiness", cmd: "test:store-readiness" },
  { name: "Build Artifacts", cmd: "test:build-artifacts" },

  // Analytics & i18n
  { name: "Analytics Taxonomy", cmd: "test:analytics" },
  { name: "i18n", cmd: "test:i18n" },
  { name: "Dependencies", cmd: "test:deps" },
  { name: "Functions", cmd: "test:functions" },
];

let cycle = 0;
let totalPassed = 0;
let totalFailed = 0;
let totalErrors = 0;

function runSuite(suite) {
  const start = Date.now();
  try {
    const output = execSync(`npm run ${suite.cmd}`, {
      cwd: ROOT,
      timeout: 120000,
      stdio: "pipe",
      encoding: "utf8",
    });
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    // Count common audit output styles ("ok ..." and "✓ ...").
    const okCount = (output.match(/^(?:ok |✓ )/gm) || []).length;
    const failCount = (output.match(/^(?:FAIL |✗ )/gm) || []).length;

    if (failCount > 0) {
      // Extract failure details
      const failLines = output.split("\n").filter(l => l.startsWith("FAIL ") || l.startsWith("✗ "));
      console.log(`  FAIL  ${suite.name} (${elapsed}s) — ${failCount} failure(s), ${okCount} passed`);
      failLines.forEach(l => console.log(`        ${l}`));
      totalFailed += failCount;
      totalPassed += okCount;
      return { status: "fail", failures: failCount, passed: okCount };
    }

    console.log(`  ✓     ${suite.name} (${elapsed}s) — ${okCount} passed`);
    totalPassed += okCount;
    return { status: "pass", passed: okCount };
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const stderr = (err.stderr || "").trim();
    const stdout = (err.stdout || "").trim();

    // Check if tests ran but had failures (exit code 1)
    const combined = [stdout, stderr].filter(Boolean).join("\n");
    const okCount = (combined.match(/^(?:ok |✓ )/gm) || []).length;
    const failCount = (combined.match(/^(?:FAIL |✗ )/gm) || []).length;

    if (failCount > 0) {
      const failLines = combined.split("\n").filter(l => l.startsWith("FAIL ") || l.startsWith("✗ "));
      console.log(`  FAIL  ${suite.name} (${elapsed}s) — ${failCount} failure(s), ${okCount} passed`);
      failLines.slice(0, 5).forEach(l => console.log(`        ${l}`));
      if (failLines.length > 5) console.log(`        ... and ${failLines.length - 5} more`);
      totalFailed += failCount;
      totalPassed += okCount;
      return { status: "fail", failures: failCount, passed: okCount };
    }

    // Actual error (crash, timeout, etc.)
    const errMsg = stderr.split("\n")[0] || err.message || "unknown error";
    console.log(`  ERROR ${suite.name} (${elapsed}s) — ${errMsg}`);
    totalErrors++;
    return { status: "error", message: errMsg };
  }
}

function runCycle() {
  cycle++;
  const cycleStart = Date.now();

  console.log("");
  console.log("═".repeat(70));
  console.log(`  CYCLE ${cycle} — ${new Date().toLocaleTimeString()}`);
  console.log("═".repeat(70));

  const cyclePassed = totalPassed;
  const cycleFailed = totalFailed;
  const cycleErrors = totalErrors;

  const results = [];
  for (const suite of SUITES) {
    results.push({ ...suite, ...runSuite(suite) });
  }

  const elapsed = ((Date.now() - cycleStart) / 1000).toFixed(0);
  const newPassed = totalPassed - cyclePassed;
  const newFailed = totalFailed - cycleFailed;
  const newErrors = totalErrors - cycleErrors;

  console.log("");
  console.log("─".repeat(70));
  console.log(`  CYCLE ${cycle} COMPLETE in ${elapsed}s`);
  console.log(`  Passed: ${newPassed}  |  Failed: ${newFailed}  |  Errors: ${newErrors}`);
  console.log(`  Lifetime: ${totalPassed} passed, ${totalFailed} failed, ${totalErrors} errors across ${cycle} cycles`);

  if (newFailed > 0 || newErrors > 0) {
    console.log("");
    console.log("  FAILURES THIS CYCLE:");
    results.filter(r => r.status === "fail" || r.status === "error").forEach(r => {
      console.log(`    ✗ ${r.name}: ${r.status === "fail" ? r.failures + " test(s)" : r.message}`);
    });
  } else {
    console.log("  ALL CLEAR ✓");
  }
  console.log("─".repeat(70));

  // Brief pause between cycles
  console.log(`\n  Next cycle in 5 seconds... (Ctrl+C to stop)\n`);
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n");
  console.log("═".repeat(70));
  console.log("  ETERNAL LOOP STOPPED");
  console.log(`  ${cycle} cycles completed`);
  console.log(`  ${totalPassed} passed  |  ${totalFailed} failed  |  ${totalErrors} errors`);
  console.log("═".repeat(70));
  process.exit(0);
});

// Main loop
console.log("═".repeat(70));
console.log("  OBubba Eternal Loop Test Runner");
console.log(`  ${SUITES.length} test suites loaded`);
console.log("  Press Ctrl+C to stop");
console.log("═".repeat(70));

function loop() {
  runCycle();
  setTimeout(loop, 5000);
}

loop();
