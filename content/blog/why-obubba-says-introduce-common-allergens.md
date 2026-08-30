---
title: "Why Does OBubba Say ‘Introduce the Common Allergens’?"
slug: why-obubba-says-introduce-common-allergens
description: "See the exact Flutter rule behind OBubba’s common-allergen reminder, which six foods it checks, what it remembers, and how to act on it safely."
date: 2027-04-15
updated: 2027-04-15
author: OBubba
tags: introduce common allergens OBubba, baby allergen tracker, introducing allergens baby UK, egg peanut baby weaning, baby food allergy app, weaning app, common allergens baby, allergen introduction reminder, baby solids tracker, OBubba weaning, dairy gluten fish sesame baby
heroImage: /obubba-introduce-common-allergens.jpg
---

You have logged beef stew, chicken and rice, and lentil dahl. Your baby is past seven months. Then OBubba’s Flutter brain adds a gentle card:

> **Introduce the common allergens**

It might list **Egg, Peanut, Dairy, Gluten** underneath.

That is not a diagnosis, a deadline or proof that those foods are safe for your baby. It is a low-urgency memory prompt generated from the solids history the app can actually see.

The exact rule is more interesting than the title. OBubba waits until its weaning age reaches 30 weeks, checks a six-allergen priority subset against all-time logged exposure, and shows the card only when at least four of those six still appear missing. It also stays quiet if a more immediate refusal or iron-rich-food insight wins first.

Here is what the product is really saying—and how to use that information safely.

## The exact Flutter rule

The current `diagnoseWeaningPattern` function can return this card only when these conditions line up:

| Product check | What Flutter requires |
|---|---|
| Weaning age | At least **30 weeks** |
| Recent solids | At least one usable solids log in the roughly three-week window |
| Priority set | At least **4 of 6** priority allergens still absent from all-time logged history |
| Higher-priority weaning read | No current clustered refusal insight and no qualifying iron-gap insight |

The six labels, in their fixed detector order, are:

1. egg;
2. peanut;
3. dairy;
4. gluten;
5. fish; and
6. sesame.

If four or more are missing, the body displays the **first four missing labels** in that order. It does not list every possible allergenic food, and it does not rank a child’s personal medical risk.

![The exact Flutter path behind OBubba’s Introduce the common allergens card.](/obubba-introduce-common-allergens-logic.svg "The low-urgency card needs a weaning age of at least 30 weeks, a recent solids record and four or more missing labels from OBubba’s six-item priority subset. A current refusal streak or qualifying iron gap takes the single weaning-insight slot first. The result is a memory nudge, not medical clearance or a complete allergen checklist.")

## Why the card starts at 30 weeks, not exactly six months

NHS guidance says solid foods usually begin from around six months. Foods that can trigger allergic reactions can be introduced from around that point, one at a time and in small amounts, so a reaction is easier to spot ([NHS: Your baby’s first solid foods](https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/)).

OBubba’s reminder does not appear at the first possible moment. Its age gate is 30 weeks—roughly seven months—so it behaves more like a catch-up prompt after weaning has begun.

The app uses the weaning age supplied by its child model, including corrected age when that is available. That is useful for families of babies born prematurely, but the software gate still cannot decide readiness. The NHS advises parents of premature babies to ask a health visitor or GP when to begin solids.

An age threshold is therefore a software condition, not an instruction to feed a particular food today.

## What “missing” means to OBubba

The card does not ask the parent to complete a questionnaire. It builds its answer from logged solids.

For each solids entry, Flutter combines:

- allergens automatically recognised from the food name;
- allergen labels stored directly on the entry; and
- the lifetime summary retained when older daily logs leave the app’s fast working window.

That last layer matters. If egg was logged months ago, archiving older day data should not make egg look new again. OBubba unions its compact lifetime record with current day entries so an old introduction is not forgotten simply because it is no longer in the recent timeline.

The food detector recognises ingredients such as egg, peanut, milk, wheat, toast, salmon and tahini, plus familiar dishes such as omelette, hummus, fish pie and pancakes. It canonicalises everyday wording into app labels: milk becomes `dairy`, wheat becomes `gluten`, and eggs becomes `egg`.

