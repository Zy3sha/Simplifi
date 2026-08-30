---
title: "Why Does OBubba Say ‘Mornings Are Settling Later’?"
slug: why-obubba-says-mornings-are-settling-later
description: "See how OBubba’s Flutter app compares up to 28 logged morning wakes, uses medians and stays deliberately quiet when a baby starts waking later."
date: 2027-04-12
updated: 2027-04-12
author: OBubba
tags: Mornings are settling later OBubba, baby waking later in morning, baby early waking improving, baby morning wake time tracker, baby body clock sleep, baby sleep trend app, baby sleep improvement, early rising baby, morning wake median, personalised baby sleep app, OBubba sleep insights
heroImage: /obubba-mornings-settling-later.jpg
---

For weeks, the first sound came at 5:58am. Then the mornings began at 6:17, 6:28, 6:35—not every day, but often enough that the house felt different.

OBubba may eventually surface a small positive card:

> **Mornings are settling later**

The current Flutter feature is deliberately uneventful. It does not announce a new schedule, prescribe a later bedtime or launch a seven-night experiment. It compares two groups of real morning-wake records, checks whether the newer median has moved later by at least 20 minutes and says the shift is worth noticing.

That is useful because baby apps often turn every observation into another job. Sometimes the correct product response is: **this looks better; leave it alone.**

Here is the exact calculation, why it needs more history than the code comment first suggests, what can create a false later trend and why a later clock time does not automatically mean more sleep.

## The short answer

The positive card needs all of these conditions:

| Gate | Current Flutter rule |
|---|---|
| History searched | Up to **28 recent nights** |
| Valid wake time | Morning wake from **3:00am through 11:00am** |
| Newer comparison | The **14 most recent valid wakes** |
| Older comparison | The next **6–14 valid wakes** |
| Statistic | Median wake time in each group |
| Positive shift | Newer median is at least **20 minutes later** |
| Stronger early-rising card | Must not already own the morning question |
| Result | Low-urgency **Mornings are settling later** insight, with no experiment |

Because Flutter fills the newer group with 14 valid wakes before it starts the older group, this detector actually needs at least **20 valid morning wakes**—14 newer and 6 older. It cannot fire from 12 mornings split six-versus-six.

![The exact Flutter path behind OBubba’s Mornings are settling later card.](/obubba-mornings-settling-later-logic.svg "OBubba keeps valid 3am-to-11am morning wakes from up to 28 nights, fills a 14-wake recent group, requires at least six older wakes, compares medians and celebrates a later shift of 20 minutes or more without launching an intervention.")

## It reads a trajectory, not last night

Last night alone can be deceptive. A later wake might follow a late family event, a long resettle at dawn, an unlogged feed or a clock change. A single 7:10am does not mean a 5:45am baby has transformed.

The Flutter Brain first asks for the child’s 28 recent night records. Each night is summarised by the same night-analysis layer used elsewhere in the app. The trend detector then takes only the morning-wake minute from each summary.

It does **not** use:

- total night sleep;
- bedtime;
- number or length of night wakes;
- naps from the previous day;
- feeding;
- settling method;
- room light or temperature; or
- the parent’s chosen target morning.

This makes the question narrow and inspectable: **did the recorded morning endpoint move later?** It also means the card cannot explain why.

## Why only 3:00am to 11:00am counts

Flutter drops missing wake values and anything earlier than 3:00am or later than 11:00am.

That protects the median from obvious day-grouping mistakes. A 1:20am event is more likely to be an overnight wake than the start of the day. A midday value may be a forgotten timer or a record assigned to the wrong night.

The boundary is still a product rule, not a truth detector. A family working night shifts could genuinely start a baby’s day after 11am. An older child might sleep late after travel. Those records are excluded even when accurate.

Conversely, 3:05am is technically valid for this function. The median usually prevents one extreme value from deciding the result, but several badly grouped night wakes can still move the comparison.

## The important implementation detail: it needs 20 mornings

The source comment describes two windows that each need at least six valid wakes. The executable sequence is more demanding:

