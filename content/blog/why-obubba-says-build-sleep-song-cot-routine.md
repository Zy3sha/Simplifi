---
title: "Why Does OBubba Say ‘Build a Sleep Song + Cot Routine’?"
slug: why-obubba-says-build-sleep-song-cot-routine
description: "How OBubba detects a repeated feed, rock, pat, hold or dummy sleep association, builds new bedtime cues first, and adapts a gentle swap plan."
date: 2027-03-29
updated: 2027-03-29
author: OBubba
tags: sleep song cot routine OBubba, baby sleep association, baby wakes for dummy, feeding to sleep, rocking baby to sleep, gentle sleep plan, drowsy but awake baby, baby bedtime routine, baby wakes every night, OBubba sleep consultant
heroImage: /obubba-build-sleep-song-cot-routine.jpg
---

Last night your baby woke four times. You marked **dummy** after every resettle. OBubba later offered:

> **Build Maya a sleep song + cot routine**

Is the app telling you to remove the dummy tonight? Has it decided comforting your baby is a “bad habit”? Does a song somehow make a hungry baby stop waking?

**No. This is an optional, age-gated sleep-association swap.** The current Flutter app only reaches it after a repeated settling method appears in the saved night-wake record. For a younger dummy user, the card explicitly says to **keep the dummy** and add stable bedtime cues around it. For an older baby—or a repeated feed, rock, hold or pat pattern—the staged coach builds the same cues first, then eases one form of help gradually.

It is not a command to sleep-train, a promise of no wakes or permission to ignore hunger, illness or distress. If the way your baby sleeps works for your family, there is nothing you must fix.

![The current Flutter path from repeated night-wake settling to OBubba’s gentle sleep-association swap.](/obubba-sleep-association-swap-detector.svg "OBubba first needs at least three recorded settling methods from the previous night and one recognised crutch at 80% or more. It then chooses the most frequently logged crutch across seven nights, applies age and parenting-style gates, and builds new cues for at least four nights before fading the old help.")

## The short answer

The passive offer is assembled in two different time windows:

1. **Last night opens the gate.** There must be at least three night wakes with a non-blank primary settling method. A recognised parent-recreated method must account for at least 80% of them.
2. **Seven nights choose the plan.** OBubba counts every recognised settling method attached to night wakes across the recent seven-night collection and chooses the most frequent.
3. **The parent’s sleep approach must allow method coaching.** If Preferences is set to the minimal “follow my baby’s lead” style, this family of method prompts is suppressed.
4. **Baby must be at least 17 weeks old** for a structured swap offer.
5. **Dummy handling changes at 26 weeks.** Under 26 weeks, the passive card keeps the dummy and only builds anchors. From 26 weeks, the full dummy-fade route can be offered.
6. **Starting the tracked plan adds another gate.** The Sleep Consultant checks whether enough nights are logged and whether major timing problems should be handled first.

The new anchors in the Flutter plan are the same brief sleep song or sound, the sleep space itself and a steady routine. Every swap ladder keeps the existing help in its first stage for at least four nights.

## A worked example: four dummy resettles

Imagine last night contains four night-wake entries:

| Wake | Primary settling method |
|---|---|
| 10:40pm | dummy |
| 12:55am | dummy |
| 3:10am | dummy |
| 5:20am | dummy |

All four usable records name the same recognised method. That is 100%, so the last-night dependency gate opens.

Across the last seven nights, suppose the full method counts are:

- dummy: 11
- patting: 4
- holding: 2

Dummy is the seven-night leader. If Maya is 20 weeks old, the app can offer **Build Maya a sleep song + cot routine** and says the dummy stays. If she is 30 weeks old, the full dummy-swap route can be offered.

Change one detail and the outcome changes:

- only two recorded wake methods last night: no dependency gate;
- three feeds and one rock: feed is 75%, so no gate;
- four independent resettles: no crutch card;
- four repeated dummy resettles, but the parent chose “follow my baby’s lead”: no method-coaching card;
- repeated rocking at 15 weeks: too young for a structured swap;
- last night is dominated by dummy but the seven-day record is dominated by feeds: the plan can target feeding, because the second stage deliberately uses the broader history.

