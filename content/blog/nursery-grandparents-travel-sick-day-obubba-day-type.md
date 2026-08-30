---
title: "Nursery, Grandparents, Travel or Sick Day? Give OBubba the Missing Context"
slug: nursery-grandparents-travel-sick-day-obubba-day-type
description: "Use OBubba's Today type labels so nursery, grandparent, travel and sick days do not distort your baby's normal sleep and feeding pattern."
date: 2027-03-08
updated: 2027-03-08
author: OBubba
tags: nursery baby sleep tracker, daycare baby sleep, baby routine grandparents, baby sleep travel day, sick day baby sleep, baby tracker day type, baby sleep context, OBubba Today type, nursery naps bedtime, personalised baby routine
heroImage: /obubba-day-type-grandparent-handover.jpg
---

Your baby naps for 34 minutes at nursery, sleeps for two hours at Grandma’s, refuses the travel-cot nap, then spends a poorly day dozing on and off. Those days are real—but they are not interchangeable with an ordinary day at home.

If a baby tracker treats every row as identical evidence, one unusual Tuesday can make Wednesday’s guidance feel strangely wrong.

OBubba has a small control designed for exactly this problem: **Today type**. Label the date **Home, Daycare, Grand, Travel or Sick**, and the app can keep the day in the family story while reading its naps, feeds and wake windows in the right context.

> **The label does not erase an unusual day. It tells OBubba not to mistake that day for your baby’s normal baseline.**

## The 30-second answer

| Day type | Use it when | How OBubba treats it |
|---|---|---|
| **Home** | An ordinary day in your usual routine | Eligible to help teach the normal pattern |
| **Daycare** | Nursery, daycare or a childminder shaped the day | Keeps the record but excludes the day from normal baseline learning |
| **Grand** | Grandparents or family provided most of the care | Keeps the record, protects the home baseline and can contribute to an away-day comparison |
| **Travel** | You were out, travelling or sleeping somewhere different | Treats the day as disrupted context rather than a normal training day |
| **Sick** | Baby was unwell or the day was clearly “off” | Excludes the day from normal learning and treats illness as a health confounder, not a routine type |

**Home is the default.** You only need to change it when the day’s setting or condition materially changes how the logs should be interpreted.

## Where to find Today type

Open **Track**, move to the date you want, then scroll below the **Log details** grid. The **Today type** card shows the current label and a **Change** button.

The picker explains each choice:

- **Home:** a normal day at home;
- **Daycare:** at nursery or a childminder;
- **Grand:** with grandparents or family;
- **Travel:** out and about or travelling; and
- **Sick:** an unwell or off day.

You can label the day you are viewing, not only today. That means Monday’s nursery label can still be added on Tuesday after the handover sheet arrives.

![An OBubba product-design capture from the Flutter repository showing the Track clock and date navigation used to move between care days.](/obubba-day-type-track-app.png "OBubba product-design capture from the Flutter repository. Today type sits further down Track beneath Log details, and the date controls let a parent label a past day too.")

If you choose the wrong label, reopen the picker and change it. Selecting **Home** removes the stored exception and returns the date to the default context.

## A label is context, not the care record

Day type answers **“What kind of day was this?”** It does not answer **“What happened?”**

On a nursery day, still log or import the naps and feeds you know. On a day with grandparents, keep the handover facts: last feed, last nappy, sleep and medicine. On a sick day, record a genuine temperature or medicine event when relevant rather than assuming the label contains those details.

Think of the two layers like this:

1. **Events are facts:** a 12:20pm bottle, a 1:05–1:42pm nap, a 38°C temperature.
2. **Day type is context:** nursery, Grandma’s house, travel or an unwell day.

OBubba needs both to tell a useful story. A label without logs cannot reconstruct the day. Logs without context can make a disrupted day look like a new normal.

