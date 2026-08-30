---
title: "How Does OBubba Build ‘Tonight for Maya’?"
slug: how-obubba-builds-tonight-for-baby
description: "Inside OBubba’s Sleep Story: how tonight’s guidance, seven-day wins, observations and one gentle experiment are built from your baby’s real logs."
date: 2027-01-28
updated: 2027-01-28
author: OBubba
tags: OBubba Sleep Story, Tonight for Maya, personalised baby sleep guidance, baby sleep tracker analysis, tonight baby bedtime plan, baby sleep story app, baby sleep consultant app, weekly baby sleep review, baby sleep patterns, gentle baby sleep plan, personal baby rhythm, baby bedtime guidance
heroImage: /obubba-tonight-sleep-story.jpg
---

You have logged naps, bedtime and the wakes that broke up last night. What you need at 6pm is not another dashboard. You need to know what matters **tonight**.

That is the idea behind OBubba’s Sleep Story. In the current Flutter app, it opens with a personal title such as **“Tonight for Maya”**, then turns recent sleep records into a short path through bedtime: what to notice, how to wind down and one gentle experiment to try.

It can feel like a small sleep-consultant note written for your family. But what is it actually reading? Is every sentence live? Does a “fragmented” week mean something is wrong? And can its suggestion tell you to drop a feed?

We traced the production **Sleep Story engine**, the Tonight’s Guidance engine that feeds it, the Care screen that displays it and the tests around missing data. The reassuring answer is that the story is assembled from identifiable rules—not from a camera, microphone or hidden diagnosis. The important caution is that **a persuasive story is still only as complete as the record underneath it**.

## The short answer

OBubba’s Sleep Story combines four layers:

| Story layer | What the Flutter app uses | What the parent sees |
|---|---|---|
| **Tonight** | Live bedtime guidance, a logged bedtime if one already exists, and the active coaching step | A single “calm path into bedtime” |
| **This week** | Up to seven recent calendar days compared with the seven before them | Up to two “little lights” or wins |
| **Meaning** | Logged nights, night wakes, day sleep, bedtime/morning timing and usable sleep-debt days | One assessment and explained observations |
| **Try** | The strongest supported issue, such as fragmented nights or low consistency | Up to three ideas, framed as one gentle experiment |

It also has a low-data state. If fewer than two days in the current week contain any entries, it says the rhythm is **still learning** and asks for more logging rather than inventing certainty.

![A diagram showing live guidance and one plan step flowing into tonight’s headline, while two seven-day windows produce wins, an assessment and optional experiments.](/obubba-tonight-sleep-story-logic.svg "OBubba’s Sleep Story has a live tonight layer and a separate weekly evidence layer, with missing-data gates before stronger conclusions.")

The result is a nightly synthesis, not a medical assessment and not a promise that a particular bedtime will produce a particular night.

## Why this is more useful than another graph

A tracker can show that bedtime was 7.18pm, there were three wakes and naps totalled 2 hours 24 minutes. Those are facts. At the end of a tiring day, the harder question is how the facts relate.

The Sleep Story changes the order of attention:

1. **Tonight first.** It leads with the most immediate bedtime action.
2. **Wins next.** It preserves progress that a rough night can hide.
3. **One sentence for the week.** It names the broad night pattern without pretending to diagnose a cause.
4. **Evidence with meaning.** Each observation is paired with an explanation.
5. **One experiment.** The aim is a manageable next step, not a complete routine overhaul.

That hierarchy is the product’s real advantage. Parents do not download a baby tracker because they dream of entering timestamps. They keep one when it gives those timestamps back as a calmer decision.

## The live layer: what changes tonight

The Sleep Story receives the current Tonight’s Guidance notes from a separate engine. Those notes can include bedtime, expected wakes, a likely first-wake time, a personally learned wake window, recent disruption such as teething or a milestone, and recovery after a difficult patch. The list is prioritised and capped at six lines.

