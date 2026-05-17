#!/bin/bash
set -e

find \
  dist \
  public \
  ios/App/App/public \
  android/app/src/main/assets/public \
  android/capacitor-cordova-android-plugins \
  ios/capacitor-cordova-ios-plugins \
  ios/App/App \
  android/app/src/main/res \
  build \
  android/app/build \
  -depth -name '* [0-9]*' -exec rm -rf {} + 2>/dev/null || true
