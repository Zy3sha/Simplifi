---
title: "Why Does OBubba Say ‘One Breast Is Doing Nearly All the Work’?"
slug: why-obubba-says-one-breast-doing-most-work
description: "The exact Flutter threshold behind OBubba’s one-sided breastfeeding alert, why minutes are not milk transfer, and what to do if a breast feels full or painful."
date: 2027-01-19
updated: 2027-01-19
author: OBubba
tags: one breast doing all the work, baby feeds from one breast only, OBubba breastfeeding tracker, baby prefers one breast, breastfeeding side imbalance, one breast engorged, alternate breasts breastfeeding, mastitis signs breastfeeding, left right breastfeeding timer, breastfeeding app UK
heroImage: /obubba-one-breast-doing-most-work.jpg
---

You open OBubba after a string of feeds and see:

> **“Your right side is doing nearly all the work.”**

Is the app saying the left breast has stopped making milk? That the baby must spend equal time on both sides? Or that mastitis has already started?

No. The current Flutter card has seen a **strong imbalance in the side information you logged**. It has not examined either breast, observed swallowing or measured milk.

![The two separate Flutter thresholds behind OBubba’s breastfeeding-side guidance.](/obubba-two-breast-side-signals.svg "The gentle seven-day balance card starts at a 60% share; the stricter five-day alert requires at least six qualifying feeds and a lesser-recorded side at 20% or below.")

## The short answer

OBubba’s stricter side alert appears when all these conditions are true:

| Check | Current Flutter rule | What it actually establishes |
|---|---|---|
| Entry type | Breastfeed, or a combination entry carrying breast-side data | The record contains a breast component |
| Time window | Today plus the previous 4 calendar days | The imbalance is recent |
| Minimum sample | At least **6 qualifying feeds** | There is more than a one-feed anecdote |
| Side evidence | Left/right minutes, or a single-side label when no minutes exist | A side can be assigned in the record |
| Strong-skew gate | Lesser-recorded side is **20% or less** of total side time | The log is extremely one-sided |

The card is medium urgency and displays its sample as “from N feeds”. It is a prompt to notice comfort, positioning and missing data—not a diagnosis of engorgement, blocked ducts, mastitis or low supply.

## OBubba has two different side signals

The app’s ordinary balance insight and its stricter alert are separate Flutter functions.

| Gentle balance card | Stricter one-sided alert |
|---|---|
| Reads up to 7 days | Reads the most recent 5 days of that series |
| Needs at least 5 side-timed feeds | Needs at least 6 qualifying feeds |
| Appears when one side is **60% or more** | Appears when the other side is **20% or less**—equivalent to the dominant side being at least 80% |
| Low urgency | Medium urgency |
| Says **Feeding leans to one side** | Says one named side is doing nearly all the work |
| Encourages noticing the pattern | Adds discomfort and mastitis context |

On a very one-sided record, both functions can return a result. The stricter card sorts ahead because medium urgency is prioritised over low urgency. The daily Guidance surface groups related feeding reads together rather than treating them as unrelated problems.

That is why the app can move from a quiet “leans left” note to a more prominent “right side is doing nearly all the work” alert without changing the underlying subject: the threshold changed from noticeable drift to an extreme recorded skew.

## Exactly what the detector counts

For each qualifying feed, the function looks for:

- `breastL` minutes;
- `breastR` minutes; or
- an explicit `L` or `R` side when neither minute field is present.

If either minute field is present, the actual recorded numbers are added. If both are absent but one side was selected, the engine adds a **nominal 10-minute block** to that side so a side-only log can still contribute.

That 10 is an internal counting device. It is not a claim that the feed lasted ten minutes or that ten minutes of milk was transferred.

The detector includes:

- breast-only feed entries; and
- combination-feed entries when they carry real left/right breast data.

It does not use:

- bottle volumes;
- solids;
- pumping sessions;
- breast fullness or pain;
- visible swallowing;
- latch quality;
- nappy output;
- weight; or
- the reason one side was offered.

There is also **no age gate** in this detector. The same record rule can run for a newborn or an older breastfeeding child. The right response may be very different, which is why the card cannot replace individual feeding advice.

