---
title: "Why Does OBubba Say ‘Maya Is Learning to Resettle Alone’?"
slug: why-obubba-says-learning-to-resettle-alone
description: "What OBubba’s self-settle progress card actually measures across detailed night-wake logs, why the final soothe step matters, and what ‘alone’ does not mean."
date: 2027-01-24
updated: 2027-01-24
author: OBubba
tags: baby learning to self settle, OBubba resettle alone card, baby resettle night waking, self soothing baby sleep, night wake tracker, detailed soothe log, responsive settling baby, baby sleep progress, baby wakes at night, stop rocking baby sleep, independent sleep baby, OBubba sleep insight
heroImage: /obubba-learning-to-resettle-alone.jpg
---

At 2:10am you fed your baby, laid them back in the cot and watched them wriggle quietly before drifting off. Two nights later, you patted them, stopped when they seemed settled and they finished the journey themselves. Then OBubba showed a card:

**“Maya is learning to resettle alone.”**

It sounds like a milestone. But does “alone” mean the whole wake was unassisted? Is the app asking you to wait through crying? Has it decided feeding or rocking is a problem?

No. We traced the current Flutter detector, the night-history caller and its tests for this guide. The card describes a precise change in the detailed wake logs: **a larger share of recent recorded wakes ended with a Self-settle segment than an earlier group did.** Feeding, holding, rocking or patting may still have happened first.

That is why this can be one of OBubba’s loveliest insights—and why the wording needs careful interpretation.

![An awake, content baby lies on their back in a clear cot while a responsive parent stays close by.](/obubba-learning-to-resettle-alone.jpg "Self-settling can happen with a parent present and after comfort; it never requires leaving a crying or hungry baby unanswered.")

## The short answer

The current detector stays silent unless all of these are true:

| Gate | Current Flutter rule | What it protects against |
|---|---:|---|
| Detailed evidence | At least **6 night wakes** have a non-empty ordered soothe breakdown | A few anecdotes are not called a trend |
| Comparison groups | At least **3 qualifying wakes** fall in both the recent and earlier groups | Both sides need a minimum sample |
| Recent level | At least **40%** of recent wakes end in Self-settle | A rise from a very low level is not enough |
| Improvement | Recent share is at least **20 percentage points higher** | Tiny changes stay quiet |

The caller supplies qualifying wakes from up to **14 recent nights**. For each wake, the detector reads only the **last recorded soothe segment**. If that final segment is Self-settle, the wake gets one “self-resolved” vote.

![The six-wake example and exact gates behind OBubba’s self-settle progress card.](/obubba-self-settle-progress-logic.svg "The current Flutter engine compares the final segment of detailed wake logs, requiring six wakes overall, three on each side, a recent share of at least 40% and a gain of at least 20 percentage points.")

These are product thresholds, not a medical definition of self-soothing and not a developmental target every baby should meet.

## What a detailed soothe breakdown records

When a parent records a night wake in the current Flutter app, the detailed log can store a sequence of methods and minutes. The available methods are:

- Fed
- Rocked
- Held
- Patted
- Dummy
- Self-settle

Order matters. A log might say:

**Fed 8 minutes → Held 4 minutes → Self-settle 6 minutes**

Another might say:

**Self-settle 3 minutes → Patted 5 minutes → Fed 12 minutes**

The first wake counts as self-resolved because Self-settle is last. The second does not because Fed is last. The software is answering **“How did the final recorded stretch back to sleep happen?”**, not “Was any support used?”

That distinction is meaningful. A parent may still be doing a great deal of responsive care while the baby gradually handles a little more of the final transition.

## “Alone” does not mean unsupported

In this card, “alone” does **not** mean:

- the parent left the room
- the baby never cried
- no feed, cuddle, rock or pat happened
- the whole wake was independent
- the baby should now settle this way every time
- support has become a bad habit

A baby who feeds for eight minutes and then spends one recorded minute settling can receive exactly the same self-resolved vote as a baby whose only segment is 30 minutes of Self-settle. The detector does not weight the vote by duration.

The gentler, more accurate translation is:

> “More of the recent wakes you logged finished with a Self-settle step than the earlier wakes did.”

That is still worth celebrating. It simply is not the same claim as “your baby now settles without you”.

## A worked six-wake example

The positive test in the Flutter code uses this pattern:

