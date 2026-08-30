---
title: "Why Does OBubba Say ‘Looks Like a Little Morning Resettle’?"
slug: why-obubba-says-looks-like-little-morning-resettle
description: "See exactly when OBubba treats an early first nap as more night sleep, what its button changes, and where the current detector can overclaim."
date: 2027-04-06
updated: 2027-04-06
author: OBubba
tags: OBubba morning resettle, baby wakes then goes back to sleep, first wake window too short, early morning baby sleep, baby sleep tracker app, morning wake time baby, Nap 1 or night sleep, personalised wake windows, baby nap prediction, correct baby sleep log, OBubba sleep insight
heroImage: /obubba-morning-resettle.jpg
---

Your baby wakes at 7:00am. You end the night, then—25 quiet minutes later—start a nap. They sleep until 8:40am. OBubba may surface:

> **Looks like a little morning resettle**

The card offers two choices: **Treat as final morning wake** or **Keep as nap**.

This is not merely a naming preference. The first morning wake anchors the awake timer, the first wake window, day-sleep totals and the next-nap calculation. If the 7:25–8:40 stretch was really the tail of the night, counting it as Nap 1 can make the rest of the day look one nap ahead and more rested than it was.

The current Flutter feature can repair that in one tap. But its friendly sentence claims more than the detector actually observes. It does not know that the baby woke happily, stayed calm or resettled independently; it knows only which entries were—or were not—logged between two sleep records.

Here is the exact route, what the button changes and how to decide without letting the app rewrite a correct nap.

## The short answer

The actionable card needs every gate below:

| Gate | Current Flutter rule |
|---|---|
| Data window | **Today’s calendar-day entries only** |
| Wake anchor | Earliest timed `wake` not marked night |
| Sleep candidate | Earliest completed daytime `nap` or `sleep` after that wake |
| Awake gap | **10–60 minutes inclusive** |
| Candidate duration | At least **10 minutes** |
| Earlier completed nap | None before the candidate |
| Care between wake and sleep | None from the detector’s supported list |

If a supported care event exists strictly between the wake and sleep start, OBubba takes the cautious branch instead:

> **That first wake window was tiny**

It keeps the sleep as Nap 1 and watches. With no supported care entry, it offers the data-changing morning-resettle action.

![The exact Flutter route from today’s wake and first completed sleep to OBubba’s actionable morning-resettle card.](/obubba-morning-resettle-logic.svg "OBubba selects today’s earliest non-night wake and first completed daytime sleep, checks a 10–60-minute gap, a 10-minute sleep floor and care events between them, then either keeps Nap 1 or offers to move the morning wake and delete the nap. The detector reads logs, not mood or independence.")

## Step 1: find today’s earliest morning wake

The Brain calls this detector with the entries stored under today’s local calendar date. It keeps entries whose type is `wake`, whose `night` flag is false and whose time exists. It sorts those wakes by clock time and chooses the earliest.

That means the first usable non-night wake becomes the candidate morning anchor. A 6:50am wake is selected before an 8:40am correction if both remain in the log.

Night-wake records do not qualify. An entry at 5:30am marked as a night wake is deliberately different from “woke for the day.” Likewise, ending a sleep timer without creating a morning-wake record leaves this detector with no anchor, so it stays silent.

The rule is calendar-based, not based on the parent’s chosen visual day-grouping preference. It does not scan yesterday for an early wake that was stored on the wrong date.

## Step 2: find the first completed daytime sleep after it

Next, Flutter accepts either a `nap` or a `sleep` record when all of these are true:

- it has a start and end;
- it is not marked night; and
- it starts after the selected wake.

It chooses the earliest start time, regardless of storage order. An open nap does not qualify until it has ended. A sleep shorter than 10 minutes is rejected. There is no maximum duration: a 75-minute or three-hour candidate can both pass this part.

The detector also checks that no completed daytime nap starts before the candidate. In ordinary data this is mostly redundant because it has already chosen the earliest completed sleep after the wake. In messy imported data, even a completed nap earlier than the morning wake can suppress the card.

## The awake gap is exactly 10 to 60 minutes

The gap is calculated from the selected wake time to the candidate sleep start.

- 9 minutes: silent;
- 10 minutes: eligible;
- 25 minutes: eligible;
- 60 minutes: eligible;
- 61 minutes: silent.

The app also appears to apply an age-based “shorter than a normal wake window” test. The fallback wake-window values range from 75 minutes for young babies to 300 minutes for older ones, and the comparison uses at least a 75-minute floor.

In the current implementation, however, the hard 60-minute ceiling has already removed every gap that could fail that later test. Every 10–60-minute gap is below the minimum 75-minute comparison threshold. So age and the optional base wake window do **not actually change whether this detector fires** today.

The Brain passes corrected age where available and falls back to roughly 26 weeks when age is unknown, but that distinction is presently inert for this card.

## What counts as care between the two sleeps?

