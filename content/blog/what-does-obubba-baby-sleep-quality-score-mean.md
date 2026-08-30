---
title: "What Does My Baby’s Sleep Quality Score Mean?"
slug: what-does-obubba-baby-sleep-quality-score-mean
description: "Why did OBubba give last week 67%? See the real Flutter formula, the four logged signals behind it, what missing nights do—and why the score is context, not a grade."
date: 2027-02-25
updated: 2027-02-25
author: OBubba
tags: baby sleep quality score, what does baby sleep score mean, OBubba sleep score, baby sleep report app, baby night score, baby sleep tracker reports, longest sleep stretch, baby night wakes, weekly baby sleep report, age aware baby sleep app
heroImage: /obubba-baby-sleep-quality-score-morning.jpg
---

You open OBubba after a week that felt endless and see **Sleep quality: 67% — Settled**.

Is 67% good? Did one bad night ruin the score? Should you try to push it towards 100?

**Treat the number as a compact description of the nights you logged—not a grade for your baby or your parenting.** OBubba’s current Flutter report combines four things: how often baby woke, the longest unbroken sleep stretch, how much awake time was recorded and how much night sleep remained. It adjusts some expectations for age and refuses to score a night without credible boundaries.

That makes the number useful for comparison. It does not make it a medical measurement, a promise of development or a reason to change a routine after one week.

## The short answer

OBubba first scores each usable night from 0 to 100, then averages the usable scores from the latest seven-night report window.

| Signal | Share of one night’s score | What can improve the component |
|---|---:|---|
| Number of wakes | 30% | Fewer recorded wakes, judged against an age-aware range |
| Longest unbroken stretch | 30% | A longer stretch relative to that whole night |
| Logged time awake | 25% | Less explicitly timed awake time overnight |
| Amount of night sleep | 15% | More sleep between bedtime and morning wake after logged awake time |

The score bands shown in the weekly report are:

- **80–100: Restful**
- **60–79: Settled**
- **40–59: Mixed**
- **0–39: A tough week**

The app needs both bedtime and morning wake, and the reconstructed night must be between 6 and 16 hours. If not, that night produces **no score**. Missing nights are skipped, not turned into zeroes.

![How OBubba builds a baby sleep quality score from four logged signals.](/obubba-baby-sleep-quality-score-formula.svg "The current Flutter report weights wake count and longest stretch at 30% each, logged awake time at 25% and night-sleep duration at 15%, then averages only scoreable nights from the latest seven-night window.")

## What the percentage is actually answering

The percentage answers a narrow question:

> Based on the night boundaries and wakes recorded in OBubba, how consolidated and sufficiently long did these recent nights look for this baby’s age?

It does **not** answer:

- whether your baby was safe while asleep;
- whether every brief arousal was detected;
- whether baby should be sleeping through;
- whether a feed was medically necessary;
- whether the family feels rested;
- whether a sleep change is appropriate; or
- whether the baby is developing “well”.

OBubba is reading a parent-held log, not brain waves, oxygen, breathing or movement from a clinical device.

## The real Flutter formula

We traced the current `night_score.dart` engine, the night reconstruction code and the Reports UI rather than inferring the score from a marketing screenshot.

For each usable night, Flutter calculates four component values between 0 and 1, applies the weights and rounds the result:

> score = wakes × 30% + longest stretch × 30% + awake time × 25% + duration × 15%

### 1. Wake count: 30%

The same number of wakes is not treated identically at every age.

| Corrected age used by the app | Full wake-count score at | Wake-count score reaches zero at |
|---|---:|---:|
| Under 13 weeks | 3 wakes or fewer | 7 wakes |
| 13–25 weeks | 2 wakes or fewer | 6 wakes |
| 26–51 weeks | 1 wake or fewer | 5 wakes |
| 52 weeks and over | 1 wake or fewer | 4 wakes |

Between those anchors the component falls gradually. A 10-week-old with three recorded wakes can receive the full wake-count component; a 12-month-old with three wakes cannot.

This is a fairness adjustment, not a claim that every baby at a given age should meet the upper line. The NHS notes that babies differ, sleep patterns change as they grow and newborns commonly wake repeatedly in the first months.

### 2. Longest unbroken stretch: 30%

This component compares the longest reconstructed stretch with the total length of the night.

The full-score target is:

- **35% of the night** under 13 weeks;
- **50% of the night** from 13 to 25 weeks; and
- **60% of the night** from 26 weeks onwards.

On a 12-hour night, that means a target stretch of about 4 hours 12 minutes for a young newborn, 6 hours for a 4-month-old and 7 hours 12 minutes from roughly 6 months.

This component is deliberately relative. A 5-hour stretch inside a short 8-hour night and the same stretch inside a 12-hour night do not describe identical consolidation.

