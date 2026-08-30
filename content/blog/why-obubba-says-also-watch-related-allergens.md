---
title: "Peanut Reaction: Why OBubba Says ‘Also Watch’ Other Allergens"
slug: why-obubba-says-also-watch-related-allergens
description: "Why does OBubba mention tree nuts, lupin and soya after a peanut reaction? Understand related allergens, what the app changes, and what to do next."
date: 2027-03-12
updated: 2027-03-12
author: OBubba
tags: peanut reaction baby, peanut allergy baby, related allergens baby, cross reactivity food allergy, tree nut allergy baby, lupin allergy, soya allergy baby, baby food reaction tracker, allergen tracker app, OBubba weaning
heroImage: /obubba-related-allergens-after-reaction.jpg
---

You log **Reaction** after your baby eats peanut. Later, OBubba’s Allergen journey says:

> **If baby reacts, also watch: tree nuts, lupin, soya.**

That can sound frighteningly like three new diagnoses. It is not.

**“Also watch” is a conversation flag, not a result.** Some food groups contain related proteins or are found together in children with food allergy, but a reaction to peanut does not automatically mean a child is allergic to tree nuts, lupin, soya—or even confirm peanut allergy. The current Flutter app keeps the original parent observation visible, stops casually recommending the recorded group and surfaces related families worth discussing with a qualified clinician.

## The 20-second answer

If a possible reaction has happened:

1. **Look after the baby first.** For breathing difficulty, throat or tongue swelling, collapse, unusual floppiness or another severe reaction, follow the child’s allergy plan, use an adrenaline auto-injector if prescribed, and call **999**.
2. **Pause the suspected food.** Do not deliberately give it again to test the theory at home.
3. **Record facts, not conclusions.** Food, ingredients, amount, time, symptoms and what happened next are more useful than writing “allergic”.
4. **Ask for medical advice.** A GP, health visitor or allergy team can decide what needs assessment and what should remain safely in the diet.
5. **Read related-food prompts as questions.** They do not prove another allergy and do not mean every named food should automatically be removed.

![A five-step safety path showing that a related-allergen prompt is for a clinical conversation, not a home food challenge.](/obubba-related-allergen-safety-path.svg "Related is not the same as allergic: deal with symptoms first, pause the suspected food, preserve the evidence and agree the next step with a clinician.")

## Why peanut can make other food names appear

Peanut is a **legume**, not a tree nut. Other legumes include soya, peas, beans, lentils and lupin. Their proteins can share structural similarities, which is one reason clinicians think about cross-reactivity.

But biological relationship is not destiny. Allergy UK explains that most people with peanut allergy can eat other legumes, while lupin deserves particular attention because it can share relevant proteins with peanut. Its guidance also says peanut allergy does not automatically mean tree-nut allergy, although the two can occur in the same child.

That gives “also watch” its proper scale:

| Prompt | What it can mean | What it cannot mean |
|---|---|---|
| **Tree nuts** | Peanut and tree-nut allergies sometimes coexist; individual assessment may be useful | Peanut is a tree nut, or every tree nut is unsafe |
| **Lupin** | A related legume whose proteins can cross-react with peanut | A peanut reaction confirms lupin allergy |
| **Soya** | Another legume that may be relevant to the history | All legumes should be removed |

The words **cross-reactivity** and **co-allergy** are also different. Cross-reactivity describes an immune response to similar proteins. Co-allergy means the person has more than one allergy, whether or not shared proteins explain it. A tracking app cannot establish either.

## What the current OBubba app actually does

We traced the production Flutter code through the solids logger, long-term child summary, Allergen journey, first-taste chooser, recipe engine and weekly-plan regeneration.

### 1. Reaction starts as a parent observation

Under **Track → Feed → Solids**, a parent can type the food and choose **Loved it**, **Unsure** or **Reaction**. OBubba recognises common ingredient words and family dishes, then stores the detected major-allergen groups with the meal.

