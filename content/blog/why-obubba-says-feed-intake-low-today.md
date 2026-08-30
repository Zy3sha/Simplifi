---
title: "Why Does OBubba Say ‘Feed Intake Low Today, Worth an Eye’?"
slug: why-obubba-says-feed-intake-low-today
description: "What OBubba’s bottle-intake pace check really measures, why it ignores breast and combi days, and when reduced feeding or drier nappies need help."
date: 2027-03-27
updated: 2027-03-27
author: OBubba
tags: baby feed intake low today, baby drinking less milk, baby refusing bottle, baby not finishing bottle, baby milk intake dropped, bottle feeding tracker, baby dehydration signs, baby feeding less while teething, milk intake after starting solids, OBubba feeding insight
heroImage: /obubba-feed-intake-low-today.jpg
---

It is 2pm. Your baby has been awake since 6am, but the log contains one 60ml bottle. OBubba says:

> **Feed intake low today, worth an eye**

Does that mean 60ml is unsafe? Is the app telling you to make your baby finish the next bottle? Has it added breastfeeds, night milk or wet nappies into the calculation?

**No. This card is a deliberately narrow daytime bottle-logging pace check.** It appears only when OBubba has evidence of an established measured-bottle pattern, today’s intake appears fully measurable, at least six waking hours have passed, and the positive daytime bottle total is below half of an age-bucket pace line.

It is not a prescribed daily allowance, a dehydration diagnosis or a reason to pressure-feed. Offer milk responsively, check whether the record is complete, and judge feeding alongside wet nappies, alertness, growth and how your baby looks.

![The exact gates behind OBubba’s Feed intake low today card.](/obubba-low-feed-intake-pace-detector.svg "The current Flutter detector requires an established measured-bottle history, no breast or combi feed today, at least six hours since the morning wake, and a positive daytime bottle total below half its age-bucket pace line. It is not a clinical target.")

## The short answer

The current Flutter `diagnoseFeedPattern` engine reaches the main card only when all of these are true:

1. baby is at least **three days old** according to the age value passed into the detector;
2. at least **three positive measured bottle feeds** were logged in the previous seven days;
3. **no breast or combination feed** has been logged today;
4. at least **six hours have passed since the earliest daytime morning-wake entry**—or since 6am if no morning wake exists;
5. today contains at least one positive measured **daytime milk bottle**;
6. that daytime total is **strictly below half** the app’s pace-adjusted age-bucket reference; and
7. the low-intake branch is the first feeding pattern that qualifies.

Solids and pumping are excluded. Night feeds are not added to today’s total. A breastfeed is never converted from minutes into invented millilitres.

If today is marked sick or travel, or OBubba’s shared disruption layer sees recent teething, the same mathematical dip gets the gentler title **Intake lower than usual** and low urgency. Without that context, the card uses medium urgency.

## A worked example: 60ml by 2pm

Imagine a 16-week-old baby:

- morning wake logged at 6am;
- current time 2pm;
- one 60ml daytime bottle logged;
- no breast or combi feeds today;
- plenty of measured bottle history in the previous week.

At 16 weeks, the detector uses its 3-to-under-6-month reference of 600ml across a notional 12 waking hours. Eight hours have passed since the morning wake, so the pace line by 2pm is:

`600 × 8 ÷ 12 = 400ml`

The speaking threshold is half of that, or 200ml. Because 60ml is positive and strictly below 200ml, the card can appear.

Change one detail and the result changes:

- **200ml by 2pm:** no card, because the code uses “less than”, not “less than or equal to”;
- **a 10am wake:** only four waking hours have passed, so the detector stays quiet at noon and 2pm;
- **one breastfeed logged today:** the bottle-only comparison is disabled;
- **only two measured bottles in the previous week:** not enough evidence of an established bottle-fed pattern;
- **60ml plus a 150ml pumping session:** still 60ml of intake; expressed output is not milk the baby drank;
- **60ml plus solids:** still 60ml of measured milk; food grams do not become millilitres;
- **60ml in a feed marked night:** that volume is excluded from this daytime total;
- **no positive bottle amount logged at all:** the card stays quiet because zero could mean “nothing recorded”, not “baby drank nothing”.

## The four age buckets are app guardrails

