---
title: "What Can I Say to OBubba Quick Log? 20 Phrases That Work"
slug: what-can-i-say-obubba-quick-log
description: "Use these tested OBubba Quick Log phrases for feeds, naps, nappies, wakes, solids, temperature and medicine—then check the draft before saving."
date: 2027-02-05
updated: 2027-02-05
author: OBubba
tags: OBubba Quick Log, voice baby tracker, baby tracker voice log, log baby feed by voice, log baby sleep by voice, baby nappy tracker, baby tracking examples, plain English baby tracker, hands busy baby logging, shared baby tracker
heroImage: /obubba-quick-log-phrases.jpg
---

The bottle is in one hand, the muslin is under your chin and the exact time of the last nappy is already disappearing from memory. This is precisely when a tracker that needs six taps stops being useful.

OBubba’s **Quick Log** lets you type or say an ordinary sentence such as:

> “Fed 100ml at 8am, dirty nappy at 9am, then napped 10am to 11am.”

The current Flutter app separates that into three proposed entries, shows what it heard and waits for you to press **Log 3 entries**. Nothing is saved merely because speech recognition produced a sentence.

We traced the production Quick Log sheet, its plain-English parser and more than 500 lines of parser tests for this guide. Here are 20 phrases the current app is explicitly tested to understand, what each becomes and the mistakes a tired parent should still catch before saving.

## The short answer

You can use Quick Log for:

- bottle and breast feeds
- finished naps, open naps, bedtime and night sleep
- wakes
- wet, dirty and mixed nappies
- solids
- temperature readings
- medicines already given
- simple care moments such as a bath or play

You can combine several events with **“and then”**, a comma or a full stop. Include an explicit time wherever possible. Then read every green preview line before saving.

![A four-step explanation of OBubba Quick Log: speak or type, parse into proposed entries, review the important details, then save to the shared timeline.](/obubba-quick-log-review-flow.svg "Quick Log is a reviewable draft. The parent remains responsible for checking event type, time, amount, medicine and temperature before saving.")

## 20 tested Quick Log phrases

These are not invented marketing examples. Each behaviour is covered in the current Flutter parser tests.

### Bottle and breast feeds

| Say or type | OBubba proposes |
|---|---|
| **1. “Fed 120ml at 2pm.”** | Bottle feed, 120ml, 2:00pm |
| **2. “Bottle 4oz at 9am.”** | Bottle feed, about 118ml, 9:00am |
| **3. “Gave a bottle of one twenty ml at 2pm.”** | Bottle feed, 120ml, 2:00pm |
| **4. “Nursed right side 15 minutes at 2pm.”** | Breastfeed, right side, 15 minutes, 2:00pm |
| **5. “Breastfed left 10 minutes, right 5 minutes.”** | One breastfeed with 10 minutes left and 5 minutes right |
| **6. “Breastfed both sides for 20 minutes at 2pm.”** | One 20-minute breastfeed, split across both sides |

Four ounces is converted to millilitres and rounded because OBubba stores bottle volume in millilitres. The preview is therefore the place to notice whether speech recognition heard **four** or **forty**.

If you only say **“nursing”**, with no completed time or duration, the parser offers **Start breast timer** rather than inventing a finished feed. That timer is not saved from Quick Log; open the clock/timer to start it properly.

### Naps, bedtime and wakes

| Say or type | OBubba proposes |
|---|---|
| **7. “Napped 1pm to 3pm.”** | Completed nap, 1:00–3:00pm |
| **8. “Napped 1 to 3:30pm.”** | Completed nap, 1:00–3:30pm |
| **9. “Down for a nap at 2pm.”** | Open nap beginning at 2:00pm, marked still asleep |
| **10. “Slept 7pm to 7am.”** | Overnight sleep, 7:00pm–7:00am |
| **11. “Bedtime at 7:30pm.”** | Bedtime at 7:30pm |
| **12. “Woke up at 3am.”** | Wake at 3:00am, classified as a night wake |
| **13. “Fed 120ml at half past seven.”** | Bottle feed at 7:30 |

