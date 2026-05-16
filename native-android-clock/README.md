# OBubba Native Clock Prototype

This folder is intentionally separate from the current Capacitor/WebView Android app.
It is a small native Android prototype for the clock screen so we can test a true
Android Canvas renderer without risking the production app.

What is included:

- A standalone Gradle Android project.
- One native `Activity` with a custom `ClockFaceView`.
- Native Canvas drawing for the clock rings, event arcs, current-time marker, and firefly-style presence sparks.
- Local demo log buttons so the prototype can be launched and exercised before the full OBubba data layer is wired in.

Build from the repo root with the existing Android Gradle wrapper:

```sh
android/gradlew -p native-android-clock :app:assembleDebug
```

Install on a connected emulator/device:

```sh
android/gradlew -p native-android-clock :app:installDebug
```

Next wiring step:

- Replace the demo local log store with the OBubba clock state adapter.
- Feed real `bubba_presence` online parents into `ClockFaceView#setOnlineParentCount` or a richer presence model.
- Add parity screens only after the clock proves faster and steadier than the WebView version.
