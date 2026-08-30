---
title: "Why Does OBubba Say ‘Awake Stamina Is Growing’?"
slug: why-obubba-says-awake-stamina-is-growing
description: "See exactly how OBubba compares your baby’s first wake window across two fortnights, why both 20 minutes and 15% matter, and how to use the insight without chasing a clock."
date: 2027-04-09
updated: 2027-04-09
author: OBubba
tags: OBubba awake stamina is growing, baby wake windows getting longer, first wake window baby, wake window tracker app, baby sleep maturation, personalised baby sleep app, baby nap prediction, baby sleep patterns, first nap timing, wake window by age, OBubba sleep insights, baby sleep tracker
heroImage: /obubba-awake-stamina-growing.jpg
---

One morning your baby is happily rolling, reaching or babbling long after the time when you used to begin the first nap. The next morning is different. Then, after a few weeks of logging, OBubba surfaces a small sprout and says:

> **Awake stamina is growing**

This is not a wake-window chart being applied to your baby. The current Flutter feature looks only at your baby’s own logged mornings. It measures the gap from morning wake to the first completed daytime nap, compares two fixed 14-day periods and speaks only when the middle recent value has increased by at least 20 minutes **and** 15%.

That makes it a useful observation. It does not make it proof that your baby was comfortable, that every day should now stretch, or that a later nap caused better sleep.

Here is exactly how OBubba earns the sentence—and how to use it as permission to notice rather than pressure to perform.

## The short answer

Every gate below must pass:

| Gate | Current Flutter rule |
|---|---|
| Age | **8 through 78 weeks**, inclusive |
| Lookback | Up to **28 calendar days**, with today first |
| Daily measurement | Earliest non-night wake → start of first completed daytime nap |
| Plausible range | At least **45 minutes**, no more than **7 hours** |
| Recent group | Calendar days 0–13; at least **5 measurable days** |
| Prior group | Calendar days 14–27; at least **5 measurable days** |
| Summary value | The sorted value at index `length ÷ 2` in each group |
| Change needed | Recent value is at least **20 minutes longer** **and** at least **15% longer** |
| Direction | Positive lengthening only; flat or shorter stays silent |
| Card | Low urgency, shown as a long-term pattern in **What OBubba noticed** |

![The exact Flutter decision path behind OBubba’s awake-stamina insight.](/obubba-awake-stamina-detector.svg "OBubba measures each valid day from morning wake to the first completed daytime nap, compares the prior and recent calendar fortnights, requires at least five usable days in each, and surfaces the pattern only when the recent middle value is both 20 minutes and 15% longer. It measures timing, not comfort or cause.")

## One day contributes one very specific number

For each date, the detector tries to calculate:

> **first daytime nap start − morning wake time**

The morning anchor is the earliest record whose type is `wake`, is not marked as a night wake and has a time. If no such record exists, OBubba falls back to the earliest end time from a completed `sleep` entry.

The first nap is not a suggested nap or a timer that was merely opened. It comes from the app’s completed daytime nap list. A nap must have a start, an end and a duration of at least five minutes. Day naps are sorted by start time, so the earliest qualifying one supplies the nap onset.

That distinction matters: the detector compares what was logged as happening, not the time the prediction clock proposed.

It also means the quality of the source log matters. A brief 5:45am wake recorded as the start of the day, followed by a real 7:10am morning rise that was not logged, makes the measured first wake window 85 minutes longer than the family probably intended. If a night’s final sleep segment is missing and the fallback chooses an unrelated sleep end, the anchor can be misleading too.

OBubba rejects a calculated gap shorter than 45 minutes or longer than seven hours. That catches some obvious mistakes; it cannot identify every plausible-looking one.

## The two groups are fixed calendar fortnights

The Brain requests 28 dates, most recent first:

- **recent:** today and the previous 13 calendar days;
- **prior:** the 14 calendar days before that.

An unmeasurable date is skipped inside its original group. It does not pull an older day forward to fill the hole. This is a good design choice because “over the last few weeks” remains a real calendar comparison even when nursery handovers, travel or ordinary life leave gaps in the diary.

Each side needs at least five usable first wake windows. Four recent measurements and twelve prior measurements are not enough. Five and five are enough.

