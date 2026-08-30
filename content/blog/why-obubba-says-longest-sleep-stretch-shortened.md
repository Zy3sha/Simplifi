---
title: "Why Does OBubba Say ‘The Longest Stretch Has Shortened’?"
slug: why-obubba-says-longest-sleep-stretch-shortened
description: "How OBubba compares your baby’s longest unbroken sleep across complete nights, why a shorter stretch is not a regression diagnosis, and what to do next."
date: 2027-03-24
updated: 2027-03-24
author: OBubba
tags: longest sleep stretch shortened, baby longest sleep stretch getting shorter, baby sleep regression, baby waking more at night, OBubba sleep insights, baby sleep trend, baby sleep tracker, unbroken baby sleep, baby night wakes, baby sleep app
heroImage: /obubba-longest-sleep-stretch-shortened.jpg
---

For a while your baby’s first block of sleep felt almost dependable. Then the wakes moved earlier. OBubba opens with a moon card:

> **The longest stretch has shortened**

It is very easy to read that as a verdict: the regression is here, progress has gone, or something you did has broken sleep.

**That is not what the current Flutter app knows.** It has compared the median longest unbroken block from your baby’s more recent complete nights with the median from the complete nights before them. The recent number is at least 45 minutes lower, so the app has surfaced a gentle trend—not a diagnosis and not a grade.

The sensible response is to check the baby in front of you, keep care responsive, preserve the parts of the routine that still work and look for context before changing several things at once.

![How OBubba turns complete night logs into a longest-stretch trend without diagnosing the cause.](/obubba-longest-stretch-shortened-detector.svg "The current Flutter detector uses complete nights, two medians and a meaningful-drop threshold. It cannot identify the cause of the change.")

## The short answer

The current app reviews up to 28 recent nights, newest first. It only uses a night when both bedtime and morning wake are present, because without those two anchors the longest stretch could be a misleading zero or an unfinished block.

From the usable nights it takes:

- the 14 most recent complete nights;
- up to 14 complete nights immediately before those;
- the median longest stretch in each group.

It therefore needs **at least 19 complete nights in total**: 14 recent nights and at least five earlier nights. If the recent median is **45 minutes or more shorter**, the card can appear. If the difference sits inside that threshold, this detector stays quiet.

The number shown in the card is not necessarily last night’s stretch. It is the middle of the recent group after the values are sorted. That choice makes one spectacular or dreadful night less able to hijack the story.

## A worked example

Imagine the earlier 14 complete nights have longest stretches centred around:

> 4h 40m · 4h 50m · 4h 55m · 5h · 5h 05m · 5h 10m · 5h 10m · 5h 10m · 5h 15m · 5h 15m · 5h 20m · 5h 25m · 5h 30m · 5h 40m

Their median is 5h 10m.

The 14 more recent complete nights are centred lower:

> 3h 35m · 3h 45m · 3h 50m · 3h 55m · 4h · 4h · 4h 05m · 4h 05m · 4h 10m · 4h 15m · 4h 20m · 4h 25m · 4h 30m · 4h 40m

Their median is 4h 05m. That is a 65-minute drop, so it clears the app’s 45-minute threshold.

Now replace one recent value with a particularly rough 1h 20m longest stretch. The median may still remain around four hours because the middle values barely move. OBubba keeps the rough night in the record, but it does not let that night become the entire conclusion.

| What changed | What this detector does |
|---|---|
| One night was 20 minutes shorter | Usually nothing; the two medians have not moved enough. |
| One night was dramatically shorter | Keeps it in the history, but the median resists a single outlier. |
| Recent median fell by 40 minutes | Stays quiet; it has not crossed the 45-minute drop gate. |
| Recent median fell by 45 minutes or more | Can show **The longest stretch has shortened**. |
| Fewer than 19 complete nights exist in the 28-night lookback | Shows no mature shortened-stretch trend. |
| A night has no morning wake | Leaves that night out of this comparison. |

This is deliberately different from reacting to every difficult morning.

## What counts as the “longest stretch”?

OBubba reconstructs the physical night from the bedtime side of midnight and the morning side. That matters because a 2am wake belongs to the night that began yesterday, even though the clock says it is a new calendar day.

For each complete night, the app identifies bedtime, morning wake and the wake intervals in between. The longest stretch is the biggest sleep gap:

- from bedtime to the first wake;
- between one wake ending and the next wake beginning; or
- from the final wake ending to morning wake.

If an awake duration was logged, the next stretch starts when sleep resumed—not at the instant the wake began. So a 1am wake that lasted 50 minutes cannot accidentally inflate the following block by those 50 minutes.