That matters for peanut butter on toast, for example: the description may carry **peanut** and **gluten**. A mixed meal marked Reaction does not tell the app which ingredient caused anything. It only preserves the groups present in the saved record.

### 2. Recognised groups enter a lifetime reaction memory

The current child model combines recent active days with an archived lifetime summary. A recognised allergen attached to a Reaction entry can therefore remain in `allergensEverReacted` even after the original daily row leaves the app’s active history window.

This is intentionally cautious. It means “a parent once recorded a reaction with this group present,” not “the allergy is permanent” and not “a clinician confirmed it”.

### 3. The Allergen journey changes its tone

Opening a group with a recorded reaction shows **Reaction logged**. The usual first-taste serving tip is hidden, and the regular “keep offering” advice is replaced with a prompt to pause and check with a doctor before offering it again.

![OBubba’s genuine Flutter Allergen journey keeps the 14 major groups visible and separates introduced foods from the next suggested introduction.](/obubba-allergen-journey-app.jpg "The Allergen journey is a memory aid. A manually ticked introduction, a logged reaction and a medical diagnosis are three different things.")

For selected groups, the detail sheet also computes a related-family panel. In the current app, peanut produces **tree nuts, lupin and soya**. If a meal already contained one of those groups, the helper avoids repeating it as an “other” group.

The wording is conditional—**“If baby reacts”**—because parents can open this educational detail before any reaction has been recorded. It is not a red alert saying a new event occurred.

### 4. First tastes stop re-suggesting the recorded group

The first-tastes chooser separately receives the child’s reacted set. Catalogue foods carrying a recorded reacted allergen are removed, so peanut should not quietly return as an ordinary “try this next” card.

### 5. Recipes and regenerated plans keep the same boundary

The recipe engine filters recipes whose listed or detected ingredients contain a reacted allergen. The Flutter screen passes the lifetime reacted set into both the quick weekly picks and full plan generation. Pressing **Regenerate plan** applies the filter again.

That persistence is one of the app’s most useful safeguards: a frightening meal does not become invisible merely because it happened months ago.

### 6. Reassuring copy is blocked too

OBubba has a separate insight that can celebrate several calm, recent exposures with wording such as **Looking good with Egg**. Its caller also checks the lifetime reaction set. A historical recorded reaction prevents that gentle reassurance from resurfacing simply because the individual event is outside the recent analysis window.

## What OBubba does not know

The app cannot see:

- whether the symptom was hives, contact irritation, gagging, reflux, infection or something else;
- whether enough food was swallowed to count as a meaningful exposure;
- which ingredient caused a reaction after a mixed meal;
- whether peanut touched another food through a shared knife or surface;
- whether a related food is already eaten safely and regularly;
- whether a test or supervised food challenge is appropriate; or
- whether the parent selected Reaction by mistake.

It also groups almonds, cashews, hazelnuts, pistachios, walnuts and other named nuts under the broad **tree nuts** label. Clinically, a child may react to one nut and tolerate another. The app’s group-level warning is useful for caution, but it cannot replace nut-specific history and specialist assessment.

## Do not turn the watch list into a DIY elimination diet

Seeing four food groups on a screen can tempt a family to clear the kitchen. That may remove foods a baby already tolerates and make an already demanding weaning period harder.

The NHS warns against experimenting by cutting out a major food such as milk without professional support because nutritional intake can suffer. Allergy UK similarly says people with peanut or soya allergy do not automatically need to avoid every legume; specialist advice may be needed to work out what is safe.

If your baby already eats a related food comfortably, record that history and tell the clinician. Do not independently stop or reintroduce foods against an existing allergy plan. The correct next step depends on the reaction, the child’s health and the exact foods involved.

## A better reaction entry for a better appointment

Compare these two records:

> **Lunch — nuts — reaction.**

and:

