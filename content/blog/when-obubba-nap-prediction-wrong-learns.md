---
title: "When OBubba Gets a Nap Prediction Wrong: What It Learns Next"
slug: when-obubba-nap-prediction-wrong-learns
description: "If your baby sleeps earlier or later than OBubba predicted, learn what to do now—and how the real Flutter app turns repeated first-nap misses into a safer correction."
date: 2027-02-24
updated: 2027-02-24
author: OBubba
tags: baby nap prediction wrong, OBubba nap prediction accuracy, baby slept before predicted nap, baby not tired at nap time, nap app learning baby, personalised wake windows, baby nap tracker accuracy, predicted nap missed, adaptive baby sleep app, OBubba Flutter sleep engine
heroImage: /obubba-nap-prediction-missed-learning.jpg
---

OBubba says the nap window centres on 9:20am. At 9:05 your baby is rubbing their face into your shoulder and falls asleep during the wind-down. The next day, the app says 9:15 and your baby is still happily emptying a basket of blocks at 9:40.

Was the prediction wrong? Yes—in the ordinary sense that the baby slept at a different time. But that does not mean the parent failed, the baby is “off schedule” or every future suggestion is useless.

**Use the prediction as a preparation window, let the real baby overrule it and record the actual sleep.** One miss should change today’s plan, not trigger a new routine. A repeated, similar miss is more useful: OBubba’s current Flutter app can learn a bounded timing correction from recent first naps.

The important question is not “Did the app hit the exact minute?” It is “Did the window help us prepare, and does the same early-or-late pattern keep repeating?”

## The short answer

When the prediction and baby disagree:

1. **Follow clear sleepy behaviour.** Do not keep an exhausted baby awake to satisfy the clock.
2. **Do not force a bright-eyed baby to sleep.** Keep things calm and try again after a short pause.
3. **Check the awake anchor.** A wrong or missing morning wake can move the whole forecast.
4. **Record the actual nap start and end.** The miss becomes useful only when the real outcome is preserved.
5. **Look for direction, not perfection.** Three minutes early one day and seven minutes late the next is ordinary variation. Repeated 20-minute lateness is a learnable pattern.

The NHS emphasises that babies differ and that their sleep patterns change as they grow. A prediction should therefore support observation, not replace it.

| What happened | Best response now | What the history may teach |
|---|---|---|
| Baby sleeps 8 minutes before the midpoint | Start the nap and log reality | Probably within normal forecast spread |
| Baby is content 25 minutes after the window | Pause the attempt; check anchor and cues | Repeated lateness may justify a later correction |
| Baby crashes well before the window after a broken night | Offer sleep; protect recovery | This may be disruption, not a new baseline |
| Prediction is suddenly an hour out | Check forgotten timers, car dozes and morning wake | Bad input can create a bad comparison |
| Several ordinary first naps start about 20 minutes late | Keep logging comparable days | The calibrator can shift the base window later |
| Baby is unusually sleepy, difficult to wake or unwell | Assess the baby, not the schedule | Seek medical advice rather than training the model |

![How OBubba turns repeated first-nap misses into a bounded timing correction.](/obubba-nap-prediction-calibration-flow.svg "The current Flutter calibrator compares a reconstructed base prediction with the first nap's actual start, weights recent misses more, trims one extreme miss from the offset and caps the correction at 40 minutes.")

## What “accurate” means inside the app

OBubba does not require a nap to begin at one exact minute.

The calibration code uses the midpoint of the reconstructed nap window and treats an observation as accurate when the actual first nap begins within **15 minutes either side** of that midpoint after the learned correction is applied.

That definition is intentionally practical:

- a predicted midpoint of 9:20 and actual sleep at 9:12 qualifies;
- actual sleep at 9:34 also qualifies;
- actual sleep at 9:42 does not qualify for that accuracy calculation; and
- the displayed window may still have been useful even when the midpoint test misses.

