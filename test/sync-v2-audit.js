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
    app.includes('children: JSON.stringify(legacyChildrenForCloud)') &&
    app.includes('await fsSet("child_syncs", code, {') &&
    app.includes('child: JSON.stringify(legacyChildForCloud)')
);

assert(
  "legacy sync strips image/base64 media before writing billing-heavy docs",
  app.includes("function stripFirestoreLegacyMedia(") &&
    app.includes("isChildProfileNode") &&
    app.includes('k === "photo"') &&
    app.includes('safeAppImageSrc(v, "")') &&
    app.includes("stripFirestoreLegacyMediaChildren(cleanForCloud)") &&
    app.includes("stripFirestoreLegacyMediaChild(childForCloud)") &&
    app.includes("CHILD_PUSH_MIN_INTERVAL = 60000") &&
    app.includes("PUSH_MIN_INTERVAL = 60000")
);

assert(
  "same-account device sync uses writeToken, not UID, to suppress local echo",
  app.includes("if(d.writeToken && d.writeToken === writeTokenRef.current) return;") &&
    !app.includes("if(myUid && d.updatedBy === myUid) return;") &&
    !app.includes("if(d.updatedBy && window._fbUid && d.updatedBy === window._fbUid) return;")
);

assert(
  "child sync subscriptions refresh when codes restore after Firebase readiness",
  app.includes("Object.entries(childSyncCodes).forEach(([childId, code]) => {") &&
    app.includes("subscribeToChildSync(childId, code);") &&
    app.includes("},[fbReady, childSyncCodes, subscribeToChildSync]);")
);

assert(
  "account identity repair rebinds current UID to existing child sync codes",
  app.includes("async function repairFirebaseIdentityForLocalAccount") &&
    app.includes('repairFirebaseIdentityForLocalAccount("restore-existing-account")') &&
    app.includes("async function rebindChildSyncIdentityForCurrentUser") &&
    app.includes('await rebindChildSyncIdentityForCurrentUser(_parseChildSyncCodes(localStorage.getItem("child_sync_codes_v1")))') &&
    app.includes('await fsSet("child_syncs", cleanCode, {') &&
    app.includes("participantUids: nextUids")
);

assert(
  "child sync pushes repair wrong owner UID before writing as a participant",
  app.includes('resetFirebaseIdentityForAccountSwitch("child-sync-owner-uid-mismatch")') &&
    app.includes("localUsername !== ownerUsername") &&
    app.includes("if(resetUid) writerUid = resetUid;")
);

assert(
  "family cloud push waits for child sync mirrors to finish",
  app.includes("await Promise.all(Object.entries(_csc).map(([cid, syncCode]) => {") &&
    app.includes("return pushChildSync(cid, syncCode, allChildren[cid]);")
);

assert(
  "rest firestore reads decode array fields for child sync participant checks",
  app.includes("function syncV2PlainValue(value)") &&
    app.includes("if(value.arrayValue) return Object.values(value.arrayValue.values || {}).map(syncV2PlainValue);") &&
    app.includes("for(const [k,v] of Object.entries(fields)) parsed[k] = syncV2PlainValue(v);")
);

assert(
  "shadow writes are queued after legacy writes rather than replacing them",
  app.includes("queueSyncV2FamilyShadow(code, cleanForCloud") &&
    app.includes("queueSyncV2ChildShadow(code, childId, childForCloud")
);

assert(
  "child sync legacy writes merge cloud days before overwrite",
  app.includes("function mergeChildSyncCloudChildForPush") &&
    app.includes('deletedDaysRef.current.has(childId + ":" + dayKey)') &&
    app.includes("deletedEntryIdsRef.current.has(id)") &&
    app.includes("childForCloud = mergeChildSyncCloudChildForPush(childId, childForCloud, cloudChild);")
);