## A worked example

Suppose seven feeds across the last few days contain:

| Feed | Left recorded | Right recorded |
|---|---:|---:|
| 1 | 0 min | 16 min |
| 2 | 0 min | 14 min |
| 3 | 4 min | 15 min |
| 4 | 0 min | 13 min |
| 5 | 0 min | 12 min |
| 6 | 6 min | 10 min |
| 7 | 0 min | 10 min |
| **Total** | **10 min** | **90 min** |

Left is 10% of the recorded total. The lesser side is below the 20% gate, so the dynamic title names the right as the side doing nearly all the work. The body reports that only about 10% was recorded on the left.

The calculation is accurate for those fields. The interpretation is still limited.

Perhaps the baby swallowed efficiently for six minutes on the left and comfort-sucked for twelve on the right. Perhaps the parent forgot to switch the timer. Perhaps a second side was offered but not recorded. Perhaps one breast normally has a faster flow. None of that is available to the detector.

## Minutes are not milk transfer

Breasts are not matched measuring jugs, and babies are not identical pumps.

A longer clock time can mean:

- active swallowing;
- pauses and dozing;
- comfort sucking;
- a slower let-down;
- a position that feels easier on that side; or
- a timer left running.

A shorter feed can still transfer plenty of milk. One breast may naturally make more. Some babies take one side per feed; others take both. The NHS notes that parents can offer both breasts and switch the starting breast, but responsive feeding still means following the baby rather than enforcing identical minutes.

So the percentage should be read as:

> “Of the left/right time entered into OBubba, this was the share on each side.”

It should **not** be read as:

> “This was the share of milk the baby drank, or the share each breast produced.”

## Why the card might be wrong for your real situation

### The second side was not logged

If the timer stopped after the first side and the second was never added, the app sees a single-sided feed.

### A side-only tap becomes a nominal block

Six right-side labels with no durations can satisfy the sample gate. Internally each becomes ten units on the right. That preserves a useful pattern, but it is coarser than a real timer record.

### Combination feeds are included

If an entry contains breastfeeding plus a top-up, its breast minutes still count. The bottle amount does not rebalance the left/right breast calculation.

### Pumping is outside this detector

A parent may nurse mostly on the right and express the left effectively. The breastfeeding-side alert cannot see pump drainage because it does not read pump entries.

### One-sided feeding may be intentional

Positioning advice, previous surgery, pain, a fast let-down, twins, tandem feeding, a temporary wound or an individual plan may explain the pattern. Do not overturn that plan because of an app percentage.

### Today is unfinished

The five-day window includes today. A run of early-day feeds on one side can make the current window look more skewed before later feeds happen.

## What to do if there is no pain or fullness

Start with the record, not a corrective programme.

1. Open the recent feeds and check whether second-side minutes are missing.
2. Notice which side was offered first—not whether the minutes are perfectly equal.
3. At the next feed, offer the side that feels appropriate and let the baby feed responsively.
4. Offer the other breast when the baby finishes or slows, without forcing it.
5. If one side is repeatedly refused, try a comfortable position and get skilled feeding support if it continues.

Do not repeatedly switch a contentedly feeding baby merely to make the chart symmetrical. A percentage is not a target.

## What to do if a breast feels uncomfortably full

Current NHS guidance is more conservative than the wording embedded in the present Flutter card.

The card’s `why` text mentions a warm compress and gentle massage before feeds. The NHS currently advises:

- continue breastfeeding responsively;
- offer a feed if the breast feels uncomfortably full;
- if feeding is too painful or the baby will not take that breast, hand express enough for the baby or for comfort;
- avoid expressing more milk than the baby needs, because extra removal can drive more production;
- use a **cold compress** between feeds for pain and swelling;
- avoid firm pressure, deep massage, oils, soaks or creams; and
- if brief warmth helps milk flow before hand expression, do not use a lot of heat or use it for long because inflammation can increase.

This is an important boundary: a data card can prompt attention, but current clinical guidance decides the response.

## When to think about mastitis

Mastitis usually affects one breast and can come on quickly. NHS symptoms include:

