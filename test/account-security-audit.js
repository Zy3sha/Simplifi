const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");
const firebase = fs.readFileSync(path.join(root, "firebase.js"), "utf8");
const rules = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");
const deleteBlock = app.slice(
  app.indexOf("Delete Account confirmation modal"),
  app.indexOf("Step 3: Wiping memory")
);
const verifyLoginBlock = app.slice(
  app.indexOf("async function verifyLogin"),
  app.indexOf("// Firestore REST read", app.indexOf("async function verifyLogin"))
);
const applyAuthenticatedAccountBlock = app.slice(
  app.indexOf("async function applyAuthenticatedAccount"),
  app.indexOf("async function verifyLogin")
);
const restoreFromBackupBlock = app.slice(
  app.indexOf("async function restoreFromBackup"),
  app.indexOf("function trackEvent", app.indexOf("async function restoreFromBackup"))
);

function assert(name, ok) {
  if (!ok) {
    console.error("✗ " + name);
    process.exitCode = 1;
  } else {
    console.log("✓ " + name);
  }
}

assert("PIN hardening helper uses PBKDF2", app.includes('crypto.subtle.importKey("raw"') && app.includes('name:"PBKDF2", hash:"SHA-256"'));
assert("PIN hardening uses a meaningful iteration count", app.includes("const _pinHashIterations = 120000"));
assert("new username PINs use hardened hash", app.includes("pinHash: await hashAccountPin(pin, key)"));
assert("claim-account PINs use hardened hash", (app.match(/pinHash: await hashAccountPin\(pin, key\)/g) || []).length >= 2);
assert("username records are stamped with Firebase uid when available", app.includes("authorizedUids: {[_uid]: true}") && (app.match(/\.\.\.accountUidField\(\)/g) || []).length >= 8);
assert("login and PIN reset can verify server-side before username docs are readable", app.includes('callAccountFunction("accountLogin"') && app.includes('callAccountFunction("resetAccountPin"'));
assert("native account login has an authenticated REST callable fallback", app.includes("function _nativeAccountFunctionRuntime()") && app.includes("async function callAccountFunctionViaRest") && app.includes("cloudfunctions.net/${safeName}") && app.includes('"Authorization":`Bearer ${idToken}`') && app.includes("if(nativeRuntime)") && app.includes("const rest = await callAccountFunctionViaRest(name, payload);"));
assert("native sign-in does not hard-block before the REST fallback can run", verifyLoginBlock.includes("await waitForFirebaseModule(2500)") && verifyLoginBlock.includes("await ensureFirebaseUid(5000)") && !verifyLoginBlock.includes('if(!window._fb) { setAuthError("Not connected. check your internet"); return false; }'));
assert("Firebase auth exposes signOut for account identity switches", firebase.includes("signInAnonymously, signOut, onAuthStateChanged") && firebase.includes("signInAnonymously, signOut, onAuthStateChanged, logEvent"));
assert("account switches reset Firebase identity before authorising the new username", verifyLoginBlock.includes('resetFirebaseIdentityForAccountSwitch("username-switch")') && verifyLoginBlock.indexOf('resetFirebaseIdentityForAccountSwitch("username-switch")') < verifyLoginBlock.indexOf('callAccountFunction("accountLogin"') && applyAuthenticatedAccountBlock.includes('resetFirebaseIdentityForAccountSwitch(opts.resetReason || "backup-code-switch")') && verifyLoginBlock.includes('reauthPayload:_loginPayload'));
assert("manual backup restore can use authenticated REST when Firebase JS is late", restoreFromBackupBlock.includes("await ensureFirebaseUid(5000)") && restoreFromBackupBlock.includes('const snap = await fsGet("families", clean);') && restoreFromBackupBlock.includes("if(d.deleted) return false;") && !restoreFromBackupBlock.includes("if(!window._fb) return false;"));
assert("account repair and recovery email save use callable owner checks first", app.includes('callAccountFunction("accountSignInStatus"') && app.includes('callAccountFunction("repairAccountSignIn"') && app.includes('callAccountFunction("saveRecoveryEmail"'));
assert("manual login upgrades legacy PIN hashes", app.includes("if(storedPinHash === _legacyHash) _pinUpgradeHash = _v2Hash;"));
assert("PIN resets use hardened hash", app.includes("pinHash: await hashAccountPin(newPin, key)"));
assert("forgot PIN flow requires backup code or recovery word proof", app.includes("Backup code or recovery word") && app.includes("resetPinWithCode(uname,forgotRecoveryCode,forgotPinNewPin)") && !app.includes("pinHash:await hashAccountPin(forgotPinNewPin,key)"));
assert("recovery words use hardened hash", app.includes("async function hashRecoveryWord") && app.includes("obubba:recovery-word:v2:") && app.includes("recoveryHash: await hashRecoveryWord(word, key)"));
assert("account UI lets signed-in users set a recovery word", app.includes('data-ob-recovery-word="1"') && app.includes("const ok = await saveRecoveryWord(word);"));
assert("legacy recovery words upgrade after successful match", app.includes("const _legacyRecoveryHash = hashPin(wordOrCode.trim().toLowerCase())") && app.includes("recoveryHash: _v2RecoveryHash"));
assert("recovery email is not stored in plain text on new saves", app.includes("recoveryEmailLookupId: emailLookupId") && app.includes("fsDeleteFields(\"usernames\", key, [\"recoveryEmail\"])") && !app.includes("recoveryEmail: cleanEmail"));
assert("changed recovery emails invalidate stale lookup docs", app.includes("if(data.recoveryEmailLookupId && data.recoveryEmailLookupId !== emailLookupId) return null;") && app.includes("previousLookupId && previousLookupId !== emailLookupId") && app.includes('fsDelete("recovery_emails", previousLookupId)'));
assert("biometric credential storage uses hardened hash", app.includes("const _bioPinHash = await hashAccountPin(pin, authUsername);"));
assert("legacy direct PIN writes are gone", !/pinHash:\s*hashPin\((pin|newPin|forgotPinNewPin)\)/.test(app));
assert("rules allow PIN and recovery hash metadata", rules.includes("'pinHash', 'pinHashVersion', 'pinHashUpdatedAtClient'") && rules.includes("'recoveryHashVersion', 'recoveryHashUpdatedAtClient'"));
assert("backup codes use shared secure generator", app.includes("function generateUniqueBackupCode()") && (app.match(/generateUniqueBackupCode\(\)/g) || []).length >= 4);
assert("new backup codes use stronger ten-character entropy", app.includes("const BACKUP_CODE_LEN = 10") && app.includes("Array.from({length:BACKUP_CODE_LEN}"));
assert("backup code generator uses WebCrypto randomness", app.includes("cryptoApi.getRandomValues(bucket)"));
assert("backup code generation no longer uses Math.random inline", !/"BK"\s*\+\s*Array\.from\(\{length:6\}[\s\S]{0,180}Math\.random/.test(app));
assert("local entry ids prefer WebCrypto randomness", app.includes("function randomIdSuffix") && app.includes("cryptoApi.getRandomValues(bucket)") && app.includes("randomIdSuffix(8)"));
assert("observation ids avoid tiny Math.random collision space", app.includes('id: "obs_"+_now+"_"+randomIdSuffix(6)') && !app.includes('id: "obs_"+_now+"_"+Math.floor(Math.random()*1000)'));
assert("secure id helpers do not fall back to Math.random", !/function randomIdSuffix[\s\S]{0,900}Math\.random/.test(app) && !/function secureRandomIndex[\s\S]{0,520}Math\.random/.test(app) && app.includes('throw new Error("Secure randomness unavailable")'));
assert("family sync write tokens use shared secure id helper", app.includes('const writeTokenRef = React.useRef("tok_" + randomIdSuffix(16));'));
assert("child sync codes use shared secure generator", /function _generateSyncCode\(\) \{[\s\S]{0,260}secureRandomIndex\(chars\.length\)[\s\S]{0,80}return code;/.test(app) && !/function _generateSyncCode\(\) \{[\s\S]{0,260}Math\.random/.test(app));
assert("new child sync codes are eight characters while legacy six-character codes remain valid", app.includes("const CHILD_SYNC_CODE_MIN_LEN = 6;") && app.includes("const CHILD_SYNC_CODE_LEN = 8;") && app.includes("for(let i=0;i<CHILD_SYNC_CODE_LEN;i++)"));
assert("child sync code generation fails gracefully without secure randomness", app.includes("function secureRandomUnavailableMessage()") && app.includes("child sync code generation failed") && app.includes("child sync code regeneration failed"));
assert("delete account calls the server cleanup before legacy direct Firestore cleanup", deleteBlock.indexOf('callAccountFunction("deleteAccount"') >= 0 && deleteBlock.indexOf('callAccountFunction("deleteAccount"') < deleteBlock.indexOf("Legacy best-effort soft cleanup"));
assert("delete account legacy cleanup does not destroy ownership metadata before server verification", !deleteBlock.includes('uid:"deleted"') && !deleteBlock.includes("authorizedUids:{}") && deleteBlock.includes("Keep uid/authorizedUids intact"));
assert("delete account legacy cleanup only runs when server cleanup is unavailable", deleteBlock.includes("if(!_serverDeleted)"));

if (!process.exitCode) console.log("Account security audit passed.");
