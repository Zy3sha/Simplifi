---
title: "How Does OBubba Build Its Good Morning Briefing?"
slug: how-obubba-builds-good-morning-briefing
description: "Inside OBubba’s Good Morning briefing: how one completed night becomes a wake summary, likely bedtime and one calm focus for today."
date: 2027-04-20
updated: 2027-04-20
author: OBubba
tags: OBubba Good Morning briefing, baby sleep app morning plan, broken night baby sleep, baby sleep tracker analysis, personalised baby bedtime, longest sleep stretch, baby night wakes, sleep regression app, gentle baby sleep support, Bubba Coach, baby sleep patterns, parenting after a bad night
heroImage: /obubba-good-morning-briefing.jpg
---

It is 7.12am. You remember three wakes, half a cup of cold tea and very little else. The baby is cheerful. You are not sure whether today needs heroic nap repair, an earlier bedtime or simply fewer decisions.

This is the moment OBubba’s **Good morning** briefing is designed for. On the fresh Bubba Coach screen, it can turn the completed overnight record into three short things: what last night looked like, today’s likely bedtime and one calm focus.

We traced the current Flutter feature from the card parents see through the briefing engine, night reconstruction, day-plan calculation and automated tests. The useful part is its restraint: it will not call an unfinished night “slept through”. The part to read carefully is its confidence: labels such as “settled” and “routine worked” come from much less evidence than those phrases may suggest.

## The short answer

| Briefing line | What the app actually uses | What it does not know |
|---|---|---|
| **Last night** | A completed bedtime-to-morning record, number of logged wakes and longest stretch | Whether an unlogged wake happened, how hard each wake felt or why the baby woke |
| **Today’s likely shape** | Today’s entries, the current time and the baby’s known corrected age | A guaranteed bedtime or the baby’s future cues |
| **Worth knowing** | A recent disruption note, otherwise the completed night’s wake count | Whether teething, illness or a regression caused the wakes |
| **Greeting** | The carer name, when supplied, and the child profile | How rested the adult feels |

The briefing only appears from **5am up to—but not including—noon**, using the device’s local time. It is not shown for a pregnancy profile, and it appears on a fresh premium Coach surface before a chat has begun.

![A flowchart showing how a completed night, today's entries, corrected age and disruption context become the three lines in OBubba's morning briefing.](/obubba-good-morning-briefing-logic.svg "The morning briefing has separate evidence paths: last night shapes the night label, while today’s entries and known age shape the bedtime estimate.")

That separation is important. The app is not producing one all-knowing verdict. It is assembling three small answers from three overlapping—but different—sets of evidence.

## First, OBubba checks whether the night is complete

The most trustworthy rule in the briefing is also the easiest to miss. OBubba only writes its confident night sentence when it can reconstruct **both bedtime and morning wake** for the relevant night.

If a parent started a bedtime timer but forgot to log the morning, the app does not interpret the absence of wake entries as uninterrupted sleep. It falls back to asking for more logging. An automated Flutter test specifically protects this behaviour: a half-logged night must not produce either “slept through” or “routine worked”.

This prevents a common tracker error. No wake was recorded is not the same as no wake occurred.

The record still depends on people. OBubba is not listening through the microphone, watching a cot or reading a wearable. A wake settled by a partner, a feed logged on paper or a nursery nap that never syncs will remain outside its evidence.

## What “slept through”, “settled” and “broken” mean in the app

Once the night has two endpoints, the current engine sorts it by the number of logged wake entries:

| Logged night wakes | Current briefing language |
|---:|---|
| **0** | “slept through last night, no wakes logged” |
| **1–2** | “A settled night…” |
| **3 or more** | “A broken night… Today is gentle catch-up, not catch-up by force.” |

For a one- or two-wake night, the card also mentions the longest stretch when it reached at least five hours.

These are product labels, not developmental or medical judgments. Two ten-minute wakes and two ninety-minute wakes receive the same “settled” category here because the briefing does not use wake duration. Three brief resettles become “broken”, even if the parent felt reasonably rested. And “no wakes logged” remains a statement about the record—not sensor-confirmed continuous sleep.

The NHS notes that babies have individual sleep patterns and that night waking can change with growth spurts, teething and illness. Read the label as a quick description of the log, then look at the baby and the family experience before deciding what today needs.

