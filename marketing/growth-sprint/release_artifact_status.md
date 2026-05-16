# Release Artifact Status

Prepared: 2026-05-15

## Current Local Build

- Version: `2.7.8`
- Android package: `com.obubba.app`
- Android versionCode: `59`
- iOS build: `50`
- Web cache version from latest build: `1778854141`

## Freshly Verified Outputs

- Android debug APK: `/Users/zyesha/Desktop/obubba-clock-lab/android/app/build/outputs/apk/debug/app-debug.apk`
- Android release AAB: `/Users/zyesha/Desktop/obubba-clock-lab/android/app/build/outputs/bundle/release/app-release.aab`
- Upload-safe dated copy: `/Users/zyesha/Desktop/obubba-clock-lab/store-release/2.7.8-android59-crashfix-2026-05-15/obubba-android-2.7.8-build59-crashfix-2026-05-15.aab`
- AAB SHA-256: `555ad50b62601552c673a98ff9a5ade470dd181f0a4a28751b9648972fbd88d6`

## Verification Run

- `npm test` passed.
- `npm run build` passed.
- `npx cap sync ios android` passed.
- `npx cap sync android` passed.
- `./gradlew :app:assembleDebug :app:bundleRelease` passed.
- `xcodebuild -workspace ios/App/App.xcworkspace -scheme App -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build` passed.
- Android emulator startup smoke passed on `emulator-5554`.
- Android breast timer smoke passed: one-tap starts feeding, active side highlights, switching sides pauses Left and resumes Right.
- Android crash buffer remained empty after startup and breast timer smoke.

## Upload Note

Upload versionCode `59` to Google Play as the crash-fix build. It supersedes the `2.7.8 (58)` production build that showed `TimerServicePlugin.updateTimer` crashes.
