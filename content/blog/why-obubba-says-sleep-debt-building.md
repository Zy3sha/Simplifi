---
title: "Why Does OBubba Say ‘A Sleep Debt Is Building’?"
slug: why-obubba-says-sleep-debt-building
description: "See exactly how OBubba adds night sleep and naps across complete days, when its sleep-debt card stays silent, and how to use the recovery plan gently."
date: 2027-02-13
updated: 2027-02-13
author: OBubba
tags: baby sleep debt, overtired baby sleep debt, catch up sleep baby, baby not getting enough sleep, OBubba sleep debt, why OBubba says sleep debt building, baby total sleep tracker, protect baby naps, earlier bedtime overtired baby
heroImage: /obubba-sleep-debt-building.jpg
---

Monday contained a short night and two tiny naps. Tuesday was not much better. By Wednesday, your baby is rubbing their eyes earlier, fighting sleep harder and waking more often—and OBubba says **“A sleep debt is building.”**

That phrase can sound more medical and exact than the underlying information allows.

**In OBubba, “sleep debt” is a tracking shorthand: the app adds logged night span and naps across several complete days, compares each total with the lower edge of an age-based sleep-duration range, and sums only the shortfalls. It is not measuring a substance inside the body, diagnosing sleep deprivation or deciding that every baby needs the same number of hours.**

The useful part is not the label. It is that the app waits for a multi-day pattern, refuses to turn missing logs into zero sleep and gives one calm recovery direction: protect sleep opportunities for a few days instead of reacting to one bad night.

## First: babies vary more than a chart can show

The [NHS says some babies need more sleep and some less](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/your-babys-sleep-patterns/). Sleep changes as babies grow, and feeds, illness, teething and development can alter a week.

For healthy infants aged 4 to 12 months, the American Academy of Sleep Medicine recommends **12 to 16 hours in 24 hours, including naps**. The range is 11 to 14 hours for children aged 1 to 2 and 10 to 13 hours for ages 3 to 5. These are population recommendations for regular sleep—not a daily pass mark for an individual child.

There is no equivalent evidence-based duration recommendation for babies under 4 months in that consensus statement because sleep is especially variable in the newborn period. OBubba reflects that uncertainty by not surfacing its proactive sleep-debt card before 16 weeks.

So a 7-month-old logging 11 hours 50 minutes once has not “failed sleep”. A pattern below the lower guideline can be worth reviewing, but the baby’s behaviour, health, feeding and normal baseline still matter.

## What the current Flutter app actually counts

OBubba uses the same core shortfall calculation in two places:

- the proactive **“A sleep debt is building”** insight looks across up to seven prior days
- the expanded Track guidance can show **“Catching up on sleep”** from up to four prior days

Both begin with the same question: **is this day complete enough to count?**

![The exact current Flutter sleep-debt gates, from complete day–night pairs through the two-day and 90-minute thresholds](/obubba-sleep-debt-detector-map.svg "OBubba’s current sleep-shortfall heuristic. Missing logs are skipped rather than counted as zero sleep.")

### 1. The app pairs a day’s naps with the night that followed

For each prior calendar day, OBubba combines:

- the bedtime-to-morning span for the night following that day
- the completed nap time logged during that day

Today is excluded because today’s naps and tonight’s sleep are still unfolding. Including a partial day would manufacture a huge shortfall before the day had finished.

### 2. Bedtime and morning wake must both be reconstructable

A bedtime without a morning wake is not a complete night. An open sleep timer is not a completed night. If the app cannot reconstruct both ends, it skips that pair.

This avoids a common tracker mistake: interpreting “not recorded” as “slept zero minutes”.

### 3. At least one nap must actually be logged

OBubba also skips a pair when there are no nap entries for that day.

Why? A family may track nights carefully but not track naps at all. Adding a real night to an invented zero-minute nap total would make a well-rested baby appear short every day.

This guard is deliberately conservative. A baby who genuinely took no naps will not contribute to this particular calculation unless the record contains evidence that daytime sleep was tracked. The app chooses fewer alerts over false alarms.

### 4. Night sleep is a broad span

For this calculation, the app uses the reconstructed bedtime-to-morning span. It does not subtract every logged awake minute from that span.

That choice tends to **understate**, rather than inflate, the calculated shortfall. A 10-hour night containing a 45-minute split wake still enters as roughly 10 hours here. Use the separate night analysis for actual awake duration and interrupted sleep quality.

