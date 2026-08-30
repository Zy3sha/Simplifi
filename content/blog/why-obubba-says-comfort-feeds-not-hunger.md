---
title: "Why Does OBubba Say ‘Comfort Feeds, Not Hunger’?"
slug: why-obubba-says-comfort-feeds-not-hunger
description: "What OBubba’s small night-feed pattern actually measures, why a feed can be comfort and nutrition at once, and why the card is not permission to night-wean."
date: 2027-03-25
updated: 2027-03-25
author: OBubba
tags: comfort feeds not hunger, baby small night feeds, baby wakes for bottle comfort, comfort feeding at night, baby hungry or comfort at night, OBubba night feeds, night weaning baby, feed to sleep association, baby bottle at night, responsive night feeding
heroImage: /obubba-comfort-feeds-not-hunger.jpg
---

Your baby woke at 12:40am, drank 30ml and went back to sleep. At 3:15am it happened again. In the morning OBubba says:

> **Comfort feeds, not hunger**

That title sounds much more certain than a sleep tracker can be. Can an app really know why a baby fed? Should you stop offering milk tonight?

**No. Read the card as “small measured feeds at nearly every wake—comfort may be part of the pattern.”** The current Flutter detector has found a narrow combination of logged wakes, night feeds and bottle amounts. It has not measured breast-milk transfer, examined your baby, checked hydration or growth, or proved that hunger was absent.

A feed can deliver milk, regulation, closeness and reassurance at the same time. Comfort feeding is real care, not manipulation or a bad habit. The useful next step is to look at age, daytime intake, feeding cues, nappies, growth, health and whether this pattern works for your family—not to withhold milk because a card used a decisive title.

![The exact gates and safety overrides behind OBubba’s Comfort feeds, not hunger night diagnosis.](/obubba-comfort-night-feeds-detector.svg "The current Flutter classifier needs an older baby, at least two qualifying night feeds, feeding at nearly every wake and a measured average under 40ml. It cannot prove that hunger was absent.")

## The short answer

The current Flutter night analyser only reaches this title when all of these are true:

1. baby is at least **16 weeks** old, because younger babies receive a newborn-appropriate night read instead;
2. the reconstructed night contains at least **two qualifying night feeds**;
3. the feed count is at least the wake count minus one—so feeding happened at almost every waking;
4. at least one qualifying night feed has a positive measured amount;
5. the average of those positive measured amounts is **more than zero but under 40ml**; and
6. a higher-priority explanation has not already won.

The body then says that, **if the pattern keeps happening most nights**, feeding may have become the route back to sleep. It suggests a brief reassurance before offering a feed and tells the parent to judge several nights, not one.

That is a pattern hypothesis. “Not hunger” is not a clinical finding.

## A worked example

Imagine a complete night from 7:30pm to 6:30am:

| Time | What was logged |
|---|---|
| 12:40am | wake + 30ml bottle |
| 3:15am | wake + 25ml bottle |
| 5:10am | brief wake, resettled without milk |

There are three wakes and two night feeds. Two is at least `3 − 1`, so feeding happened at nearly every wake. The measured average is 27.5ml, below the 40ml threshold. If no stronger branch takes precedence, the comfort-feed title can appear.

Now change one detail:

- **one 30ml feed and one unmeasured breastfeed:** the current average can be built from the one positive measured amount, while the night-feed count still includes both qualifying feeds;
- **two 45ml feeds:** the average is no longer under 40ml, so this comfort-volume branch stays quiet;
- **two 90ml feeds:** the broader feed-driven diagnosis can describe them as sizeable and likely genuine hunger;
- **only one feed across three wakes:** this branch does not qualify;
- **two of three wakes explicitly tagged as hunger:** the parent’s direct hunger tags take priority;
- **baby is 12 weeks old:** the newborn gate wins and the app does not label a sleep association.

This shows why 40ml is a speaking threshold, not a biological border. A 39ml feed is not automatically comfort and a 41ml feed is not automatically hunger.

## What counts as a night feed in this calculation?

OBubba first rebuilds one physical night across midnight. A bedtime logged yesterday, a 2am bottle logged today and the morning wake are joined before the diagnosis runs.

The qualifying feed count excludes:

- dream feeds;
- pumping sessions, because expressed milk is output, not milk the baby drank;
- solids, because grams of food are not milk volume.

Near-simultaneous wake and feed entries are folded into one waking episode. A parent logging “wake” and then “bottle” at 2:01am should not create two wakes. Duplicate feeds within a few minutes are also guarded against, and the number of feeds is never allowed to exceed the de-duplicated wake count.

For the volume average, the caller uses qualifying night-feed entries with a positive recorded amount. In ordinary use, that means measured bottle milk. Breastfeed duration is not converted into invented millilitres.

There is an important limitation in the current implementation: the average is calculated from the feeds that have positive recorded amounts, while the sentence can display the total number of qualifying night-feed episodes. On a mixed night containing measured bottles and unmeasured breastfeeds, the displayed average may therefore describe only the measured part. Treat it cautiously rather than assuming every feed had that volume.

## Why a small feed cannot prove “not hungry”