It also receives the active coaching plan’s **today action**. If the current plan has one, that step is appended to tonight’s path.

The story then looks for one authoritative bedtime line. If Tonight’s Guidance already says “Aim for bedtime around…”, the Sleep Story uses it for the headline and removes the duplicate from the later observations. That small implementation choice matters: two competing bedtimes make a personalised feature feel less intelligent, not more.

If bedtime has already been logged, the story stops telling you to aim for a stale future time. It leads with **“Down at…”**, can compare that time with the baby’s usual bedtime and may add the recorded settling duration.

If neither a usable live bedtime line nor a logged bedtime exists, the app estimates a fallback from the last nap and an age-based wake window, constrained to an evening range. That is a fallback—not proof that the baby will be ready at exactly that minute.

![The real OBubba Tonight’s Guidance card shows several prioritised notes drawn from a baby’s own rhythm.](/obubba-tonights-guidance-sleep-consultant.jpg "The current app’s real Tonight’s Guidance surface supplies the live notes that can lead the Sleep Story; the story then adds weekly context and one plan step.")

The screenshot is a real product surface, not a mock-up. It also shows why transparency matters: advice can sound precise when the underlying observation is simply an average from the entries available.

## The weekly layer: two windows, not one bad night

The engine gathers 14 calendar days in two groups. The current week is the most recent seven slots, including today; the comparison week is the seven before that.

It calculates weekly statistics and can celebrate at most two wins:

- night wakes fell by at least 0.5 on average, when both weeks have enough logged nights
- daytime sleep rose by at least 20 minutes, when nap coverage exists in both weeks and day sleep is not already generous
- bedtime and morning timing reached a consistency score of at least 70
- if none of those qualify, consistent logging itself becomes the win

This protects the story from making the whole week about last night. A difficult Tuesday does not erase a longer first stretch on Sunday or a calmer bedtime rhythm emerging across several days.

The comparison is still only as good as its coverage. A calendar day in the past is not necessarily a completely logged day. Nursery naps, contact naps or a partner’s night response can disappear from the story if they never reached the shared record.

## What “settling beautifully”, “fairly typical” and “fragmented” mean

The weekly assessment uses a deliberately simple rule after at least two logged nights:

| Average logged night wakes | Current assessment wording |
|---:|---|
| **1.2 or fewer** | “settling beautifully” |
| **more than 1.2, up to 3** | “fairly typical” |
| **more than 3** | “fragmented” |

With fewer than two logged nights, it says there are not yet enough nights to call the pattern.

These are product labels. They do not determine whether a baby is thriving, whether wakes are developmentally expected, whether a feed is needed or whether a family is coping. A newborn waking four times is not “failing” sleep. An older baby waking once can still need help if the wake lasts three hours. A single average cannot contain either family’s full experience.

The NHS notes that babies have individual sleep patterns, newborns repeatedly wake in the first months, and some babies—not all—sleep for longer stretches as they grow. Growth spurts, teething and illness can alter sleep. That is the right context for reading a weekly label: descriptive, not diagnostic.

## How the app handles sleep debt

The Sleep Story does not calculate sleep debt from every day in the grid. It looks at up to seven **complete pairings ending yesterday**. For each usable date, it needs:

- a reconstructed bedtime and morning wake spanning the correct night
- at least one logged daytime nap
- enough information to compare total sleep with an age-based range

If either the night endpoints or daytime nap evidence is missing, that date is skipped rather than silently treated as zero. The code also sets debt to zero for babies below 16 weeks, preventing newborn variability from producing a “protect naps” debt narrative.

Those are meaningful safeguards. But the output remains an estimate based on parent-entered timestamps and broad age ranges. It cannot observe an unlogged car nap, know whether a timer ran while the baby was awake, or turn recommended ranges into an individual medical need.

Treat “sleep debt” here as **a prompt to review the record and the baby**, not a clinical measurement inside the body.

