---
title: "Why Does OBubba Say ‘About That Reaction to Egg’?"
slug: why-obubba-says-about-reaction-to-egg
description: "See how OBubba reviews a logged egg reaction, prior exact-food meals, same-day confounders and preparation—and why its confidence band is not a diagnosis."
date: 2027-04-05
updated: 2027-04-05
author: OBubba
tags: about reaction to egg, baby egg allergy reaction, OBubba allergy insight, baby food reaction tracker, egg reaction baby, solids reaction log, baby allergen app, food allergy weaning, reintroduce egg after reaction, baby weaning app
heroImage: /obubba-about-reaction-to-egg.jpg
---

You mark **Reaction** after an egg meal. OBubba may answer with a card titled:

> **About that reaction to egg**

That title can feel weighty. Is the app deciding your baby has an egg allergy? Is a lower confidence band permission to try egg again? Does a higher one mean an emergency?

No. The current Flutter engine is doing something narrower: it finds the newest recent solids meal that a parent marked Reaction, then adjusts a product confidence score using a few details already in the log. It asks whether the food name contains a recognised allergen, whether the exact food phrase has several calm logs, whether a separate same-day record suggests another explanation, and—only for egg—whether the meal sounds raw or lightly cooked.

The result is a **worded attention band, not a medical probability**. Every version still tells the parent not to reintroduce the food without checking with a GP or health visitor. Symptoms always outrank the score.

This guide traces the live app behaviour so parents can understand what the card noticed, what it missed and what to do next.

## The short answer

Here is the whole current route:

| Step | Current Flutter rule |
|---|---|
| History supplied | Today plus the previous **13 calendar days** |
| Reaction selected | The first Reaction meal found while scanning newest day first |
| Current enough to show | Day index **0–9**: today plus nine earlier calendar days |
| Starting score | **0.50** |
| Recognised allergen in food text | **+0.20** |
| Three or more calm exact-food logs | **−0.10** |
| Separate same-day confounder | **−0.25** |
| Raw/lightly cooked egg wording | **−0.15** |
| Final range | Clamped between **0.10 and 0.85** |

The score becomes one of three explanations:

- below 0.40: the log leans towards another cause, although one episode cannot rule out allergy;
- 0.40 to below 0.65: worth watching, but far from certain; or
- 0.65 and above: worth taking seriously.

Only the highest band gets medium urgency in the app. The other two are low urgency. None means “safe”, “allergic” or “X% likely”.

![The current Flutter decision route behind OBubba’s About that reaction card.](/obubba-about-reaction-to-egg-logic.svg "OBubba chooses a recent parent-marked Reaction meal, reads the food text, exact-food history, same-day context and raw-egg wording, then gives a qualitative attention band and the same safety route. The heuristic is not a probability and symptoms outrank it.")

## It starts with one deliberate tap

In the solids logger, a parent types the food and can choose **Loved it**, **Unsure** or **Reaction**. Saving Reaction creates the signal this detector understands. It does not listen for symptoms elsewhere, analyse a photograph or infer a reaction from a free-text note alone.

The food field matters twice. It supplies the words used in the title, and this particular detector runs OBubba’s allergen recognition over those words. A log such as “scrambled egg” can be recognised as egg. The vocabulary also covers UK-relevant groups including dairy, gluten, peanut, tree nuts, fish, crustaceans, molluscs, sesame, soya, mustard, celery, sulphites and lupin, with common dish and ingredient aliases.

Recognition is useful, but it is not ingredient verification. “Breakfast fingers” may contain egg without saying so. A packaged food may hide several allergens behind an uninformative nickname. And in this detector, an allergen label saved on the entry does not rescue unrecognised food wording: it recomputes from the food text.

If the food field is blank, the reaction still exists. The title can become **“About that reaction to that food”**. That is safer than ignoring the tap, but far less useful for a conversation with a clinician.

## Which reaction does the app choose?

The Brain receives 14 calendar days, newest first. The detector scans those days and stops at the first solids entry marked Reaction.

That normally means the most recent reaction day wins. A reaction today is considered before one last week. But within a single day, the implementation accepts the first matching item in storage order; it does not explicitly sort same-day Reaction meals by clock time. If two foods were marked Reaction on Tuesday, the card is not guaranteed to discuss the later meal.

After choosing a reaction, the detector applies a recency guard. A record on today through nine calendar days earlier can speak. A chosen reaction on day index 10, 11, 12 or 13 is suppressed even though the 14-day history was available for supporting context.

So the working ideas are different:

- **14 days** are available to count context and exact-food history;
- **10 calendar days** are current enough for this card to appear.

It is not a countdown from the precise meal time. A late-night meal nine dates ago remains eligible until the calendar window moves.

## The score begins at 0.50

Every selected reaction starts at 0.50. Flutter then adds or subtracts fixed amounts.

This number is not displayed as “50%”. It has not been trained or validated as a probability of allergy. It is a deterministic way to choose cautious wording and card priority from sparse parent-entered data.

That distinction matters. A score of 0.70 does not mean a 70% chance of allergy. A score of 0.35 does not mean only a 35% chance, and it cannot make a repeat exposure safe.