### 3. Logged time awake: 25%

The awake-time component starts at full value and falls as explicitly logged awake minutes occupy more of the night. At 20% of the night awake, this component reaches zero.

For a 10-hour night:

- 0 minutes awake gives the full component;
- 60 minutes awake gives half; and
- 120 minutes awake gives zero.

The word **logged** matters. An untimed wake still increases wake count, but it contributes zero minutes to `totalAwakeMin`. This can make the awake-time and duration components look kinder than the family’s experience when wakes were long but their durations were not recorded.

### 4. Night-sleep duration: 15%

Flutter starts with the bedtime-to-morning span and subtracts explicitly logged awake minutes. It then compares the result with an age-aware floor:

- **7 hours** under 13 weeks;
- **9 hours** from 13 to 25 weeks; and
- **10 hours** from 26 weeks onwards.

Meeting the floor gives the full duration component. Shorter nights receive a proportional score rather than falling off a pass/fail cliff.

Duration has the smallest weight. A long time in bed cannot fully conceal six wakes, a short longest stretch or a large amount of awake time.

## A worked example: the same night at two ages

Imagine this logged night:

- bedtime 10:00pm;
- morning wake 10:00am;
- 3 wakes;
- longest stretch 3 hours; and
- 60 minutes explicitly awake.

For a baby aged 10 corrected weeks, the score is about **81 — Restful**. Three wakes receive the full wake component; a 3-hour stretch represents a substantial part of this 8-hour night; and the sleep-duration floor is lower for a newborn.

For a baby aged 52 weeks, the same log scores about **52 — Unsettled** for the individual night. Three wakes sit further through the older age band, the target unbroken fraction is larger and the duration floor is 10 hours.

The baby did not “fail” at 12 months. The score is simply saying that the same shape of night is less consolidated relative to the engine’s older-baby anchors.

## How one night becomes the weekly number

The Reports screen reconstructs the latest seven nights. For each one, it calls the same deterministic scorer.

Then it:

1. drops any night that returned no score;
2. adds the remaining scores;
3. divides by the number of scoreable nights; and
4. rounds the weekly average.

If the scoreable nights were 72, 61, 80, 55 and 69, the report would show **67% — Settled**. Two unscoreable nights would not pull the average down; they would simply be absent.

That is preferable to pretending a missing log was a terrible night. It creates an important limitation, though.

## “Weekly average” does not currently require a full week

The current report does not impose a minimum sample count. If only one of the latest seven nights has a complete, plausible bedtime-to-morning record, that one night can appear as the **weekly average**.

The card does not currently print “based on 1 night” beside the percentage.

So before interpreting a large change:

- look at how many nights were fully logged;
- check whether a missing night was unusually easy or difficult;
- avoid comparing a seven-night week with a one-night week as if confidence were equal; and
- use the chart and raw log alongside the percentage.

A future version should show the denominator—**67% from 5 scored nights**—and could withhold the weekly label until a minimum sample exists. Transparency about sample size would make a good feature more trustworthy.

## What happens when data is missing or implausible

The scorer returns nothing when:

- bedtime is missing;
- morning wake is missing;
- the reconstructed span is shorter than 6 hours; or
- the reconstructed span is longer than 16 hours.

This anti-fabrication gate prevents a nap, an open timer or a badly wrapped clock entry becoming a confident night score.

The deeper night engine also works to merge events across midnight, remove some near-duplicate partner logs and keep overnight feeds inside the physical bedtime-to-morning window. The quality formula benefits from that reconstruction; it does not rescan raw taps independently.

But “plausible” does not guarantee “complete”. A 10-hour night with two unrecorded wakes still looks like a 10-hour no-wake night to any log-based system.

## Why timing the wake can change the score more than adding it

Suppose baby wakes at 2:10am and settles at 3:00am.

If you add a plain untimed wake:

- wake count rises by one;
- the longest-stretch boundary may change; but
- logged awake time remains zero for that wake; and
- calculated night sleep does not lose those 50 minutes.

If you use the running night-wake pause and resume flow, the 50-minute interval can contribute to both awake-time and duration calculations.

You do not need to time every murmur. But when the question is “Why did this night feel so much harder?”, duration is often the missing piece. Two quick resettles and two 50-minute wakes should not look identical merely because both contain two wake entries.

## The current report is calmer than the individual-night labels

The per-night engine names four bands:

- Restful;
- Settled;
- Unsettled; and
- Rough.

The weekly UI deliberately softens the lower two to **Mixed** and **A tough week**, followed by lines such as “one night is not a pattern” or “gentle support, not pressure”.

That is a thoughtful tone choice. A score is most useful when it reduces cognitive load, not when it turns normal infant waking into a red warning.

