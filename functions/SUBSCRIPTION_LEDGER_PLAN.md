# Subscription webhook ledger — plan (fixes churn blindness + self-inflicted churn)

**Why:** today entitlement state is 100% client-pushed (`mirrorStoreEntitlement` /
`verifyReceipt`). There are NO store webhooks, so the backend can't see a renewal,
a cancel, a billing-retry, a grace period, or a refund. Consequences measured
2026-09-28: `store_entitlements` had 410 subs, ALL "active", 0 churned, 408/410 with
no expiry; churn is unobservable in our own data, and the 45-day "stale" rule can
downgrade a paying-but-idle user to Free (self-inflicted churn). This plan adds the
authoritative, event-driven source of truth.

## 1. Endpoints (new Cloud Functions, `functions/index.js`)

### a) Apple — App Store Server Notifications V2
- `exports.appStoreNotifyV2 = onRequest(...)` — public HTTPS, URL registered in ASC →
  App Information → App Store Server Notifications (Production + Sandbox URLs).
- Body = `{ signedPayload }` (JWS). **Verify** the JWS: decode header `x5c` cert
  chain, validate chain to Apple's root, verify signature (use Apple's
  `app-store-server-library` for Node, or manual `jose` verify). Reject unverified.
- Decode `notificationType` + `subtype` + `data.signedTransactionInfo` +
  `signedRenewalInfo` (also JWS). Key types for churn:
  - `DID_RENEW` → renewal (with `expiresDate`)
  - `DID_CHANGE_RENEWAL_STATUS` subtype `AUTO_RENEW_DISABLED` → **pending churn**
  - `EXPIRED` (subtypes: `VOLUNTARY`, `BILLING_RETRY`, `PRICE_INCREASE`, `PRODUCT_NOT_FOR_SALE`) → **churn** + reason
  - `DID_FAIL_TO_RENEW` (+ `GRACE_PERIOD`) → at-risk
  - `GRACE_PERIOD_EXPIRED` → churn
  - `REFUND` / `REVOKE` → churn + refund
  - `SUBSCRIBED` / `RESUBSCRIBE` / `OFFER_REDEEMED` → (re)acquisition
- Idempotency: key on `notificationUUID` (write-once to `push_log`-style dedup, or a
  `store_events/{notificationUUID}` doc via `.create()` like `reserveOncePush`).

### b) Google Play — Real-Time Developer Notifications (RTDN)
- Play Console → Monetization setup → set a Pub/Sub topic. Add
  `exports.playRtdn = onMessagePublished("play-rtdn-topic", ...)`.
- Decode base64 `message.data` → `{ subscriptionNotification: { notificationType,
  purchaseToken } }`. Types: `SUBSCRIPTION_RENEWED(2)`, `CANCELED(3)`,
  `ON_HOLD(5)`, `IN_GRACE_PERIOD(6)`, `EXPIRED(13)`, `REVOKED(12)`, `PURCHASED(4)`.
- Resolve the token via Play Developer API
  (`purchases.subscriptionsv2.get`) for the authoritative state + expiry + linked
  `obfuscatedExternalAccountId` (= our username/appAccountToken, see #240).

## 2. The ledger (new collection: `subscription_events`)
Append-only, one doc per verified event:
```
subscription_events/{eventId}     // eventId = notificationUUID / rtdn messageId
  platform: 'ios'|'android'
  type: 'renew'|'cancel'|'expire'|'refund'|'grace'|'billing_retry'|'resubscribe'|'subscribe'
  reason: 'voluntary'|'billing'|'price_increase'|'refund'|...   // from subtype
  productId, originalTransactionId (hashed), username|appAccountToken
  eventAtMs, expiresAtMs, autoRenew: bool
  createdAt (server)
```
Plus a **current-state projection** (`subscription_state/{originalTxnId}`): latest
status, expiry, autoRenew, lastEventType — this becomes the AUTHORITATIVE entitlement
input (replaces the 45-day stale guess). `mirrorStoreEntitlement` keeps working as a
client fast-path but the webhook state wins on conflict.

## 3. What it unlocks (the churn answer, ongoing)
- True churn rate by week/cohort, split voluntary vs involuntary (billing) vs refund.
- Grace/billing-retry funnel (recoverable churn) → dunning nudges.
- Kills the self-inflicted 45-day downgrade: once we get real `expiresDate` on every
  sub via webhooks, drop `STORE_REPORT_STALE_MS` expiry for webhook-backed subs.

## 4. Rules + security
- Endpoints are public but verify signatures server-side (Apple JWS / Play token
  lookup). `subscription_events` + `subscription_state`: **admin-write only**, no
  client write (default deny — do NOT add to any `hasOnly` client allowlist).
- Client may READ its own `subscription_state` (optional) for instant entitlement.

## 5. Rollout
1. Ship endpoints (no behaviour change yet) + register URLs in ASC & Play.
2. Backfill: run Apple `GET /inApps/v1/history` + Play `subscriptionsv2` for known
   originalTxnIds to seed `subscription_state`.
3. Flip entitlement source to webhook-state-first; keep client mirror as fallback.
4. Add dunning (grace/billing-retry) push via the now-idempotent reminder path.

## Effort / risk
~1 focused build in functions + 2 store-console config steps (owner). Billing-
sensitive → owner sign-off before deploy. No app build required for the server half;
optional client change only if we surface `subscription_state` in-app.