The evidence caption then adds both group sizes. With five usable days in each, the card says **from 10 days**. With nine and eleven, it says **from 20 days**. It is a count of measurable logged dates—not 10 complete diaries and not 10 consecutive days.

## “Middle” has a precise meaning in this detector

OBubba sorts each group’s wake-window lengths and picks the item at integer index `length ÷ 2`.

With five values, that is the familiar middle item:

> 90, 100, **110**, 120, 130 → 110 minutes

With an even number, the current code chooses the upper of the two middle values rather than averaging them:

> 90, 100, **110**, 200 → 110 minutes

A conventional statistical median there would be 105 minutes. The difference is usually small, but this exactness matters near the threshold. The card’s “about” wording is appropriate because the number is a robust summary of logged mornings, not a precise biological limit.

## Why OBubba requires both 20 minutes and 15%

The recent middle value must clear two gates simultaneously.

### Gate 1: at least 20 minutes longer

A move from 1h 40m to 1h 52m is 12% longer, but only 12 minutes. No card.

### Gate 2: at least 15% longer

A move from 3h to 3h 20m is 20 minutes longer, but only about 11%. No card.

Both are necessary. These examples would qualify:

- 1h 40m → 2h: **+20 minutes and +20%**;
- 2h → 2h 30m: **+30 minutes and +25%**;
- 3h → 3h 27m: **+27 minutes and +15%**.

That dual threshold stops a small number of minutes looking dramatic for a short-window baby and stops a fixed 20-minute change looking equally meaningful at every starting point.

The detector has no mirror-image “awake stamina is shrinking” card. Flat and shorter recent windows simply return nothing from this feature. Other insights may explain a disrupted day, but this particular sentence is reserved for a positive trajectory.

## What the app actually says

If the prior middle was 1h 50m and the recent middle was 2h 30m, the card body uses the baby’s first name:

> **Oliver’s first wake window has stretched from about 1h 50m to 2h 30m over the last few weeks.**

If the profile name is blank, it uses “Baby.” The card carries low urgency and the evidence count described above.

This is classified as a long-term pattern. It folds into **What OBubba noticed**, rather than repeating as one of today’s guidance cards. That separation is sensible: maturation is context for the family’s evolving rhythm, not an instruction that must be completed today.

![A genuine OBubba Flutter screen showing the What OBubba noticed feed where longer-term patterns are collected rather than repeated as daily instructions.](/obubba-how-long-learn-insights-app.jpg "This genuine app screen shows the analysis home used for OBubba’s multi-day patterns. Awake-stamina growth belongs here because it is a retrospective comparison across weeks, not a command to extend today’s first wake window.")

## The useful interpretation: your old clock may be becoming less useful

The best reading is modest:

> Across enough logged mornings, the timing of the first nap has shifted later relative to morning wake.

That can be reassuring. The NHS notes that every baby is different and that sleep patterns change as babies grow. A personal trend can therefore be more useful than comparing one child with a generic chart ([NHS: Your baby’s sleep patterns](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/your-babys-sleep-patterns/)).

The insight can help a parent notice that the old automatic routine—“start winding down at 8:45 because that used to work”—may deserve a fresh look. It can also explain why a previously reliable nap prediction is evolving: the baby’s own recent history has changed.

But the measured finding is timing. The current detector does **not** check:

- mood during the awake period;
- yawning, eye rubbing, zoning out or other tired cues;
- how long settling took;
- whether the first nap was restorative;
- total daytime sleep or the rest of the day’s nap spacing;
- illness, teething, travel or nursery days;
- whether a parent deliberately kept the baby awake; or
- whether the longer window improved that night.

For that reason, the card’s supporting language that the baby can “comfortably handle” longer awake time is more confident than the underlying data. Comfort is something the caregiver observes; the timer does not.

## Do not turn the insight into a new minimum

Suppose the card reports a shift from 1h 50m to 2h 30m. It is tempting to treat 2h 30m as tomorrow’s earliest permitted nap.

That is not what the calculation establishes.

It says the recent group’s middle logged value is around 2h 30m. Some recent mornings were shorter. Some were longer. Today may include an early start, a poor night, a vaccination, illness, unusual stimulation or simply a baby who is ready sooner.

