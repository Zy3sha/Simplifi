---
title: "Why Does OBubba Say ‘Daytime Milk Is Up This Week’?"
slug: why-obubba-says-daytime-milk-up-this-week
description: "See the exact two-week Flutter calculation behind OBubba’s daytime-milk trend—and how to respond without chasing bottle totals or expecting better sleep."
date: 2027-04-01
updated: 2027-04-01
author: OBubba
tags: daytime milk is up this week, baby drinking more milk, OBubba feeding insight, baby bottle intake increased, baby growth spurt feeding, responsive bottle feeding, baby milk tracker, expressed milk tracker, formula feeding tracker, baby feeding app
heroImage: /obubba-daytime-milk-up-this-week.jpg
---

OBubba says **“Daytime milk is up this week.”** Underneath, it may show that your baby averaged 960ml per measured day, up about 37% from 700ml the week before.

Is that a growth spurt? Does it mean the baby needs larger bottles now? Will taking more by day reduce night feeds?

**Not from this card alone.** The current Flutter detector has found a real week-over-week rise in the daytime milk amounts that reached the log. It has not measured breast-milk transfer, checked growth, compared night sleep or decided how much the next bottle should contain.

That narrower result is still useful. It can reveal a change that is hard to see across dozens of individual feeds—as long as the family reads “measured daytime milk” rather than “everything my baby consumed”.

## The short answer

When the card appears:

1. Keep feeding responsively; do not create a new bottle target from the average.
2. Check whether the rise reflects appetite, more measured bottles, better shared logging or a shift away from breastfeeding.
3. Look at the whole 24 hours, including breastfeeds and night feeds that this calculation excludes.
4. Let hunger and fullness cues lead the next feed.
5. Use wet nappies, wellbeing and professionally measured growth—not one upward line—to judge whether feeding is going well.

The [NHS recommends responsive bottle feeding](https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/bottle-feeding/bottle-feeding-your-baby/feeding-on-demand/): offer milk when the baby shows hunger cues, pace the feed, watch for pauses and never force the bottle to be finished. It also says a big feed does not mean a baby will go longer between feeds.

| The card establishes | The card cannot establish |
|---|---|
| Logged daytime milk volume rose across two weekly groups | Total milk intake rose by the same amount |
| Both the percentage and millilitre thresholds passed | A growth spurt caused the change |
| At least four measured days exist in each week | Every included day was completely logged |
| Pump output and night milk did not inflate the result | More daytime milk will improve tonight’s sleep |

![The exact gates behind OBubba’s “Daytime milk is up this week” insight.](/obubba-daytime-milk-up-this-week-logic.svg "The app compares fourteen completed day slots, keeps amount-bearing daytime milk feeds, requires at least four measured days in both weeks, and speaks only when the average rises by at least 20% and 60ml per measured day.")

## The exact Flutter calculation

The brain sends `daytimeMilkVolumeTrend` **14 completed calendar days**, most recent first. It starts with yesterday rather than today.

Excluding today matters. At 10am, the current day might contain only one bottle. Comparing that partial total with last Tuesday’s finished day could create a false fall. Yesterday plus the 13 days before it gives the detector two closed seven-day slots.

For each date, the function adds positive amounts from entries that are:

- type **Feed**;
- daytime rather than marked **night**;
- milk rather than **Solids**;
- not **Pump** output; and
- not marked as a **Dream feed**.

The stored amount is canonical millilitres. The body then formats the averages in the family’s chosen ml or oz setting.

If a day contains no qualifying amount, it becomes unknown—not zero—and drops out of the average.

## Why pump output does not count

A 180ml pumping session records milk expressed **out**. It does not prove that the baby drank 180ml that day. Adding pump output to bottle intake could turn a steady 600ml drinking pattern into a false 780ml rise.

The current code explicitly excludes both a native Pump record and an older imported Feed entry whose subtype is pump. A regression test recreates the exact risk: seven recent days each contain 600ml of bottles plus a 150ml pump, while the earlier week contains the same 600ml bottles without pumps. The trend correctly stays silent.

When the recent week genuinely contains about 800ml of bottles against 600ml before, the same test confirms that the card can still appear.

