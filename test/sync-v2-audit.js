#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");
const rules = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

function assert(name, condition) {
  if (!condition) throw new Error(name);
  console.log("✓ " + name);
}

assert(
  "sync v2 is additive and locally rollout-gated",
  app.includes('const OB_SYNC_V2_SCHEMA = "sync-v2-shadow-2026-05"') &&
    app.includes('localStorage.getItem("ob_sync_v2_shadow_enabled") === "1"') &&
    app.includes('localStorage.getItem("ob_sync_v2_shadow_disabled") !== "1"') &&
    app.includes('localStorage.getItem("ob_sync_v2_read_enabled") === "1"')
);

assert(
  "sync v2 read-shadow audit is separately gated and build-toggleable",
  app.includes('function syncV2ReadShadowEnabled()') &&
    app.includes('__OB_SYNC_V2_READ_SHADOW_BUILD__') &&
    app.includes('localStorage.getItem("ob_sync_v2_read_shadow_enabled") === "1"') &&
    app.includes('localStorage.getItem("ob_sync_v2_read_shadow_disabled") !== "1"') &&
    app.includes('const OB_SYNC_V2_READ_SHADOW_PREFIX = "ob_sync_v2_read_shadow_last_"') &&
    fs.readFileSync(path.join(root, "build-pwa.sh"), "utf8").includes("VITE_OB_SYNC_V2_READ_SHADOW")
);

assert(
  "family sync v2 writes smaller profile, shared and per-day documents",
  app.includes('fsSet("family_sync_v2", safeCode') &&
    app.includes('"/children", childId') &&
    app.includes('"/shared", "core"') &&
    app.includes('"/days", dayKey') &&
    app.includes('syncV2EntryPayload(entries)')
);

assert(
  "sync v2 stores day payloads by hash so unchanged days are not rewritten",
  app.includes("OB_SYNC_V2_FAMILY_HASH_PREFIX") &&
    app.includes("OB_SYNC_V2_CHILD_HASH_PREFIX") &&
    app.includes("syncV2Hash(payload)") &&
    app.includes("if(hashes[hashKey] === hash) continue;")
);

assert(
  "sync v2 avoids cloud-syncing local image data",
  app.includes("syncV2ScrubValue") &&
    app.includes("/^data:image\\//i.test(value)") &&
    app.includes("photo|photos|image|images|blob|dataurl|dataUrl|screenshot|thumbnail")
);

assert(
  "legacy family and child sync writes remain in place for rollback",
  app.includes('await fsSet("families", code, {') &&
    app.includes('children: JSON.stringify(cleanForCloud)') &&
    app.includes('await fsSet("child_syncs", code, {') &&
    app.includes('child: JSON.stringify(child)')
);

assert(
  "shadow writes are queued after legacy writes rather than replacing them",
  app.includes("queueSyncV2FamilyShadow(code, cleanForCloud") &&
    app.includes("queueSyncV2ChildShadow(code, childId, child")
);

assert(
  "firestore rules allow only the new v2 shadow collections",
  rules.includes("match /family_sync_v2/{code}") &&
    rules.includes("match /child_sync_v2/{code}") &&
    rules.includes("validSyncV2FamilyRootWrite()") &&
    rules.includes("validSyncV2ChildProfileWrite()") &&
    rules.includes("validSyncV2PayloadWrite()")
);

assert(
  "child sync v2 writes require the existing child_syncs ownership/participant relationship",
  rules.includes("function childSyncDocParticipant(code)") &&
    rules.includes("allow create, update: if childSyncDocParticipant(code)")
);

assert(
  "sync v2 docs are bounded to keep payloads below Firestore document limits",
  rules.includes("boundedString(request.resource.data.payload, 900000)") &&
    app.includes("if(payload.length > 850000)")
);

assert(
  "sync v2 read-shadow reconstructs and compares v2 without replacing legacy UI",
  app.includes("async function readSyncV2ChildForAudit") &&
    app.includes('await fsGet("child_sync_v2", safeCode)') &&
    app.includes('await fsGet("child_sync_v2/" + safeCode + "/profile", "core")') &&
    app.includes('await fsGet("child_sync_v2/" + safeCode + "/extras", "core")') &&
    app.includes('await fsGet("child_sync_v2/" + safeCode + "/days", dayKey)') &&
    app.includes("function syncV2CompareChildRead") &&
    app.includes("syncV2Hash(syncV2ChildProfile(legacy, safeChildId))") &&
    app.includes("const expectedHash = syncV2Hash(expectedPayload)") &&
    app.includes('queueSyncV2ChildReadShadowAudit(code, childId, child, "after-child-sync-write")') &&
    app.includes('queueSyncV2ChildReadShadowAudit(code, childId, shadowChild, "child-sync-snapshot")') &&
    !app.includes("setChildren(syncV2")
);

assert(
  "sync v2 audit is part of the npm test suite",
  pkg.scripts["test:sync-v2"] === "node test/sync-v2-audit.js" &&
    pkg.scripts.test.includes("npm run test:sync-v2")
);

console.log("Sync v2 audit passed.");