There is also a technical nuance: the individual scorer identifies the weakest of the four components for its one-line summary, but the current weekly card averages the numbers and shows a general quality line. It does not yet say whether wake count, longest stretch, awake time or duration drove the week down.

## Where to find it in the actual app

Open **Care → Reports**. The current Flutter **Insights Overview** brings together:

- seven-day sleep and nap bars;
- recorded night wakes and awake time;
- the weekly sleep-quality ring;
- the longest recent stretch;
- feeding and growth context; and
- a shareable report.

![The genuine OBubba Flutter Insights Overview showing seven-day sleep, recorded night wakes, feeding and growth context.](/obubba-sleep-quality-reports-app.jpg "OBubba’s real native Flutter Reports screen is built from the family’s logs. The sleep-quality card sits lower in the same seven-day overview; the report is not a wearable or medical assessment.")

The point is not to collect the highest possible number. It is to see the percentage beside the actual nights that produced it.

**[Try OBubba’s baby sleep reports free →](/baby-tracker-with-reports.html)** — turn ordinary sleep logs into a calm seven-day picture without treating your baby like a performance dashboard.

## How to use the score well

### Compare like with like

Compare weeks with similar logging coverage. Nursery, illness, travel and a parent forgetting timers can change both sleep and data quality.

### Read the components before changing the routine

A 58 caused by one long split night suggests a different question from a 58 caused by five short fragmented nights. The weekly number alone does not diagnose the cause.

### Look for direction, not perfection

If coverage is similar and the score drifts from the low 50s to the high 60s over several weeks, that may support the feeling that nights are consolidating. A jump from 52 to 91 based on one logged night and six blanks is not equivalent evidence.

### Let newborn sleep be newborn sleep

The age adjustments reduce unfair comparison, but the score should never become pressure to remove developmentally expected waking or feeds. Follow responsive feeding and individual clinical advice.

### Stop if tracking adds stress

You can simplify the log. Bedtime, morning wake and meaningful wakes may be enough for the question you are asking. A family does not owe the app a complete dataset.

## When the score should not lead the decision

Do not wait for a low percentage before seeking help if baby is difficult to wake, feeding much less, breathing differently, has concerning colour, has fewer wet nappies or seems significantly unlike themselves.

Do not use a high score to dismiss concerns about breathing, growth, feeding, reflux, pain or parental exhaustion. A tidy sleep log cannot rule out a health problem.

And do not change safer-sleep practice to improve consolidation. The score measures the log; it does not certify the sleep space.

## Frequently asked questions

### Is 67% a good baby sleep score?

In the current report, 67% falls in **Settled**. It means the weighted recent logs averaged 67, not that your baby achieved 67% of an ideal night. Check how many nights contributed and which pattern drove the experience.

### Why did the score change when the number of wakes stayed the same?

Wake count is only 30% of the formula. The longest stretch, explicitly logged awake time and total night sleep can all change while the count stays fixed.

### Does a missing night count as zero?

No. A night without both boundaries, or outside the 6–16-hour plausibility range, returns no score and is omitted from the weekly average.

### How many nights are needed for the weekly score?

Technically, one scoreable night is currently enough. The UI does not yet show the sample count, so check the seven-day chart before treating the number as a stable weekly pattern.

### Why is my newborn’s score higher than my older baby’s for a similar night?

The wake-count anchors, longest-stretch target and duration floor vary with corrected age. The engine is designed not to punish a young newborn for developmentally common fragmentation in the same way as an older baby.

### Does OBubba know how long every wake lasted?

Only when that duration is captured. An untimed wake counts as a wake but contributes zero to the logged-awake total. Use pause and resume for wakes where the length matters to the question.

### Can the score tell me why baby woke?

No. Other OBubba insights can organise logged timing, feeds, settle methods and disruptions into cautious hypotheses, but this score itself measures night shape. It is not a diagnosis.

### Should I try to get 100% every week?

No. Infant sleep changes with age, feeds, illness, development and ordinary life. Use the number to remember a pattern, not to optimise the baby.

## Sources and further reading

- [NHS Best Start in Life: Your baby’s sleep patterns](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/your-babys-sleep-patterns/)
- [NHS: Helping your baby to sleep](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/)
- OBubba Flutter source reviewed: `night_score.dart`, `night_score_test.dart`, `night_analysis.dart`, `day_metrics.dart`, `reports_screen.dart`, `insights_overview.dart` and `child_sync_repository.dart`

*OBubba is a tracking, planning and education tool, not a medical device or sleep monitor. Its sleep-quality percentage is a deterministic summary of parent-entered logs. It cannot detect unlogged waking, assess breathing or sleep safety, diagnose illness, decide whether a feed is needed or guarantee how a baby should sleep.*
