---
title: "Why Does OBubba Say ‘Daytime Milk Is Easing Off’?"
slug: why-obubba-says-daytime-milk-easing-off
description: "How OBubba compares two weeks of measured daytime milk, why 22 weeks changes the card’s wording, and when a falling bottle total needs a wider feeding check."
date: 2027-01-27
updated: 2027-01-27
author: OBubba
tags: daytime milk is easing off, baby drinking less milk, OBubba daytime milk trend, baby milk intake dropping, baby drinking less after starting solids, bottle volume tracker, milk feeds and weaning, 22 week baby solids, responsive bottle feeding, baby feeding tracker, milk main drink first year, baby bottle amounts falling
heroImage: /obubba-daytime-milk-easing.jpg
---

Last week the bottles added up to roughly 900ml during the day. This week they average closer to 620ml. Your baby seems interested in food, but the change still feels large. Then OBubba says:

**“Daytime milk is easing off.”**

Has the app confirmed that solids are replacing milk? Is 620ml enough? Should you make the next bottle bigger—or stop worrying because the graph calls it normal?

Not from this card alone. We traced the current Flutter detector, its caller, entry normalisation and golden tests. It makes a useful but narrow observation: **the average amount recorded in qualifying daytime milk feeds has moved by at least 20% and at least 60ml per logged day between two seven-day periods.**

For a fall, the wording changes at **22 weeks**. Below that age it says daytime milk is “down”; from 22 weeks it says milk is “easing off” and explains the change as a normal solids hand-over. The detector does **not** check that a single solid meal was logged.

That boundary deserves context. A measured-volume trend can start a helpful review. It cannot decide that less milk is appropriate.

![An attentive caregiver responsively bottle-feeds an alert baby in daylight, with a small first-foods bowl kept in the background.](/obubba-daytime-milk-easing.jpg "Measured milk and first foods can sit in the same day, but the baby’s feeding cues and whole feeding picture still lead.")

## The short answer

The current card needs all of these:

| Gate | Flutter rule | What it prevents |
|---|---:|---|
| Comparison window | **14 previous calendar-day slots** | Today’s unfinished total cannot drag the new week down |
| Coverage | At least **4 amount-bearing days in each seven-day group** | A mostly unlogged week stays quiet |
| Qualifying amount | Positive amount on a daytime milk-feed entry | Feed counts are not converted into imaginary millilitres |
| Relative shift | At least **20%** | Ordinary small variation stays quiet |
| Absolute shift | At least **60ml per logged day** | A large percentage on tiny totals stays quiet |

The visual below uses five measured days in the recent week averaging 620ml and six in the earlier week averaging 900ml. The fall is about 31% and 280ml per measured day, so both change gates pass.

![The exact measured-day comparison, dual change threshold and 22-week wording switch behind OBubba’s daytime milk trend.](/obubba-daytime-milk-trend-logic.svg "The current Flutter detector compares amount-bearing daytime milk logs and changes its interpretation at 22 weeks without checking whether solids were actually introduced.")

These are product thresholds. They are not daily milk requirements.

## What the app actually adds up

For each of the 14 previous day slots, the detector totals positive amounts from entries that are:

- type Feed
- daytime rather than night
- milk rather than Solids
- not a Pump record
- not marked as a Dream feed

This separation is thoughtful. Pump output is milk expressed **out**, not proof that the baby drank it. Solids are not milk. A scheduled dream feed belongs to a different night-feeding question. None should inflate the daytime-intake line.

The detector also refuses to invent a volume for a breastfeed. A breast-only day with no measured amount is unknown and does not enter the average.

But “measured” is not the same as “complete”. If a mixed-fed baby breastfeeds three times and takes one 90ml bottle, that day contributes **90ml** to this calculation. The breast milk transferred is invisible. A combi entry can likewise include a measured top-up while the breast portion remains unmeasured.

The card is therefore best read as:

> “The daytime milk amounts that reached the log are lower than they were.”

It is not necessarily saying:

> “Your baby consumed less milk across the whole day.”

## Today is deliberately excluded

The caller supplies yesterday plus the 13 days before it, most recent first. Today stays out because a partial day would almost always look lower than a completed one at breakfast or lunchtime.

That is a good guard. At 11am, two feeds cannot fairly be compared with all of last Tuesday.

However, a past date is only *calendar-complete*. Its log can still be partial. One recorded bottle is enough to make the day amount-bearing, even if a grandparent gave another bottle that was never entered. At least four such days are needed in each week, but the detector does not require a minimum number of feeds per day.