1. filter all valid wake times;
2. give the first **up to 14** to the recent group;
3. skip those 14;
4. give the next up to 14 to the prior group; and
5. require at least six in both.

The prior group cannot receive anything until 14 valid wakes have already filled the recent group. The smallest possible sample is therefore:

> 14 recent + 6 prior = **20 valid mornings**

At most, 14 and 14 are compared. The evidence label can consequently say **from 20–28 nights**.

That threshold has a useful effect: the app does not celebrate from one lucky week. It also delays the payoff for a family that logs only some morning wakes. A more explicitly balanced design could compare six-versus-six earlier, but that is not what the current code does.

## Why OBubba uses medians

The detector sorts each group and takes its middle value. With an even number, it averages the two central wake times.

Imagine these recent mornings:

> 6:24, 6:29, 6:31, 6:35, 6:37, 6:40 … plus one 8:12 lie-in

The unusually late morning remains in the history, but it does not pull the median as strongly as an arithmetic average would. Most mornings need to move for the centre of the group to move.

The threshold is then:

> recent median − prior median ≥ **20 minutes**

If the old median was 6:05am and the recent median is 6:24am, the detector stays silent at 19 minutes. At 6:25am, it can speak.

There is no percentage gate and no requirement that the recent median pass 6:00am. A movement from 5:10am to 5:35am qualifies mathematically—unless the stronger established-early-rising analysis suppresses it first.

## The early-rising diagnosis gets first refusal

The Brain does not show both “why the early waking keeps happening” and “mornings are settling later” for the same record.

Before calling this trend detector, Flutter builds a more detailed early-rising analysis from up to 14 recent nights and their preceding days. From about 20 weeks, that path can activate when at least four of the last seven usable mornings began before 6:00am. It then looks for one practical lever such as day-sleep amount, first-nap timing, bedtime or fragmented nights.

If that established pattern fires, the gentler week-over-week drift note is skipped.

This ordering makes sense: a baby can improve from 5:05 to 5:30 and still have a persistent pre-6am problem the family wants help with. The app chooses the more actionable explanation instead of congratulating and correcting at once.

For younger babies, the established early-rising diagnosis is age-gated off because early feeds and fragmented mornings are normal. The positive drift function itself has no explicit age gate, so a heavily logged young baby could still earn the later-morning note. Its “maturing body clock” explanation should be read as a possibility, not a developmental conclusion.

## What appears in the app

The card includes:

- a low-urgency sleep label;
- the child’s first name;
- the recent median wake time;
- the older median wake time;
- a sample-size caption based on the valid mornings; and
- the action **Lovely**.

It honours the app’s 12-hour or 24-hour clock preference when formatting the two medians.

The insight is classified as a longer-term pattern, so it belongs in **What OBubba’s noticed** rather than repeating as a daily instruction card. Its dismissal key uses the stable title, not the rolling times in the body, so dismissing it does not make the same positive direction reappear whenever the median moves by another minute.

![A genuine OBubba Flutter What OBubba’s Noticed feed showing where longer-term sleep patterns are collected separately from tonight’s guidance.](/obubba-how-long-learn-insights-app.jpg "This genuine Flutter capture shows the pattern feed that hosts longer-term findings such as wake-time drift. The seeded example displays other insights; it demonstrates the destination rather than claiming to be a capture of this exact card.")

## Why there is no seven-night experiment

Both directions share the same internal kind: wake-time drift.

The negative sibling, **Mornings are creeping earlier**, carries an earlier-bedtime lever and can be mapped to an optional **Anchor the morning** experiment. The positive later-morning card carries no bedtime lever.

The intervention engine explicitly checks that difference. Without an earlier lever, it returns no experiment.

That prevents an absurd feedback loop in which OBubba notices a welcome later drift and then asks the parent to manipulate the schedule so it can test whether later is better. The positive result is advice-only:

> Nothing to change; just worth noticing.

This is one of the feature’s best design decisions.

## Later does not necessarily mean longer sleep

A later morning can feel wonderful and still represent several different stories:

