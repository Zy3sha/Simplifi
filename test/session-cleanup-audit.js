const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");
const logoutStart = app.indexOf("function logout() {");
const logoutEnd = app.indexOf("async function restoreFromBackup", logoutStart);
const logoutBlock = logoutStart >= 0 && logoutEnd > logoutStart ? app.slice(logoutStart, logoutEnd) : "";

function assert(name, ok) {
  if (!ok) {
    console.error("✗ " + name);
    process.exitCode = 1;
  } else {
    console.log("✓ " + name);
  }
}

assert("logout tears down family, child and carer listeners", logoutBlock.includes("unsubscribeRef.current") && logoutBlock.includes("childSubsRef.current") && logoutBlock.includes("carerUnsubRef.current"));
assert("logout resets Firebase auth identity as well as local account state", logoutBlock.includes('resetFirebaseIdentityForAccountSwitch("logout")'));
assert("logout clears biometric account credentials", logoutBlock.includes('"bio_pin"') && logoutBlock.includes('"bio_user"') && logoutBlock.includes('"bio_enabled"'));
assert("logout clears legacy baby profile keys", ["bn_v2", "bw_v2", "dob_v1", "sex_v1", "unborn_v1", "ms_v1"].every(k => logoutBlock.includes('"' + k + '"')));
assert("logout clears old plaintext recovery email cache", logoutBlock.includes('"recovery_email_v1"'));
assert("logout clears child-specific dynamic weaning keys", logoutBlock.includes('k.startsWith("weaning_started_")'));
assert("logout clears wellbeing and schedule state", ["wellbeing_date_v1", "wb_response_v1", "weekly_digest_v1", "sched_override_v1"].every(k => logoutBlock.includes('"' + k + '"')));
assert("logout keeps only device-level visual preferences", logoutBlock.includes('k === "ob_theme"') && logoutBlock.includes('k === "ob_widget_theme"') && logoutBlock.includes('k === "ob_locale"') && !/const keep[\s\S]{0,220}"bio_pin"/.test(logoutBlock));
assert("native restore skips account resurrection after deletion", app.includes('const OB_NATIVE_DELETE_TOMBSTONE_KEY = "ob_native_delete_tombstone_v1"') && app.includes('localStorage.getItem("_just_deleted")==="1"') && app.includes("_nativeDeleteTombstoneIsFresh(nativeDeletedAt)") && app.includes("await _nativePrefRemove(OB_NATIVE_DATA_MIRROR_KEY);"));
assert("native mirror is not rewritten during deletion", app.includes("window._deletingAccount || localStorage.getItem(\"_just_deleted\")===\"1\"") && app.includes("_nativePrefRemove(OB_NATIVE_DATA_MIRROR_KEY).catch(()=>{});"));
assert("logout removes native mirror and biometric credentials", logoutBlock.includes("_nativePrefRemove(OB_NATIVE_DATA_MIRROR_KEY)") && logoutBlock.includes('"bio_user","bio_pin","bio_enabled"'));
assert("delete account still wipes all local and session storage", app.includes("try{localStorage.clear();}catch(e){}") && app.includes("try{sessionStorage.clear();}catch(e){}"));
assert("delete account clears native restore sources before reload", app.includes("_nativePrefSet(OB_NATIVE_DELETE_TOMBSTONE_KEY, String(Date.now()))") && app.includes("_nativePrefRemove(OB_NATIVE_DATA_MIRROR_KEY)") && app.includes('_nativePrefRemove("bio_user")') && app.includes('_nativePrefRemove("bio_pin")') && app.includes('_nativePrefRemove("bio_enabled")'));
assert("delete account is guarded against duplicate destructive runs", app.includes("deleteAccountRunningRef.current") && app.includes("if(deleteAccountRunningRef.current || deleteConfirmText!==\"DELETE\") return;") && app.includes("disabled={deleteAccountRunning||deleteConfirmText!==\"DELETE\"}"));
assert("delete account failure removes blocking overlay and re-enables sync", app.includes("deleteAccountRunningRef.current = false;") && app.includes("window._deletingAccount = false;") && app.includes("if(_failedOverlay) _failedOverlay.remove();") && app.includes("Delete failed. Check connection and try again."));

if (!process.exitCode) console.log("Session cleanup audit passed.");
