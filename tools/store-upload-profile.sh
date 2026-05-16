#!/usr/bin/env bash
set -euo pipefail

# Shared OBubba store-upload profile for Codex sessions.
# This file intentionally contains no secret values. It only resolves local
# paths and sources a user-local profile when present.

PROFILE_IS_SOURCED=0
if [[ -n "${BASH_SOURCE[0]:-}" ]]; then
  PROFILE_SOURCE="${BASH_SOURCE[0]}"
  [[ "$PROFILE_SOURCE" != "$0" ]] && PROFILE_IS_SOURCED=1
elif [[ -n "${(%):-%x}" ]]; then
  PROFILE_SOURCE="${(%):-%x}"
  [[ "${ZSH_EVAL_CONTEXT:-}" == *:file* ]] && PROFILE_IS_SOURCED=1
else
  PROFILE_SOURCE="$0"
fi

SCRIPT_DIR="$(cd "$(dirname "$PROFILE_SOURCE")" && pwd)"
OBUBBA_REPO_DEFAULT="$(cd "$SCRIPT_DIR/.." && pwd)"

export OBUBBA_REPO="${OBUBBA_REPO:-$OBUBBA_REPO_DEFAULT}"
LOCAL_PROFILE="${OBUBBA_STORE_UPLOAD_LOCAL_PROFILE:-$HOME/.codex/obubba-store-upload.local.env}"

if [[ -f "$LOCAL_PROFILE" ]]; then
  # shellcheck disable=SC1090
  source "$LOCAL_PROFILE"
fi

export OBUBBA_ANDROID_PACKAGE="${OBUBBA_ANDROID_PACKAGE:-com.obubba.app}"
export OBUBBA_ANDROID_KEY_PROPERTIES="${OBUBBA_ANDROID_KEY_PROPERTIES:-$OBUBBA_REPO/android/key.properties}"
export OBUBBA_ANDROID_RELEASE_KEYSTORE="${OBUBBA_ANDROID_RELEASE_KEYSTORE:-$OBUBBA_REPO/android/app/obubba-release.jks}"
export OBUBBA_ANDROID_RELEASE_AAB_GLOB="${OBUBBA_ANDROID_RELEASE_AAB_GLOB:-$OBUBBA_REPO/store-release/*/obubba-android-*.aab}"
export OBUBBA_IOS_BUNDLE_ID="${OBUBBA_IOS_BUNDLE_ID:-com.obubba.app}"
export OBUBBA_APPSTORECONNECT_KEY_DIR="${OBUBBA_APPSTORECONNECT_KEY_DIR:-$HOME/.appstoreconnect/private_keys}"
export OBUBBA_IOS_EXPORT_OPTIONS_APPSTORE="${OBUBBA_IOS_EXPORT_OPTIONS_APPSTORE:-$OBUBBA_REPO/ios/App/ExportOptionsAppStore.plist}"
export OBUBBA_IOS_EXPORT_OPTIONS_UPLOAD="${OBUBBA_IOS_EXPORT_OPTIONS_UPLOAD:-$OBUBBA_REPO/ios/App/ExportOptionsAppStoreUpload.plist}"

if [[ -d "$HOME/google-cloud-sdk/bin" && ":$PATH:" != *":$HOME/google-cloud-sdk/bin:"* ]]; then
  export PATH="$HOME/google-cloud-sdk/bin:$PATH"
fi

obubba_store_upload_status() {
  local ok=0
  printf 'OBubba store upload profile\n'
  printf 'repo: %s\n' "$OBUBBA_REPO"

  for check_path in \
    "$OBUBBA_ANDROID_KEY_PROPERTIES" \
    "$OBUBBA_ANDROID_RELEASE_KEYSTORE" \
    "$OBUBBA_IOS_EXPORT_OPTIONS_APPSTORE" \
    "$OBUBBA_IOS_EXPORT_OPTIONS_UPLOAD"
  do
    if [[ -e "$check_path" ]]; then
      printf '[ok] %s\n' "$check_path"
    else
      printf '[missing] %s\n' "$check_path"
      ok=1
    fi
  done

  if find "$OBUBBA_APPSTORECONNECT_KEY_DIR" -maxdepth 1 -name 'AuthKey_*.p8' -print -quit 2>/dev/null | grep -q .; then
    printf '[ok] App Store Connect private key directory has key file(s): %s/AuthKey_*.p8\n' "$OBUBBA_APPSTORECONNECT_KEY_DIR"
  else
    printf '[missing] App Store Connect key file glob: %s/AuthKey_*.p8\n' "$OBUBBA_APPSTORECONNECT_KEY_DIR"
    ok=1
  fi

  if command -v gcloud >/dev/null 2>&1; then
    local acct
    acct="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' 2>/dev/null || true)"
    if [[ -n "$acct" ]]; then
      printf '[ok] gcloud active account present\n'
    else
      printf '[missing] gcloud active account\n'
      ok=1
    fi
  else
    printf '[missing] gcloud command\n'
    ok=1
  fi

  return "$ok"
}

if [[ "$PROFILE_IS_SOURCED" != "1" ]]; then
  obubba_store_upload_status
fi