Consistent shared logging matters more here than perfect precision. If nursery, a partner or a grandparent provides milk, include those amounts when practical. Otherwise a change in who logged can look like a change in what the baby drank.

## Missing and breast-only days are not zero

A day with no qualifying amount is removed before the weekly average is calculated. It is not assigned 0ml.

That prevents seven breast-only or unlogged days from fabricating a collapse in intake. It also means the card’s sample can be uneven: perhaps five measured recent days versus seven earlier days.

The sample label reports the number of amount-bearing days actually compared, not automatically 14.

This treatment is sensible, but it cannot solve partial measurement. A day containing one small bottle is included; a day containing only unmeasured breastfeeds is excluded. For a family moving between breast, expressed milk and formula, the set of days entering the average may change with feeding method.

## A worked example

Imagine the previous seven slots contain six measured days:

**5,400ml ÷ 6 days = 900ml per measured day**

The recent seven slots contain five:

**3,100ml ÷ 5 days = 620ml per measured day**

The change is:

- **−280ml per measured day**
- about **−31%**

Both are beyond the detector’s gates, so a card appears.

If the baby is 21 weeks old, its title is **“Daytime milk is down this week.”** At 22 weeks, the same entries produce **“Daytime milk is easing off.”** The body still reports the two averages. Only the interpretation changes.

If the fall were from 250ml to 195ml, the percentage would exceed 20%, but the absolute difference would be only 55ml. The app would stay quiet. Both thresholds must pass.

## Why the 22-week switch is too early and too certain

Twenty-two weeks is just over five months. Current NHS guidance says introducing solids should begin **around 6 months**, when the three readiness signs appear together. A premature baby may need individual advice about timing.

More importantly, age does not prove that solids have started. The detector receives the baby’s age and amount-bearing milk entries. It does not inspect solid-meal entries, readiness signs, textures, meal frequency or how much food was eaten.

So the current wording can say “as solids ramp up” when:

- no food has been offered
- tastes have begun but provide very little energy
- milk fell during illness or teething
- daytime milk moved into the night
- breastfeeding replaced some bottles
- several feeds were simply not logged

The NHS says that at the beginning of weaning, babies still get most of their energy and nutrients from breast milk or first infant formula. Breast milk or first infant formula remains the main drink during the first year. Milk may gradually reduce as a baby eats plenty of solids several times a day—but age alone does not establish that hand-over.

A safer translation is:

> “Measured daytime milk is lower. If solids have genuinely increased and the wider feeding picture is reassuring, that may be part of a gradual transition. Check the alternatives before assuming it is.”

## Daytime volume is not 24-hour milk

Night feeds are excluded from this detector. That keeps the question clean, but it means daytime milk can fall while total milk stays similar.

For example:

| Daytime | Night | 24-hour total |
|---:|---:|---:|
| Earlier: 900ml | 0ml | 900ml |
| Recent: 620ml | 280ml | 900ml |

The daytime card still fires. It does not cross-check yesterday’s separate **“Night feeds are dropping”** detector or diagnose reverse cycling from this result.

That is why one app is useful when it keeps the domains together: the parent can review daytime bottles, breastfeeds, night feeds, solids, wet nappies and growth instead of asking one number to carry the whole story.

## Why the card stays silent for breast-only feeding

Milk transfer at the breast cannot be inferred from minutes. A ten-minute feed may transfer more or less milk than a longer one, and the app cannot observe swallowing or attachment.

The Flutter detector correctly stays silent when all recent days contain breastfeeds without amounts. It does not turn duration into millilitres.

For mixed feeding, though, the visible bottle amount is only the measured portion. A falling bottle line may mean breastfeeding increased—not that overall intake fell. OBubba’s real feeding check-in makes this distinction explicitly.

![OBubba’s genuine feeding check-in explains that bottle millilitres are only the measured part of a combi-fed day.](/obubba-screen-feeding.jpg "The current feeding surface keeps breastfeeds, bottle amounts, nappies, night feeds and growth separate before suggesting a feeding change.")

That whole-picture language is the right way to interpret the trend card too.

## What to review when the card appears

### 1. Check the record before the baby

Were all carers logging? Did feeds move to nursery? Were breastfeeds added while bottles fell? Is the app comparing five measured days with seven? A logging explanation is common and harmless.

### 2. Look across 24 hours

Review daytime and night milk together. Notice whether feeds moved rather than disappeared. Do not use a daytime fall as a reason to cut a wanted night feed.

### 3. Confirm what solids are really doing