## How the story chooses an experiment

The app can offer up to three “try this week” lines, drawn from the strongest available pattern:

- protect naps when logged daytime sleep is low or estimated debt is building
- keep wakes dark, calm and low-stimulation when average night wakes exceed three
- anchor morning or bedtime within about 30 minutes when timing is inconsistent
- consider shortening a generous late nap when it may be crowding bedtime
- keep doing what is working when no stronger issue qualifies

This is better read as a menu than a prescription. Choose the one action that fits your baby and family; you do not need to implement every line at once.

A useful seven-night experiment has three parts:

1. **Keep the change small.** For example, begin the same short wind-down 15 minutes earlier.
2. **Keep the evidence simple.** Log bedtime, settling and night wakes consistently.
3. **Stop if it makes things worse.** A plan should reduce strain, not demand that a distressed baby or exhausted parent push through.

For night-time settling, low lights and quiet interaction are consistent with NHS guidance. They are not a reason to withhold comfort, feeding, a necessary nappy change or medical care.

## The most important limitation: pattern is not cause

Tonight’s Guidance contains age-based language about expected wakes. In some older-baby cases, the current code may describe higher average wakes as looking more like habit or a sleep association than a “real need”. That conclusion is too strong for the inputs available.

Age and wake frequency alone cannot establish why a baby woke. The app does not measure:

- hunger or milk transfer
- daily energy intake
- wet nappies or hydration at the moment of the wake
- pain, reflux, breathing or temperature
- growth trajectory and individual clinical advice
- whether a premature baby’s feeding plan still includes night feeds

Likewise, a line about avoiding a feed before 6am cannot know that a particular baby is not hungry. NHS responsive-feeding guidance says to follow hunger cues rather than a strict schedule and notes that babies are likely to need night feeds for at least the first few months.

So translate a forecast as:

> “This resembles a pattern in the log. Pause and observe if that feels appropriate—but respond to hunger, distress and your baby’s individual needs.”

Never use a Sleep Story as permission to night-wean, delay a hungry baby or ignore a clinician’s feeding plan.

## Teething, allergens and medicine need a harder safety boundary

The live guidance engine can thread recent teething, medicine and allergen records into tonight’s notes. That context may help a parent remember that sleep changed alongside something else. It cannot decide that one caused the other.

In particular:

- a logged tooth does not confirm that pain caused a wake
- a medicine/sleep correlation does not verify the medicine, dose, indication or side effects
- an allergen timeline cannot rule an allergy in or out

Do not wait for a future app pattern if a baby has a possible allergic reaction. NHS guidance lists symptoms such as swelling, wheeze or breathing difficulty, an itchy rash, vomiting and diarrhoea; a severe reaction needs emergency help. Follow the child’s allergy plan if they have one and call 999 for signs of anaphylaxis.

The app should eventually place a visible safety gate around these lines and avoid giving a fixed reaction window as reassurance. Logging can preserve context for a clinician. It is not triage.

## How to read your story in under a minute

### Read the headline as a plan, not a promise

“Aim for bedtime around 7.20” means the available rhythm points there. It does not mean 7.20 is a biological deadline or that the night will fail at 7.35.

### Tap the calculation note

The screen includes a locked explanation of how the story was calculated, including logged-day coverage and weekly averages. Check whether the sample resembles real life before trusting the interpretation.

### Separate live facts from weekly patterns

A logged “Down at 7.18” is a fact from tonight. “Wakes are easing” is a comparison across multiple nights. “Teething may be in the mix” is a hypothesis. They deserve different confidence.

### Pick one experiment

If three suggestions appear, choose the one with the clearest evidence and lowest family cost. Consistency is useful; rigidity is not.

### Keep safety outside the experiment

Always place a baby on their back in a clear, flat, separate sleep space with a firm mattress, and room-share for at least the first six months. No timing insight replaces safer-sleep practice.