Volume is context, not motive.

A baby may take a small amount because:

- they wanted a little milk or thirst relief;
- they were sleepy and stopped quickly;
- the bottle flow, temperature or position changed;
- congestion, teething or illness made feeding less comfortable;
- they had fed well shortly beforehand;
- closeness and sucking helped them regulate;
- they took milk at the breast that was not measured;
- the logged amount was an estimate or the bottle entry was incomplete.

The NHS says babies tend to feed little and often and may not finish a bottle. Responsive bottle feeding means following cues, pacing the feed and never forcing a baby to finish. UNICEF UK Baby Friendly also describes responsive feeding as nutrition, love, comfort and reassurance—not separate boxes that a parent must choose between.

So the best translation is:

> “The measured bottles were small and feeding accompanied most wakes. If this repeats and your baby is otherwise ready, you could test whether reassurance sometimes works before milk.”

Not:

> “Your baby was not hungry, so do not feed next time.”

## The higher-priority reads that can block this title

The classifier does not jump straight from “two feeds” to “habit”. Several stronger signals are checked first.

### Newborn age

Before 16 weeks, OBubba returns **Normal newborn sleep** or **A settled newborn night**. The copy says frequent waking for feeding and comfort is normal and specifically avoids sleep-training language.

### A parent tagged hunger

If at least two wakes are marked as hunger and hunger accounts for at least half of the wakes, **Hunger-driven wakes** wins. Direct caregiver context outranks the volume inference.

### Illness, teething or a developmental disruption

If a would-be habit read happens during an active illness, teething phase or developmental window, the app switches to a gentler disruption caveat: the rough night is more likely connected to what the baby is going through than a habit to fix.

### A more specific night shape

An early finish, false start, long wake between 3am and 5am, true split night or a set of very brief self-resettled stirs can all be identified before the small-feed branch. The structure of the night sometimes offers a more useful explanation than feed volume.

### A logged settling association

If bedtime was logged as settled by feeding, rocking, holding, patting or a dummy and there were repeated wakes without hunger tags, the more direct **Sleep-onset association** read can win first.

These priorities matter. Parents should not receive “remove comfort feeding” when the record more strongly says newborn, hungry, unwell, overtired or briefly stirring normally.

## One night is not a night-weaning plan

The daily diagnosis can appear from one qualifying night. The wider brain then looks across up to seven recent nights and adds context when the same broad cause repeats. With at least three matching causes it can call the picture corroborated; when there is only one match among at least three real nights, it can say this was just last night and is worth watching rather than acting on.

Even a repeated card is not medical clearance to reduce night milk.

The current **Care → Night Weaning** pathway is deliberately separate. It starts around six months rather than 16 weeks and presents three readiness lights:

- age context;
- daytime nourishment;
- recent night pattern.

That screen begins with a baseline night—feed normally and log what happens—before any gradual change. A baby may be old enough for the comfort-feed classifier but far too young or not ready for night-weaning.

![OBubba’s current Flutter Night Weaning screen checks age, daytime nourishment and recent nights before suggesting a gradual plan.](/obubba-night-weaning-readiness-app.jpg "A genuine current Flutter screen: the Night Weaning pathway uses three readiness lights and remains separate from a one-night comfort-feed diagnosis.")

**[Try OBubba free →](/app.html)** — connect night wakes, measured bottles, breastfeeding, daytime feeds and growth without turning one small bottle into a rule.

## What should I do at the next wake?

Use a cue-first ladder, not a no-feed rule.

### 1. Pause long enough to observe

If your baby is safe and only stirring, take a breath before fully intervening. Some brief noises happen between sleep cycles. If crying is escalating or hunger cues are clear, respond promptly.

### 2. Check the immediate need

Notice rooting, hands to mouth, eager sucking, how long it has been since a substantial feed, illness signs, temperature, nappy, discomfort and whether the baby is properly awake.

### 3. Offer brief reassurance when it feels appropriate

For an older, well baby who fed recently and is not showing clear hunger cues, you might try a hand on the chest, quiet voice, cuddle or the usual non-feeding settling cue first. “First” means a brief experiment, not a prolonged delay through distress.

### 4. Feed responsively

If your baby roots, drinks eagerly, remains unsettled or you are unsure, offer milk. For a bottle, pace the feed and let the baby stop. Do not make a larger bottle or pressure them to finish in the hope that more volume guarantees a longer stretch; NHS guidance says a big feed does not necessarily create a longer gap.

### 5. Review the whole day in daylight

Ask whether daytime feeding opportunities were calm and sufficient, wet nappies and growth are reassuring, and the night pattern is repeated. Do not make a 3am decision about permanent night-weaning from one chart.

Our [night-weaning readiness guide](/blog/is-my-baby-ready-to-night-wean.html) separates “sometimes settles without milk” from “ready to reduce night feeds”.

## Breastfeeding changes the interpretation

A breastfeed is not a bottle with invisible markings. Minutes at the breast do not reveal millilitres, and a short feed can contain active transfer. Night feeding may also support milk supply, particularly in younger babies.

