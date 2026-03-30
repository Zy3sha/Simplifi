# OBubba App Manifest

> **Every Claude session MUST read this file before making any changes.**
> This is the source of truth for how OBubba works. If a change conflicts with these rules, DO NOT make it. Ask the user first.

---

## PROTECTED CODE — DO NOT MODIFY WITHOUT EXPLICIT PERMISSION

The following systems are core to the app and must NEVER be changed without the user explicitly asking:

- **Entry data structure** — fields, types, IDs
- **Cloud sync logic** — push/pull, merge, conflict resolution
- **Timer calculations** — nap timer, night timer, breast timer, countdowns
- **Night/day classification** — `autoClassifyNight`, `night` flag logic
- **Backup codes & auth flow** — login, backup code assignment, account recovery
- **Firebase document structure** — `families/`, `usernames/`, `uid_to_backup/`

---

## 1. OBubba Day Model

- An OBubba day runs **wake-to-wake**, NOT midnight-to-midnight
- Day starts at morning wake, ends at next morning wake
- **Night** = bedtime entry to next morning wake entry
- Cross-midnight entries (e.g. 2am feed) belong to the previous OBubba day
- Calendar storage: entries are stored by calendar date, but the UI displays them in the OBubba day context

---

## 2. Entry Types

| Type | Fields | Notes |
|------|--------|-------|
| **Feed (bottle)** | time, amount (ml), feedType:"milk", night flag | |
| **Feed (breast)** | time, breastL, breastR (durations), side, feedType:"breast" | Timer tracks L/R with Live Activity |
| **Feed (solids)** | time, feedType:"solids", note | |
| **Nap** | start, end (or ongoing), type:"nap" | Has elapsed timer, shows on Dynamic Island |
| **Wake** | time, type:"wake", night flag | Morning wake ends the OBubba night |
| **Bedtime** | time, type:"sleep", night:false | Starts night mode, dark theme, Live Activity |
| **Nappy** | time, type:"nappy", poopType, night flag | wet/dirty/both, poop color |
| **Pump** | time, pumpL, pumpR (ml amounts) | |
| **Tummy Time** | time, duration | |
| **Crying** | time, type:"crying" | Crying decoder feature |

---

## 3. Night Classification Rules

- **Any entry after bedtime = night entry** (feeds, wakes, nappies — ALL go to Night Wakes section)
- **No grace period** — even a feed 5 minutes after bedtime is a night entry
- **Entries between morning wake and bedtime = daytime** — NEVER classified as night regardless of `night` flag
- **Cross-midnight entries** (midnight–5am with no bedtime on current day) = night, using previous day's bedtime as reference
- **Naps are ALWAYS daytime** — never reclassified as night
- `autoClassifyNight()` runs on every entry change and on cloud merge to fix stale flags

---

## 4. Night Wakes Section

- Shows all entries with `night: true` that pass the time filter
- **Hard boundary**: entries between morning wake time and (bedtime - 60 min) are excluded regardless of night flag
- Entries are sorted chronologically from bedtime (PM entries first, then AM cross-midnight)
- Between each wake, show the stretch duration (color-coded: green 3h+, purple <2h)
- Night wake data captured: time, optional feed amount, self-settled vs assisted, soothe method, soothe duration, notes

---

## 5. Timer Pill (Header)

The timer pill is **contextual** — it shows different information based on the current phase:

| Phase | Pill Shows |
|-------|-----------|
| **Awake, naps remaining** | Countdown to next predicted nap |
| **Nap in progress** | Elapsed nap time (counting up) |
| **All naps done** | Countdown to predicted bedtime |
| **Bedtime logged, no wakes** | Elapsed time since bedtime (counting up) |
| **Bedtime + night wakes** | Elapsed since last wake settle (resets after each wake) |
| **Breastfeeding active** | Elapsed breast timer with L/R side |

### Night Timer Behavior:
- Counts from **last night event**, NOT always from bedtime
- `lastNightEvent` = bedtime if no wakes, OR last wake time + soothe duration
- Timer resets after each night wake is settled
- Example: Bed 7:42pm → wake at 11pm (soothed 5min) → timer resets from 11:05pm

---

## 6. Live Activity (Dynamic Island)

