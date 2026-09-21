// OBubba — retroactive purchase→account reconciliation.
//
// WHY THIS EXISTS. A paid purchase only becomes server-side Premium if three things
// line up: the store hands us an account token, `subscription_tokens/{token}` maps that
// token to a username, and the store's server notification runs AFTER that mapping
// exists. In production they frequently did not:
//
//   - `linkPurchaseToken` is called fire-and-forget from the paywall (`.ignore()`), so a
//     cold function, a slow network or auth not yet ready silently loses the mapping.
//   - For an anonymous buyer it stores `username: null` on purpose, with a comment
//     saying "a later account-link can backfill" — but nothing ever did that backfill.
//     The user creates an account a minute later and the mapping stays null forever.
//   - A notification that arrives before the mapping logs "unattached" and never retries.
//
// Measured 21 Sep 2026: of 36 live Google Play subscriptions only 2 held an active
// Premium grant. 13 were rescued by a one-off backfill; the rest were unreachable
// because of the gaps above. This closes them permanently, server-side, so it works for
// app versions already in the wild.
//
// Both triggers converge on the same idea: whenever we learn which account a token
// belongs to, go and grant anything that token already paid for.

const { onDocumentWritten, onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");

const db = () => getFirestore();

// Same gate as every other write to premium_entitlements in this codebase, so enabling
// server grants stays one deliberate decision.
const GRANT_ENABLED = String(process.env.SUB_GRANTS_ENABLED || "").toLowerCase() === "true";

// Apple: status 1 active, 3 billing retry, 4 grace. Play: the entitled state strings.
const APPLE_ENTITLED = new Set([1, 3, 4]);
const PLAY_ENTITLED = new Set([
  "SUBSCRIPTION_STATE_ACTIVE",
  "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
]);

function isLive(sub, nowMs) {
  if (sub.active !== true) return false;
  // An `active` flag with a past expiry is stale — never grant from it.
  if (typeof sub.expiresMs === "number" && sub.expiresMs <= nowMs) return false;
  if (sub.store === "google_play") {
    return sub.subscriptionState ? PLAY_ENTITLED.has(sub.subscriptionState) : false;
  }
  return sub.status == null ? true : APPLE_ENTITLED.has(sub.status);
}

/**
 * Grant Premium for every live subscription carrying [token], to [username].
 * Returns the number of grants written.
 */
async function grantForToken(token, username, reason) {
  if (!token || !username) return 0;
  const snap = await db()
    .collection("subscriptions")
    .where("appAccountToken", "==", token)
    .get();
  if (snap.empty) return 0;

  const nowMs = Date.now();
  let granted = 0;
  for (const doc of snap.docs) {
    const sub = doc.data() || {};
    if (!isLive(sub, nowMs)) continue;
    if (!GRANT_ENABLED) {
      console.log("reconcile: would GRANT", username, "from", doc.id, "(grants gated off)");
      continue;
    }
    // Never downgrade a complimentary grant into a paid one, and never re-stamp a grant
    // that is already active and paid — this trigger can fire repeatedly.
    const entRef = db().collection("premium_entitlements").doc(username);
    const cur = await entRef.get();
    if (cur.exists && cur.get("active") === true && cur.get("type") === "paid") continue;

    const storeLabel = sub.store === "google_play" ? "googleplay" : "appstore";
    await entRef.set(
      {
        active: true,
        type: "paid",
        source: `${storeLabel}:${sub.productId || "sub"}`,
        until: typeof sub.expiresMs === "number" ? sub.expiresMs : null,
        grantedAt: nowMs,
        reconciledFrom: doc.id,
        reconcileReason: reason,
      },
      { merge: true }
    );
    granted++;
    console.log("reconcile: GRANTED", username, "from", doc.id, "(", reason, ")");
  }
  return granted;
}

/**
 * A token→account mapping was written or changed. If it now names a username, grant
 * anything that token already bought. This is the fix for the ordering race: the store
 * notification may have arrived minutes or weeks before the mapping existed.
 */
exports.reconcileOnTokenLink = onDocumentWritten(
  "subscription_tokens/{token}",
  async (event) => {
    const after = event.data && event.data.after;
    if (!after || !after.exists) return;
    const username = after.get("username");
    if (!username) return;
    // Only act when the username is NEW — otherwise every unrelated write re-runs this.
    const before = event.data.before;
    if (before && before.exists && before.get("username") === username) return;
    const n = await grantForToken(event.params.token, username, "token_link");
    if (n) console.log("reconcile: token link granted", n, "for", username);
  }
);

/**
 * An account was created. Any purchase token this uid bought under while anonymous is
 * sitting in `subscription_tokens` with `username: null` — claim it. Writing the
 * username there fires [reconcileOnTokenLink] above, which does the granting.
 */
exports.reconcileOnAccountCreated = onDocumentCreated(
  "usernames/{username}",
  async (event) => {
    const username = event.params.username;
    const uid = event.data && event.data.get("uid");
    if (!uid) return;
    const snap = await db()
      .collection("subscription_tokens")
      .where("uid", "==", uid)
      .get();
    if (snap.empty) return;
    let claimed = 0;
    for (const doc of snap.docs) {
      if (doc.get("username")) continue; // already attributed — never steal it
      await doc.ref.set({ username, claimedAtMs: Date.now() }, { merge: true });
      claimed++;
    }
    if (claimed) {
      console.log("reconcile: account", username, "claimed", claimed, "orphan purchase token(s)");
    }
  }
);