| Earlier recorded wakes | Final segment | Vote |
|---|---|---:|
| Patted 5m → Fed 15m | Fed | no |
| Fed 20m | Fed | no |
| Rocked 10m → Fed 12m | Fed | no |

Earlier self-resolved share: **0 out of 3 = 0%**.

| Recent recorded wakes | Final segment | Vote |
|---|---|---:|
| Fed 8m → Self-settle 25m | Self-settle | yes |
| Patted 5m → Self-settle 20m | Self-settle | yes |
| Self-settle 30m | Self-settle | yes |

Recent self-resolved share: **3 out of 3 = 100%**.

The recent level clears 40%, and the improvement is 100 percentage points, so the card can appear with a six-wake sample label.

The threshold is a **percentage-point** difference. If an earlier group is 20% and a recent group is 50%, the gain is 30 percentage points—not a 30% increase.

## How the app makes “earlier” and “recent” groups

This is not a neat “last week versus the week before” comparison.

The caller gathers detailed wake records from the last 14 nights and gives each one a day index. The detector sorts those day indices, picks the midpoint day value, then places wakes before that midpoint in the recent group and wakes on or after it in the earlier group.

Because one night can contain several wakes, the groups may be uneven. A night with three recorded wakes contributes three votes. A night with no detailed breakdown contributes none. The final sample therefore describes qualifying **wake records**, not nights or babies.

This also means parents should not try to reproduce the card with a simple six-row half-and-half split. The day-based midpoint can place the records differently when several wakes share a date.

## Why ordinary wake logs do not count

The detector ignores a wake that has only one general settling-method field. It needs the ordered, non-empty soothe breakdown.

That is a deliberate data-quality trade-off. Without the sequence, the app cannot know which method came last. But it creates a sampling blind spot: parents may complete the detailed breakdown mainly on difficult wakes, while quick or easy wakes receive a simple entry or no entry at all.

As a result, the card can describe the subset a tired parent happened to document—not every wake that occurred.

If you want this insight to reflect real life more faithfully, log the sequence consistently for a while, including ordinary wakes. Keep it honest and brief; do not manufacture Self-settle entries to earn a card.

## Why the card might not appear

Common reasons include:

- fewer than six wakes have detailed soothe sequences
- one comparison group contains fewer than three qualifying wakes
- fewer than 40% of recent wakes end with Self-settle
- the recent gain is under 20 percentage points
- the final recorded method was Fed, Rocked, Held, Patted or Dummy
- some wakes have only a simple settle-method entry
- breakdown segments were empty, malformed or recorded as zero minutes
- the baby already ended every earlier and recent wake with Self-settle

That last case is important. This detector celebrates **growth**, not a permanently high level. If the share was already 100% and remains 100%, there is no increase, so the card stays silent.

Silence never means failure. It may mean stable progress, a different settling style, incomplete detail, a small sample or a baby who needs more support right now.

## The card has no age or distress gate

The current detector does not check the baby’s age before it fires. It also cannot see crying, hunger, illness, breathing, temperature, pain, developmental stage or whether a parent remained close.

That makes the card copy—particularly the suggestion to give a chance to settle before stepping in—too broad if read as universal advice. Newborns wake repeatedly, often need help to settle and may only fall asleep in a parent’s arms. Babies communicate a need for food, comfort and care through their behaviour and crying.

A safer interpretation is:

- if your baby is calm, comfortable and quietly trying to settle, it can be reasonable to observe for a brief moment while staying responsive
- if your baby cries, cues for a feed, seems distressed or is unwell, respond
- continue using feeding, cuddling, holding, rocking or patting whenever the baby needs them

Self-settling is not a parenting score. Responsiveness and independent moments can coexist.

## A practical, responsive way to use the insight

Try this sequence rather than turning the card into a sleep-training rule:

1. **Look at the underlying wakes.** Was Self-settle really the final step, and were the sequences entered in the right order?
2. **Notice the baby in front of you.** A calm wriggle or quiet babble is different from escalating crying, hunger or distress.
3. **Give the care that is needed.** Feed, hold, rock, pat or offer the usual comfort without treating support as a setback.
4. **Record the sequence honestly.** The order is more informative here than choosing the “best sounding” method.
5. **Check the sleep space.** Put the baby on their back in a clear, flat, separate sleep space and follow current safe-sleep guidance.
6. **Celebrate without escalating.** A growing final Self-settle step is interesting; it does not require removing more help tomorrow night.

