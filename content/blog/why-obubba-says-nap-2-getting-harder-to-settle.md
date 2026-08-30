---
title: "Why Does OBubba Say ‘Nap 2 Is Getting Harder to Settle’?"
slug: why-obubba-says-nap-2-getting-harder-to-settle
description: "How OBubba compares the same nap across 14 days, what its settle-time buckets mean, and why a harder second nap does not automatically need an earlier wake window."
date: 2027-01-25
updated: 2027-01-25
author: OBubba
tags: nap 2 getting harder to settle, baby fighting second nap, second nap taking longer, baby nap schedule, wake window before second nap, baby nap transition, time to fall asleep baby, OBubba nap insight, baby nap tracker, overtired or undertired baby, personalised wake windows, baby refuses afternoon nap
heroImage: /obubba-nap-2-harder-to-settle.jpg
---

The first nap still happens with barely a wobble. Bedtime feels much the same. But the second nap has become a daily negotiation: another song, another cuddle, another cot attempt. Then OBubba surfaces a card:

**“Nap 2 is getting harder to settle.”**

Has the app decided your baby is overtired? Should you bring the nap forward by 15 minutes? Is this proof that it is time to drop a nap?

Not from this card alone. We traced the current Flutter detector, its 14-day caller, the nap editor and tests for this guide. The card makes one narrow observation: **the saved time-to-settle value for one nap position has risen by at least three minutes on average across the three most recent calendar days, compared with older days in the lookback.**

It is useful because it isolates one part of the day instead of hiding it inside a daily average. It still cannot tell you why that nap changed.

![A calm parent holds an awake baby beside a clear cot during a gentle daytime nap reset.](/obubba-nap-2-harder-to-settle.jpg "A difficult second nap is information, not failure; the next step depends on the baby’s cues and the wider day.")

## The short answer

For one nap position, the current detector requires all of these:

| Gate | Current Flutter rule | Why it matters |
|---|---:|---|
| Lookback | Up to **14 calendar days**, including today | The card is about a recent change |
| Valid settle value | More than **0** and no more than **120 minutes** | Empty and implausibly large values are excluded |
| Total sample | At least **5 records** for that nap position | A couple of attempts do not create a card |
| Recent side | At least **2 records** on day indices 0–2 | The latest three calendar days need evidence |
| Older side | At least **2 records** on day indices 3–13 | There must be a personal baseline |
| Rise | Recent mean is at least **3 minutes higher** | Smaller differences stay quiet |

If several nap positions qualify, the detector chooses the one with the **largest increase**.

![The exact fourteen-day grouping and worked Nap 2 example behind OBubba’s settle-drift card.](/obubba-nap-position-settle-drift.svg "The Flutter detector groups daytime naps by their order within each calendar day, then compares recent and older time-to-settle averages for each position.")

These are product thresholds, not medical definitions of a nap problem and not proof that one wake-window change will fix it.

## What “Nap 2” actually means

The app does not identify Nap 2 from a saved timetable or a particular clock time. For each calendar day, it:

1. keeps daytime entries whose type is Nap and which have a start time
2. sorts those entries from earliest to latest
3. calls the first one Nap 1, the second Nap 2, the third Nap 3, and so on

That usually matches how a parent describes the day. But the label is only as stable as the log.

Suppose the baby normally naps at 9:15am, 12:30pm and 4:00pm. If the 12:30pm nap is not logged one day, the 4:00pm nap becomes Nap 2 in the software. During a nap transition, a late remaining nap may also move from third position to second. The detector can then compare different biological moments under the same label.

An unlogged nap is therefore more consequential than a missing settle-time answer. A nap with no settle value still occupies its correct position before being excluded from the averages. A nap missing entirely does not.

## The settle-time buttons are ranges, not a stopwatch

After a nap, the current Flutter editor asks **“Time to fall asleep”** and offers:

| Parent sees | Value stored for analysis |
|---|---:|
| Under 5m | **3 minutes** |
| 5–15m | **10 minutes** |
| 15–30m | **22 minutes** |
| 30m+ | **40 minutes** |

These representative values keep logging quick, but they are not exact measurements. Two naps that took 16 and 29 minutes both contribute 22. A 35-minute and a 70-minute settle can both contribute 40.