The percentage is therefore **not the probability that the next nap will happen**. It is the share of recent reconstructed first-nap comparisons that landed within the code’s ±15-minute tolerance after calibration.

## A worked example

Suppose the base engine would have placed the first-nap midpoint at 9:00 on six recent days.

| Day | Reconstructed midpoint | Actual first nap | Error |
|---|---:|---:|---:|
| 1 | 9:00 | 9:18 | +18 min |
| 2 | 9:00 | 9:22 | +22 min |
| 3 | 9:00 | 9:15 | +15 min |
| 4 | 9:00 | 9:20 | +20 min |
| 5 | 9:00 | 11:10 | +130 min |
| 6 | 9:00 | 9:17 | +17 min |

Five days tell a coherent story: this baby’s first nap tends to start about 15–22 minutes later than the uncorrected midpoint. Day 5 looks unlike the rest—perhaps there was an unlogged car doze, an unusual outing or a data error.

With five or more valid records, the Flutter calibrator removes the single largest absolute miss **from the offset calculation**. It keeps the remaining days in time order, gives newer observations more weight and learns an adjustment of about **+18 minutes**.

A fresh raw midpoint of 9:00 can therefore move to about 9:18.

The extreme day is still included in the reported accuracy. Five of all six comparisons land within ±15 minutes after the +18-minute correction, so accuracy is about **83%**. That is a thoughtful distinction: the outlier cannot drag tomorrow’s timing wildly later, but it still prevents the app from claiming perfect performance.

## How the real Flutter calibration works

We traced `prediction_learning.dart`, the Track prediction caller, notification scheduling, the Brain insight and focused tests.

### 1. It retrospectively reconstructs a first-nap forecast

For each of up to 21 prior days, the learner finds that day’s earliest completed nap. It then asks what the base prediction engine would have said using only entries timestamped before that nap began.

The comparison is:

> actual first-nap start − reconstructed predicted midpoint

A positive error means the baby slept later than predicted. A negative error means earlier.

The learner is self-supervising: it does not need a parent to press “correct” or rate the forecast.

### 2. It needs four samples before applying anything

The `Calibration.isLearned` gate requires at least **four valid observations**. With fewer, `applyCalibration` returns the raw prediction unchanged.

This prevents yesterday’s strange morning from becoming tomorrow’s rule.

### 3. It trims one extreme miss once five records exist

At five or more valid records, the code identifies the single error with the largest absolute size and leaves it out of the offset calculation.

Only one is trimmed. A history containing several chaotic or mislogged mornings can still affect the correction, which is why accurate start and wake anchors matter.

### 4. Newer mornings count more

The remaining errors are averaged with linear recency weights: the oldest receives weight 1, the next 2 and so on.

That lets a maturing baby’s recent behaviour pull the correction gradually in a new direction. The code contains a regression test specifically protecting the chronological order after outlier removal; an earlier implementation accidentally weighted the surviving errors by size rather than recency.

### 5. The correction cannot exceed 40 minutes

The learned offset is capped at **−40 to +40 minutes**.

If poisoned history suggests that the baby always sleeps two hours earlier, the app does not blindly move the next window by two hours. Learning refines the age-aware engine; it does not gain unlimited authority over it.

### 6. The clock and reminder use the same shift

The Track clock applies the correction to both ends of the raw nap window. Notification scheduling mirrors that correction so the wind-down reminder, widget timing and main clock do not disagree.

The reminder is tied to the calibrated window opening, while the visible countdown uses the calibrated midpoint. If a nap is already running, the reminder is dropped rather than arriving late.

### 7. It avoids double-personalising premium predictions

The richer predictor can already use a personal, per-position wake-window blend. Applying the first-nap calibration on top of that would count the same individual difference twice.

So when the live result reports that it already used the personal blend, both Track and reminder scheduling skip this extra offset.

That guard is subtle and important. More personalisation is not automatically better when two layers learned from overlapping evidence.