![A genuine current OBubba Flutter Track screen showing the overnight clock and the night record that supplies bedtime and morning context](/obubba-sleep-debt-track-app.jpg "Current OBubba Flutter Track surface with fictional example data. The sleep-debt calculation needs completed day and night records; this screen is the source timeline, not a medical monitor.")

## The exact age floors

The current engine counts only minutes below the lower edge of these 24-hour ranges:

| Corrected or chronological age used by the engine | OBubba range | Shortfall starts below |
|---|---:|---:|
| 4–11 months | 12–16 hours | 12 hours |
| 1–2 years | 11–14 hours | 11 hours |
| 2 years and over | 10–13 hours | 10 hours |

The app contains a newborn reference range internally, but the proactive debt insight returns nothing below 16 weeks. It does not tell a fourth-trimester family that unpredictable, fragmented newborn sleep is a deficit to repay.

Only short days add to the ledger. A day within or above the range contributes zero debt; extra sleep on another day does not mathematically cancel an earlier shortfall.

For example:

| Day | Logged total | 7-month floor | Added shortfall |
|---|---:|---:|---:|
| Monday | 11h 20m | 12h | 40m |
| Tuesday | 12h 35m | 12h | 0m |
| Wednesday | 11h 5m | 12h | 55m |

The running total is 95 minutes. The normal Tuesday stays normal; it does not become a 35-minute “credit”.

## Why one terrible day does not trigger the card

The current Flutter logic requires **both**:

1. at least two genuinely short days, and
2. at least 90 minutes of accumulated shortfall

One extremely short day can exceed 90 minutes on its own and still remain silent. This prevents a vaccination day, journey, illness wobble or unusually bad night from becoming a premium-feeling alarm.

Two days that are each 20 minutes short also remain silent because the total does not reach 90 minutes.

The app is looking for a building multi-day pattern—not perfection.

## How OBubba decides whether the gap is widening

When at least five complete pairs are available, the engine compares the three most recent totals with the older totals.

- if the newest three average more than 20 minutes less, the gap is **widening**
- if they average more than 20 minutes more, it is **narrowing**
- otherwise, the direction is **steady**

With fewer than five usable days, the debt may still qualify, but the trajectory stays neutral.

This direction can matter more than the accumulated number. A 120-minute ledger that is already narrowing suggests the family may be recovering. A smaller total that is widening suggests protecting the next few sleep opportunities before overtiredness becomes harder to untangle.

## Where the recovery duration comes from

OBubba turns the accumulated shortfall into a simple planning horizon at roughly **30 extra minutes of sleep opportunity per day**. The suggested period is clamped between two and ten days.

That produces an approximate ladder:

| Calculated shortfall | Suggested recovery window |
|---:|---:|
| 90 minutes | about 3 days |
| 2 hours | about 4 days |
| 3 hours | about 6 days |
| 5 hours or more | capped at 10 days |

This is not a promise that sleep can be repaid like money. It is a way to avoid an extreme response. The plan asks for several modest opportunities rather than a single dramatically early bedtime or forcing a long nap.

The age-specific bedtime suggestion comes from the same bedtime bounds used elsewhere in the app. It is not a universal “6pm bedtime” pasted onto every child.

## Why the card may disappear even when the arithmetic qualifies

OBubba prioritises one coherent direction over contradictory advice.

The proactive debt card is suppressed when another current insight already says:

- early rising is the more specific problem
- today’s day sleep is clearly above range and may need a later bedtime or different pressure balance
- today’s day-sleep deficit already provides the immediate protect-sleep action

Without that curation, one screen could tell a parent to protect every nap while another tells them to trim sleep. Silence can mean a more specific signal won—not that the history was erased.

## What to do tonight

Use the card as a prompt for opportunity, not a command to make sleep happen.

### Protect the easiest nap

Choose the nap most likely to work. If contact, carrier or pram sleep is the practical rescue and can be done safely, support is not failure. Do not attempt a new independent-nap plan during a catch-up spell.

### Let bedtime move modestly earlier

If the final nap ended early and your baby is clearly tired, begin the usual wind-down a little sooner. Often 15 to 30 minutes is enough for a first test. A dramatically early bedtime can create a long awake spell if sleep pressure is not ready.

### Keep feeds and comfort responsive

Do not delay a feed, stretch a wake window or withhold comfort to protect a graph. Hunger and illness override a schedule experiment.

### Reduce optional stimulation