The NHS recommends a simple, soothing bedtime routine and notes that babies vary widely. It advises keeping the baby in the same room as you for the first six months when sleeping. UNICEF UK’s night-time guidance likewise centres responsive care and safer sleep—not achieving an app-defined independence target.

## What the current card cannot know

The comparison does not account for:

- how long the final Self-settle step lasted relative to the rest of the wake
- why the baby woke
- whether the baby cried or was calm
- who provided care
- whether sleep resumed immediately after the final segment
- age or developmental change during the 14-night window
- illness, teething, travel or changes in routine
- unlogged wakes and simple wake entries
- several wakes from one difficult night dominating the sample

It also cannot prove that a parent’s strategy caused the change. A baby may be maturing, waking for different reasons or simply having a calmer run of nights.

For those reasons, the card is best treated as a **personal progress prompt**: something to review, smile at and keep in proportion.

![OBubba’s genuine Flutter night-sleep screen, showing the live sleep timer and quick access to the current record.](/obubba-night-wake-pause-app.jpg "The real app keeps the night record close at hand; the self-settle progress card is calculated later from ordered soothe details across several wakes.")

## Why this feature is more useful than a sleep timer

A basic tracker can tell you that a wake lasted 22 minutes. The ordered soothe log can preserve the shape of those 22 minutes: feed, cuddle, pause, resettle.

Across enough records, OBubba can notice that the **ending** is changing even when the parent is too tired to see it. That is emotionally valuable. Exhausted parents often remember how many times they were needed, not the small portions the baby handled.

The strongest version of this feature does three things at once:

1. celebrates a real change in the family’s own record
2. shows exactly which wakes and thresholds created the card
3. protects responsive care by stating what the signal cannot mean

That combination—memory, explanation and proportion—is how a tracker becomes a trusted companion rather than another source of pressure.

**[Explore OBubba’s baby sleep tracker →](/baby-sleep-tracker.html)** — record night wakes, keep the ordered path back to sleep and find gradual changes that a simple stopwatch cannot show.

## Frequently asked questions

### Does the card mean my baby self-settled for the whole wake?

No. The current detector checks only the final recorded segment. Feeding, rocking, holding or patting may have happened first.

### Should I leave my baby to cry so Self-settle comes last?

No. The card is retrospective, not an instruction. Respond to crying, hunger, discomfort, distress and illness. A calm pause while you remain responsive is different from withholding needed care.

### Why does one minute of Self-settle count?

The current engine gives each qualifying wake one yes/no vote based on its final method. It does not set a minimum duration or weight longer segments more heavily. This is a limitation to remember when reading the percentage.

### Why do I need six detailed wakes?

The detector requires at least three qualifying wakes in the earlier group and three in the recent group. That reduces the chance of celebrating a single unusual night, although six records are still a small sample.

### Why did the card disappear even though progress continued?

The detector needs an increase. If the earlier and recent groups are both already high—or both 100%—there is no qualifying gain. Acknowledging the card is also handled per day, so it is not meant to remain permanently visible.

### Is Self-settle better than feeding or rocking to sleep?

Not as a universal rule. Babies vary, and feeding, holding and rocking provide nutrition, regulation, closeness and comfort. Use the method the baby needs and any individual advice from your health visitor, GP or clinical team.

## Reliable UK sources

- [NHS: Helping your baby to sleep](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/)
- [NHS: Soothing a crying baby](https://www.nhs.uk/baby/caring-for-a-newborn/soothing-a-crying-baby/)
- [NHS Best Start in Life: Building a close relationship with your baby](https://www.nhs.uk/best-start-in-life/baby/baby-basics/bonding-with-your-baby/building-a-close-relationship-with-your-baby/)
- [UNICEF UK Baby Friendly Initiative: Caring for your baby at night](https://www.unicef.org.uk/babyfriendly/baby-friendly-resources/sleep-and-night-time-resources/caring-for-your-baby-at-night/)

*This article provides general information for UK families. OBubba cannot assess crying, hunger, illness, development or sleep safety from a soothe log. Follow your baby’s cues and advice from your own midwife, health visitor, GP or clinical team.*
