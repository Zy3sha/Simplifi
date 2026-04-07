# OBubba Product Roadmap — Making Sleep & Carer Portal World-Class

> Last updated: 2026-04-06
> Focus: The two killer features — Sleep Intelligence & Carer Portal
> Philosophy: Move from "records what happened" to "tells you what to do next"

---

## PART 1: SLEEP — FROM GOOD TO UNBEATABLE

### A. Fix the Empty First Week (Critical)

The best sleep features need 3-7 days of data. New parents get the least help when they need it most.

- [ ] **Day 1-3 guided onboarding flow** — Instead of blank insights, show age-specific "what's normal right now" content (e.g. "At 8 weeks, 45-min naps are completely normal. Here's why...")
- [ ] **Progressive unlock messaging** — "Log 2 more days to unlock your baby's personal rhythm" with a visual progress ring
- [ ] **Instant value from first log** — After the very first nap log, immediately show the wake window countdown. Don't wait for history.
- [ ] **"Quick start" data import** — Let parents enter yesterday's rough schedule ("about 3 naps, bed around 7pm") to seed predictions faster
- [ ] **Age-appropriate day 1 cheat sheet** — "Most 4-month-olds need 3-4 naps, wake windows around 1h45-2h15. Here's a sample day." Gives value before any logging.

### B. Smarter Predictions

Currently predictions blend age tables with personal data after 7 days. Make predictions genuinely learn.

- [ ] **Confidence indicator on predictions** — Show "based on 3 days of data (building...)" vs "based on 14 days (high confidence)" so parents understand why predictions improve
- [ ] **Nap quality weighting** — Not all naps are equal. A 30-min car nap doesn't reset the sleep pressure like a 90-min cot nap. Let parents tag location/type and weight predictions accordingly
- [ ] **Multi-day pattern recognition** — Detect alternating day patterns (e.g. "Ella often has a short nap day followed by a long nap day") and predict accordingly
- [ ] **"Your baby vs guideline" dashboard** — One clear visual: "Your baby's wake windows are 15 mins shorter than average for their age. This is normal — we've adjusted predictions."
- [ ] **Illness/teething mode** — Parent taps "not a normal day" and predictions temporarily adjust (shorter wake windows, extra nap expected). Reverts automatically after 2-3 days.
- [ ] **Nap transition detection** — Proactively flag "Ella's been fighting her 3rd nap for 5 days. She may be ready for 2 naps. Here's how to transition." Don't wait for the parent to figure it out.

### C. Night Sleep Intelligence

Tonight's Guidance is already good. Make it exceptional.

- [ ] **Night wake prediction with context** — "Based on this week, expect 2 wakes tonight. Last feed was small (120ml vs usual 180ml), so the first wake may come earlier."
- [ ] **Morning wake prediction** — "Based on bedtime and total night sleep, Ella will likely wake between 6:15-6:45am"
- [ ] **Dream feed optimizer** — If parent does dream feeds, track correlation: "Dream feed at 10:30pm → first wake at 3am avg. Dream feed at 11pm → first wake at 4:15am avg. Consider shifting later."
- [ ] **Night wake classification** — Help parents understand WHY baby woke: hunger (fed and settled), comfort (settled without feed), habitual (same time every night ±15min), environmental (one-off)
- [ ] **Split night detection + fix** — Already detected, but add actionable guidance: "Ella's had 3 split nights this week. This usually means too much day sleep. Try capping naps to Xh total tomorrow."
- [ ] **False start prevention** — "Ella's had false starts (waking 30-45min after bedtime) 4 of last 7 nights. Common cause: overtiredness. Try bedtime 15min earlier tomorrow."

### D. Proactive "What's Coming" System

Shift from reactive analysis to forward-looking guidance.

- [ ] **Regression forecaster** — "Ella is 15 weeks. The 4-month regression typically hits between 15-17 weeks. Here's what to expect and 3 things you can do NOW to prepare."
- [ ] **Nap transition timeline** — "Most babies drop to 2 naps between 6-8 months. Ella is 5.5 months. In the next few weeks, watch for: refusing 3rd nap, taking longer to settle, short last nap."
- [ ] **Developmental leap alerts** — "Wonder Week 19 (fussy period) often starts around now. Sleep may be disrupted for 1-2 weeks. This is temporary."
- [ ] **Clock change preparation** — "Clocks go forward in 5 days. Start shifting bedtime 10 minutes earlier each night from tomorrow to ease the transition."
- [ ] **Seasonal daylight alerts** — "Sunrise is now before 6am. If early waking becomes an issue, consider blackout blinds."

