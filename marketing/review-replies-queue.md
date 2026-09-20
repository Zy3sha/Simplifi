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