The current code starts with a whole-day reference before adjusting it to waking time:

| Age used by the detector | Internal reference |
|---|---:|
| under 3 months | 450ml |
| 3 to under 6 months | 600ml |
| 6 to under 12 months | 500ml |
| 12 months and older | 400ml |

These are not personalised prescriptions. Real needs vary with body weight, growth, illness, feeding method and complementary food. NHS guidance focuses on responsive feeding, growth and nappies rather than demanding that every baby finish an age-table volume. Read “around X is typical” as product context: OBubba does not calculate ml per kilogram or replace a clinical feeding plan.

## What actually counts as “intake” here?

The detector begins with today’s milk-feed entries. It removes:

- solids;
- pumping sessions;
- feeds with no positive amount;
- feeds marked as night for the daytime total.

It also declines to run if any breast or `both` feed appears today. That is because breastfeed minutes do not measure transferred milk, and a combi entry contains an unmeasured breast portion. Adding only the bottle top-up would make a well-fed combination-fed baby look artificially behind.

![The current OBubba Flutter Feeding Check-in says bottle millilitres are only the measured part of a combination-feeding day.](/obubba-screen-feeding.jpg "A genuine current Flutter screen: OBubba keeps breastfeeds, measured bottle milk, wet nappies, night feeds and growth separate instead of judging a combi-fed day from bottle volume alone.")

That safeguard depends on today’s log being current. If breastfeeds have not been entered yet, the app can temporarily see a bottle-only day and overstate concern. Correct the log or dismiss the card; do not change feeding because the timeline is incomplete.

**[Try OBubba free →](/app.html)** — connect daytime bottles, breastfeeds, pumping, solids, night milk and nappies without pretending every number belongs in one total.

## Why the clock starts at morning wake

A noon clock-time check is unfair to a baby who woke at 10am. The Flutter engine therefore looks for the earliest non-night wake logged today and measures hours from there.

If no morning wake exists, it falls back to 6am. It then:

- clamps elapsed time between zero and 18 hours;
- maps the first 12 waking hours onto zero to 100% of the age-bucket reference;
- waits until at least six waking hours have passed; and
- asks whether the positive daytime bottle total is below half the resulting pace line.

After 12 waking hours, the reference stops increasing. If the morning-wake entry is missing, the 6am fallback can make a later-waking baby look further behind than they are. Logging the wake improves both feed pacing and sleep predictions.

## Why night bottles are excluded

This branch asks whether measured **daytime** milk is unusually sparse as the waking day unfolds. A bottle marked night is excluded even if it happened after midnight on the same calendar date.

That prevents a large 3am feed from masking a quiet daytime log. It also means “so far today” does not mean every millilitre since midnight.

Day/night classification can be surprising around 5am. Our guide to [whether a 5am feed counts as night or morning](/blog/does-5am-feed-count-night-morning.html) explains why the same timestamp can belong to the reconstructed night until the morning wake closes it.

If your baby is taking substantial milk overnight and little by day, the separate [reverse-cycling guide](/blog/baby-feeds-more-at-night-than-day-reverse-cycling.html) covers that week-level pattern. Do not reduce night milk first in the hope that hunger will force more daytime drinking.

## Why zero does not trigger the card

The code requires `todayMl > 0`.

That may seem counterintuitive: surely zero is lower than 60ml. But zero in a tracker is ambiguous. It can mean:

- no bottles were offered;
- baby refused every bottle;
- feeding happened but was not logged;
- amounts were left blank;
- today is actually breast or combi feeding and those entries are missing;
- data has not synced yet.

Treating all those situations as “zero intake” would produce dangerous false certainty. OBubba stays silent rather than inventing a fact.

The cost is a false negative: a baby who truly has not fed will not receive this card. Never use “no warning” as a health assessment; refusal, drier nappies or an unwell baby need human judgment.

## The card does not calculate dehydration

The low-intake detector receives a wet-nappy count from the brain, but dehydration responsibility has been deliberately removed from this function. The code comments explain why: an older duplicate nappy warning lacked the health engine’s timing and age safeguards and could contradict it.

OBubba now separates the jobs:

- **low-intake note:** a measured daytime bottle pace has fallen far below the app line;
- **health red flag:** too few reliably logged wet nappies, with separate age and time-of-day protection;
- **soft wet-nappy trend:** a sustained fall from the baby’s own baseline while still above the acute floor.

