---
title: "Why Does OBubba Say ‘Night Feeds Are Dropping’?"
slug: why-obubba-says-night-feeds-are-dropping
description: "How OBubba compares two weeks of night-feed frequency, which feeds and nights count, and why ‘one feed from done’ is not permission to stop responding to hunger."
date: 2027-01-26
updated: 2027-01-26
author: OBubba
tags: night feeds are dropping, baby night feeds reducing, OBubba night feed trend, night weaning baby, baby feeding less at night, stop night feeds baby, baby sleeping longer without feed, responsive night feeding, night feed tracker, breastfeeding at night, bottle feeds at night, baby night weaning app
heroImage: /obubba-night-feeds-dropping.jpg
---

For months, the night had three feeding landmarks: midnight, 3am and 5am. Lately one has disappeared. Some nights there is only one feed. Then OBubba shows a card:

**“Night feeds are dropping.”**

It feels like progress. But has the app decided the baby is ready to night-wean? Does “one feed from done” mean you should resettle instead of feeding? Did starting solids cause the change?

No. We traced the current Flutter trend detector, its caller, night resolver and tests for this guide. The card makes a narrower comparison: **among sufficiently logged nights, the average number of qualifying night-feed entries in the latest seven night slots differs from the previous seven by at least 0.4 feeds per night.** When the newer average is lower, the positive card appears.

That can reveal a change an exhausted parent has not noticed. It does not establish that zero feeds is the right target.

![An awake caregiver holds a calm, alert baby upright after a night feed beside a clear cot.](/obubba-night-feeds-dropping.jpg "A falling night-feed count can happen naturally; responsive care and hunger cues still come before an app trend.")

## The short answer

The current detector needs all of these:

| Gate | Flutter rule | Why it matters |
|---|---:|---|
| Window | Exactly **14 night slots** | Two seven-night periods must exist |
| Logging coverage | At least **4 non-empty nights in each week** | Sparse logging is not treated as fewer feeds |
| Qualifying event | Feed entry marked as **night**, excluding dream feeds and solids | Day feeds and planned dream feeds stay out |
| Change | Absolute average difference of at least **0.4 feeds per logged night** | A flat or tiny shift stays quiet |
| Direction | Newer average is lower | Produces “Night feeds are dropping” |

If the newer average rises by at least 0.4 instead, the same detector can show **“Night feeds have crept up.”**

![The exact two-week comparison, missing-night guard and 0.4-feed threshold behind OBubba’s night-feed trend.](/obubba-night-feed-trend-logic.svg "The current Flutter detector averages qualifying feed entries over logged nights in each seven-slot period; an unlogged night is excluded rather than counted as zero.")

These are product rules, not a clinical night-weaning assessment.

## What counts as a night feed

The trend counts a saved entry when:

- its type is Feed
- it is marked as a night event
- it is not marked as a Dream feed
- its feed type is not Solids

Breast and bottle feeds both contribute one count. A feed saved as part of resettling a logged night wake is still a real milk feed, so it contributes to this frequency trend. Pumping records are normalised to a separate Pump event in the current Flutter model and do not count as baby intake.

A dream feed is excluded because it is intentionally offered while the baby is asleep or not fully awake. Solids are excluded because grams of food are not a milk feed and should never inflate a night-milk measure.

The app is counting **events**, not nutrition. It does not inspect bottle millilitres, minutes at the breast, swallowing, milk transfer or whether the feed was a snack or a full feed.

## Two weeks means two sets of night slots

The caller asks the child record for the 14 most recent resolved nights, newest first. Each night is anchored to the morning on which it ends, so entries from the bedtime day and early-hours day can be brought into the same night record.

The detector splits them into:

- slots 0–6: this week
- slots 7–13: the week before

It then removes completely empty night records before averaging. At least four logged nights must remain on each side.

That distinction prevents a serious false result. If a parent logs two nights with three feeds and ignores the other five, dividing by all seven slots would produce 0.9 feeds per night and falsely suggest a dramatic reduction. The current guard refuses to judge that week because only two nights contain any night record.

## An unlogged night is not a zero-feed night

