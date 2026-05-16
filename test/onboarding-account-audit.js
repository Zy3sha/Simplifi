#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");
const functionsSource = fs.readFileSync(path.join(root, "functions", "index.js"), "utf8");

let failed = false;
function assert(name, ok) {
  if (ok) {
    console.log("ok " + name);
  } else {
    failed = true;
    console.error("FAIL " + name);
  }
}

const authCreateBlock = app.slice(
  app.indexOf("async function handleAuth"),
  app.indexOf("return (", app.indexOf("async function handleAuth"))
);
const authScreenBlock = app.slice(
  app.indexOf("// \u2500\u2500 Skip auth on first launch. allow anonymous onboarding \u2500\u2500"),
  app.indexOf("if (!onboarded && !needsChildSetup)")
);
const onboardingBlock = app.slice(
  app.indexOf("if (!onboarded && !needsChildSetup)"),
  app.indexOf("// \u2500\u2500 CHILD SETUP SCREEN", app.indexOf("if (!onboarded && !needsChildSetup)"))
);
const childSetupBlock = app.slice(
  app.indexOf("if (needsChildSetup && tutStep === -1)"),
  app.indexOf("return(", app.indexOf("if (needsChildSetup && tutStep === -1)"))
);
const reserveBlock = app.slice(
  app.indexOf("async function reserveUsername"),
  app.indexOf("// Claim account:", app.indexOf("async function reserveUsername"))
);
const claimAccountBlock = app.slice(
  app.indexOf("async function claimAccount"),
  app.indexOf("async function saveRecoveryWord", app.indexOf("async function claimAccount"))
);

assert("fresh installs can onboard anonymously before auth", app.includes("// \u2500\u2500 Skip auth on first launch. allow anonymous onboarding \u2500\u2500") && app.includes('if (authScreen && authScreen !== "deferred")') && app.includes("if (!onboarded && !needsChildSetup)"));
assert("onboarding hero and baby-name step expose existing-account sign-in", onboardingBlock.includes("I already have an account") && onboardingBlock.includes('setAuthMode("login")') && onboardingBlock.includes('setAuthScreen("login")'));
assert("strict onboarded check requires child data before falling back to explicit skip", app.includes("STRICT onboarded check") && app.includes("hasNamedChild") && app.includes('localStorage.getItem("bn_v2")') && app.includes('localStorage.getItem("dob_v1")') && app.includes('localStorage.getItem("onboarded_v2") === "1"'));

assert("new account creation returns to full day-one onboarding instead of skipping insights", app.includes('const[needsChildSetup,setNeedsChildSetup]=useState(()=>{try{return localStorage.getItem("needs_child_setup_v1")==="1";}catch{return false;}});') && authCreateBlock.includes('localStorage.removeItem("needs_child_setup_v1")') && authCreateBlock.includes('localStorage.removeItem("onboarded_v2")') && authCreateBlock.includes("setNeedsChildSetup(false)") && authCreateBlock.includes("setOnboarded(false)") && authCreateBlock.includes("setObStep(1)"));
assert("pending child setup renders before anonymous onboarding", app.indexOf("if (!onboarded && !needsChildSetup)") < app.indexOf("if (needsChildSetup && tutStep === -1)") && app.includes("if (!onboarded && !needsChildSetup)"));
assert("child setup completion persists child profile synchronously", childSetupBlock.includes("safeChildName(childData.name)") && childSetupBlock.includes("safeChildDate(childData.dob)") && childSetupBlock.includes("normaliseChildrenPayload") && childSetupBlock.includes('localStorage.setItem("children_v1", JSON.stringify(next))') && childSetupBlock.includes('localStorage.setItem("active_child", safeTargetId)') && childSetupBlock.includes('localStorage.removeItem("needs_child_setup_v1")') && childSetupBlock.includes('localStorage.setItem("onboarded_v2","1")') && childSetupBlock.includes("setOnboarded(true)"));
assert("account cleanup clears pending child setup flag", app.includes('"needs_child_setup_v1"') && app.includes('"onboarded_v2","needs_child_setup_v1","use_personal_recs_v1"'));

