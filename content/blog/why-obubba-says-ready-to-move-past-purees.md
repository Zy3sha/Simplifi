---
title: "Why Does OBubba Say ‘Ready to Move Past Purées’?"
slug: why-obubba-says-ready-to-move-past-purees
description: "See the exact age, meal-count and 60% smooth-food rule behind OBubba’s texture nudge—and how to move from purées to lumps safely and gently."
date: 2027-05-03
updated: 2027-05-03
author: OBubba
tags: ready to move past purees OBubba, move baby from puree to lumps, baby weaning texture stages, 7 month old lumpy food, baby finger foods, weaning progress app, baby gagging on lumps, mashed food baby, texture progression weaning, baby food texture tracker, OBubba weaning app
heroImage: /obubba-ready-move-past-purees.jpg
---

You open OBubba and see a gentle card:

**Ready to move past purées**

Does that mean the app thinks your baby is behind? Did it watch them eat? Is it telling you to stop spoon-feeding tomorrow?

No.

**The current Flutter app shows this nudge only when it has at least five recent meals whose wording reveals a texture, your baby’s corrected age has reached the app’s next texture band, and at least 60% of those readable meals still sound smooth.** It is a pattern in the record—not an assessment of chewing or swallowing.

The practical response is not a dramatic jump. Keep the familiar food and make one small change: blend it a little less, fork-mash it, or place an appropriately soft finger food beside it while your baby sits upright and you stay close.

## The four gates behind the card

We traced this parent-facing message through OBubba’s current Flutter source and tests. The rule is deliberately narrower than the title might suggest.

![The four software gates behind OBubba’s Ready to move past purées card.](/obubba-puree-nudge-gates.svg "The card needs five texture-readable meals, a corrected-age stage of at least two and a smooth share of 60% or more. It cannot assess the baby directly.")

| Gate | What the app checks | Why the card may stay quiet |
|---|---|---|
| Recent solids | At least **5** recent solid-food logs in the collection | Two or three meals are not enough evidence |
| Texture-readable logs | At least **5** food descriptions contain a recognised texture phrase | “Banana” and “lunch” do not reveal preparation |
| Age band | Corrected age maps to stage 2 or later | The app does not push a newly weaning baby out of smooth food |
| Smooth share | At least **60%** of the readable meals map to stage 1 | A varied run of mashed, lumpy or finger foods keeps it quiet |

If all four pass, the card appears with low urgency. It is a suggestion to explore, not an alert.

## A worked example

Suppose a 32-week-old baby has these six recent entries:

1. carrot purée
2. smooth pear
3. blended peas
4. sweet potato purée
5. mashed banana
6. toast soldiers

All six descriptions contain a texture clue. Four map to smooth and two map to the next stage.

**4 smooth ÷ 6 readable = 66.7% smooth**

That clears the app’s 60% gate, so the nudge may appear.

Change one entry to “fork-mashed carrot” and the result becomes three smooth out of six: 50%. The same child and the same number of meals no longer satisfy this particular rule.

That precision matters. OBubba is not declaring that 59% is healthy and 60% is a problem. The percentage is simply a software threshold used to decide whether a quiet reminder is more likely to help than annoy.

## Which words count as a texture?

The tracker does not analyse a photograph or inspect the food. It reads the food name a parent typed.

| Words in the saved food description | App stage |
|---|---:|
| purée, pureed, smooth, blended, blitzed | 1 — smooth |
| mash, mashed, lumpy, lumps, fork-mash | 2 — mashed/lumpy |
| finger food, soldiers, veg stick, sticks, soft pieces, picked up | 2 — finger-food exploration |
| chopped, minced, diced, small pieces, bite-size | 3 — chopped/minced |
| family meal, same as us, same as everyone, whole family | 4 — family meal |

“Banana”, “porridge” and “chicken” alone produce no texture stage. That is correct: each could be served in several very different ways.

The code also avoids treating **whole milk**, **whole wheat** and **whole grain** as family-meal clues. “Whole” used to be an easy word to misread; the current logic requires an actual family-food phrase such as “whole family meal”.

For a record that helps later, write what was offered rather than only the ingredient:

- “banana” → **fork-mashed banana**
- “broccoli” → **very soft broccoli finger food**
- “pasta” → **small chopped soft pasta**
- “dinner” → **family lentil dhal, lightly mashed**

You do not need to write like a clinician. One honest preparation word is enough.

## The progress ladder and the nudge are different

OBubba’s **Weaning progress** panel shows a texture stage based on corrected age. Its current bands are:

| Corrected-age band in the app | Label shown |
|---|---|
| 26–30 weeks | Smooth purées |
| 30–35 weeks | Mashed with lumps |
| 30–39 weeks | Soft finger foods |
| 39–48 weeks | Chopped & minced |
| 48 weeks onward | Family meals |

