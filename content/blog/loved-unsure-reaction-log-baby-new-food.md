---
title: "Loved It, Unsure or Reaction? How to Log Baby’s New Food"
slug: loved-unsure-reaction-log-baby-new-food
description: "What should you tap after baby tries a new food? Learn what Loved it, Unsure and Reaction mean in OBubba—and how each choice changes later guidance."
date: 2027-02-20
updated: 2027-02-20
author: OBubba
tags: loved it unsure reaction baby food, how to log baby new food, baby food reaction tracker, baby allergen tracker, baby unsure about food, starting solids food diary, weaning response log, baby food allergy log, OBubba weaning tracker, new food baby response
heroImage: /obubba-loved-unsure-reaction-new-food.jpg
---

Your baby tastes carrot, pulls a spectacular face, spits some out and reaches for the spoon again. Was that **Loved it** or **Unsure**?

The next day they eat yoghurt happily, then develop a small rash while playing on the carpet. Is that **Reaction**, even when you do not know whether the food caused it?

OBubba’s solids logger offers three optional responses: **Loved it, Unsure and Reaction**. They look like quick mood buttons, but the current Flutter app uses them differently across its weaning intelligence.

**Choose the response that best describes what you observed—not the answer you hope will produce. Loved it records a calm or positive meal, Unsure preserves ambiguity, and Reaction records a possible physical response worth keeping visible. None of the three diagnoses allergy, measures how much was swallowed or replaces urgent care.**

![A parent watches their baby explore one soft new food before recording an honest response.](/obubba-loved-unsure-reaction-new-food.jpg "Watch the baby first and tap second. An uncertain face can be normal food learning; the response field should preserve what happened without inventing certainty.")

## The short answer

Use this practical interpretation:

| What happened | Best OBubba response | Add to the note |
|---|---|---|
| Baby explored or ate the food calmly; no concerning symptom noticed | **Loved it** | Texture or rough amount only when useful |
| You genuinely cannot tell—perhaps a vague change, tiny taste or mixed signals | **Unsure** | Exactly what made you uncertain |
| You observed a possible physical reaction after the food | **Reaction** | Symptom, timing, amount and every relevant ingredient |
| Baby simply turned away, gagged on texture or disliked the flavour, with no allergy symptom | Usually **Unsure** or leave the response blank | Describe the refusal or texture in plain words |
| Baby has severe symptoms or breathing difficulty | **Get emergency help first** | Complete the record later |

The buttons are not a severity scale. **Unsure** is not a mild version of Reaction, and **Loved it** is not medical proof that a food was tolerated.

![How Loved it, Unsure and Reaction travel through OBubba’s current weaning intelligence.](/obubba-solids-response-paths.svg "Loved it can become calm evidence, Unsure stays neutral and Reaction can enter lifetime safety filters. All three remain parent observations rather than diagnoses.")

## Loved it means the meal went calmly—not “allergy cleared”

Choose **Loved it** when the baby’s response was positive or comfortably ordinary. They might swallow several spoonfuls, mouth a finger food, smile, reach for more or simply explore without concern.

In the current Flutter app, Loved it can contribute **calm evidence** in specific detectors:

- a recognised allergen can count towards a recent “Looking good with Egg” style progress card;
- a previous food reaction can be interpreted alongside truly calm earlier exposures; and
- calm meals can soften—but never erase—a possible repeated allergen-group pattern.

The response does **not** record the dose. A lick and a bowlful can both be marked Loved it. It also does not prove that no delayed symptom appeared after the log was saved.

For that reason, a useful entry might be:

> **Well-cooked omelette strip — held and tasted; swallowed a small piece; loved it; no immediate symptom noticed.**

That is more honest than “egg safely introduced”. The app remembers the event; it does not perform an allergy test.

### What if baby pulls a funny face?

A grimace does not automatically mean dislike or reaction. Babies make surprising faces while learning new flavours and textures. If they remain comfortable, continue exploring and reach back for the food, Loved it may still fit.

If the expression leaves you genuinely uncertain, use Unsure. There is no prize for creating a cleaner-looking food history.

## Unsure is a deliberate neutral state

**Unsure is one of the most valuable choices in the logger because it stops uncertainty being forced into false reassurance or false alarm.**

Choose it when:

- only a tiny taste may have been swallowed;
- a mild change occurred but you cannot confidently connect it with the food;
- baby was already teething, unwell or unusually unsettled;
- the meal contained several ingredients;
- the behaviour could have been flavour surprise, tiredness or discomfort;
- you need to observe and ask for advice before drawing a conclusion.

The current engines treat Unsure carefully:

- it does not count as a clean “without trouble” exposure;
- it does not count as a Reaction;
- it does not, by itself, fire a repeated-reaction pattern;
- repeated Unsure entries can suppress a confident “Looking good” allergen card; and
- it remains visible in the Food journal as **Was unsure**.

