---
title: "Both Parents Logged the Same Baby Wake—Will OBubba Count It Twice?"
slug: both-parents-logged-same-baby-wake-obubba
description: "Two carers logged one 2am wake. See exactly how OBubba de-duplicates near-simultaneous wakes, overlapping sleep and nap records without hiding real events."
date: 2027-02-14
updated: 2027-02-14
author: OBubba
tags: both parents logged same baby wake, duplicate baby wake log, OBubba shared baby tracker, baby sleep tracker for two parents, partner baby tracker, shared care sleep log, duplicate night wake, family sharing baby app
heroImage: /obubba-both-parents-logged-same-wake.jpg
---

It is 2am. One parent taps **Wake** while settling the baby. The other hears the crying, opens the shared tracker and records it too. In the morning there are two entries—2:00 and 2:02—for one physical waking.

**OBubba's current Flutter sleep engine treats near-simultaneous night-wake entries within three minutes as one waking for its sleep calculations. It keeps the earliest time and the most useful resolved duration, so the wake count and actual-sleep total are not doubled.**

That is a calculation safeguard, not a silent eraser. The original timeline entries can still exist for you to inspect or correct. OBubba protects the analysis while leaving human meaning in human hands.

## The 2am example

Suppose two connected carers record:

| Shared timeline | What they meant |
|---|---|
| Carer A: wake at 2:00am, awake 20 minutes | The baby woke once |
| Carer B: wake at 2:02am, awake 25 minutes | The same waking, timed slightly differently |

For the canonical night read, OBubba groups those wakes because they are no more than three minutes apart. The result is:

- **one** waking, not two
- **2:00am** as the event time
- **25 minutes** as the resolved awake duration
- 25 minutes deducted from sleep **once**, not 20 + 25

