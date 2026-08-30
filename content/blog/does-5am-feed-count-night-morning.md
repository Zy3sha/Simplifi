---
title: "Does a 5am Feed Count as a Night Feed or a Morning Feed?"
slug: does-5am-feed-count-night-morning
description: "Is a 5am baby feed part of the night or the new day? Use what happens after the feed—not a rigid clock cutoff—and learn how OBubba groups it."
date: 2027-01-05
updated: 2027-01-05
author: OBubba
tags: does 5am feed count as night feed, 5am baby feed, night feed or morning feed, early morning feed baby, baby feed tracker, track night feeds, wake to wake baby log, baby night feeding, OBubba
heroImage: /obubba-5am-feed-night-or-morning.jpg
---

At 5:06am your baby wakes, takes a feed and closes their eyes again. You transfer them back to the cot at 5:32. At 6:47 they wake smiling and the curtains open.

Was that 5am milk the last feed of the night or the first feed of the morning?

**Count it with the night.** The most useful dividing line is not 5am, 6am or midnight. It is whether the overnight sleep continued after the feed. If baby feeds and returns to sleep, the feed belongs to that physical night. If baby stays awake and the household genuinely starts the day, it belongs to the morning.

That is a **tracking definition**, not a rule about whether a baby should be fed. Respond to hunger cues and follow any individual feeding plan regardless of what the clock or app label says.

![A simple decision guide showing that a 5am feed followed by more sleep belongs with the night, while a 5am feed followed by the start of the day belongs with morning.](/obubba-5am-feed-decision.svg "Ask what happened next: more overnight sleep, or the start of the day?")

## The quick answer in four real nights

| What happened | Most useful label | Why |
|---|---|---|
| 4:50am feed, asleep again by 5:15, up for the day at 6:40 | **Night feed** | it occurred inside one continuing overnight sleep |
| 5:20am feed, then lights on, dressed and playing | **Morning feed** | the feed began the first awake period of the day |
| 5:05am feed, 25 minutes awake, then another 90 minutes asleep | **Night feed** | a proper wake can still sit inside the night |
| 5:30am feed and you cannot remember whether baby slept again | **Record the time; add a note if useful** | honest uncertainty is better than inventing a boundary |

The same clock time can therefore receive a different label on two mornings. That is not inconsistent. It reflects what the baby actually did.

## Think in physical nights, not calendar boxes

Midnight is tidy for calendars but meaningless to a sleeping baby.

A physical night might run from 7:40pm on Monday to 6:35am on Tuesday. The bedtime, 1am feed, 5am resettle and final morning wake are all parts of that one night even though they cross two dates.

This distinction prevents two common distortions:

- Monday does not look like a feed-free night just because the feeds occurred after midnight.
- Tuesday's daytime intake does not look artificially high because it inherited two feeds from the night before.

For a 24-hour milk overview, every feed still counts. “Night feed” and “morning feed” describe **context**, not different kinds of nutrition.

## What counts as “the day started”?

Use the first awake period that genuinely becomes daytime. Clues include:

- baby stays awake rather than resettling
- curtains open or brighter lights come on
- voices, play and household activity become normal daytime activity
- you stop attempting to continue the overnight sleep
- the first daytime wake window has begun

None of these needs to happen at a fashionable time. If your family is up for the day at 5:15am, that is the morning your log needs to describe. If your baby feeds at 5:15 and sleeps until 7am, the earlier feed still sits inside the night.

The NHS recommends making daytime and night-time feel different: ordinary light, play and noise during the day, then low lights, quiet voices and little stimulation at night. Those cues can also help you recognise which side of the boundary a feed belonged to.

## A 5am feed is not automatically a sleep problem

Young babies commonly need milk around the clock. The NHS says newborn babies wake at night because they need feeding, and UNICEF UK's current night-care guide describes night feeding as normal and essential in the early weeks and months.

Age, growth, daytime intake, feeding method, illness and the baby's own pattern all matter. Even for an older baby, one early feed does not prove a habit, reverse cycling or a need to night-wean.

Look for a repeated pattern before interpreting it:

- Has daytime milk intake fallen while overnight feeds have become larger or more frequent?
- Does the 5am feed remain substantial, with clear hunger cues?
- Is baby briefly comfort-sucking and taking little milk?
- Did the pattern change with illness, teething, travel or a growth spurt?
- Is the feed followed by more sleep, or has waking for the day shifted earlier too?

Our guide to [reverse cycling](/blog/baby-feeds-more-at-night-than-day-reverse-cycling.html) explains what it means when more milk repeatedly moves into the night. The guide to [4–5am waking](/blog/baby-waking-early-4am-morning.html) looks at the wider sleep pattern. Neither pattern can be diagnosed from one timestamp.

## Do not delay milk to protect the label

A tracker should help you understand care, never dictate that care.

Respond to early feeding cues such as rooting, mouth opening, hand-to-mouth movements and restlessness. Follow neonatal instructions or an individual plan from your midwife, health visitor, paediatrician or feeding team. Do not hold a hungry baby to an arbitrary “morning feed starts at 6am” rule.

Likewise, do not force extra milk at 5am in the hope that baby will sleep longer. UNICEF UK's Baby Friendly guidance recommends responsive bottle feeding and says not to force a baby to take more than they need in an attempt to lengthen sleep.

The label comes **after the observation**:

1. meet the baby's need
2. see whether sleep continues
3. record the feed in the context that actually occurred

## What the actual OBubba Flutter app does

The current Flutter app does not decide that every feed before 6am is a night feed. Its live logger uses the baby's sleep state.

### A feed during an open night sleep is marked as night

When a bedtime sleep session is still open and you log a new feed, OBubba automatically saves it with the night flag. The app checks both today's entries and the previous night's carried-over sleep in the early hours.