The parser understands **half past seven**, **half seven**, **quarter past two**, **quarter to eight**, **noon** and **midnight**. It also repairs common spoken ranges such as “napped 1 to 3”.

Still, an explicit **am** or **pm** is safer than relying on context. “At seven” can be a morning feed; an ambiguous bedtime hour is usually interpreted as evening. If that is not what you meant, correct the sentence before saving.

For catch-up logging after midnight, the app also applies the same night re-bucketing used by its manual log: a forgotten bedtime and its overnight wakes are kept with the relevant night rather than blindly filed under the date on the clock.

### Nappies, solids and everyday care

| Say or type | OBubba proposes |
|---|---|
| **14. “Dirty nappy at 4pm.”** | Dirty nappy, 4:00pm |
| **15. “Wet dirty nappy at 4pm.”** | One combined wet-and-dirty nappy, 4:00pm |
| **16. “Poopy diaper at 3pm.”** | Dirty nappy, 3:00pm |
| **17. “Ate avocado at noon.”** | Solids entry naming avocado, 12:00pm |
| **18. “Bath at 7. Bedtime 8pm.”** | A bath entry and a separate bedtime entry |

British **nappy** and American **diaper** both work. Texture words such as “pasty” can be recognised too, but a spoken description is never an assessment of hydration, allergy or illness. It is simply a parent-entered record.

For allergen tracking, use the full food details when they matter. “Ate avocado” is enough for a simple meal note; it is not a substitute for carefully recording a first allergen exposure and any reaction. See our [allergen recognition guide](/blog/why-obubba-did-not-detect-baby-food-allergen.html) for the exact difference.

### Temperature and medicine

| Say or type | OBubba proposes |
|---|---|
| **19. “Temperature 38.5 at 11am.”** | Temperature reading of 38.5°C at 11:00am |
| **20. “Gave Calpol 5ml at 10am.”** | Paracetamol medicine entry, 5ml, 10:00am |

These last two are records of something measured or already given. **Quick Log does not measure a temperature, choose a medicine, calculate a dose, verify the product strength or decide when another dose is safe.**

Always check the physical medicine packet or leaflet, the actual product and strength, the child’s age and any professional instructions. The NHS says to get help from 111 if a child has received more paracetamol than the packet, leaflet or prescription says. A log can help a carer remember what happened; it cannot authorise what happens next.

Likewise, do not spend time making a perfect app entry before seeking help. NHS guidance says to contact 111 or a GP urgently for a temperature of **38°C or higher in a baby under 3 months**, or **39°C or higher at 3–6 months**, and sooner for other concerning symptoms. Call 999 for emergency signs such as severe breathing difficulty, a non-fading rash or a baby who will not wake.

## What happens after you speak?

Quick Log is a small pipeline, not a magic transcription button.

1. **The phone transcribes your speech.** The present Flutter sheet requests microphone and speech-recognition access only when you first tap to talk. If speech is unavailable or permission is declined, typing still works.
2. **OBubba parses the text on the device.** It looks for care words, quantities, clock expressions and separators between events.
3. **The sheet shows “OBUBBA HEARD”.** Each recognised event gets a human-readable line: for example, the full breastfeed duration, both nap endpoints or “still asleep” for an open nap.
4. **You review the draft.** Edit the sentence if a time, quantity, side or event type is wrong. The preview updates as the text changes.
5. **You choose to save.** The button says **Log it** or **Log 3 entries**. Only then does the app attempt to add the entries to the baby’s timeline.
6. **OBubba reports the real result.** If only some entries save, the message says how many succeeded instead of claiming the entire sentence was logged.

![The real OBubba Flutter Quick Log screen showing one sentence parsed into three baby-care entries ready for review.](/obubba-quick-voice-log-app.jpg "The current app shows proposed feed, nappy and nap entries before the parent chooses to save them.")

That review step is the feature, not friction. Speech recognition is fallible, babies are noisy and **15ml** is very different from **50ml**.

## What Quick Log deliberately does not do

### It does not save negative events as positive ones

The parser tests explicitly reject phrases such as:

- “No nap at 2pm today.”
- “She didn’t wake in the night.”
- “Skipped her afternoon nap.”
- “No dirty nappy today.”
- “He had no milk today.”

If a real event appears alongside a negative statement—“No nap, so I fed him 90ml”—the feed can still survive as its own proposal.

### It does not turn unrelated speech into a baby event

“The weather is nice” produces no entry. If Quick Log cannot recognise anything loggable, the save button remains unavailable.

### It does not silently start timers from a catch-up sentence

“Nursing” or a timeless “napping” can be recognised as timer intent, but the sheet explains that a timer is not logged there. Add a real time for a past event, or start the live timer from the clock.

### It does not know whether the words are true

The parser can correctly structure **“temperature 38.5”**. It cannot know whether the thermometer was used correctly. It can record **“gave Calpol 5ml”**. It cannot know whether the bottle actually contained that strength or whether the spoken amount was accurate.

## The fastest, safest way to phrase a catch-up log

Use this order:

> **event + useful detail + explicit time**

Examples:

- “Bottle 120ml at 2:15am.”
- “Breastfed left 12 minutes, right 8 minutes at 6:30am.”
- “Wet and dirty nappy at 7am.”
- “Napped 1:10pm to 2:35pm.”

For several events, say **“and then”** between them. Keep medicine and temperature in especially clear, separate clauses. Look at the preview after speech recognition finishes rather than tapping save from muscle memory.

If you only know an approximate time, use an honest rounded time. A truthful “around 4am” note is better than a precise-looking minute invented by exhaustion. Read our guide to [tracking when you keep forgetting](/blog/keep-forgetting-log-baby-sleep-feeds.html) for a minimum useful record without tracker guilt.

## Why this matters beyond saving taps

One sentence can keep the same feed, nap and nappy visible to the next carer. That matters because OBubba’s later explanations depend on the shared timeline: wake windows need sleep arcs, feeding patterns need feeds and allergen history needs named foods.

Quick Log does not make rough data perfect. It reduces the chance that useful events remain stranded in a message, a memory or one parent’s phone. The payoff is not a prettier diary—it is a calmer answer to **“When did the baby last…?”** and more honest context for the next suggestion.

During overnight care, logging still comes second to safety. If you may fall asleep while holding or feeding your baby, put them in a clear, firm, flat sleep space on their back. Never fall asleep with a baby on a sofa or armchair. The app can wait.

## The one-sentence rule

**Say what happened, include the useful detail and time, then treat every Quick Log result as a draft until you have checked it.**

That is the difference between voice logging that merely feels fast and voice logging a family can actually trust.

**[Try OBubba free →](/app.html)** — type or speak feeds, naps and nappies in one sentence, review the entries, and keep the people caring for your baby on one shared timeline.

## Sources

- [NHS: Paracetamol for children](https://www.nhs.uk/medicines/paracetamol-for-children/)
- [NHS: High temperature in children](https://www.nhs.uk/symptoms/fever-in-children/)
- [NHS: How to take your baby’s temperature](https://www.nhs.uk/baby/health/how-to-take-your-babys-temperature/)
- [NHS: Safer sleep for babies](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/)

## Quick questions

### Does Quick Log save as soon as I speak?

No. Speech fills the text field, the parser creates preview lines, and you still have to press the log button.

### Can I type instead of using the microphone?

Yes. Typing and pasting use the same parser. That is also the fallback when speech recognition is unavailable or microphone access is not enabled.

### Can one sentence create several entries?

Yes. “Fed 100ml at 8am and then dirty nappy at 9am and then napped 10am to 11am” is explicitly tested to create three proposals.

### Why did “nursing” not save a feed?

With no completed duration or time, OBubba treats it as a request to start the breast timer. Quick Log cannot start that live timer; use the clock, or add the known time and duration for a completed feed.

### Can I rely on Quick Log for medicine dosing?

No. Use it only to record what was actually given. Check the packet, leaflet or prescription and ask a pharmacist, doctor or NHS 111 when unsure. If the log and the physical medicine information disagree, stop and resolve the discrepancy before another dose.