> **12:20pm — smooth peanut butter thinned into usual oat porridge; about 2 teaspoons eaten. Raised itchy-looking patches on face and trunk at 12:32pm. No breathing change noticed. Stopped meal; called NHS 111; rash faded by 1:15pm.**

The second entry does not pretend to diagnose the cause. It gives a professional a timeline, preparation, amount, symptom distribution and action taken.

Useful details include:

- exact product and ingredient list, with a packet photo if practical;
- how the food was prepared and served;
- approximate amount eaten;
- when eating started and when each symptom appeared;
- where a skin change occurred and whether it spread;
- vomiting, cough, wheeze, swelling, voice or breathing changes;
- illness, fever, eczema flare, medicines or exercise around the event;
- photographs taken without delaying care; and
- advice, treatment and recovery time.

Write the record after the baby is safe. No app entry is worth delaying emergency action.

## What if OBubba detected the wrong group?

Automatic food recognition is helpful, not omniscient. “Porridge” may be prepared with cows’ milk, breast milk, formula, water or a plant drink. A pesto may contain cashew, pine nut, another nut or no nut. Recipes and brands change.

Use specific ingredient wording before saving, check the detected labels and keep the package information when a possible reaction matters. If an old entry is wrong and no longer editable because it has archived, keep the correction in the health record you take to the clinician. Do not assume changing a manual introduction tick erases a reaction-linked safety record.

## A calm way to use the prompt

When **also watch** appears, translate it into four questions:

1. Which exact food and ingredients were present?
2. What observable symptom happened, and how soon?
3. Which related foods has my baby already eaten without concern?
4. What does our clinician want us to pause, continue or assess?

That is the right job for OBubba: turning a foggy memory into a concise, shared record while keeping dangerous overconfidence out of the next recommendation.

**[Try OBubba free →](/app.html)** — track first foods, detected allergens, reactions, recipes, sleep, feeds and the rest of your baby’s day in one calm family record.

## Frequently asked questions

### Does a peanut reaction mean my baby is allergic to tree nuts?

No. Peanut is a legume, and peanut allergy does not automatically mean tree-nut allergy. The conditions can coexist, so ask a qualified professional what is appropriate for your child rather than testing tree nuts yourself after a suspected reaction.

### Should I avoid soya, peas, beans and lentils too?

Not automatically. Most people with peanut allergy tolerate other legumes. Lupin has a recognised cross-reactivity relationship with peanut, but an individual plan should determine what is avoided or assessed.

### Why does the related-food panel appear before I log a reaction?

The current Allergen journey uses conditional educational wording—**If baby reacts**—inside the allergen detail. It describes what may be relevant if a reaction occurs; it does not claim the app detected one.

### Can OBubba diagnose a food allergy?

No. It stores parent observations, recognised allergen groups and cautious recommendation filters. Diagnosis requires an appropriate clinical history and, where indicated, professional testing or supervised challenge.

### What should I do for a severe reaction?

Follow the child’s allergy action plan, use an adrenaline auto-injector if prescribed and call **999**. Severe breathing difficulty, throat or tongue swelling, collapse, confusion, unusual drowsiness or a limp, unresponsive child require emergency action. Do not wait for an app response.

## Sources and further reading

- [NHS: Food allergies in babies and young children](https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/)
- [NHS: Anaphylaxis](https://www.nhs.uk/conditions/anaphylaxis/)
- [Allergy UK: Peanut allergy](https://www.allergyuk.org/resources/peanut-allergy-factsheet/)
- [Allergy UK: Reactions to legumes](https://www.allergyuk.org/resources/reactions-to-legumes/)
- [BSACI: Peanut, tree nut and seed allergy](https://www.bsaci.org/resources/allergy-management/food-allergy/foods-involved/peanut-tree-nut-and-seed-allergy/)

*OBubba is a tracking and education tool, not medical advice, an emergency service or an allergy test. Call 999 for a severe reaction. For non-emergency concerns, contact your GP, health visitor, allergy team or NHS 111.*
