---
title: "Can I Ask OBubba If My Baby Is Asleep? Inside Luna’s ‘Right Now’ Answer"
slug: can-i-ask-obubba-if-baby-is-asleep-luna-live-status
description: "Ask Luna whether your baby is asleep or awake and see exactly which OBubba logs support the answer—without a camera, microphone or generative-AI guess."
date: 2027-04-30
updated: 2027-04-30
author: OBubba
tags: is my baby asleep app, ask baby tracker current status, OBubba Luna, baby sleep timer app, baby awake time tracker, baby wake window assistant, baby tracker without camera, private baby tracker AI, what is my baby doing now, baby nap timer, baby routine assistant UK, baby sleep app privacy
heroImage: /obubba-luna-is-baby-asleep.jpg
---

You hand the baby over, walk into a meeting, then wonder: **Did the nap finally happen?** Or your partner is settling upstairs and you cannot remember whether the sleep timer was started.

In OBubba’s current Flutter app, you can ask Luna:

- “Is Oliver asleep?”
- “Is she awake yet?”
- “What’s my baby doing right now?”

Luna now answers from the selected baby’s live OBubba record. If a nap or night-sleep timer is open, the reply says the baby is asleep. If there is no open timer but a recent wake or completed sleep exists, Luna says the baby is awake and can place the elapsed awake time beside an age-aware starting wake window. With too little evidence, it refuses to guess.

There is one essential translation:

> **“Oliver is asleep” means “OBubba has an open sleep timer for Oliver.” It is a reading of the family’s log—not camera, microphone, wearable or medical confirmation.**

That honest boundary is what makes the feature useful rather than creepy. Luna turns a scattered day log into a one-sentence handover, while leaving real-world observation and safer-sleep decisions with the carer.

## The 30-second answer

| Parent asks | What the current Flutter app checks |
|---|---|
| “Is he asleep?” | Is there an open nap or night-sleep entry that has already started? |
| “Is she awake?” | Is there no open sleep, plus a recent daytime wake or completed nap/sleep end? |
| “How long awake?” | Phone-clock minutes since the latest eligible wake anchor today. |
| “Why does Luna think that?” | Open timer status, last milk feed, completed nap count and calculated daytime sleep. |
| Nothing useful logged | Luna says it cannot give a confident live read and asks for a wake or sleep log. |
| Does Luna watch the nursery? | No. There is no camera or live-monitor signal in this implementation. |
| Does generative AI decide? | No. This question uses a deterministic app rule and is never sent to the AI-answer path. |

![How Luna answers a live-status question: safety language is checked first, then the app reads the selected baby’s current log and returns asleep, awake or not enough evidence without calling a generative model.](/obubba-luna-live-status-logic.svg "The current Flutter decision path. Luna reads an open timer or today’s latest wake anchor; it does not observe the baby through a camera or infer an unseen state.")

## Where to ask Luna

Open **Luna** and type the question into **Message Luna…**. The new handler recognises several natural forms, including:

- “What’s Oliver doing now?”
- “What is she up to?”
- “Is Oliver asleep?”
- “Is she awake yet?”
- “Is he down for a nap now?”
- “What’s happening at the moment?”

The recognition is deliberately narrow. A question such as **“Is she sleeping through the night?”** is not treated as a request for the current timer state. Neither is **“How many naps should he have?”** Those remain pattern or advice questions.

This prevents the word “sleeping” from swallowing every sleep question into a live-status answer.

![The genuine OBubba Flutter Luna screen answering “Is Oliver asleep?” with “Oliver is asleep right now — there’s an open sleep timer going.”](/obubba-luna-is-baby-asleep-app.jpg "A current Flutter capture using fictional review data. The response states the evidence in the answer itself: an open sleep timer is running.")

## What happens when an open timer exists

Luna scans today’s entries for either:

- type `nap`, or
- type `sleep`

The entry must have a start time at or before now and no end time. If any entry meets those conditions, the live verdict becomes **asleep**.

The returned sentence is:

**“Oliver is asleep right now — there’s an open sleep timer going.”**

That second half is excellent product copy because it exposes the evidence rather than hiding it behind “Luna knows”. A parent can immediately challenge the answer: *Did we actually start that timer? Did somebody forget to stop it?*

The answer does not try to identify sleep stage, depth, movement, breathing or whether the baby has briefly stirred. It does not distinguish a nap from night sleep in the headline. It simply reports the state of the open log.

### What if the timer is stale?

If a parent forgot to stop yesterday’s or today’s timer, the live answer can be wrong about the baby in front of them. The same is true in reverse: a sleeping baby with no timer will not be magically detected.

That is not a reason to abandon the feature. It is a reason to phrase the answer even more precisely:

**“OBubba’s timer says Oliver is asleep.”**

The app should also offer **Stop or edit timer** directly beneath a live-status answer, making correction easier than navigating back to Track.

## How Luna decides the baby is awake

When there is no open sleep timer, Luna looks for the most recent eligible awake anchor today:

