# OBubba Store Upload Handoff

This repo has a shared upload profile for future Codex chats:

```bash
source tools/store-upload-profile.sh
obubba_store_upload_status
```

The profile does not contain raw secrets. It points to local signing and store-auth locations and sources this user-local file when present:

```bash
~/.codex/obubba-store-upload.local.env
```

Do not print, paste, commit, or copy private key contents, service account JSON contents, keystore passwords, App Store Connect issuer IDs, or access tokens into chat.

## Local Credential Locations

Android signing:

```bash
$OBUBBA_ANDROID_KEY_PROPERTIES
$OBUBBA_ANDROID_RELEASE_KEYSTORE
```

Apple upload keys:

```bash
$OBUBBA_APPSTORECONNECT_KEY_DIR/AuthKey_*.p8
```

Google Play upload auth:

```bash
gcloud auth print-access-token
```

## Standard Build Checks

Before uploading, run:

```bash
npm run test:store-readiness
npm run test:ui-polish
npm run build
npx cap sync android ios
```

Android release build:

```bash
cd android
./gradlew :app:bundleRelease --console=plain
```

iOS archive/export should use the existing `ios/App/ExportOptionsAppStore.plist` or `ios/App/ExportOptionsAppStoreUpload.plist` depending on whether the next step is manual upload or direct export/upload.

## Future Chat Rule

Any future chat should first source `tools/store-upload-profile.sh`, verify `obubba_store_upload_status`, then build and upload using the local credentials. If a command needs a secret value not already available through a file/keychain/tool, ask the user to enter it into a local secure file or keychain item, never into chat.