It also guards against several dangerous little text mistakes. “Oat milk” should not create a dairy exposure, “peanut butter” should not create dairy because it contains the word butter, and “vegan pancakes” should not silently mark egg as tried. Those boundaries are covered by dedicated Flutter tests.

But free text is never omniscient. A brand name or vague entry such as “pouch” may not reveal the ingredients. Check the pack and correct the allergen labels in the log when necessary. Our guide to [what to do when OBubba does not detect a food allergen](/blog/why-obubba-did-not-detect-baby-food-allergen) explains that path.

## Why it checks six when the journey shows 14

Open OBubba’s weaning journey and you will see the app’s friendly versions of the 14 UK-regulated allergens: dairy, gluten, egg, peanut, tree nuts, fish, crustaceans, molluscs, sesame, soya, mustard, celery, sulphites and lupin.

![A genuine OBubba Flutter capture of the allergen journey, with 14 tracked labels and a next-up egg suggestion.](/obubba-allergen-journey-app.jpg "This genuine Flutter capture shows the broader 14-label allergen journey. The six-item reminder engine is deliberately narrower, so the card should never be read as a complete medical or food-labelling checklist.")

The reminder engine uses only six of those. It leaves tree nuts, soya, crustaceans, molluscs, mustard, celery, sulphites and lupin out of this particular trigger.

That is a product simplification. It makes a small card easier to earn and easier to read; it does **not** redefine the UK allergen list. The NHS parent-facing weaning guidance names cows’ milk, eggs, gluten-containing foods, nuts and peanuts, seeds, soya, fish and shellfish among foods that can trigger reactions ([NHS: Baby food allergies](https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/food-allergies/)).

The labels are simplified too. OBubba’s `dairy` generally represents cows’ milk foods, while `gluten` groups foods containing gluten. Parents still need ingredient labels and clinical advice where relevant; the app’s category name is not a substitute for either.

## A manual tick and a logged meal are not identical

The allergen journey lets a parent tick an introduction manually when the food was given but no meal was logged. Those ticks persist locally for that child and update the journey screen.

The brain reminder, however, reads the synced child’s all-time solids history. It does not currently receive the journey’s local manual-tick set.

That means a family can see egg marked **Introduced** in the journey yet still receive a reminder whose missing list includes egg if no egg meal or allergen-tagged entry exists in the synced history.

The practical fix is simple: log the meal or make sure the allergen is attached to its solids entry. This also gives future pattern tools a real date, food and response instead of a context-free tick.

This is a genuine boundary in the current Flutter product, and it is worth stating plainly. A tracker earns trust by explaining when two screens use different evidence.

## What happens when a reaction was logged

A reacted-to allergen is still an allergen the baby was exposed to, so it enters the all-time “tried” set. The common-allergen reminder should therefore stop presenting that label as never introduced.

Separately, OBubba keeps an all-time reacted-allergen set. In the dedicated weaning screen it hides the normal first-taste tip, shows **Reaction logged**, tells the parent to pause that allergen and check with their doctor before offering it again, and filters it out of generated weaning plans. That safety memory survives when an old reaction day is archived.

This separation is sensible:

- the reminder asks, “Has exposure been logged?”;
- the reaction layer asks, “Must this food stop being suggested?”

Still, do not use the absence of a reminder as reassurance that a food was tolerated. It means the app has seen an exposure label, not that it has medically verified tolerance.

If your baby has reacted to a food, stop offering that food and seek medical advice. For signs of a severe reaction—such as breathing difficulty or swelling affecting the airway—call 999. The NHS lists possible allergy signs and the emergency response on its [baby food allergies page](https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/food-allergies/).

## Why another weaning card may appear first

The function returns one “most useful” weaning insight at a time. Its practical order is:

1. readiness, when old enough and no solids have ever been logged;
2. a recent three-meal refusal cluster;
3. an iron-rich-food gap; then
4. the common-allergen reminder.

