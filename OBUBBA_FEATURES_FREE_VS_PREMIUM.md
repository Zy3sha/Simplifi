# OBubba — Free vs Premium Feature List (Code-Truth Scan)

Sourced directly from `/home/user/Simplifi/app.jsx`, not marketing copy.

**Pricing:** £4.99/month · £39.99/year · £79.99 lifetime
**Trial:** 14 days (28 days for pre-launch testers), auto-starts on first open, no sign-up
**Note:** `STORE_READY = false` currently — gates are defined in code but bypassed at runtime until store goes live.

---

## FREE TIER (no paywall gate in code)

### Core Logging (all unlimited)
- Feed logging — bottle, breast L/R timer, solids, pump
- Nap & sleep tracking (timers + manual entry)
- Night wake logging with wake-window display
- Nappy logging (wet / dirty / both + colour)
- Medication form — log medications and prescriptions (app.jsx:6532, 42415)
- Temperature logging
- Health / wellbeing entries
- Pinned notes / sticky reminders (app.jsx:6450)
- Appointments — add, view, manage health appointments (app.jsx:6453, 41122)
- Calendar day-by-day view (app.jsx:6806, 41498)

### Breastfeeding
- Breastfeeding Hub (BfHub) — cluster feeds, supply, tongue tie, helplines, growth spurts (app.jsx:6743, 37911)
- L/R breast timer with side memory

### Settling & Sound
- Sound Machine — white noise and ambient sounds library (app.jsx:6878, 37836)
- Crying Helper — guided soothing techniques (app.jsx:6811, 38691)
- Safe Sleep popup / SIDS guidelines (app.jsx:6879)

### Basic Sleep Guidance
- Age-based wake windows and regression windows (non-adaptive)
- Tonight's Tip — rotating nightly sleep tips (app.jsx:39653)
- Bed routine setup (app.jsx:6841)

### Development
- Milestones — age-based developmental checklist (app.jsx:4011+)
- Activity Library — DEV_ACTIVITIES list (app.jsx:4177)
- Teething form and info (app.jsx:6889)

### Weaning
- Weaning Form — log introduction of solids (app.jsx:6891)
- Allergen data entry and allergen safety gate (ALLERGENS at app.jsx:895, 6751)
- Food reaction logging

### Wellbeing
- Wellbeing check-ins with support resources (app.jsx:6553, 38210)
- Depression screening prompts and helplines
- Partner check-in (app.jsx:6584)

### Onboarding & Setup
- Quick Start onboarding (app.jsx:6865)
- Curiosity-gap detection (feature is free, paywall nudge is separate)

---

## PREMIUM (explicit gates found in code)

### Sleep Intelligence
- **Tomorrow's Predicted Rhythm** — context `predicted_rhythm` — "Personalised nap & bedtime schedule based on NHS guidance and your baby's sleep patterns" (app.jsx:31887)
- **Personalised Schedule / Today's Plan** — context `today_plan` — "Baby's own rhythm blended with sleep science. Adapts daily based on actual naps, sleep pressure, and circadian alignment" (app.jsx:29970, 29996)
- **Tonight's Focus** — context `tonights_focus` — 4-step plan for tonight based on last night's diagnosis (app.jsx:29821)
- **Rhythm Check** — context `rhythm_check` (app.jsx:31920)
- **Sleep Coach** — context `sleep_coach` — "Personalised 14-day plan. Three gentle, evidence-based approaches (no-cry, chair shuffle, parent-led rhythm)" (app.jsx:31345-31353)
- **Nap Prediction** — context `nap_prediction` — gated at multiple call sites (app.jsx:27618, 27681, 36333, 37778)

### Analysers (all gated)
- **Feed Analyser** — context `feed_analyser` (app.jsx:12344)
- **Nap Analyser** — context `nap_analyser` (app.jsx:12385)
- **Night Analyser** — context `night_analyser` (app.jsx:29786)
- **Wellbeing Analyser** — context `wellbeing_analyser` (app.jsx:29213)
- **Weaning Analyser** — context `weaning_analyser` (app.jsx:34750)
- **Triage** — context `triage`

