# OBubba V2 — Ideas & Roadmap

*Last updated: April 2026*

---

## 1. Personal Sleep Intelligence Engine

### Vision
Move from "wake window calculator" to "sleep consultant that knows your baby."
After 2 weeks of data, OBubba should know Oliver's unique sleep personality —
not just age-appropriate guidelines.

### Data We Already Collect But Don't Fully Analyse

| Data | What It Tells Us | V2 Use |
|------|-----------------|--------|
| Feed times + amounts | Feed-sleep correlation, cluster feeding patterns | Predict fussy periods, adjust WW |
| Feed-to-sleep gap | Feed-sleep association strength | Sleep hygiene coaching |
| Nap start vs prediction | How accurate were we? | Self-correcting predictions |
| Nap duration by position | Nap 1 vs 2 vs 3 patterns | Per-position duration predictions |
| Night wake times | Habitual wake patterns (always at 2am?) | Predict and prepare parents |
| Night wake duration | How long baby takes to settle | Measure improvement over time |
| Bedtime to first wake | First stretch length (most important metric) | Track sleep maturity |
| Total day vs night sleep | Day/night balance | Auto-adjust nap caps |
| Wake time consistency | Circadian rhythm strength | Predict morning wake |
| Growth data (weight) | Growth spurts correlate with sleep disruption | Warn about regressions |
| Developmental milestones | Phases disrupt sleep predictably | Context for bad nights |

### Personal Sleep Profile (build after 14 days)
The engine should learn and store:
1. Oliver's natural nap 1 duration (e.g. 1h 20m) vs nap 2 (45m) vs nap 3 (20m)
2. His optimal bedtime window (bedtimes that produce best nights)
3. His habitual night wake times (e.g. always 2am and 5am)
4. His ideal total day sleep (the amount that produces best nights)
5. His circadian wake time (drifting earlier or later?)
6. His feed-sleep gap (does feeding close to bed cause more wakes?)
7. His best first stretch (hours before first night wake)
8. His settling time trends (getting faster or slower?)
9. Regression markers (when patterns suddenly change)
10. Growth spurt correlation (feeds up + sleep disrupted = growth spurt)

### Self-Correcting Predictions
- Track: predicted nap time vs actual nap time
- If predictions are consistently 15min early → adjust personal offset
- Weekly accuracy score: "OBubba predicted 85% of naps within 15 minutes"
- Show parents the accuracy improving over time → builds trust

---

## 2. Approach A: On-Device Pattern Engine (V2.0)

All analysis local, no cloud needed, works offline.

### Pattern Detectors to Build
1. **Nap duration by position** — track per-position averages (not global average)
2. **Optimal bedtime finder** — correlate bedtime with night wake count + first stretch
3. **Feed-sleep association score** — % of days where last feed is within 15min of sleep
4. **Day sleep sweet spot** — find the total day nap minutes that produce best nights
5. **Night wake predictor** — based on day's nap quality, bedtime, feeds
6. **Circadian drift detector** — is wake time moving? Alert if drifting >15min/week
7. **Regression detector** — sudden pattern break after weeks of stability
8. **Self-settling score** — what % of night wakes resolve without intervention?
9. **Split night detector** — awake 1-2h mid-night = too much day sleep or early bedtime
10. **Drowsy-but-awake tracker** — if baby always feeds to sleep, WW effectively ends at feed

### Data Storage
- `ob_night_summaries` — already built (last 30 nights, bed/wake/actual sleep/wake count)
- `ob_nap_history` — NEW: per-position nap durations with wake windows
- `ob_prediction_accuracy` — NEW: predicted vs actual, running accuracy score
- `ob_sleep_profile` — NEW: the personal profile built from all data

---

## 3. Approach B: Cloud ML Pipeline (V2.5 / V3)

Cross-user intelligence. "Babies similar to Oliver tend to..."

### How It Works
1. Anonymise all data (no names, no identifiers)
2. Send to cloud: age, sleep patterns, wake windows, outcomes
3. Cluster babies by sleep personality (not just age)
4. Use successful patterns from similar babies to improve predictions
5. "80% of babies with Oliver's pattern at this age did better with 2h wake windows"

### Infrastructure Needed
- Firebase Cloud Functions or dedicated backend
- Data anonymisation pipeline
- ML model (even simple k-nearest-neighbours would work)
- Privacy-first: GDPR compliant, opt-in only, clear explanation

