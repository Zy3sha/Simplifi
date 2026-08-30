---
title: "Why Does OBubba Say ‘Spacing Out New Allergens’?"
slug: why-obubba-says-spacing-out-new-allergens
description: "The exact Flutter rules behind OBubba’s allergen-pacing card, what counts as a new allergen, when it stays quiet, and how to introduce foods safely without chasing an app schedule."
date: 2027-02-10
updated: 2027-02-10
author: OBubba
tags: OBubba spacing out new allergens, introduce allergens baby one at a time, baby allergen tracker, can baby have two allergens same day, weaning allergy app, egg peanut introduction baby, allergen pacing, baby food reaction log, starting solids around 6 months, OBubba weaning journey, food allergy baby NHS, mixed allergen meal baby
heroImage: /obubba-spacing-new-allergens-hero.jpg
---

You log a few solid-food meals. Then OBubba shows a low-urgency card called:

**“Spacing out new allergens.”**

Does that mean the app saw an allergic reaction? Has it decided two allergens are unsafe together? Must every family wait exactly two days between foods?

No.

We traced the current Flutter detector, the history passed into it and its automated tests. The card is a pacing nudge about **first logged introductions**. It is not a reaction diagnosis, a readiness assessment or a universal waiting-period rule.

The honest translation is:

> “Your recent log shows either two allergens first appearing on the same calendar day, or at least three first appearing within the newest seven-day span. Introducing one new allergen at a time can make a reaction easier to attribute.”

## The short answer

| Question | Current Flutter behaviour |
|---|---|
| What does it read? | Solid-food logs from today and the preceding 21 calendar days, plus memory of allergens logged earlier |
| What counts as new? | A recognised allergen not found in the earlier history whose first recent appearance is within six days of the newest logged solids meal |
| When can the card appear? | After at least three recent solids entries, if two or more new allergens first appear on one day, or three or more first appear within the newest seven-day window |
| Does two on different days trigger it? | No—not unless a third new allergen enters that seven-day window |
| Do several established allergens in one family meal trigger it? | No, provided the app’s history already recognises them |
| Does “same day” mean close together? | The detector only knows the calendar day; breakfast and dinner count the same as one mixed meal |
| Does it inspect reaction symptoms? | No |
| Does it check that a baby is ready for solids? | No explicit age or readiness gate exists inside this detector |
| How urgent is the card? | Low urgency; it is not the right surface to use during a suspected reaction |

![The current OBubba allergen-pacing detector combines recent solids with earlier history, then follows one of two exact trigger paths.](/obubba-allergen-pacing-detector.svg "The exact Flutter thresholds for OBubba’s Spacing out new allergens card.")

## What the detector actually reads

The OBubba brain supplies two kinds of information.

First, it gathers solid-food entries for **today and the previous 21 calendar days**. For each meal it combines any allergens already stored on the entry with allergens it can recognise from the food description. It then normalises common aliases: “eggs” becomes **egg**, “milk” becomes **dairy**, “wheat” becomes **gluten**, “soy” becomes **soya**, and “nuts” becomes **tree nuts**.

Second, it builds an earlier-history set from allergen records before that recent window, including archived lifetime summaries. That older memory matters. Egg already introduced and tolerated months ago should not suddenly become “new” because a fresh omelette appears this week.

The detector returns nothing when fewer than three recent solid-food entries exist. It also suppresses a stale result when the newest meal it received is more than nine days old. A card about “this week” should not be resurrected from an abandoned log.

## What “new” means in the current app

“New” does not simply mean “present in the latest meal”. An allergen must pass both conditions:

1. It is absent from the earlier allergen history.
2. Its earliest appearance in the recent window is no more than six calendar days before the newest logged solids day.

The seven-day span is anchored to the **newest solids log**, not necessarily today. If the latest logged meal was Wednesday, the detector looks back through the previous Thursday. The nine-day stale guard separately stops an old Wednesday from being treated as current forever.

This design makes established foods quieter. A family pasta meal containing dairy, gluten and egg should not generate a pacing warning when all three are already recognised in the child’s history. The app is looking for first appearances, not counting every allergen in every bowl.