![A mobile-readable diagram showing two carers' near-simultaneous wake logs becoming one canonical wake, with awake time deducted once.](/obubba-shared-wake-dedup-logic.svg "Two entries remain inspectable, while OBubba's canonical sleep calculation treats the near-simultaneous pair as one physical waking.")

This keeps several answers in agreement: number of wakes, total awake minutes, longest stretch and actual night sleep. A duplicate should not make one difficult resettle look like two wakings or remove twice as much sleep.

## The exact rule the Flutter app uses

The current engine sorts night wakes chronologically, then compares each one with the growing set of accepted events.

### Wakes within three minutes are grouped

The comparison is inclusive: zero, one, two or three minutes apart can be treated as the same waking. It also understands midnight correctly, so 11:59pm and 12:01am are two minutes apart—not 1,438 minutes apart.

Sorting first matters. If a device delivers entries in an unexpected order, storage order should not change the answer.

### The earliest time survives

If one phone says 2:00am and the other says 2:02am, the canonical event begins at 2:00am. OBubba does not average the times into an invented 2:01am.

### The better duration survives

If both wake entries are closed, the longer logged duration is kept. That is safer than adding the durations, which would count the same awake period twice.

There is a useful edge case too: one parent may leave **Pause** open while the other records that the baby resettled after 25 minutes. The resolved duration wins over the still-open placeholder. A completed event is stronger evidence than a timer that was never resumed.

### Separate wakes stay separate

Two wake entries more than three minutes apart are not automatically merged as duplicate wake taps. If the baby stirred at 2:00am, resettled, then genuinely woke again later, both events can count.

This is intentionally conservative. Time proximity is useful evidence, but OBubba should not rewrite two real wakings into one just because a night was busy.

## What if a feed was logged during the same waking?

A feed does not necessarily mean a second wake.

If the baby woke, stayed awake and was fed during that settling episode, OBubba can fold the feed into the existing waking rather than manufacture another one. A feed close to a logged wake, or inside its observed awake window, belongs to that same episode. Dream feeds and feeds already linked through a wake do not create an extra wake either.

The app still preserves genuinely separate events. For example, a short two-minute stir that clearly ended and a feed-waking 25 minutes later remain two wakes. The known duration tells the engine the baby had already resettled.

That distinction is the point: **OBubba uses the evidence you recorded, not a blanket “all nearby events are duplicates” rule.**

## Overlapping sleep records are counted once too

Duplicate tracking can affect more than wake count. Imagine both phones save the same 7pm-to-7am sleep arc. Naïvely adding them would report 24 hours of night sleep.

OBubba unions overlapping and nested night-sleep periods before calculating the total. Two identical 12-hour arcs remain a 12-hour night. A smaller sleep arc nested inside the main one does not inflate it either.

The same principle applies to completed naps:

- overlapping or nested nap records are merged before nap count and day-sleep total
- genuinely separate naps remain separate
- back-to-back naps are not collapsed merely because one ends when another begins
- a timed mid-nap stir is deducted once when two carers log the same stir within three minutes

This also protects the next-sleep calculation. A nested duplicate nap should not move “awake since” backwards to the shorter record's end and falsely suggest that the baby has been awake longer than they have.

## What OBubba does—and does not—fix automatically

| Situation | Canonical calculation |
|---|---|
| Two night wakes within 3 minutes | One waking; earliest time and best resolved duration |
| Same timed wake recorded twice | Awake duration deducted once |
| Two overlapping sleep or nap arcs | Overlap counted once |
| Feed during an existing awake episode | Usually part of the same waking |
| Two wakes more than 3 minutes apart | Preserved as separate events |
| Two independently created similar bottles | Not assumed to be one bottle |
| Wake with no duration | Counted, but OBubba does not invent minutes to subtract |

That last distinction is important. OBubba can safely canonicalise sleep mathematics without pretending to know every real-world fact. Two similar feeds could be a duplicate, a top-up or two separate feeds. Automatically deleting one would be riskier than asking a carer to check.

## Why you may still see both entries on the timeline

The sleep engine and the event history have different jobs.

The event history is an audit trail of what each phone saved. The canonical sleep calculation asks, “How many physical wakings and how much actual sleep does this evidence represent?”

So you may see two independently created entries while the insight reads one wake. That is not the app contradicting itself. It means OBubba has avoided distorting the sleep answer without destructively guessing which carer's record should disappear.

If the entries really describe one event, keep the clearer one and correct the other when convenient. If they describe two genuine events, adjust the times or details so the history reflects what happened.

## Make shared night tracking calmer

The best de-duplication is still a simple household handover:

1. Use **Connect—live sync** so both phones share the same changing baby record.
2. Let the person doing the care log the event.
3. At shift change, check the last wake, feed, nappy and any running timer.
4. Before backfilling from memory, refresh the timeline.
5. Correct an existing event instead of creating a second candidate.

![The genuine OBubba Flutter connection screen where a second carer chooses Connect—live sync to share the same changing baby record.](/obubba-shared-care-live-sync-app.jpg "OBubba Family Sharing connects another phone to the same live baby timeline; importing a separate copy is a different choice.")

On the phone with the baby's existing history, open **Account → Family sharing → Share with family** and send the baby's sync code privately. On the second phone, choose **Connect another device**, enter that code and select **Connect—live sync**.

Do not choose a separate imported copy when your aim is a shared household timeline. A separate copy is deliberately independent, so later changes do not flow between phones.

For the full setup, privacy and access-removal details, read [how to share a baby tracker with your partner without duplicate logs](/blog/share-baby-tracker-with-partner-without-duplicate-logs.html). If you want to understand the actual-sleep arithmetic beyond duplicate events, see [how much your baby actually slept last night](/blog/how-much-baby-actually-slept-last-night.html).

## The quiet promise behind shared care

A good two-parent tracker should not make carers coordinate perfectly at 2am before it can tell the truth in the morning.

OBubba still encourages one clean timeline, but its Flutter engine is deliberately hardened for the messiness of real care: two phones, delayed sync, open timers, nested naps and one waking recorded twice by two attentive people.

**[Try OBubba free →](/app.html)** — share one live baby timeline and get sleep answers designed not to punish a duplicate tap.

## Quick answers

### Will OBubba delete my partner's duplicate wake?

Not merely because the times are close. The canonical sleep calculation can treat the pair as one physical wake, while the original entries remain available to review or edit.

### What is the duplicate-wake window?

Up to and including three minutes between night-wake entries, with midnight handled correctly.

### Which awake duration does it use?

For two resolved duplicates, OBubba keeps the longer duration. If one copy is still open and the other is resolved, it prefers the resolved duration.

### Can two real wakes be merged accidentally?

Near-simultaneous wake taps are treated as one event for calculation, so correct the timeline if two genuinely distinct events were recorded within three minutes. Events more than three minutes apart remain separate under this rule.

### Does OBubba also de-duplicate feeds?

Near-simultaneous night feeds can be counted once, and a feed during an existing awake episode need not create another wake. OBubba does not automatically erase two independently created feed records just because their times or amounts look similar.