That last case is easy to miss. The card is not simply echoing the most recent tap.

## What counts as a sleep association here?

The gate recognises these saved primary methods:

- feeding (`fed`);
- rocking;
- holding;
- patting; and
- dummy.

Independent settling does not create a dependency card. Blank methods are removed before the calculation, which means the denominator is **recorded methods**, not every physical wake.

If a baby woke six times but only three wakes have a settling method and all three say “rocked”, the software sees 3 of 3—100%. The missing three are not counted as unknown counter-evidence. Accurate, reasonably complete logging matters.

OBubba’s current night-wake form can retain both a primary method and a multi-select list. The last-night 80% gate reads the single primary value. The seven-night chooser reads the full list, so a wake marked “fed + rocked” can add one count to both methods.

The seven-night stage has no 80% rule of its own. It simply takes the largest count. If the leading methods are close—or tied—the selected plan may overstate how clear the longer pattern is. Review the week before accepting the suggestion.

## “Association” does not mean “bad habit”

Babies fall asleep with warmth, feeding, touch, movement, voice and proximity. These are normal forms of care. Feeding or rocking to sleep is not harmful merely because an app can count it.

The practical question is narrower: **does the parent need to recreate the same condition at nearly every wake, and is that now a problem for this family?**

You may choose to keep doing exactly what works when:

- wakes are manageable;
- feeding is genuinely needed;
- baby is very young;
- illness, teething, travel or a developmental change is active;
- the routine suits the family; or
- changing it would add more stress than it removes.

Our guides on [feeding to sleep](/blog/is-feeding-to-sleep-a-bad-habit.html) and [rocking to sleep](/blog/do-i-need-to-stop-rocking-baby-to-sleep.html) start from the same principle: comfort is not a failure.

## Why OBubba adds before it subtracts

Abruptly removing the only familiar way to settle can create a large gap: the old cue is gone and no new cue has had time to mean anything yet.

The Flutter swap ladders therefore begin with **Build the anchors**, held for at least four nights:

- keep the current feed, rocking, patting or dummy;
- add the same short song or sound at each sleep;
- keep the routine order recognisable; and
- make the safe sleep space a familiar final part of settling.

Only later does the selected ladder make one small change. That is the product idea worth noticing: OBubba does not give every family the same generic “put baby down awake” instruction on night one.

![The genuine current OBubba Flutter Sleep Consultant presents a gentle plan shaped by the baby’s logs and what feels right for the family.](/obubba-sleep-consultant-app.jpg "A genuine current Flutter screen: the Sleep Consultant is framed as a path, not a prescription, with a 14-day plan shaped by the baby’s sleep and the family’s preferences.")

**[Try OBubba free →](/app.html)** — log how wakes were actually settled, keep the routines that work, and only start a gradual plan when the pattern and timing support it.

## The four different fade ladders

After the shared anchor-building stage, the plan depends on what the seven-night record selected.

### Feeding to sleep

The route is:

1. feed exactly as now while adding the stable cues;
2. move the feed earlier: feed → book or cuddle → song → cot;
3. aim to end the feed drowsy rather than fully asleep; then
4. keep milk earlier in the routine while using the song and sleep space for the final settle.

The app explicitly says night hunger is still fed. Do not reduce or delay a needed feed to satisfy a sleep ladder. NHS responsive-feeding guidance says young babies are likely to need night feeds for at least the first few months, and needs vary beyond that.

### Rocking or holding

The route moves from normal rocking or holding with the new cues, to rocking only until calm and drowsy, to a still reassuring hand in the cot, then to voice and presence with less motion.

In the actual coach mapping, **holding shares the rocking ladder**. The passive card has holding-specific wording, but starting the plan routes both methods to the same staged sequence.

### Patting

