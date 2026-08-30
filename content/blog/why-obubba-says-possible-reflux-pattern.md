---
title: "Why Does OBubba Say ‘Possible Reflux Pattern’?"
slug: why-obubba-says-possible-reflux-pattern
description: "What OBubba’s reflux pattern card really detects, which note words count, why three matches are not a diagnosis, and when vomiting needs help."
date: 2027-03-28
updated: 2027-03-28
author: OBubba
tags: possible reflux pattern OBubba, baby reflux tracker, baby spit up after feeding, baby arching back after feed, baby possetting, baby refuses feed, reflux diary baby, baby feeding and sleep tracker, baby vomiting red flags, OBubba feeding insight
heroImage: /obubba-possible-reflux-pattern.jpg
---

You logged a milk feed. Twenty minutes later, you added **“posset again”**. It happened after another feed, then a third. OBubba surfaced:

> **Possible reflux pattern**

Has the app diagnosed reflux? Does every unsettled feed now count? Should your baby sleep propped up because milk comes back?

**No. This is a narrow seven-day timing-and-word match, not a diagnosis.** The current Flutter detector needs at least six logged milk feeds and at least three feeds followed within 30 minutes by a note containing one of a small set of recognised phrases. It does not examine your baby, measure discomfort, know how much milk came up or decide whether reflux needs treatment.

And whatever the card says, safer sleep stays the same: put baby down flat on their back. Do not raise the cot or Moses basket.

![The exact software path behind OBubba’s Possible reflux pattern card.](/obubba-reflux-pattern-detector.svg "The current Flutter detector looks across today and the previous six calendar days for at least six milk-feed entries and three recognised notes within 0–30 minutes after feeds. Each note can match only once. This is a software pattern, not a diagnosis.")

## The short answer

The current Flutter `diagnoseReflux` function:

1. collects entries from **today plus the previous six calendar days**;
2. counts feed entries except those marked as solids;
3. finds timestamped notes containing **back arch**, **arching back**, **spit-up**, **spit up**, **posset**, or a form of **refuses feed**;
4. checks whether each recognised note happened from **0 to 30 minutes after** a feed on the same calendar day;
5. lets each note match only one feed; and
6. returns the low-urgency card when there are at least **six feeds to compare** and at least **three matched feeds**.

The card then says how many feeds in the week had “fussiness or spit-up” within 30 minutes and labels its confidence with the total feed sample.

That summary is broader than the literal matcher. **A note that only says “fussy”, “crying” or “unsettled” does not match the current code.** The recognised words are the narrower list above.

## A worked example: why three notes can trigger it

Imagine this saved week:

| Entry | Time | Result |
|---|---:|---|
| Bottle feed | Monday 08:00 | feed 1 |
| “Posset again” | Monday 08:18 | **match**: 18 minutes after |
| Breastfeed | Tuesday 11:10 | feed 2 |
| “Arching back” | Tuesday 11:42 | no match: 32 minutes after |
| Bottle feed | Wednesday 14:00 | feed 3 |
| “Spit-up” | Wednesday 14:00 | **match**: zero minutes is allowed |
| Dream feed | Thursday 22:30 | feed 4 |
| “Refused feed then posset” | Thursday 22:55 | **match**: 25 minutes after |
| Milk feed | Friday 07:00 | feed 5 |
| Milk feed | Saturday 09:00 | feed 6 |

There are six feeds and three usable feed-to-note links, so the card can appear. The 32-minute note does not count.

Now change one detail:

- only five feeds in the seven-day collection: no card, even with three matching notes;
- only two matching notes: no card, even with many feeds;
- the note says only “very fussy”: no match;
- the note is 10 minutes before the feed: no match;
- the note follows a solids meal with no milk feed nearby: the solids meal does not count;
- the feed is just before midnight and the note just after midnight: the current per-day comparison cannot pair them.

This is why a card can disappear after an edit. The engine is describing the saved timeline, not making a permanent medical judgment.

## Which words actually count?

The matching is case-insensitive and accepts these patterns:

| A note like… | Recognised? | Why |
|---|---:|---|
| “Spit up after feed” | Yes | `spit up` matches with a space |
| “Spit-up after feed” | Yes | a hyphen is also accepted |
| “Posset twice” | Yes | `posset` is recognised |
| “Back arch after bottle” | Yes | `back arch` is recognised |
| “Back-arch after bottle” | Yes | a hyphen is accepted |
| “Arching back and crying” | Yes | `arching back` is recognised |
| “Refuses feed” | Yes | refuses/refused/refusing feed are recognised |
| “Fussy after feeding” | **No** | generic fussiness is not in the expression |
| “Cried for ten minutes” | **No** | crying alone is not in the expression |
| “Gagged on puree” | **No** | gagging is not a recognised reflux phrase |

Spelling matters. “Possetting” contains `posset`, so it matches; an unrelated euphemism may not. Use ordinary, specific words rather than trying to write for the algorithm.

