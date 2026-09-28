// Subscription webhook ledger — the authoritative, event-driven source of truth for
// renew / cancel / grace / billing-retry / refund. Today entitlement is client-pushed
// only (mirrorStoreEntitlement / verifyReceipt), so churn is INVISIBLE server-side and
// the 45-day "stale" rule can downgrade paying-but-idle users. These handlers record
// every store event into an append-only ledger + a current-state projection.
//
// ⚠️ NOT deploy-ready until the owner:
//   1) `npm i @apple/app-store-server-library` in functions/ (added to package.json here)
//   2) drops Apple root CA .cer files into functions/apple-certs/ (from
//      https://www.apple.com/certificateauthority/ — AppleRootCA-G3.cer etc.)
//   3) sets env: APPLE_BUNDLE_ID, APPLE_APP_APPLE_ID (=6760968757)
//   4) registers the Apple URL (ASC → App Store Server Notifications V2, prod+sandbox)
//      and a Play Pub/Sub topic (Play Console → Monetization setup → RTDN)
//   5) SANDBOX-TESTS both before pointing production at them.
// This lives on its OWN branch so it can't break the main functions deploy.

const { onRequest } = require("firebase-functions/v2/https");
const { onMessagePublished } = require("firebase-functions/v2/pubsub");
const { getFirestore } = require("firebase-admin/firestore");
const { logger } = require("firebase-functions");
const fs = require("fs");
const path = require("path");

const db = getFirestore();

// ── ledger writer (idempotent: one doc per event, .create() rejects dup) ──────────
async function recordEvent(eventId, evt) {
  const ref = db.collection("subscription_events").doc(String(eventId));
  try {
    await ref.create({ ...evt, createdAt: new Date() });
  } catch (_) {
    return false; // already recorded — a retry/redelivery
  }
  // Current-state projection — becomes the AUTHORITATIVE entitlement input.
  const key = evt.originalTransactionId || evt.purchaseToken;
  if (key) {
    await db.collection("subscription_state").doc(String(key)).set({
      platform: evt.platform,
      status: evt.status || null,          // active | grace | billing_retry | expired | refunded | canceled
      lastEventType: evt.type,
      lastEventAtMs: evt.eventAtMs || Date.now(),
      expiresAtMs: evt.expiresAtMs || null,
      autoRenew: evt.autoRenew == null ? null : !!evt.autoRenew,
      productId: evt.productId || null,
      username: evt.username || null,
      churnReason: evt.reason || null,
      updatedAtMs: Date.now(),
    }, { merge: true });
  }
  return true;
}

// ── Apple: App Store Server Notifications V2 ──────────────────────────────────────
// notificationType/subtype → our normalized ledger type + status + churn reason.
const APPLE_MAP = {
  SUBSCRIBED:            { type: "subscribe",     status: "active" },
  DID_RENEW:             { type: "renew",         status: "active" },
  OFFER_REDEEMED:        { type: "subscribe",     status: "active" },
  DID_CHANGE_RENEWAL_STATUS: { type: "renewal_status", status: "active" }, // autoRenew flag carries churn intent
  DID_FAIL_TO_RENEW:     { type: "billing_retry", status: "billing_retry", reason: "billing" },
  GRACE_PERIOD_EXPIRED:  { type: "expire",        status: "expired", reason: "billing" },
  EXPIRED:               { type: "expire",        status: "expired" }, // subtype → reason below
  REFUND:                { type: "refund",        status: "refunded", reason: "refund" },
  REVOKE:                { type: "expire",        status: "expired", reason: "revoke" },
};
const APPLE_EXPIRED_SUBTYPE = {
  VOLUNTARY: "voluntary",
  BILLING_RETRY: "billing",
  PRICE_INCREASE: "price_increase",
  PRODUCT_NOT_FOR_SALE: "product_unavailable",
};

let _verifier = null;
function appleVerifier() {
  if (_verifier) return _verifier;
  // Lazy require so a missing dep only fails Apple processing, not module load.
  const { SignedDataVerifier, Environment } = require("@apple/app-store-server-library");
  const certDir = path.join(__dirname, "apple-certs");
  const roots = fs.readdirSync(certDir).filter((f) => f.endsWith(".cer"))
    .map((f) => fs.readFileSync(path.join(certDir, f)));
  const env = process.env.APPLE_STORE_ENV === "sandbox" ? Environment.SANDBOX : Environment.PRODUCTION;
  _verifier = new SignedDataVerifier(
    roots, /*enableOnlineChecks*/ true, env,
    process.env.APPLE_BUNDLE_ID, Number(process.env.APPLE_APP_APPLE_ID) || undefined,
  );
  return _verifier;
}