So a 32-week-old baby can meet the allergen rule without seeing the card today. If the last three meals were recently refused, OBubba responds to that first. If at least three recent meals contain no recognised iron-rich food, the medium-urgency iron nudge outranks the low-urgency allergen prompt.

This is not the app deciding iron “matters more” than allergy prevention in medicine. It is a display policy that limits one engine call to one weaning card. After the higher-priority pattern clears, the allergen card can become eligible again.

## What the card’s wording can and cannot promise

The Flutter card says introducing allergens from around six months and “continuing weekly lowers the chance of developing an allergy”. The weaning journey elsewhere suggests offering a tolerated allergen about twice a week.

Parents should read that as short product copy, not a personalised prevention guarantee or prescribed dose.

The NHS wording is more careful: once an allergenic food has been introduced and tolerated, keep offering it as part of the baby’s usual diet to minimise the risk of allergy. It also notes evidence that delaying peanut and hens’ egg beyond 6 to 12 months may increase the risk of allergy ([NHS: Baby food allergies](https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/food-allergies/)).

How much, how often and in what form can depend on the food, the baby and professional advice. The app does not calculate a clinically validated dose and does not know every risk factor.

## A safer way to act on the reminder

For a baby who is ready for solids and has no reason for an individual clinical plan, the NHS approach is deliberately observable:

1. **Choose one allergenic food at a time.** That makes a reaction easier to attribute.
2. **Start with a small amount.** Do not turn the app’s “missing” label into pressure to serve a full portion.
3. **Use an age-appropriate form.** Offer well-cooked egg; smooth nut butter thinned or spread rather than a thick spoonful; ground or crushed nuts rather than whole nuts; and well-cooked fish checked for bones.
4. **Keep your baby upright, alert and supervised.** The NHS recommends a safely seated upright position and an adult present throughout eating ([NHS: Preparing food safely](https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/preparing-food-safely/)).
5. **Log the actual food and response.** “Scrambled egg — loved” is more useful than “lunch”. OBubba can preserve the exposure and distinguish `loved`, `unsure` and `reaction`.
6. **If tolerated, keep it in the normal rotation.** An introduction is not a collectible badge to tick once and forget.

Whole nuts are a choking hazard for children under five. The NHS says nuts can be offered from weaning when crushed or ground and added to food, and nut butter should not be given on its own because it can be a choking risk ([NHS: Foods to avoid](https://www.nhs.uk/baby/weaning-and-feeding/foods-to-avoid-giving-babies-and-young-children/)).

## Who should pause before following a generic prompt

Talk to your GP, health visitor or allergy team before introducing a food at home if your baby has a diagnosed food allergy, eczema, a previous suspected reaction, or another reason you have been given an individual plan. The NHS also advises extra care where there is a family history of food allergy, eczema, asthma or hay fever.

Do not re-offer a food your baby has reacted to because the app, a recipe or a blog post places it next in a sequence. OBubba’s reaction layer is designed to block that suggestion, but professional advice outranks software.

The card also cannot see readiness signs, illness today, the exact preparation, ingredient cross-contact, how much was swallowed or whether the adult can recognise and respond to a reaction. Those are real-world checks outside the detector.

## The honest translation

The most accurate version of **Introduce the common allergens** is:

> **OBubba’s weaning age is at least 30 weeks, there is a solids entry in the recent window, and the synced lifetime log contains no more than two of egg, peanut, dairy, gluten, fish and sesame. No current refusal or qualifying iron-gap card took priority, so the app is gently naming the first four missing labels. This is a tracking prompt—not a complete allergen list, proof of safety, proof of tolerance or medical clearance.**

That is exactly where a thoughtful baby app should sit: remembering what exhausted parents may forget, preserving reaction history, and leaving medical decisions where they belong.

OBubba connects solids logging, automatic allergen recognition, a 14-label journey, reaction-aware meal planning and long-term memory in one calm weaning space. [Explore OBubba](/#download) if you want a tracker that explains not only what it noticed, but the limits of what it knows.
