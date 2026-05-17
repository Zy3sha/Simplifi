#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");
const rules = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const localPreviewCollectionsAt = app.indexOf("const OB_LOCAL_PREVIEW_WRITE_COLLECTIONS = new Set([");
const localPreviewCollectionsBlock = localPreviewCollectionsAt >= 0
  ? app.slice(localPreviewCollectionsAt, app.indexOf("]);", localPreviewCollectionsAt) + 3)
  : "";
const activeTimerSyncAt = app.indexOf("// Sync active timer state so partner's device sees it");
const activeTimerSyncBlock = activeTimerSyncAt >= 0
  ? app.slice(activeTimerSyncAt, app.indexOf("        }\n      } catch {}", activeTimerSyncAt) + "        }\n      } catch {}".length)
  : "";

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
  app.includes('await fsSet("families", code, _familiesPayload') &&
    app.includes("_familiesPayload.children = _legacyChildrenJson") &&
    app.includes('await fsSet("child_syncs", code, {') &&
    app.includes("child: legacyChildJson")
);

assert(
  "legacy sync avoids re-sending full child and family histories when unchanged",
  app.includes('_existingChildrenHash !== _legacyChildrenHash') &&
    app.includes('OB_FAMILY_LEGACY_PUSH_HASH_PREFIX = "ob_family_legacy_push_hash_"') &&
    app.includes("function _legacyFamilyPayloadHashValue(payload)") &&
    app.includes("const _familyPushHash = _legacyFamilyPayloadHashValue(_familiesPayload)") &&
    app.includes("const _familyPushKey = _syncCacheKey(OB_FAMILY_LEGACY_PUSH_HASH_PREFIX, code)") &&
    app.includes('await fsSet("families", code, _familiesPayload, !_familiesPayload.children)') &&
    app.includes('const existingChildJson = typeof existingChildSyncData.child === "string"') &&
    app.includes('if (') &&
    app.includes('existingHash === nextHash') &&
    app.includes('queueSyncV2ChildReadShadowAudit(code, childId, childForCloud, "child-sync-unchanged")')
);

assert(
  "bed timer sync uses the saved bedtime start rather than regenerating startMs every push",
  activeTimerSyncBlock.includes("const _bedTimerDayForCloud = _bedActive ? localStorage.getItem(\"bed_timer_day\") : null") &&
    activeTimerSyncBlock.includes("const _bedStartMsForCloud = (_bedActive && _bedTimerDayForCloud && _bedStartForCloud)") &&
    activeTimerSyncBlock.includes("clockDateMs(_bedTimerDayForCloud, _bedStartForCloud, NaN)") &&
    activeTimerSyncBlock.includes("const _timerStartValidForCloud = Number.isFinite(_timerStartMsForCloud)") &&
    activeTimerSyncBlock.includes("_sharedData.activeTimer = _timerStartValidForCloud ? {") &&
    activeTimerSyncBlock.includes("startTime: _bedActive ? _bedStartForCloud : _breastActive ? _breastStartForCloud : _napStartForCloud") &&
    activeTimerSyncBlock.includes("startMs: _timerStartMsForCloud") &&
    !activeTimerSyncBlock.includes("startMs: (Number.isFinite(_timerStartMsForCloud)")
);

assert(
  "partner active timer sync is type-fresh and carries nap identity",
  app.includes("function partnerTimerFreshWindowMs(type)") &&
    app.includes('if (type === "nap") return OB_NAP_TIMER_RESTORE_MAX_MS;') &&
    app.includes('if (type === "bed") return OB_BED_TIMER_RESTORE_MAX_MS;') &&
    app.includes("function isFreshPartnerActiveTimer(timer") &&
    app.includes("function partnerActiveTimerCanHydrate(rt)") &&
    app.includes("localActiveTimerSnapshotForHydration") &&
    app.includes("partnerActiveTimerCanHydrate(_rt)") &&
    app.includes("partnerActiveTimerCanHydrate(_rt2)") &&
    activeTimerSyncBlock.includes('entryId: (!_bedActive && !_breastActive) ? (localStorage.getItem("nap_entry_id") || "") : ""') &&
    activeTimerSyncBlock.includes("dayKey: _bedActive ? safeDateKey(_bedTimerDayForCloud) : _breastActive ? todayStr() : _napDayForCloud") &&
    app.includes('function hydratePartnerActiveNapTimer(rt, reason = "partner_sync")') &&
    app.includes("setNapStartMs(startMs);") &&
    app.includes("setNapSec(elapsed);") &&
    app.includes('_androidTimerStart({type:"nap", startTime:startMs, babyName:safeName});')
);

