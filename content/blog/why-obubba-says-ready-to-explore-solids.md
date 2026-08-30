---
title: "Why Does OBubba Say ‘Ready to Explore Solids?’"
slug: why-obubba-says-ready-to-explore-solids
description: "See the exact Flutter logic behind OBubba’s solids-readiness card, what it knows, what it cannot know, and the three checks to make before a first taste."
date: 2027-03-30
updated: 2027-03-30
author: OBubba
tags: ready to explore solids OBubba, baby ready for solids, signs baby ready for weaning, when to start solids, corrected age weaning, premature baby weaning, first taste baby, baby weaning tracker, OBubba app
heroImage: /obubba-ready-to-explore-solids.jpg
---

OBubba opens with a question: **“Ready to explore solids?”**

It can feel oddly specific. Did the app notice your baby watching lunch? Did it decide that sitting is steady enough? Is this an instruction to start today?

**No. The card is a timely invitation to check readiness, not a declaration that your baby is ready.** The current Flutter engine shows it when the baby has reached OBubba’s six-month guidance gate and the family history contains no solids entry. It cannot see posture, hand-to-mouth coordination or swallowing. Those checks still belong to the parent, with professional advice when needed.

That difference is the useful part. Instead of a calendar notification saying “start weaning”, OBubba links age and food history to a three-sign checklist, safer-weaning guidance and a low-pressure first step.

## The short answer

When the card appears, do not start with a shopping list. Start with four questions:

1. Is your baby around six months old, using individual professional guidance if they were premature?
2. Can they stay sitting and hold their head steady?
3. Can they coordinate eyes, hands and mouth to look at food, pick it up and bring it towards their mouth?
4. Can they swallow food rather than automatically push it straight back out?

The [NHS says the three developmental signs should appear together from around six months](https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/). Chewing fists, waking more at night and wanting more milk are not proof of readiness. Starting solids is also not a treatment for night waking.

| What the card knows | What it does not know |
|---|---|
| Corrected guidance age from the saved birth and due dates | Whether sitting and head control are stable today |
| Whether any solids feed exists in current or archived history | Whether your baby can coordinate reaching and mouthing food |
| Whether the date of birth is missing or invalid | Whether swallowing is developmentally or clinically safe |
| That the family may need the “Before first tastes” tools | Whether today is calm, illness-free and practical |

![The exact gates behind OBubba’s “Ready to explore solids?” card.](/obubba-ready-to-explore-solids-gates.svg "The app waits for a known corrected age of at least 26 weeks and no solids anywhere in the history. The result opens a human readiness check; it does not certify readiness.")

## Why the card appeared now

The current Flutter path is deliberately small. `diagnoseWeaningPattern` first receives a developmental age and two different views of the solids history.

The **recent view** scans the current day plus the preceding 21 calendar days. It includes entries whose type is feed and whose feed type is solids, provided there is a food name or note.

The **lifetime view** asks whether solids have ever been logged. That answer combines the active day history with a compact lifetime summary, so an old first taste does not become “forgotten” when older daily records are archived out of the app’s hot data.

The card needs all of these conditions:

- the age used by the weaning path is at least **26 completed weeks**;
- the recent solids list is empty; and
- `everLoggedSolids` is false.

If an eight-month-old tried carrot three months ago and has logged nothing recently, OBubba does **not** return to “Ready to explore solids?”. The lifetime flag says the journey already began. With no current meals to analyse, this particular detector stays quiet rather than pretending the family is at day one again.

The engine also has an early guard below 22 weeks, but that is not an earlier readiness window. The actual readiness card still requires 26 weeks. Between those ages it remains silent.

## Corrected age is part of the gate

For a term baby, the developmental age normally matches chronological age. For a baby born at least three weeks early, the Flutter model can calculate corrected weeks using the birth date and due date.

That corrected value drives the weaning gate. In practical terms, a baby who is 26 weeks from birth but eight weeks early may still be around 18 corrected weeks, so this card will wait.