That means a feed logged during a continuing 7:30pm-to-morning sleep is kept out of daytime feeding statistics and included in night-feed analysis. The logic follows the open night, not a simplistic 5am cutoff.

![The actual OBubba Flutter Track screen showing an open night-sleep session. A feed logged while this bedtime sleep remains open is treated as a night feed.](/obubba-night-wake-pause-app.jpg "OBubba uses the open overnight sleep context when a live feed is logged.")

### A 5am daytime feed is not stolen by the previous night

The app's wake-to-wake grouping tests explicitly protect an early feed that is **not** marked as night. A 5:30am morning feed stays with the new day rather than being pulled backwards merely because it happened early.

This matters for families whose day really does begin before 6am. OBubba follows the recorded context instead of rewriting the family's morning.

### You choose how the timeline looks

In **Account → Preferences → Day grouping**, parents can choose:

- **Calendar day:** a 2am event displays under its actual new date.
- **Wake to wake:** bedtime and all marked night wakes and feeds stay visually with the day on which that night began.

This changes how the log is displayed. It does not change the physical event, its time or the underlying sleep analysis. The app's night analysis remains wake-to-wake whichever display option you choose, so midnight cannot split one night into two misleading sleep stories.

### Editing does not silently relabel history

When an existing feed is edited, the Flutter logger preserves its original night status rather than asking whether a later bedtime happens to be open now. This prevents a daytime feed from being turned into a night feed simply because you corrected the note after baby went to bed.

That small safeguard is the point of analysing a real app rather than writing vague tracker copy: trustworthy patterns depend on what the logger does in awkward edge cases.

**[Try OBubba free →](/app.html)** — log the feed once and let sleep context, night analysis and your chosen timeline view do the organising.

## Why the label is useful

A good label helps answer specific questions over several days.

| Parent question | What consistent night/morning labels reveal |
|---|---|
| Is milk shifting into the night? | daytime versus overnight feed frequency and, where measured, volume |
| Is the first morning feed moving earlier? | whether the day itself is starting earlier or one night feed is being mistaken for breakfast |
| Is the 5am feed helping sleep continue? | feed time beside resettling and final morning wake |
| Are night feeds naturally reducing? | comparable night-feed counts across complete nights |
| Did a routine change help? | whether the change affected feeding, waking or both |

Consistency matters more than achieving the “correct” category on every uncertain morning. If you always classify by whether overnight sleep continued, comparisons stay meaningful.

## What if baby dozes during the feed?

Dozing does not automatically decide the boundary. Ask what happened after the feed was complete.

- Baby remained sleepy, returned to their sleep space and continued the night: **night feed**.
- Baby dozed at the bottle or breast, then became alert and began the day: **morning feed**.
- You cannot tell whether there was a meaningful sleep period: record the feed and keep the conclusion modest.

A feed can be effective even when a baby is drowsy. You do not need to make them fully alert merely to create a cleaner log.

## Safer handling in the most tiring hour

Predawn feeds often happen when adult alertness is at its lowest. Plan for that tiredness rather than relying on willpower.

The NHS says it is safest to put baby back in their cot before you sleep. For the first six months, the safest place is a cot or Moses basket in the same room as you, with baby on their back, on a firm flat mattress and with the sleep space clear.

Never fall asleep with a baby on a sofa or armchair. UNICEF UK's guide advises moving somewhere safer if you might doze off and highlights that a clear, flat, firm, separate sleep space should be ready nearby.

Keep enough light to feed and move safely, while preserving a calm night-time atmosphere if you are hoping sleep will continue.

## Frequently asked questions

### Is anything before 6am always a night feed?

No. A feed before 6am belongs with the night when the overnight sleep continues. If baby stays awake and the day genuinely begins, it is a morning feed. Six o'clock can be a household target, but it is not a biological switch.

### Does a 5am feed count toward today's total milk?

It counts toward any rolling 24-hour intake view. For day-versus-night pattern analysis, it is more useful to attach it to the physical night if baby returns to sleep. Always follow any clinical method you have been asked to use for recording intake.

### What if baby is awake for 45 minutes and then sleeps again?

That is still a night feed and an overnight wake if the sleep eventually resumes before the true morning start. Record the wake duration as well as the feed; the long awake interval may matter more than the category label.

### Does feeding at 5am create an early-waking habit?

One feed cannot establish that. Hunger, age, daytime intake, sleep timing, light, illness and development can all contribute. Compare several complete nights and do not remove a needed feed based on the clock alone.

### Should I night-wean the 5am feed first?

Not from the timestamp alone. Night-weaning readiness depends on age, growth, milk intake, wet nappies, feeding history and individual professional advice. Make changes gradually only when they are appropriate for your baby.

### What if my partner and I label it differently?

Agree on one observable house rule: **if baby returns to the overnight sleep, mark night; if the first daytime wake begins, mark morning**. That is easier to apply at 5am than debating an exact cutoff.

## Let the morning answer the question

You do not have to classify the feed while holding a hungry baby in the dark.

Feed responsively. Keep the environment safe. Then notice what happened next. More overnight sleep makes it a night feed; the first sustained awake period makes it morning.

The clock records when. The rest of the night explains what it meant.

## Sources and further reading

- [NHS: Helping your baby to sleep](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/)
- [NHS Best Start in Life: Safer sleep advice for babies](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/)
- [UNICEF UK Baby Friendly Initiative: Caring for your baby at night](https://www.unicef.org.uk/babyfriendly/baby-friendly-resources/sleep-and-night-time-resources/caring-for-your-baby-at-night/)

*OBubba is a tracking and education tool, not medical advice. Ask a qualified health professional about concerns involving feeding, growth, wet nappies, unusual sleepiness, illness or your baby's individual feeding plan.*