The route keeps patting while the anchors form, then makes the pat lighter and shorter, replaces rhythm with a still hand, and finally keeps the routine, song and calm presence without continuous patting.

### Dummy

For a full dummy swap, the ladder first keeps it, then tries the song and touch before replacing it at wakes, moves towards one offer at settling, and eventually uses the routine without repeated “re-plugs”.

However, current safer-sleep dummy guidance needs to take priority over an app threshold. The Lullaby Trust says that if families use a dummy, they should offer it for every sleep, not force it, and not replace it once it falls out during sleep. It recommends gently stopping between six and 12 months. The Flutter split at exactly 26 weeks is a product gate, not a clinical deadline.

If breastfeeding, the Lullaby Trust advises waiting until breastfeeding is established, usually around four weeks, before introducing a dummy. Do not use cords or attachments.

Our [dummy-falls-out guide](/blog/baby-wakes-when-dummy-falls-out.html) explains safe use and realistic options without turning every wake into a removal project.

## What happens when you start the tracked plan

The passive insight is only an invitation. On plan start, OBubba’s training-readiness layer checks:

- age;
- whether enough nights exist for a consultation;
- the parent’s selected approach; and
- whether serious bedtime, wake-time, day-sleep, nap-consistency or final-wake-window issues should be addressed first.

One severe timing finding, or at least two moderate timing findings, produces **Let’s get the timing right first** rather than pushing the method ahead.

When a swap plan does start, it saves:

- the selected ladder;
- current step;
- start date and step-start date;
- baseline average wakes; and
- the last day on which the plan changed.

The first anchor step lasts at least four nights. Later rungs normally have a three-night minimum. OBubba then compares recent wakes with baseline and checks whether the plan was followed often enough.

- If wakes improve and the minimum time has passed, it advances one rung.
- If nights are about the same, it holds.
- If nights are tougher, it repeats or moves back a rung.
- If fewer than half of at least three measured nights followed the plan, it does not blame the method; it reports low adherence.
- If the baseline or new night data is missing, it gathers rather than claiming success.

This is meaningfully different from a calendar checklist that unlocks step two merely because Tuesday arrived.

## Does the song need to play all night?

No. A parent’s brief, familiar song can be the cue. It does not need to become continuous audio, and it does not need lyrics, perfect pitch or a particular recording.

Keep it simple:

- use the same short song or phrase;
- sing softly during the wind-down;
- stop when the settle is complete if that works; and
- keep any device, cable and charger away from the sleep space.

The NHS says a simple, soothing bedtime routine may help a baby settle. Some NHS community guidance includes singing a song as one possible step. That supports the general routine idea; it does not prove that one song will reduce this baby’s night wakes.

The cot cue is environmental familiarity, not an object placed beside the baby. A safe sleep space remains firm, flat and clear.

## “Drowsy but awake” is an experiment, not a test of parenting

Several Flutter rungs use drowsy-but-awake or awake put-downs. Some babies accept that transition readily; others need much more support. A difficult transfer does not mean the parent has failed or that the baby lacks a skill.

Try the smallest version of the step:

- finish the usual settle slightly earlier;
- put baby down calm;
- stay close with voice or touch;
- pick up and reset if distress escalates; and
- pause the change on an unwell or unusually disrupted night.

“No-cry” in OBubba describes a plan that does not prescribe leaving a baby to cry. It cannot promise that a baby will make no sound or show no protest when a familiar routine changes. Responding remains part of the plan.

The NHS recognises that, especially in the early weeks, babies may only fall asleep in a parent’s arms or with someone beside the cot. It also says patterns change as babies grow. This is development, not a race.

## Safe sleep does not change during a swap

For at least the first six months, the NHS says the safest place for baby to sleep is in a cot, on their back, in the same room as a parent or carer. The mattress should be firm and flat, without toys, pillows, cot bumpers or loose bedding that could cover the face or cause overheating.

A routine cue must never become a cot hazard:

