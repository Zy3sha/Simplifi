// ══════════════════════════════════════════════════════════════════
// OBubba — App Store Server Notifications V2 handler  (P2 of SERVER_AUTH_SUBSCRIPTIONS)
// ══════════════════════════════════════════════════════════════════
//
// PURPOSE: make Premium SERVER-AUTHORITATIVE. Apple POSTs a signed notification here on
// every subscription event (buy / renew / expire / refund / billing-retry). We VERIFY
// Apple's signature, decode the transaction, persist it to `subscriptions/`, map it back
// to the account via the purchase's appAccountToken, and grant/revoke Premium server-side
// — so a paid purchase sticks even though the client's Firebase uid is ephemeral (the root
// cause of "paid but no Premium"). See SERVER_AUTH_SUBSCRIPTIONS.md.
//
// ─── BEFORE THIS CAN DEPLOY / BE TRUSTED (owner steps) ───────────────────────────────
//  1. `cd functions && npm install @apple/app-store-server-library`   (adds the ONE dep;
//     it does the x5c chain + JWS ES256 verification — do NOT hand-roll that, it's the
//     security boundary).
//  2. Put Apple's **Apple Root CA - G3** cert (DER) at functions/apple_root_certs/AppleRootCA-G3.cer
//     (download from https://www.apple.com/certificateauthority/).
//  3. In index.js add:  `Object.assign(exports, require("./appstore_notifications"));`
//  4. Deploy:  firebase deploy --only functions:appStoreServerNotificationsV2
//  5. App Store Connect → your app → App Information → **App Store Server Notifications**:
//     set Production URL + Sandbox URL to the deployed function URL, Version **2**.
//  6. SANDBOX-TEST end to end (buy in sandbox → a `subscriptions/*` doc appears with the
//     right appAccountToken → Premium granted even after a reinstall) BEFORE trusting it
//     for real revenue. Until step 6 passes, treat this as advisory only.
//
// PAIRED CLIENT WORK (P1.5, small): at purchase time the app must write
//   subscription_tokens/{appAccountToken} = { uid, username }
// so this function can resolve appAccountToken → account. Without it we still record the
// subscription (keyed by originalTransactionId) but can't attach Premium to a username.

const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

// Reuses the app initialised in index.js (this module is merged into it).
const db = () => getFirestore();

// ─── P1.5: link a purchase's appAccountToken → account (called by the app at buy time) ──
// Rules-safe: written with admin privileges (bypasses the shared, deployed firestore.rules,
// which we must NOT change), and SECURE — the uid comes from the auth context, never the
// client. Stores the username too (resolved server-side from the uid) so the notification
// handler can attach Premium to premium_entitlements/{username} directly.
exports.linkPurchaseToken = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const uid = request.auth.uid;
  const token = String((request.data && request.data.token) || "").trim();
  // Must be a UUID (matches purchaseAccountToken's output / an appAccountToken).
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(token)) {
    throw new HttpsError("invalid-argument", "Bad token");
  }
  // Resolve this uid to a username (primary uid, else authorized on the account). Best-effort:
  // an anonymous buyer has none — we still store the uid so a later account-link can backfill.
  let username = null;
  try {
    let snap = await db().collection("usernames").where("uid", "==", uid).limit(1).get();
    if (snap.empty) {
      snap = await db().collection("usernames").where(`authorizedUids.${uid}`, "==", true).limit(1).get();
    }
    if (!snap.empty) username = snap.docs[0].id;
  } catch (_) {/* index/permission hiccup — store uid-only, resolvable later */}
  await db().collection("subscription_tokens").doc(token).set(
    { uid, username, createdAtMs: Date.now() },
    { merge: true }
  );
  return { ok: true, linked: !!username };
});

const BUNDLE_ID = "com.obubba.app";
const APP_APPLE_ID = 6760968757;

// SAFETY GATE for the first deploy: verify + RECORD the subscription ledger always, but
// only WRITE Premium (premium_entitlements) when explicitly enabled. So this can go live +
// receive real notifications without any risk of mis-granting from untested parsing — you
// sandbox-test, confirm the recorded `subscriptions/*` + "would grant" logs look right, THEN
// set the env var SUB_GRANTS_ENABLED=true and redeploy to turn grants on. Ledger-only first.
const GRANT_ENABLED = String(process.env.SUB_GRANTS_ENABLED || "").toLowerCase() === "true";

// Apple's active-subscription statuses (App Store Server API `status`): 1 active, 3 grace,
// 4 billing-retry(still-entitled) → keep Premium; 2 expired, 5 revoked → drop it.
const ENTITLED_STATUSES = new Set([1, 3, 4]);
// notificationTypes that END entitlement immediately regardless of expiresDate.
const REVOKING_TYPES = new Set(["REFUND", "REVOKE", "CONSUMPTION_REQUEST"]);

let _verifiers = null;
function verifiers() {
  if (_verifiers) return _verifiers;
  // Lazy so a missing dep/cert doesn't break the whole functions deploy analyzer.
  const { SignedDataVerifier, Environment } = require("@apple/app-store-server-library");
  const rootDir = path.join(__dirname, "apple_root_certs");
  const roots = fs
    .readdirSync(rootDir)
    .filter((f) => f.endsWith(".cer") || f.endsWith(".der"))
    .map((f) => fs.readFileSync(path.join(rootDir, f)));
  if (!roots.length) throw new Error("No Apple root certs in apple_root_certs/");
  const mk = (env) => new SignedDataVerifier(roots, /*enableOnlineChecks*/ true, env, BUNDLE_ID, APP_APPLE_ID);
  _verifiers = { prod: mk(Environment.PRODUCTION), sandbox: mk(Environment.SANDBOX) };
  return _verifiers;
}

