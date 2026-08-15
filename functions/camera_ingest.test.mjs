// Unit tests for the camera ingestion core (no firebase needed). Run: node camera_ingest.test.mjs
import assert from "node:assert";
import C from "./camera_ingest_core.js";

let pass = 0, fail = 0;
function t(name, fn) { try { fn(); pass++; console.log("  ✓ " + name); } catch (e) { fail++; console.log("  ✗ " + name + "\n      " + e.message); } }

// A fixed reference moment (UTC) to keep assertions deterministic.
const NOW = Date.UTC(2026, 5, 27, 13, 42, 30); // 2026-06-27 13:42:30Z

t("every camera kind maps to a carer allowlist type", () => {
  const allowed = new Set(["feed", "poop", "nappy", "nap", "nap-end", "sleep", "wake", "note"]);
  for (const [, type] of Object.entries(C.CAMERA_EVENT_KINDS)) assert.ok(allowed.has(type), type);
});

t("buildCarerEntry emits ONLY carer-safe keys + source:camera", () => {
  const allowed = new Set(["type","time","start","end","amount","feedType","poopType","note","night","nightLocked","assisted","selfSettled","assistedType","assistedDuration","settleDuration","settleTime","wakeDuration","date","loggedAt","loggedBy","sessionToken","startMs","duration","modifiedAt","source","_active","_activeNightWake","_pendingSettle","_merged","_mergedAt","_rejected"]);
  for (const kind of Object.keys(C.CAMERA_EVENT_KINDS)) {
    const e = C.buildCarerEntry(kind, NOW);
    assert.ok(e, kind);
    for (const k of Object.keys(e)) assert.ok(allowed.has(k), `${kind} emitted disallowed key ${k}`);
    assert.equal(e.source, "camera");
  }
});

t("nap onset → open nap with start+date; nap-end → end+time", () => {
  const s = C.buildCarerEntry("nap-start", NOW);
  assert.equal(s.type, "nap"); assert.equal(s.start, "13:42"); assert.equal(s.date, "2026-06-27");
  assert.ok(!("end" in s));
  const e = C.buildCarerEntry("nap-end", NOW);
  assert.equal(e.type, "nap-end"); assert.equal(e.end, "13:42"); assert.equal(e.time, "13:42");
});

t("night-wake carries night:true (bedtime stays); morning carries night:false", () => {
  assert.equal(C.buildCarerEntry("night-wake", NOW).night, true);
  assert.equal(C.buildCarerEntry("morning", NOW).night, false);
  assert.equal(C.buildCarerEntry("bedtime", NOW).type, "sleep");
});

t("feed is suggest-not-assert (a note, no amount); note bounded ≤500", () => {
  const f = C.buildCarerEntry("feed", NOW);
  assert.equal(f.type, "feed"); assert.ok(!("amount" in f)); assert.ok(f.note.length > 0);
  const n = C.buildCarerEntry("note", NOW, { note: "x".repeat(900) });
  assert.ok(n.note.length <= 500);
});

t("unknown kind → null (dropped, never written)", () => {
  assert.equal(C.buildCarerEntry("explode", NOW), null);
});

t("deterministic id is replay-safe: same device+kind+minute → same id", () => {
  const a = C.deterministicEntryId("dev1", "nap-start", NOW);
  const b = C.deterministicEntryId("dev1", "nap-start", NOW + 20000); // same minute
  const c = C.deterministicEntryId("dev1", "nap-start", NOW + 120000); // +2min → different
  const d = C.deterministicEntryId("dev2", "nap-start", NOW); // different device
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.notEqual(a, d);
  assert.ok(/^cam_[0-9a-f]{24}$/.test(a));
});

t("validateEventTime rejects a clockless camera (epoch / future / >48h stale)", () => {
  assert.equal(C.validateEventTime(0, NOW), null);                 // boot-to-epoch
  assert.equal(C.validateEventTime(NOW + 600000, NOW), null);      // 10min future
  assert.equal(C.validateEventTime(NOW - 50 * 3600000, NOW), null);// 50h stale
  assert.equal(C.validateEventTime(NOW - 3600000, NOW), NOW - 3600000); // 1h ago = ok
  assert.equal(C.validateEventTime("nan", NOW), null);
});

t("clockFields respects a timezone offset (BST +60)", () => {
  const utc = C.clockFields(NOW, 0);
  const bst = C.clockFields(NOW, 60);
  assert.equal(utc.time, "13:42");
  assert.equal(bst.time, "14:42");
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
