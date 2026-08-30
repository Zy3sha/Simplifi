---
title: "Why Does OBubba Say ‘A Possible Pattern with Dairy’?"
slug: why-obubba-says-possible-pattern-with-dairy
description: "What OBubba’s possible dairy pattern card really checks, why yoghurt twice does not count, how calm meals soften it, and what to do after a suspected reaction."
date: 2027-01-22
updated: 2027-01-22
author: OBubba
tags: possible pattern with dairy OBubba, baby dairy reaction, yoghurt cheese allergy baby, baby food reaction tracker, cows milk allergy baby, allergen pattern baby, weaning reaction log, OBubba weaning app, food allergy diary baby, dairy allergy symptoms baby
heroImage: /obubba-possible-pattern-dairy.jpg
---

You marked **Reaction** after yoghurt. A few days later, you marked **Reaction** after cheese. Then OBubba surfaced a careful sentence:

**“A possible pattern with dairy.”**

Has the app diagnosed cow’s milk allergy? Does it mean every dairy food is unsafe? Should you offer yoghurt again to check?

No. We traced this insight through the current Flutter app for this guide. It is a narrow pattern detector over the solids meals saved for **today plus the previous 21 calendar days**. It can notice that reactions were attached to at least two differently named foods in one shared allergen group. It cannot see the baby, verify ingredients, interpret symptoms or diagnose allergy.

Most importantly: **do not use the card as permission to re-offer a suspected trigger at home.** Stop the suspected food and seek advice from your GP, health visitor, NHS 111 or allergy team as appropriate. A professional should decide whether and how a reintroduction happens.

![A parent records a baby food reaction while the details are fresh.](/obubba-baby-food-allergy-reaction-log.jpg "A thoughtful food record can make a clinical conversation clearer, but it cannot diagnose the cause of a reaction.")

## The short answer

The current detector needs all of these conditions before it can show the card:

| What OBubba checks | Current Flutter rule | What that prevents |
|---|---:|---|
| Full reaction logs | At least **2** meals marked Reaction in the recent collection | One isolated tap does not become a group pattern |
| Shared allergen group | The reacted foods must share a recognised or saved group | Unrelated egg and fish reactions are not merged |
| Different food names | At least **2 distinct** lowercased names in the leading group | “Yoghurt” twice does not prove a wider dairy pattern |
| Clear group leader | The top group must have more reaction meals than the runner-up | A tie is too ambiguous to headline |
| Calm counter-evidence | Blank or Loved it meals in that group are counted | Existing tolerance changes the tone and urgency |

Meals marked **Unsure** are neutral: they neither fire the card nor count as calm counter-evidence.

![The five software gates behind OBubba’s possible dairy pattern card.](/obubba-possible-pattern-dairy-gates.svg "The app requires full reactions, a shared allergen group, two distinct food names, a strict leader and a tolerance check.")

These are product guardrails, not clinical diagnostic criteria.

## Four examples make the logic clearer

| Recent saved record | Card? | Why |
|---|---|---|
| Yoghurt — Reaction; cheese — Reaction | **May appear**, medium urgency | Two different food names share dairy, with no calm dairy meal in the collection |
| Yoghurt — Reaction; yoghurt — Reaction | **No** | The normalised food name is the same twice |
| Scrambled egg — Reaction; salmon — Reaction | **No** | Egg and fish do not share a group; the counts tie |
| Yoghurt — Reaction; cheese — Reaction; four dairy meals calm | **May appear**, softened wording and low urgency | Calm dairy meals are at least twice the dairy reaction count |

One calm dairy meal is already enough to reduce the current urgency from medium to low. The special **“mostly tolerated”** wording needs more: calm group meals must be at least twice the number of reaction meals. With two dairy reactions, that means four or more calm dairy meals.

That softer card is not a green light. Previous tolerance does not rule out allergy, and a parent’s **Loved it** tap says how the meal was logged—not what a clinician would conclude.

## How OBubba knows yoghurt and cheese are both dairy

When the Flutter insight assembles recent solids, it does not rely only on the allergen tags originally saved. It re-runs the app’s food-name recognition and merges those results with any stored tags.

