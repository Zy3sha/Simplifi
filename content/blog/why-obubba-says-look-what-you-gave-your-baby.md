---
title: "Why Does OBubba Say ‘Look What You Gave Your Baby’?"
slug: why-obubba-says-look-what-you-gave-your-baby
description: "Inside OBubba’s Month of Love card: the exact 30-day counters, why naps held is warm wording, and how to recognise invisible baby care without keeping score."
date: 2027-01-21
updated: 2027-01-21
author: OBubba
tags: invisible baby care work, new parent mental load, OBubba month of love, look what you gave baby, share baby care fairly, baby tracker with partner, baby care recap, parenting app wellbeing, monthly baby tracker summary, mental load new parents
heroImage: /obubba-month-of-love-parental-load.jpg
---

After weeks of feeds, nappies, naps and broken nights, OBubba can open with something very different from another prediction:

> **“A month of love. Look what you gave Maya.”**

Below it, five lights may show feeds given, sleep supported, naps held, wakes soothed and nappies changed.

Is it measuring how good a parent you are? Does **404 hours of sleep supported** mean someone actively soothed for 404 hours? If two carers share the app, whose work is it counting?

None of those. We traced the current Flutter provider, calculation and production card for this guide. The keepsake is a warm reflection built from a **rolling 30-day family log**. Its numbers are real counters, but its labels are deliberately emotional—not literal measurements of effort, love or who did the work.

![What each number on OBubba’s Month of Love card actually counts.](/obubba-what-month-of-love-counts.svg "The Flutter card uses a rolling 30-day record, requires at least 14 non-empty days and 20 feeds plus naps, and appears at most once per calendar month for each baby.")

## The short answer

The current card can appear when:

| Check | Flutter rule | Meaning |
|---|---:|---|
| Working window | Today + previous **29 days** | A rolling 30-day snapshot, not the first-to-last day of a calendar month |
| Logged-day gate | At least **14 non-empty days** | The recap is not built from a very sparse record |
| Activity gate | At least **20 feeds + completed naps** | There is enough repeat care for the moment to feel earned |
| Repeat limit | Not already dismissed this calendar month | It appears at most once per month for this baby |
| Baby scope | Active baby only | Dismissing one child’s card does not suppress another child’s |

The gate does not check whether every day is complete. One saved event makes a day non-empty. Nappies and night wakes help populate the final card, but only feeds plus naps satisfy the 20-event activity gate.

This is recognition, not assessment. There is no target, percentage, parent ranking or “good month” threshold.

## It is a rolling month, not this calendar month

The heading says **A Month of Love**, while the provider gathers the latest 30 local calendar buckets each time it builds.

Open it on 21 January and the data can reach back into December. Open it on the first of a month and almost the whole calculation belongs to the previous month. The share card’s date label uses the current calendar month, but the evidence remains rolling.

That design gives a fuller recent picture than waiting for month-end. It also means two recaps shown in consecutive months can overlap heavily. They should not be added together as a year-to-date total.

## Exactly what each light counts

### Feeds given

The counter uses every saved entry whose type is `feed`.

It does not inspect who offered it, how demanding it felt or how much milk transferred. Because the Flutter model commonly stores solids and pumping as feed entries with a feed subtype, those can also contribute when they are represented as `feed`. A standalone legacy `pump` type would not.

So **76 feeds given** means 76 qualifying feed records—not 76 bottles, 76 breastfeeds or 76 feeds completed by the person looking at the screen.

### Sleep supported

This is the total calculated daytime nap sleep plus night sleep across the window, divided by 60 and rounded to the nearest whole hour.

The shared day metrics do more than subtract two clocks:

- overlapping or duplicate sleep arcs are merged;
- completed daytime naps contribute their calculated duration;
- timed mid-nap wakes can be deducted;
- timed night wakes inside sleep arcs can be deducted; and
- corrupt sleep arcs above the plausibility guard are not allowed to inflate the total.

The warm phrase **sleep supported** does not mean an adult was awake, holding or settling throughout those hours. It means that amount of baby sleep is represented by the recent log.

### Naps held

This label is especially important to read gently.

The underlying number is the count of completed logged naps after Flutter’s normalisation. A nap needs a start and end and must last at least five minutes. Overlapping duplicate naps are merged, and an evening bedtime that was clearly mis-logged as a nap can be reinterpreted before counting.

The engine does not check nap location or settling method here. A cot nap, pram nap, nursery nap and contact nap can all add one. **Naps held** is affectionate copy, not proof that someone physically held every nap.

### Wakes soothed

The night counter consolidates near-duplicate night wakes and can fold night feeds into the same waking episode. A qualifying night feed with no matching wake can itself contribute a wake-like event. Dream feeds, solids and pump entries are excluded from that feed path.

This protects the total from obvious double-logging, but it still cannot see soothing. A wake may have ended independently, with feeding, with rocking, with a partner, or after a long awake spell.

Read **8 wakes soothed** as eight distinct night-waking episodes inferred from the saved record—not eight proven successful soothing actions.

### Nappies changed

The calculation counts entries whose type is the app’s nappy/poop type. Wet, dirty and combined records can all contribute one.

It does not infer missed changes. It cannot know whether a nursery changed a nappy that was never synced, whether two carers logged the same change far enough apart to look separate, or whether someone changed the baby without their phone nearby.

## The card counts the baby record, not one parent

The provider reads the active child’s combined recent entries. The calculation does not filter by `loggedBy`, account, device or carer name.

That makes the title **“Look what you gave Maya”** collective when a family shares the record. It may include work by a partner, grandparent, nanny, nursery or another synced carer. It may also omit vast amounts of care that nobody logged.

