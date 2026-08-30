---
title: "Why Does OBubba Say ‘Promising, but Give It a Couple More Nights’?"
slug: why-obubba-says-promising-give-it-couple-more-nights
description: "See how OBubba’s Flutter Coach checks an early sleep-experiment win, why nights 3–4 can flatter a result, and what the app really means by keep going."
date: 2027-04-14
updated: 2027-04-14
author: OBubba
tags: promising give it a couple more nights OBubba, baby sleep experiment, baby sleep improving, seven night sleep test, baby sleep tracker results, night to night baby sleep variability, personalised baby sleep app, baby sleep coach app, did earlier bedtime work, baby sleep data, OBubba Coach
heroImage: /obubba-promising-couple-more-nights.jpg
---

Night three is quieter. The longest stretch is 42 minutes longer than the old baseline. OBubba’s experiment card lights up:

> **It worked**

Then the Coach adds a second thought:

> **Promising, but give it a couple more nights**

That is not the app losing confidence. It is the app separating two questions:

1. **Has the chosen outcome moved far enough to count as improvement?**
2. **Has the experiment run long enough that one lucky night is less likely to own the story?**

The current Flutter app lets its deterministic experiment engine answer the first question from night three. A separate deterministic supervisor inside the premium Coach answers the second. If the result says `working` before five calendar nights have elapsed, the Coach advises keeping the same change going towards roughly seven nights before treating it as established.

This is an unusually valuable feature because baby apps are rewarded for delivering certainty quickly. Parents are better served by an app that can be excited **and** sceptical at the same time.

## The exact Flutter rule

The note appears only when all three conditions are true:

| Supervisor input | Required value |
|---|---|
| Active experiment | Yes |
| Live verdict | Exactly **working** |
| Calendar nights elapsed | Fewer than **5** |

Because the experiment engine cannot return `working` before three elapsed nights, the practical window is **night 3 or night 4**.

The note names the experiment, reports the elapsed-night number and recommends continuing to approximately seven nights before counting the win.

![The exact Flutter path behind OBubba’s Promising, but give it a couple more nights note.](/obubba-promising-couple-more-nights-logic.svg "The experiment engine may call a metric improved from night three when enough outcomes clear a meaningful-change threshold. The Coach then checks that the experiment is active, the verdict is working and fewer than five calendar nights have elapsed before recommending a steadier run towards seven nights.")

## The first verdict is real—but deliberately sensitive

Every OBubba sleep experiment has one outcome metric. The engine does not judge every change by wake count:

| What the family is testing | Outcome Flutter watches | “Working” threshold |
|---|---|---:|
| Earlier bedtime or a smaller evening bottle | Night wakes | At least **0.5 fewer** per night |
| Dropping a dream feed | Night feeds | At least **0.5 fewer** per night |
| Anchoring the morning | Morning wake | At least **15 minutes later** |
| Day-sleep cap, earlier last nap, wake-window tuning, steadier bedtime or the gentle feed–sleep-link test | Longest unbroken stretch | At least **30 minutes longer** |

The direction changes with the metric. Fewer wakes and feeds are improvement; a later morning endpoint or longer stretch is improvement.

These are product thresholds, not clinical definitions. They give the app a consistent line for its first read. A 29-minute stretch gain is not biologically different from a 30-minute gain, and half a wake is an average rather than an event one can observe.

## Why “night 3” can mean only two usable outcomes

The supervisor’s displayed number comes from **calendar days since the experiment started**, calculated using date keys. It is not a count of complete logged nights.

The verdict engine separately checks how many usable outcome values exist. To judge a result it requires at least half of the elapsed window, rounded up, with a minimum of two.

That produces this ladder:

| Calendar nights elapsed | Minimum usable outcomes for a verdict |
|---:|---:|
| 3 | 2 |
| 4 | 2 |
| 5 | 3 |
| 7 | 4 |
| 14 | 7 |

So a night-three `working` verdict can be based on two valid measurements. The note’s copy says the app is calling a win “after only 3 nights”, but a more exact translation is: **three calendar nights have elapsed and at least two usable results cleared the improvement threshold**.