That is a sensible product safeguard, but it is not a complete clinical rule. The NHS tells parents of babies born prematurely to ask their health visitor or GP when to start. [Cambridge University Hospitals’ premature-weaning guidance](https://www.cuh.nhs.uk/patient-information/weaning-babies-born-prematurely/) describes development and corrected age as parts of an individual decision and advises professional support where there is uncertainty.

OBubba’s role is to avoid casually ageing a premature baby up. It cannot use birth history, growth, respiratory needs, oral-motor development and clinical feeding experience the way a neonatal or community team can.

## Missing age makes the app wait—not guess

Elsewhere in the Flutter brain, some general guidance can fall back to an approximate six-month age when a date is unavailable. The weaning path explicitly refuses to use that shortcut.

If the date of birth is blank, malformed or in the future, corrected age is unavailable and the readiness route falls back to the youngest conservative bucket. The card stays hidden.

This matters. Treating “unknown” as 26 weeks could tell the parent of a newborn to explore solids. In a baby app, silence based on missing safety-critical context is better than confident-looking advice built on an invented age.

If you expected the card but do not see it, check that the selected child’s birth and due-date details are accurate. Do not change a date simply to unlock a feature.

## The card is not the checklist

The card’s copy mentions head control, sitting with support and interest in food. The stronger NHS formulation is more specific: the second sign is **coordinating eyes, hands and mouth to look at food, pick it up and put it in the mouth**. Interest alone is not enough.

OBubba’s actual **Before first tastes** screen uses the fuller three-part check:

- **Sits steady** — can stay sitting with minimal support and hold the head confidently;
- **Reaches** — can look, pick up and bring food towards the mouth; and
- **Swallows** — the tongue-thrust response has eased enough for food to move back rather than straight out.

Each sign can be marked only when the parent has seen it consistently. The ticks persist for that child, so readiness can emerge over several ordinary family meals instead of being judged from one excited reach.

![A genuine current OBubba Flutter screen showing the three readiness observations checked for a baby aged six months and one week.](/obubba-solids-readiness-checklist-app.jpg "The app holds age and the three parent-observed signs together. The checklist records observations; it is not a medical assessment of swallowing.")

The button changes its framing too. All three ticks plus at least 26 corrected weeks produces **Start weaning**. If the signs are ticked earlier, the family can still open the educational tools, but the age-gated start language is withheld.

## Why all three signs belong together

### Sitting and steady head control

Eating needs an upright, controlled position. A highchair can provide appropriate support, but it should not disguise a baby who repeatedly folds, tips to one side or cannot keep the head steady.

This is not a competition to sit independently on the floor. It is a question about maintaining a safer eating position. If posture or head control is uncertain, ask a health visitor or feeding professional rather than testing readiness with food.

### Eyes, hands and mouth working together

Watching a fork is social interest. Readiness involves a coordinated sequence: see the food, reach accurately, grasp it and guide it towards the mouth.

This sign also protects responsiveness. The baby can participate instead of having food repeatedly placed into a closed or unprepared mouth. Spoon feeding can still be responsive: wait for the mouth to open, follow cues and let the baby stop.

### Swallowing rather than automatic tongue-thrust

Early food is messy. Some comes out, and one spit-out taste does not prove the sign is absent. You are looking for the emerging ability to manage a tiny amount of an appropriate texture.

This is not the same as deciding that swallowing is medically safe. Repeated coughing, choking, wet or noisy breathing, pain, colour change, recurrent chest infections or significant feeding distress need professional assessment.

## Readiness signs that are easy to misread

The timing is confusing because several normal changes cluster around five to seven months.

| What you notice | Why it can mislead | Better next check |
|---|---|---|
| Chewing hands | Mouthing and teething are normal development | Look for all three readiness signs |
| Watching every bite | Interest is not full eye-hand-mouth coordination | Can baby reach and bring food to the mouth? |
| More night wakes | Sleep can change for many reasons | Offer milk responsively and troubleshoot sleep separately |
| Wanting extra milk | Growth and appetite vary | Continue breast milk or first infant formula |
| One steady sit | A single moment may not persist through a meal | Observe the skill consistently |
| A packet labelled “4+ months” | Packaging does not assess your baby | Use current guidance and individual development |

The “night waking means solids” idea deserves special caution. The NHS explicitly says starting solids does not make a baby more likely to sleep through. If waking changed, use sleep evidence—wake timing, settling, feeds, naps and discomfort—not a developmental food milestone as a sleep fix.

## What to do after the card appears

### 1. Open the preparation guide before offering food

OBubba’s pre-weaning screen keeps the readiness signs beside equipment, gagging versus choking, foods to avoid, allergen introduction, iron, water and the changing milk-food balance.

Read the safety material while nobody is hungry. Learn infant choking first aid before it is needed. The [NHS gagging and choking guide](https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/choking-and-gagging-on-food/) explains that gagging is usually noisy, while choking can be quiet because airflow is blocked.

### 2. Choose a calm first opportunity

Pick a time when your baby is awake, comfortable and not frantic with hunger. Secure them upright in a stable highchair and remain within arm’s reach.

Offer a small amount—perhaps a little mashed food on a spoon, a long piece of very soft cooked vegetable, or a responsive combination. Food should suit the baby’s skill and be prepared to reduce choking risk. A first taste is not a portion target.

### 3. Follow the baby’s answer

Wait for an open mouth when using a spoon. Let the baby touch, squash, lick or ignore a finger food. Stop at repeated head turns, a firmly closed mouth, pushing away or distress.

The useful goal is a safe learning opportunity, not an emptied bowl. The NHS says early intake matters less than learning tastes, textures and the mechanics of eating.

### 4. Keep milk central

Breast milk or first infant formula remains the main source of energy and nutrients at the beginning and the main drink throughout the first year. Do not drop milk feeds because one teaspoon was swallowed.

Solids **complement** milk. They do not replace it on the day the card appears.

### 5. Log what actually happened

In OBubba, use **Track → Feed → Solids**. A useful first entry might be:

`soft steamed broccoli floret — first taste`

Specific food wording helps the app recognise allergens, build the food history and later understand variety, iron-rich offers and texture progress. Use **Loved**, **Unsure** or **Reaction** for the food response; do not use Reaction as a dislike button.

Once that entry saves, `everLoggedSolids` becomes true. The readiness card has done its job and should not keep treating the family as if the first taste never happened.

## What OBubba can do next

The first log changes the app from readiness mode to history-informed support. Depending on age and what is recorded, the Flutter features can then help with:

- recognised allergens and the 14-group journey;
- first-taste ideas that avoid foods already tried;
- iron-rich meal visibility;
- texture-stage context from preparation words;
- gentle prompts when several meals point to refusal or a stalled texture;
- recipes ranked by age stage, history, iron and allergen context; and
- a saved six-meal plan with a derived shopping list.

This is where a connected tracker becomes more useful than a static checklist. The first broccoli taste sits beside milk, sleep, nappies and growth, while the app remembers that weaning has begun.

**[Try OBubba’s weaning tracker free →](/baby-weaning-tracker.html)** — move from “might be ready” to a calm first-food record without losing the rest of your baby’s day.

## Why the card might stay hidden

The current logic stays silent when:

- corrected age is below 26 weeks;
- birth data is missing or invalid;
- any solids feed has ever been logged, even if it was months ago;
- a recent solids entry already exists; or
- the baby profile is still marked as expecting.

Silence does not mean “not ready”, just as the card does not mean “definitely ready”. It means the conditions for this particular low-urgency prompt are absent.

There is another development-oriented Flutter signal that can mention solids readiness when age, a steady-sitting note and no recent solids align. Its wording is different and it looks for a sitting clue in recent notes. The **“Ready to explore solids?”** card explained here is the simpler weaning-journal route: age plus lifetime food history, followed by a human checklist.

## A useful product limitation

The engine does not read the three persisted checklist ticks before it creates the “Ready to explore solids?” card. It also does not claim to. The card is intentionally phrased as a question.

That separation avoids a worse mistake: converting an age threshold into a readiness verdict. But it also means the app cannot know that sitting is not yet steady, that swallowing is under clinical review or that a neonatal dietitian supplied a different plan.

Treat OBubba as the organiser:

- it remembers age and history;
- it brings the right questions forward;
- it keeps preparation guidance nearby; and
- it stops repeating the first-taste prompt after the journey begins.

The parent and health team still decide when and how to start.

## Frequently asked questions

### Does the card mean I should start solids today?

No. It means the app has a known corrected age of at least 26 weeks and no recorded solids history. Check all three developmental signs and any individual professional advice.

### Why did it appear exactly at 26 weeks?

The current Flutter gate uses whole completed weeks and opens at 26. That is OBubba’s implementation of “around six months”, not a claim that every baby becomes ready on the same day.

### Why did my premature baby not get the card at six chronological months?

OBubba uses corrected age for this developmental guidance. Premature weaning is individual, so ask your health visitor, GP, neonatal team, dietitian or feeding specialist when to begin.

### Why did the card disappear after one tiny taste?

A solids feed is enough to mark that solids have been logged. The card is about beginning, not about measuring intake. Later tools use the developing food history.

### Does waking more at night count as readiness?

No. The NHS lists increased night waking among behaviours that can be mistaken for readiness and says solids do not make sleeping through more likely.

### Must my baby eat a full meal?

No. Start with a few pieces or teaspoons, follow cues and keep normal milk feeds. Early weaning is practice with food, not a portion test.

### Can the app assess swallowing?

No. It records parent observations and food history. Repeated coughing, choking, wet breathing, pain or significant difficulty needs professional assessment.

## Sources

- [NHS: Your baby’s first solid foods](https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/)
- [NHS Best Start in Life: From around 6 months](https://www.nhs.uk/best-start-in-life/baby/weaning/what-to-feed-your-baby/from-around-6-months/)
- [NHS Best Start in Life: Choking and gagging on food](https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/choking-and-gagging-on-food/)
- [Cambridge University Hospitals: Weaning babies born prematurely](https://www.cuh.nhs.uk/patient-information/weaning-babies-born-prematurely/)
- OBubba Flutter source reviewed: `weaning_insights.dart`, `brain.dart`, `child_sync_repository.dart`, `pre_weaning_screen.dart`, `dev_predict.dart`, `dev_predict_adapter.dart`, `weaning_insights_test.dart`, `engine_integration_test.dart`, `dev_predict_test.dart`, `day_trim_test.dart` and `lifetime_summary_test.dart`.

*OBubba is a record, pattern and education tool. It cannot assess developmental readiness, posture, chewing, swallowing, nutrition or choking risk. It does not replace advice from a health visitor, GP, neonatal team, paediatric dietitian, speech and language therapist, paediatrician, NHS 111 or emergency services.*