exports.appStoreNotifyV2 = onRequest({ cors: false }, async (req, res) => {
  // Always 200 after we've durably recorded (or rejected) — Apple retries on non-2xx,
  // and the ledger .create() already dedupes redeliveries.
  try {
    const signedPayload = req.body && req.body.signedPayload;
    if (!signedPayload) { res.status(400).send("missing signedPayload"); return; }
    const v = appleVerifier();
    const note = await v.verifyAndDecodeNotification(signedPayload); // throws if signature/chain invalid
    const txn = note.data && note.data.signedTransactionInfo
      ? await v.verifyAndDecodeTransaction(note.data.signedTransactionInfo) : {};
    const renewal = note.data && note.data.signedRenewalInfo
      ? await v.verifyAndDecodeRenewalInfo(note.data.signedRenewalInfo) : {};
    const m = APPLE_MAP[note.notificationType] || { type: "other", status: null };
    let reason = m.reason || null;
    if (note.notificationType === "EXPIRED" && note.subtype) reason = APPLE_EXPIRED_SUBTYPE[note.subtype] || reason;
    // AUTO_RENEW_DISABLED = pending voluntary churn
    if (note.notificationType === "DID_CHANGE_RENEWAL_STATUS" && note.subtype === "AUTO_RENEW_DISABLED") {
      reason = "voluntary_pending";
    }
    await recordEvent(note.notificationUUID, {
      platform: "ios",
      type: m.type,
      status: m.status,
      reason,
      subtype: note.subtype || null,
      productId: txn.productId || null,
      originalTransactionId: txn.originalTransactionId || null,
      expiresAtMs: txn.expiresDate || null,
      autoRenew: renewal.autoRenewStatus == null ? null : renewal.autoRenewStatus === 1,
      username: txn.appAccountToken || null, // set when the client passed appAccountToken (see #240)
      eventAtMs: note.signedDate || Date.now(),
    });
    res.status(200).send("ok");
  } catch (err) {
    logger.error("appStoreNotifyV2 failed", err);
    // 400 (not 500) on verification failure so Apple doesn't retry-storm a forged/bad payload.
    res.status(400).send("bad notification");
  }
});

// ── Google Play: Real-Time Developer Notifications (Pub/Sub push) ─────────────────
// Pub/Sub delivery is GCP-authenticated, so no signature check needed. For full state
// (expiry, linked account) enrich via Play Developer API purchases.subscriptionsv2.get
// — left as a follow-up so this stays dependency-light; the notificationType already
// tells us the churn event.
const PLAY_MAP = {
  1:  { type: "recovered",     status: "active" },
  2:  { type: "renew",         status: "active" },
  3:  { type: "cancel",        status: "canceled", reason: "voluntary" }, // user cancelled (still active until expiry)
  4:  { type: "subscribe",     status: "active" },
  5:  { type: "billing_retry", status: "billing_retry", reason: "billing" }, // ON_HOLD
  6:  { type: "grace",         status: "grace", reason: "billing" },         // IN_GRACE_PERIOD
  7:  { type: "restart",       status: "active" },
  10: { type: "pause",         status: "paused" },
  12: { type: "expire",        status: "expired", reason: "revoke" },        // REVOKED
  13: { type: "expire",        status: "expired" },                          // EXPIRED
};

exports.playRtdn = onMessagePublished(
  { topic: process.env.PLAY_RTDN_TOPIC || "play-rtdn" },
  async (event) => {
    try {
      const raw = event.data.message.data
        ? Buffer.from(event.data.message.data, "base64").toString("utf8") : "{}";
      const body = JSON.parse(raw);
      const sn = body.subscriptionNotification;
      if (!sn) return; // ignore test / one-time-product / voided-purchase notifications here
      const m = PLAY_MAP[sn.notificationType] || { type: "other", status: null };
      const eventId = `play_${event.data.message.messageId || sn.purchaseToken}`;
      await recordEvent(eventId, {
        platform: "android",
        type: m.type,
        status: m.status,
        reason: m.reason || null,
        productId: sn.subscriptionId || null,
        purchaseToken: sn.purchaseToken || null,
        eventAtMs: Number(body.eventTimeMillis) || Date.now(),
      });
    } catch (err) {
      logger.error("playRtdn failed", err);
      // swallow — throwing would make Pub/Sub redeliver; the ledger already dedupes.
    }
  },
);