This is not a flaw if the card is understood as:

> “Look at the care surrounding this baby.”

It becomes misleading if used as:

> “Look at everything I personally did compared with you.”

Do not use the totals to settle an argument about fairness. The data was not collected or attributed precisely enough for that job.

## What the recap cannot count

Some of the hardest work leaves no event:

- noticing the first hunger cue;
- washing bottles and pump parts;
- planning safe meals and buying food;
- holding a worried baby through illness;
- booking appointments and remembering medicines;
- researching nursery, childcare or safer sleep;
- soothing that never reached the log;
- recovering from birth while caring;
- protecting a partner’s sleep;
- deciding when to ask for help; and
- carrying the constant background responsibility.

The card does not prove that a quiet month contained less love. It only makes one visible slice of care easier to notice.

## Why OBubba waits for 14 days and 20 events

A brand-new family should not receive a hollow celebration saying “0 feeds given”. The `hasEnough` gate requires both:

1. at least 14 days with any saved data; and
2. at least 20 feeds and naps combined.

That is a product threshold, not a parenting milestone. A family can provide extraordinary care with fewer logs. Another can meet the gate while recording only a small part of each day.

The threshold simply asks whether the recap has enough visible material to feel meaningful.

## Why you may not see the card

Common explanations include:

- fewer than 14 recent days contain any entry;
- the recent record has fewer than 20 feeds and completed naps combined;
- the card has already been thanked or dismissed this calendar month;
- you switched to a different baby profile;
- some data has not synced into the active child record; or
- a nap is still open and therefore does not count as completed.

Silence is not a verdict on care. It only means the display conditions were not met.

## The real Flutter artwork and sharing path

The production card surrounds its counters with a starlit care illustration and the line **“Every light is a moment you showed up.”** This is the exact artwork bundled in the current Flutter screen:

![The exact parent-and-baby illustration used inside OBubba’s current Month of Love card.](/obubba-month-of-love-flutter-art.png "The app treats the recap as a keepsake, using a starlit parent-and-baby illustration rather than a performance dashboard.")

The **Keep / share** control is optional. It opens a branded keepsake card containing the non-zero summary lines, baby’s first name, the current month label and a referral code/QR when one exists. OBubba does not automatically post the recap.

Before sharing, consider whether you want your baby’s name and routine totals visible. A keepsake can stay private.

## A better conversation than “who did more?”

Use the recap as a doorway into care, not evidence for a prosecution.

Try asking:

- Which part of this month felt heaviest?
- Which repeated task could someone else own completely?
- Who is carrying the remembering and planning?
- Is either carer never getting an uninterrupted rest block?
- What can we stop doing, simplify or ask family to cover?
- Are we logging for help—or maintaining the log itself as another burden?

A shared tracker can reduce “When was the last feed?” questions. It cannot create a fair division of labour by itself. That still requires a real conversation and practical change.

**[Explore everything OBubba can keep together →](/baby-tracker-features.html)** — sleep, feeds, nappies, weaning, growth, medicines, memories and shared care, with the record turned back into useful guidance rather than left as data entry.

## Recognition is not a wellbeing check

The monthly card never asks how the parent feels. It cannot identify burnout, depression, anxiety, intrusive thoughts, relationship safety or whether anyone is coping.

The NHS says the weeks and months after having a baby can bring many emotions, and parents and carers can find it hard to talk because of pressure to appear happy. If you are worried about how you feel, struggling to cope or think you may have postnatal depression, speak to a midwife, health visitor or GP. Fathers and partners can be affected too.

If you need urgent mental-health help in England but it is not an emergency, use NHS 111 online or call 111 and select the mental-health option. If you or someone else is in danger, call 999 or go to A&E.

A beautiful recap should never become a reason to delay real support.

## Frequently asked questions

### Does the card cover the current calendar month?

No. It reads a rolling 30-day window ending today. The “once a month” rule controls how often it appears, not the exact start and end of the data.

### Why does it say “naps held” when my baby sleeps in a cot?

The underlying number is completed logged naps. This counter does not inspect location or settle method, so “held” is warm wording rather than a literal description.

### Does “wakes soothed” mean the baby went back to sleep every time?

No. The function counts deduplicated night-waking events, including some wake-like night feeds. It does not require a recorded successful soothing method.

### Can it show which partner did the feeds and nappies?

Not on this card. The calculation reads the active baby’s combined record and does not group totals by carer.

### Do nappies and wakes help unlock the card?

They can appear as totals after the card qualifies, but the activity gate specifically requires at least 20 feeds plus completed naps and at least 14 non-empty days.

### Why did it appear again in a new month with similar numbers?

The provider allows one display per calendar month, while each display reads the latest rolling 30 days. Consecutive recaps can therefore share many of the same dates.

### Is a larger number better?

No. More wakes can mean a harder month; fewer feeds may reflect age or feeding changes; fewer logs may simply mean less tracking. None of the values is a target.

## Reliable UK support

- [NHS Best Start in Life: Your mental health after having a baby](https://www.nhs.uk/best-start-in-life/baby/your-mental-health/)
- [NHS: Postnatal depression](https://www.nhs.uk/mental-health/conditions/postnatal-depression/)
- [NHS Every Mind Matters: Urgent mental-health support](https://www.nhs.uk/every-mind-matters/urgent-support/)
- [NHS: Keeping fit and healthy with a baby](https://www.nhs.uk/baby/support-and-services/keeping-fit-and-healthy-with-a-baby/)

*OBubba can reflect saved care events and help a family share information. It cannot measure love, effort, fairness or mental health; attribute every task to the person who did it; or replace support from a midwife, health visitor, GP, perinatal mental-health service, NHS 111 or emergency services.*