- a non-night **wake** entry; or
- the end of a completed **nap** or **sleep** entry.

The newest eligible time at or before the current phone time wins. Luna subtracts that anchor from now to calculate minutes awake.

If age is available, the app gets its age-aware starting wake-window range and classifies the current point with a ten-minute buffer:

- more than 10 minutes below the minimum — **still early / probably not ready**;
- inside the range plus buffer — **ready / in the sweet spot**;
- more than 10 minutes above the maximum — **a little past the usual window**.

The answer can then say:

**“Oliver is awake and right in the sweet spot of the wake window.”**

Its evidence line shows how long Oliver has been awake and the age-aware starting range.

This is helpful arithmetic, not proof of tiredness. The live-status context uses an age-based starting window, not every signal in OBubba’s richer adaptive prediction path. A feed, teething discomfort, illness, a short previous nap or the baby’s behaviour may matter more than the label.

The [NHS notes that babies differ and their sleep patterns change as they grow](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/your-babys-sleep-patterns/). “Ready” should therefore mean **the logged timing has entered a plausible starting zone**, not “the app has determined that sleep must begin now”.

## What appears under “Why Luna thinks this”

The reply can include three supporting facts.

### 1. Last milk feed

Luna finds the latest milk-feed entry today and describes how long ago it was. Solids entries are excluded from this milk read, preventing a purée from appearing as though it were a bottle.

This is context, not a feeding deadline. The current feature does not use the live-status answer to decide whether a baby should be fed.

### 2. Completed naps today

Only naps with a valid start and end count towards **“2 naps so far today.”** An open nap supports the asleep verdict but is not yet a completed nap in this count.

### 3. Daytime sleep

OBubba uses its shared daytime-sleep calculation rather than simply adding raw timer arcs. If a timed mid-nap wake or resettle was logged, the known awake minutes are deducted. That keeps Luna’s evidence aligned with the day-sleep tile, reports and other sleep calculations.

Together, these details make the answer a compact handover:

**Awake now · awake 2h 10m · last feed 45m ago · 2 naps / 2h 10m day sleep.**

It saves a partner from opening four screens and doing the subtraction mentally.

## What happens when the evidence is missing

Luna has two honest fallback states.

If nothing is logged for the baby today:

**“Nothing’s logged for Oliver yet today, so I can’t give a live read.”**

If the day contains logs but there is no open timer or recent eligible wake:

**“I don’t have a confident live read this moment.”**

Both answers suggest logging a wake or starting a nap. Neither invents a state from a generic routine, yesterday’s bedtime or the baby’s age.

That restraint is a real differentiator. A convincing fabricated answer would be worse than a useful refusal.

## Why this answer does not call generative AI

Luna can use a richer model for some open-ended advice when the relevant configuration and parental consent allow it. Live status deliberately takes a different path.

The Flutter intent is marked deterministic and excluded from model escalation. The app already has the evidence it needs:

1. open timer or no open timer;
2. latest wake anchor;
3. elapsed phone-clock time;
4. last milk feed;
5. completed naps and daytime sleep.

A model would not improve those facts. It could only paraphrase them, drift from them or claim certainty the log does not possess.

This also means asking **“Is Oliver asleep?”** does not need to send that question and the baby’s current log context to a third-party generative model. The answer is constructed inside the app’s rule engine.

That statement is specific to this live-status answer. It does not mean every Luna question follows the same processing route, nor does it mean the family’s OBubba records are never synced through the app’s separate data systems.

## What Luna cannot see

The current source explicitly leaves the live-monitor note empty because there is no nursery-camera read in this build.

Luna cannot see:

- whether the baby’s eyes are open;
- whether they are breathing normally;
- whether they are comfortable or too hot;
- whether a partner settled them without starting the timer;
- whether an open timer was forgotten;
- whether a feed recorded on another device has synced this second;
- whether a baby who stirred has resettled;
- whether the sleep environment is safe.

For babies under six months, the [NHS safer-sleep guidance](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/) says the safest place is in a cot, on their back, in the same room as you. It also recommends a firm, flat mattress and keeping the cot clear of items that could cover the face or cause overheating.

An app answer never replaces checking the baby or following safer-sleep guidance. If a baby is difficult to wake, unresponsive, not breathing normally or you are otherwise seriously concerned, use emergency services—not Luna.

## Five situations where the feature is genuinely useful

### 1. Partner handover

One parent starts the nap; the other opens Luna later and checks the shared working record without interrupting the settling room.

### 2. Grandparent care

A grandparent can ask a natural question instead of learning which chart or timer icon to interpret—provided the relevant log has reached that device.

### 3. Returning from work

“What’s Oliver doing now?” gives a small summary of sleep state, feed recency and naps before the parent walks through the door.

### 4. Exhausted arithmetic

The app calculates elapsed awake time from the latest logged wake or sleep end. Nobody has to subtract 10:42 from 13:07 while holding a fussy baby.

### 5. Catching a bad log

If Luna says asleep while the baby is clearly crawling across the floor, the contradiction reveals an open timer that needs fixing.