The feeding card alone cannot tell you hydration is fine. NHS guidance says drier nappies than usual can indicate dehydration; feeding, growth, alertness and nappies belong together. From around day five, roughly six heavy wet nappies in 24 hours is one reassuring newborn sign, though individual plans and age matter.

Our [fewer wet nappies guide](/blog/fewer-wet-nappies-than-usual-baby.html) explains the app’s separate hydration layers.

## What to do when the card appears

### 1. Check the record before changing the feed

Look for a missing morning wake, unentered breastfeed, bottle with a blank amount, feed accidentally marked night, or pump volume logged as if consumed. Correct the timeline if needed.

### 2. Offer milk by cues

Early bottle-feeding cues can include rooting, hands to mouth, restlessness and opening and closing the mouth. Offer calmly rather than waiting for crying.

Hold baby close and semi-upright, invite them to take the teat, and keep the bottle almost horizontal so they can pace. Let them pause. If they close their mouth, turn away, relax their hands or push the bottle away, stop the flow and respect the cue.

The NHS says babies vary, may feed little and often and may not finish a bottle. Never force a baby to finish merely to move the app total above a line.

### 3. Make the next opportunity easier

Try a quieter room, a comfortable position and a smaller offer sooner rather than a pressured “catch-up” bottle. Check that the teat is not blocked or flowing unexpectedly fast.

If baby is vomiting or has a tummy illness, continue breast or bottle feeding and seek advice; smaller, more frequent feeds may be easier. Never dilute formula or add extra powder. Prepare it exactly as directed.

### 4. Review the whole baby

Ask:

- Are wet nappies close to normal?
- Is urine pale or becoming dark and strong-smelling?
- Is baby alert and responsive between feeds?
- Are they swallowing effectively?
- Is there vomiting, diarrhoea, fever, congestion, mouth pain or breathing difficulty?
- Is growth following the expected path?
- Is this one lighter day or a continuing decline?

The direction and the baby matter more than forcing one bottle.

## Teething, illness and travel change the tone—not the safety net

When today carries a sick or travel tag, or recent teething is active, the same pace calculation returns **Intake lower than usual**. Its copy says a dip can be common during teething, illness or unsettled days and suggests small, frequent offers.

That is contextual reassurance, not proof of cause. Teething can coincide with sore gums and disrupted feeding, but fever, diarrhoea or a marked deterioration should not be blamed on a tooth. Our [reduced milk while teething guide](/blog/baby-drinking-less-milk-while-teething.html) separates mild gum discomfort from signs needing advice.

Travel can also scramble the log through late entries, a missing wake or a bottle marked night. Check completeness before interpreting the lower-urgency version.

## Starting solids can lower milk—but should not erase it overnight

From around six months, appetite can move gradually as solids increase. The NHS advises continuing breast milk or first infant formula until at least one year; milk remains alongside the expanding diet, and some older babies eventually drop a milk feed as they eat more food.

The detector uses a lower internal reference after six months but still excludes solids: porridge is not measured milk. Do not add food to make up for bottle refusal or withhold milk to create hunger. Our guide to [milk before or after solids](/blog/should-offer-solids-before-after-milk.html) helps arrange pressure-free opportunities.

Remember that the app’s 500ml bucket after six months is not the same thing as the NHS vitamin-supplement threshold mentioning 500ml of formula. Similar numbers can serve different purposes; one must not be used as proof for the other.

## Breastfeeding and combination feeding

This card should not appear once a breast or `both` feed is logged today. That is the correct bias: breastfeed duration cannot be translated reliably into millilitres.

For breastfeeding, look for rhythmic sucking and swallowing, relaxed behaviour after feeds, steady growth and wet nappies. If transfer, latch, pain or supply worries you, ask a midwife, health visitor or breastfeeding specialist to observe a feed.

For combination feeding, keep the two kinds of evidence separate:

| Logged information | What it tells you | What it cannot prove |
|---|---|---|
| bottle amount | measured milk offered/taken | total intake if breastfeeds also happened |
| breast duration and side | timing and opportunity | transferred millilitres |
| pumping amount | milk expressed | milk consumed by baby |
| wet nappies | output pattern | exact intake volume |
| weight trend | growth direction | why feeding changed today |