assert(
  "active nap starts bypass sync throttles so partner phones get the live timer immediately",
  app.includes("const forceActiveTimer = !!(opts && opts.forceActiveTimer);") &&
    app.includes("if (!forceActiveTimer && _elapsed < PUSH_MIN_INTERVAL)") &&
    app.includes("if (!forceActiveTimer && _recentSameSyncHash(childPushCacheKey, childPreflightHash)) return;") &&
    app.includes("if(!forceActiveTimer && childPushElapsed < CHILD_PUSH_MIN_INTERVAL)") &&
    app.includes("pushToCloud(backupCodeRef.current, childrenForTimerSync, {forceActiveTimer:true});") &&
    app.includes("pushChildSync(resolvedActiveId, syncCode, childForTimerSync, {forceActiveTimer:true});")
);

assert(
  "completed nap edits beat stale active timer heartbeats across partner sync",
  app.includes("function completedNapBeatsActiveTimer(entry, timer)") &&
    app.includes("function findCompletedNapForActiveTimerInChild(child, timer)") &&
    app.includes("findCompletedNapForActiveTimerInChildren(_incomingChildrenForTimer || childrenRef.current, _rt") &&
    app.includes('clearLocalNapTimerStateFromSync("child_sync_completed_beat_active_timer")') &&
    app.includes("childActiveTimerForCloud = null;") &&
    app.includes("completedNapBeatsActiveTimer({...synced, _dayKey:syncedDay}, _localTimer)") &&
    app.includes('forcePushNapStopToCloud("end_nap_completed");')
);

	assert(
	  "child sync active nap snapshots hydrate the receiver even without family sharedData",
	  app.includes("function activeNapTimerPayloadForChildSync(childId, childOverride)") &&
	    app.includes("findCompletedNapForActiveTimerInChild(sourceChild, payload)") &&
	    app.includes("activeTimer: childActiveTimerForCloud || null") &&
	    app.includes("function activeNapTimerPayloadFromSyncedChild(child)") &&
	    app.includes("const _timerFromChildRows = activeNapTimerPayloadFromSyncedChild(remoteChild);") &&
	    app.includes('hydratePartnerActiveNapTimer(_timerFromChildRows, "partner_sync");')
	);

assert(
  "firestore rules allow activeTimer through child sync docs",
  rules.includes("'activeTimer'") &&
    rules.includes("function validActiveTimerPayload(timer)") &&
    rules.includes("validActiveTimerPayload(request.resource.data.activeTimer)") &&
    rules.includes("'deletedEntryIds', 'deletedDays', 'deletedGrowthMeasurements', 'activeTimer'") &&
    rules.includes("'child', 'childName', 'updatedAt', 'updatedBy', 'writeToken',") &&
    rules.includes("'deletedEntryIds', 'deletedDays', 'deletedGrowthMeasurements', 'activeTimer'")
);

assert(
  "child sync code mapping writes are hash-gated to avoid native startup sync storms",
  app.includes('const persistKey = "ob_child_sync_code_persist_hash_v1"') &&
    app.includes("prevHash === persistHash") &&
    app.includes("Date.now() - prevAt < 12 * 60 * 60 * 1000") &&
    app.includes("await Promise.all(mapIds.map(id => fsSet(\"child_code_map\", id, mapPayload, false)))")
);

assert(
  "child code map recovery is cached so Android launch does not reread map docs every time",
  app.includes("function _childCodeMapRestoreRecentlyChecked(childId)") &&
    app.includes("ob_child_code_map_restore_checked_") &&
    app.includes("_childCodeMapRestoreRecentlyChecked(cid)") &&
    app.includes("_rememberChildCodeMapRestoreChecked(cid)")
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
  "native REST auth waits for the SDK user before creating a fallback anonymous user",
  app.includes("async function _waitForSdkAuthToken") &&
    app.includes("cachedRestUid && cachedRestUid !== user.uid") &&
    app.includes("const _sdkLate = await _waitForSdkAuthToken(_sdkWaitMs);") &&
    app.includes("if(_sdkLate) return _sdkLate;") &&
    app.includes("const _sdkWarm = await _waitForSdkAuthToken(2500);") &&
    app.includes("window.Capacitor?.isNativePlatform?.() ? 6500 : 2000")
);

