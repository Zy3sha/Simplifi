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

## 2026-09-23 (Review Watch)

**Result: 1 new review (Google Play, 5★, positive), 0 urgent.**
- **App Store:** 50 most-recent fetched via ASC API; ALL answered; newest review still **2026-08-31** (Kraeofsun). No new iOS reviews, no 1-2★/crash/billing/safety.
- **Google Play:** **1 NEW review** in the window (see draft below). No crash/payment/safety flags.
- No score-drop signal.

### NEW — Google Play (needs owner approval to post)

**Christiana Danso Seguh — ★★★★★ — 2026-09-22 — app v3.2.23 (en, TECNO device)**
> "very useful and helpful A good app especially for first time Moms"

DRAFT reply (Luna/OBubba voice):
> Thank you so much, Christiana. 💛 Being genuinely useful to first-time mums is exactly what we hoped for, so this means the world. If there's ever anything that would make those early days easier, just tell us in the app. Wishing you and your little one calm days and good sleep. — Team OBubba

**Sentiment (unchanged):** strongly positive. This is the first Android text review to land in the API window in a while and it echoes the iOS theme (first-time-parent reassurance + everyday usefulness). No new negative signal. Recurring drags remain older, already-answered iOS reviews (freeze/glitch, breastfeeding-timer background persistence).

**One-line:** 1 new review (Play, 5★ positive); 1 warm reply drafted for owner approval; nothing urgent.

## 2026-09-24 (Review Watch)

**Result: 0 NEW reviews since last run, 0 urgent.**
- **App Store:** 50 most-recent via ASC API; ALL answered; newest still **2026-08-31** (Kraeofsun). No new iOS reviews, no 1-2★/crash/billing/safety.
- **Google Play:** API window shows only the same **1** review from **2026-09-22** (Christiana Danso Seguh, 5★) that was logged + drafted a reply for on 2026-09-23. Still `replied: false` (owner has not posted the drafted reply yet). NOT a new review; the warm draft from 2026-09-23 still stands and awaits owner approval.
- No score-drop, no crash/payment/safety signal.

**Sentiment (unchanged):** strongly positive; recurring drags remain OLD, already-answered iOS reviews (freeze/glitch, breastfeeding-timer background persistence).

**One-line:** 0 new reviews; 0 need a new reply (the 2026-09-22 Play 5★ reply is still queued for owner to post); nothing urgent.

## 2026-09-25 (Review Watch)

### ⚠️ HIGH PRIORITY — 1 new 2★ (iOS), already answered by owner, but surfaces 2 real product issues
**"Contradicting, anxiety inducing" — ★★ — Someone else upset — 2026-09-22 (USA)** — status: **already answered** (owner posted a warm, specific reply; no new draft needed). Flagging because the content is product-actionable and touches OBubba's core "never anxiety-inducing" principle:
1. **Contradictory maternal-sleep safety messaging (PRODUCT):** app told her a 3-week-old waking 4×/night was "perfectly normal… doing a good job", then on day 5 fired a **red-alert** that the mother hadn't recorded a 4-hour sleep stretch and was "in danger / needed immediate help." Reads as alarming + contradictory at ~3 weeks postpartum. → Owner/dev backlog: soften + de-conflict the maternal-sleep red-flag copy so it reads as *gentle support-seeking*, never "you're in danger." (Relates to the "maternal physical red-flag engine → UI" work.)
2. **Schedule-maker told her to reschedule a DOCTOR'S appointment (BUG/DESIGN):** she logged a 1:40pm appointment, app auto-adjusted, then at 1pm suggested she **move the appointment** to fit the nap. The schedule must always adapt around real-life fixed events, never suggest moving them. → Owner/dev backlog: fixed calendar events are immovable anchors; guidance flows around them.
- Not a live outage or payment/crash issue, and the owner has already engaged (reply posted), so no push sent. But both items belong on the product backlog.

### NEW — Google Play (needs owner approval to post)
**Briana Pearson (DauntlessDame42) — ★★★★★ — 2026-09-24 — app v3.2.27 (found via TikTok)**
> "I had been looking for an app like this for a while, and finally found it via tiktok. this app is useful for new parents and parents who are having trouble keeping track of things among all of the sleepless nights…"

DRAFT reply (Luna/OBubba voice):
> Thank you so much, Briana. 💛 It means the world that you looked for something like this and that OBubba turned out to be it, and we're so glad TikTok brought you here. Keeping track through the sleepless nights is exactly what we built it for. If there's ever anything that would make it more useful for you, just tell us in the app. Wishing you and your little one calmer nights. — Team OBubba

*(Note: Briana is on v3.2.27 — confirms 3.2.27 is now live in users' hands on Android.)*

### Still queued from 2026-09-23
- **Christiana Danso Seguh — ★★★★★ — 2026-09-22 (Play)** — warm reply drafted 09-23, still `replied: false`, awaiting owner to post.

**Sentiment:** overwhelmingly positive (Play 5★s citing TikTok discovery + "finally found it"), but the first negative in a while is a thoughtful, specific 2★ that is genuinely product-actionable (anxiety-inducing safety copy + the appointment-reschedule suggestion). Highest-ROI response is fixing those two product behaviours, not a reply (already handled).

**One-line:** 2 new reviews (iOS 2★ already answered + Play 5★ Briana); **1 needs a reply** (Briana draft, + Christiana still queued); **1 HIGH-priority product flag** (contradictory maternal-sleep alert + appointment-reschedule suggestion) for the owner/dev backlog; no live/urgent outage.