These bands overlap in the source because mashed foods and soft finger foods can be explored together. The dashboard chooses the first matching band, so a baby at 32 weeks currently sees **Mashed with lumps**, not two simultaneous labels.

![The genuine current OBubba Flutter Weaning progress panel, showing an age-linked texture stage alongside iron-rich meals, unique foods and days weaning.](/obubba-texture-stage-app.jpg "The progress ladder is an age-linked orientation. It does not prove what texture a baby can safely manage.")

The progress panel can exist after one logged solid. The **Ready to move past purées** insight is more selective: it needs enough recent, texture-readable meal wording and a predominantly smooth pattern.

So neither screen is a milestone test. The age ladder says, “This is the general part of the journey the app is designed around.” The nudge says, “Your recent words still mostly describe smooth food.” Only the baby’s real behaviour—and, when needed, professional assessment—can answer what is safe and manageable.

## What “move past” should mean at the next meal

It does not mean throwing away every purée. Smooth yoghurt, soup and hummus remain normal foods for adults too. Progress means adding variety in texture, not banning smooth food.

Try one of these small bridges.

### Blend for less time

Use the same cooked carrot, pea or lentil mixture, but stop while it still has a little soft texture. A predictable flavour lets the mouth learn one new thing at a time.

### Fork-mash part of the portion

Keep most of a familiar meal as usual and fork-mash a spoonful less smoothly. If that step is too large, mix a little of the mashed portion into the smooth portion.

### Put a soft finger food alongside the spoon

Spoon-feeding and self-feeding can share one meal. A baby does not need to join a “method”. The NHS says there is no right or wrong choice between baby-led weaning, spoon-feeding or a combination; variety and appropriate nutrition matter more.

Choose food that is soft enough for the baby’s stage and prepared to reduce choking risk. Long, graspable pieces of very soft cooked vegetable or ripe fruit are often easier for an early palmar grip than tiny pieces.

### Let touching count

The first win may be squeezing, smearing, licking or bringing the food to the mouth. Texture learning is sensory and motor practice, not a clean-bowl target.