This distinction is especially important for exclusive-pumping families. **Production and intake are related records, not interchangeable numbers.** OBubba can keep both without pretending one is the other.

## A measured day is not necessarily a complete day

The app needs at least **four amount-bearing days in each weekly slot**. That prevents one or two bottles from defining a whole week.

But one positive amount is enough for a date to become a measured day. If a baby had three bottles and only one was logged, the included total is partial. If nursery started sending amounts this week but did not last week, the apparent rise may be better information rather than more milk.

The comparison can also be uneven: four recent days versus seven earlier days, for example. Each side is averaged over its own qualifying days. The sample label reports the combined number of measured days, usually between eight and fourteen.

This is why the most accurate plain-English translation is:

> “The daytime milk amounts recorded on measured days are higher this week.”

It should not be silently expanded to “my baby’s full intake is definitely up”.

## The two change gates

Once both weekly groups have enough data, OBubba calculates their average daytime volumes.

Imagine the earlier week averaged **700ml** per measured day and the recent week averaged **960ml**.

- Absolute change: **+260ml per measured day**
- Relative change: **about +37%**

The upward card requires both:

- at least **20% higher**; and
- at least **60ml more per measured day**.

That dual gate stops a tiny-volume change from looking dramatic just because its percentage is large. A rise from 200ml to 245ml is 22.5%, but only 45ml; the app stays quiet. A rise from 800ml to 900ml is 100ml, but only 12.5%; it also stays quiet.

These are product noise filters, not nutritional targets.

## Why breast-only feeding stays invisible here

The app does not estimate milk transfer from breastfeeding duration. A 12-minute breastfeed may transfer more or less milk than a longer feed, and a timer cannot observe latch, swallowing or supply.

So a breast-only day with no amount-bearing feed is removed rather than assigned 0ml. That is the safe choice.

Mixed feeding needs more care. Suppose last week contained four breastfeeds plus one 90ml bottle each day. This week contains two breastfeeds plus three 150ml bottles. The measured line rises from 90ml to 450ml, but the app does not know how much milk transferred at the breast in either week.

The increase may reflect:

- a genuine rise in overall intake;
- more milk being delivered by bottle instead of breast;
- nursery or another carer taking over daytime feeds;
- more expressed-milk top-ups;
- more complete amount logging; or
- several changes at once.

That is why OBubba’s wider Feeding check-in is valuable beside the trend. It can name breast, bottle, wet-nappy, night-feed and growth context separately instead of letting one measured number dominate.

![A genuine current OBubba Flutter Feeding check-in explaining that bottle millilitres are only the measured part of a mixed-feeding day.](/obubba-feeding-growth-spurt-check-in-app.jpg "The app’s fuller feeding surface keeps breastfeeds and bottle amounts distinct, then brings nappies, night feeds and growth into the review before suggesting changes.")

## Is it a growth spurt?

Possibly—but the volume card cannot confirm that.

The Flutter app has a separate current-day detector for **“Feeding is up, likely a growth spurt.”** That route compares feed frequency with the baby’s prior daily count. A strong one-day jump or two elevated days can trigger it. A separate cluster-feeding route looks for at least three daytime milk feeds inside roughly 90 minutes.

If either of those cards already owns the “feeding is up” story in the current brain run, the two-week volume card is suppressed. Parents should not receive three overlapping explanations for the same busy feeding day.

The surviving **“Daytime milk is up this week”** card therefore tells a different story: measured volume has stayed meaningfully higher across weekly groups, without a current cluster-feed or frequency-spurt card taking priority.

It still does not inspect weight velocity, length, head growth, illness or a clinician’s feeding assessment. “Growth phase or bigger appetite” is a reasonable possibility, not the detected cause.

Read the dedicated explanation in [Why Does OBubba Say “Feeding Is Up, Likely a Growth Spurt”?](/blog/why-obubba-says-feeding-up-likely-growth-spurt.html) if the frequency card is the one you saw.

## Does more daytime milk buy a better night?

The card’s current `why` copy says that more by day often “buys a better-fed night”. That sounds intuitive, but **this detector never compares sleep**.