- bedtime stayed the same and the night became longer;
- bedtime also moved later, leaving total sleep unchanged;
- a long dawn waking ended with a short resettle;
- the family began logging the final wake more consistently;
- daylight or the clocks changed;
- travel shifted the whole day; or
- childcare days and home days became mixed differently.

This detector sees none of those causes. It compares only clock endpoints.

The body copy says a later morning “often comes with a maturing body clock”. That is a plausible reframe, not something the calculation established. To know whether sleep actually lengthened, compare bedtime, time awake overnight and total sleep in the wider report.

The NHS emphasises that babies’ sleep patterns differ and change as they grow; some babies sleep longer blocks earlier than others, and teething, hunger, illness and growth can all disturb the pattern ([NHS: Your baby’s sleep patterns](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/your-babys-sleep-patterns/)).

## Disrupted days are not excluded here

Unlike some OBubba baselines, wake-time drift does not receive day tags or filter out sick, travel, nursery, daycare or grandparent days. It also does not know that the clocks moved forward or back.

That matters. If the older comparison contains a week before a time-zone trip and the recent comparison contains the week after, a 20-minute later median may describe travel rather than maturation. A daylight-saving change can move clock labels even when the baby’s biological timing barely changed.

The median resists one odd morning. It cannot correct a whole block of systematically different days.

Before treating the card as progress, ask:

1. Did bedtime remain broadly similar?
2. Did a clock change, holiday or illness divide the two periods?
3. Are morning wakes being logged more consistently now?
4. Does the baby seem rested and comfortable?
5. Is the later start workable for the family?

The answer can still be “this is a lovely improvement”. The point is to know what the graph actually supports.

## Should you wake the baby to protect the later morning?

Usually, this card itself gives no reason to wake a sleeping baby or change the schedule. It is a retrospective observation, not a target.

If the later start is comfortable and feeds, naps, bedtime and total sleep still work, keep the familiar anchors. Open curtains and begin normal daytime interaction when the day starts. NHS guidance suggests using daytime light and a simple, soothing bedtime routine to help distinguish day from night, while recognising that every baby has their own sleep pattern ([NHS: Helping your baby to sleep](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/)).

Do not delay a hungry feed to preserve a morning statistic. Do not keep a clearly tired baby awake at night in the hope of buying a lie-in. A later bedtime does not reliably create a later morning, and it may make an overtired night harder.

If a health professional has given a feeding, medication or waking plan, follow that plan rather than the insight.

## Four logging habits make the comparison cleaner

### Mark the final wake, not every dawn stir

If the baby feeds at 5:20am, resettles and wakes for the day at 6:35am, record the night wake and the true morning endpoint separately.

### Correct forgotten sleep timers

A sleep entry left running until 10:45am can create a valid-but-wrong morning value because 10:45 sits inside the detector’s allowed range.

### Keep unusual context in the record

Although this function does not exclude day tags, recording travel, illness and childcare still helps the parent interpret the card and supports other OBubba engines.

### Look at the wider night

Check whether bedtime, longest stretch and time awake overnight improved too. One positive endpoint is useful; the whole sleep story is better.

## What the feature gets right

This is a small feature with a strong product principle behind it.

It waits for substantial history. It drops implausible morning values. It uses medians instead of letting one lie-in own the story. It keeps a 19-minute grey zone silent. It gives the stronger early-rising diagnosis priority. It labels the sample size, respects the family’s clock format and refuses to manufacture a sleep experiment from a positive observation.

Its most honest translation is:

> **Across at least 20 valid morning records from the last 28 nights, the middle of the recent wake-time group is 20 minutes or more later than the middle of the older group. That looks encouraging, but the calculation does not know why it happened or whether total sleep increased.**

That is the kind of quiet intelligence parents deserve: notice the win, explain the evidence and avoid creating work where none is needed.

OBubba connects night wakes, morning endpoints, naps, feeds, development, weaning and family context in one timeline—then separates “worth noticing” from “worth changing”. [Explore OBubba](/#download) when you want a baby tracker that can celebrate progress without turning it into another rule.