assert("day-one onboarding saves child, legacy keys and seed entries immediately", onboardingBlock.includes("safeChildName(obName)") && onboardingBlock.includes("safeChildDate(obDob)") && onboardingBlock.includes('localStorage.setItem("children_v1", JSON.stringify(_safeNextChildren))') && onboardingBlock.includes('localStorage.setItem("active_child", _safeTargetId)') && onboardingBlock.includes('localStorage.setItem("bn_v2", _obChildName)') && onboardingBlock.includes('src: "onboarding"'));
assert("signed-in onboarding is not marked as anonymous after completion", onboardingBlock.includes('localStorage.getItem("family_username")') && onboardingBlock.includes('localStorage.removeItem("ob_onboard_anon")') && onboardingBlock.includes('localStorage.setItem("ob_onboard_anon","1")'));
assert("onboarding date fields are explicitly labelled", onboardingBlock.includes('htmlFor="ob-onboarding-dob"') && onboardingBlock.includes("Date of birth") && onboardingBlock.includes('data-testid="onboarding-date-of-birth"') && app.includes('htmlFor="ob-child-setup-dob"') && app.includes('data-testid="child-setup-date-of-birth"') && app.includes('obChildUnborn ? "Due date" : "Date of birth"'));
assert("fresh onboarding and new-account setup land on Clock Track without auto tour", onboardingBlock.includes('localStorage.removeItem("ob_app_tour_pending_v1")') && childSetupBlock.includes('localStorage.removeItem("ob_app_tour_pending_v1")') && onboardingBlock.includes('setTab("day")') && onboardingBlock.includes('setDaySubScreen(null)') && onboardingBlock.includes('setTodayPanel("log")') && childSetupBlock.includes('setTab("day")') && childSetupBlock.includes('setDaySubScreen(null)') && childSetupBlock.includes('setTodayPanel("log")') && !onboardingBlock.includes('queueAppTourAfterSetup("onboarding")') && !childSetupBlock.includes('queueAppTourAfterSetup("new_account")') && app.includes('queueAppTourAfterSetup("partner_sync")') && app.includes("const APP_TOUR_TARGETS") && app.includes('className="ob-tour-spotlight"'));
assert("regional guidance comes from device locale detection", app.includes("function localeRegionCode") && app.includes("navigator.languages") && app.includes("Intl.Locale") && app.includes("Intl.DisplayNames") && app.includes("const _countryKey = localeCountryKey(_locale)") && app.includes("const _effectiveLocaleData = _countryKey ?") && app.includes("function localeGuidanceFallback()") && !app.includes("ob_country_v1") && !app.includes("applyCountryPreference"));
assert("app tour includes the current Care map and Bubba Care lock guidance", app.includes("const OB_APP_TOUR_JOURNEY") && app.includes("Your OBubba clock map") && app.includes("Start OBubba tour") && app.includes('title:"Open the parent toolkit"') && app.includes('Care leads with the real tools: Bubba Care, Weaning, Parent Room, Sleep Coach and Night Weaning.') && app.includes('["family-hub", "nav-settings"]') && app.includes('data-tour-id="family-hub"') && app.includes("Lock Bubba Care session") && app.includes('setTab("settings")'));
assert("Family Hub child sharing uses OBubba invite profile card", app.includes('data-testid="child-sync-invite-profile-card"') && app.includes("Share {childLabel}'s OBubba profile") && app.includes("https://api.qrserver.com/v1/create-qr-code/?size=190x190") && app.includes("Send invite") && app.includes("Invite someone you trust to co-log"));
assert("tour spotlight keeps the target clear instead of blurring through the overlay", app.includes('data-testid="tour-backdrop"') && app.includes('background:tourSpotlight?"transparent"') && app.includes('backdropFilter:tourSpotlight?"none":"blur(2px)"') && app.includes('WebkitBackdropFilter:tourSpotlight?"none":"blur(2px)"') && app.includes('border:tourSpotlightBorder') && app.includes('border:dTourSpotlightBorder') && app.includes("rgba(16,8,4,0.66)") && app.includes("rgba(255,238,205,0.82)"));
assert("day-mode tour spotlight has a distinct blue target glow", app.includes('const tourSpotlightBorder = isDark ? "3px solid rgba(255,255,255,0.98)" : "3px solid rgba(157,224,255,0.98)"') && app.includes('const dTourSpotlightBorder = isDark ? "3px solid rgba(255,255,255,0.98)" : "3px solid rgba(157,224,255,0.98)"') && app.includes("rgba(139,222,255,0.62)") && app.includes("rgba(77,196,255,0.70)") && app.includes("rgba(202,238,255,0.10)") && app.includes("background:tourSpotlightFill") && app.includes("background:dTourSpotlightFill"));
assert("tour cards use larger high-contrast readable copy", app.includes('className="ob-tour-card"') && app.includes('className="ob-tour-journey-sheet"') && app.includes('.ob-tour-journey-list::before') && app.includes('.ob-tour-journey-card') && app.includes('zIndex:10020') && app.includes('zIndex:10021') && app.includes('zIndex:10022') && app.includes('.ob-tour-card{background:#FFFDF9!important') && app.includes('.ob-tour-card::before{content:"";position:absolute;inset:0') && app.includes('.ob-tour-card>*{position:relative!important;z-index:1!important;}') && app.includes('body.dark-mode .ob-tour-card{background:#111D31!important') && app.includes('body.dark-mode .ob-tour-card::before{background:#111D31!important;}') && app.includes('background-image:none!important') && app.includes('data-testid="tour-step-label"') && app.includes('data-testid="tour-readable-copy"') && app.includes('const cardBg = isDark ? "#111D31" : "#FFFDF9"') && app.includes('const dCardBg = isDark ? "#111D31" : "#FFFDF9"') && app.includes('const tourCardDock = tourSpotlight ?') && app.includes('const dTourCardDock = tourSpotlight ?') && app.includes("bottom:\"calc(14px + env(safe-area-inset-bottom, 0px))\"") && app.includes('backgroundColor:cardBg') && app.includes('backgroundColor:dCardBg') && app.includes('fontSize:20,fontWeight:800') && app.includes('fontSize:15,color:cardSub,lineHeight:1.45') && app.includes('fontSize:15,color:dCardSub,lineHeight:1.45') && app.includes('whiteSpace:"pre-line"') && app.includes("Step {tutStep + 1} of {TUT_STEPS.length}") && app.includes("Step {dayTutStep + 1} of {DAY_TUT_STEPS.length}"));
assert("account guide replay buttons launch tours without collapsing the guides row", app.includes('data-testid="replay-app-tour"') && app.includes('data-testid="replay-track-tour"') && app.includes("e.preventDefault();e.stopPropagation();setTab(\"day\");setDaySubScreen(null);setTodayPanel(\"log\");setTutStep(0)") && app.includes("e.preventDefault();e.stopPropagation();setTab(\"day\");setDaySubScreen(null);setDayTutStep(0)"));
assert("onboarding starts directly in the current Clock Track instead of asking tired parents to choose a mode", onboardingBlock.includes('dashboard_mode: "clock"') && !onboardingBlock.includes('data-testid="onboarding-dashboard-mode-choice"') && !onboardingBlock.includes("Choose your\\nTrack view") && !app.includes("setTrackModePreference") && !app.includes("ob_dashboard_mode_v1"));
assert("new account child setup uses Clock Track and does not resurrect retired Track variants", !app.includes('data-testid="switch-to-no-pressure"') && !app.includes('data-testid="track-mode-preference"') && !app.includes('data-testid="switch-to-full-dashboard"') && !childSetupBlock.includes("setTrackModePreference"));
assert("day-one questionnaire includes sleep, feeding, reflux, CMPA, tongue tie, premature and safety flags", app.includes("SAFE_DAY1_CONCERNS") && app.includes("reflux:true") && app.includes("allergy:true") && app.includes("SAFE_DAY1_FEEDING") && app.includes("unsettled_after_feeds:true") && app.includes("SAFE_DAY1_FACTORS") && app.includes("cmpa:true") && app.includes("tongue_tie:true") && app.includes("premature:true") && app.includes("SAFE_DAY1_SAFETY") && app.includes("blood:true"));
assert("day-one questionnaire maps known factors into child condition hints", onboardingBlock.includes('_conditionHints.push("reflux")') && onboardingBlock.includes('_conditionHints.push("cmpa")') && onboardingBlock.includes('_conditionHints.push("tongue_tie")') && onboardingBlock.includes('_conditionHints.push("nicu")') && onboardingBlock.includes("safeChildConditions"));
assert("day-one insight card is wired and framed as non-medical pattern support", app.includes('data-testid="day1-insight-card"') && app.includes("Pattern support only. not medical advice.") && app.includes("safeDay1Profile(activeChild?.day1Profile"));