Do not add pump output to bottle intake. Milk expressed and milk drunk are two different events, even when they happen close together.

## When reduced feeding needs medical help

Contact your GP, midwife, health visitor or NHS 111 promptly if your baby is not feeding normally and you are worried, keeps refusing feeds, cannot keep milk down, has markedly fewer or drier nappies, has a dry mouth, seems unusually sleepy or irritable, or the pattern is worsening.

Young babies need a lower threshold. The NHS notes that babies under six months can be difficult to assess by phone; seek face-to-face or urgent advice when you are very worried.

Get urgent help if baby is hard to wake, floppy or confused; is struggling to breathe; has blue, grey, very pale, blotchy or ashen skin; has green vomit; has a non-fading rash; or has another sign of serious illness. Call 999 for a life-threatening emergency.

Follow any individual feeding, fluid or growth plan from your neonatal, paediatric, dietetic or allergy team instead of a general app prompt.

## Frequently asked questions

### Is OBubba saying my baby must drink 600ml?

No. That is an internal age-bucket reference used to build a time-of-day speaking threshold. It is not a personalised daily target and does not account for body weight or a clinical feeding plan.

### Why did the card appear at 2pm but not noon?

The detector waits until at least six hours after the logged morning wake. If the total remains below half the moving pace line, it may qualify later.

### Why did a breastfeed make the card disappear?

Because the day is no longer fully measurable in millilitres. The app refuses to treat bottle volume as the whole intake on a breast or combi day.

### Do night bottles count?

Not in this branch’s `todayMl`. It measures positive non-night bottle amounts. A separate detector can compare night and daytime bottle averages across recent days.

### Why did no card appear when no feeds were logged?

The detector requires a positive amount. Zero is too ambiguous to interpret safely. No card is not reassurance; act on the baby’s feeding and health signs.

### Should I make a larger bedtime bottle to catch up?

No. Offer responsively and never force a baby to finish. The NHS notes that a big feed does not guarantee a longer gap before the next feed.

## The takeaway

**Feed intake low today, worth an eye** is a narrow Flutter pace check for an established, fully measured bottle-feeding day. It waits six waking hours, excludes breastfeeds, combination feeds, pumping, solids and night milk, and speaks only when a positive daytime total is below half its internal age-bucket line.

That precision is useful—but incomplete. It cannot prescribe milk, detect an unlogged feed, calculate breast transfer or diagnose dehydration.

Use the card as a prompt to check the record, offer calmly, respect stop cues and watch the whole baby. Drier nappies, ongoing refusal, vomiting, unusual sleepiness or a baby who looks unwell matter more than crossing an app number.

## Sources and further reading

[NHS Best Start in Life: Feeding on demand](https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/bottle-feeding/bottle-feeding-your-baby/feeding-on-demand/) — responsive feeding, hunger and stop cues, paced bottles, variable feed size and why a big feed does not guarantee a longer gap.

[NHS Best Start in Life: Bottle feeding your baby](https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/bottle-feeding/bottle-feeding-your-baby/) — safe positioning, following cues, never forcing a bottle, and using growth and nappies to judge adequacy.

[NHS: Formula milk—common questions](https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/bottle-feeding/formula-milk-questions/) — variation in bottle amounts and wet-nappy context.

[NHS: Breastfeeding—is my baby getting enough milk?](https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding-problems/enough-milk/) — swallowing, growth, wet nappies and skilled feeding support.

[NHS: Drinks and cups for babies and young children](https://www.nhs.uk/baby/weaning-and-feeding/drinks-and-cups-for-babies-and-young-children/) — milk alongside complementary foods and continuing breast milk or first infant formula until at least one year.

[NHS: Is your baby or toddler seriously ill?](https://www.nhs.uk/baby/health/is-your-baby-or-toddler-seriously-ill/) — poor feeding, drier nappies, breathing, responsiveness, colour and routes to urgent help.

OBubba Flutter source reviewed for this article: `lib/core/engine/feed_insights.dart`, `lib/core/engine/brain.dart`, `lib/core/engine/health_insights.dart`, `test/feed_insights_test.dart`, `test/feeding_signals_test.dart` and `test/health_insights_test.dart`.
