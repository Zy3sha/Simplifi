---
title: "Why Does OBubba Show ‘Your Wins This Week’?"
slug: why-obubba-shows-your-wins-this-week
description: "See exactly when OBubba’s Parent Room celebrates fewer wakes or more sleep—and why missing logs, tiny changes and one good night stay quiet."
date: 2027-05-05
updated: 2027-05-05
author: OBubba
tags: OBubba Your wins this week, baby sleep progress, weekly baby sleep comparison, fewer night wakes, baby sleep tracker, Parent Room, honest baby tracking, baby sleep trends
heroImage: /obubba-your-wins-this-week-parent.jpg
---

You open OBubba’s Parent Room after a difficult night and see a small card:

> **Your wins this week**  
> *Night wakes down to 1.8/night (from 2.6).*

It can feel wonderfully validating—but what earned it? Did the app decide you had been a “good” parent? Did one unusually calm night trigger a celebration? And why does the card sometimes disappear?

**The short answer:** “Your wins this week” is a private, data-backed comparison of the latest seven calendar days with the seven before. It only appears when OBubba finds at least one change large enough to clear a fixed threshold with enough matching logs on both sides. It is not a streak, score, award or promise that sleep is solved.

![A tired parent quietly noticing progress on their phone while their baby sleeps on their back in a clear separate cot.](/obubba-your-wins-this-week-parent.jpg "A weekly win should feel like a quiet exhale, not a performance target.")

## Where the card appears

Open **Care → Parent Room**. When the current Flutter app can support a genuine positive comparison, **Your wins this week** appears near the top of the page, before **A kind word**.

The position is deliberate. Reports is where a parent can inspect the wider numbers; Parent Room is where the app reflects back up to three concrete things that improved.

![The real OBubba Flutter Parent Room with a time-aware welcome, kind word and private parent check-in. In this example no weekly win has cleared the display rules, so the wins card is absent.](/obubba-parent-room-app.jpg "The current Flutter Parent Room does not reserve an empty or guilt-inducing space when there is no defensible weekly win.")

Notice something useful in this real app capture: there is **no blank wins panel**. If there is too little data or no qualifying improvement, the widget shrinks away completely. OBubba does not turn “nothing to celebrate statistically” into “you failed this week”.

## The exact Flutter logic behind a weekly win

OBubba builds two fixed windows:

- **this week:** today and the previous six calendar days
- **the comparison week:** the seven calendar days before that

It then calculates separate evidence gates for night wakes, daytime sleep and total 24-hour sleep. A general “two days logged” check allows the weekly digest to exist, but each win has stricter requirements of its own.