The current small-volume branch is most interpretable on nights where the relevant feeds were measured bottles. It should not turn an unmeasured breastfeed into zero or label flutter sucking as nutritionally meaningless.

If breastfeeding intake worries you, use whole-baby evidence. NHS signs include visible or audible swallowing, a baby who appears satisfied after most feeds, steady growth, healthy alert behaviour and appropriate wet nappies. Ask a midwife, health visitor or breastfeeding specialist to observe a feed if milk transfer, latch, pain or supply is a concern.

Do not introduce or enlarge formula top-ups solely to make a graph look better. Adding bottles can affect breast-milk production, so feeding changes deserve individual support.

## When small feeds need health advice

Small night bottles are not automatically a health problem. Seek advice when they sit inside a worrying wider picture.

Contact a health professional if your baby is not feeding normally and you are worried, has fewer or drier nappies, repeatedly vomits, seems unusually sleepy, has breathing difficulty, is in pain, or is not gaining weight as expected.

Use urgent NHS guidance for a child who is hard to wake, has blue, grey, unusually pale or blotchy colour, is struggling to breathe, has a non-fading rash, has green vomit or is otherwise seriously unwell. A tracker should never delay care.

## Keep tired-night feeding safe

Night feeding happens when adults are exhausted. Plan the setup before you need it.

- Never feed with a bottle propped or leave a baby alone with a bottle.
- Avoid falling asleep with a baby on a sofa or chair.
- Put baby back on their back in a clear, flat, firm cot or Moses basket before the adult sleeps.
- Keep pillows, loose bedding, toys, nests and cot bumpers out of the sleep space.
- Share the resettling load when possible.

The safer-sleep setup does not change because a feed was small or because the app suggested reassurance first.

## Frequently asked questions

### Does under 40ml mean a comfort feed?

No. It is the Flutter detector’s threshold for raising a possible pattern. Age, feed history, cues, health and the measured-versus-unmeasured record still matter.

### Why did OBubba show this after only one night?

The night diagnosis reads the last reconstructed night. The surrounding insight layer adds multi-night corroboration when available, but the title itself can appear from one qualifying night. Follow the body’s instruction to judge several nights.

### Why did my breastfed baby get this card?

The average only uses qualifying feed entries with positive recorded amounts. On a mixed breast-and-bottle night, one or more measured bottles can supply the average while unmeasured breastfeeds still contribute to the total feed count. Check the underlying log and do not interpret the number as breast-milk transfer.

### Why did 45ml feeds produce “Feed-driven wakes” instead?

The comfort-volume branch requires an average under 40ml. Between 40ml and 80ml, the app keeps the broader **Feed-driven wakes** title without calling the feeds either tiny or sizeable. At 80ml or above it may add that the measured feeds were sizeable and likely genuine hunger.

### Should my partner resettle instead of me?

That can be a gentle experiment when baby is older, well, recently fed and the family wants more flexibility. It is not compulsory, and the feeding parent can also offer non-feeding reassurance. Feed when cues persist.

### Is comfort feeding a bad habit?

No. Feeding is a powerful and valid way to regulate a baby. It becomes a change question only when it is no longer working for the family and the baby is developmentally and nutritionally ready for another approach.

### Will a bigger bedtime bottle stop the wakes?

Not reliably. The NHS explicitly notes that a big feed does not mean a baby will go longer between feeds. Pace bottles, follow cues and never pressure a baby to finish.

## The takeaway

**Comfort feeds, not hunger** is shorthand for a very specific logged pattern: an older baby, at least two night feeds, feeding at nearly every wake and a positive measured average under 40ml, with no stronger explanation taking priority.

It is useful as a question. It is too narrow to be a verdict.

Milk and comfort can coexist. Respond to the baby, judge several nights, keep feeding and sleep safe, and use OBubba’s separate readiness pathway before considering any gradual night-weaning change.

## Sources and further reading

[NHS Best Start in Life: Feeding on demand](https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/bottle-feeding/bottle-feeding-your-baby/feeding-on-demand/) — hunger cues, paced bottles, small frequent feeds and why a big feed does not guarantee a longer gap.

[NHS: Breastfeeding—Is my baby getting enough milk?](https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding-problems/enough-milk/) — swallowing, wet nappies, alertness, growth and skilled feeding support.

[NHS: Helping your baby to sleep](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/) — age-related night feeding and individual sleep patterns.

[UNICEF UK Baby Friendly: Responsive feeding infosheet](https://www.unicef.org.uk/babyfriendly/baby-friendly-resources/relationship-building-resources/responsive-feeding-infosheet/) — feeding as nutrition, love, comfort and reassurance.

[UNICEF UK Baby Friendly: Caring for your baby at night](https://www.unicef.org.uk/babyfriendly/baby-friendly-resources/sleep-and-night-time-resources-/caring-for-your-baby-at-night/) — night feeding, rest and safer sleep.

OBubba Flutter source reviewed for this article: `lib/core/engine/night_analysis.dart`, `lib/core/engine/brain.dart`, `lib/core/engine/night_corroboration.dart`, `test/night_analysis_test.dart` and `test/night_corroboration_test.dart`.