- a swollen area that feels hot and painful;
- redness or a colour change, which may be harder to see on black or brown skin;
- a hard or wedge-shaped area;
- burning breast pain;
- discharge; and
- flu-like symptoms such as aches, tiredness, fever or chills.

The OBubba threshold does not detect any of these. A 90/10 chart without symptoms is not mastitis. A hot painful breast with fever matters even if the chart looks perfectly balanced.

Contact a GP or NHS 111 if symptoms get worse at any time or are not improving within 12–24 hours. Seek urgent help sooner if you are very unwell or worried.

## The genuine app support path

OBubba’s Flutter Breastfeeding screen keeps the pattern card beside calmer, parent-chosen support topics: cluster feeding, milk supply, tongue tie, growth spurts, milk flow, mastitis and routes to real help.

![The genuine OBubba Flutter Breastfeeding screen, with calm support topics and a mastitis route.](/obubba-breastfeeding-support-app.jpg "The side alert can preserve a clue; the Breastfeeding hub provides context and routes to skilled help. Neither can examine a breast or watch a feed.")

The design intent matters. The app should help a tired parent move from:

> “The graph says I have failed on one side.”

to:

> “The record is strongly one-sided. Is that intentional, incomplete, comfortable or worth showing someone?”

**[Try OBubba’s breastfeeding tracker →](/breastfeeding-tracker.html)** — time left and right, remember the starting side, keep combination feeds together and carry the useful pattern into a conversation with a midwife, health visitor or breastfeeding specialist.

## How to create a more useful record

| Log field | Useful wording | What it preserves |
|---|---|---|
| Side | Left, right or both | Which breast had an opportunity |
| Duration | Actual timer or edited minutes | Recorded time, not volume |
| Note | “Right refused; nose blocked” | A possible reason for the pattern |
| Comfort | “Left hot patch, sore since 3pm” | Symptoms and timing for help |
| Response | “Deep sucks and audible swallows” | Observed feeding behaviour |
| Action | “Spoke to health visitor at 5pm” | What advice was obtained |

Do not put off asking for help while waiting to build a better sample. Pain, fever, poor feeding, low nappy output, unusual sleepiness or growth concerns matter without six beautifully timed feeds.

## Frequently asked questions

### Does 80/20 mean one breast makes 80% of my milk?

No. It means one side holds about 80% of the recorded side time or nominal side-only units in this window. OBubba does not measure production or transfer.

### Why did the card appear after only a few days?

The strict detector uses the most recent five calendar days and needs six qualifying feeds, not five complete days of logging.

### Why do I also see “Feeding leans to one side”?

That is a separate low-urgency seven-day detector with a gentler 60% threshold. An extreme pattern can satisfy both. The stricter medium-urgency read is prioritised first.

### Should I always begin on the lesser-recorded side?

Alternating the starting side can be a helpful reminder, but comfort, fullness, attachment, the baby’s cues and an individual feeding plan come first. Do not force a painful or refused breast; get skilled help.

### Can the card diagnose a blocked duct or mastitis?

No. It has no symptom, examination or temperature input. Use symptoms and current NHS advice, not the percentage, to decide when to seek help.

### Does pumping the other side cancel the alert?

Not in this detector. It reads breast/combi feed entries, not pump sessions. Your real-world drainage may therefore be more balanced than the card shows.

### Why did no alert appear?

There may be fewer than six qualifying feeds, no usable side information, a lesser-side share above 20%, or no breast/combi entries in the five-day slice. Silence does not prove comfortable feeding or rule out mastitis.

## Sources

- [NHS: Mastitis](https://www.nhs.uk/conditions/mastitis/)
- [NHS: Breast pain and breastfeeding](https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding-problems/breast-pain/)
- [NHS Best Start in Life: Milk supply](https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/breastfeeding/breastfeeding-challenges/milk-supply/)
- [NHS Best Start in Life: Expressing breast milk](https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/breastfeeding/expressing-your-breast-milk/)

*OBubba provides records, pattern prompts and general education. It cannot measure milk supply or transfer, assess latch or breast symptoms, diagnose mastitis, or replace a midwife, health visitor, GP, NHS 111, neonatal team or breastfeeding specialist.*