- Active during **any timer**: nap, bedtime, breastfeeding
- **Mirrors the pill timer** — shows the same elapsed time
- Shows baby name + timer type icon (moon for bed, zzz for nap, bottle for feed)
- Starts when timer starts, stops when timer stops
- For bedtime: should restart with new start time when night wake settles
- Timer uses **actual event time**, not `Date.now()` — if bedtime was 7:42pm and it's 9pm, timer shows 1:18

---

## 7. Widget

### Sizes: Small, Medium, Large

### Data source:
- Written via `OBWidgetBridge.setData()` to shared App Group file (`widgetData.json`)
- **NEVER write data with 0 counts if baby name exists** — this is the "loading" state, skip the write

### When timer IS running:
- **Active timer** prominently displayed with label (e.g. "Nap 1h 15m", "Bed 3:42", "Breast L 8:12")
- Last feed and last nappy log below
- Next predicted event and time

### When NO timer is running:
- **Next prediction** at top (e.g. "Next nap ~2:30pm", "Next feed ~1:15pm")
- Today's feed/sleep/nappy counts
- Last feed and last nappy times

### Breastfeeding L/R buttons:
- Label "Nursing" above L and R buttons so breastfeeding moms know what it's for
- **Only show for breastfeeding or combi-feeding moms** — detect by checking if breast feed has been logged
- If no breast feed logged in 7+ days, prompt: "Still breastfeeding?" — if no, hide nursing from widget
- Tapping L or R opens app with breast timer already running on that side
- Remembers which side was last

### Size layouts:
| Size | Content |
|------|---------|
| **Small** | Active timer + baby name. When idle: next prediction + baby name |
| **Medium** | Full layout: timer/prediction, last feed/nappy, next event, L/R buttons |
| **Large** | Everything from medium + today's counts + more detail |

---

## 8. Cloud Sync Rules

### Conflict Resolution:
- **Most recent wins** — compare `modifiedAt` timestamps per entry
- Remote wins ties (when both have same or no timestamp)

### Delete Handling:
- **Deleted entries stay deleted** — persist deleted IDs in localStorage (`ob_deleted_ids`)
- Cloud sync checks `deletedEntryIdsRef` before merging remote entries
- "Save to Cloud" = full overwrite — pushes ALL local data, clears deleted tracking