## The real card, not a mock-up

![A real OBubba Coach screen showing a Good morning card with one wake, a 7 hour 18 minute longest stretch, a likely bedtime and a sleep-regression comfort note.](/obubba-good-morning-briefing-app.jpg "A real current Flutter app screen: one completed night supplies the wake summary, today and age supply the bedtime, and a recent disruption supplies the highlighted focus.")

In this real debug profile, Oliver’s card says there was one wake and a long 7h 18m stretch. It then gives a likely bedtime of 6.47pm. The highlighted note says Oliver is in a common sleep-regression window and recommends steadiness and comfort rather than changes.

Notice the hierarchy: the app does not ask the parent to inspect a chart before breakfast. It returns a night sentence, a time and one humane emphasis. That is good product design for a depleted moment.

It is also why the boundaries need to be visible. The polished card can make every sentence look equally established. They are not.

## How today’s bedtime is calculated

The bedtime line is only shown when OBubba has an actual age for the child. The engine uses corrected age, so prematurity can be reflected when the profile supports it. If age is missing, the app suppresses the personal bedtime line instead of presenting its internal fallback age as if it belonged to that baby.

The displayed time comes from the day-plan engine. It projects today from the entries available, applies an age-bounded bedtime and formats the result in the family’s clock preference.

Early in the morning, there may be very little “today” to work with. That means the estimate can be strongly age-led until wake time and naps fill in the day. A precise-looking 6.47pm is still a planning point, not a promise that the baby will be ready at exactly 6.47.

Use it like this:

- treat it as the centre of a flexible bedtime range
- let later naps and the baby’s cues update the plan
- do not stretch an overtired baby merely to hit the displayed minute
- do not force sleep when the baby is alert and content simply because the clock arrived

The best personalised time is one that remains revisable.

## An honest limitation: the broken night does not move that number

After three or more wakes, the briefing advises protecting naps and considering a calm, slightly earlier bedtime. That sounds as though last night has shifted the bedtime calculation earlier.

In the current Flutter path, it has not.

The night wake count chooses the **suggestion text**, while the displayed bedtime is calculated separately from today’s entries and corrected age. This briefing does not pass a broken-night sleep-debt adjustment into the day-plan calculation.

So a parent should translate the card as:

> “Last night’s record suggests keeping today gentle. The displayed time is today’s ordinary projection; use cues to decide whether bedtime needs to begin a little earlier.”

The product should either wire the night evidence into the number or soften the wording so the two lines cannot imply a calculation that did not happen.

## Why a disruption note takes priority

If OBubba has recent disruption context—such as illness, teething, travel, a leap or a sleep-regression window—that note becomes the highlighted focus. It outranks the generic post-night suggestion and tells the parent to keep the day steady and lead with comfort rather than changes.

That priority is sensible. A disrupted week is rarely the moment for an ambitious routine overhaul.

But the note is context, not cause. The app can know that a tooth or illness was logged near a sleep change. It cannot prove the two are connected, assess pain or determine that a developmental phase explains the night. “In the mix” is safer than “the reason”.

The same principle applies when no disruption is present. After a completed night with no more than two wakes, the current app says **“Last night’s routine worked”**. One night cannot establish that the routine caused the outcome. A more evidence-faithful version would be: “There is no need to change the routine after this night.”

## What the briefing leaves out

A four-line morning card has to omit detail. Parents should know which detail is absent before using it to change the day.

The current briefing does not factor in:

- how long each wake lasted
- whether a wake included a feed or how feeding went
- total overnight sleep as a headline measure
- nappies, hydration or illness symptoms
- the adult’s sleep and ability to cope
- the reason a wake happened
- a richer comparison with the child’s recent personal pattern

That does not make the briefing useless. It defines the job: **a low-friction snapshot of one completed night**, not a diagnosis and not the whole sleep history.

For a measured trend, use OBubba’s [weekly comparison](/blog/is-baby-sleep-improving-compare-weeks-not-nights.html). For the evening decision, the [Tonight Sleep Story](/blog/how-obubba-builds-tonight-for-baby.html) adds a separate live and weekly layer. And when the raw total matters, start with [how much your baby actually slept last night](/blog/how-much-baby-actually-slept-last-night.html).

## A gentle day after a broken night