assert("14-day trial is first-install anchored in app and server", app.includes("const TRIAL_DAYS = 14") && app.includes("_inferFirstInstallIso") && app.includes('localStorage.getItem("install_date_v1")') && app.includes('localStorage.getItem("obubba_trial_start")') && functionsSource.includes("const TRIAL_DAYS = 14") && functionsSource.includes("trialStartFromClient(firstInstallAtClient, nowMs)"));
assert("native trial claim uses device key and server entitlement", app.includes('callAccountFunction("claimTrial"') && app.includes("trialDeviceKey: key") && app.includes("firstInstallAtClient: firstInstallAt || trialStart ||") && functionsSource.includes('db.collection("trial_devices").doc(trialDeviceKey)') && functionsSource.includes('db.collection("entitlements").doc(uid)'));
assert("new and claimed accounts carry trial history to Firestore", reserveBlock.includes("trialStartedAtClient") && reserveBlock.includes("trialFirstInstallAtClient") && reserveBlock.includes("trialDeviceKey") && reserveBlock.includes("trialUsed") && claimAccountBlock.includes("trialStartedAtClient") && claimAccountBlock.includes("trialFirstInstallAtClient") && claimAccountBlock.includes("trialDeviceKey") && claimAccountBlock.includes("trialUsed"));

