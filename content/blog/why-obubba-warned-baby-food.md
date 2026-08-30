---
title: "Why Did OBubba Warn Me About My Baby’s Food?"
slug: why-obubba-warned-baby-food
description: "Typed honey, grapes, whole nuts, raw carrot or stock into OBubba? Learn what its live solids warning means, how to make the meal safer and where automatic checks stop."
date: 2027-01-08
updated: 2027-01-08
author: OBubba
tags: why did OBubba warn baby food, baby food safety warning, safe weaning app, grapes baby choking warning, honey baby warning, whole nuts baby, raw carrot baby, salt baby food, OBubba solids logger
heroImage: /obubba-live-food-safety-warning.jpg
---

You type “grapes and yoghurt” into a solids log. Before the allergen labels appear, OBubba shows a red warning about round foods. Or you enter “chicken casserole with stock” and see an amber salt caution.

Is the meal banned? Is the app saying your baby is in danger?

**The warning is a prompt to pause and check the actual food, age and preparation.** Red **danger** cards flag a possible choking or age-restricted hazard that should be changed before serving. Amber **caution** cards flag something to verify, such as salt, cooking, mercury or a rice drink. The app reads words; it cannot see the plate, packet or baby.

It also does not block the log. A warning can still be useful after a meal because it helps a parent recognise what to change next time—but it is not proof that harm occurred.

![A three-step decision path: read the live warning, check the real food and make the meal safer before using upright seating and close supervision.](/obubba-food-warning-decision.svg "A live warning is a pause signal, not a diagnosis or a substitute for seeing the food.")

## What the warning levels mean

| What OBubba shows | What it means | Best next action |
|---|---|---|
| **Red danger** | typed wording may describe a choking hazard or honey for a baby under one | stop before serving; change the food, shape, texture or ingredient |
| **Amber caution** | age, cooking, mercury or salt needs checking | verify the real product and preparation; choose a safer option where needed |
| **No warning** | no supported phrase was detected | still inspect size, shape, texture, temperature, bones and ingredients yourself |

No warning does **not** mean “approved”. The detector is intentionally small and explainable rather than pretending to certify every meal.

## What the actual Flutter safety engine recognises

OBubba's current Flutter `foodSafetyWarnings` function checks the free text typed into **Track → Feed → Solids**. The warning appears live above allergen recognition, so a possible preparation hazard is seen before a food is saved.

### Honey before the first birthday

“Honey” and “honeycomb” trigger a red warning when the baby's age is unknown or under 12 months. The Flutter screen deliberately floors age in months, so a 50-week-old is not rounded up and treated as one too early.

The NHS says honey should be completely avoided until 12 months because it can contain bacteria that lead to infant botulism. This includes honey in cooked or baked food.

### Whole nuts

Whole almonds, peanuts, cashews and other nuts trigger a red choking warning. Wording such as **smooth peanut butter**, **ground hazelnut** or **crushed nuts** does not, because those are different forms.

The NHS says whole nuts should not be given to children under five. Nuts can be introduced from around six months when crushed, ground or offered as nut butter spread on food or mixed into cooking. Nut butter should not be given by itself.

### Round foods

Grapes, cherry tomatoes, blueberries, cherries, olives, sausages and hot dogs trigger a red warning unless the text says they were quartered, cut lengthways, squashed or mashed as appropriate.

“Halved grapes” still warns. A half grape retains a rounded shape; current NHS preparation guidance says small round fruits should be cut into quarters. Sausages and hot dogs should be cut into short thin strips lengthways rather than round coins.

### Hard raw fruit and vegetables

Raw carrot, raw apple or pear, whole carrot and phrases such as “apple chunks” can trigger a red warning. Preparation words such as cooked, steamed, mashed, grated or soft prevent the warning when they describe that food.

The engine evaluates meal fragments separately. “Grapes and mashed banana” still warns about the grapes: **mashed** belongs to the banana and must not accidentally clear a different food's hazard.

### Popcorn, marshmallows and hard sweets

These trigger a red choking warning. NHS guidance also lists raw jelly cubes, chewing gum, ice cubes and peanut butter by itself as choking hazards; the current Flutter text checker does not recognise every item on that wider list.

### Mercury, raw shellfish or egg, rice drinks and salt

Amber cautions cover:

- shark, swordfish and marlin, because of mercury
- text explicitly saying raw shellfish or raw egg, because cooking guidance must be checked
- rice milk or rice drink, which the NHS says to avoid under five because of arsenic
- salt, stock, gravy, soy sauce, bacon, ham and salted foods

Explicit phrases such as **no-salt stock**, **salt-free** and **low-salt** suppress the salt caution. That prevents a recipe saying “no-salt homemade stock” from warning merely because it contains the word *salt*.

This is still a wording rule, not nutrition-label analysis. “Low salt” on a packet is not a guarantee that every serving pattern is appropriate for a baby. The NHS advises not adding salt and avoiding stock cubes, gravy and salty foods because salt is not good for babies' kidneys.

## Why the app can warn when the meal is already safe

The detector sees text, not ownership of each preparation word.

