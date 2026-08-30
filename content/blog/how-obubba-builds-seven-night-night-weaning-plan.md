---
title: "How Does OBubba Build Its 7-Night Night-Weaning Plan?"
slug: how-obubba-builds-seven-night-night-weaning-plan
description: "We traced OBubba’s Flutter night-weaning engine: its five-night baseline, three readiness lights, bottle and breastfeeding branches, safeguards and current limits."
date: 2027-04-19
updated: 2027-04-19
author: OBubba
tags: OBubba night weaning plan, how to reduce night feeds, seven night night weaning, baby night feed tracker, bottle night weaning, breastfeeding night weaning, night weaning 6 months, night weaning 12 months, gradual night weaning, personalised baby sleep app, responsive feeding, OBubba Flutter
heroImage: /obubba-seven-night-night-weaning-plan.jpg
---

Two babies can both wake twice for milk and need completely different help.

One is 8 months old, takes measured bottles and averages about 180ml overnight. Another breastfeeds, has never had milk measured in millilitres and sometimes needs milk for hunger, sometimes for comfort and sometimes for both. A useful plan should not pretend those records are interchangeable.

So what does OBubba actually do when you open **Night Weaning** and see three readiness lights?

We traced the current Flutter screen, its calculation engine, local storage and automated tests. **OBubba builds the plan from the last five completed nights, requires at least two nights containing genuine night feeds, checks age and daytime logging, then chooses either a millilitre taper or a time-and-comfort sequence.**

That is more personal than a generic “drop one feed tonight” checklist. But it is not a medical assessment, and there are a few details—especially for breastfeeding and mixed feeding—that parents deserve to understand before treating the targets as instructions.

## The short answer

| Question | Current Flutter behaviour |
|---|---|
| What history does it use? | The last **5 completed nights** |
| Which feeds count? | Logged night milk feeds that are not scheduled dream feeds; breast, bottle and wake-linked feeds can count |
| Which feeds do not count? | Day feeds, dream feeds and solids |
| How much data is enough? | At least **2 nights containing a qualifying night feed** |
| What are the three green lights? | Corrected age of at least **26 weeks**, at least **3 daytime feeds on one of the last 5 days**, and enough night-feed data |
| What happens with measured milk? | A seven-night total-volume taper is calculated from the logged average |
| What happens with unmeasured breastfeeding? | The plan uses shorter feeds, soothing first and gradually dropping a feed, with no ml target |
| Does an under-one bottle plan reach zero? | No. It retains a small final-night allowance; at 52 weeks or older it can reach zero |
| Can the plan be completed in one sitting? | No. The night counter cannot advance faster than elapsed calendar nights |
| Does the starting target stay fixed? | **Not currently.** The baseline is recalculated from a rolling five-night window, so targets can change during the plan |
| Is “ready” medical approval? | **No.** It means the three software conditions passed, not that night-weaning is right for this baby |

![How OBubba turns recent night-feed logs into one of two seven-night plan branches.](/obubba-seven-night-weaning-plan-logic.svg "Five completed nights are filtered into a real-feed baseline, checked against three readiness gates and routed to either a measured-volume taper or a time-and-comfort plan.")

## Step 1: OBubba reads five completed nights

The screen asks the baby profile for the last five **completed night windows**, not simply five calendar-day buckets. That matters when a bedtime starts before midnight and the next feed happens after it.

Inside those nights, the engine includes entries only when they are:

- logged as a feed
- marked as happening at night
- not marked as a scheduled dream feed
- not solids

A feed logged from a night wake still counts. That is appropriate: a wake-resume feed is part of the pattern the plan is trying to understand.

Dream feeds are deliberately excluded because they are scheduled rather than triggered by a genuine wake. Solids are excluded because they are not a milk feed and may be stored in grams; mixing grams into a millilitre baseline would make the number meaningless. It also avoids suggesting that more solids are a sleep intervention. The [NHS guide to first solid foods](https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/) says milk remains an important source of energy and nutrients during the first year, and starting solids does not make a baby more likely to sleep through.

## What “average” means here

Suppose the five-night history looks like this:

| Completed night | Qualifying feeds | Measured total |
|---|---:|---:|
| Night A | 2 | 210ml |
| Night B | 1 | 150ml |
| Night C | 0 | — |
| Night D | no logging | — |
| Night E | 1 dream feed only | excluded |

The baseline uses Nights A and B. It reports:

- **2 feeding nights**
- **1.5 feeds per feeding night**
- **180ml average measured overnight volume**

The zero-feed, empty and dream-feed-only nights do not enter the denominator. In other words, this is the average **on recent nights when a genuine night feed was logged**, not the average across every night in the five-night span.

That choice prevents missing logs from being mistaken for beautifully feed-free nights. It also means the number can sound higher than an all-nights average. OBubba needs two feeding nights before it calls the baseline usable; one unusual night cannot launch a milk-reduction plan.