Night feeds are deliberately excluded from its volume total. It does not read wake count, first sleep stretch, bedtime or resettling. A baby may take more in daylight and still wake because of hunger, development, discomfort, normal sleep cycling or many other reasons.

The NHS explicitly cautions that a big feed does not mean a baby will go longer between feeds. Do not encourage an oversized final bottle, pressure the baby to finish or remove a wanted night feed because this card appeared.

If you want to test a genuine milk-and-sleep relationship, the app needs a cross-domain comparison—like its separate evening-cluster and night-wake detectors—not an assumption attached to a daytime total. [A bigger bedtime bottle is not a guaranteed sleep intervention](/blog/will-bigger-bedtime-bottle-help-baby-sleep-longer.html).

## A practical five-minute review

### 1. Check what changed in the record

Open the recent week and the week before. Look for missing days, nursery handovers, a new partner logging habit, imported data or bottles that replaced breastfeeds.

Do not “correct” an honest record to flatten the graph. Add genuinely missing feeds when you know the amount; otherwise keep the uncertainty visible.

### 2. Review the full 24 hours

The card excludes night milk. A daytime rise might sit beside fewer night feeds, unchanged night feeds or more milk everywhere.

Also review breastfeeds. The measured bottle line is only one part of a mixed-fed day.

### 3. Look for responsive hunger cues

Early cues can include stirring, rooting, hand-to-mouth movements, wriggling and opening the mouth. Offer a feed when the baby asks rather than waiting for a schedule to permit the new average.

During a bottle feed, keep the baby close and semi-upright, invite the teat, hold the bottle close to horizontal and allow pauses. Stop when the baby turns away, stops sucking, pushes the teat out, relaxes or otherwise signals they are done.

The average describes the past. It is not an instruction for the next feed.

### 4. Check the wider wellbeing picture

For formula-fed babies, the NHS says weight gain and wet and dirty nappies help show whether intake is adequate. For breastfeeding, effective feeding signs, nappies and growth matter more than attempting to infer millilitres.

A content, alert baby with usual wet nappies and a reassuring growth path provides a different context from a baby who is persistently distressed, vomiting forcefully, struggling to feed or unusually sleepy.

### 5. Let the pattern settle

If the baby is comfortable and feeding responsively, an upward week does not require a correction. Appetite and bottle distribution can vary.

Continue logging consistently and see whether the average plateaus. The card itself is low urgency and its action is **“Lovely”**, not “increase every bottle”.

## When not to celebrate the number blindly

An upward volume is not automatically good or bad. Ask for feeding support when:

- the baby repeatedly coughs, chokes or struggles to coordinate breathing during feeds;
- feeds are consistently painful, highly distressed or followed by forceful vomiting;
- the baby seems unusually sleepy or difficult to wake for feeds;
- wet nappies change noticeably;
- weight gain is a concern;
- formula is being prepared more concentrated than instructed; or
- a clinician has supplied an individual fluid or feeding plan.

Follow the formula manufacturer’s preparation instructions exactly. Never add extra powder to make a feed “more filling”, and never use the card’s percentage as a recipe change.

If you are simply unsure whether the new pattern fits your baby, take the measured-day averages, actual feed log, nappy pattern and recent growth information to a midwife, health visitor, GP or feeding specialist.

## Why the card may stay hidden

You will not see this insight when:

- fewer than 14 completed day slots were supplied;
- either weekly slot contains fewer than four days with measured daytime milk;
- the rise is under 20%;
- the rise is under 60ml per measured day;
- the measured average is flat or falling;
- feeds are breast-only with no amounts;
- pump output is the only extra volume;
- extra milk was logged only at night or as a dream feed; or
- a current cluster-feeding or likely-growth-spurt card already owns the feeding-up message.

Silence does not mean intake is wrong. It means this particular amount-based comparison lacks enough data or a large enough change.

## Where the insight lives—and why it can refresh

The Flutter UI classifies `daytimeMilkTrend` as a longer-term pattern insight, so it belongs in the **What OBubba noticed** analysis feed rather than only in today’s guidance.

Its dismissal key includes the current day. The two weekly averages roll forward daily, so a new snapshot can be considered new the following day. That is different from slow-changing insight types whose dismissal persists until the direction changes.