One spoonful is practice, not a replacement milk feed. If the baby is around 6 months and readiness signs are present, continue offering varied food alongside milk. Do not rush portions to make the chart’s interpretation come true.

### 4. Follow hunger and fullness cues

Offer bottle feeds responsively, keep the bottle paced and let the baby decide when they have had enough. Do not pressure a larger bottle to restore an average, and do not delay a hungry baby to preserve a downward trend.

### 5. Use wellbeing and growth context

Wet nappies, alertness, comfortable feeding and the longer-term growth picture add information a volume card lacks. Individual advice matters for prematurity, faltering growth, feeding difficulty, illness or an existing clinical plan.

## When a falling amount needs help rather than analysis

Do not wait for a second week of data if your baby is not feeding normally and you are worried, nappies are drier than usual, the baby is unusually drowsy or difficult to wake, breathing is different, vomiting is persistent or they otherwise seem unwell.

Current NHS guidance advises parents to trust their instincts and seek medical help for concerning feeding changes or drier nappies. Call 999 for an emergency, including a baby who will not wake or has severe breathing difficulty. Use your local urgent route—such as NHS 111 in England—when prompt advice is needed.

For a slower concern, bring the useful evidence to a health visitor, GP or feeding professional:

- the two weekly measured averages
- which days were fully logged
- breast, bottle and night-feed changes
- wet-nappy pattern
- solids actually offered and eaten
- illness, teething, vomiting or discomfort
- professionally measured growth where relevant

That is far more informative than saying only “the app says milk is easing”.

## How this feature should earn trust

The detector already does several things well: it excludes today, pump output, solids, dream feeds and empty days; needs four measured days on each side; and requires both a relative and an absolute change.

Its next improvement should be equally concrete. The “normal solids hand-over” wording should require evidence that solids are genuinely underway, use an age aligned with around six months rather than 22 weeks alone, and soften when daytime volume is only a partial measure in a mixed-fed record. A cross-check against wet nappies, illness context and night milk could prevent a reassuring story from outrunning the evidence.

Parents do not need an app that always sounds certain. They need one that shows its working, names what it cannot see and helps them decide what to review next.

**[Explore OBubba’s feeding and weaning tracker →](/app.html)** — keep breastfeeds, measured bottles, pumping, night feeds, nappies, first foods and growth in one record, so a change in one line can be understood in context.

## Frequently asked questions

### Does “daytime milk is easing off” mean my baby is eating enough solids?

No. The current detector does not inspect solid meals or readiness. At 22 weeks or older, it changes the wording based on age alone.

### Is the number my baby’s total daily milk intake?

No. It is the average of logged positive amounts from qualifying daytime milk entries. Night milk and unmeasured breastfeeding are excluded.

### Why did a breast-only day not count as zero?

Because the app cannot measure milk transfer at the breast. Treating the day as zero would be false and could fabricate a dangerous trend.

### Why did the card not appear after a small fall?

It needs 14 prior day slots, at least four measured days in each week, a change of at least 20% **and** at least 60ml per measured day.

### Should I encourage my baby to finish more milk?

No. Responsive bottle feeding means following hunger and fullness cues and never forcing a baby to finish. Seek feeding advice when intake or growth concerns you rather than overriding the baby’s signals.

### Can solids replace milk before one year?

Milk may gradually reduce as food intake becomes established, but breast milk or first infant formula should remain the main drink throughout the first year. First tastes around 6 months begin alongside milk.

## Reliable UK sources

- [NHS: Your baby’s first solid foods](https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/)
- [NHS: Drinks and cups for babies and young children](https://www.nhs.uk/baby/weaning-and-feeding/drinks-and-cups-for-babies-and-young-children/)
- [NHS Best Start in Life: Feeding on demand](https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/bottle-feeding/bottle-feeding-your-baby/feeding-on-demand/)
- [NHS: Is your baby or toddler seriously ill?](https://www.nhs.uk/baby/health/is-your-baby-or-toddler-seriously-ill/)
- [UNICEF UK Baby Friendly Initiative: Infant formula and responsive bottle feeding](https://www.unicef.org.uk/babyfriendly/baby-friendly-resources/bottle-feeding-resources/infant-formula-responsive-bottle-feeding-guide-for-parents/)

*This article provides general information for UK families. OBubba cannot measure breast-milk transfer, establish nutritional adequacy, diagnose dehydration or illness, or decide that solids should replace a milk feed. Follow your baby’s cues and any individual advice from your midwife, health visitor, GP, dietitian, feeding team or neonatal service.*