![A visual explainer showing OBubba's five day types and the difference between recording what happened, adding context, protecting the home baseline and learning an away-day night pattern only after enough evidence.](/obubba-five-day-types-cleaner-learning.svg "One day, five contexts: keep every real event, label why the day was different, learn the baseline from comparable days and compare away-day nights only when enough evidence exists.")

## What “protecting the baseline” means

OBubba learns from repeated days. It looks for useful relationships such as:

- how long your baby was awake before a settled nap;
- which nap timing tends to produce the best outcome;
- typical nap count and daytime sleep;
- feeding spacing;
- catnap patterns;
- bedtime and night-wake baselines; and
- whether a change you are testing is genuinely helping.

The Flutter engine has one shared exclusion rule for baseline learning. A day labelled Sick, Travel, Daycare or Grand is excluded, as is a day containing a plausible fever temperature. This rule is threaded into the wake-window learners, nap calibration, adaptive sleep profile, bedtime resolver, reminders and intervention comparisons.

That does **not** mean the day disappears. You can still see and review it. It means OBubba does not use an airport nap, an unwell contact-nap marathon or a nursery timetable to redefine what normally works at home.

The distinction is especially useful when data is sparse. If four ordinary days and one travel day are mixed together, the travel day represents 20% of the apparent evidence. Labelling it prevents a short disruption from carrying too much weight.

## OBubba can learn that away days affect the night

Protecting a baseline is only half the feature. Away-day labels can eventually reveal a pattern of their own.

The current engine pairs each real night with the day that came before it. It compares ordinary Home days with Daycare, Grand or Travel days. It remains silent until it has at least:

- four away-day nights;
- four home-day nights; and
- a difference of at least one average night wake.

If the difference clears those gates, OBubba can say that nights tend to run a little rougher—or calmer—after the dominant away-day type. It includes the two wake averages and the sample size rather than turning one difficult nursery night into a confident claim.

For example, five nursery days followed by about three wakes a night and five home days followed by about one wake a night are enough to surface a cautious nursery-specific pattern. Equal averages produce no card.

**Sick is deliberately excluded from this comparison.** Illness is a health confounder, not a lifestyle experiment. OBubba should not praise or blame an unwell day for changing sleep.

## Daycare does not mean “bad for sleep”

Some babies sleep more soundly after nursery. Others are wired by the stimulation, take shorter naps, or need an earlier wind-down. Many show no repeatable difference at all.

That is why OBubba supports both directions:

- **rougher after away days:** consider a calmer wind-down or slightly earlier bedtime;
- **calmer after away days:** notice whether activity, fresh air or social time may be helping; or
- **no reliable gap:** say nothing.

The label is not a judgement on a nursery, childminder or grandparent. It is a way to compare like with like and stop parents being told that a different environment has “ruined” the routine.

## Day type is not the same as Adjust schedule

This is an important product boundary.

**Today type** records context for review and learning. **Adjust schedule** is the explicit control for changing today’s plan because of illness, travel, an appointment or another disruption.

If you merely want OBubba to remember that yesterday happened at nursery, use the day label. If the baby is unwell today and you want the plan itself to accommodate more rest, use the appropriate schedule adjustment as well.

Some disruption context can soften predictions and reminders during recovery—Sick, Travel and Daycare have different recovery windows in the engine—but a label should not be treated as a command for an exact nap time. An explicit plan adjustment communicates intent more clearly.

## Why the labels belong to one baby

Twins and siblings can have different days even when the adults share one calendar.

One child may be at nursery while the other is home. One may be unwell while the other follows the ordinary routine. The Flutter app therefore stores day labels per active baby. A migration test specifically protects against an old device-wide label leaking from one twin into the other twin’s learning.

That detail matters: the wrong Sick label would not merely show the wrong chip. It could remove a perfectly ordinary day from the other baby’s baseline.

## The current cross-device limit

Today type is currently stored in the app’s local preferences for each baby. It survives restarts on that device, but it is not part of the shared child event record.

That means a partner can receive the synced naps and feeds while their own phone does not automatically inherit the Daycare or Sick label. If both caregivers rely on personalised guidance on separate phones, add the important day label on the device where that guidance is being reviewed.

This is different from a feed, sleep or nappy event, which belongs to the shared family record. The blog should be honest about that distinction until the product changes.

## Five practical examples

### 1. Nursery nap was much shorter than home

Log the time you were given and label the date **Daycare**. Do not stretch the nap to make the graph look normal. The short nap remains true, while the label stops it becoming a home wake-window lesson.

### 2. Grandma got a surprisingly long cot nap

Log the real nap and choose **Grand**. If those days repeatedly lead to calmer nights, OBubba may eventually surface that positive pattern. One lovely nap is still only one day.

### 3. Airport and car naps broke the usual rhythm

Use **Travel**. Record what you can, even if the times are approximate. When you are home, change future dates back to Home rather than leaving Travel selected by habit.

### 4. Baby was poorly and slept all afternoon

Choose **Sick** and record relevant factual events. Do not use the label as a diagnosis or substitute for medical advice. It simply keeps illness-distorted sleep out of normal learning.

### 5. Ordinary day, surprising sleep

Leave it as **Home** if the environment and health were genuinely ordinary. A normal day can still be unusual. OBubba needs honest variation to learn rather than having every inconvenient result marked as an exception.

## A good rule for choosing the label

Ask one question:

> **Would I expect this setting or condition to make today meaningfully different from our ordinary home routine?**

If yes, choose the closest label. If no, leave Home.

Avoid using Sick for every grumpy morning, Travel for every pram walk or Daycare for a one-hour playgroup. Over-labelling removes useful evidence just as surely as under-labelling adds noise.

## Quick answers

### Can I label yesterday after the nursery handover arrives?

Yes. Move Track to yesterday’s date, open Today type and select Daycare.

### Does the label delete that day from reports?

No. The real events remain in the record. The label changes how the app uses that day for normal baseline learning.

### Should I choose Grand whenever a grandparent visits?

Use Grand when grandparents or family shaped most of the care day. A short visit during an otherwise ordinary home routine can stay Home.

### Does Sick replace logging a temperature?

No. Sick is context. A genuine temperature, medicine or symptom-related note is a separate factual record.

### Will Daycare automatically move bedtime earlier?

Do not treat the label as an exact scheduling command. It informs context and recovery logic. Use Adjust schedule when you want to deliberately change today’s plan.

### Can OBubba compare nursery nights with home nights?

Yes, but only after enough evidence: at least four away-day nights, four home-day nights and an average gap of at least one wake.

### Are labels shared with my partner?

The current Flutter implementation keeps them per baby in local device preferences. Shared care events sync; the day label itself currently does not.

**[Try OBubba free →](/app.html)** — keep every real care day, add the missing context, and let personalised guidance learn from comparable evidence rather than a perfect-looking diary.

*This article describes the current OBubba Flutter implementation reviewed on 8 March 2027. Day labels organise app context; they are not medical assessments. Seek appropriate professional help when a baby is unwell, and urgent help in an emergency.*