The recogniser understands many common UK words and dishes. It maps **yoghurt, cheese, cheddar, mozzarella, paneer, butter, cream, ghee and cow’s milk** to the friendly group **dairy**. It also tries to avoid obvious false matches: oat milk, coconut yoghurt, vegan cheese and butter beans should not create a dairy tag.

The app tracks all 14 UK major allergen groups in its Allergen Journey, including dairy, gluten, egg, peanut, tree nuts, fish, crustaceans, molluscs, sesame, soya, mustard, celery, sulphites and lupin.

![The genuine current OBubba Flutter Allergen Journey showing the major allergen groups.](/obubba-allergen-journey-app.jpg "A genuine current app view: OBubba organises introduced and untried foods by friendly allergen group.")

Recognition is useful but fallible. “Creamy dinner” may not describe the ingredients. “Plain yoghurt” and “yoghurt” become two distinct text strings even if they mean the same product. A packaged meal may hide milk in its ingredient list. The detector cannot inspect a label, recipe or cross-contamination warning.

For a useful record, name the actual food and correct its allergen tags rather than writing a nickname only.

## Why mixed meals require extra caution

A reacted meal can contribute once to **every recognised allergen group in that meal**. Imagine these two logs:

- yoghurt with wheat cereal — dairy + gluten — Reaction
- cheese omelette — dairy + egg — Reaction

Dairy gets two reaction meals; gluten and egg get one each. Dairy is the strict leader, so the group card may appear.

That is a legitimate description of the saved pattern, but it cannot identify the culprit. Milk, wheat, egg, another ingredient or something unrelated could be responsible. The NHS advises introducing foods that can trigger allergy **one at a time and in very small amounts** so it is easier to spot a response. Mixed meals are much easier to interpret after their ingredients are already established.

Do not recreate a reacted mixture to find the answer yourself.

## “Reaction” is a parent label, not a diagnosis

The solids logger offers three optional responses: **Loved it, Unsure and Reaction**. This detector reads those choices literally.

It does not ask which symptom occurred, when it began, how long it lasted, how much was swallowed, whether the baby was unwell, or whether the food touched irritated skin. It does not distinguish immediate IgE-mediated allergy, delayed non-IgE-mediated allergy, intolerance, infection, reflux or ordinary contact irritation.

The NHS says food-allergy symptoms may include swollen lips or face, wheeze or cough, an itchy rash, vomiting, tummy symptoms or worsening eczema. Immediate reactions commonly happen within minutes and can take up to two hours; some reactions, including some associated with cow’s milk, may be delayed for days.

So use the button as a bookmark for something worth documenting—not as a medical verdict.

## The 22-day window is not lifetime history

Despite the code comment calling this a “last 21 days” collection, the loop includes day zero through day 21: **22 calendar dates in total**. It steps by local calendar date, which avoids daylight-saving changes skipping or duplicating a day.

Only solids meals in that collection feed this group-pattern card. An older dairy reaction can therefore fall out of this particular calculation.

That differs from OBubba’s separate **Looking good with Egg** safeguard, which also checks lifetime recorded reactions before showing reassurance. Do not read the absence of a dairy pattern card as evidence that an old concern has been medically cleared. No card can also mean:

- only one reaction was logged
- the same food name was logged twice
- two allergen groups tied
- the food was not recognised or tagged
- the relevant meals are outside the recent collection
- the symptom was saved only in a note or another tracker

**No card does not rule out allergy.**

## The important safety correction

The current Flutter card’s follow-up copy suggests checking the pattern by offering one suspected group food on its own on a calm day. **Do not treat that sentence as safe reintroduction advice after a suspected reaction.** It is too broad for a feature that does not know the symptom, severity, diagnosis or child’s risk history.

The safer action is:

1. stop the suspected food
2. record the exact event while it is fresh
3. seek advice from a GP, health visitor, NHS 111 or the baby’s allergy team
4. follow the professional plan for any avoidance, testing or reintroduction