The analyser also handles several messy real-life cases. Near-duplicate wake and feed entries are folded so two carers logging the same event do not automatically create two wakes. A gap between two overnight sleep arcs can be treated as a real awake interval. And if a parent forgot to tap resume after an open night pause but later closed the night with a morning wake, the app does not blindly treat the baby as awake for 12 hours.

That engineering does not make the record perfect. It makes a family’s imperfect log less brittle.

## Longest stretch is not total night sleep

Two nights can contain the same total amount of sleep and very different longest stretches.

**Night A:** 7:30pm to 6:30am, with a brief wake at 1am. The longest block might be about 5½ hours.

**Night B:** the same bedtime and morning wake, but wakes at 11pm, 2am and 4:30am. The total sleep may still be similar if the baby resettles quickly, while the longest block is much shorter.

The inverse can happen too. A baby might manage one long first block and then spend a long time awake in the early hours. The longest stretch looks encouraging, but total sleep and family rest may not.

That is why OBubba’s longest-stretch card should be read beside:

- bedtime and morning wake;
- wake count;
- how long the baby was awake, when durations were logged;
- night feeds;
- naps and total daytime sleep;
- illness, teething, travel, nursery and unusual family days.

No single metric deserves to be the family’s sleep score.

## Does a shorter stretch mean a sleep regression?

No. The title describes a measured direction. It does not prove the cause.

The current card’s supporting copy suggests that short dips often accompany a developmental leap or regression and may pass. That is reassurance, not something the calculation has diagnosed. The detector does not consult a developmental calendar, examine a baby, measure discomfort or know whether a parent is feeding, rocking or resettling differently.

The NHS says babies have individual sleep patterns and that those patterns change as they grow. Growth spurts, teething and illness can affect sleep. Other ordinary explanations might include a nap transition, a different nursery day, travel, room conditions, feeding changes or simply a run of variable nights.

The honest translation of the card is:

> “Across enough complete nights to compare, the middle longest stretch is meaningfully shorter than it was before. Look at the wider context.”

It is not:

> “Your baby is definitely in a regression and this will end on a predictable date.”

## Why 19 to 28 complete nights—not 28 perfect nights?

The engine fills the recent side with 14 valid nights, then needs at least five valid nights in the earlier side. This allows a useful read before all 28 calendar nights are perfectly logged, without turning a handful of entries into certainty.

There is a trade-off. Ten valid nights can come from a longer calendar period if logging was patchy. The card compares the newest usable nights with the usable nights before them; it does not guarantee two neat Monday-to-Sunday weeks.

That makes the confidence label important. The insight carries the total number of nights used. A 19-night comparison and a 28-night comparison can both clear the rule, but the fuller history deserves more confidence.

You do not need to log perfectly. If this trend matters to you, the highest-value entries are:

1. bedtime;
2. morning wake;
3. meaningful overnight wakes;
4. awake duration when a wake became a long split rather than a quick resettle.

Missing a feed detail will not erase the longest stretch. Missing the morning anchor can make the entire night unusable for this particular comparison.

## Why there is no early “shortened” card

The Flutter app has an early version of the longest-stretch insight for new families, but it is positive-only. With 6 to 18 complete nights it can notice that the recent half has grown by at least 30 minutes and reached a genuinely consolidated two-hour median.

It does **not** announce that sleep has shortened from three or four nights. The mature negative card owns that direction only after there is enough history. This avoids greeting a family with a discouraging conclusion based on early noise.

That small product choice says something important about OBubba’s role: surface a reassuring win early when the evidence supports it; wait longer before naming deterioration.

## See the evidence, not just the notification

The current Flutter experience places noticed patterns inside the daily insight feed, then offers a wider sleep view in **Care → Reports**. That lets a parent move from a sentence to the underlying week: sleep totals, wakes and the surrounding feed or growth context.

![OBubba’s current Flutter Insights feed, where noticed patterns appear as tappable cards rather than unexplained push-notification verdicts.](/obubba-how-long-learn-insights-app.jpg "A real current Flutter screen: OBubba groups its noticed patterns in an insight feed so parents can open the context behind each read.")

The useful sequence is:

1. read the card as an observation;
2. check which nights and events changed;
3. add the human context the app cannot sense;
4. choose one proportionate response, or choose to wait and watch.

That is much more useful than a red “sleep down” badge.

**[Try OBubba free →](/app.html)** — track the night once, then let the app do the midnight joining, median comparison and context-building for you.

## What should I do tonight?

Start with care, not optimisation.

### 1. Check whether your baby is well

Look beyond sleep. Is feeding broadly normal? Are nappies as expected? Is breathing comfortable? Is your baby alert in their usual way when awake? A sleep chart should never outrank concerning symptoms or a parent’s instinct.

### 2. Keep safe sleep unchanged