### E. Sleep Insights That Actually Help

Current insights are analytical. Make them actionable.

- [ ] **One thing to try today** — Distill all analysis into a single, specific action: "Try putting Ella down 10 minutes earlier for her first nap today." Not a wall of text.
- [ ] **Weekly progress report with direction** — "This week vs last: night wakes down from 3.2 to 2.4 avg. Nap total up 20min. You're heading in the right direction. Keep doing what you're doing."
- [ ] **Pattern-specific micro-guides** — When catnapping is detected, don't just label it. Show a 3-step "what to try" specific to the baby's age and data.
- [ ] **"Is this normal?" quick answers** — Surface the most common anxiety questions based on what's logged: "45-min naps at 4 months? Completely normal. Here's why, and when they'll likely lengthen."
- [ ] **Comparative context (anonymous)** — "Ella's total sleep (14.2h) is in the 65th percentile for her age." Parents crave context. Use AASM ranges you already have.

### F. Sleep Environment & Routine Support

- [ ] **Bedtime routine timer** — "Start bath now to hit your 7:15pm target bedtime" with step-by-step checklist (bath → massage → feed → book → bed)
- [ ] **Sound machine integration** — Already have white noise. Add auto-start when nap timer begins, auto-fade when nap ends.
- [ ] **Room temperature logging** — Quick log with guidance: "18°C is ideal. 22°C logged — consider lighter sleeping bag tonight."

---

## PART 2: CARER PORTAL — FROM BASIC TO INDISPENSABLE

### A. Live Carer Dashboard (The Big One)

Currently carers get a static PDF. This needs to become a live, real-time tool.

- [ ] **Live "today so far" view for carers** — Shows today's entries in real time: last feed (time + amount), last nap (time + duration), last nappy, total feeds today
- [ ] **Next action guidance** — "Wake window closes in ~25 minutes. Start watching for tired cues." Uses the same prediction engine parents see.
- [ ] **Baby's current status** — Clear indicator: "Awake since 2:15pm (1h 20m)" or "Napping since 1:45pm (35 min so far)"
- [ ] **Today's schedule preview** — "Expected nap: ~2:30pm. Expected bedtime: ~6:45pm. Remaining feeds: ~2" based on predictions
- [ ] **Carer can see baby's preferences** — Comfort items, settling techniques that work, feed preferences, allergy warnings — all live-updated by parent, not a stale PDF

### B. Smarter Carer Logging

- [ ] **Auto-merge carer entries** — Accept by default with a "review" badge. Parent can edit/reject after, but data flows in immediately. Current manual approval is too much friction.
- [ ] **Carer notes with context** — Carer can add notes ("settled easily", "fought nap", "seemed hungry early") that feed into the parent's insights
- [ ] **Photo sharing from carer** — Carer snaps a photo during the day, it appears in parent's memory book with carer attribution
- [ ] **Quick-log presets for carers** — Big buttons: "Fed bottle", "Nap started", "Nap ended", "Nappy change". Minimal UI, minimal training needed.
- [ ] **Offline carer logging** — Carer logs offline, syncs when back online. Essential for nurseries/homes with poor wifi.

### C. Handover System

- [ ] **Morning handover from parent to carer** — Auto-generated: "Ella woke at 6:30am, had 180ml at 6:45am. Last nap target: ~9:15am. Allergies: dairy. Comfort: muslin rabbit. Notes from mum: teething, might be fussy."
- [ ] **Evening handover from carer to parent** — Auto-generated summary: "Today with [carer name]: 2 naps (45min + 1h10), 3 bottles (150ml, 180ml, 150ml), 2 nappy changes. Notes: great day, loved tummy time."
- [ ] **Handover push notification** — Parent gets a single notification when carer submits end-of-day summary, not individual pings per entry
- [ ] **Seamless day continuity** — Carer's entries feed directly into predictions. If carer logs a short nap, the app adjusts the next wake window for whoever is with baby next.

### D. Multi-Carer Support