## Why the “I’ve learned your rhythm” card appears

The Brain recalculates the same calibration from prior days. It adds the **“I’ve learned [baby’s] rhythm”** card only when:

- the learner has at least four observations; and
- at least 75% of all clean comparisons fall within ±15 minutes after the offset.

The card’s dismissal key is stable, so it is designed as a one-time confidence moment rather than a notification that returns whenever accuracy changes by one percentage point.

That makes the celebration gentle. But the label needs the scope explained.

## The current accuracy claim is narrower than it sounds

The card says **“My nap-time predictions are now about X% accurate”**. The underlying calculation is narrower:

- it evaluates only the **first completed nap** on each eligible day;
- it reconstructs what the **base engine spine** would have predicted retrospectively;
- it does not compare every displayed Nap 2, Nap 3 or bedtime forecast;
- it does not store and score the exact live prediction a parent saw at that moment; and
- it applies the baby’s current age band while rebuilding recent days.

So 83% does not mean 83% of every forecast on the screen landed within 15 minutes. It means 83% of the reconstructed first-nap records met that tolerance after the learned offset.

That is still useful evidence, because the first nap usually has the cleanest morning-wake anchor. It should simply be labelled more precisely. A future version could store the actual displayed window and model version at prediction time, then report accuracy by nap position.

Trust grows when a number says exactly what it measured.

## A second limitation: disruption tags are not fully wired into this path

The retrospective learner calls the shared baseline-exclusion function for every day. A plausible fever temperature inside that day’s entries is excluded.

The exclusion function also supports manual day tags such as Sick, Travel, Daycare, Nursery and Grandparents—but the current calibration callers pass only the entry lists, not those separate day-tag values.

That means a manually tagged travel or nursery day can still enter this particular free-tier calibration unless another entry-based exclusion catches it. The one-outlier trim and ±40-minute cap reduce the damage, but they do not make the gap disappear.

Other Flutter learners do pass day tags correctly. This calibration path should eventually do the same so “not a normal day” means the same thing across the app.

For now, read a sudden correction after a disrupted week cautiously. Keep logging ordinary mornings and the recency weighting can pull the offset back towards the current pattern.

## Why a useful prediction can still miss

No timestamp model observes everything.

### The anchor was wrong

If the baby woke at 6:35 but the record says 7:05, a nap forecast based on time awake can start half an hour late. A forgotten open timer can create the opposite problem.

### A doze was not logged

Ten minutes in the car or feeding drowsily may reduce sleep pressure even if it never became an official nap in the history.

### Today is not a baseline day

Illness, teething, travel, childcare, a growth spurt or a highly fragmented night can change readiness without establishing a permanent routine.

### The baby is changing

Nap transitions, new mobility and ordinary maturation can move sleep needs. Recency weighting helps, but the learner can only update after the new pattern appears in actual logs.

### Readiness is not only time

Light, noise, feeding, activity and temperament affect whether a baby can settle. The model predicts an opportunity, not sleep onset as a mechanical event.

![The genuine OBubba Flutter Tomorrow’s Plan labels wake, Nap 1, Nap 2 and bedtime as predicted rather than presenting them as completed facts.](/obubba-tomorrows-plan-nap-bedtime-prediction.jpg "OBubba’s current native Flutter plan distinguishes predictions from history and says the day updates as it unfolds. The retrospective accuracy layer is separate and currently evaluates first naps only.")

## How to help OBubba learn without serving the tracker

Prioritise the few boundaries that change the calculation:

1. **Log the true morning wake.** This is the strongest first-nap anchor.
2. **Start the nap when sleep begins.** Do not backdate it to the beginning of a 25-minute wind-down.
3. **End the nap when sleep ends.** Correct a forgotten timer.
4. **Record tiny accidental sleeps when they materially change the day.** You do not need to log every blink.
5. **Use unusual-day tags anyway.** They help other baselines even though this specific calibrator currently misses the tag input.
6. **Let the baby win.** Never keep a tired baby awake to make tomorrow’s model cleaner.