assert(
  "shadow writes are queued after legacy writes rather than replacing them",
  app.includes("queueSyncV2FamilyShadow(code, cleanForCloud") &&
    app.includes("queueSyncV2ChildShadow(code, childId, childForCloud")
);

assert(
  "child sync legacy writes merge cloud days before overwrite",
  app.includes("function mergeChildSyncCloudChildForPush") &&
    app.includes("function applyChildSyncDeleteTombstonesToChild") &&
    app.includes('deletedDaysRef.current.has(childId + ":" + dayKey)') &&
    app.includes("deletedEntryIdsRef.current.has(id)") &&
    app.includes("applyGrowthMeasurementDeleteTombstonesToChild(childId") &&
    app.includes("weights: normaliseWeightPayload([...(cloud.weights || []), ...(local.weights || [])])") &&
    app.includes("childForCloud = mergeChildSyncCloudChildForPush(childId, childForCloud, cloudChild);")
);

assert(
  "child sync overwrite guard compares against tombstone-filtered cloud data",
  app.includes("const childPreflightClean = applyGrowthMeasurementDeleteTombstonesToChild(childId, applyChildSyncDeleteTombstonesToChild(childId, child), deletedGrowthMeasurementsRef.current);") &&
    app.includes("let childForCloud = applyGrowthMeasurementDeleteTombstonesToChild(childId, applyChildSyncDeleteTombstonesToChild(childId, child), deletedGrowthMeasurementsRef.current);") &&
    app.includes("const localEntryCount = Object.values(childForCloud.days || {}).reduce") &&
    app.includes("const cloudChild = applyGrowthMeasurementDeleteTombstonesToChild(childId, applyChildSyncDeleteTombstonesToChild(childId, safeObjectPayload(existingData.child)), deletedGrowthMeasurementsRef.current);") &&
    app.indexOf("const cloudChild = applyGrowthMeasurementDeleteTombstonesToChild(childId, applyChildSyncDeleteTombstonesToChild(childId, safeObjectPayload(existingData.child)), deletedGrowthMeasurementsRef.current);") < app.indexOf("const cloudEntryCount = Object.values(cloudChild.days || {}).reduce")
);

assert(
  "child sync legacy writes and reads deletion tombstones",
    app.includes("function _absorbChildSyncTombstones(data)") &&
    app.includes("_absorbChildSyncTombstones(existingData);") &&
    app.includes("_absorbChildSyncTombstones(_cloudData);") &&
    app.includes("_absorbChildSyncTombstones(d);") &&
    app.includes("deletedEntryIds: deletedEntryIdsJson") &&
    app.includes("deletedDays: deletedDaysJson") &&
    app.includes("deletedGrowthMeasurements: deletedGrowthMeasurementsJson") &&
    app.includes("_absorbGrowthMeasurementTombstones") &&
    app.includes("mergedDays[date] = normaliseDayEntries(mergedDays[date]).filter(e =>") &&
    app.includes("Object.entries(childSyncCodes || {}).forEach(([cid, syncCode])")
);

assert(
	  "firestore rules allow legacy sync deletion tombstones",
	  rules.includes("'deletedGrowthMeasurements'") &&
	    rules.includes("request.resource.data.deletedGrowthMeasurements is string") &&
	    rules.includes("'deletedEntryIds', 'deletedDays', 'deletedGrowthMeasurements', 'prediction'") &&
	    rules.includes("'deletedEntryIds', 'deletedDays', 'deletedGrowthMeasurements'") &&
	    rules.includes("'deletedEntryIds', 'deletedDays', 'deletedGrowthMeasurements',\n        'activeTimer'") &&
	    (rules.match(/deletedGrowthMeasurements/g) || []).length >= 7
	);