- [ ] **Named carer profiles** — "Grandma", "Nursery", "Dad" — each with their own access code and permissions
- [ ] **Per-carer permissions** — Grandma can log feeds and naps. Nursery can log everything. Babysitter gets read-only schedule view.
- [ ] **Carer activity log** — Parent sees who logged what and when: "Grandma logged bottle 150ml at 2:15pm"
- [ ] **Care time tracking** — "Ella was with Nursery from 8am-5pm (9 hours). With Mum from 5pm-8am." Useful for separated parents too.

### E. Communication

- [ ] **Quick parent-to-carer messages** — "She didn't sleep well last night, might need an early nap" — appears as a banner on carer's dashboard
- [ ] **Carer-to-parent alerts** — "Temperature 38.1°C logged" triggers immediate push notification to parent, not just a regular entry
- [ ] **End-of-day rating** — Carer taps: great day / ok day / tough day. Simple signal for parents.

### F. Nursery-Ready Features (Future — Stepping Stone to B2B)

- [ ] **Multi-child carer view** — Carer sees 2-3 children they're responsible for (childminder scenario)
- [ ] **Daily report PDF** — Auto-generated end-of-day report for each child, branded, shareable
- [ ] **QR check-in/check-out** — Carer scans QR to start/end their care session. Clean time tracking.

---

## PART 3: CROSS-CUTTING IMPROVEMENTS (Supporting Both Killers)

### A. Weaning (Make It Guide, Not Just Log)

- [ ] **Allergen introduction tracker** — "4 of 14 allergens introduced. Next suggested: egg. It's been 18 days since last new allergen."
- [ ] **Reaction memory** — "Last time Ella had egg (12 Mar): mild rash noted." Surfaces automatically when that food/allergen appears again.
- [ ] **"What to try next" suggestions** — Based on what's already been logged, age, and what's missing. Not generic lists.
- [ ] **Weaning progress dashboard** — Visual checklist of allergens, food groups tried, and gaps

### B. Parent Wellbeing (Connect to Data)

- [ ] **Sleep-aware wellbeing nudges** — "You've had 4+ night wakes per night for 6 nights. That's exhausting. Remember: you're doing an amazing job. Here's support if you need it."
- [ ] **Wellbeing trend line** — Show parent's self-reported mood alongside baby's sleep quality. Seeing correlation validates their feelings.
- [ ] **Partner check-in** — "Dad hasn't logged in 3 days. Sharing the load? Here's how to get them involved."

### C. First Week Experience

- [ ] **Progressive feature reveal** — Don't show empty insights/patterns tabs. Unlock them with celebration: "You've logged 5 days! Your personal insights are ready."
- [ ] **Setup wizard** — Baby name, DOB, feeding method (breast/bottle/combo), sleep situation (co-sleeping/cot/next-to-me). Tailors all content immediately.
- [ ] **"Why log?" motivation** — Show parents WHAT they'll unlock at each milestone: 3 days (basic patterns), 7 days (personal rhythm), 14 days (full insights)

---

## IMPLEMENTATION PRIORITY

### Phase 1: Quick Wins (1-2 weeks each)
1. Confidence indicators on predictions
2. Auto-merge carer entries
3. Morning/evening handover summaries
4. "One thing to try today" insight
5. Illness/teething mode toggle

### Phase 2: Core Upgrades (2-4 weeks each)
6. Live carer dashboard (today's entries + next action)
7. First-week guided experience
8. Regression/transition forecaster
9. Night wake classification
10. Allergen introduction tracker

### Phase 3: Differentiators (4-6 weeks each)
11. Nap transition detection + guidance
12. Multi-carer profiles + permissions
13. Parent-carer messaging
14. Dream feed optimizer
15. Weaning guidance engine

### Phase 4: Nursery Stepping Stones
16. Multi-child carer view
17. Daily report PDF generation
18. Care time tracking
19. QR check-in/check-out

---

## DESIGN PRINCIPLES

1. **One action, not ten options** — Every insight should end with ONE specific thing to try
2. **Earn trust before selling** — Free tier should be genuinely helpful, not a teaser
3. **Data builds value** — Every day of logging should make the app noticeably smarter
4. **Carers are users too** — The carer experience should be so good that carers recommend OBubba to other parents
5. **Anxiety-aware** — Never show alarming data without context. Always normalise first, then guide.
6. **Works offline** — Core logging and predictions must work without internet. Sync when available.

---

*This document is the source of truth for OBubba product direction. Update as features ship.*
