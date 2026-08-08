# Camera ingestion webhook — deploy + integrate

Implements Step 1 of `CAMERA_PRODUCTION_ARCHITECTURE.md` (obubba_flutter repo). A shipped
camera/hub holds NO admin creds + NO family secret — only a per-device write-only token —
and POSTs typed events that this webhook writes into `carer_logs/{BK}/entries`, which the
app already pulls back idempotently. **No firestore.rules change** (new `camera_*`
collections are covered by the rules' catch-all deny; carer writes go via admin).

## Functions (in `camera_ingest.js`, core in `camera_ingest_core.js`)
- `createCameraPairing` (onCall, parent) → `{ nonce, expiresAtMs }` (10-min single-use code)
- `cameraPair` (HTTPS, device) — `POST { nonce, deviceId }` → `{ ingestToken }`
- `cameraIngest` (HTTPS, device) — `POST { deviceId, ingestToken, tzOffsetMin, events:[{kind, atMs, note?}] }` → `{ written, skipped }`
- `revokeCameraDevice` (onCall, parent) — `{ deviceId }` → flips `revoked` (instant kill)

`kind ∈ nap-start | nap-end | bedtime | morning | night-wake | feed | note`.

## Deploy (needs the Firebase **Blaze** plan — Cloud Functions require billing)
```bash
cd ~/Desktop/claude-rewrite
firebase deploy --only functions:createCameraPairing,functions:cameraPair,functions:cameraIngest,functions:revokeCameraDevice
```
HTTPS endpoints will be printed (e.g. `https://<region>-obubba-d9ccc.cloudfunctions.net/cameraIngest`).

## Tests
- `node functions/camera_ingest.test.mjs` — pure core (carer-allowlist shape, replay-safe
  ids, clock-authority, suggest-not-assert). No emulator/billing needed. 9/9 green.
- Integration (optional, after deploy or via emulator): pair a fake device, POST an event,
  confirm a `carer_logs/{BK}/entries` doc appears and the app pulls it back.

## Pre-flight before a real parent (NOT done yet)
1. The app must set `child.carerBackupCode` to the account BK during "Add a camera" so the
   always-on pull-back is active (a family that never used Bubba Care has no BK).
2. Turn on **Firebase App Check** on the HTTPS functions before the pilot.
3. Repoint the Mac watcher (`/tmp/ob_camera/monitor.py`) from `cam_event.js` (admin) to
   `POST cameraIngest` — that proves the contract end-to-end and de-risks the Mac.
4. App: "Add a camera" pairing UI (QR/code) + a Remove (revoke) action + camera-source
   badges + a "camera offline" banner.