- no phone, speaker, monitor cable or charger in reach;
- no dummy clips, cords or attachments;
- no soft toy added as the “new association” for a young baby;
- no sleeping with baby on a sofa or armchair; and
- return baby to their safer sleep space before the adult falls asleep.

The hero image for this guide deliberately shows the baby awake with an attentive parent and the cot empty.

## When the card may be misleading

The software is transparent enough to name its blind spots:

### Missing methods shrink the denominator

Three identical recorded methods can look like 100%, even if several other wakes were left blank.

### The gate and target use different windows

Last night proves a concentrated pattern exists; seven nights choose what to target. A strange one-night event can open the gate while the longer history points elsewhere.

### Multi-select can count twice

“Fed + rocked” contributes to both seven-night totals. Counts are actions, not unique wakes.

### The seven-night winner need not be dominant

A small lead can choose a plan. The app does not require 80% at this second stage.

### Age depends on the profile

The engine normally uses corrected age where available, then chronological age. A missing or malformed date of birth falls back to roughly 26 weeks for general age reads. Keep the child profile accurate before accepting an age-gated plan.

### Wakes have many causes

Hunger, pain, temperature, illness, teething, development, the sleep environment and ordinary brief arousals can coexist with a repeated settling method. Association does not prove cause.

## Frequently asked questions

### Must I stop feeding or rocking my baby to sleep?

No. The card is optional and low urgency. Change only if the current pattern is unsustainable for your family.

### Why did the card appear after one difficult night?

One night can open the gate when it has at least three usable wake-method records and one recognised method reaches 80%. The target itself comes from seven nights.

### Why did no card appear after four wakes?

Methods may be blank, mixed, independent or suppressed by the parent’s selected sleep approach. Baby may also be under 17 weeks.

### Does a song replace night feeds?

No. Follow genuine hunger cues. The feed-swap ladder moves a bedtime feed earlier only as a settling experiment and explicitly preserves needed night feeding.

### Should I remove a dummy at exactly six months?

No single app boundary decides that. Follow current safer-sleep guidance and your health professional’s advice. The Lullaby Trust recommends gently stopping between six and 12 months, with consistent safer use before then.

### Will OBubba advance the plan every three nights?

No. Minimum nights make a step eligible; improvement and data quality decide whether it advances. The plan can hold, repeat or step back.

### Can this guarantee fewer wakes?

No. It is an adaptive experiment based on logged associations, not proof of causation or a treatment guarantee.

## The takeaway

**Build a sleep song + cot routine** means OBubba saw a concentrated, recorded settling pattern last night and found a repeated parent-recreated method across the recent week. It respects a “follow my baby’s lead” preference, waits until at least 17 weeks, treats younger dummy use differently and builds stable cues before fading support.

That is thoughtful product logic—but it is still software. Review missing logs, genuine hunger, illness and safer-sleep needs. Keep what works. If you choose a change, make it small, responsive and reversible.

## Sources and further reading

[NHS: Helping your baby to sleep](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/) — individual sleep patterns, night feeds, simple soothing routines, normal early contact settling and when to ask a health visitor for help.

[NHS Best Start in Life: Safer sleep advice for babies](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/) — back sleeping, same-room guidance, clear firm flat sleep spaces and sofa/armchair risk.

[The Lullaby Trust: Dummies](https://www.lullabytrust.org.uk/baby-safety/baby-product-information/dummies/) — consistent offering, breastfeeding establishment, not forcing or replacing a fallen dummy, avoiding attachments, and gentle withdrawal between six and 12 months.

[NHS Best Start in Life: Feeding on demand](https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/bottle-feeding/bottle-feeding-your-baby/feeding-on-demand/) — responsive feeding, variable night-feed needs and never forcing milk.

OBubba Flutter source reviewed for this article: `extra_insights.dart`, `sleep_association_swap.dart`, `brain.dart`, `coach_loop.dart`, `training_readiness.dart`, `baby_entry.dart`, `extra_insights_test.dart`, `sleep_association_swap_test.dart`, `swap_ladders_test.dart` and `training_readiness_test.dart`.
