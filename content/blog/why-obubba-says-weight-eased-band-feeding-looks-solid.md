---
title: "Why Does OBubba Say ‘Weight Eased a Band, but Feeding Looks Solid’?"
slug: why-obubba-says-weight-eased-band-feeding-looks-solid
description: "See how OBubba compares two weight centiles with recorded milk-feed frequency—and why this reassuring card is context, not a growth assessment."
date: 2027-04-03
updated: 2027-04-03
author: OBubba
tags: weight eased a band, baby crossed centile line, baby weight centile, feeding looks solid, OBubba growth insight, baby growth chart app, logged milk feeds, baby weight gain, WHO growth standards, health visitor baby weight
heroImage: /obubba-weight-eased-band-feeding-solid.jpg
---

A small bend on a growth chart can make a parent’s stomach drop. Then OBubba may show a surprisingly calm card:

> **Weight eased a band, but feeding looks solid.**  
> Weight moved from around the 50th to the 40th centile. Feeds averaged roughly 7/day — often just settling onto their own curve.

What does that actually mean?

The current Flutter app has joined two parts of your own record: **the latest two valid weights** and **the frequency of recorded milk-feed events between them**. It is not looking at a photo, listening to a feed or diagnosing growth faltering. “Looks solid” means the average on days with usable feed logs met an age-based product floor.

That distinction matters. The card can be a proportionate antidote to panic after one centile boundary is crossed. It must not become false reassurance when a baby seems unwell, feeding is painful, nappies change, or a parent or professional is concerned.

## The plain-English translation

When this exact low-urgency card appears, OBubba has found:

- two weight measurements that are recent enough and sensibly spaced;
- a fall of at least five centile points;
- exactly **one** crossed major centile boundary in its WHO weight-for-age calculation;
- at least three dates between those weights containing a milk-feed record; and
- an average recorded milk-feed count on those dates at or above the app’s floor for the baby’s current age.

So the most accurate translation is:

> **“Weight-for-age crossed one major app centile boundary, while recorded milk-feed events on the days you logged them met OBubba’s age-band frequency check.”**

That is useful context. It is not the same as “milk intake is definitely adequate” or “there is nothing to check.”

![The exact route from two weight entries and milk-feed records to OBubba’s growth-and-feeding wording.](/obubba-weight-eased-band-feeding-solid-logic.svg "OBubba validates two weight entries, calculates WHO weight-for-age centiles, counts crossed major lines and uses recorded milk-feed frequency only when exactly one line was crossed. Two or more lines route to a health-visitor message.")

## First, the app validates the two weights

The Growth × Feeding insight is intentionally quiet unless its inputs pass several gates.

OBubba needs a known sex setting for the growth standard and at least two weights recorded in kilograms. It uses the latest two entries in chronological order. Both dates must parse, and the newer measurement must come after the older one.

The measurements must be **5 to 90 calendar days apart**. A next-day difference is too noisy for this card; a gap longer than three months is too broad for its feed-window comparison. The newest weight must also be no more than **90 days old**.

The app compares calendar dates rather than raw elapsed hours. That small engineering detail prevents a daylight-saving clock change from turning a valid five-day interval into 4.96 days.

It then converts each measurement date into the baby’s age and calculates a WHO weight-for-age centile. For babies born at least three weeks early, it can use corrected age through 24 months. Before the due date, corrected age would be negative, so the centile insight stays silent. The current in-app weight reference also ends at 24 months; outside that range, this card does not guess.