![The real OBubba Weaning journey screen remembers completed allergens and suggests a single Next up food; that history helps later meals avoid being mistaken for first introductions.](/obubba-allergen-journey-app.jpg "A genuine current OBubba Flutter Weaning journey screen showing completed allergens and egg as Next up.")

## The two exact trigger paths

After the three-log activation gate, the current function can show the card in two ways.

### Path A: two first introductions on one calendar day

If at least two genuinely new allergens have the same earliest logged date, the card appears.

That includes:

- egg at breakfast and peanut at dinner;
- egg and peanut listed in one mixed dish;
- two separate meal entries on the same date.

The detector has dates, not an exposure stopwatch. It does not know whether the foods were served together or 10 hours apart. Its message says they “went in close together”, but the calculation only proves **same calendar day**.

### Path B: three first introductions in the newest seven days

If three or more genuinely new allergens first appear anywhere in that anchored seven-day span, the card appears even when no two share a date.

For example:

- Monday: egg;
- Wednesday: peanut;
- Saturday: sesame.

All three sit inside one seven-day window, so the detector produces the “several new allergens this week” version.

## When the app deliberately stays quiet

The automated tests are as useful as the trigger rules. They confirm that the card stays silent when:

- only two new allergens were introduced on different days, even consecutive days;
- an allergen appeared before the recent window and is therefore established;
- the caller supplies that established history explicitly;
- the newest meal is too old;
- empty or malformed allergen values are present;
- fewer than three recent solids entries exist.

So OBubba does **not** enforce a precise “wait two days” timetable. Two new allergens on Monday and Tuesday do not trigger this function. Add a third on Wednesday and they do.

That distinction deserves to be visible in the product. The current explanation says introducing allergens one at a time “with a couple of days between each” can make it easier to identify a trigger. The detector itself does not measure a two-day interval.

## Is there an official two-day rule?

The [NHS advises introducing foods that can trigger allergy from around 6 months, one at a time and in small amounts](https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/) so a reaction can be spotted. Its national guidance does not prescribe one universal two-day wait for every baby and every allergen.

That makes “a couple of days” a conservative OBubba product heuristic—not an exact NHS rule and not what this detector strictly enforces.

Some families need an individual plan. The [NHS says to speak to a GP or health visitor first](https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/) when a baby already has an allergy or eczema, or there is a family history of food allergy, eczema, asthma or hay fever. A clinician may advise different timing, quantities or supervision.

## This card is not a reaction check

The pacing function does not use the reaction field from a solids entry. It counts introductions. Separate OBubba logic handles reaction evidence and confidence about tolerated foods.

That boundary is crucial:

- **pacing question:** were several first introductions grouped closely in the log?
- **reaction question:** did symptoms occur, how severe were they, and what should happen now?

A low-urgency pacing card cannot make a current reaction low urgency. The NHS says reactions often happen within minutes but can take up to two hours, while some allergies such as cow’s-milk allergy can take longer. Symptoms can include swelling, wheezing or coughing, an itchy rash, vomiting and digestive symptoms. [Anaphylaxis is a medical emergency](https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/).