A genuinely logged zero-feed night can still count. It might contain a bedtime-to-morning sleep arc or other resolved-night entries while containing no qualifying feed. Its feed count is zero and it remains in the denominator.

A completely empty night is treated as unknown and excluded.

This means the result depends on more than feeding consistency; it also depends on how completely the night itself is recorded. A feed-only logger can make a quiet night look empty, while a sleep-and-feed logger preserves it as a real zero.

For the cleanest comparison, keep recording bedtime and morning wake even on nights without a feed.

## A worked example

Suppose this week has six logged nights with one qualifying feed each and one completely unlogged night:

**6 feeds ÷ 6 logged nights = 1.0 feed per night**

The previous week has seven logged nights with three feeds each:

**21 feeds ÷ 7 logged nights = 3.0 feeds per night**

The difference is **−2.0**, comfortably beyond the 0.4 threshold, so the positive card appears. The sample label reports 13 nights because the empty slot was not evidence.

The Flutter test’s simplest positive example uses all 14 logged nights: seven recent nights at one feed and seven older nights at three. The body then displays **1.0** versus **3.0**, and the copy switches to its “nearly done” version because the recent average is no more than one.

## Frequency can fall while milk intake does not

Three short comfort feeds becoming one substantial feed produces a falling count. So does three full feeds becoming one small snack. The detector treats both changes identically.

It cannot tell whether:

- total night milk rose, fell or stayed stable
- breastfeeding became more efficient
- the baby transferred milk well
- daytime intake changed
- one feed simply moved across the day/night boundary
- a caregiver forgot an entry
- solids replaced milk

That is why the card must not be translated as “your baby needs less milk now”. It reports fewer logged night-feed events.

## The card has no age or readiness gate

The current trend function does not receive the baby’s age. It also does not check daytime feeds, weight trajectory, wet nappies, prematurity, illness or an individual feeding plan.

It can therefore show **“you’re about one feed from done”** for a young baby whose feeds have dropped unexpectedly. That wording is too confident without context.

Young babies normally wake and feed frequently. NHS guidance says babies are likely to need night feeds for at least the first few months. Between 6 and 12 months, some babies may no longer need night feeds, but not all. Feeding should remain responsive to the baby’s cues rather than being stopped because an average crossed 1.0.

A safer translation is:

> “The nights you logged contain fewer feed events than the previous week. Check that the baby is well and feeding effectively across 24 hours, then notice whether the pattern continues.”

## “One feed from done” is not a universal milestone

Zero night feeds is not the only successful outcome. A family may choose to continue a night breastfeed for nutrition, comfort, milk supply, connection or convenience. A baby may naturally retain one feed for months while sleep improves around it.

The NHS advises that if a breastfeed is deliberately dropped before 12 months as part of stopping breastfeeding, it needs appropriate replacement with infant formula; individual circumstances matter. UNICEF UK’s responsive-feeding guidance also treats feeding as nutrition, comfort and reassurance—not merely a habit to extinguish.

The useful milestone may be:

- fewer wakes overall
- a longer first sleep stretch
- one calm, effective feed instead of repeated snacks
- easier resettling after feeding
- a night pattern the family can sustain

The app should celebrate the family’s change without declaring the remaining feed unfinished business.

## Starting solids did not necessarily cause it

The timing often overlaps: night feeds may change during the same months that solids begin. That does not mean dinner made the baby sleep through.

NHS guidance is explicit that starting solids does not make a baby more likely to sleep through the night. At the beginning of weaning, breast milk or first infant formula still provides most energy and nutrients, and milk remains the main drink throughout the first year.

Do not add cereal to a bedtime bottle, force a larger feed or stretch a hungry baby in the hope of preserving the downward trend. A large bottle does not guarantee a longer interval, and responsive bottle feeding means allowing the baby to decide how much to take.

## Trend card versus night-weaning plan

OBubba has a separate night-weaning readiness surface. The current plan logic checks three green lights before it builds a taper:

- age of roughly 6 months or more
- at least three daytime feeds in the supplied record
- night-feed data on at least two nights

Under one year, its volume-based plan retains a small-feed floor rather than automatically tapering to zero. That is more conservative than the trend card.