“Catch-up, not catch-up by force” is the best sentence in this feature. Sleep cannot reliably be commanded, and an exhausted family does not need a recovery project.

A practical response is smaller:

1. **Keep ordinary nap opportunities available.** Watch the baby as well as the forecast; offer a calm chance to sleep without turning every missed nap into a crisis.
2. **Protect feeding and comfort.** A rough night is not evidence that hunger or distress should be ignored. Feed responsively and follow any individual clinical plan.
3. **Reduce avoidable stimulation.** A familiar wind-down, lower light and quiet interaction can make the next sleep easier to approach.
4. **Share the morning load.** If another adult can take the baby while the night carer rests, that is a meaningful intervention too.
5. **Change one thing at most.** When illness, travel or teething is active, steadiness may be the experiment.

NHS guidance acknowledges that broken sleep after a baby is exhausting and recommends accepting help and resting when possible. The parent’s recovery belongs in the plan, even though the current card does not yet ask about it.

## When to stop reading the sleep pattern and check the baby

A sleep app should never turn unusual drowsiness into a reassuring “long stretch”. Seek urgent medical help if a baby is hard to wake, has difficulty breathing, looks blue, pale, blotchy or unusually ashen, is not feeding normally, or has markedly drier nappies. Trust your judgment when something feels wrong.

For sleep itself, follow safer-sleep guidance every time: place the baby on their back in a clear, flat, separate sleep space with a firm mattress. If feeding or comforting in bed, put the baby back in their cot before you go to sleep. No briefing, bedtime forecast or difficult night changes those boundaries.

## How OBubba could make the briefing harder to replace

The feature already solves a real problem: it gives a tired parent a coherent starting point before asking them to do more work. Five changes would make that trust much stronger:

1. **Show evidence chips.** “Completed night · 1 logged wake · age-led bedtime” would reveal the foundation without adding a paragraph.
2. **Make the bedtime logic match the advice.** Apply a bounded, visible recovery adjustment—or stop implying that the displayed time moved.
3. **Label it “one-night snapshot”.** That would keep “settled” and “routine worked” in proportion.
4. **Include the parent.** A small “How are you functioning?” check could route to rest, sharing care or support instead of another baby optimisation.
5. **Let families keep it.** The card disappears once Coach conversation begins. A saved/shareable morning note would help partners and grandparents follow the same gentle plan.

This is the route to becoming the app parents keep: not more confident predictions, but less mental load, honest evidence and a plan that respects both the baby and the adult holding the day together.

**[Open OBubba and build this morning’s calm plan →](/app.html)** — keep sleep, feeds, nappies, first foods, medicines and disruptions in one shared family record, then let Coach return the smallest useful next step.

## Frequently asked questions

### Does the Good morning briefing appear all day?

No. The current Flutter engine returns it from 5am until before noon in the device’s local time. It appears on a fresh Bubba Coach surface and is not shown once that Coach conversation already has turns.

### Why did OBubba not say my baby slept through?

The app needs a completed bedtime-to-morning record before using its night labels. An open or half-logged night should not be treated as uninterrupted sleep.

### What does “settled night” mean?

In this briefing it means one or two logged wakes. It does not account for wake duration, feeding, illness or how difficult the night felt.

### Does a broken night automatically make bedtime earlier?

Not in the current morning-briefing calculation. Three or more wakes trigger earlier-bedtime advice, but the displayed time is calculated separately from today’s entries and corrected age.

### Is the briefing available on the free plan?

The current Bubba Coach surface is a premium feature. Free or expired access sees the premium lock rather than the briefing.

### Does OBubba diagnose sleep regression or teething?

No. A recent disruption can change the highlighted suggestion, but the app cannot establish why a baby woke or diagnose illness, pain or a developmental phase.

## Sources and further reading

- [NHS: Helping your baby to sleep](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/)
- [NHS Best Start in Life: Helping your baby sleep](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/helping-your-baby-sleep/)
- [NHS: Sleep and tiredness after having a baby](https://www.nhs.uk/baby/support-and-services/sleep-and-tiredness-after-having-a-baby/)
- [NHS: Is your baby or toddler seriously ill?](https://www.nhs.uk/baby/health/is-your-baby-or-toddler-seriously-ill/)
- [NHS Best Start in Life: Safer sleep advice for babies](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/)