The benefit is freshness. The trade-off is potential repetition if the elevated pattern continues. A parent who has understood the change should be able to snooze or dismiss it without the app turning a reassuring trend into another task.

## A useful product limitation

The upward card is willing to infer “growth phase or bigger appetite” from volume alone, while the wider Feeding check-in correctly warns that bottle millilitres can be only the measured part of mixed feeding.

Those messages should remain aligned. A stronger future version could:

- label the metric **measured daytime bottle milk** in the title or body;
- compare the proportion of breast versus bottle entries between weeks;
- require more than one amount-bearing feed before calling a date complete;
- show each week’s measured-day count beside its average;
- cross-check night milk before implying a better-fed night; and
- link directly to the underlying seven-day groups.

Trust does not come from making every pattern sound more intelligent. It comes from making the boundary between measurement and interpretation obvious.

## Frequently asked questions

### Does this mean my baby drank too much?

No. The detector only says logged daytime volume rose enough to clear its thresholds. Follow the baby’s hunger and fullness cues rather than judging one average in isolation.

### Should I make every bottle match the new daily average?

No. A daily average is not a bottle prescription. Babies vary between feeds and days; offer responsively and never force a finish.

### Does OBubba include expressed breast milk?

Yes, when expressed milk is logged as an amount-bearing bottle the baby drank. A pumping session is excluded because it records production, not intake.

### Why are my breastfeeds missing from the millilitre number?

The app cannot measure transfer at the breast and correctly refuses to convert time into volume. Breastfeeds still belong in the wider feeding record.

### Are night bottles included?

No. Night feeds and dream feeds are excluded. This is a daytime-volume comparison, not a 24-hour intake total.

### How much data does the card need?

Four measured days in each of two seven-day calendar slots, with a rise of at least 20% and at least 60ml per measured day.

### Will more daytime milk reduce night waking?

Not necessarily. This detector never compares sleep, and NHS guidance says a big feed does not mean a baby will go longer between feeds.

### What if the card later says milk is easing off?

That is the falling branch of the same detector, with extra age-based wording. Read [the exact explanation of “Daytime milk is easing off”](/blog/why-obubba-says-daytime-milk-easing-off.html), especially if solids or mixed feeding changed.

## The takeaway

“Daytime milk is up this week” means:

> Across the completed days with measured daytime milk, the recent weekly average is at least 20% and 60ml higher than the previous one.

It does not mean “push bigger bottles”, “a growth spurt is proven” or “tonight will be better”. The helpful next move is to keep feeding responsively, review what became measurable and let nappies, wellbeing, growth and the baby’s cues provide the context.

**[Try OBubba’s baby feed tracker free →](/baby-feed-tracker.html)** — keep bottles, breastfeeds, pumping, night feeds, nappies, growth and first foods connected without pretending every part can be reduced to millilitres.

## Sources

- [NHS Best Start in Life: Feeding on demand](https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/bottle-feeding/bottle-feeding-your-baby/feeding-on-demand/)
- [NHS: Bottle-feeding advice](https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/bottle-feeding/advice/)
- [NHS: Formula milk—common questions](https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/bottle-feeding/formula-milk-questions/)
- [NHS Best Start in Life: Milk supply](https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/breastfeeding/breastfeeding-challenges/milk-supply/)
- [UNICEF UK Baby Friendly Initiative: Infant formula and responsive bottle feeding](https://www.unicef.org.uk/babyfriendly/baby-friendly-resources/bottle-feeding-resources/infant-formula-responsive-bottle-feeding-guide-for-parents/)
- OBubba Flutter source reviewed: `feed_insights.dart`, `brain.dart`, `brain_insight.dart`, `track_home.dart`, `baby_entry.dart`, `prefs.dart`, `log_sheet.dart`, `daytime_milk_trend_test.dart`, `feed_insights_test.dart` and `engine_integration_test.dart`.

*OBubba is a record, pattern and education tool. It cannot measure breast-milk transfer, diagnose a growth spurt, establish nutritional adequacy or predict sleep from daytime milk. It does not replace individual advice from a midwife, health visitor, GP, paediatrician, dietitian, neonatal team or feeding specialist.*
