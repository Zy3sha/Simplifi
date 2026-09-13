/**
 * OpenAI Ads Conversions API relay.
 *
 * MIRRORED FILE. An identical copy lives in the other functions codebase:
 *   functions/openaiConversions.js   (codebase "default")
 *   functions-subs/openaiConversions.js (codebase "subs")
 * Firebase deploys each codebase from its own directory, so it cannot be shared
 * by relative import. Edit one, copy to the other. It has no dependencies.
 *
 * Server-side counterpart to the browser pixel that ships in the site <head>.
 * Docs: https://developers.openai.com/ads/conversions-api
 *
 * Design rules, because these events ride along inside the purchase webhook:
 *  - This module NEVER throws. A conversion report must not be able to fail a
 *    subscription grant. Everything is caught and returned as a result object.
 *  - It NEVER hangs. Hard 4s abort, so a slow OpenAI cannot hold a webhook open.
 *  - It no-ops cleanly when OPENAI_CONVERSIONS_API_KEY is unset, so this can be
 *    deployed before the key exists and simply starts working once it is set.
 *  - Event ids are deterministic, so Apple/Play webhook retries deduplicate
 *    instead of double-counting. OpenAI dedupes on (pixel id, event type, id).
 */

const ENDPOINT = "https://bzr.openai.com/v1/events";
const PIXEL_ID = process.env.OPENAI_PIXEL_ID || "RKX5Fn2RCayB9tU3QFxiF9";
const API_KEY = process.env.OPENAI_CONVERSIONS_API_KEY || "";

const MAX_BATCH = 1000;          // API limit; one bad event fails the whole batch
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;  // "within the last 7 days"
const MAX_FUTURE_MS = 10 * 60 * 1000;        // "no more than 10 minutes in the future"
const TIMEOUT_MS = 4000;

/** Drop events the API would reject on timestamp, rather than losing the batch. */
function withinWindow(timestampMs, now) {
  const age = now - timestampMs;
  return age <= MAX_AGE_MS && age >= -MAX_FUTURE_MS;
}

/**
 * POST a batch of already-built events.
 * @returns {Promise<{ok:boolean, skipped?:string, status?:number, sent?:number, dropped?:number, error?:string}>}
 */
async function sendOpenAiConversion(events, { validateOnly = false } = {}) {
  const list = (Array.isArray(events) ? events : [events]).filter(Boolean);
  if (!list.length) return { ok: true, skipped: "no_events" };
  if (!API_KEY) {
    console.log("[openai-conv] no OPENAI_CONVERSIONS_API_KEY set, skipping", {
      would_send: list.length,
      types: list.map((e) => e.type),
    });
    return { ok: true, skipped: "no_api_key" };
  }

  const now = Date.now();
  const fresh = list.filter((e) => withinWindow(e.timestamp_ms, now));
  const dropped = list.length - fresh.length;
  if (dropped) {
    console.warn("[openai-conv] dropped out-of-window events", {
      dropped,
      types: list.filter((e) => !withinWindow(e.timestamp_ms, now)).map((e) => e.type),
    });
  }
  if (!fresh.length) return { ok: true, skipped: "all_out_of_window", dropped };

  const batch = fresh.slice(0, MAX_BATCH);
  try {
    const res = await fetch(`${ENDPOINT}?pid=${encodeURIComponent(PIXEL_ID)}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        validate_only: validateOnly,
        integration_source: "obubba-functions",
        events: batch,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[openai-conv] rejected", {
        status: res.status,
        body: body.slice(0, 500),
        types: batch.map((e) => e.type),
      });
      return { ok: false, status: res.status, error: body.slice(0, 500) };
    }
    console.log("[openai-conv] sent", { sent: batch.length, dropped, validateOnly });
    return { ok: true, status: res.status, sent: batch.length, dropped };
  } catch (err) {
    // Swallowed on purpose. Never let ad reporting break the caller.
    console.error("[openai-conv] send failed", { error: String(err && err.message || err) });
    return { ok: false, error: String(err && err.message || err) };
  }
}

/* ---------------------------------------------------------------------------
 * Event builders.
 *
 * `amount` is an integer in MINOR units (pence, cents) with `currency` required
 * alongside it. The docs specify integer + conditional currency but do not state
 * the unit; minor units is the near-universal convention for this field. If the
 * Ads Manager dashboard shows values 100x too large, that assumption is wrong
 * and this is the single place to change it.
 * ------------------------------------------------------------------------- */

/** A new OBubba account was created. The earliest activation the backend can see. */
function registrationCompleted({ uid, timestampMs = Date.now() }) {
  return {
    id: `reg_${uid}`,
    type: "registration_completed",
    timestamp_ms: timestampMs,
    action_source: "mobile_app",
    data: { type: "customer_action" },
  };
}

/** The 14-day in-app trial was claimed. */
function trialStarted({ trialKey, timestampMs = Date.now() }) {
  return {
    id: `trial_${trialKey}`,
    type: "trial_started",
    timestamp_ms: timestampMs,
    action_source: "mobile_app",
    data: { type: "customer_action" },
  };
}

/**
 * A paid subscription began. This is the event that actually matters for ad
 * optimisation, and it is the only one the store tells us about reliably.
 * Keyed on originalTransactionId so Apple's webhook retries collapse to one.
 */
function subscriptionCreated({ originalTransactionId, productId, amountMinor, currency, timestampMs = Date.now() }) {
  const data = { type: "plan_enrollment" };
  if (productId) data.plan_id = productId;
  if (Number.isInteger(amountMinor) && currency) {
    data.amount = amountMinor;
    data.currency = currency;
  }
  return {
    id: `sub_${originalTransactionId}`,
    type: "subscription_created",
    timestamp_ms: timestampMs,
    action_source: "mobile_app",
    data,
  };
}

/**
 * An install. NOTE: the backend never observes this directly. Nothing calls
 * this today. It exists for whichever install source gets wired up later
 * (a GA4 first_open export, or a first-launch ping from the client).
 */
function appInstalled({ installId, timestampMs = Date.now() }) {
  return {
    id: `install_${installId}`,
    type: "app_installed",
    timestamp_ms: timestampMs,
    action_source: "mobile_app",
    data: { type: "customer_action" },
  };
}

module.exports = {
  sendOpenAiConversion,
  registrationCompleted,
  trialStarted,
  subscriptionCreated,
  appInstalled,
  PIXEL_ID,
};