- “Grapes, quartered lengthways” should clear the round-food warning.
- “Grapes and soft cheese” should still warn because *soft* describes the cheese.
- “Almond milk” does not trigger a whole-nut choking warning because the input describes a drink, not a nut.
- “Cooked carrot” does not trigger the raw-hard-vegetable warning.

If a warning appears despite safe preparation, rewrite the food precisely: “grapes quartered lengthways” is a better log than “grapes”. Check the real food before dismissing the message; a clearer entry also makes the family history more useful.

## Why a warning can be missing

Automatic checks have firm limits.

- A vague entry such as “lunch” contains nothing to inspect.
- A brand name does not reveal its full ingredients or salt content.
- The detector cannot see whether food is truly soft enough to squash.
- It cannot find an unmentioned bone, stone, pip, skin or hard casing.
- It cannot measure temperature or portion size.
- It cannot tell whether a baby is alert, upright and supervised.
- It does not cover every food in NHS guidance.

That is why the UI presents a warning—not a green “safe to serve” certificate.

## The warning order is deliberate

A long meal description can match several rules. Flutter removes duplicate titles and displays no more than five cards, but it puts **danger** warnings before cautions. A whole-grape choking warning is therefore not pushed out by earlier amber matches for stock, rice drink or fish.

This priority is valuable in a tired-parent interface: the most immediate preparation change should be visible first.

![OBubba's genuine Flutter pre-weaning guide, including readiness, gagging versus choking and foods to avoid.](/obubba-weaning-safety-app.jpg "The live warning sits beside a wider pre-weaning safety guide; neither replaces supervision or first-aid knowledge.")

The app also runs the same safety checker against the name and ingredients of its recipe suggestions. Its **Before you start** guide links readiness, safer preparation, gagging versus choking and foods to avoid. That makes the warning part of a wider safety journey, not a pop-up with no explanation.

## What to do when a warning appears

1. **Pause before serving.** Read the full card, not only its colour.
2. **Check the real food.** Look at age, ingredients, label, shape, texture and cooking.
3. **Change what needs changing.** Remove, replace, soften, cook, grate, squash or quarter lengthways.
4. **Edit the log precisely.** Record the preparation that was actually used.
5. **Use the basics anyway.** Baby should be alert, upright in a secure highchair and supervised within arm's reach.

If you remain unsure whether a food or texture suits your baby—especially with prematurity, swallowing difficulty, developmental needs or a clinical feeding plan—ask your health visitor, GP, dietitian or feeding team.

**[Try OBubba free →](/app.html)** — log the food once and get live, explainable checks beside allergen recognition, the Food journal and the rest of your baby's day.

## A warning is not emergency help

If a baby is choking and cannot breathe properly, do not open an app. NHS guidance says choking is often quiet, while gagging is usually loud. Shout for help, remove the baby from the highchair and follow age-appropriate choking first aid. Call 999 when required; if the child becomes unresponsive and is not breathing normally, call 999 and begin CPR.

Learn the sequence before weaning through a practical infant first-aid course and current NHS guidance. Our [gagging versus choking guide](/blog/gagging-vs-choking-baby-weaning.html) explains the distinction, while [Baby First Aid Before Weaning](/blog/baby-first-aid-before-weaning.html) helps families prepare.

## Frequently asked questions

### Why did OBubba warn about halved grapes?

Because halving does not remove the rounded plug-like shape. Cut small round fruit into quarters, following current NHS preparation guidance.

### Why did smooth peanut butter not show a whole-nut warning?

The detector distinguishes smooth, ground, crushed, powdered or butter forms from whole nuts. Still spread nut butter on food or mix it into cooking; do not give a thick spoonful by itself.

### Why did stock trigger a salt caution?

Stock cubes, gravy and many ready-made stocks can be salty. Remove the baby's portion before adding salty ingredients or use an appropriate no-added-salt preparation.

### Can I ignore a warning if I know the food was prepared safely?

Check the food first, then make the log more precise. The card is not a diagnosis and does not block saving, but treating every alert as noise defeats its purpose.

### Does no warning mean the food is safe?

No. It only means the supported text patterns did not find a match. Inspect the food and supervise every meal.

### Does OBubba recognise allergies in the same warning?

Allergen recognition is a separate layer shown after food-safety checks. Neither layer can diagnose an allergy or guarantee safety.

## Reliable UK sources

- [NHS Best Start in Life: Foods and drinks to avoid](https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/food-and-drinks-to-avoid/)
- [NHS Best Start in Life: Preparing food safely](https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/preparing-food-safely/)
- [NHS: Foods to avoid giving babies and young children](https://www.nhs.uk/baby/weaning-and-feeding/foods-to-avoid-giving-babies-and-young-children/)
- [NHS Best Start in Life: Choking and gagging on food](https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/choking-and-gagging-on-food/)
- [NHS: How to stop a child from choking](https://www.nhs.uk/baby/first-aid-and-safety/first-aid/how-to-stop-a-child-from-choking/)

*This article gives general information for UK families. OBubba is a tracking and education tool, not a food-safety certification, medical device or emergency service. Follow your baby's individual clinical advice and call 999 in an emergency.*