Use the number as a wider area to observe, not a finish line:

1. Begin watching a little before the old nap time.
2. Look at your baby’s engagement and tired cues alongside the clock.
3. If they are content, allow the morning to unfold rather than rushing purely because the old time arrived.
4. If they are struggling, offer sleep; the trend is not a reason to push through distress.
5. Log the real nap start and end so the next comparison reflects what actually happened.

The NHS similarly advises families to be prepared for routines to change as babies grow and move through different stages ([NHS: Helping your baby to sleep](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/)).

## Three logging habits make this insight more trustworthy

### 1. Make morning wake mean the start of the day

If your baby stirs, feeds and resettles at 5:30am, avoid leaving that brief event as a non-night morning wake when the day actually began at 7am. Correcting the anchor is more important than making the diary look continuous.

### 2. Finish the first nap timer

The nap needs both a start and an end to enter the completed daytime nap list. An open timer does not become a sample for this detector. A start-stop mistake under five minutes is excluded.

### 3. Record atypical context for yourself

The calculation does not remove illness, travel or nursery days. A note can help you interpret the card later, even though the detector itself does not read that context here. If the two fortnights straddle a holiday or a childcare change, treat the trend as a prompt to investigate, not a clean experiment.

You do not need a perfect 28-day diary. The feature is deliberately willing to work with five valid mornings on each side. You do need enough accurately anchored mornings for the middle values to mean what the title suggests.

## Why the age gate deserves plain language

The current Flutter implementation accepts ages from 8 through 78 weeks inclusive. At 79 weeks it stays silent. The source comment describes this as “roughly the first year,” but 78 weeks is about 18 months, so the executable rule is broader than that comment.

That is worth knowing because an eight-week-old and an eighteen-month-old have very different days. The same mathematical detector runs for both. The result should never override feeding needs, health advice, safe sleep or the caregiver’s knowledge of their child.

If sleep is persistently difficult or you need help establishing a routine, the NHS advises speaking with a health visitor. For every nap, safer-sleep guidance still applies: for the first six months, the safest place is a cot or Moses basket, on the back, in the same room as the caregiver, with the sleep space clear and the mattress firm and flat ([NHS safer sleep advice](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/)). No wake-window trend changes those basics.

## A worked 28-day example

Imagine the prior fortnight has these seven usable first wake windows:

> 95, 100, 105, **110**, 115, 120, 130 minutes

Its middle value is 110 minutes, or 1h 50m.

The recent fortnight has six usable values:

> 125, 135, 145, **150**, 155, 165 minutes

Because there are six values, Flutter chooses the upper middle: 150 minutes, or 2h 30m.

The gain is:

> 150 − 110 = **40 minutes**

The percentage gain is:

> 40 ÷ 110 × 100 = **36.4%**

There are at least five samples in each fixed fortnight. The gain clears both 20 minutes and 15%. The insight appears with an evidence caption of **from 13 days**.

Now change only the recent middle to 130 minutes. The increase is 20 minutes and 18.2%, so it still qualifies.

Change it to 127 minutes. That is a 15.5% rise, but only 17 minutes. It stays silent.

That is the detector in full: enough real mornings, a fixed calendar comparison and two meaningful-change gates.

## What OBubba knows—and what remains yours

OBubba knows the timestamps you logged. It can find a shift hidden inside a month of interrupted mornings, express it in familiar hours and minutes, and keep that pattern available in the app’s analysis feed.

You know whether your baby was cheerful or fading, whether the morning wake was real, whether nursery changed the routine, and whether the later nap made the day gentler.

The strongest version of this feature joins those two forms of knowledge:

- let the app notice the long arc;
- let the caregiver interpret the day in front of them;
- let tired cues outrank an old clock;
- and let one early nap be just one early nap.

That is what **Awake stamina is growing** can offer at its best: not a stricter schedule, but evidence that the schedule may be allowed to grow with the baby.

OBubba turns everyday sleep, feeding and care logs into personalised patterns, predictions and gentle next steps. [Explore OBubba](/#download) when you want an app that learns the baby in front of you—not an imaginary average baby.