![OBubba’s current Night Weaning screen shows three readiness lights for age, daytime feeds and recent nights.](/obubba-night-weaning-readiness-app.jpg "The three green lights are transparent software checks. They help prevent a plan launching too early or without logs, but they do not replace an individual feeding or growth assessment.")

## Step 2: three software gates must pass

The current screen checks:

1. **Age:** corrected age is at least 26 weeks, roughly 6 months.
2. **Day:** at least one of the last five calendar days contains three or more non-night feed entries.
3. **Nights:** at least two of the last five completed nights contain a qualifying night feed.

The daytime check is worth reading precisely. It is the **best single day** in the five-day lookback, not an average of three feeds every day. Three small snack feeds logged on Tuesday could turn the light green even if the rest of the daytime record is sparse.

So the lights mean “the app has crossed its minimum gates.” They do not confirm that daytime milk and food are nutritionally sufficient, that growth is on track or that every night wake is ready to lose its feed.

The NHS notes that for some babies aged 6–12 months night feeds may no longer be necessary, while hunger, teething and other factors can still wake babies ([Helping your baby to sleep](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/)). “Some” is doing important work there.

## Step 3A: measured milk becomes a volume taper

If any qualifying feed has a recorded amount and the resulting average is above zero, OBubba chooses the measured-volume branch.

Night 1 repeats the calculated baseline. Nights 2–7 move in six roughly equal steps toward the final target.

For an 8-month-old with a 180ml baseline, the current targets are:

| Plan night | Overnight total target |
|---|---:|
| 1 | 180ml |
| 2 | 158ml |
| 3 | 135ml |
| 4 | 113ml |
| 5 | 90ml |
| 6 | 68ml |
| 7 | 45ml |

Why 45ml rather than zero? Below 52 corrected weeks, the engine aims for about one quarter of the baseline, normally constrained to a 40–120ml range and never allowed to rise above the starting amount. That last protection matters for a tiny 30ml baseline: the plan stays flat or descends; it never tells a parent to increase 30ml to a 40ml “floor.”

At 52 weeks or older, the same 180ml example can taper to zero: 180, 150, 120, 90, 60, 30, 0ml.

These are total overnight targets, not a demand to refuse milk at a particular wake. The in-app wording repeatedly says to soothe first, keep daytime feeds full and accept that some babies take two or three weeks. Responsive feeding still matters. NHS bottle-feeding guidance says to respond to feeding cues, never force a baby to finish a bottle, and not assume a larger feed will create a longer interval ([Feeding on demand](https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/bottle-feeding/bottle-feeding-your-baby/feeding-on-demand/)).

## Step 3B: no measured volume becomes a comfort-and-time plan

When recent night feeds have no logged millilitres, the engine does not invent them. It uses this sequence instead:

| Night | Current focus |
|---|---|
| 1 | Feed normally and notice which wakes lead to a feed |
| 2 | Shorten the first feed by about 2 minutes; soothe first |
| 3 | Shorten the first two feeds; pause 5–10 minutes before feeding |
| 4 | Soothe first at every wake; feed if still unsettled after about 10 minutes |
| 5 | Drop one feed and offer comfort instead |
| 6 | Keep feeds short and respond with reassurance first |
| 7 | Aim for most wakes to settle without milk; a feed or two is still okay |

This branch is practical for breastfeeding because feed duration can be noticed without pretending minutes equal millilitres. But duration is an imperfect proxy for intake, and the sequence currently does not change at 12 months in the same way the volume branch does.