The branch turns on entries occurring strictly after the morning wake and strictly before the candidate sleep start.

Supported care types are:

- feed;
- poop or nappy;
- solids or meal;
- medicine or med;
- temperature;
- activity;
- crying; and
- note.

If any one exists in the interval, OBubba does not offer to merge the stretch into the night. It says the first wake window was tiny, keeps Nap 1 and suggests watching for another similar morning without much care in between.

Why? A feed, change or activity suggests the family may genuinely have started the day before the baby needed an unusually early nap. The app chooses not to erase that distinction automatically.

The boundary is literal. A feed logged at exactly 7:00am, the same minute as the wake, does not count as between. A note stamped exactly 7:25am, the nap start, does not count either. Clock-minute precision can therefore change the branch.

Other record types are ignored. A second wake, a mid-nap stir or an unsupported imported event does not count as care. And an unlogged feed is invisible.

## Two records can produce two very different cards

Take the app’s tested example:

| Log | Time |
|---|---:|
| Morning wake | 7:00am |
| Nap starts | 7:25am |
| Nap ends | 8:40am |

The gap is 25 minutes, the sleep lasts 75 minutes and there is no earlier completed nap.

### No care entry in the gap

The result is **Looks like a little morning resettle**. The card offers the active repair and targets:

- the 7:00am wake ID;
- the 7:25–8:40am nap ID; and
- 8:40am as the proposed new morning wake.

### A 7:10am feed exists

The result changes to **That first wake window was tiny**. There is no primary data-changing action. OBubba keeps Nap 1 and provides a simple Got it acknowledgement.

One feed changes the meaning because the engine is trying to separate “brief stir, back down” from “up and cared for, then a short wake window.” That is sensible as a conservative product rule. It is not proof of either story.

## What “Treat as final morning wake” actually changes

The action performs three writes, in this order:

1. it deletes the candidate Nap 1 entry;
2. it changes the original morning-wake entry to the nap’s end time; and
3. it adds a note at that new time: **“Brief morning stir, resettled independently. Day starts here.”**

For the 7:00 → 7:25–8:40 example, the visible data changes from:

> Wake 7:00 · Nap 7:25–8:40

to:

> Wake 8:40 · Note: brief morning stir, resettled independently

The app does not simply relabel the nap. It removes it from daytime sleep and moves the day’s anchor.

That can make several downstream reads more coherent:

- the awake timer begins at 8:40, not 7:00;
- Nap 1 is no longer already consumed;
- daytime-sleep totals lose the 75-minute entry;
- the next-nap prediction works forward from 8:40; and
- the merged night model can use the later morning wake when estimating the night span.

This is the clever part of the feature. It fixes the source data instead of layering a permanent exception over every predictor.

![A genuine Flutter Track screen showing the sleep clock and OBubba-noticed feed that depend on accurate wake and sleep anchors.](/obubba-app-baby-sleep-clock-screenshot.jpg "This genuine app screen is wider context rather than the morning-resettle card itself. The live clock, sleeping state, prediction and OBubba-noticed feed all consume the same underlying wake and sleep records that the resettle action repairs.")

## “Keep as nap” changes nothing

In the popup card, **Keep as nap** acknowledges the insight and closes it. The wake and nap records remain exactly as they were.

That is the right choice when the baby was clearly up for the day—even if the awake spell was brief. Perhaps they fed, played, got dressed or travelled, but the event was not logged. Perhaps the family intentionally treated the sleep as the first nap. The parent owns the meaning of the morning.

On the full insight feed, the actionable card shows the apply button; leaving the page is effectively the non-apply choice. Low-urgency guidance can also be hidden for a week.

## The card does not observe happiness, calm or independence

The displayed body says the baby **“woke happily, stayed calm, then drifted back off.”** The saved note says they **“resettled independently.”**

None of those facts is tested.

The detector does not inspect:

- wake mood;
- crying intensity;
- a settle method;
- whether a parent rocked, fed or held the baby without logging it;
- how long the baby cried;
- the room, sleep surface or supervision; or
- a monitor signal.

“No supported care entry between” is being translated into a richer story. That story may be right, but the app has not proved it.

A more literal interpretation is:

> “A morning wake was followed 10–60 minutes later by a completed sleep, and no supported care event was logged between them.”

That is enough to ask a useful question. It is not enough to declare the baby happy or independently settled.

## The bedtime anchor currently changes nothing

The Brain checks yesterday for any `sleep` entry and passes a `hadBedtimeAnchor` flag into this detector. The source comment says that anchor raises confidence.

The function never reads the flag.

So the actionable card can appear even if the previous bedtime is absent, incomplete or not connected to this morning. It does not verify that the candidate stretch follows a coherent logged night.

This matters because “the end of night sleep” is a stronger claim when a night start exists. Today the card is really a same-day transition detector, not a fully joined bedtime-to-morning classifier.

## There is no morning clock boundary

Despite its name, the function does not require an early time of day.