## When the story should say “still learning”

The low-data state is not a failure. It is one of the most trustworthy things a personalised app can say.

OBubba needs at least two days with entries before it builds the fuller weekly story, and stronger findings have their own coverage rules. If the app stays quiet after illness, travel or a logging break, log the few events that answer your current question rather than reconstructing an imaginary perfect week.

For bedtime, that might be:

- morning wake
- naps and the last nap end
- bedtime start and sleep time
- night wakes and feeds
- obvious disruption such as illness or travel

Three honest nights are more useful than seven beautifully complete but guessed ones.

## What OBubba gets right—and what should improve next

The current feature gets several product decisions right:

- it leads with tonight rather than burying the action under charts
- it does not duplicate two competing bedtime recommendations
- it replaces a stale bedtime aim after sleep is logged
- it skips incomplete sleep-debt days instead of manufacturing zeros
- it suppresses newborn sleep-debt language
- it limits wins and experiments so the story stays readable
- it can admit that the rhythm is still learning

The next trust improvements are clear too. Wake-cause language should become less certain; feed-avoidance language needs hunger, age and clinical-plan gates; allergen and medicine notes need explicit safety routing; and every interpretation should show its usable-night count beside the sentence, not only inside a calculation panel.

That is how this feature can become genuinely hard to replace: not by sounding like it knows everything, but by giving parents a coherent next step **and making the limits of that coherence visible**.

**[Build tonight’s story in OBubba →](/app.html)** — log sleep, feeds, nappies, first foods and real-life disruptions in one shared record, then let the app return the smallest useful plan for tonight.

## Frequently asked questions

### Is OBubba’s Sleep Story generated by AI?

The current Flutter Sleep Story is assembled by deterministic product rules from the entries, weekly statistics, live Tonight’s Guidance and the active coaching step. It does not watch or listen to the baby and it is not a medical diagnosis.

### Why does my story say “still learning”?

The current engine needs at least two days with entries before it creates the fuller weekly story. Individual wins and observations can need more specific coverage.

### Does “fragmented” mean my baby has a sleep problem?

No. In the current code it means more than three logged night wakes on average after at least two logged nights. It does not include wake duration, feeding need, illness or family impact.

### Can the bedtime move after I log another nap?

Yes. Tonight’s live guidance uses the latest available day and rhythm context. Once bedtime itself is logged, the Sleep Story should describe the recorded bedtime instead of repeating an earlier aim.

### Should I follow every suggestion tonight?

No. Choose one gentle, safe experiment that fits the evidence and your family. Respond to hunger and distress, and stop a change that makes sleep or wellbeing worse.

### Can the story tell me when to stop night feeds?

No. A wake forecast cannot establish whether a particular feed is nutritionally or emotionally needed. Night-weaning decisions need the baby’s age, feeding, growth, health and any individual professional advice.

## Reliable UK sources

- [NHS: Helping your baby to sleep](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/)
- [NHS Best Start in Life: Feeding on demand](https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/bottle-feeding/bottle-feeding-your-baby/feeding-on-demand/)
- [NHS: Your breastfeeding questions answered](https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding/your-questions-answered/)
- [NHS: Food allergies in babies and young children](https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/)
- [NHS: Anaphylaxis](https://www.nhs.uk/conditions/anaphylaxis/)
- [The Lullaby Trust: Keeping a clear cot](https://www.lullabytrust.org.uk/baby-safety/safer-sleep-information/keeping-a-clear-cot/)
- [The Lullaby Trust: Room sharing](https://www.lullabytrust.org.uk/baby-safety/safer-sleep-information/room-sharing/)

*This article provides general information for UK families. OBubba cannot diagnose a sleep, feeding, allergy or medical problem; determine why a baby woke; or decide that a night feed is no longer needed. Follow your baby’s cues and any individual advice from your midwife, health visitor, GP, feeding team, paediatrician or neonatal service.*