![A visual map of the three evidence paths that can produce OBubba's Your wins this week card.](/obubba-your-wins-week-logic.svg "Each metric needs matching real data in both seven-day windows and a meaningful minimum change. Missing logs never become zero.")

| Possible win | Data needed in both weeks | Change needed |
|---|---:|---:|
| Fewer night wakes | At least 2 nights with night data in each week | Average falls by **0.5 wake/night or more** |
| More daytime sleep | At least 2 nap days in each week | Average rises by **20 minutes/day or more** |
| More total sleep | At least 5 days in each week with both night sleep and at least one nap | Average rises by **30 minutes/day or more** |

The Parent Room takes at most the first three win lines. There is no fourth badge to unlock and no escalating reward animation.

## What counts as a night-wake win?

The code subtracts this week’s average night wakes from the earlier week’s average. If the result is at least **0.5**, it can produce a line such as:

> Night wakes down to 1.8/night (from 2.6).

Both windows need at least two nights containing real night data. A week of naps and feeds with no nights is not interpreted as zero night wakes. That distinction matters because “not recorded” and “did not happen” are not the same fact.

The comparison is an average over contributing nights, not a verdict on every night. A rough Tuesday can sit inside a week that is steadier overall. Equally, one calm Saturday cannot create a win when the rest of the comparison is missing.

## What counts as a daytime-sleep win?

Daytime sleep must rise by about **20 minutes per nap-logging day**. Both weeks need at least two days with nap data.

OBubba averages daytime sleep over days that actually contain day-sleep information, rather than diluting it across every day where the app happened to contain a feed or nappy. It also excludes a partly completed today from ordinary per-day averages when there are other completed logged days available.

That means opening the app at 10am—before later naps could happen—should not make today look like an abnormally short-sleep day.

This line is descriptive, not a target. More daytime sleep is not automatically better for every age or situation; here it is simply one upward week-over-week movement the current digest labels as a win.

## Why total sleep has the highest evidence bar

Total sleep combines night sleep and naps, so a half-logged day can distort it badly. The Flutter engine therefore requires at least **five qualifying days in each week**, and every qualifying day needs both:

- real logged night sleep
- at least one logged nap

Only an increase of about **30 minutes a day or more** creates the total-sleep win.

An evening-to-morning sleep arc is not blindly treated as uninterrupted sleep. Where timed night wakes were logged inside that arc, the engine deducts their awake duration. Overlapping sleep arcs are merged so two parents recording the same stretch do not double the sleep total; near-simultaneous duplicate wake records are also de-duplicated.

Those safeguards cannot repair forgotten logging, but they prevent several common forms of accidental over-counting.

## Why the card may have disappeared

The simplest explanation is that no current change clears all three parts of its rule:

1. enough data this week
2. enough comparable data in the earlier week
3. a change large enough to stay above ordinary noise

The card can therefore disappear when:

- there is only one logged day this week
- nights were logged this week but not the week before
- naps were recorded in one window and omitted in the other
- wakes improved by 0.4 per night rather than the required 0.5
- daytime sleep rose by 15 minutes rather than 20
- total sleep rose, but fewer than five complete night-plus-nap days support either week
- the week was steady rather than measurably better
- the only changes were downward or “watch” signals

The last point is especially important. Parent Room’s wins card uses the positive `wins` list. It does not repurpose a bumpier-week warning as a negative achievement card. The fuller weekly view lives in **Care → Reports**, where context and summaries belong.

## Does the card reward logging more often?

Not directly. There is no win for tapping the app seven days in a row.

Logging more consistently makes a comparison possible, but OBubba still needs an actual qualifying change. Fourteen beautifully complete yet steady days can produce no Parent Room win at all. Conversely, the night-wake path can speak with two nights in each window if the average change clears the threshold.

That is a healthier boundary than a generic streak: the parent is not asked to manufacture data, keep an app-open chain alive or delay care to protect a badge.

## Is a win the same as “the sleep plan worked”?

No. The card establishes a narrow observation, not a cause.

If night wakes fell after you changed bedtime, the logs show that the two events occurred in the same period. They do not prove the bedtime change caused the improvement. Feeding changes, illness recovery, development, travel, nursery days and ordinary variation can all sit in the same two-week window.

The NHS notes that every baby has their own waking and sleeping pattern and that patterns change as babies grow; growth spurts, teething and illness can all affect sleep. That is why a weekly comparison is more useful as a prompt to notice and reflect than as a verdict on a method.

Use a win like this:

> “Wakes were lower across the nights we logged. What else was similar on those nights?”

Avoid turning it into this:

> “The app says we won, so we must keep doing everything exactly the same.”

## A two-minute review when the card appears

Before changing anything, ask:

1. **Which metric improved?** Fewer wakes, more daytime sleep or more total sleep?
2. **How much real data supports it?** Check whether both weeks were logged in roughly the same way.
3. **What context changed?** Think about illness, feeds, nursery, travel, teething and nap transitions.
4. **What is worth preserving?** Keep one sustainable part of the routine rather than copying an entire “perfect” day.
5. **Does the baby in front of you seem well?** A positive trend never overrules feeding, breathing, hydration, pain or developmental concerns.

If you want the wider picture, open **Care → Reports**. If you want to understand why one rough night can hide progress, read [Is my baby’s sleep actually improving? Compare weeks, not nights](/blog/is-baby-sleep-improving-compare-weeks-not-nights.html).

## What this feature says about OBubba

Many trackers are eager to congratulate. OBubba’s better choice is knowing when to stay quiet.

The current Flutter implementation:

- compares the baby with their own earlier week, not another baby
- requires metric-specific data on both sides
- treats absent logs as absent, not zero
- ignores small movements below fixed thresholds
- keeps the card out of view when no positive comparison is defensible
- states the measured change without claiming a cause or diagnosis

That is the useful kind of encouragement: specific enough to trust, gentle enough not to become another standard a tired parent must meet.

**[Try OBubba free →](/app.html)** — track sleep, feeds, nappies, weaning and development, then let the app surface the changes that are genuinely supported by your family’s own record.

## Frequently asked questions

### Why do I have lots of logs but no weekly win?

The relevant metric may not have enough matching data in both seven-day windows, or the change may be below its threshold. General activity in the app does not substitute for real night data when comparing wakes or complete night-plus-nap days when comparing total sleep.

### Can one excellent night trigger the card?

Not by itself. The night-wake comparison needs at least two nights with real night data in each week and uses their averages.

### Does “day sleep up” mean my baby should nap more?

No. It means the logged average rose by at least 20 minutes per nap day compared with the previous week. Interpret that alongside age, night sleep, behaviour and any professional advice.

### Why does the card not celebrate feeds or nappies?

The current weekly win list only adds qualifying changes in night wakes, daytime sleep and total sleep. Feed averages can appear in a weekly summary when feeds were logged, but they do not create this Parent Room win.

### Will a rough night remove an existing win immediately?

The calculation uses rolling calendar windows, so each new day can change the averages and which records sit inside each week. A single rough night may reduce the difference, but it does not automatically erase a genuinely supported week-level improvement.

### Is the weekly win medical advice?

No. It is a private summary of home-entered logs. Seek professional advice if you are worried about your baby or about your own ability to cope, whatever the card says.

## Source and product verification

- [NHS: Helping your baby to sleep](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/)
- OBubba Flutter source reviewed for this article: `weekly_digest.dart`, `day_metrics.dart`, `parent_room_screen.dart` and their focused tests, verified 5 May 2027.

*OBubba is a tracking and education tool, not medical advice. A positive weekly comparison cannot assess whether a baby is well or prove that a routine caused the change.*