That distinction is precisely why the extra caution is worthwhile.

## How the baseline is built

An improvement needs a before figure.

For wake-count experiments, Flutter stores an average from up to seven nights before the test. It needs at least two usable pre-test nights. Nights affected by illness, travel or daycare context can be excluded from that baseline when the relevant day tags or entries are available.

For morning-wake, night-feed and longest-stretch experiments, the status provider reconstructs the relevant metric from the seven dates before the start. Again, fewer than two usable values means there is no honest baseline and the verdict becomes **Need a few more logged nights**.

After the test begins, Flutter watches a trailing window capped at 14 elapsed nights. A long-running experiment therefore does not let forgotten logs from the beginning dilute the current result forever.

The maths is straightforward and inspectable. What it cannot remove is natural night-to-night variation.

## Why a good night or two can flatter a result

Infant sleep is not a controlled laboratory signal. The same baby can have different nights because of feeding, development, noise, temperature, illness, teething, travel, childcare, parental response and ordinary variation.

A study following six-month-old infants over 13 nights found high night-to-night variability in whether they achieved a six- or eight-hour consolidated stretch, and described sleep consolidation as a dynamic process rather than a one-time milestone ([Sleep Medicine: Sleeping through the night or through the nights?](https://www.sciencedirect.com/science/article/pii/S1389945720304469)). The NHS likewise notes that babies’ sleep patterns vary and that growth spurts, teething and illness can change them ([NHS: Helping your baby to sleep](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/)).

That does not mean short experiments are useless. It means their correct language is **signal**, not proof.

Suppose the baseline longest stretch is 4h 50m:

- night 1: 5h 38m;
- night 2: not logged; and
- night 3: 5h 10m.

The average of the two usable nights is 5h 24m—34 minutes above baseline—so the engine can call `working`. The change is real in the available records. It may also shrink when nights four through seven arrive.

## The Coach is not generating this opinion

Despite appearing inside the AI Coach area, this particular note comes from a pure Flutter function called `auditBrain`.

It receives primitive facts from the live providers:

- the baby’s first name;
- whether an experiment is active;
- its title;
- the verdict name;
- elapsed nights;
- whether a new test is being proposed;
- disruption context; and
- any old failed lever that may now be worth revisiting.

The function applies fixed, golden-tested rules and returns zero or more notes. No language model decides whether an early win deserves caution. A future AI pass can sit above this layer for novel cases, but the safeguard itself is deterministic.

That matters for trust: the same inputs produce the same correction.

## Where the note appears

The note is a premium Coach feature. On a fresh Coach visit—before the parent starts a chat—it can appear in the horizontally swipeable **Your calm plan** deck as a card labelled **Coach’s read**.

![A genuine OBubba Flutter Coach screen showing the premium Coach surface where deterministic Coach’s read cards appear.](/obubba-bubba-coach-night-diagnosis.jpg "This genuine Flutter capture shows the Coach’s personalised, log-grounded surface. The seeded example contains a night diagnosis rather than this exact early-win note; it demonstrates where the supervising Coach lives without presenting a fabricated screenshot.")

There are several important visibility limits:

- free or expired-trial users see the Coach paywall, not the note;
- the proactive note is hidden once conversation turns are already on screen;
- it appears only while the experiment is active; and
- if the rest of the brain looks sound, the supervisor returns nothing rather than filling the screen with reassurance.

This is a useful safeguard, but it is not a universal modal that every parent must acknowledge.

## It does not cancel the Track win card

The Track screen and Coach can disagree in emphasis at the same moment.

When the experiment verdict becomes `working` and a real recent metric exists, Track can render the celebratory **IT WORKED** card with the before-and-after figures and a Share action. The Coach does not suppress that card, downgrade the verdict or prevent the family from ending the test.

It adds a second opinion elsewhere:

> Encouraging enough to celebrate; early enough to keep observing.

That is honest, but it creates a product tension. A parent who never opens the premium Coach may see only the early celebration. A stronger future integration could place the caution directly beneath a night-three win or delay the large celebration until the five-night guard has cleared.

The current implementation should therefore be described as **self-auditing**, not as one unified verdict system.

## Why the note stops at five even though it says seven

The condition is `experimentNights < 5`. At exactly five elapsed nights, the Coach no longer second-guesses a `working` verdict.

Yet the body says:

> “I’d keep it going to ~7 nights before we count it.”

In other words, five is the software’s minimum maturity gate; seven is the parent-facing target. Nights five and six occupy a small gap where the note has disappeared even though its own suggested destination has not been reached.

That is not dangerous, but it is worth knowing. The most precise product behaviour is:

- nights 0–2: the experiment is gathering;
- nights 3–4: an early `working` verdict can be challenged by the Coach;
- night 5 onward: a `working` verdict is accepted by this supervisor rule; and
- checkpoints still exist at nights 3, 7 and 14.

The experiment itself can remain active much longer. A settled test auto-concludes after night 17, while a chronically under-logged one has a hard ceiling at night 21 so it cannot block every future suggestion forever.

## The same safeguard exists for an early disappointment

Premature optimism is not the only risk.

If an active experiment says **worse** or **no clear signal** before five elapsed nights, the supervisor can instead say:

> **Don’t write off [experiment] yet**

That side is arguably more important. When a finished experiment is recorded as worse or no signal, OBubba can bench that lever for about 60 days so it does not keep prescribing something that failed this baby. Stopping after a noisy start could therefore hide a useful option for weeks.

The Coach asks the family not to turn two awkward nights into a long-term lesson.

## Disruption context outranks the early-win note

If teething, illness or a regression is active while the experiment runs, the supervisor can return two notes:

1. **Pause the experiment while [name] settles**; then
2. **Promising, but give it a couple more nights**.

The disruption caution appears first because the result is confounded. A rough patch can false-fail a good lever; an unusually sleepy illness night can also flatter one.

The app’s stop path has another protection: a worse or no-signal verdict reached through relevant disruption context can be downgraded to missing data before the outcome is recorded, avoiding an unfair 60-day bench.

The NHS notes that illness and teething can affect baby sleep. Treat a sick baby’s comfort, feeding and medical needs as more important than preserving a clean experiment. If a baby seems unwell or a parent is worried, follow clinical advice rather than the app’s test calendar.

## What parents should do with the note

The best response is intentionally boring:

1. **Keep only the chosen change steady.** Do not add a later bedtime, shorter naps and a new settling method at once.
2. **Keep logging the metric the test actually uses.** A longest-stretch experiment needs bedtime, morning and wake intervals; a morning test needs the final wake for the day.
3. **Add real context.** Mark illness, travel, childcare and teething rather than making messy nights look comparable.
4. **Keep responding to hunger, illness and distress.** No sleep test justifies withholding a needed feed, comfort or care.
5. **Reassess around night seven.** Ask whether the direction held, whether the family can live with the change and whether anything else changed at the same time.

Continue safer sleep practices regardless of the experiment result. The Lullaby Trust recommends placing babies on their back in their own clear, flat, firm sleep space, in the same room as an adult for at least the first six months ([The Lullaby Trust: Keeping a clear cot](https://www.lullabytrust.org.uk/baby-safety/safer-sleep-information/keeping-a-clear-cot/)).

## The honest translation

The most accurate version of the card is:

> **An active OBubba sleep experiment has reached a `working` verdict after three or four calendar nights. Enough logged outcomes cleared the metric’s improvement threshold, but at this stage that may be only two usable nights. Keep the same safe, appropriate change steady towards roughly seven nights so ordinary variation has less power to flatter the result.**

That is a much better relationship with data than “the app said it worked”.

OBubba connects one-change sleep experiments with the correct outcome metric, disruption context, a per-baby result history and a Coach that can question the app’s own first answer. [Explore OBubba](/#download) when you want a baby tracker that does more than produce insights—it checks whether its confidence has earned your trust.