These gates do not prove the measurements are accurate. A mistyped weight, clothes, a different scale or a date error can still change the curve. The [Royal College of Paediatrics and Child Health (RCPCH) advises health professionals to use suitable calibrated scales and careful technique](https://www.rcpch.ac.uk/resources/uk-who-growth-charts-guidance-health-professionals). If a point looks surprising, checking the source entry is a good first move.

## What “eased a band” means in code

OBubba calculates the centile at each weight and checks whether the trend moved downward by at least **five percentile points**. It then counts strict crossings of these major app lines:

**2, 9, 25, 50, 75, 91 and 98**

Imagine a move from the 54th centile to the 47th. The decrease is at least five points and crosses the 50 line, so the code counts one band. A move from 54 to 51 does neither. A value landing exactly on a boundary is not treated as crossing through it; the line must sit strictly between the two calculated centiles.

The language changes with the count:

| Calculated change | What OBubba does |
|---|---|
| Down at least 5 points, but no major line crossed | Keeps this insight quiet |
| Exactly 1 major line crossed | Looks at recorded feeding frequency for context |
| 2 or more major lines crossed | Shows a medium-urgency “Weight has eased a couple of centile lines” route to the health visitor |

The two-line route does **not** get softened by a high feed count. That is an important safety boundary.

This general shape aligns with UK growth-chart guidance, but the app’s exact algorithm is its own product logic. The [NHS notes that a baby’s weight may move up or down one centile line and that crossing two lines is less common](https://www.nhs.uk/baby/babys-development/height-weight-and-reviews/baby-height-and-weight/). The [RCPCH’s parent FAQ similarly explains that movement by up to one centile space can be normal, while two spaces is less common and may prompt assessment](https://growth.rcpch.ac.uk/parents/faqs-parents/). Neither source turns one line into an automatic all-clear; the whole child and the quality of the measurements still matter.

## Next, OBubba builds a fixed feeding window

Only the exactly-one-line path asks what feeding looked like between the two weigh-ins.

The engine receives up to 185 recent days of reconstructed history. That is enough to cover a permitted 90-day gap even when the latest weight is itself nearly 90 days old. It maps each history slot to a calendar date and includes dates from the earlier weight through the later weight, inclusive.

If any day in that window has already moved into cold archive and cannot be reconstructed, the insight stays silent. It does not compare a growth change with knowingly truncated history.

For each available day, the app counts records where:

- the event type is **Feed**; and
- the feed type is **not Solids**.

That means breast, bottle, mixed, night and dream-feed records can count. Solids do not. Pumping is stored as a different event type, so it does not count as a baby feed.

The code is counting **feed events**, not millilitres, minutes at the breast or milk transferred. One logged bottle is one event whether it contained a small top-up or a full feed. One breastfeed is one event whether it was brief comfort sucking or an effective feed. A feed split into two records may count twice.

## The missing-day rule changes the meaning of the average

A calendar date enters the average only when it contains at least one qualifying milk-feed event. Blank days, nappy-only days, sleep-only days and solids-only days are dropped. They are not inserted as zero-feed days.

OBubba needs at least **three qualifying feed-log days**, but those three dates could be the only thoroughly logged days in a much longer weigh-in interval.

Suppose the weights are 30 days apart. You fully log feeds on three days—eight feeds each—and barely open the app for the other 27. The average is eight, not 0.8. The card may say feeding looks solid because it is really describing the measured days.

That design avoids punishing a family for not tracking every day. It also creates selection bias: parents may be more likely to log on organised days, difficult days or days when they are actively watching feeding. The app cannot know whether the recorded dates represent the whole interval.

The sample label has another wrinkle. For this insight, `sampleSize` is the **calendar span between the weights**, not the number of days that contributed feed counts. A “30-day” label can sit behind an average based on three logged dates. A clearer future version would show both: **“3 feed-log days within a 30-day weight window.”**

## The age-based feed floors

The app divides the sum of qualifying feed events by the number of qualifying dates. It compares that average with this internal floor:

| Baby’s current age | OBubba’s feed-frequency floor |
|---|---:|
| Under 4 weeks | 8 recorded milk feeds/day |
| 4 to under 8 weeks | 7/day |
| 8 to under 13 weeks | 6/day |
| 13 to under 26 weeks | 5/day |
| 26 weeks and older | 4/day |

Meeting or exceeding the floor produces the low-urgency **“feeding looks solid”** wording. Falling below it produces the medium-urgency **“feeds are on the lower side”** version instead. The lower-side card keeps one decimal place in its displayed average so rounding does not accidentally make the copy contradict the threshold.

These floors are **OBubba product heuristics**, not NHS feeding prescriptions or clinical thresholds. Feeding frequency varies with age, feeding method, milk supply, appetite, illness, solids and how a family records events. An older baby’s four large milk feeds cannot be directly compared with a newborn’s eight or more breastfeeds.

There is also a timing limitation: the floor comes from the baby’s **current** age, not their age during each logged day. If the latest weight is old, a baby may have moved into a lower-frequency age band since the weigh-in window. That can tilt the current verdict towards reassurance. This is one reason to read the card as a retrospective pattern, not a live feeding assessment.

## Why “feeding looks solid” is deliberately not “intake is good”

The Flutter card knows how many relevant feed records exist. It does not know:

- how much milk the baby transferred at the breast;
- the true volume taken from a bottle;
- whether feeds were comfortable or effective;
- whether there was persistent vomiting;
- wet- and dirty-nappy changes;
- alertness, tone, skin colour or hydration;
- length or head-circumference trend;
- measurement conditions; or
- a health professional’s examination.

The insight is named Growth × Feeding because it connects two logged categories. It is not a substitute for combining growth, feeding behaviour, development and clinical context.

The genuine Growth page makes that broader intention visible: weight sits alongside length and head circumference, with a WHO curve and the reminder that growth is “a constellation, not a competition.” This particular card, however, uses **weight only**.

![OBubba’s genuine Flutter Growth page presents weight, length and head circumference together with a WHO curve.](/obubba-growth-curve-app.jpg "The app’s Growth page is designed to show a wider constellation of measurements. The specific Growth × Feeding card described here calculates from weight entries and recorded milk-feed frequency only.")

## A worked example

Consider a 16-week-old baby with these records:

- 6.30 kg on 1 March, calculated around the 52nd centile;
- 6.55 kg on 29 March, calculated around the 44th centile;
- exactly one major line—the 50th—strictly crossed;
- seven dates in that interval with milk-feed logs; and
- 42 qualifying feed events across those dates.

The average is **6 feeds per measured day**. At 16 weeks, the app floor is 5. The reassuring one-band card can appear.

Now change only the feed total to 28. The average becomes 4.0, below the floor, so the app can show the “feeds are on the lower side” version.

Now keep the original 42 feeds but move the later centile far enough to cross both the 50 and 25 lines. The feed average no longer controls the wording. Two crossed lines route to the health-visitor message.

Finally, remove all but two qualifying log dates. The insight stays silent because the three-day evidence gate is not met. Silence means the rule lacked usable evidence, not that growth was good or bad.

## A separate low-supply guard can take priority

There is one further suppression rule. For a baby under 26 weeks, if the average is at least eight feeds per logged day but the calculated gain is under 50 grams per week, this card stays quiet. A separate low-supply-related insight owns that combination.

This guard helps prevent a reassuring frequency message from sitting beside a more specific concern about slow gain. It also reinforces the central point: lots of feed records do not necessarily establish effective intake.

The 50 g/week value is another internal rule, not a diagnosis. If growth or feeding concerns persist, use professional assessment rather than reverse-engineering the app’s thresholds.

## What to do when the card appears

### 1. Check the two source entries

Confirm the weights, units and dates. Consider whether one measurement included heavier clothes, a full nappy or a different scale. Do not delete a genuine result simply to smooth the curve; correct only a real recording mistake.

### 2. Ask how representative the feeding log is

Were feeds logged consistently between the weigh-ins, or only on a handful of days? Were breast, bottle and night feeds all recorded in roughly the same way? If the record is sparse, mentally replace “feeding looks solid” with “feed frequency looked solid on the measured days.”

### 3. Look at the baby, not just the centile

Consider feeding comfort, swallowing, usual alertness, nappies and any change from the baby’s normal pattern. A chart is one part of a wider picture.

### 4. Keep routine weighing proportionate

The NHS advises that, unless there are concerns, babies are usually weighed no more than monthly up to 6 months, every 2 months from 6 to 12 months, and every 3 months after the first birthday. Extra weighing can make ordinary short-term variation feel more dramatic. Follow the schedule your health visitor or clinician recommends for your baby.

### 5. Bring the pattern to the right person

Contact your health visitor, GP or feeding-support professional if you are worried, even if the card is low urgency. Seek prompt medical advice if your baby seems unwell, unusually sleepy, is feeding much less than normal, or has noticeably fewer wet nappies. The app cannot triage those signs.

## Why the card may not appear

This insight can remain silent when:

- sex is unknown for the selected growth standard;
- there are fewer than two valid weight entries;
- dates are invalid, reversed, under 5 days apart or over 90 days apart;
- the latest weight is more than 90 days old;
- corrected age is before the due date or the percentile age is over 24 months;
- the centile decrease is under five points;
- no major line was strictly crossed;
- feeding history in the window is archived or incomplete at the storage layer;
- fewer than three dates contain a qualifying milk-feed record; or
- a separate low-supply pattern owns the message.

It may also show a different card because two lines were crossed or the feed-frequency average fell below the current age floor.

No card is not an assessment. It only means this particular Flutter rule did not produce a message from the available data.

## Where the insight lives—and when it can return

The card appears in **What OBubba noticed**, where the app combines recent records into longer-view patterns. Its route can open the relevant growth or feeding context, and the higher-urgency two-line version points towards health-visitor support.

The dismissal identity includes a hash of the body text. Because the body changes with a new centile or feed average, the insight is designed to speak again when a new weigh-in changes the evidence, rather than repeating the same message every day.

That is the right role for a tracker: remember the detail, show its workings and make the next conversation easier.

## The bottom line

**“Weight eased a band, but feeding looks solid” is a narrow, personal observation—not a verdict on growth.**

It means the latest two usable weights crossed exactly one major app centile boundary, while recorded milk-feed events on at least three measured days met OBubba’s current-age frequency floor. It does not measure milk transfer, nutritional intake or the baby’s wellbeing.

Use the card to replace one frightening dot with a more proportionate question: *Is this a small settling of the curve, are the records representative, and is there anything about my baby or feeding that I want a professional to review?*

That combination—calm context, visible limits and a clear route to human help—is what makes personalisation trustworthy.