The [NHS guide for 7- to 9-month-olds](https://www.nhs.uk/best-start-in-life/baby/weaning/what-to-feed-your-baby/7-to-9-months/) recommends moving towards mashed, lumpier foods and finger foods as babies can manage them, while continuing breast milk or first infant formula as the main drink through the first year.

## Gagging is not the app’s 60% test

Gagging can happen while a baby learns to move food around the mouth. It is usually noisy. The tongue may come forward, the eyes may water and the baby may retch or bring food forward.

Choking is an airway emergency and can be quiet. A baby who cannot breathe properly needs immediate first aid and emergency help. Read the [NHS choking and gagging guide](https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/choking-and-gagging-on-food/) before you need it, and learn practical infant first aid.

Do not use an app card to decide that repeated gagging, coughing or distress is “normal enough”. Ask a health visitor, GP or an appropriate feeding professional if your baby:

- repeatedly coughs, chokes or becomes distressed with food;
- has wet, gurgly or noisy breathing during or after meals;
- changes colour, becomes unusually quiet or struggles to breathe;
- persistently vomits with textures;
- seems in pain or has difficulty moving food in the mouth;
- is losing skills, losing weight or taking much less milk and food;
- was born prematurely and needs an individual weaning plan; or
- has a condition affecting development, posture, chewing or swallowing.

Call **999** for choking with breathing difficulty or another emergency. Do not pause to complete a log.

## Why corrected age matters

The Flutter call passes corrected age into this rule when it is available. That is important for babies born prematurely: a calendar birthday alone can make a generic texture ladder run ahead of developmental expectations.

Even corrected age is only context. The NHS advises parents of babies born prematurely to ask their health visitor or GP when to start weaning. Neonatal, dietetic or speech-and-language plans take priority over an app band.

If the app’s age looks wrong, check the child profile before trying to make the food match the screen. A wrong date of birth or prematurity detail can shift every age-based suggestion.

## Why the card sometimes does not appear

### “We have logged loads of food”

Loads of ingredients are not necessarily loads of readable textures. Five entries saying “avocado”, “peas”, “toast”, “pasta” and “yoghurt” give the detector no preparation clue.

### “Almost everything is still smooth”

If your child is still in the app’s initial smooth-only band, the age gate suppresses the message. It should not manufacture urgency just because five early meals were puréed.

### “Four out of five were smooth”

Four out of five is 80%, so the share passes. But if only four of those five contain a recognised texture word, the readable-meal gate fails. The detector needs five staged descriptions, not simply five solids.

### “We serve lumps and finger foods already”

If at least 41% of the readable recent entries are beyond smooth, the 60% smooth rule does not pass. This is not a score to optimise. It only prevents a redundant nudge when the record already shows variety.

### “The card disappeared”

New logs can change the proportion, the recent collection can move on, or another insight may take priority in the app’s limited card space. Disappearance does not mean the baby has passed a medical test.

## A separate card handles going backwards

OBubba also has a **Back to softer foods this week** pattern. That is not the same as being mostly smooth for an age band.

The step-back detector needs enough texture-readable meals in two windows. It compares the dominant stage in the newest seven-day window with days 7–13 before the newest meal. If the recent dominant stage is lower, it can surface a low-urgency message.

It also suppresses present-tense wording when the newest solid is more than nine days old. A family who paused logging should not be told something is happening “this week” based on stale data.

A temporary return to softer food can happen with illness, tiredness, sore gums or disruption. Offer manageable foods without pressure and keep an eye on the whole child. If the loss of feeding skills persists or worries you, seek professional advice rather than waiting for an algorithm to resolve it.

For a practical reset, read [Baby gone back to purées?](/blog/baby-gone-back-to-purees-weaning-texture-reset.html).

## Three limits parents should know

### 1. The app recognises words, not physical consistency

One parent’s “lumpy” mash may be another parent’s “smooth”. A label cannot describe lump size, firmness, slipperiness, shape or how the food breaks down in the mouth.

### 2. The dashboard is age-led

The Weaning progress texture is selected from age even if no food description supports it. It is an orientation label, not a personalised capability result. The interface should say this more plainly.

### 3. The insight is not a swallowing screen

It does not know posture, oral-motor skills, medical history, repeated symptoms or whether a professional has recommended a modified texture. A five-meal threshold cannot make a food safe.

## What OBubba should improve next

The current nudge is useful because its internal rule is understandable. It could become much more trustworthy with evidence shown directly in the interface.

- Display **“4 of 6 texture-labelled meals were smooth”** beneath the card.
- Let the parent tap the count to see which descriptions contributed.
- Label the progress ladder **“typical age guide”** rather than implying measured ability.
- Show **unknown texture** separately instead of silently ignoring it.
- Offer quick preparation chips—Smooth, Fork-mashed, Soft finger food, Chopped—while logging.
- Let families following a clinician-led texture plan pause generic nudges.
- Replace fixed week bands with a more flexible, overlap-friendly presentation.
- Add a clear escalation link for repeated coughing, choking, wet breathing or skill loss.
- Suggest one safe, familiar-food bridge rather than a broad instruction to “move on”.
- Ask whether prematurity details are complete before using corrected-age messaging.

The best version would explain its evidence in one sentence and make uncertainty visible. Parents should never have to guess whether the app watched the baby or merely read the log.

## The honest answer

OBubba says **Ready to move past purées** when its current software sees this combination:

**5+ recent texture-readable meals + corrected-age stage 2 or later + 60% or more described as smooth**

It does not mean your baby failed a milestone. It does not mean smooth food is now forbidden. It does not prove that lumps or finger foods are safe for this child today.

Use it as a prompt to look at the real meal. If your baby is ready and has no individual restriction, make one familiar food slightly less smooth or add one appropriately soft finger food, keep them upright, remain within arm’s reach and let exploration be enough.

**[Try OBubba free →](/baby-weaning-tracker.html)** — keep food, preparation, response, allergens, milk, sleep and the rest of your baby’s day in one shared record, with gentle patterns you can inspect rather than mysterious scores.

## Frequently asked questions

### How many smooth meals trigger OBubba’s purée nudge?

The current rule needs at least five recent meals with recognised texture wording. At least 60% of those readable meals must map to smooth purées, and corrected age must be in stage 2 or later.

### Does “banana” count as mashed food?

No. Banana alone has no texture clue. “Mashed banana” maps to stage 2; “smooth banana purée” maps to stage 1.

### Does the app know whether my baby can chew lumps?

No. It reads age and parent-entered food wording. It cannot observe chewing, swallowing, gagging or choking.

### Must I choose baby-led weaning to move beyond purées?

No. You can spoon-feed mashed food, offer safe finger foods or combine both approaches.

### What if my baby was premature?

OBubba uses corrected age where available, but your neonatal or health-professional plan comes first. Ask your health visitor, GP, neonatal team, paediatric dietitian or speech and language therapist when individual guidance is needed.

### What if my baby repeatedly coughs or gags on lumps?

Stop pushing the progression and seek individual advice, especially for repeated coughing, choking, wet breathing, pain, colour change or loss of skills. Call 999 for an airway emergency.

## Sources

- [NHS Best Start in Life: How to start weaning your baby](https://www.nhs.uk/best-start-in-life/baby/weaning/how-to-start-weaning-your-baby/)
- [NHS Best Start in Life: Feeding your baby from 7 to 9 months](https://www.nhs.uk/best-start-in-life/baby/weaning/what-to-feed-your-baby/7-to-9-months/)
- [NHS Best Start in Life: Choking and gagging on food](https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/choking-and-gagging-on-food/)

*This article gives general information for UK families. OBubba is a tracking and education tool, not a swallowing assessment, medical device or emergency service. Follow your baby’s individual clinical plan and call 999 for choking or breathing difficulty.*
