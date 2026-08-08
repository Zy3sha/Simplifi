// OBubba camera → cloud event ingestion (CAMERA_PRODUCTION_ARCHITECTURE.md).
//
// A shipped camera/hub holds NO admin creds and NO family secret — only a per-device,
// write-only ingest token. It POSTs typed state-change events here; this webhook (admin,
// server-side) validates them, stamps authoritative time, dedupes deterministically,
// rate-caps, and writes them into the family's EXISTING carer_logs/{BK}/entries — which
// the parent app already pulls back idempotently into the baby's data (always-on
// carerPullBackProvider). ZERO firestore.rules change: the new camera_* collections are
// blocked to all clients by the rules' catch-all deny; only this code (admin) touches
// them, and carer writes go via admin (which self-enforces the carer field allowlist).
//
// Functions: createCameraPairing (onCall, parent) · cameraPair (HTTP, device) ·
//            cameraIngest (HTTP, device) · revokeCameraDevice (onCall, parent).
// Pure logic (validation, clock authority, deterministic ids, entry shaping) lives in
// camera_ingest_core.js (dependency-free, unit-tested).
const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const C = require("./camera_ingest_core");

const db = () => getFirestore();

// Resolve the caller's family backup code (the carer_logs / BK code) from their uid.
async function backupCodeForUid(uid) {
  const snap = await db().collection("uid_to_backup").doc(uid).get();
  const code = snap.exists ? String(snap.data().backupCode || "").trim().toUpperCase() : "";
  return C.BACKUP_CODE_RE.test(code) ? code : null;
}

// PARENT (auth'd) asks for a one-time pairing code to add a camera to their family.
const createCameraPairing = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const uid = request.auth.uid;
  const bk = await backupCodeForUid(uid);
  if (!bk) throw new HttpsError("failed-precondition", "Back up your data first, then add a camera.");
  const childCode = String((request.data && request.data.childCode) || "").trim().toUpperCase().slice(0, 12);
  const nonce = C.randomCode(5); // 10 hex chars, single-use + short-lived
  const nowMs = Date.now();
  await db().collection("camera_pair_nonces").doc(nonce).set({
    bk, childCode, createdBy: uid, createdAtMs: nowMs, expiresAtMs: nowMs + C.NONCE_TTL_MS, used: false,
  });
  return { nonce, expiresAtMs: nowMs + C.NONCE_TTL_MS };
});

// DEVICE redeems the nonce for a per-device, write-only ingest token. No family secret
// ever reaches the device. Single-use nonce (transactional) → can't be replayed.
const cameraPair = onRequest({ cors: false }, async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
    const nonce = String((req.body && req.body.nonce) || "").trim().toUpperCase();
    const deviceId = String((req.body && req.body.deviceId) || "").trim().slice(0, 64);
    if (!nonce || !/^[A-Z0-9_-]{6,64}$/.test(deviceId)) return res.status(400).json({ error: "bad request" });

    const token = C.randomCode(24); // 48 hex chars
    await db().runTransaction(async (tx) => {
      const ref = db().collection("camera_pair_nonces").doc(nonce);
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error("invalid");
      const n = snap.data();
      if (n.used || Date.now() > n.expiresAtMs) throw new Error("expired");
      tx.update(ref, { used: true, usedAtMs: Date.now(), deviceId });
      tx.set(db().collection("camera_devices").doc(deviceId), {
        bk: n.bk, childCode: n.childCode || "", createdBy: n.createdBy,
        tokenHash: C.sha256(token), createdAtMs: Date.now(), revoked: false,
        lastSeenMs: 0, windowStartMs: 0, windowCount: 0, lastWriteMs: 0,
      }, { merge: true });
    });
    return res.json({ deviceId, ingestToken: token });
  } catch (e) {
    const m = String(e.message || e);
    return res.status(m === "invalid" || m === "expired" ? 401 : 500).json({ error: m });
  }
});

// DEVICE posts typed events. Validates token + rate cap, stamps server time, dedupes,
// writes carer entries via admin. Returns counts.
const cameraIngest = onRequest({ cors: false }, async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
    const deviceId = String((req.body && req.body.deviceId) || "").trim().slice(0, 64);
    const token = String((req.body && req.body.ingestToken) || "");
    const events = Array.isArray(req.body && req.body.events) ? req.body.events : [];
    const tzOffsetMin = Number((req.body && req.body.tzOffsetMin) || 0) || 0;
    if (!deviceId || !token) return res.status(400).json({ error: "bad request" });

    const devRef = db().collection("camera_devices").doc(deviceId);
    const nowMs = Date.now();
    const gate = await db().runTransaction(async (tx) => {
      const snap = await tx.get(devRef);
      if (!snap.exists) return { error: "unknown device", status: 401 };
      const d = snap.data();
      if (d.revoked) return { error: "revoked", status: 403 };
      if (C.sha256(token) !== d.tokenHash) return { error: "bad token", status: 401 };
      if (nowMs - (d.lastWriteMs || 0) < C.INGEST_MIN_INTERVAL_MS) return { error: "slow down", status: 429 };
      let windowStartMs = d.windowStartMs || 0, windowCount = d.windowCount || 0;
      if (nowMs - windowStartMs > 3600000) { windowStartMs = nowMs; windowCount = 0; }
      if (windowCount >= C.INGEST_MAX_PER_HOUR) return { error: "rate limit", status: 429 };
      tx.update(devRef, { lastWriteMs: nowMs, lastSeenMs: nowMs, windowStartMs, windowCount: windowCount + 1 });
      return { bk: d.bk };
    });
    if (gate.error) return res.status(gate.status).json({ error: gate.error });

    const entriesCol = db().collection("carer_logs").doc(gate.bk).collection("entries");
    let written = 0, skipped = 0;
    const batch = db().batch();
    for (const ev of events.slice(0, C.INGEST_MAX_EVENTS)) {
      const kind = String((ev && ev.kind) || "");
      const atMs = C.validateEventTime(Number(ev && ev.atMs), nowMs);
      if (atMs === null || !C.CAMERA_EVENT_KINDS[kind]) { skipped++; continue; }
      const entry = C.buildCarerEntry(kind, atMs, { tzOffsetMin, note: ev.note });
      if (!entry) { skipped++; continue; }
      const id = C.deterministicEntryId(deviceId, kind, atMs, tzOffsetMin);
      batch.set(entriesCol.doc(id), entry, { merge: true }); // idempotent upsert
      written++;
    }
    if (written) await batch.commit();
    return res.json({ written, skipped });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
});

// PARENT revokes a camera (the "Remove" in Devices-with-access). Instant — just flip the
// binding; no family-code rotation, no partner-sync disruption.
const revokeCameraDevice = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const uid = request.auth.uid;
  const deviceId = String((request.data && request.data.deviceId) || "").trim().slice(0, 64);
  if (!deviceId) throw new HttpsError("invalid-argument", "deviceId required");
  const bk = await backupCodeForUid(uid);
  const ref = db().collection("camera_devices").doc(deviceId);
  const snap = await ref.get();
  if (!snap.exists) return { ok: true };
  if (!bk || snap.data().bk !== bk) throw new HttpsError("permission-denied", "Not your camera");
  await ref.update({ revoked: true, revokedAtMs: Date.now(), revokedBy: uid });
  return { ok: true };
});

module.exports = { createCameraPairing, cameraPair, cameraIngest, revokeCameraDevice };