That makes individual context essential. The [NHS guide to stopping breastfeeding](https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding/how-to-stop/) recommends dropping feeds gradually and explains that a child under 1 still needs a replacement milk feed when a breastfeed is removed. Some families also choose to keep night feeds while reducing daytime feeds. Another national parenting source, Australia’s Raising Children Network, advises considering night-weaning healthy breastfed children from 12 months because earlier reduction can affect supply, while discussing earlier phasing for formula-fed babies over 6 months ([Night weaning](https://raisingchildren.net.au/toddlers/sleep/better-sleep-settling/night-weaning)). Guidance varies because babies and feeding relationships vary.

## The mixed-feeding edge case parents should know

The current branch decision flips to “measured” if **any** relevant night feed contains an amount.

Imagine two nights each include a breastfeed with no volume plus one 90ml bottle. The feed-count average sees both breast and bottle feeds. But the volume average uses only nights with measured volume and can only total the 90ml bottles. The plan may then display 90ml as its starting volume even though that is not the baby’s total overnight milk intake.

For mixed feeding, do not interpret that target as a complete intake calculation unless all relevant milk was meaningfully measured. A safer product improvement would let the parent explicitly choose **measured bottle taper**, **breastfeeding/time plan** or **mixed plan**, then explain exactly which entries were used.

## The baseline can currently move after you start

This is the most important implementation limitation we found.

The screen recalculates the baseline and plan from the rolling last five completed nights every time it builds. It saves whether the plan started, the current night and the start date—but it does **not** save a snapshot of the original baseline or the seven targets.

As a new plan night enters the window and an older night leaves, the displayed baseline can change. If volumes are already reducing, later targets may be recalculated from that lower number. The personalised plan is therefore adaptive, but not fixed to its starting promise.

That might feel encouraging when targets fall, but it makes the experiment harder to interpret. The clearest future implementation would freeze:

- the five-night evidence summary
- feeding-mode choice
- corrected age at start
- all seven targets
- the date and app version that created them

Then new logs could be shown as progress beside the original plan rather than silently rewriting it.

## The night counter respects real time

OBubba does protect the pacing. Starting the plan stores today’s local date. Tapping **Mark tonight done** cannot move the counter beyond the number of calendar nights that have actually elapsed. The seventh completion moves the internal counter to 8 so the success card can appear.

Progress is saved under the selected baby’s code on that device. The screen binds itself to the baby who was open when it mounted, reducing the risk that switching profiles writes one child’s progress under another child. Stopping the plan requires confirmation and resets it to Night 1.

The trade-off: this progress is local device state, not shared family state. A partner can log feeds, but should not assume the plan-night button is synchronised across phones.

## When to slow down or stop

The app itself advises pausing or repeating after a night with at least five wakes or 90 minutes awake. Treat that as a compassionate pacing cue, not the only reason to stop.

Pause the reduction and get individual advice if your baby is unwell, seems unusually sleepy or hard to rouse, has fewer wet nappies, feeds poorly in the day, has growth or weight concerns, was premature and corrected age is uncertain, or if feeding is painful or supply is a concern. Speak with your health visitor, GP, paediatrician or infant-feeding specialist before reducing feeds when you are unsure.

No plan should override clear hunger cues. Comforting first can help distinguish a brief resettle from hunger; it should not become a rule that a hungry baby must wait out.

## This plan is not the same as “Night feeds are dropping”

OBubba has a separate trend card, explained in [Why OBubba says night feeds are dropping](/blog/why-obubba-says-night-feeds-are-dropping/).

The two features use different evidence:

| Feature | Lookback | Minimum evidence | Purpose |
|---|---|---|---|
| Seven-night plan | Last 5 completed nights | 2 nights with genuine night feeds | Build a starting baseline and taper |
| Feed trend | 14 night slots | At least 4 logged nights in each week | Compare this week with the previous week |

The readiness lights are also explored in [Is my baby ready to night-wean?](/blog/is-my-baby-ready-to-night-wean/). The present article goes one layer deeper: how the plan is calculated after those lights appear.

## The helpful takeaway

The best part of OBubba’s current approach is that it starts with **your baby’s record**. It excludes dream feeds and solids, refuses to build from a single feeding night, keeps under-one measured plans above zero and paces progress by real dates. It also gives unmeasured breastfeeding its own language instead of fabricating bottle numbers.

The honest cautions are just as useful: the daytime light is a low software threshold, mixed feeding can make the volume baseline incomplete, the breastfeeding path needs more age-specific nuance, and the starting baseline currently rolls during the plan.

Use the plan as a structured conversation with your logs—not a command to ignore your baby. If tonight says “hungry,” feed. If the week says “too fast,” repeat a step. A genuinely personalised parenting app should help you notice and decide, while leaving room for your baby, your feeding relationship and professional advice.

## FAQs

### Does OBubba include dream feeds in the night-weaning baseline?

No. Scheduled dream feeds are excluded. Wake-linked night feeds still count.

### Does a night with no feed count as zero?

Not in the baseline average. Nights without a qualifying night feed are skipped, which also prevents missing logging from looking like successful weaning.

### Why is my under-one plan not reaching zero millilitres?

The current engine deliberately retains a small final allowance below 52 corrected weeks. It can generate a zero target from 52 weeks onward.

### Why did my target change after I started?

The app currently recalculates from the latest five completed nights instead of freezing the starting baseline. New lower-volume nights can therefore change later targets.

### Can I use the ml plan if I combine breast and bottle feeds?

Be cautious. Any measured feed can select the volume branch, while unmeasured breastfeeds are not represented in the ml total. The target may describe measured bottles, not total overnight milk.

### Will more solids make night-weaning easier?

Do not add solids as a sleep fix. Around the start of complementary feeding, milk remains central and the NHS says starting solids does not make sleeping through more likely.

### Is the plan synced with my partner’s phone?

The current plan position is stored locally per child. Treat one device as the plan controller, even if both caregivers contribute logs.