assert(
  "child sync legacy writes and reads deletion tombstones",
  app.includes("function _absorbChildSyncTombstones(data)") &&
    app.includes("_absorbChildSyncTombstones(existingData);") &&
    app.includes("_absorbChildSyncTombstones(d);") &&
    app.includes("deletedEntryIds: JSON.stringify(_deletedEntryIdsArrayForCloud(500))") &&
    app.includes("deletedDays: JSON.stringify(_deletedDaysArrayForCloud(childId, 200))") &&
    app.includes("mergedDays[date] = normaliseDayEntries(mergedDays[date]).filter(e =>") &&
    app.includes("Object.entries(childSyncCodes || {}).forEach(([cid, syncCode])")
);

assert(
  "child sync join makes the linked baby visible and avoids blank mirror pushes",
  app.includes('localStorage.setItem("active_child", childId);') &&
    app.includes("setActiveChildId(childId);") &&
    app.includes("if(childrenSnapshot[childId]) pushChildSync(childId, code, childrenSnapshot[childId]);") &&
    app.includes("_promoteChildSyncChildIfBlank(syncChildId, remoteChild);")
);

assert(
  "child sync participants are de-duplicated by account name as well as uid",
  app.includes("function _dedupeChildSyncParticipantsForCloud(participants)") &&
    app.includes("const visibleParticipants = React.useMemo(() => {") &&
    app.includes("normaliseUsername((localStorage.getItem(\"family_username\") || \"\").toString())") &&
    app.includes("const _joinerUsername = normaliseUsername((_participantEntry.username || \"\").toString());")
);

assert(
  "synced active nap timers stay live even when an older build wrote a moving end time",
  app.includes("if (e._active === true) return true;") &&
    app.includes("return {...e, end:e.start, duration:0, modifiedAt:Date.now()};") &&
    app.includes("Finalise only old stale stubs") === false &&
    app.includes("Finalize only old stale stubs; recent synced stubs may still be running on another device.") &&
    app.includes("clockNapOnThisDay && isActiveNapStub(entry)")
);

assert(
  "android foreground timer restarts after a synced timer is recovered",
  app.includes("},[babyName, bedTimerDay, resolvedActiveId, napOn, napStartT, napStartMs, bedPaused]);") &&
    app.includes('_androidTimerStart({type:"nap", startTime:startMs, babyName:safeName});')
);

assert(
  "child sync codes recover after native reinstall before partner pushes resume",
  app.includes("const mirrorSyncCodes = _parseChildSyncCodes(mirror && mirror.childSyncCodes);") &&
    app.includes('localStorage.setItem("child_sync_codes_v1", JSON.stringify({...mirrorSyncCodes, ...storedCodes}))') &&
    app.includes("const childSyncRestoreAttemptRef = React.useRef(false);") &&
    app.includes("restoreChildSyncCodesFromCloud(childIds, childMap).catch(()=>{ childSyncRestoreAttemptRef.current = false; });")
);

assert(
  "family cloud push self-heals child sync codes instead of overwriting with empty map",
  app.includes("await restoreChildSyncCodesFromCloud(Object.keys(cleanForCloud || {}), cleanForCloud);") &&
    app.includes("_syncCodesForCloud = _parseChildSyncCodes(localStorage.getItem(\"child_sync_codes_v1\"));") &&
    app.includes("if (!Object.keys(_syncCodesForCloud).length && _cloudData.childSyncCodes)") &&
    app.includes("Object.entries(_cloudSyncCodes).forEach(([cid, sc]) => subscribeToChildSync(cid, sc));")
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
    app.includes('queueSyncV2ChildReadShadowAudit(code, childId, childForCloud, "after-child-sync-write")') &&
    app.includes('queueSyncV2ChildReadShadowAudit(code, syncChildId, shadowChild, "child-sync-snapshot")') &&
    !app.includes("setChildren(syncV2")
);

assert(
  "sync v2 audit is part of the npm test suite",
  pkg.scripts["test:sync-v2"] === "node test/sync-v2-audit.js" &&
    pkg.scripts.test.includes("npm run test:sync-v2")
);

console.log("Sync v2 audit passed.");