**[Try OBubba’s adaptive nap tracker free →](/baby-nap-tracker.html)** — get a useful age-aware starting window, then let real sleeps refine the timing without turning the day into a rigid schedule.

## Use the window as a conversation, not a command

If the window arrives and your baby looks ready, begin the familiar wind-down.

If they are calm and alert, reduce stimulation and give the attempt a little space. A short pause is not “missing the nap”. If they become clearly tired earlier, offer sleep earlier.

Judge the app over comparable mornings:

- Did it give enough warning to feed, change and dim the room?
- Was the actual start usually inside or near the range?
- Did misses lean consistently early or late?
- Did an unusual week distort the pattern?
- Did following the suggestion make family life calmer?

Prediction quality is a family outcome, not only a percentage.

## When sleepiness needs medical attention

Do not treat unusual drowsiness as proof that the nap forecast needs an earlier offset.

Seek urgent medical advice if a baby is difficult to wake, unusually floppy, breathing differently, feeding much less, has concerning colour, has fewer wet nappies or seems significantly unlike themselves. Follow any individual advice from your midwife, health visitor, GP, neonatal team or paediatric service.

## Safer sleep outranks the forecast

The prediction never changes the sleep setup. The NHS advises placing babies on their back in a clear cot or Moses basket with a firm, flat mattress. For at least the first six months, the safer place is in the same room as you.

Do not add a pillow, wedge, nest or positioner because a nap is late or difficult. A schedule miss is not a reason to compromise the sleep space.

## Frequently asked questions

### How far wrong must a prediction be before OBubba notices?

Every valid first-nap error can enter the calibration, but no correction is applied before four observations. Reported accuracy treats actual starts within ±15 minutes of the corrected midpoint as accurate.

### Does one terrible nap change tomorrow’s time?

With fewer than five records, it can influence the mean but the correction remains capped. At five or more, the single largest absolute miss is removed from the offset calculation. The day still counts in the reported accuracy.

### Why does the app learn only from Nap 1 here?

The current retrospective method can rebuild Nap 1 from the morning anchor without accidentally peeking at later naps. Later positions are handled by other personal wake-window layers, but they are not part of this accuracy percentage.

### Does 80% accuracy mean an 80% chance baby will nap?

No. It means 80% of the evaluated first-nap comparisons landed within ±15 minutes after the learned correction. It is not a probability of sleep or a guarantee for today.

### Should I wait until the predicted minute when my baby is already tired?

No. Follow the baby. The forecast is a preparation aid, not permission to withhold sleep.

### Why did the correction disappear on Premium?

It may not have disappeared. When the richer live prediction already uses a personal per-position blend, Flutter deliberately skips the separate spine-based offset to avoid double-counting the same personal difference.

### Can I reset a bad learned offset?

There is no parent-facing calibration reset in this code path. Correct inaccurate logs and continue recording ordinary first naps; newer observations receive more weight. The ±40-minute cap limits how far the offset can move.

## Sources and further reading

- [NHS Best Start in Life: Your baby’s sleep patterns](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/your-babys-sleep-patterns/)
- [NHS: Helping your baby to sleep](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/)
- [NHS: Sudden infant death syndrome (SIDS)](https://www.nhs.uk/baby/caring-for-a-newborn/sudden-infant-death-syndrome-sids/)
- OBubba Flutter source reviewed: `prediction_learning.dart`, `prediction_learning_test.dart`, `predict_nap.dart`, `track_home.dart`, `reminder_schedule.dart`, `brain.dart`, `brain_insight.dart` and `optimal_ww.dart`

*OBubba is a tracking, planning and education tool, not a medical device. Nap predictions are estimates, not instructions. The app cannot observe sleepiness, diagnose illness, assess breathing or guarantee when a baby will sleep. Follow safer-sleep guidance, your baby’s cues and any individual clinical plan.*