assert(
  "local browser preview blocks whole-family writes but keeps partner sync testable",
  localPreviewCollectionsBlock.includes("const OB_LOCAL_PREVIEW_WRITE_COLLECTIONS = new Set([") &&
    localPreviewCollectionsBlock.includes('"families"') &&
    localPreviewCollectionsBlock.includes('"family_sync_v2"') &&
    !localPreviewCollectionsBlock.includes('"child_syncs"') &&
    !localPreviewCollectionsBlock.includes('"child_sync_v2"') &&
    !localPreviewCollectionsBlock.includes('"uid_to_backup"') &&
    !localPreviewCollectionsBlock.includes('"child_code_map"') &&
    app.includes("function shouldBlockLocalPreviewCloudWrite(collection)") &&
    app.includes("function isLocalWebPreviewRuntime()") &&
    app.includes('params.get("allowCloudWrites") === "1"') &&
    app.includes('localStorage.getItem("ob_allow_preview_cloud_writes") === "1"') &&
    app.includes('if (shouldBlockLocalPreviewCloudWrite("families")) return;') &&
    !app.includes('if (shouldBlockLocalPreviewCloudWrite("child_syncs")) return;') &&
    app.includes("if (shouldBlockLocalPreviewCloudWrite(collection))")
);

assert(
  "child sync join makes the linked baby visible and avoids blank mirror pushes",
  app.includes('localStorage.setItem("active_child", childId);') &&
    app.includes("setActiveChildId(childId);") &&
    app.includes("if(childrenSnapshot[childId]) pushChildSync(childId, code, childrenSnapshot[childId]);") &&
    app.includes("_promoteChildSyncChildIfBlank(syncChildId, remoteChild);")
);

assert(
  "child sync code writes fail visibly instead of showing fake success",
  app.includes('const created = await fsSet("child_syncs", code, _newSyncDoc);') &&
    app.includes('if(!created) return {ok:false, error:"Could not create sync code. check your connection and try again"};') &&
    app.includes('const createdNew = await fsSet("child_syncs", newCode, _newSyncDoc);') &&
    app.includes('if(!deactivatedOld) {') &&
    app.includes('if(d.isActive === false) return {ok:false, error:"This sync code is no longer active. ask the other parent for the new code"};') &&
    app.includes('localStorage.setItem("child_sync_codes_v1", JSON.stringify(_allCodesJ));')
);

assert(
  "child sync invite entry accepts pasted links, QR URLs and spaced codes",
  app.includes("function childSyncCodeFromAnyInput(value)") &&
    app.includes('u.searchParams.get("code") || u.searchParams.get("join") || u.searchParams.get("child")') &&
    app.includes("setLinkCode(childSyncCodeFromAnyInput(e.target.value))") &&
    app.includes('onPaste={e=>{ const _pastedCode = childSyncCodeFromAnyInput(e.clipboardData?.getData("text") || "");') &&
    app.includes("let clean = childSyncCodeFromAnyInput(code);") &&
    app.includes("const clean = childSyncCodeFromAnyInput(codeArg || pendingChildSyncCode);")
);

assert(
  "child sync participants are de-duplicated by account name as well as uid",
  app.includes("function _dedupeChildSyncParticipantsForCloud(participants)") &&
    app.includes("const visibleParticipants = React.useMemo(() => {") &&
    app.includes("normaliseUsername((localStorage.getItem(\"family_username\") || \"\").toString())") &&
    app.includes("const _joinerUsername = normaliseUsername((_participantEntry.username || \"\").toString());")
);

assert(
  "child sync identity repair is account-scoped before adding this device as a participant",
  app.includes('const localOwner = normaliseUsername((localStorage.getItem("ob_children_owner") || localStorage.getItem("ob_auth_username") || "").toString());') &&
    app.includes('const localOwnerBackup = String(localStorage.getItem("ob_children_owner_code") || localStorage.getItem("ob_auth_backup_code") || "").trim().toUpperCase();') &&
    app.includes("if (localOwner && currentUser && localOwner !== currentUser) return false;") &&
    app.includes("if (localOwnerBackup && currentBackup && localOwnerBackup !== currentBackup) return false;") &&
    app.includes('if (_existingUsername && key && _existingUsername !== key) _isAccountSwitch = true;')
);

assert(
  "child sync sharing is organised around access first and invite details stay hidden",
  app.includes("const [showInviteDetails, setShowInviteDetails] = React.useState(false);") &&
    app.includes("const isOwnerShare = !!isShared && (") &&
    app.includes("syncMeta={code ? (childSyncMeta[code] || childSyncMeta[cid] || null) : null}") &&
    app.includes("{!isOwnerShare && <div") &&
    app.includes('child-sync-manage-access-card') &&
    app.includes('People with access') &&
    app.includes('Replace invite and remove current access') &&
    app.includes('Invite someone') &&
    app.includes('The current link will stop working for everyone listed.') &&
    !app.includes('Show QR/code') &&
    !app.includes('Sync code</div>')
);