### Sync Flow:
1. App opens → Firebase `onSnapshot` listener fires
2. If remote `writeToken` matches local → skip (it's our own write)
3. If remote `updatedBy` matches local UID → skip
4. Otherwise → merge using `mergeChildren()` with per-entry timestamp comparison
5. After merge → `autoClassifyNight()` reclassifies all days

### Push to Cloud:
- Triggered 500ms after any entry change (debounced)
- Only pushes if `cloudSyncedRef` is true (initial sync completed)
- Uses `writeToken` to prevent echo loops
- "Save to Cloud" button = immediate full push, clears delete tracking

---

## 9. Hero Card

- **Phase-aware** — shows different content based on current state
- Current context: next nap prediction, "sleeping peacefully" during bed, skip nap advice, early bedtime suggestion
- **Reassurance message** (mint green italic text): rotating encouragement + contextual advice when relevant
- Sleep pressure bar: Awake / Debt / Clock indicators
- "Why?" expandable section with age-appropriate sleep guidance

---

## 10. Bedtime Flow

When "Bed Now!" is tapped:
1. Log bedtime entry (type:"sleep", night:false)
2. Start night elapsed timer on pill (from bedtime)
3. Start Live Activity on Dynamic Island
4. Switch to dark theme
5. Update widget data with activeTimer:"bed"
6. Hero card switches to "Sleeping peacefully 🌙"

---

## 11. Morning Wake Flow

When morning wake is logged after bedtime:
1. Log wake entry (type:"wake", night:false)
2. Stop night timer
3. End Live Activity
4. Switch back to light theme (or system theme)
5. Start new OBubba day
6. Widget updates with new day's counts

---

## 12. Dark Mode / Theme

- **System follows + auto on bedtime**
- Dark theme activates when bedtime is logged
- Light theme restores when morning wake is logged
- Manual toggle also available
- Respects iOS system dark/light mode setting as baseline

---

## 13. Push Notifications

Smart reminders only:
- **Feed reminder**: Morning wake logged + no feed within 30min = "Time for a feed?"
- **Medicine due**: Dose reminder based on schedule
- **Appointment reminder**: 1hr before logged appointment
- **Partner notification**: When partner logs an entry on shared family doc
- **Carer notification**: When carer logs something, notify everyone with child code

---

## 14. Predictions

- **Two prediction modes (Free vs Premium)**:
  - **📋 Guidelines Mode (free)**: Uses NHS Start4Life, WHO, AASM age-based wake windows only. Solid, research-backed.
  - **✨ Personal Rhythm (premium)**: Learns from baby's actual patterns (last 14 days, recency-weighted, per-nap-position). Blends personal data with age guidance. Gets smarter every day.
- Free users: `_isFreeUser` check in `predictNextNap()` forces `_usePersonal = false`
- Premium/trial users can toggle between modes in Account → Sleep Engine
- `usePersonalRecs` state: `true` = personal, `false` = guidelines, `null` = auto (personal if data exists)
- Show as estimates with disclaimer: "Predictions are a loose guide... always follow sleepy cues"
- Never present as medical advice

## 14b. Premium / Subscription System

- **`STORE_READY = false`** currently — all features unlocked while store not live
- **When `STORE_READY = true`**: `isPremium` gates features, paywalls activate
- **14-day trial**: Auto-starts on first app open (no sign-up needed). Stored in `obubba_trial_start`
- **`trialDaysLeft`**: Calculated days remaining. Gentle reminder only in last 3 days.
- **`PremiumGate` component**: Wraps premium features with warm blur + 💛 nudge (not 🔒 lock-out)
- **`PremiumTeaser` component**: Inline teaser for locked features
- **`triggerPaywall(context)`**: Max 1 per session. Context-specific warm messages.
- **Paywall ethos**: "For less than a coffee a month — no more guessing, no more juggling 5 different apps"
- **Pricing**: £4.99/month, £39.99/year (33% off), £79.99 lifetime
- **RevenueCat**: `window._purchases` for store integration (not yet wired)
- **Free features**: All logging, sound machine, crying helper, basic age-based predictions, milestones, teething
- **Premium features**: Personal Rhythm predictions, Sleep Story, Tonight's Guidance, Schedule Builder, Growth Charts, Partner Sync, Feed Intelligence, Weaning Intelligence, Health Visitor Reports, Full Activity Library

---

## 15. Carer Mode

- Parent shares QR code / link
- Carer gets limited portal to log entries only
- Carer entries appear in parent's "Carer Activity" section
- When carer logs, everyone with the child code gets notified
- Parent can end carer session (locks the portal)
- New session = new link

---

## 16. Tabs

| Tab | Purpose |
|-----|---------|
| **Today** | Hero card, daily plan, today's log (daytime + night wakes), quick action buttons |
| **Insights** | Charts, trends, weekly summary, sleep analysis, feed tracking |
| **Development** | Milestones, growth measurements, developmental phases |
| **Account** | Settings, cloud sync, backup code, carer management, subscription |

---

## 17. Breastfeeding Timer

- Tracks left/right side separately
- Elapsed timer shows on pill and Live Activity
- Remembers which side was last (for "start on other side" prompt)
- Can log duration for each side independently

---

## 18. Nap Timer

- Start/stop with elapsed time display
- Shows on pill and Live Activity (Dynamic Island)
- Auto-stops after 4 hours (logs as bedtime if late enough)
- Recovers from app restart (orphan nap recovery checks for ongoing nap entry)
- 30-second interval updates the entry's end time

---

## 19. Siri Integration

- Shortcuts donated for common actions (log feed, log nap, etc.)
- On app resume, check `pendingSiriEntry` and process it
- Siri invocation opens app to relevant screen
- **App Intents** (iOS 16+) in `SiriShortcutsPlugin.swift` — 5 intents: LogFeed, StartNap, LogBedtime, LogNappy, BabySummary
- `OBubbaAppShortcuts: AppShortcutsProvider` registers Siri phrases automatically
- `updateAppShortcutParameters()` called in plugin's `load()` method
- Pending entries stored via App Group UserDefaults (`pendingSiriEntry` key)

## 19b. Developmental Phases

- **10 phases** defined in `DEV_PHASES` array — original OBubba naming (NOT Wonder Weeks trademarked names)
- Phases: Senses Awakening, Finding Patterns, Fluid Movement, Understanding Events, Connections & Distance, Sorting & Grouping, Steps & Sequences, Problem Solving, Rules & Boundaries, Flexible Thinking
- Peak weeks aligned with developmental research: 5, 8, 12, 19, 26, 37, 46, 55, 64, 75
- Each phase has: fussy period description, skills list, windowStart/windowEnd/peakWeek
- Used by: Coming Up card, disruption diagnostic, night wake analysis, sleep regression detection
- **5 sleep regression windows** separate from phases: 4-month (15-19w), 8-10 month (32-40w), 12-month (48-56w), 18-month (72-84w), 2-year (96-108w)

## 19c. Sleep Story (Insights)

- `generateSleepStory()` returns typed sections: tonight, wins, assessment, patterns, tips, science
- **Tonight's Guidance**: Suggested bedtime (from `getBedtimeConsistency()` converted to minutes), expected wakes, feed tips, pattern-specific advice. Each line has a "why" explanation.
- **This Week's Wins**: Celebratory cards showing improvements (night wakes down, nap improvements)
- **Consultant's Assessment**: Nights/Naps/Sleep Budget with expert-style analysis
- **What I'm Noticing**: Pattern cards with 5 NEW detections:
  1. Bedtime drift (later/earlier each night)
  2. Nap quality (circadian window timing)
  3. Feed-sleep correlation (bigger feeds → longer stretches, baby-specific)
  4. Weekend vs weekday pattern inconsistency
  5. Upcoming regression prediction (warns 1-3 weeks before)
- **Try This Week**: Max 3 actionable tips with reasons
- **How We Calculate This**: Visual gauge bars for Sleep Pressure, Sleep Debt, Body Clock, Rhythm Confidence

## 19d. Founding Supporter Review Prompt

- Auto-triggers on first native app open if user has 3+ days of data
- Shows once ever (stored in `ob_review_prompted_v1`)
- Flow: "Thank you" → "Love it?" → App Store/Play Store review OR "Needs work?" → feedback email form
- Feedback emails to hello@obubba.com with baby name, age, days logged, platform
- **TODO**: Replace `idXXXXXXXXXX` in App Store URL with actual App Store ID once published

---

## 20. App Startup

- LaunchScreen.storyboard shows cream background with OBubba mascot + "Getting everything ready..."
- HTML splash continues the loading state until app is ready
- WebView background color matches cream (#FFFEFD) to prevent black flash
- `SplashScreen.hide()` called when app is ready, not on timeout

---

## Feature Status Checklist

> **Instructions for Claude:** Before making ANY fix, check this list. If the feature is marked ✅, explain how your fix will affect it and get user confirmation before proceeding. If user reports a bug in a ✅ feature, uncheck it (change to ❌) until confirmed fixed again.

### Native Features
- ✅ Widget shows on Home Screen (extension compiles, appears in gallery)
- ✅ Widget shows baby name
- ❌ Widget shows correct feed/sleep/nappy counts (race condition with 0-count writes)
- ❌ Widget shows active timer
- ❌ Widget L/R breast buttons
- ✅ Live Activity shows on Dynamic Island during bedtime
- ✅ Live Activity shows on Lock Screen
- ❌ Live Activity timer matches pill timer (should count from last wake settle, not bedtime)
- ❌ Live Activity starts for nap timer
- ❌ Live Activity starts for breast timer
- ✅ Siri shortcuts — App Intents merged into SiriShortcutsPlugin.swift, auto-registers with Siri (iOS 16.4+)
- ✅ Push notifications — native-plugins.js rewritten to use Capacitor.Plugins.* (not ES module imports)

### Timers
- ❌ Night timer counts from last night event (not always bedtime)
- ❌ Nap timer pill shows elapsed during active nap
- ❌ Bedtime pill shows correct info (currently shows phantom "1 wake")
- ✅ Nap timer recovers after app restart (orphan nap recovery)
- ✅ Bedtime timer auto-stops after 4hr forgotten timer guard

### Night / Day Classification
- ❌ Entries after bedtime go to Night Wakes (grace period removed, needs testing)
- ❌ Daytime feeds don't bleed into Night Wakes section
- ❌ Deleting night wake entries works on old dates
- ❌ Cloud merge reclassifies stale night flags

### Sync
- ❌ Deleted entries stay deleted after app restart (localStorage persistence added)
- ❌ "Save to Cloud" pushes clean data and clears delete tracking
- ❌ Cloud sync doesn't overwrite newer local data
- ❌ Stale cloud entries don't resurrect

### UI
- ✅ Splash screen shows OBubba mascot (no black screen)
- ✅ Dark mode activates on bedtime
- ✅ Light mode restores on morning wake
- ✅ Reassurance message shows in mint green
- ✅ App icon shows Oliver's photo
- ❌ Hero card shows correct context (needs verification after timer fixes)

### Core Features
- ✅ Feed logging (bottle/breast/solids)
- ✅ Nap logging with start/end
- ✅ Nappy logging with type
- ✅ Bedtime logging
- ✅ Wake logging
- ✅ Predictions (next nap, feed, bedtime)
- ✅ Insights tab charts
- ✅ Development tab milestones
- ✅ Carer mode QR sharing
- ✅ Multi-child support

---



## Full Feature Review (2026-03-28)

### Header
- ✅ Child name and switch
- ❌ Start Feed button — only show if breastfeeding has been logged (same 7-day rule as widget)

### Today Section
- ✅ Dates
- ✅ Hero card
- ✅ Quick logs
- ✅ Detailed logs
- ❌ Med/tab feature — rebuild as dedicated page with two tabs:
  - **Medicines tab**: Active medications with next dose time, date-scrollable dose log, "Log dose" quick button, "+ Add Medicine" with name/dose/frequency
  - **Vaccines tab**: Country-specific immunisation schedule (NHS UK default), checkboxes for completed, upcoming vaccines with due dates based on DOB
  - Temperature logging stays here too
- ✅ Age advice
- ✅ Totals
- ✅ Today's plan
- ❌ Logs — keeps breaking with random logs appearing (stale cloud sync)
- ❌ "Is This Normal?" section — colour needs work, should be more soothing/reassuring

### Insights Section
- ✅ Wellness prompt
- ❌ Rhythm checks — "unsettled nights" persists even when trend improves. Move correct items to top, needs-improving to bottom
- ⏳ Sleep tab — tomorrow's predicted rhythm works but needs more accuracy
- ❌ Schedule builder — tries to fit naps randomly instead of following baby's natural rhythm. Should use logic: if baby woke at 7:40am, they're already in wake window, don't try to fit extra naps
- ✅ Feed tab
- ✅ Sleep and bedtime

### Growth Tab
- ✅ Growth and percentiles
- ❌ Need WHO growth curve overlay on chart. Daily weight logging overcrowds graph — need legible view for frequent loggers
- ❌ Reports — should show wake window times and night sleep stretches for the day plus previous night

### Development Section
- ✅ Activities tab
- ❌ Milestones — not updating for 5mo. Show current month's milestones. Add collapsible "Upcoming" section. Achieved + notes + NHS guidance working.
- ⏳ Teeth and weaning tab — untested

### Account Section
- ⏳ Recovery word — change to email address (discuss first)
- ❌ Username — show at top of page as login format (e.g. "zyeshacorran" not "zyesha corran")
- ❌ Data import — move to bottom of page
- ❌ Link a child — redesign:
  - Each child gets a **permanent unique code** (e.g. "OLIV-3K8M") generated once
  - Code does NOT regenerate automatically — stays the same until user taps "Regenerate"
  - Regenerate button shows warning: "Anyone linked with the old code will lose access"
  - Partner enters code → child links to their account
  - Multiple people can link with same code
  - Current system has issues with code management and sync after linking
- ❌ Carer card — saved numbers disappear after updates. Rest working.
- ✅ End carer session
- ✅ Night/day mode
- ❌ Notifications button — remove entirely
- ❌ Nappy reminder — should send pop-up in app + push notification out of app
- ✅ Sleep Engine toggle — Personal Rhythm (premium) vs Guidelines (free), gated properly
- ❌ App tour — needs updating with new features
- ✅ Need a hand
- ✅ First aid references
- ✅ Legal and about
- ✅ Sign out
- ⏳ Delete account — needs verification it works

---

## Rules for Claude Sessions

1. **Read this manifest first** before making any changes
2. **Never modify protected systems** without explicit user request
3. **If a fix significantly changes a feature, CONFIRM first** — describe what you'd change in plain English and ask if that's what the user wants before implementing. Don't assume.
4. **Make minimal changes** — don't touch surrounding code
4. **Test the change** — verify it doesn't break other features
5. **Don't remove features** — if something seems unused, ask first
6. **Don't add grace periods, buffers, or "smart" logic** to classification without asking
7. **Copy the actual bedtime/wake time** to Live Activity, never use `Date.now()`
8. **Preserve entry data** — never delete or modify entries during sync without user action
9. **Widget data must have real counts** before writing — skip writes during loading state
10. **Cloud sync must respect deletions** — check `deletedEntryIdsRef` before merging