### Feed & Weaning Intelligence
- **Feed Insights & Trends** — context `feed_insights` — "Track feeding patterns, spot cluster feeds, volume changes, and growth spurts over the last 7-14 days" (app.jsx:32503)
- **Predicted Next Feed** — gated at app.jsx:32601 with hasAccess()
- **Recipe Library** — context `recipes` — "50+ age-appropriate recipes with step-by-step instructions, allergen tags, nutritional info" (app.jsx:35658, 35702)
- **Weaning Stats** — context `weaning_stats` (app.jsx:35719)

### Growth & Development
- **Growth Charts** — context `growth_charts` — "WHO growth standards with weight and height percentile charts" (app.jsx:32947)
- **Trends, Patterns & Charts** — context `weekly_trends` — "Cross-domain patterns, trend charts, and weekly analysis across sleep, feeding, and naps" (app.jsx:33252)

### Schedule Tools
- **Schedule Builder** — context `schedule_builder` — draggable timeline event builder (app.jsx:28164)

### Sharing & Family
- **Family Share / Partner Sync** — context `family_share` — gated at app.jsx:39215 (sync feature itself is free; paywall is on sharing with partner/family)
- **Multi-Baby Support** — context `multi_baby` — blocks adding 2nd+ child when not premium (app.jsx:27237)

### Soft-Gated (no explicit paywall trigger, implicit premium)
- **Weekly Digest** — generateWeeklyDigest() at app.jsx:23574 (sleep quality score 0–100, wins, stats, narrative)
- **Sleep Story** — generateSleepStory() at app.jsx:18640 (1000+ line narrative builder)
- **Health Visitor Report** — state showHVReport at app.jsx:6461 (feature exists, no explicit gate found in render path — matches "always free" marketing)

---

## Gating Inconsistencies Found in Code

1. **Analyser buttons** (feed / nap / night / wellbeing / weaning) — the underlying insight displays are FREE, only the "Analyse" button itself triggers the paywall. Free users see basic stats but can't run the deeper analysis.

2. **Predicted Next Feed** (app.jsx:32601) — silently hidden for free users with NO teaser card, unlike other premium features which show a PremiumTeaser.

3. **Health Visitor Report** — state variable exists at app.jsx:6461 but no visible gate in the render path. Marketing says "always free" — code appears to match.

4. **"coach" paywall context** at app.jsx:31272 — orphaned card with no label found, may be deprecated.

5. **Partner Sync** — the underlying sync code/PIN feature is free; only the "share with family" flow is gated.

---

## Marketing vs Code Truth

| Feature | Marketing says | Code says |
|---|---|---|
| Guidelines sleep predictions | Free | Free (via _isFreeUser check in predictNextNap) |
| Personal Rhythm predictions | Premium | Gated under nap_prediction |
| Growth charts | Premium | Gated under growth_charts |
| 77 weaning recipes | Premium | Gated under recipes (locks full library) |
| Partner sync | Premium | Partial — sync code is free, family sharing is gated |
| Health Visitor Report | Marketing: free / Manifest: premium | Code appears FREE (no gate in render path) |
| Sound machine | Free | Free |
| Breastfeeding Hub | Free | Free |
| Multi-baby | Premium | Gated at child #2 |
| Schedule Builder | Premium | Gated under schedule_builder |
| Sleep Coach (14-day plan) | Premium | Gated under sleep_coach |
| Tonight's Focus / Guidance | Premium | Gated under tonights_focus |

---

## Totals

- **~22 free features** — all logging, sound machine, crying helper, breastfeeding hub, calendar, appointments, medications, basic predictions, milestones, activities, weaning form, allergens, wellbeing check-ins
- **~19 explicitly gated premium features** — predictions, analysers, charts, recipes, schedule builder, sleep coach, multi-baby, family share
- **~3 soft-gated premium features** — weekly digest, sleep story, HV report (status ambiguous)

---

## Paywall Mechanisms (for reference)

- `isPremium` — boolean state
- `hasAccess()` — returns true for premium/trial/owner
- `trialActive` — 14-day trial auto-started on first open
- `<PremiumGate>` — component wrapper, warm blur + nudge (not lock-out)
- `<PremiumTeaser>` — inline teaser card with icon, label, description
- `triggerPaywall(context, force?)` — max 1 per session unless forced
- `setPremiumGateInfo({...})` — shows feature-specific upsell modal

**Paywall ethos (from code comments):** "The paywall should never feel like a lock-out — it should feel like an invitation from a friend who wants to help even more."