### Recognised allergen: plus 0.20

If the food text names a recognised allergen, the score rises. A first reaction to “egg” moves from 0.50 to 0.70, entering the take-seriously band.

This does not mean recognised allergens are the only foods capable of causing reactions. It means the app has stronger structured context for a food it can classify.

### Three calm exact-food logs: minus 0.10

The detector counts other entries whose food text becomes the same lower-cased, trimmed phrase. A blank response or Loved it counts as a calm exposure. Unsure and Reaction do not.

At three or more calm matches, the score falls by 0.10. So “egg” with three calm “egg” logs can move from 0.70 to 0.60: still worth watching, but not in the highest band.

The match is literal. “Egg” and “scrambled egg” are different keys even though both belong to the same allergen group. This makes the claim food-specific but brittle: small wording differences can fragment the record.

There is also an important timing limitation. The detector counts across the whole 14-day input without checking whether those calm entries occurred **before** the chosen reaction. Its generated sentence can say the baby “has eaten it three times before without trouble” even when one of those records was added after the reaction. That wording overstates the sequence.

Prior tolerance does not rule out a later allergy anyway, which is why the adjustment is modest rather than decisive. Treat the count as supporting log context, not clearance.

## What counts as another same-day explanation?

The largest subtraction, 0.25, comes from a separate same-day confounder. The current code recognises:

- a temperature entry above the app’s fever threshold; or
- a separate note containing tightly matched forms of vaccination, jab, teething, unwell, poorly, virus, ill or illness.

The reaction meal’s own note is deliberately excluded. That prevents a symptom description such as “ill after egg” from automatically arguing against itself.

The boundaries are more careful than a simple word search. A normal temperature does not count. An ordinary medicine log does not count. “No fever” written in a note does not count because the detector is looking for a fever-temperature entry, not the word fever.

There is one copy mismatch in the current card. When a confounder exists, it refers to **“temperature/medicine/jab”**, but a medicine entry by itself no longer triggers this subtraction. In practice, the recognised note vocabulary is broader than that phrase, while routine medicine is not part of the rule.

Most importantly, a confounder does not prove the food was innocent. A baby can be teething and have a food reaction on the same day. The app is lowering the certainty of its interpretation, not resolving causation.

## Why raw egg gets its own adjustment

The detector reads the food name and reaction note for preparation words. Raw-side matches include “raw”, “undercooked”, “runny”, “soft-boiled” and “lightly cooked”. Cooked-side matches include “well-cooked”, “hard-boiled”, “baked”, “fried”, “scrambled” and “thoroughly cooked”. If both kinds appear, raw wins because that check runs first.

Only recognised egg receives the 0.15 raw-preparation subtraction and extra wording. A first “runny egg” reaction usually moves from 0.70 to 0.55, producing the middle band. The card notes that some babies who react to raw or lightly cooked egg may tolerate it thoroughly cooked—but still says to check with a GP or health visitor before trying.

The detector does not build a home egg-ladder plan. It does not apply the raw adjustment to peanut, fish or another allergen, and a generic Cooked detection does not otherwise change the score.

Preparation text can also be wrong or incomplete. “Scrambled egg” is classified as cooked, but the app cannot know how thoroughly it was cooked. “Cake” may contain baked egg without the word egg. Clinical advice, ingredients and the actual meal matter more than the keyword.

## Four worked examples

These examples show why the band describes app logic, not symptom severity.

| Saved record | Calculation | Card band |
|---|---:|---|
| First Reaction to recognised “egg” | 0.50 + 0.20 = **0.70** | Worth taking seriously; medium urgency |
| “Egg” Reaction plus 3 calm exact “egg” logs | 0.50 + 0.20 − 0.10 = **0.60** | Worth watching; low urgency |
| “Egg” Reaction plus a separate fever-temperature entry | 0.50 + 0.20 − 0.25 = **0.45** | Worth watching; low urgency |
| “Egg” Reaction, 3 calm exact logs and a confounder | 0.50 + 0.20 − 0.10 − 0.25 = **0.35** | Leans another cause; low urgency |

A fifth example is instructive: a first Reaction to an unrecognised phrase stays at 0.50. The app gives the middle explanation even if the real-world symptoms were severe.

That is why urgency on this card must not be read as triage. The score does not inspect swelling, breathing, colour, collapse, rash spread, vomiting, onset after the meal or the amount eaten.

## What the card always says to do

Despite the changing band, the safety direction is consistent.

OBubba warns that swelling, breathing difficulty or a widespread/spreading rash needs urgent help or the emergency number. Otherwise, it says **do not reintroduce the food on your own** and check with a GP or health visitor first. A professional may advise assessment, testing or a supervised reintroduction depending on the history.

That matches current UK guidance. The [NHS says food-allergy reactions in babies can include swollen lips or face, an itchy rash, coughing or wheezing, vomiting and other symptoms](https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/). Reactions often happen within minutes to two hours, although some cows’ milk reactions can be delayed. The NHS recommends talking to a GP or health visitor when you think a baby may have a food allergy.