assert("username creation validates availability through callable and uses hardened PIN", reserveBlock.includes('callAccountFunction("usernameStatus"') && reserveBlock.includes("pinHash: await hashAccountPin(pin, key)") && app.includes("const canSubmit = st===\"available\" && pin.length===4 && !saving"));
assert("first-run create-account form requires terms and matching four digit PINs", authScreenBlock.includes("authPin2 === authPin && agreedToTerms") && authCreateBlock.includes("PINs don't match") && authScreenBlock.includes("authPin.length === 4"));
assert("existing account login, repair and recovery email all use callable checks", app.includes('callAccountFunction("accountLogin"') && app.includes('callAccountFunction("accountSignInStatus"') && app.includes('callAccountFunction("repairAccountSignIn"') && app.includes('callAccountFunction("saveRecoveryEmail"') && app.includes('callAccountFunction("recoveryEmailLookup"'));
assert("account switch guard prevents previous child data leaking into a newly signed-in account", app.includes("ACCOUNT-SWITCH GUARD") && app.includes("cloudSyncedRef.current = false") && app.includes("localStorage.removeItem(\"ob_children_owner\")") && app.includes("setChildSyncCodes({})") && app.includes("childSubsRef.current = {}"));
assert("native mirror restore can recover post-update child data before onboarding decisions strand users", app.includes("_stripNativeMirrorChildren") && app.includes("nativeDataRestoreDoneRef") && app.includes('ob_native_data_mirror_v1') && app.includes("Data restored after update") && app.includes('localStorage.setItem("onboarded_v2", "1")'));
assert("native mirror writes are hash-gated so Android does not rewrite full history on every render", app.includes("function queueNativeDataMirrorWrite(mirrorPayload)") && app.includes('const OB_NATIVE_DATA_MIRROR_HASH_KEY = "ob_native_data_mirror_hash_v1"') && app.includes("NATIVE_MIRROR_MIN_INTERVAL") && app.includes("stableHash === storedHash") && app.includes("_nativePrefSet(OB_NATIVE_DATA_MIRROR_KEY, mirrorJson)"));

if (failed) process.exit(1);
console.log("Onboarding and account audit passed.");