But those green lights are still app signals, not medical clearance. Counting three daytime feed entries cannot verify intake, growth or hydration. Families with prematurity, faltering growth, feeding difficulties, medical conditions or a clinical feeding plan should use individual advice.

![OBubba’s genuine Flutter night-weaning screen separates age, daytime feeding and baseline-night checks from the simpler week-over-week trend.](/obubba-night-weaning-readiness-app.jpg "The real app’s plan has separate readiness lights; the ‘Night feeds are dropping’ card itself does not apply those gates.")

## How to use the card safely

### If the reduction happened naturally

Keep following cues. Notice daytime milk feeds, wet nappies, alertness, growth and how the baby behaves at the remaining night feed. There is no need to push from one feed to zero simply to maintain the graph.

### If you are actively reducing feeds

Check age, growth, daytime intake and any clinical plan first. Make changes gradually, keep milk responsive and pause if hunger, comfort, wet nappies, intake or wellbeing become less reassuring. Ask a health visitor, GP or feeding professional when unsure.

### If feeds dropped unexpectedly

Do not celebrate the card in isolation. A baby who is unusually sleepy, feeding less across the whole day, producing fewer wet nappies, difficult to wake or otherwise unwell needs assessment rather than a sleep strategy.

### If feeds rise again

A new week can reflect hunger, illness, development, teething, travel or logging differences. The “crept up” card names common possibilities, but the detector does not diagnose them. Respond to the baby, then review the pattern when the week is ordinary.

## Why this feature is still valuable

Night-weaning progress is hard to perceive at 3am. A parent remembers every wake; the app can show that feeds have moved from three a night to one even if sleep still feels fragmented.

The comparison also protects against one unusually good night by requiring two week-sized windows and at least four logged nights on both sides. Dream feeds remain separate, and completely unlogged nights do not masquerade as zeros.

Its best role is to say:

> “Something has changed across your real nights. Here are the averages and the evidence—now interpret them with age, intake, cues and family goals.”

That is more useful than a generic “drop all feeds” schedule and more trustworthy than treating every night feed as a bad habit.

**[Explore OBubba’s sleep and feeding tracker →](/app.html)** — keep night sleep, wakes, breastfeeds, bottles, dream feeds, nappies and weaning in one timeline so progress is visible without turning zero feeds into a score.

## Frequently asked questions

### Does the card mean my baby is ready to night-wean?

No. The trend card has no age, growth, daytime-intake or wet-nappy gate. It only compares logged night-feed frequency across two weeks.

### Do dream feeds count?

No. Entries explicitly marked as dream feeds are excluded from this trend, even if they are milk feeds at night.

### Does a night without a feed count as zero?

Only if the night record is non-empty—for example, it contains the sleep arc or another resolved-night entry. A completely empty night is unknown and excluded.

### Does OBubba compare milk volume?

No. One breastfeed or bottle feed contributes one event regardless of duration or amount. The card cannot show whether total milk intake changed.

### Why did the card not appear after one good week?

It needs 14 night slots, at least four logged nights in each seven-slot group and a difference of at least 0.4 feeds per logged night.

### Can it appear for a newborn?

Yes, in the current implementation. That is a limitation. Young babies commonly need frequent night feeding, so respond to cues and seek advice if feeding drops unexpectedly.

## Reliable UK sources

- [NHS Best Start in Life: Feeding on demand](https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/bottle-feeding/bottle-feeding-your-baby/feeding-on-demand/)
- [NHS: Helping your baby to sleep](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/)
- [NHS: Your baby’s first solid foods](https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/)
- [NHS: How to stop breastfeeding](https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding/how-to-stop/)
- [UNICEF UK Baby Friendly Initiative: Caring for your baby at night](https://www.unicef.org.uk/babyfriendly/baby-friendly-resources/sleep-and-night-time-resources/caring-for-your-baby-at-night/)
- [UNICEF UK Baby Friendly Initiative: Responsive feeding](https://www.unicef.org.uk/babyfriendly/baby-friendly-resources/%20relationship-building-resources/responsive-feeding-infosheet/)

*This article provides general information for UK families. OBubba cannot determine night-weaning readiness, milk transfer, hydration, growth or illness from feed counts. Follow your baby’s cues and advice from your own health visitor, GP, midwife or feeding team.*