That is good uncertainty handling. A cautious app should preserve a question mark instead of quietly converting it to a tick.

### Write what made you unsure

“Unsure” without context becomes hard to interpret later. Add one factual line:

- “licked spoon; not sure any swallowed”
- “one red mark near mouth; gone after 15 minutes”
- “already had eczema flare this morning”
- “mixed fish pie: cod, cows’ milk and wheat”
- “gagged on lump, recovered and continued”
- “turned away after two tastes; tired before nap”

Do not write “allergic” unless that is part of a diagnosis or professional advice. Describe the observable event.

## Reaction means “possible physical response recorded”

Choose **Reaction** when you observed a possible physical symptom after the food, even if you cannot prove causation from one event.

Relevant signs can include vomiting or diarrhoea, cough, wheeze or breathing change, an itchy rash, swelling of the lips or throat, or other symptoms described in current NHS food-allergy guidance.

The correct immediate action depends on the symptom and the baby’s condition. A severe reaction can be life-threatening: call **999** for breathing difficulty, significant swelling, collapse or another emergency. Do not spend time completing an app form before getting help.

For a non-emergency possible reaction, stop the food, stay with the baby and seek appropriate medical advice. Do not deliberately reintroduce the suspected food on the strength of an app interpretation.

When it is safe to record the event, include:

1. exact food and all known ingredients;
2. approximate amount eaten;
3. time eaten;
4. symptom and where it appeared;
5. how quickly it began;
6. whether it changed or spread;
7. any separate illness, fever, vaccination or relevant medicine; and
8. the advice or treatment given.

If appropriate, a photograph of a visible skin change can help a clinician—but do not delay care to take one.

## What Reaction changes inside the Flutter app

We traced the solids model, lifetime summary, reaction-confidence engine, recipe ranking, first-tastes view and food journal.

### 1. It remains attached to the solids entry

The saved food, recognised allergen groups, note and Reaction code appear in **Care → Weaning → Food journal**. That creates a dated record for a later conversation with a health visitor, GP or allergy professional.

### 2. Recognised allergens can enter a lifetime reacted set

If the entry contains recognised allergens, OBubba adds them to `allergensEverReacted`. That set combines the recent active history with the archived lifetime summary.

In practical terms, an egg reaction should not be forgotten merely because the original day becomes old. The current tests verify that an archived egg reaction and a recent fish reaction can both remain present.

This memory is intentionally cautious. It is not a confirmed-allergy list; it is a list of allergen groups attached to entries the parent marked Reaction.

### 3. Recipes containing that allergen are filtered

The weekly recipe engine removes suggestions containing a reacted-to allergen. It checks more than a curated headline tag: the current implementation also scans recipe names, ingredients, method and baby-led-weaning serving suggestions.

That prevents an allergen hidden only in “serve with yoghurt dip” or “offer with toast fingers” from slipping through. Old reacted history is passed into regenerated weekly plans so the protection does not expire with the visible journal window.

This is a recommendation safeguard, not proof that every filtered ingredient must be avoided forever. Follow the baby’s clinical plan.

### 4. First-taste guidance stops casually re-suggesting it

The Weaning area computes the reacted set separately from the introduced set. A food carrying a reacted allergen can display a reaction warning and tell the parent to pause and check with their clinician rather than “keep offering” it.

### 5. Recent reactions can receive a cautious interpretation

OBubba’s reaction-confidence engine can review a recent Reaction entry alongside:

- whether the food contains a recognised allergen;
- truly calm earlier exposures to the same food;
- a separate same-day fever or illness context; and
- preparation wording in the specific case of egg.

It uses qualitative language rather than a fake percentage. A reaction more than nine days back is not repeatedly resurfaced as though it just happened.

The engine cannot see the baby, verify the symptom, determine the culprit in a mixed meal or decide whether reintroduction is safe.

![OBubba’s genuine Flutter Allergen journey keeps introduced foods visible and shows one next step without turning the checklist into a diagnosis.](/obubba-allergen-journey-app.jpg "The response saved in the solids log can affect later allergen guidance, recipe filtering and cautious progress cards. Manual journey ticks and medical diagnosis remain different things.")

## A meal refusal is not automatically a Reaction

Babies spit, gag, grimace, turn away and throw food for many non-allergic reasons. The texture may be unfamiliar, the bite may be too large, the baby may be tired or they may simply be finished.

In OBubba, the separate refusal detector does **not** infer refusal from Loved it, Unsure or Reaction. It reads plain-language notes across the last three meals for words such as “refused”, “spat”, “turned away”, “no interest”, “gagged” or “too big”.

That separation matters:

| Event | Response field | Note |
|---|---|---|
| Turned away from broccoli, no symptom | Unsure or blank | “turned away after one taste” |
| Gagged on a firm lump, recovered normally | Unsure | “gagged on texture; piece too firm” |
| Ate yoghurt, then developed hives | Reaction | “raised itchy rash 10 minutes later” |
| Loved toast but became tired before finishing | Loved it | “stopped when sleepy” |

Gagging is not the same as choking, and neither is automatically allergy. Choking is an emergency when the airway is blocked. Use age-appropriate preparation, sit the baby upright and supervise within arm’s reach.

## Why exact ingredients matter more after Reaction

“Pasta” is too vague for useful allergen history. The dish might contain wheat, egg, cows’ milk, sesame, nuts or none of those, depending on the recipe.

For a mixed meal, log the ingredients that could matter:

> **Homemade pesto pasta: wheat pasta, basil, olive oil, parmesan and cashew — Reaction — hives around mouth 12 minutes later.**

OBubba can recognise common allergen terms in the food description, but it cannot inspect the packet or kitchen. Read labels each time, especially when recipes or brands change.

The NHS advises introducing foods that can trigger allergy one at a time and in very small amounts from around six months, so a response is easier to identify. Once tolerated, they should remain part of the usual diet unless individual advice says otherwise.

## A simple rule for choosing the button

Ask one question:

> **Am I recording enjoyment, uncertainty or a possible physical symptom?**

- enjoyment or calm exploration → **Loved it**
- genuine ambiguity → **Unsure**
- possible physical response → **Reaction**

Then use the note for detail. The button organises the record; the note makes it understandable.

Do not wait for the app to tell you whether a reaction is serious. The baby’s breathing, alertness, colour and symptoms come before the data.

## What the response field cannot know

It cannot determine:

- whether enough food was swallowed for a meaningful exposure;
- whether a rash was contact irritation, eczema, viral or allergic;
- which ingredient caused a mixed-meal event;
- whether vomiting was allergy, infection, gagging or reflux;
- whether a delayed symptom relates to the food;
- whether future exposure will be safe;
- whether a baby has outgrown a diagnosed allergy; or
- whether the baby enjoyed the flavour from facial expression alone.

That is why OBubba’s strongest role is **memory and pattern organisation**. A parent supplies the observation; a qualified professional supplies medical assessment.

## Why this is more useful than a generic food diary

A generic diary stores “egg, Tuesday”. OBubba connects one honest response with the rest of the weaning journey:

- recognised allergen groups;
- calm, unsure and reaction evidence;
- old reactions that remain remembered;
- recipe and first-taste safeguards;
- repeated-exposure encouragement only when the record supports it;
- possible group patterns across distinct foods; and
- the original meal and note for professional review.

The design works because it allows **I do not know**. Trustworthy parenting software should not require certainty a parent does not have.

**[Try OBubba’s weaning tracker free →](/baby-weaning-tracker.html)** — record one real meal, preserve uncertainty honestly and let the wider food history become useful without turning your baby into a score.

## Frequently asked questions

### My baby pulled a face but kept eating. Is that Unsure?

Not necessarily. New tastes often produce dramatic expressions. If the baby remained comfortable and continued exploring, Loved it can still fit. Use Unsure when you genuinely cannot interpret what happened.

### Does Loved it mean the allergen is safely introduced?

No. It records a positive or calm meal. It does not measure dose, exclude delayed symptoms or provide medical clearance.

### Does Unsure remove the food from recipe suggestions?

No. Unsure is neutral and does not enter the lifetime reacted set. Repeated Unsure records can prevent an overly confident tolerance celebration.

### Does Reaction diagnose an allergy?

No. It records a parent-observed possible reaction. The app may filter relevant recipe suggestions cautiously, but diagnosis requires appropriate clinical assessment.

### What if I chose the wrong response?

Edit the recent entry when possible and add a factual note. If an old archived event cannot be edited in place, keep the important correction in your health record and discuss any safety consequence with the relevant clinician.

### Should I mark gagging as Reaction?

Not automatically. Gagging is often a texture-learning response. Record the texture and what happened. Mark Reaction when you observed a possible physical allergy response, not solely because food came back out.

### What if the reaction is happening now?

Assess the baby, stop the food and seek help according to the symptoms. Call 999 for a severe reaction or breathing difficulty. Log the details only when care is underway and it is safe to do so.

## Reliable UK sources

- [NHS Best Start in Life: Baby food allergies](https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/food-allergies/)
- [NHS: Food allergies in babies and young children](https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/)
- [NHS: Your baby’s first solid foods](https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/)
- [NHS: Help your baby enjoy new foods](https://www.nhs.uk/baby/weaning-and-feeding/help-your-baby-enjoy-new-foods/)

*This article provides general information for UK families. OBubba is not a medical device and its response field cannot diagnose food allergy or determine whether reintroduction is safe. Follow your baby’s individual clinical plan, seek appropriate medical advice for a possible reaction and call 999 in an emergency.*