If the earliest non-night wake in today’s data is 1:00pm and a completed daytime sleep starts at 1:30pm with no care entry between, the same morning-resettle card can technically appear. The 10–60-minute gap is guarded; “morning” is not.

Normal use usually supplies an actual morning wake, so this edge case should be rare. Imported logs, missed mornings and edited entries make it possible. Check the times before applying.

## The action is powerful, so verify the target first

The one-tap repair is not a cosmetic toggle. It deletes one entry and updates another. The current sequence is not wrapped into one atomic multi-write transaction, and the UI does not offer a dedicated undo for the resettle action.

If the operation fails partway through, the code catches the error and leaves the card eligible to reappear, but earlier writes may already have succeeded. Sync repositories reduce many data races elsewhere, yet this specific helper still performs three awaited operations in sequence.

Before tapping, quickly confirm:

1. the proposed wake time matches the end of the correct sleep;
2. the candidate really is the first sleep after the day’s earliest wake;
3. no meaningful awake activity went unlogged; and
4. you are happy for that Nap 1 entry to be removed.

If the log is already wrong in a different way, edit the wake or nap directly instead of asking this card to solve it.

## Why the card may stay silent

OBubba will not show this exact actionable insight when:

- today has no timed non-night wake;
- no completed daytime nap or sleep follows it;
- the sleep starts fewer than 10 or more than 60 minutes later;
- the sleep lasts fewer than 10 minutes;
- another completed nap exists before the candidate;
- a supported care entry falls strictly inside the gap; or
- the insight is acknowledged or snoozed on the current surface.

A care event produces the related **That first wake window was tiny** card rather than silence. A 61-minute gap produces neither, even if the baby returned to sleep naturally.

No card does not decide whether the stretch was night sleep. It means this exact deterministic route could not make the offer.

## How acknowledgement and snoozing work

Morning-resettle dismissals are keyed to the current date and the target nap ID when one is available. That makes the decision specific to this morning’s proposed correction. A new day can produce a new card.

The watch-only short-first-wake-window variant has no resettle target, so its same-day key ends without a nap identifier. Multiple watch-only candidates on one day collapse to the same acknowledgement identity.

Snoozing is broader. It uses a stable combination of insight kind and title, hiding that pattern for seven days. The actionable resettle and watch-only variant have different kinds and different titles, so snoozing one does not automatically hide the other.

Both are low urgency. Higher-priority health or medium/high cards can appear above them, and a five-card Track preview can push this sleep correction below the initial list. The full OBubba-noticed feed remains the better place to review everything.

## How to decide: night tail or real Nap 1?

The app cannot answer from timestamps alone, so use the lived morning.

Treat the second sleep as a plausible continuation of night when the baby only briefly stirred, stayed in their sleep setting, received little or no active care and returned to sleep as part of the same quiet episode.

Keep it as Nap 1 when the baby was genuinely up: feeding, changing, playing, moving rooms, seeing daylight or engaging with the family—even if tiredness returned unusually fast.

There is no universal correct label. The [NHS notes that every baby is different and sleep patterns change as babies grow](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/your-babys-sleep-patterns/). The useful goal is an honest anchor for this baby’s day, not forcing a textbook schedule.

## Safe sleep does not change with the label

Whether the app calls the stretch night sleep or Nap 1, physical sleep safety is the same. The software does not assess the cot or the baby’s position.

The [Lullaby Trust recommends placing babies on their back for every sleep, day or night, on a firm flat surface in a clear cot](https://www.lullabytrust.org.uk/baby-safety/safer-sleep-information/). A data correction is never a reason to change those basics.

If unusual sleepiness comes with difficulty waking, breathing changes, abnormal colour, poor feeding or a parent’s sense that the baby is unwell, check the baby and seek appropriate medical help rather than treating the episode as a scheduling puzzle.

## A better way to read the card

Translate **Looks like a little morning resettle** into:

> “Today’s earliest wake was followed by another completed sleep within an hour, with no supported care log between. Should the later sleep end become the real day-start anchor?”

That question is both more modest and more useful than pretending the app witnessed the room.

If yes, the one-tap repair can prevent a false Nap 1 from distorting the whole day. If no, Keep as nap preserves the family’s actual experience.

## The bottom line

**“Looks like a little morning resettle” means OBubba found a same-day wake followed 10–60 minutes later by at least 10 minutes of completed daytime sleep, with no supported care entry logged between.**

The active button deletes that first sleep, moves the original morning wake to its end and adds a note. That can immediately improve the awake clock, day-sleep total, nap count, night span and next prediction.

But the detector has meaningful limits: age and the bedtime-anchor flag do not currently affect the result; there is no morning clock boundary; it does not observe mood, crying or independent settling; and the three-part edit has no dedicated undo.

Use it as a smart correction offer, not an automatic verdict. The best baby tracker is not the one that insists its label is right. It is the one that catches a plausible logging mismatch, explains the consequences and gives the parent the final say.