On recovery days, simplify rather than cancel family life: a quieter final hour, familiar routine, dimmer environment and fewer avoidable late errands can create space for sleep.

### Review after several complete days

The card is designed around a pattern. Give the pattern a chance to change before escalating the plan—unless the baby seems unwell or something worries you.

**[Try OBubba free →](/app.html)** — keep naps, bedtime, morning wake and night context on one timeline, then let the app distinguish a complete multi-day pattern from an unfinished day or missing log.

## When “sleep debt” is the wrong frame

Do not assume overtiredness when:

- your baby is unusually sleepy, difficult to wake or feeding poorly
- breathing looks laboured or there are pauses, gasps or colour changes
- fever, pain, vomiting, diarrhoea or dehydration signs are present
- a baby under 3 months has a temperature of 38°C or higher
- sleep suddenly changes alongside a medicine, injury or concerning symptom
- the logged shortfall conflicts with a bright, comfortable baby following their normal pattern

Use current medical guidance and contact NHS 111, your GP or emergency services as appropriate. A tracker cannot distinguish catch-up sleep from lethargy or assess breathing.

If sleep remains difficult and affects your baby or family, the [NHS suggests speaking with a health visitor](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/).

## How to make the read more trustworthy

### Close the night record

Log morning wake or finish the overnight timer. An open night is correctly excluded.

### Track at least one real nap entry

If your baby took no nap, record the day’s context in a note rather than assuming the engine can infer a genuine zero from absence.

### Correct forgotten timers

A four-hour nap left running can erase a real shortfall. Edit the start and end rather than leaving a known error because the day has passed.

### Mark disruptions

Illness, travel, nursery, teething and vaccination notes help you interpret the same total differently, even though they do not alter this simple arithmetic.

### Look beyond duration

Total time is not sleep quality. Review repeated waking, long awake periods, settling difficulty, snoring, feeds and your baby’s daytime behaviour too.

## Frequently asked questions

### Does sleep debt mean my baby is harmed?

No. In OBubba it means multiple complete logged days fell below an age-based duration floor and crossed the app’s alert thresholds. It is not a diagnosis or proof of harm.

### Can one bad night trigger it?

No. At least two short days and at least 90 accumulated minutes are required.

### Why does the app need naps if I track nights?

The comparison uses total 24-hour sleep. Treating untracked naps as zero would create false shortfalls, so days without nap evidence are skipped.

### Why did the number not subtract a long night wake?

This specific calculation uses bedtime-to-morning span as a conservative night estimate. Separate OBubba night analysis tracks wake count and awake duration.

### Can extra sleep tomorrow cancel today’s shortfall?

Not mathematically in the current ledger. Tomorrow can show that the trajectory is narrowing, but in-range or longer days contribute zero rather than negative debt.

### Why did “A sleep debt is building” disappear?

The usable window may have changed, the threshold may no longer qualify, the direction may have changed, or a more specific current signal may be suppressing contradictory advice.

### Should I wake my baby at the usual time during recovery?

Not solely to preserve the schedule. Balance the body-clock anchor with the need for adequate total sleep, feeding and family life. If prolonged sleepiness is unusual or the baby seems unwell, seek advice rather than labelling it catch-up.

## A guardrail, not a grade

The best use of a sleep-duration range is to notice a meaningful run—not to score every day.

OBubba’s strongest design choice here is not the 90-minute threshold or the recovery formula. It is the refusal to manufacture missing sleep data, the newborn silence and the decision to wait for more than one short day.

Let the card create breathing room: protect a nap, soften bedtime and watch the direction. Your baby is not in debt to the app.

## Sources

- [NHS Best Start in Life: Your baby’s sleep patterns](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/your-babys-sleep-patterns/)
- [NHS: Helping your baby to sleep](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/)
- [American Academy of Sleep Medicine: Child sleep-duration advisory](https://aasm.org/wp-content/uploads/2017/10/child-sleep-duration-health-advisory.pdf)
- [American Academy of Pediatrics: Endorsement of paediatric sleep-duration recommendations](https://publications.aap.org/pediatrics/article/138/2/e20161601/52457/Recommended-Amount-of-Sleep-for-Pediatric)
- [Newcastle Hospitals NHS Foundation Trust: Sleep in young children](https://www.newcastle-hospitals.nhs.uk/services/sleep-service/paediatric-sleep/sleep-young-children/)

*This article provides general information, not medical or individual sleep advice. OBubba is a tracking and pattern-support app, not a medical device.*