### Potential Insights
- "Babies who dropped nap 3 at 26 weeks had 20% better nights by 30 weeks"
- "Your baby's night wake pattern matches the 4-month regression — 90% of babies
  return to baseline within 3 weeks"
- "Babies with similar day sleep totals do best with bedtime between 6:45-7:15pm"

---

## 4. OBuddy — Graduation at 12 Months

### The Emotional Bridge
- Baby's first birthday triggers "graduation" from OBubba to OBuddy
- Time capsule letters are delivered
- Transition from baby tracker to toddler companion
- Sleep engine shifts focus: nap transition (2→1), toddler boundaries, dropping nap

### OBuddy Features
- Toddler meal planner (beyond purees)
- Language development tracking (words, sentences, understanding)
- Behaviour insights (tantrums, sharing, independence)
- Potty training tracker
- Bedtime routine builder with visual schedule for toddler

---

## 5. Share Cards (Viral Growth)

### Status
Card renderer built (6 types: milestone, sleepwin, village, referral, rhythm, badnight).
Template designs provided. Need to refine and test.

### Cards to Build
1. **Sleep Win Card** — auto-generated when positive pattern detected
2. **Weekly Rhythm Summary** — single-screen visual for sharing in mum groups
3. **Milestone Moment Card** — "First 6-hour stretch" with baby photo
4. **Bad Night Badge** — solidarity after rough nights
5. **Village Card** — referral invite (both get free week)
6. **Referral Pass** — vintage ticket style invite

### Key: cards must be Instagram Story sized (1080x1920) and genuinely
beautiful. Parents share things that make them FEEL something.

---

## 6. Smart Notifications V2

### Current
- Nap approaching (25min before)
- Nap window open (5min before)
- Medicine reminders
- Appointment reminders

### V2 Ideas
- "Oliver usually feeds around now" (feed prediction)
- "Bedtime routine should start in 20 minutes" (pre-bedtime nudge)
- "Good morning! Oliver slept 10h 20m — here's today's predicted schedule"
- "Oliver's been awake 2h — watch for sleepy cues"
- "It's been a short nap day — consider an earlier bedtime tonight"
- Weekly summary: "This week's wins: night wakes down 30%, longest stretch ever"

### Anti-Notification Philosophy (Getting Quieter)
- Already built: notifications reduce frequency over 12 weeks
- V2: let parents choose which notifications they want
- V2: "quiet mode" for confident parents who just want the data

---

## 7. Wearable Integration (V3)

### Apple Watch
- Complication showing next nap/bedtime countdown
- Quick-log from wrist (one tap: feed, nappy, nap)
- Night mode: tap to log night wake without picking up phone

### Smart Monitors (Owlet, Nanit, etc.)
- Import sleep data automatically
- No manual timer needed — monitor detects sleep/wake
- Cross-reference OBubba predictions with actual sleep data

---

## 8. Community Features (V3)

### "Mum Groups" in OBubba
- Connect with parents of similar-age babies
- Share wins, ask questions
- Anonymous by default
- Moderated for safety

### "Ask OBubba"
- AI-powered Q&A using the 18 sleep consultant sources
- "Why does Oliver wake at 2am every night?"
- Answers personalised to Oliver's actual data
- Always includes "speak to your health visitor if concerned"

---

## 9. Revenue Expansion

### Current
- Monthly: £4.99
- Annual: £44.99
- Lifetime: £79.99

### V2 Ideas
- **Sleep consultation package** — £29.99 one-time: 4-week personalised sleep plan
  generated by the AI, reviewed by a real sleep consultant
- **Family plan** — £7.99/month for 2 parents + grandparent access
- **Gift subscriptions** — "Give the gift of sleep" for baby showers
- **Corporate wellness** — employer-sponsored for new parents returning to work

---

## 10. Technical Debt for V2

### Must Fix Before V2
- [ ] Move sleep engine to a separate module (not inline in 28K line app.jsx)
- [ ] Add unit tests for prediction functions
- [ ] Add integration tests for nap/bedtime scenarios
- [ ] Performance: lazy-load non-critical features
- [ ] Reduce app.js from 1.6MB (code-split by tab)
- [ ] Move from single-file JSX to proper React components
- [ ] Add TypeScript for type safety on prediction objects
- [ ] Proper error boundaries per section (not just global)

### Architecture
- Current: single app.jsx → Babel → app.js (monolith)
- V2: component-per-feature, Vite/webpack bundler, code splitting
- V3: React Native for true native performance + shared codebase

---

*"The goal is not to build a better tracker. It's to build something that
understands your baby better than any chart ever could."*