Do not add pillows, positioners, cot bumpers, nests, weighted products or loose bedding in an attempt to lengthen a stretch. NHS safer-sleep guidance says the safest place for the first six months is a cot or Moses basket in the same room as you, with baby on their back on a firm, flat mattress and the sleep space clear.

If you are extremely tired, plan how to avoid falling asleep with the baby on a sofa or chair. Put the baby back in their cot before you sleep and share care where possible.

### 3. Preserve the routine that still helps

A shorter stretch is not a reason to rebuild the entire day. Keep a familiar wind-down, responsive feeding and an age-appropriate sleep opportunity. If bedtime has drifted, naps have changed or nursery days look different, note it before making a small adjustment.

### 4. Change one lever at a time

If a pattern persists and the baby is well, choose one safe, modest experiment: protect the last nap, bring an overtired bedtime slightly earlier, calm the final half-hour, or ask a partner to handle one resettle. Keep the rest reasonably stable for several nights so the result is interpretable.

Our guide to [testing one baby-sleep change for seven nights](/blog/how-long-try-baby-sleep-change-seven-night-test.html) explains how to avoid changing everything at once.

### 5. Do not rush night-weaning from this card

A shorter stretch does not show that night feeds are unnecessary. Feeding needs depend on age, growth, health, milk intake and the individual baby. If night-weaning is on your mind, use the wider readiness picture and speak with an appropriate health professional when unsure. See [Is my baby ready to night-wean?](/blog/is-my-baby-ready-to-night-wean.html).

## When should a sleep change get medical attention?

Seek advice when the sleep change comes with something concerning, when the baby seems unwell, or when your instinct says this is not their ordinary variation.

The NHS advises getting medical help for warning signs including difficulty breathing, blue, pale, blotchy or grey colour, a child who is hard to wake, feeding that is not normal and worries you, or nappies that are drier than usual. Call 999 if a child will not wake or stops breathing. Use current NHS guidance for the exact situation rather than waiting for another trend card.

For persistent sleep problems or help with routine, the NHS suggests speaking to a health visitor. OBubba can organise what happened and make the history easier to explain; it cannot assess or diagnose a baby.

## Frequently asked questions

### Why did the card appear after a better night?

Because it compares medians across groups, not last night alone. A good night can sit inside a recent run whose middle longest stretch is still at least 45 minutes below the earlier group.

### Why did my baby have a terrible night but no card appeared?

One night may not move the median. The app also stays quiet if fewer than 19 complete nights exist inside the lookback or if the median drop is under 45 minutes.

### Does “longest stretch” mean the first stretch?

Not necessarily. It is the longest uninterrupted sleep block anywhere between bedtime and morning wake. Often that is the first block, but a later block can be longer.

### Is a 44-minute drop meaningless?

No. It is simply below this detector’s speaking threshold. Thresholds stop the app narrating every small fluctuation; they do not turn the minute on one side into important and the minute on the other into unimportant.

### Can missing logs make the comparison wrong?

They can make it less representative. Nights without both bedtime and morning wake are excluded instead of counted as zero, which is safer, but a selectively logged history may still differ from family life. Check the sample label and the timeline.

### Will OBubba tell me what caused the shorter stretch?

Other insights may notice related patterns—such as teething notes, bedtime drift, nap changes or feeds travelling with wakes—but none can clinically prove the cause. The value comes from bringing several careful observations together without pretending they are an examination.

### Does a shorter stretch erase sleep progress?

No. Progress can coexist with a difficult phase. Total sleep, settle time, wake duration and family confidence may be stable or improving even when the single longest block is shorter.

## The takeaway

**The longest stretch has shortened** means OBubba found a meaningful median drop across enough complete nights. It does not mean your baby has failed, that you caused a regression or that an urgent schedule change is required.

Check the whole baby. Check the whole night. Keep sleep safe. Then use the trend for what it is good at: replacing a blur of tired mornings with one calm, testable question.

## Sources and further reading

- [NHS: Helping your baby to sleep](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/) — individual sleep patterns, ordinary night waking, routines and changes with growth, teething and illness.
- [NHS Best Start in Life: Your baby’s sleep patterns](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/your-babys-sleep-patterns/) — age-related variation and why babies should not be compared with one another.
- [NHS Best Start in Life: Safer sleep advice for babies](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/) — back sleeping, a clear cot, a firm flat mattress and avoiding sofa or chair sleep.
- [NHS: Is your baby or toddler seriously ill?](https://www.nhs.uk/baby/health/is-your-baby-or-toddler-seriously-ill/) — warning signs and when to seek urgent help.
- OBubba Flutter source reviewed for this article: `lib/core/engine/sleep_trends.dart`, `lib/core/engine/night_analysis.dart`, `lib/core/engine/brain.dart`, plus `test/sleep_trends_test.dart`.