// Verify + decode against production first, then sandbox (TestFlight / App Review send
// sandbox notifications). Whichever verifier accepts the signature is the real environment.
async function verifyNotification(signedPayload) {
  const v = verifiers();
  try {
    return { payload: await v.prod.verifyAndDecodeNotification(signedPayload), verifier: v.prod, env: "Production" };
  } catch (_) {
    return { payload: await v.sandbox.verifyAndDecodeNotification(signedPayload), verifier: v.sandbox, env: "Sandbox" };
  }
}

exports.appStoreServerNotificationsV2 = onRequest(
  { region: "us-central1", cors: false, memory: "256MiB", timeoutSeconds: 30 },
  async (req, res) => {
    // Apple only POSTs. Anything else = healthcheck / probe.
    if (req.method !== "POST") return res.status(405).send("POST only");
    const signedPayload = req.body && req.body.signedPayload;
    if (!signedPayload || typeof signedPayload !== "string") {
      return res.status(400).send("missing signedPayload");
    }

    let decoded, verifier, env;
    try {
      const r = await verifyNotification(signedPayload);
      decoded = r.payload; verifier = r.verifier; env = r.env;
    } catch (err) {
      // Signature did NOT verify against Apple's chain → reject. This is the security
      // boundary: never write entitlement from an unverified payload.
      console.error("ASSN verify failed:", err && err.message);
      return res.status(400).send("bad signature");
    }

    try {
      const notificationType = decoded.notificationType;
      const subtype = decoded.subtype || null;
      const data = decoded.data || {};
      // Decode the inner signed transaction (verified by the same trusted verifier).
      const txn = data.signedTransactionInfo
        ? await verifier.verifyAndDecodeTransaction(data.signedTransactionInfo)
        : null;
      const renewal = data.signedRenewalInfo
        ? await verifier.verifyAndDecodeRenewalInfo(data.signedRenewalInfo).catch(() => null)
        : null;

      if (!txn || !txn.originalTransactionId) {
        // Nothing to key on (e.g. a TEST notification) — ack so Apple stops retrying.
        console.log("ASSN", notificationType, subtype, "(no transaction)");
        return res.status(200).send("ok");
      }

      const originalTransactionId = String(txn.originalTransactionId);
      const appAccountToken = txn.appAccountToken ? String(txn.appAccountToken) : null;
      const expiresMs = typeof txn.expiresDate === "number" ? txn.expiresDate : null;
      const nowMs = Date.now();

      // status (1/2/3/4/5) comes on the notification data for subscription events.
      const status = typeof data.status === "number" ? data.status : null;
      const active =
        !REVOKING_TYPES.has(notificationType) &&
        ((status != null && ENTITLED_STATUSES.has(status)) ||
          (status == null && expiresMs != null && expiresMs > nowMs));

      const sub = {
        originalTransactionId,
        productId: txn.productId || null,
        appAccountToken,
        type: txn.type || null, // Auto-Renewable Subscription / Non-Consumable
        environment: env,
        status,
        notificationType,
        subtype,
        expiresMs,
        autoRenew: renewal ? renewal.autoRenewStatus === 1 : null,
        active,
        lastTransactionId: txn.transactionId ? String(txn.transactionId) : null,
        updatedAtMs: nowMs,
      };

      // Idempotent upsert — the ledger of truth for who paid, keyed by the stable
      // originalTransactionId (survives renewals).
      await db().collection("subscriptions").doc(originalTransactionId).set(sub, { merge: true });

      // Resolve the account via the token the client wrote at purchase, then reflect the
      // entitlement into the server→client Premium channel (premium_entitlements/{username}).
      if (appAccountToken) {
        const map = await db().collection("subscription_tokens").doc(appAccountToken).get();
        const username = map.exists ? (map.get("username") || null) : null;
        if (username && !GRANT_ENABLED) {
          console.log("ASSN would", active ? "GRANT" : "revoke", "premium for", username, "(grants gated off)");
        } else if (username) {
          if (active) {
            await db().collection("premium_entitlements").doc(username).set(
              {
                active: true,
                type: "paid", // NOT complimentary — a real store subscription
                source: `appstore:${txn.productId || "sub"}`,
                until: expiresMs || null,
                originalTransactionId,
                grantedAt: nowMs,
              },
              { merge: true }
            );
          } else if (REVOKING_TYPES.has(notificationType) || status === 2 || status === 5) {
            // Expired / revoked / refunded → drop the paid grant (leave any separate comp).
            await db().collection("premium_entitlements").doc(username).set(
              { active: false, revokedAt: nowMs, revokeReason: notificationType },
              { merge: true }
            );
          }
        } else {
          console.log("ASSN no username for token", appAccountToken, "(sub recorded, unattached)");
        }
      }

      console.log("ASSN", notificationType, subtype, "active=", active, "txn=", originalTransactionId);
      return res.status(200).send("ok"); // 200 so Apple doesn't retry a handled event
    } catch (err) {
      // Verified but processing failed → 500 so Apple RETRIES (don't lose the event).
      console.error("ASSN processing error:", err && err.stack);
      return res.status(500).send("processing error");
    }
  }
);