NHS guidance also warns against cutting a major food group such as milk from a child’s diet without professional advice, because nutritional support may be needed. That is not contradictory: **do not deliberately re-challenge a suspected trigger, and do not redesign the baby’s whole diet alone.** Get an individual plan.

If a rash is spreading and you are worried about your child, NHS guidance supports urgent GP or NHS 111 advice. **Call 999 immediately** for signs of anaphylaxis such as sudden swelling of the lips, mouth, throat or tongue; struggling to breathe; throat tightness or difficulty swallowing; blue, grey or pale skin or lips; sudden confusion or collapse; or a baby becoming limp, floppy or unusually unresponsive. Follow any prescribed allergy action plan.

## Build the record a clinician can actually use

When the baby is safe, add more than the Reaction tap:

- exact product, brand, recipe and full ingredient list
- allergen tags you know were present
- preparation: baked, cooked, raw or mixed
- approximate amount offered and swallowed
- meal time and symptom start time
- every symptom, where it appeared and how it changed
- photographs, if safe and useful
- medicines, illness, eczema flare, vaccination and other foods that day
- what action you took and what happened next

Keep the packet or photograph its label when relevant. A clean timeline makes a GP or allergy conversation more efficient even when the cause remains uncertain.

The current card’s **Got it** action is also group-specific because its dismiss identity includes the title. Acknowledging dairy should not permanently silence a future card about egg. That is useful notification design; it is not a clinical follow-up system.

## What this feature does well—and where it must stay humble

The best part of the detector is not that it says “dairy”. It is that it refuses several tempting shortcuts:

- one reaction is not called a group pattern
- the same food twice is not enough
- unrelated groups are not blended
- a tie produces no headline
- Unsure does not become positive or reassuring evidence
- calm meals remain visible as counter-evidence

Its weak points are equally important: free-text food names are brittle, mixed meals are ambiguous, old reactions age out of this detector, and one parent-facing response button cannot capture clinical detail.

That is the right role for OBubba: **turn a scattered family log into a clearer question for a professional, without pretending the app has answered it.**

**[Explore OBubba’s baby weaning tracker →](/baby-weaning-tracker.html)** — keep first tastes, ingredient groups, reactions, textures, milk and the rest of the day together, so the history is easier to understand and share.

## Frequently asked questions

### Does this card mean my baby has cow’s milk allergy?

No. It means two or more differently named foods in the recent record were marked Reaction and shared dairy as the strictly leading recognised group. Only a qualified healthcare professional can assess or diagnose allergy.

### Why did yoghurt twice not produce the card?

The detector requires two distinct lowercased food names. Repeating “yoghurt” does not meet that gate, even though repeated symptoms still deserve medical advice.

### Can “plain yoghurt” and “yoghurt” count as two foods?

Yes, in the current implementation, because they are different text strings. That is a limitation—not proof of two biologically different foods. Record names consistently and include the product details in notes.

### Why is the card low urgency when there was a calm dairy meal?

The current product rule uses medium urgency only when the leading group has at least two reactions and zero calm meals. Any calm meal reduces it to low. That changes presentation, not the need to seek advice after a suspected reaction.

### Should I keep the dairy foods that seemed fine in rotation?

Do not make a blanket decision from the card. If one dairy food is suspected, ask a healthcare professional what to avoid and what may continue. Do not cut out a major food group or deliberately re-offer a suspected trigger without advice.

### What if OBubba shows no card after a worrying symptom?

Act on the baby’s symptoms, not the software threshold. Stop the suspected food, record the details and seek medical advice. Call 999 for signs of anaphylaxis.

## Reliable UK sources

- [NHS: Food allergies in babies and young children](https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/)
- [NHS Best Start in Life: Baby food allergies](https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/food-allergies/)
- [NHS: Food allergy](https://www.nhs.uk/conditions/food-allergy/)
- [NHS: Anaphylaxis](https://www.nhs.uk/conditions/anaphylaxis/)
- [NHS: Hives](https://www.nhs.uk/conditions/hives/)

*This article gives general information for UK families. It is not allergy diagnosis, treatment or an individual reintroduction plan, and OBubba is not a medical device. Follow advice from your baby’s own healthcare or allergy team.*