The detector reads the note attached to **any timestamped entry**, not only a Quick Note. That makes it flexible, but also means a recognised phrase in an unrelated note can be linked if its time falls in the window.

## The 30-minute window is directional

The note must happen at the same minute as the feed or in the 30 minutes after it. A symptom logged before a feed does not count, even if the parent entered it later.

OBubba compares the saved event times, not the moment you tapped Save. If something happened at 8:20 but you write a Quick Note at 9:15 and leave its event time at 9:15, it will not pair with an 8am feed. Backdating the note to when it happened makes the record more truthful.

Each recognised note is used once. If feeds are saved at 8:00 and 8:10, followed by one “spit up” note at 8:20, that single observation cannot make both feeds count. The code takes the first eligible feed it encounters and marks that signal used.

![The genuine current OBubba Flutter Quick Log turns plain-English speech or typing into timestamped entries for review before saving.](/obubba-quick-voice-log-app.jpg "A genuine current Flutter screen: Quick Log lets a parent type or speak a time-stamped record and review what OBubba heard before saving. Specific event times make later pattern summaries easier to interpret.")

**[Try OBubba free →](/app.html)** — keep feeds, quick notes, nappies and sleep in one timeline, then use patterns as questions to explore rather than labels to fear.

## Six feeds is a sample gate, not a ratio test

The detector needs six feeds, but it does not require a particular percentage of feeds to match.

- Three matches among six feeds can trigger it: 50%.
- Three matches among 30 feeds can also trigger it: 10%.

The card’s sample label helps show that context, but the title is the same. It does not calculate whether the pattern is becoming more frequent, whether the amount brought up is increasing, or whether the same feeding method is involved each time.

It also has no age gate. A newborn and an older baby can meet the same software thresholds, even though age, feeding history, growth and symptom onset matter clinically.

That is a deliberate reason to read **possible pattern** literally.

## Reflux is common; GORD means something more

Gastro-oesophageal reflux is milk or stomach contents moving back into the food pipe. In well infants, effortless regurgitation is common and usually improves with time. NICE says it affects at least 40% of infants and usually does not need investigation or treatment.

Gastro-oesophageal reflux disease, or GORD, is different: reflux causes symptoms severe enough to merit medical treatment or leads to complications. A tracker cannot make that distinction from three text matches.

The card cannot know:

- whether the milk came up effortlessly or forcefully;
- its colour or whether it contained blood;
- whether baby was distressed or simply needed a muslin;
- whether feeding refusal is persistent;
- whether wet nappies or weight gain have changed;
- whether symptoms began unusually late;
- whether allergy, infection or another condition could explain the picture; or
- whether back arching is persistent enough to need specialist assessment.

NICE specifically advises against routinely investigating or treating reflux when there is no visible regurgitation and only one associated symptom such as feeding difficulty or distressed behaviour. Persistent back arching needs professional assessment rather than more app inference.

## What to do when the card appears

### 1. Check the timeline

Open the matching days and look for wrong times, duplicate feeds, a solids meal saved as milk, or a note recorded long after the event. Do not rewrite an accurate history just to remove the card.

### 2. Add useful detail, not a diagnosis

For the next real episode, record:

- feed time and type;
- bottle amount if genuinely measured, or breast side and duration without inventing millilitres;
- when the spit-up, arching or refusal began;
- effortless dribble versus forceful vomiting;
- approximate amount and colour;
- distress, coughing, choking or breathing changes;
- wet nappies and stools;
- temperature or illness signs;
- what happened to the next sleep; and
- what helped while baby was awake.

This creates a clearer history for a health visitor, GP, feeding specialist or paediatric team. Do not delay care to complete the diary.

Our broader [reflux and colic diary guide](/blog/baby-reflux-colic-diary-what-to-track.html) has a simple tracking checklist. If the main problem is pulling off and crying during feeds, the [breastfeeding troubleshooting guide](/blog/why-baby-pulls-off-breast-and-cries.html) separates flow, wind, discomfort and supply questions.

### 3. Keep feeding responsive

Ask a health visitor for feeding support and check breastfeeding position or bottle-feeding technique. The NHS suggests holding baby upright during feeds and for as long as possible afterwards while they are awake, and burping regularly during feeds.

The card’s current in-app explanation uses a more specific “20–30 min” upright suggestion. That is product copy, not a timer you must complete. If you are becoming sleepy, put baby in their own clear, flat sleep space rather than trying to stay upright in an armchair or on a sofa.

Do not force a bottle, overfeed to “test” reflux, arbitrarily stop breastfeeding, change formula repeatedly or add thickeners without professional advice. For breastfed babies with frequent regurgitation and marked distress, NICE recommends a skilled breastfeeding assessment. Formula-fed babies with marked distress have a stepped clinical approach; treatment choices belong with a qualified professional.

### 4. Keep sleep flat and on the back