The card body may say the baby is taking “about 20 min” lately. That can be a mean of exact-looking numbers, but much of the underlying history may consist of bucket proxies. Read it as a direction—**quicker range versus slower range**—not precision to the minute.

Imported, legacy or other app-created records can carry different positive integer values, and the model accepts them as long as they are no more than 120 minutes.

## The worked example from the Flutter test

The positive test creates ten three-nap days, newest first.

For Nap 2, the three recent settle values are:

**22, 20 and 19 minutes → recent average ≈ 20 minutes**

The seven older values are:

**12, 12, 13, 12, 12, 13 and 12 minutes → older average ≈ 12 minutes**

That is a rise of roughly eight minutes, so Nap 2 qualifies. Nap 1 stays around 10–11 minutes and Nap 3 around 13–14, so the test returns **“Nap 2 is getting harder to settle”** with a ten-nap sample.

The three-minute gate is applied to the unrounded averages. A recent average of 14.9 and an older average of 12.0 is a 2.9-minute rise, so no card. At exactly 3.0 minutes, it can appear.

## “The other naps are steadier” is not guaranteed

The current card body says the other naps are steadier. The detector does not actually require that.

If Nap 1 has worsened by four minutes and Nap 2 by eight, both qualify; the code chooses Nap 2 because its rise is larger. The text can still say “the other naps are steadier” even though Nap 1 also crossed the product threshold.

That does not make the selected drift imaginary. It means the accurate interpretation is:

> “Of the nap positions with enough data, Nap 2 has the largest qualifying increase in recorded settle time.”

Review the whole day before treating the change as isolated.

## Why a longer settle does not reveal the direction

The card’s current advice says to trim the wake window before that nap by 10–15 minutes. That may help when a baby has become overtired. But settle latency alone cannot distinguish too much wake time from too little.

A baby may take longer to fall asleep because they are:

- tired and dysregulated after a long or stimulating wake window
- not sleepy enough after a later or longer first nap
- hungry, uncomfortable, teething or unwell
- adjusting to a developmental change
- approaching a nap transition
- reacting to a different environment or routine
- simply having a variable few days

The detector does not inspect the preceding wake-window length, nap duration, mood, quality, feeds, illness, teething or age before choosing the earlier-nap suggestion. It finds a **change in settling**, not its cause.

## Recent means three calendar days, not three logged naps

Day indices 0, 1 and 2 are today, yesterday and the day before. Missing data does not make the detector pull a fourth day into the recent group.

It needs at least two qualifying records there, so the card can appear after two recent Nap 2 logs and several older ones. Today may also be incomplete when the insight runs. If it is only lunchtime, the latest Nap 3 has not happened yet, while Nap 1 and perhaps Nap 2 can already influence their groups.

The older side uses day indices 3 through 13. Unlike some of OBubba’s nap-location and personal wake-window callers, this particular caller does **not** remove days tagged as illness, teething or travel. An unusual week can therefore look like a schedule drift.

Check the dates behind the pattern before changing an ordinary-day routine.

## A safer three-day experiment

Instead of automatically moving the nap 15 minutes earlier, use the card to choose a small, reversible test.

### 1. Verify the comparison

Check that Nap 2 refers to the same part of the day across the records. Look for missing naps, nursery days, travel, illness and a changing nap count. Confirm that the settle-time ranges were entered consistently.

### 2. Read the lead-up

For a few days, note:

- when the previous nap ended
- the length and quality of the first nap
- feeds and obvious discomfort
- stimulation before the attempt
- the baby’s cues and behaviour during settling
- what eventually happened: sleep, a reset or a skipped nap

NHS guidance emphasises that babies have individual sleep patterns and that routines need to change as babies grow. Its Best Start in Life guidance encourages parents to recognise and respond when a baby is ready to sleep, feed, play or take a break.

### 3. Change one small thing

If the baby looks tired, overwhelmed or increasingly distressed before the usual time, try beginning the wind-down **5–10 minutes earlier**. If the baby is calm, alert and repeatedly plays through the attempt, a **slightly later** test may be more informative.