## Questions the feature intentionally keeps separate

| Question | Why it is not a live-status answer |
|---|---|
| “Is she sleeping through the night?” | asks about a pattern across a night, not the current timer |
| “Why is he waking every two hours?” | asks for interpretation of repeated wakes |
| “How many naps should she have?” | asks for age/context guidance |
| “When should bedtime be?” | asks for a prediction or plan |
| “Is a newborn awake much?” | asks general developmental information |

This separation matters for safety too. Emergency-language checks occur before live-status routing. A serious concern should never be reduced to “the timer says asleep”.

## What OBubba should improve next

The new intent fixes a surprisingly common assistant failure: simple present-tense questions previously fell into general search and could match an unrelated help card. The deterministic route is the right foundation. To make it best-in-class, OBubba should now:

- say **“The OBubba timer says…”** instead of asserting observed sleep;
- show the timer’s start time and which carer/device last changed it;
- add **Stop**, **Edit start** and **Mark awake** actions below the reply;
- warn when an open timer is implausibly long;
- show when the supporting record last synced;
- distinguish **nap timer** from **night-sleep timer**;
- make “Why Luna thinks this” open by default for a first live-status question;
- label the wake window as an age-aware starting range, not a verdict;
- use the same personalised/contextual wake-window source as Track where appropriate;
- let the parent ask “What changed since I left?” for a concise handover delta;
- provide a tappable route to the exact underlying logs;
- localise the answer and recognised question patterns across every supported app language;
- keep the no-model path as the feature grows.

The north-star version would answer: **“OBubba’s nap timer has been open since 1:12pm, started by Sam. Last synced 30 seconds ago. Oliver has had one completed nap today.”** That is transparent, useful and easy to correct.

## The honest verdict

“What’s my baby doing now?” sounds like a futuristic AI feature. OBubba’s implementation is better because it is less magical.

Luna checks a small set of facts the family already recorded, uses a tightly scoped intent, bypasses generic search, avoids the generative-model path and admits when the evidence is missing. The answer is quick because no intelligence theatre is required.

Its biggest weakness is wording. An open timer proves what the app currently records, not what the baby is physiologically doing. Change **“Oliver is asleep”** to **“Oliver’s sleep timer is running”**, add one-tap correction and the feature becomes a trustworthy shared-care shortcut.

That is exactly the kind of usefulness a parent should feel from OBubba: fewer screens, less arithmetic, no pretending the app can see through walls.

**[Ask Luna from your baby’s real day →](/app.html)** — track sleep, feeds and wake time once, then turn the family log into calm answers without asking a generic chatbot to guess.

## Frequently asked questions

### Can Luna tell whether my baby is asleep?

Luna can tell whether OBubba has an open nap or night-sleep timer. It cannot independently observe or confirm sleep.

### Does OBubba use the phone camera or microphone?

Not for this feature. The current live-status answer reads logged entries only, and the source contains no live nursery-camera signal.

### Is the question sent to generative AI?

No. The live-status intent is deterministic and explicitly excluded from model escalation.

### What makes Luna say my baby is awake?

There must be no open sleep timer plus a recent non-night wake or completed sleep/nap end today. Luna calculates elapsed awake time from the latest one.

### Why does Luna say it cannot tell?

There may be no logs today, or today’s logs may not contain an open sleep timer or recent eligible wake anchor.

### Does Luna use corrected age for a premature baby?

Where corrected age is available, the coach context uses it for age-aware sleep reasoning. If corrected age is unavailable, the broader age lookup can use chronological age.

### Does an open nap count as a completed nap?

No. It can trigger the asleep verdict, but the “naps so far” evidence counts only valid completed naps.

### Can a forgotten timer make the answer wrong?

Yes. Luna reports the log faithfully. A stale open timer can make the record say asleep when the baby is awake.

### Does Luna’s awake label replace sleepy cues?

No. It is age-aware timing arithmetic. Feeding, comfort, illness, recent sleep and the baby’s behaviour still matter.

### Can Luna confirm the cot is safe?

No. It has no visual feed and cannot assess the sleep space. Follow current safer-sleep guidance and check the baby directly.

## Related OBubba guides

- [Is baby ready for a nap—or due a feed?](/blog/is-baby-ready-nap-feed-obubba-live-readiness-meter.html)
- [Forgot to stop the baby sleep timer?](/blog/forgot-stop-baby-sleep-timer-fix-log.html)
- [Why did my baby’s next nap time change?](/blog/why-did-baby-next-nap-time-change.html)
- [Can two parents use OBubba in different languages?](/blog/can-two-parents-use-obubba-different-languages.html)

## Sources and further reading

- [NHS Best Start in Life: Your baby’s sleep patterns](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/your-babys-sleep-patterns/)
- [NHS Best Start in Life: Safer sleep advice for babies](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/)

*This article describes the current OBubba Flutter implementation reviewed on 30 April 2027. Luna’s live-status answer reports logged app state; it is not a monitor, medical device, safer-sleep assessment or substitute for checking a baby directly.*