For emergency symptoms, follow the person in front of you, not the app band. The [NHS food-allergy guidance says to call 999 for signs such as sudden swelling of the lips, mouth, throat or tongue, breathing difficulty, blue/grey/pale colour, severe confusion, dizziness or a baby becoming limp or unresponsive](https://www.nhs.uk/conditions/food-allergy/).

[Sheffield Children’s NHS guidance is equally direct: do not retry a food that caused a reaction without medical advice](https://library.sheffieldchildrens.nhs.uk/introducing-specific-foods-at-home/). A lower OBubba band does not override that instruction.

## What to record after a possible reaction

Care comes first. If urgent symptoms are present, seek urgent help before documenting anything.

When the baby is safe and you are able, a useful record for a GP or health visitor includes:

1. **The exact food and ingredients.** Save the packet or photograph the ingredient label if relevant.
2. **Preparation and amount.** For egg, note baked, hard-boiled, scrambled, runny or another form, plus roughly how much was eaten.
3. **Times.** Record when the meal began and when each symptom began.
4. **What you observed.** Describe the skin, breathing, mouth, vomiting, behaviour or nappies plainly rather than deciding the diagnosis.
5. **How it changed.** Note duration, progression and what help was given.
6. **Same-day context.** Temperature, illness, vaccination and other new foods can help a professional interpret the history.

OBubba’s Reaction chip is intentionally fast, but one chip cannot hold all of that clinical texture. A precise note makes the log more useful without turning a parent into an investigator.

## The wider Allergen Journey is separate

The reaction-confidence card is only one part of the weaning experience. OBubba also keeps an Allergen Journey across recognised groups, remembers introductions and can suggest an appropriate next group before a reaction has been logged.

![A genuine current Flutter view of OBubba’s Allergen Journey, where introduced groups are checked and egg is suggested next in a well-cooked morning form.](/obubba-allergen-journey-app.jpg "This real app view shows the wider Allergen Journey rather than the Reaction chip itself. It keeps recognised allergen groups visible and can suggest a next introduction, while reaction advice remains a separate safety pathway.")

The app can later notice reactions across distinct foods in the same allergen group and surface a separate pattern card. That broader grouping is not the same as this single-reaction score.

The Journey is a memory aid, not permission to continue a food after a reaction. Once Reaction is selected, professional advice takes priority over any next-up suggestion or earlier “Looking good” message.

## What this insight cannot know

The current detector does not know:

- which symptom occurred or how severe it was;
- how soon it began after the meal;
- whether it was allergy, intolerance, contact irritation or illness;
- the amount eaten or exact recipe unless you write it;
- whether a rash photograph exists;
- whether the baby has eczema, asthma or another clinical history;
- whether calm exact-food logs happened before the reaction;
- whether a stored allergen label conflicts with the typed food;
- which of two same-day Reaction meals happened most recently; or
- whether a clinician has already given this family a plan.

There is no age gate inside this function. If a solids Reaction entry exists, the card can run regardless of the baby profile age. That avoids losing a safety signal, but it also means an erroneous solids entry for a very young baby is not automatically rejected here.

The card identity has another rough edge. It is based on the dynamic title. Dismissing **About that reaction to scrambled egg** can suppress a future card with exactly that title, even if it comes from a genuinely new episode. A different food phrase creates a different identity. If a new reaction occurs, never assume silence means it was assessed; follow symptoms and professional advice.

## Why the app may stay quiet

The card may not appear when:

- the Reaction meal is more than nine calendar days behind today;
- the solids response was left blank, Loved it or Unsure rather than Reaction;
- the event was saved as another entry type;
- a previous card with the same exact dynamic title was dismissed;
- another curation decision removes it from the visible set; or
- a sync or data error prevents the entry reaching the current history.

Silence does not mean OBubba has cleared the food. A parent who saw concerning symptoms should seek advice whether or not the software finds a card.

## A better way to read the message

Read **About that reaction to egg** as three sentences:

1. “You recorded a reaction to this recent food.”
2. “Here is how a small amount of surrounding log context changes the app’s wording.”
3. “Do not use this wording to decide on reintroduction or emergency care.”

That is useful because it turns a frightening, sleep-deprived memory into a retrievable starting point. It is trustworthy only when its boundary stays visible.

## The bottom line

**“About that reaction to egg” means OBubba found a recent solids meal that a parent explicitly marked Reaction. It does not mean the app diagnosed an egg allergy.**

The current Flutter engine begins at 0.50, adds 0.20 for a recognised allergen, subtracts modestly for three exact-food calm logs, subtracts more for a separate same-day confounder, and applies an egg-only raw-preparation adjustment. The number is clamped and translated into cautious prose; it is never a medical probability.

Use the card to preserve the food, timing, preparation and context for a professional conversation. Do not let a low band talk you into a home retry. And if the baby has swelling, breathing difficulty, a spreading rash, abnormal colour, collapse or another severe symptom, seek urgent help based on the baby—not the app.

That is the standard a parent-first tracker should meet: remember the details exhaustion erases, show its reasoning plainly, and know when software must step back.
