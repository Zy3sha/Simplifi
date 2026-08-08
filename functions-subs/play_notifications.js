// ══════════════════════════════════════════════════════════════════
// OBubba — Google Play Real-time Developer Notifications (RTDN)  — Android side
// ══════════════════════════════════════════════════════════════════
//
// The Android mirror of appstore_notifications.js. Google publishes a Pub/Sub message on
// every subscription event; this decodes it, asks the Play Developer API for the
// AUTHORITATIVE state of that purchaseToken, records it to `subscriptions/`, maps it to the
// account via the purchase's obfuscatedExternalAccountId (our P1 token → subscription_tokens),
// and grants/revokes Premium — gated behind SUB_GRANTS_ENABLED, same as the iOS function.
//
// Owner setup (see SERVER_AUTH_SUBSCRIPTIONS.md):
//   1. Pub/Sub topic `play-rtdn` created + Google's publisher SA granted (DONE via gcloud).
//   2. Play Console → Monetization setup → Real-time developer notifications:
//      topic = projects/obubba-d9ccc/topics/play-rtdn → Save → Send test notification.
//   3. Play Console → Setup → API access: link the `obubba-d9ccc` cloud project + grant this
//      project's runtime service account access, so subscriptionsv2.get() can read state.
//      Until #3 is done, get() 403s — we record the event + ack (no retry storm) and process
//      fully once access is live.

const { onMessagePublished } = require("firebase-functions/v2/pubsub");
const { getFirestore } = require("firebase-admin/firestore");

const db = () => getFirestore();
const PACKAGE = "com.obubba.app";
const RTDN_TOPIC = "play-rtdn"; // matches the topic set in Play Console

// Grants are LEDGER-ONLY until this is turned on (mirrors the iOS GRANT_ENABLED gate).
const GRANT_ENABLED = String(process.env.SUB_GRANTS_ENABLED || "").toLowerCase() === "true";

// Play `subscriptionState` values that keep entitlement.
const ENTITLED_STATES = new Set([
  "SUBSCRIPTION_STATE_ACTIVE",
  "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
  "SUBSCRIPTION_STATE_ON_HOLD", // still owned; keep access for now
]);
const REVOKED_STATES = new Set([
  "SUBSCRIPTION_STATE_EXPIRED",
  "SUBSCRIPTION_STATE_CANCELED",
]);

// Auth for the Play Developer API. We call the REST endpoint directly with a bearer
// token from google-auth-library (already a firebase-admin dependency) rather than the
// monolithic `googleapis` client — that package is huge and OOMs the deploy analyzer.
let _auth = null;
async function playAccessToken() {
  const { GoogleAuth } = require("google-auth-library");
  if (!_auth) {
    _auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/androidpublisher"] });
  }
  const client = await _auth.getClient();
  const t = await client.getAccessToken();
  return typeof t === "string" ? t : t && t.token;
}

exports.playRtdn = onMessagePublished(
  { topic: RTDN_TOPIC, region: "us-central1", memory: "256MiB", timeoutSeconds: 30 },
  async (event) => {
    let note;
    try {
      note = event.data.message.json; // firebase-functions decodes base64 JSON
    } catch (_) {
      try {
        const raw = Buffer.from(event.data.message.data || "", "base64").toString("utf8");
        note = JSON.parse(raw);
      } catch (e) {
        console.error("Play RTDN undecodable payload", e && e.message);
        return; // ack — nothing we can do with it
      }
    }

    // Test notifications (the "Send test notification" button) + one-time / voided purchases
    // carry no subscriptionNotification — ack them so Pub/Sub doesn't retry.
    const sub = note && note.subscriptionNotification;
    if (!sub || !sub.purchaseToken) {
      console.log("Play RTDN (no subscriptionNotification)", note && (note.testNotification ? "TEST ✓" : note.notificationType));
      return;
    }

    const purchaseToken = sub.purchaseToken;
    const productId = sub.subscriptionId || null;

    // Ask Play for the AUTHORITATIVE state (never trust the notification's type alone).
    let state = null, expiresMs = null, accountToken = null, linkedPaymentToken = null, apiError = null;
    try {
      const accessToken = await playAccessToken();
      const url =
        `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE}` +
        `/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`;
      const resp = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!resp.ok) {
        const body = await resp.text();
        const e = new Error(`Play API ${resp.status}: ${body.slice(0, 200)}`);
        e.code = resp.status;
        throw e;
      }
      const d = await resp.json();
      state = d.subscriptionState || null;
      accountToken = d.externalAccountIdentifiers
        ? d.externalAccountIdentifiers.obfuscatedExternalAccountId || null
        : null;
      linkedPaymentToken = d.linkedPurchaseToken || null;
      const items = d.lineItems || [];
      expiresMs = items
        .map((li) => (li.expiryTime ? Date.parse(li.expiryTime) : 0))
        .reduce((a, b) => Math.max(a, b), 0) || null;
    } catch (err) {
      const code = (err && (err.code || (err.response && err.response.status))) || 0;
      apiError = { code, message: err && err.message };
      // 401/403 = the Play Developer API access grant (owner step #3) isn't in place yet.
      // Record the event so it's not lost, and ACK (don't retry-storm before access exists).
      // Transient/server errors (5xx) THROW so Pub/Sub retries and we don't drop the event.
      if (code !== 401 && code !== 403) {
        console.error("Play subscriptionsv2.get transient error:", err && err.message);
        throw err;
      }
      console.warn("Play RTDN: Developer API access not granted yet (", code, ") — recording + acking");
    }

    const nowMs = Date.now();
    const active = state ? ENTITLED_STATES.has(state) : false; // unknown state (apiError) → not active

    // Ledger of truth, keyed by the Play purchaseToken.
    await db().collection("subscriptions").doc(`play_${purchaseToken}`).set(
      {
        store: "google_play",
        purchaseToken,
        linkedPurchaseToken: linkedPaymentToken,
        productId,
        appAccountToken: accountToken,
        subscriptionState: state,
        expiresMs,
        active,
        apiError, // non-null until API access is granted
        updatedAtMs: nowMs,
      },
      { merge: true }
    );

    if (apiError) return; // can't resolve the account without the API state — done for now.

    // Resolve the account via the P1 token the client wrote at purchase (same collection the
    // iOS path + linkPurchaseToken use), then reflect into the Premium channel — grant-gated.
    if (accountToken) {
      const map = await db().collection("subscription_tokens").doc(accountToken).get();
      const username = map.exists ? (map.get("username") || null) : null;
      if (username && !GRANT_ENABLED) {
        console.log("Play RTDN would", active ? "GRANT" : "revoke", "premium for", username, "(grants gated off)");
      } else if (username) {
        if (active) {
          await db().collection("premium_entitlements").doc(username).set(
            {
              active: true,
              type: "paid",
              source: `googleplay:${productId || "sub"}`,
              until: expiresMs || null,
              purchaseToken,
              grantedAt: nowMs,
            },
            { merge: true }
          );
        } else if (REVOKED_STATES.has(state)) {
          await db().collection("premium_entitlements").doc(username).set(
            { active: false, revokedAt: nowMs, revokeReason: state },
            { merge: true }
          );
        }
      } else {
        console.log("Play RTDN no username for token", accountToken, "(sub recorded, unattached)");
      }
    }

    console.log("Play RTDN", state, "active=", active, "token=", purchaseToken.slice(0, 10));
  }
);
