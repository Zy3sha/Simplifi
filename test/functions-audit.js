#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const fnPath = path.join(root, "functions/index.js");
const source = fs.readFileSync(fnPath, "utf8");
const functionsPkg = JSON.parse(fs.readFileSync(path.join(root, "functions/package.json"), "utf8"));
const functionsLock = JSON.parse(fs.readFileSync(path.join(root, "functions/package-lock.json"), "utf8"));
const firebaseJson = JSON.parse(fs.readFileSync(path.join(root, "firebase.json"), "utf8"));
const firestoreIndexes = JSON.parse(fs.readFileSync(path.join(root, "firestore.indexes.json"), "utf8"));

function assert(name, condition) {
  if (!condition) throw new Error(name);
  console.log("✓ " + name);
}

function hasFirestoreIndex(collectionGroup, fields) {
  return firestoreIndexes.indexes.some(idx => idx.collectionGroup === collectionGroup && idx.queryScope === "COLLECTION" && JSON.stringify(idx.fields) === JSON.stringify(fields));
}

function exportSegment(name) {
  const start = source.indexOf(`exports.${name}`);
  const end = source.indexOf("\n// ──", start + 1);
  return start === -1 ? "" : source.slice(start, end === -1 ? source.length : end);
}

const check = spawnSync(process.execPath, ["--check", fnPath], { encoding: "utf8" });
assert("Cloud Functions source parses", check.status === 0);
assert("account auth callable functions are source-tracked", source.includes("exports.usernameStatus = onCall") && source.includes("exports.accountLogin = onCall") && source.includes("exports.resetAccountPin = onCall") && source.includes("exports.accountSignInStatus = onCall") && source.includes("exports.repairAccountSignIn = onCall") && source.includes("exports.saveRecoveryEmail = onCall") && source.includes("exports.recoveryEmailLookup = onCall") && source.includes("exports.providerAccountStatus = onCall") && source.includes("exports.linkProviderAccount = onCall") && source.includes("exports.createProviderAccount = onCall"));
assert("provider auth links require Firebase-authenticated Apple or Google UIDs", source.includes('const PROVIDER_IDS = new Set(["apple.com", "google.com"])') && source.includes("async function verifiedProviderContext(request)") && source.includes("adminAuth.getUser(request.auth.uid)") && source.includes('db.collection("auth_provider_links").doc(ctx.uid)'));
assert("provider account linking requires existing account proof", source.includes("function providerProofPatch") && source.includes("accountPinHash(pin, username)") && source.includes("accountBackupMatches(data, backupCode)") && source.includes("recoveryWordHash(proof, username)") && source.includes("That PIN, backup code, or recovery word did not match"));
assert("Cloud Functions accept stronger backup codes without blocking legacy codes", source.includes("/^BK[A-Z0-9]{6,10}$/.test(value || \"\")"));
assert("account login verifies PIN server-side before returning backup codes", source.includes("function accountPinHash") && source.includes("publicAccountPayload(username, data)") && source.includes("authorizedUids: { [request.auth.uid]: true }"));
assert("account repair verifies backup code or account PIN server-side before recreating sign-in", source.includes("exports.repairAccountSignIn = onCall") && source.includes("accountBackupMatches(data, backupCode)") && source.includes("function accountPinMatches") && source.includes("pinMatchesExisting") && source.includes("Backup code does not match this username") && source.includes("backupCode: backupMatches && data && data.backupCode ? data.backupCode : backupCode") && source.includes('db.collection("uid_to_backup").doc(uid).set'));
assert("recovery email save is owner or backup-code verified server-side", source.includes("exports.saveRecoveryEmail = onCall") && source.includes("const backupMatches = accountBackupMatches(data, backupCode)") && source.includes('db.collection("recovery_emails").doc(emailLookupId).set'));
assert("account deletion callable deletes Firebase Auth user", source.includes('const { getAuth } = require("firebase-admin/auth");') && source.includes("exports.deleteAccount = onCall") && source.includes("adminAuth.deleteUser(uid)"));
assert("account deletion callable cleans verified account documents", source.includes("const verifiedBackupCode = backupCodeId(backupCode)") && source.includes('db.collection("families").doc(verifiedBackupCode).delete()') && source.includes("const ownsSync = syncData.ownerUid === uid") && source.includes("cleanup.push(syncRef.delete())") && source.includes("childCodeMapIdsForOwner(childId, syncChild, ownerSeed)") && source.includes('db.collection("recovery_emails").doc(String(data.recoveryEmailLookupId)).delete()'));
assert("free trial is claimed server-side as a 14-day entitlement", source.includes("exports.claimTrial = onCall") && source.includes("const TRIAL_DAYS = 14") && source.includes('db.collection("entitlements").doc(uid)') && source.includes("trialStartFromClient(firstInstallAtClient, nowMs)") && source.includes("publicTrialPayload(entitlementPatch, nowMs)"));
assert("account deletion preserves trial device history for anti-repeat trials", source.includes('db.collection("trial_devices").doc(trialDeviceKey)') && source.includes("accountDeletedAt") && !source.includes("cleanup.push(trialRef.delete())"));
assert("account deletion accepts string or object child-sync payloads", source.includes("function parseObjectPayload(value)") && source.includes("try { return parseObjectPayload(JSON.parse(value)); } catch { return null; }") && source.includes("const syncChild = parseObjectPayload(syncData.child);") && !source.includes("JSON.parse(syncData.child)"));
assert("account deletion verifies Firestore cleanup before deleting Auth user", source.includes("const cleanupFailures = results.filter(result => result.status === \"rejected\");") && source.indexOf("if (cleanupFailures.length > 0)") < source.indexOf("await adminAuth.deleteUser(uid);"));
assert("push text is bounded before sending", source.includes("function safePushText") && source.includes("safePushText(title, \"OBubba\", 80)"));
assert("FCM data payload values are coerced to strings", source.includes("function safeDataPayload") && source.includes("out[key] = String(value).slice(0, 120);"));
assert("blank or malformed FCM tokens are ignored", source.includes("const token = typeof rawToken === \"string\" ? rawToken.trim() : \"\";") && source.includes("if (!token) return;"));
assert("invalid FCM tokens are removed without repeated error logs or user identifiers", source.includes("function isInvalidFcmTokenError(err)") && source.includes('code === "messaging/invalid-argument"') && source.includes('message.includes("fcm registration token")') && source.includes('logFunctionWarn("Removed invalid FCM token", err);') && source.indexOf("if (isInvalidFcmTokenError(err))") < source.indexOf('logFunctionError("Push delivery failed", err);'));
assert("Cloud Function error logs use sanitized summaries", source.includes("function safeErrorSummary(err)") && source.includes("function logFunctionError(scope, err)") && !/console\.(warn|error)\([^\\n]*(uid|doc\\.id|\\$\\{uid\\}|\\$\\{doc\\.id\\})/.test(source));
assert("scheduled FCM scans are paged instead of full-collection reads", source.includes("async function forEachFcmToken") && source.includes("orderBy(FieldPath.documentId()).limit(pageSize)") && (source.match(/await forEachFcmToken/g) || []).length >= 8 && !source.includes('db.collection("fcm_tokens").get();'));
assert("scheduled push query has its required Firestore index", firebaseJson.firestore.indexes === "firestore.indexes.json" && hasFirestoreIndex("scheduled_pushes", [{fieldPath:"sent",order:"ASCENDING"},{fieldPath:"sendAt",order:"ASCENDING"}]));
assert("medicine reminder scheduled query is batch-limited", exportSegment("medicineReminder").includes('.collection("medicine_reminders")') && exportSegment("medicineReminder").includes(".limit(200)"));
assert("medicine reminder query has its required Firestore index", hasFirestoreIndex("medicine_reminders", [{fieldPath:"sent",order:"ASCENDING"},{fieldPath:"nextDue",order:"ASCENDING"}]));
assert("appointment reminder scheduled query is batch-limited", exportSegment("appointmentReminder").includes('.collection("appointments")') && exportSegment("appointmentReminder").includes(".limit(200)"));
assert("appointment reminder query has its required Firestore index", hasFirestoreIndex("appointments", [{fieldPath:"reminded",order:"ASCENDING"},{fieldPath:"datetime",order:"ASCENDING"}]));
assert("existing carer schedule index is source-tracked", hasFirestoreIndex("schedule", [{fieldPath:"time",order:"ASCENDING"},{fieldPath:"createdAt",order:"ASCENDING"}]));
assert("timestamp reads accept Firestore timestamps, Dates, numbers and strings", source.includes("function timestampMs(value)") && source.includes("typeof value.toMillis === \"function\"") && source.includes("Date.parse(value)"));
assert("feed reminder no longer assumes .toMillis exists", source.includes("const lastFeedMs = timestampMs(lastFeedTime);") && !source.includes("lastFeedTime.toMillis() < cutoff"));
assert("timezone offsets are range-checked", source.includes("function safeTzOffsetMin(value)") && source.includes("value >= -840 && value <= 840"));
assert("daily scheduled pushes are gated by each user's local wall clock", source.includes("function userLocalDate(tzOffsetMin") && source.includes("function userLocalDayOfWeek(tzOffsetMin)") && source.includes("function userLocalWeekKey(tzOffsetMin)") && source.includes('exports.weeklyDigest = onSchedule("every 1 hours"') && exportSegment("weeklyDigest").includes("userLocalDayOfWeek(tzOff) !== 1 || userLocalHour(tzOff) !== 8") && exportSegment("monthlyBirthday").includes("if (userLocalHour(tzOff) !== 9) return;") && exportSegment("developmentPhase").includes("if (userLocalHour(tzOff) !== 9) return;") && exportSegment("milestonesUnlocked").includes("if (userLocalHour(tzOff) !== 10) return;") && exportSegment("reEngagement").includes("if (userLocalHour(tzOff) !== 11) return;"));
assert("birthday and development reminders skip malformed DOBs", (source.match(/const dobMs = timestampMs\(data\.babyDob\);/g) || []).length >= 3);
assert("re-engagement skips malformed last-update timestamps", source.includes("const lastMs = timestampMs(lastUpdate);") && source.includes("if (!lastMs) return;"));
assert("dedicated anonymous clock presence cleanup removes expired presence daily", source.includes("exports.cleanupClockPresence = onSchedule(\"every day 04:00\"") && source.includes("const cutoffMs = Date.now();") && source.includes(".collection(\"bubba_presence\")") && source.includes(".where(\"expiresAtMs\", \"<\", cutoffMs)") && !source.includes(".collection(\"bubba_hugs\")"));
assert("Cloud Functions runtime uses supported Node 22", functionsPkg.engines && functionsPkg.engines.node === "22");
assert("Cloud Functions lockfile runtime matches package runtime", functionsLock.packages[""].engines.node === functionsPkg.engines.node);

console.log("Cloud Functions audit passed.");