Keep the wind-down itself similar so you are testing timing rather than changing timing, light, feeding and settling method all at once.

### 4. Hold the test briefly

Try the small change for around three ordinary days when practical. Stop or reverse it if settling becomes more difficult, the baby is distressed or the rest of the day deteriorates. One app card never outranks hunger, comfort, illness or your knowledge of the baby.

## Is this a nap-transition signal?

It can be one clue, but it is not enough to drop a nap.

During a transition, the later nap may become difficult, drift later or interfere with bedtime. The same pattern can also happen temporarily after an unusually restorative first nap or during a developmental week.

Before removing a nap, look for a repeated cluster across ordinary days:

- the same nap is resisted or skipped
- the baby remains comfortable without it
- bedtime does not need an unsustainably early rescue every day
- total sleep and mood remain workable
- the new pattern persists rather than disappearing after illness or travel

Dropping too soon can create overtired afternoons. Keeping an unwanted nap indefinitely can push the evening later. The card identifies where to look; it does not license the transition.

![OBubba’s genuine Flutter Tomorrow’s Plan names Nap 1 and Nap 2 separately while keeping the schedule explicitly predicted and adjustable.](/obubba-tomorrows-plan-nap-transition-app.jpg "The real app preserves nap position in its plan, but the settle-drift insight is calculated from the naps actually logged—not from this predicted schedule.")

## Why this is more useful than a daily average

Imagine settle times of 10, 22 and 12 minutes. The daily average is about 15 minutes. A week later they are 10, 30 and 12—about 17 minutes overall. The two-minute daily change looks unimportant even though Nap 2 has become noticeably harder.

Grouping by position preserves that local signal. It can help a parent focus on the wake window before one nap instead of rebuilding the entire day.

That is the feature’s real value: **specificity without pretending certainty**. A timer stores the attempt; OBubba compares like with like, shows the sample and gives the parent a place to investigate.

The next product improvement should make that trust even stronger by showing the underlying dates, marking proxy ranges, checking whether other naps also drifted and offering both earlier and later hypotheses based on the surrounding evidence.

**[Explore OBubba’s personalised nap tracker →](/baby-nap-tracker.html)** — time the naps that happened, add a quick settle range and see which part of the day is changing without turning one hard nap into a verdict.

## Frequently asked questions

### Does the card mean my baby is overtired?

No. Overtiredness is one possibility. Too little sleep pressure, hunger, discomfort, development, illness and a nap transition can also lengthen settling. The detector does not distinguish them.

### Should I move Nap 2 exactly 15 minutes earlier?

Not automatically. Verify the logs and read the baby’s cues. If an earlier test fits the lead-up, start with a small reversible shift; if the baby is calm and not sleepy, a slightly later test may make more sense.

### Why does OBubba say 20 minutes when I selected a range?

The current buttons store representative values: 3, 10, 22 or 40 minutes. Averages and rounded card copy can therefore look more precise than the manual input was.

### Does a skipped nap count as a long settle?

No. Without a positive time-to-settle value, that nap does not enter the averages. But if the nap itself is not logged, later naps can move to a different position for that day.

### Can the card appear with only five naps?

Yes. One nap position needs at least five valid records overall, with at least two in the latest three calendar days and two in older days. Five is still an early personal signal, not a robust experiment.

### Does the app exclude teething or sick days?

Not in this detector’s current 14-day caller. Review unusual days before changing the routine.

## Reliable UK sources

- [NHS: Helping your baby to sleep](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/)
- [NHS Best Start in Life: Understanding your baby](https://www.nhs.uk/best-start-in-life/baby/baby-basics/bonding-with-your-baby/understanding-your-baby/)
- [NHS Best Start in Life: Helping your baby sleep](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/helping-your-baby-sleep/)
- [UNICEF UK Baby Friendly Initiative: Caring for your baby at night and when sleeping](https://www.unicef.org.uk/babyfriendly/baby-friendly-resources/sleep-and-night-time-resources/caring-for-your-baby-at-night/)

*This article provides general information for UK families. OBubba cannot diagnose overtiredness, undertiredness, illness or a nap transition from settle-time logs. Follow your baby’s cues and advice from your own health visitor, GP or clinical team.*
