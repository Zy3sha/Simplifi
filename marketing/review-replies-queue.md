# OBubba Review Replies Queue (drafts for owner approval - NOT auto-posted)

> ⚙️ Detection method (important): to tell if a review is already answered, call
> `GET /v1/customerReviews/{id}/response` per review (RESPONDED when `data` is present,
> state PUBLISHED). Do NOT rely on the list-level `include=response` relationship - it
> returned empty for reviews that were in fact answered. Only draft replies for reviews
> that are BOTH genuinely new AND have no published response.

## 2026-09-20 (corrected)

**Result: 0 reviews need a reply.** All 20 recent iOS reviews already have a published
developer response (verified via the per-review /response endpoint). Google Play returned
0 commented reviews in the 7-day window. So there is nothing to post.

(My first pass here wrongly drafted replies for already-answered reviews because it trusted
the unreliable list-level relationship. Those drafts were removed. Fixed above.)

### Still worth acting on (product signal, not a reply task)
The reviews are strongly positive (15 of 20 are 5★, repeatedly praising nap-prediction
accuracy after a few days of logging). The one recurring drag on stars is a **freeze /
glitch** theme, mentioned across star bands (e.g. "buggy and glitchy", "app freezes and
stays frozen", "glitches every day and stopped working mid-nap", plus a breastfeeding-timer
that doesn't persist in the background). This is the biggest ratings risk and points to a
focused stability/freeze pass being higher ROI than new features. Ties to the known,
un-root-caused freeze issue.

**One-line:** 20 iOS reviews checked, 0 Play; 0 need a reply (all already answered); 1 real
signal - the recurring freeze bug is the main thing pulling stars down.

## 2026-09-21 (Review Watch)

**Result: 0 new reviews, 0 need a reply, nothing urgent.**
- **App Store:** 30 most-recent fetched via ASC API (per-review response relationship checked).
  ALL answered; newest review is still **2026-08-31** (Kraeofsun, 5★, "Incredible app." — already
  answered). No new reviews since the last run, no unanswered, no 1-2★/crash/billing/safety.
- **Google Play:** 0 text reviews in the API's ~7-day window. Nothing to reply to.
- **No score-drop signal, no crash/payment/safety reports** in the new window.

**Sentiment (unchanged from last run, no new data):** strongly positive; the only recurring
drag remains the **freeze/glitch** theme + a couple of older 2★ paywall gripes (Valala283
"features hidden behind paywall", Naaads "dislike new update" — both June/July, already answered).
Stability > new features stays the highest-ROI ratings lever.

**One-line:** 0 new reviews across both stores (iOS newest 2026-08-31, Play 7-day window empty);
0 need a reply; nothing urgent.

## 2026-09-22 (Review Watch)

**Result: 0 new reviews, 0 need a reply, nothing urgent.**
- **App Store:** 50 most-recent fetched via ASC API (per-review `response` relationship
  checked). ALL answered; newest review is still **2026-08-31** (Kraeofsun, 5★,
  "Incredible app." — already answered). No new reviews since the last run (2026-09-21),
  none unanswered, no new 1-2★ / crash / billing / safety.
- **Google Play:** API returned empty (`{}`) — 0 text reviews in the ~7-day window.
  Nothing to reply to.
- **No score-drop signal, no crash/payment/safety reports** in the new window.

**Sentiment (unchanged, no new data):** strongly positive; 5★ reviews keep praising
nap-prediction accuracy after a few days of logging ("within 3 days my baby is already
starting to sleep better", "predictions actually become really accurate"). Recurring drags,
all from OLDER, already-answered reviews: the **freeze/glitch** theme + the
**breastfeeding-timer-doesn't-persist-in-background** bug (larsenault97, 4★, 2026-07-31) +
the **duplicate-baby-on-partner-add** glitch (same review) + a couple of older 2★ paywall
gripes (Valala283 "features hidden behind paywall"). Stability/timer-persistence > new
features remains the highest-ROI ratings lever.

**One-line:** 0 new reviews across both stores (iOS newest 2026-08-31, Play 7-day window
empty); 0 need a reply; nothing urgent.
