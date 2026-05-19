const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const androidGradle = fs.readFileSync(path.join(root, "android/app/build.gradle"), "utf8");
const androidCapacitorGradle = fs.readFileSync(path.join(root, "android/app/capacitor.build.gradle"), "utf8");
const androidCapacitorSettings = fs.readFileSync(path.join(root, "android/capacitor.settings.gradle"), "utf8");
const androidManifest = fs.readFileSync(path.join(root, "android/app/src/main/AndroidManifest.xml"), "utf8");
const androidMainActivity = fs.readFileSync(path.join(root, "android/app/src/main/java/com/obubba/app/MainActivity.java"), "utf8");
const androidStyles = fs.readFileSync(path.join(root, "android/app/src/main/res/values/styles.xml"), "utf8");
const androidV31Styles = fs.readFileSync(path.join(root, "android/app/src/main/res/values-v31/styles.xml"), "utf8");
const androidLaunchBackground = fs.readFileSync(path.join(root, "android/app/src/main/res/drawable/launch_background.xml"), "utf8");
const iosProject = fs.readFileSync(path.join(root, "ios/App/App.xcodeproj/project.pbxproj"), "utf8");
const iosInfo = fs.readFileSync(path.join(root, "ios/App/App/Info.plist"), "utf8");
const iosPodfile = fs.readFileSync(path.join(root, "ios/App/Podfile"), "utf8");
const privacyManifest = fs.readFileSync(path.join(root, "ios/App/App/PrivacyInfo.xcprivacy"), "utf8");
const privacyPolicy = fs.readFileSync(path.join(root, "privacy.html"), "utf8");
const terms = fs.readFileSync(path.join(root, "terms.html"), "utf8");
const entitlements = fs.readFileSync(path.join(root, "ios/App/App/OBubba.entitlements"), "utf8");
const releaseEntitlements = fs.readFileSync(path.join(root, "ios/App/App/OBubbaRelease.entitlements"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const rules = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");

function assert(name, ok) {
  if (!ok) {
    console.error("✗ " + name);
    process.exitCode = 1;
  } else {
    console.log("✓ " + name);
  }
}

function privacyDataTypeBlock(type) {
  const marker = `<string>${type}</string>`;
  const start = privacyManifest.indexOf(marker);
  if (start < 0) return "";
  const before = privacyManifest.lastIndexOf("<dict>", start);
  const after = privacyManifest.indexOf("</dict>", start);
  return before >= 0 && after >= 0 ? privacyManifest.slice(before, after + "</dict>".length) : "";
}

const androidVersion = (androidGradle.match(/versionName\s+"([^"]+)"/) || [])[1];
const iosVersions = Array.from(new Set([...iosProject.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map(m => m[1].trim())));
const appSource = fs.readFileSync(path.join(root, "app.jsx"), "utf8");
const capacitorConfig = fs.readFileSync(path.join(root, "capacitor.config.ts"), "utf8");
const androidTimerService = fs.readFileSync(path.join(root, "android/app/src/main/java/com/obubba/app/services/TimerService.java"), "utf8");
const statusBarPatch = fs.readFileSync(path.join(root, "patches/@capacitor+status-bar+6.0.3.patch"), "utf8");

assert("iOS and Android marketing versions are aligned", iosVersions.length === 1 && androidVersion === iosVersions[0]);
assert("in-app Account version matches native store version", androidVersion && appSource.includes(`Version ${androidVersion}`) && !appSource.includes("Version 1.0"));
assert("package metadata version matches native store version", pkg.version === androidVersion);
assert("Android legacy storage permissions are SDK-scoped", androidManifest.includes('android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32"') && androidManifest.includes('android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28"'));
assert("Android device backup is disabled for baby-data privacy", androidManifest.includes('android:allowBackup="false"') && androidManifest.includes('android:fullBackupContent="false"'));
assert("Android manifest avoids restricted or high-risk store permissions", !/(USE_EXACT_ALARM|SCHEDULE_EXACT_ALARM|REQUEST_INSTALL_PACKAGES|QUERY_ALL_PACKAGES|ACCESS_FINE_LOCATION|ACCESS_COARSE_LOCATION)/.test(androidManifest) && androidManifest.includes('android.permission.WAKE_LOCK" tools:node="remove"'));
assert("Android reminders avoid Play-policy exact-alarm permissions", !androidManifest.includes("android.permission.SCHEDULE_EXACT_ALARM") && !androidManifest.includes("android.permission.USE_EXACT_ALARM"));
assert("Android removes transitive advertising ID permission", androidManifest.includes('com.google.android.gms.permission.AD_ID" tools:node="remove"'));
assert("unused badge plugin stays removed to avoid launcher badge permission sprawl", !pkg.dependencies["@capawesome/capacitor-badge"] && !androidCapacitorGradle.includes("capawesome-capacitor-badge") && !androidCapacitorSettings.includes("capawesome-capacitor-badge") && !iosPodfile.includes("CapawesomeCapacitorBadge"));
assert("Android foreground timer special-use service has a clear store-review subtype", androidManifest.includes("android.permission.FOREGROUND_SERVICE_SPECIAL_USE") && androidManifest.includes('android:foregroundServiceType="specialUse"') && androidManifest.includes("Baby activity timer showing elapsed time for feeds, naps, and sleep tracking"));
assert("Android 15 edge-to-edge is explicitly enabled and system insets protect the WebView", androidGradle.includes("androidx.activity:activity:$androidxActivityVersion") && androidMainActivity.includes("EdgeToEdge.enable(") && androidMainActivity.includes("WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()") && androidManifest.includes('android:windowSoftInputMode="adjustResize"'));
assert("Android vitals fixes remove partial wake locks and deprecated edge-to-edge status bar calls", androidManifest.includes('android.permission.WAKE_LOCK" tools:node="remove"') && !/WakeLock|PowerManager|PARTIAL_WAKE_LOCK|acquireWakeLock|releaseWakeLock/.test(androidTimerService) && statusBarPatch.includes("Android 15 edge-to-edge owns system bar colors") && statusBarPatch.includes("WindowCompat.setDecorFitsSystemWindows") && !/setStatusBarColor|getStatusBarColor|setNavigationBarColor|SYSTEM_UI_FLAG|WindowManager/.test(statusBarPatch.replace(/^-.*$/gm, "")));
assert("Android keyboard and native insets stay clear of app chrome", fs.readFileSync(path.join(root, "capacitor.config.ts"), "utf8").includes("resizeOnFullScreen: true") && fs.readFileSync(path.join(root, "capacitor.config.ts"), "utf8").includes("scroll: true") && androidMainActivity.includes("webView.setClipToPadding(true)") && androidMainActivity.includes("syncCssInsets(webView, insets)") && androidMainActivity.includes("--ob-native-bottom-inset"));
assert("Android cold-launch splash is branded before the WebView paints", androidManifest.includes('android:theme="@style/AppTheme.Splash"') && androidStyles.includes('<item name="android:windowBackground">@drawable/launch_background</item>') && androidV31Styles.includes("android:windowSplashScreenAnimatedIcon") && androidV31Styles.includes("@mipmap/ic_launcher_foreground") && androidLaunchBackground.includes("@mipmap/ic_launcher_foreground") && capacitorConfig.includes("launchAutoHide: false") && capacitorConfig.includes("launchShowDuration: 30000"));
assert("iOS privacy manifest is present and declares required API reasons", privacyManifest.includes("NSPrivacyAccessedAPITypes") && privacyManifest.includes("NSPrivacyAccessedAPICategoryUserDefaults"));
assert("iOS privacy manifest marks account-synced baby content as linked", ["NSPrivacyCollectedDataTypePhotosOrVideos", "NSPrivacyCollectedDataTypeOtherUserContent", "NSPrivacyCollectedDataTypeName"].every(type => privacyDataTypeBlock(type).includes("NSPrivacyCollectedDataTypeLinked</key><true/>")));
assert("iOS privacy manifest declares optional travel-time location accurately", privacyDataTypeBlock("NSPrivacyCollectedDataTypePreciseLocation").includes("NSPrivacyCollectedDataTypeLinked</key><false/>") && privacyDataTypeBlock("NSPrivacyCollectedDataTypePreciseLocation").includes("NSPrivacyCollectedDataTypeTracking</key><false/>") && iosInfo.includes("NSLocationWhenInUseUsageDescription") && !privacyManifest.includes("NSPrivacyCollectedDataTypeCoarseLocation"));
assert("legal location copy matches Apple MapKit routing behavior", privacyPolicy.includes("sent to Apple's routing services") && privacyPolicy.includes("we do not send it to OBubba servers") && terms.includes("sent to Apple's routing services") && !privacyPolicy.includes("never stored, shared, or transmitted to any third party") && !privacyPolicy.includes("any third party.</p>"));
assert("iOS permission prompts explain parent-controlled feature use", ["NSCameraUsageDescription", "NSPhotoLibraryUsageDescription", "NSPhotoLibraryAddUsageDescription", "NSMicrophoneUsageDescription", "NSSpeechRecognitionUsageDescription", "NSFaceIDUsageDescription"].every(k => iosInfo.includes(`<key>${k}</key>`)));
assert("iOS background modes stay limited to push delivery", iosInfo.includes("<key>UIBackgroundModes</key>") && iosInfo.includes("<string>remote-notification</string>") && !/<string>(fetch|processing|audio)<\/string>/.test(iosInfo));
assert("iOS avoids BGTask identifiers without native BGTask registration", !iosInfo.includes("BGTaskSchedulerPermittedIdentifiers"));
assert("iOS Live Activities support stays declared for timer intelligence", iosInfo.includes("<key>NSSupportsLiveActivities</key>") && iosInfo.includes("<true/>"));
assert("iOS tracking is declared off", privacyManifest.includes("<key>NSPrivacyTracking</key>") && privacyManifest.includes("<false/>") && !privacyManifest.includes("NSUserTrackingUsageDescription"));
assert("iOS debug push entitlement stays development for device testing", entitlements.includes("<string>development</string>"));
assert("iOS release push entitlement is production for App Store archives", releaseEntitlements.includes("<string>production</string>") && /504EC3181FED79650016851F \/\* Release \*\/[\s\S]*?CODE_SIGN_ENTITLEMENTS = App\/OBubbaRelease\.entitlements;[\s\S]*?name = Release;/.test(iosProject));
assert("iOS debug build keeps development push entitlement for phone installs", /504EC3171FED79650016851F \/\* Debug \*\/[\s\S]*?CODE_SIGN_ENTITLEMENTS = App\/OBubba\.entitlements;[\s\S]*?name = Debug;/.test(iosProject));
assert("iOS entitlements are limited to declared OBubba capabilities", [entitlements, releaseEntitlements].every(src => src.includes("aps-environment") && src.includes("com.apple.developer.applesignin") && src.includes("com.apple.developer.siri") && src.includes("applinks:obubba.com") && !src.includes("com.apple.developer.healthkit")));
assert("review prompt avoids store review gating", appSource.includes("Help shape OBubba") && appSource.includes("Leave a review") && appSource.includes("Send feedback") && !/Love it!|It needs some work|Love it\\?/.test(appSource));
assert("review prompt ignores corrupted future snooze storage", appSource.includes("const lastPromptMs = safeTimestampMs(lastPrompt, NaN);") && appSource.includes("lastPromptMs <= Date.now()") && !appSource.includes("Date.now() - parseInt(lastPrompt)"));
assert("trial upgrade CTAs are hidden for premium accounts and open active-trial paywall copy", appSource.includes("STORE_READY && !isPremium && trialActive && trialDaysLeft <= 5") && appSource.includes("!isPremium && trialActive && trialDaysLeft <= 5") && appSource.includes('onClick={()=>{haptic();triggerPaywall("trial");}}') && appSource.includes("Keep OBubba Premium after your trial") && appSource.includes("Your trial still has \" + trialDaysLeft"));
assert("paywall shows configured fallback prices when native store products are unavailable", appSource.includes('return paywallProductsLoaded ? _fallbackPlanPrice(planKey) : "Loading";') && !appSource.includes('paywallProductsLoaded ? "See store"'));
assert("retired parent-to-parent UGC surface stays removed", !/Bubba Hug|bubba_hugs|ob_bubba_hugs|ob-parent-room-bubba-hug|sendBubbaHug|sendClockPresenceHug|Send one onward/.test(appSource + rules));

if (!process.exitCode) console.log("Store readiness audit passed.");