assert(
  "synced active nap timers stay live even when an older build wrote a moving end time",
  app.includes("if (e._active === true) return true;") &&
    app.includes("Older builds could leave a moving `end` on an active nap") &&
    app.includes("Treat `_active`") &&
    !app.includes("return {...e, end:e.start, duration:0, modifiedAt:Date.now()};") &&
    app.includes("Finalise only old stale stubs") === false &&
    !app.includes("Finalize only old stale stubs; recent synced stubs may still be running on another device.") &&
    app.includes("clockNapOnThisDay && isActiveNapStub(entry)")
);

assert(
  "android foreground timer restarts after a synced timer is recovered",
  app.includes("},[babyName, bedTimerDay, resolvedActiveId, napOn, napStartT, napStartMs, bedPaused, children]);") &&
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
  "family child sync codes can refresh stale account metadata during restore",
    app.includes("function _applyChildSyncCodesFromCloud(raw, opts = {})") &&
    app.includes("preferExisting ? {...incoming, ...existing} : {...existing, ...incoming}") &&
    app.includes("_applyChildSyncCodesFromCloud(data.childSyncCodes, {merge:false, source:opts.source || \"account\"});") &&
    app.includes("_applyChildSyncCodesFromCloud(d.childSyncCodes, {merge:true, preferExisting:false, source:\"family\"});") &&
    app.includes("fsSet(\"families\", resolvedBackup, {childSyncCodes:JSON.stringify(_mergedCodesLogin)}, true).catch(()=>{});")
);

assert(
  "regenerated child sync codes redirect stale devices instead of being resurrected",
  app.includes("isActive: false, replacedBy: newCode") &&
    app.includes("await _switchChildSyncCode(childId, replacementCode, child);") &&
    app.includes("_switchChildSyncCode(syncChildId || childId, replacementCode") &&
    app.includes("if(codeSnap.exists()) {") &&
    app.includes("if(replacementSnap.exists() && replacementSnap.data().isActive !== false)")
);

assert(
  "regenerating a child sync code verifies or repairs the old code before creating the replacement",
  app.includes("async function ensureCurrentUserCanRetireChildSyncCode(childId, code, ownerUid)") &&
    app.includes("async function _syncCurrentUidBackupChildCode(childId, code, codesOverride)") &&
    app.includes("if(backupForRules) payload.backupCode = backupForRules;") &&
    app.includes("try { await _syncCurrentUidBackupChildCode(childId, currentCode); } catch {}") &&
    app.includes("const restoredDoc = await restoreMissingChildSyncDocument(childId, clean") &&
    app.includes("const claimed = await claimChildSyncBackupOwner(childId || data.childId, clean, data);") &&
    app.includes("const claimedLegacy = await claimLegacyChildSyncOwner(clean, data);") &&
    app.indexOf("const oldCodeReady = await ensureCurrentUserCanRetireChildSyncCode(childId, currentCode, ownerUid);") >
      app.indexOf("async function regenerateChildSyncCode(childId, newUserCode)") &&
    app.indexOf("const oldCodeReady = await ensureCurrentUserCanRetireChildSyncCode(childId, currentCode, ownerUid);") <
      app.indexOf('const createdNew = await fsSet("child_syncs", newCode, _newSyncDoc);') &&
    app.includes("const recheckedOld = await ensureCurrentUserCanRetireChildSyncCode(childId, currentCode, ownerUid);")
);

assert(
  "owner phones self-heal missing child sync documents before partner links are shared again",
  app.includes("async function restoreMissingChildSyncDocument(childId, code, childOverride, ownerUid, opts = {})") &&
    app.includes('const restored = await fsSet("child_syncs", clean, restoredDoc);') &&
    app.includes("let ownerMapMatches = false;") &&
    app.includes("const canRestoreMissingDoc = ownerMapMatches || (localMeta && (!localMeta.ownerUid || localMeta.ownerUid === writerUid));") &&
    app.includes("const restoredMissing = await restoreMissingChildSyncDocument(childId, code, childForCloud, writerUid, {activeTimer: childActiveTimerForCloud});")
);

assert(
  "competing active nap stubs collapse to one timer after sync-lane migration",
  app.includes("function collapseCompetingActiveNapStubs(entries)") &&
    app.includes("activeIndexes.length <= 1") &&
    app.includes("kept.push({...entry, _active:false});") &&
    app.includes("return collapseCompetingActiveNapStubs(result);")
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