If a baby has breathing difficulty or a swollen throat or tongue, [call **999**](https://www.nhs.uk/conditions/anaphylaxis/). For a suspected non-emergency reaction, stop the food and seek appropriate clinical advice rather than waiting for OBubba to interpret the pattern.

## It is not a readiness check either

The current pacing detector contains no explicit minimum-age or developmental-readiness gate. If someone records enough solids for a very young baby, the logic can still run.

That does not mean OBubba has approved starting solids. The [NHS says complementary feeding should begin from around 6 months](https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/), when three readiness signs appear together: staying seated with a steady head, coordinating eyes, hands and mouth, and swallowing food rather than pushing it back out.

Waking more at night is not a readiness sign, and starting solids does not make a baby more likely to sleep through. This is where weaning and sleep belong in the same honest story: new foods are a developmental step, not a sleep intervention.

## What the food description can—and cannot—detect

Parents do not always tap an allergen chip. The Flutter caller also scans the food description for recognised ingredients and dishes. That makes entries such as “scrambled egg”, “peanut butter toast” or “yoghurt” more useful than an empty meal name.

But ingredient recognition has limits. A brand nickname, an unclear phrase such as “usual pouch”, or a mixed family dish without ingredients may not reveal what was inside. An allergen the app fails to recognise cannot enter the pacing calculation.

For a first introduction, log the actual ingredient:

- “well-cooked egg with familiar broccoli” is better than “lunch”;
- “thin peanut butter mixed into porridge” is better than “breakfast”; 
- for a mixed meal, record the relevant ingredients or select the stored allergen tags;
- note the time and any response without forcing certainty.

Accurate words help, but the record remains a parenting aid—not a diagnostic food challenge.

## A calm way to use the feature

1. **Check readiness first.** Start around 6 months when the developmental signs are present, following any individual clinical plan.
2. **Choose one new allergen.** Offer a small amount in an age-appropriate form alongside familiar food.
3. **Pick an observable moment.** A calm daytime meal can be easier to watch than a rushed bedtime meal.
4. **Supervise the whole meal.** Sit the baby upright and stay with them while eating.
5. **Log the ingredient plainly.** Include the actual allergen, time and any response.
6. **Keep tolerated foods in the diet.** The NHS advises making tolerated allergenic foods part of the baby’s usual diet; do not leave every successful introduction as a one-off.
7. **Do not chase the card.** A family’s clinician-led plan outranks a detector threshold, and no parent needs to produce three exposures to make the app useful.

The goal is not a perfect allergen streak. It is a record clear enough that another parent, health visitor, GP or dietitian can understand what was offered and what happened.

## What this feature should improve next

The lifetime memory and quiet treatment of established foods are strong foundations. Five changes would make the feature more transparent and safer:

1. **Make the copy match the maths.** Say “same day” or “three within seven days” rather than implying an enforced two-day gap.
2. **Add readiness context.** Gate or contextualise the card by age and solid-food readiness.
3. **Separate mixed meals from separate exposures.** Use entry times and meal identity instead of treating every same-date pair as equally close.
4. **Show the evidence.** Let parents open the exact meals that made each allergen look new and correct a missed earlier exposure.
5. **Prioritise reaction safety.** A recorded reaction should replace the pacing nudge with the appropriate safety pathway, never sit behind it.

That is how OBubba becomes more than a tracker: by remembering the family’s history, explaining what it noticed and being candid about what the calculation cannot know.

**[Try OBubba’s weaning and allergen journey →](/app.html)** — keep first tastes, established foods, reactions, milk, sleep and the rest of your baby’s day in one understandable record.

## Frequently asked questions

### Why did OBubba say I should space out new allergens?

The current detector found either two or more genuinely new allergens whose first logged appearances share a calendar day, or at least three first appearances inside the newest seven-day window.

### Does it mean my baby had an allergy?

No. This function does not assess reaction symptoms. It is a low-urgency pacing prompt.

### Will egg, dairy and gluten in one family meal trigger it?

Not when the app’s earlier history already recognises all three as established. If the history is missing or the meal description is unclear, the result may differ.

### Why did two allergens on different days not trigger the card?

That is expected. Two new allergens only trigger this detector when their first appearances are on the same date. Three or more can trigger it across seven days.

### Does OBubba require a two-day wait?

No. The detector does not enforce that interval. NHS national guidance says one at a time and in small amounts, while individual clinical advice may be more specific.

### How far back does the app look?

The caller supplies today plus the previous 21 calendar days of solids, alongside earlier allergen history. The “new this week” test is anchored to the newest meal and covers that date plus the six preceding days.

### What if the latest meal log is old?

The card is suppressed when the newest meal passed into the detector is more than nine days old.

### Can I rely on food names alone?

Use clear ingredient names and stored allergen tags when possible. Free-text recognition is helpful but cannot understand every brand, nickname or mixed recipe.