Reflux does not create an exception to safer-sleep positioning. The NHS says baby should sleep flat on their back, not on their side or front, and the head of the cot or Moses basket should not be raised. NICE also says not to use positional management for reflux in sleeping infants.

Holding an awake baby upright after a feed and putting a sleepy baby flat on their back are compatible. Upright is an awake settling position, not a sleep position.

## When vomiting needs medical help

Ask for an urgent GP appointment or call NHS 111 if your baby has green or yellow vomit, blood in vomit, projectile vomiting, blood in their poo, a swollen or tender tummy, a very high temperature or seems very distressed and will not stop crying. Follow the current NHS reflux page for the exact route for your situation.

Seek medical advice if reflux is not improving, starts for the first time after six months, continues beyond one year, or baby is not gaining weight or is losing weight. Ongoing feeding difficulty, faltering growth or persistent back arching also deserves assessment.

Get immediate help if baby is hard to wake, struggling to breathe, blue/grey/very pale or appears seriously unwell. Drier nappies than usual can be a dehydration sign. Call 999 for a life-threatening emergency.

The app may stay silent in every one of these situations. A red flag does not need three matched notes, six feeds or seven days of data.

## What OBubba gets right—and where it stays humble

The useful idea is not “an app can diagnose reflux.” It cannot. The useful idea is that exhausted parents often remember the worst moment but struggle to reconstruct whether it followed one feed or several, by five minutes or by an hour.

OBubba joins event timing across one practical timeline. It requires repetition before speaking, excludes solids from the feed denominator, prevents one note from multiplying into several matches, uses low urgency and says **possible**.

But the boundaries are just as important:

| OBubba can describe | OBubba cannot conclude |
|---|---|
| three recognised notes followed feeds within 30 minutes | baby has reflux or GORD |
| how many milk feeds were in the seven-day sample | how much milk baby transferred at the breast |
| exact phrases and saved timestamps | severity, pain, colour or force unless you record them |
| a repeated timeline association | cause, treatment or safety |
| feeds, sleep, nappies and notes together | whether baby is clinically well |

That honest boundary makes the record more valuable, not less. A clinician can ask better questions when the history is specific and the software has not pretended to answer them.

## Frequently asked questions

### Does three spit-ups mean my baby has reflux disease?

No. Three recognised feed-to-note links meet the app threshold. GORD is a clinical distinction involving troublesome symptoms or complications.

### Why did “fussy after feed” not trigger the card?

Because generic `fussy` is not in the current regular expression. The card body uses “fussiness”, but the code looks for back arching, spit-up/posset or refuses/refused/refusing feed.

### Do breastfeeds count?

Yes. The detector counts milk-feed entries regardless of whether a volume is known. It does not need bottle millilitres.

### Do dream feeds and night feeds count?

Yes, if they are saved as feed entries and have a time. The detector spans the night, but a feed before midnight cannot pair with a note saved on the next calendar day.

### Do solids count?

No. Entries whose feed type is solids are excluded so ordinary weaning gagging or possetting cannot create a milk-reflux pattern on its own.

### Should I raise the cot after seeing the card?

No. The NHS says babies should sleep flat on their back and the cot or Moses basket should not be raised.

### Does no card mean everything is fine?

No. It may mean too few feeds, too few matching phrases, inaccurate times or symptoms the detector cannot recognise. Act on your baby and current clinical advice, not the absence of an insight.

## The takeaway

**Possible reflux pattern** means OBubba found at least three recognised notes within 30 minutes after feeds, among at least six milk feeds across seven calendar days. It is a careful timeline clue with a small vocabulary—not a diagnosis, severity score or treatment plan.

Check the record. Log useful detail. Feed responsively. Hold baby upright only while awake if that helps, then use a clear, flat sleep space on the back. Seek help for red flags or whenever your baby’s feeding, growth, nappies or wellbeing concern you.

## Sources and further reading

[NHS: Reflux in babies](https://www.nhs.uk/conditions/reflux-in-babies/) — common symptoms, awake upright holding, burping, flat-on-back sleep, not raising the cot, and routes to medical help.

[NICE NG1: Gastro-oesophageal reflux disease in children and young people](https://www.nice.org.uk/guidance/ng1/chapter/Recommendations) — definitions, normal regurgitation, red flags, persistent back arching, feeding assessment, treatment boundaries and sleep positioning.

[NHS: Is your baby or toddler seriously ill?](https://www.nhs.uk/baby/health/is-your-baby-or-toddler-seriously-ill/) — poor feeding, drier nappies, breathing, responsiveness, colour and urgent-help signs.

[NHS: Safer sleep advice for babies](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/) — a clear, flat sleep space and returning baby to their cot before the adult sleeps.

OBubba Flutter source reviewed for this article: `lib/core/engine/feed_insights.dart`, `lib/core/engine/brain.dart`, `lib/core/models/baby_entry.dart`, `test/reflux_test.dart` and related feed-entry tests.
