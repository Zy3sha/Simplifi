---
title: "Why Does OBubba’s ‘Asleep For’ Timer Show Less Than Time Since Bedtime?"
slug: why-obubba-asleep-for-timer-less-than-bedtime
description: "OBubba’s live night timer subtracts recorded awake periods. See exactly how Pause, Resume and untimed wakes change ‘asleep for’ without changing bedtime."
date: 2027-05-02
updated: 2027-05-02
author: OBubba
tags: baby sleep timer night wakes, asleep time vs bedtime, OBubba sleep timer, baby actual sleep time, pause baby sleep timer, baby awake at night tracker, night wake duration app, baby time in bed vs sleep, baby sleep tracker UK, live baby sleep timer, track baby resettling, night sleep calculation
heroImage: /obubba-asleep-for-timer-night-wakes.jpg
---

You started OBubba’s night timer at 7:30pm. It is now midnight. The ordinary clock says four and a half hours have passed—but OBubba says your baby has been asleep for four hours.

That can be correct.

**OBubba’s current Flutter app uses “asleep for” to mean elapsed time since the logged sleep start, minus night-wake pauses whose awake time is known.** Bedtime remains 7:30pm. A recorded 30-minute waking stays inside the same physical night, but it is not counted as sleep.

The two numbers answer different questions:

- **Time since bedtime:** how long the overnight period has been open.
- **Asleep for:** how much of that period OBubba currently has evidence was sleep.

If the figures differ by the length of a wake you paused and resumed, the timer is doing useful subtraction—not losing part of the night.

## The 20-second calculation

Imagine this sequence:

| Event | Clock time | Running sleep total |
|---|---:|---:|
| Night sleep starts | 7:30pm | 0m |
| Baby wakes; parent taps Pause | 10:15pm | 2h 45m |
| Baby returns to sleep; parent taps Resume | 10:45pm | still 2h 45m |
| Parent checks at midnight | 12:00am | **4h 00m** |

The arithmetic is:

**4h 30m since bedtime − 30m known awake = 4h asleep**

![A worked OBubba night-timer example: 7:30pm bedtime to midnight is four and a half hours, but a recorded 30-minute night wake leaves four hours of actual logged sleep.](/obubba-asleep-for-timer-calculation.svg "The bedtime anchor stays 7:30pm. OBubba subtracts the known 10:15–10:45pm awake interval from the live sleep total.")

This is not a clinical measurement of sleep stages. It is transparent arithmetic over the family’s record. Brief arousals nobody observed will not be deducted, and an untimed wake cannot contribute exact awake minutes.

## Why the timer changed now

The live clock previously counted plain wall time from bedtime even after a parent had logged a settled night wake. Final sleep statistics could subtract the wake correctly, while the big “asleep for” number kept advancing as though baby had slept through it.

That created an obvious trust problem. A parent could pause for 30 minutes, resume, then see the live timer disagree with the night total later.

The current Flutter implementation now gives the clock one adjusted running anchor:

1. find the original sleep start;
2. total the recorded night-wake pauses;
3. move the internal count-up anchor later by that total;
4. calculate the displayed elapsed time from the adjusted anchor.

The original bedtime entry is not rewritten. This is a display calculation, so OBubba can preserve **since 7:30pm** while showing **4h asleep**.

The centre clock and the strip beneath it receive the same adjusted start. They should therefore stay in lockstep instead of performing two subtly different calculations.

## What happens when you tap Pause

During a live night sleep, the centre control says **pause**. Tapping it begins a night-wake record marked as still being settled.

![The genuine OBubba Flutter night clock, showing a running night sleep, the “Oliver is asleep” elapsed counter and the centre Pause control.](/obubba-night-wake-pause-app.jpg "The real Flutter Track screen using fictional review data. Pause begins a night-wake interval without ending the full bedtime-to-morning record.")

While that pause is open:

- the bedtime sleep remains open;
- the clock changes from an asleep state to a woke/settling state;
- the elapsed-sleep display stops growing;
- the awake interval grows minute by minute;
- the next action becomes Resume rather than starting a second night.

The wake does not yet have a stored final duration because baby is still awake. The helper therefore calculates the live gap from the pause time to now. If the pause began at 2:00am, it contributes 10 minutes at 2:10 and 60 minutes at 3:00. That moving subtraction is what holds the sleep total steady.

This was an important edge case in the actual source. Counting only completed wakes would still let the timer run forward during the very interval the parent had explicitly paused.

## What happens when you tap Resume

Resume closes the open waking and returns to the same night sleep. The current flow can also ask how baby was resettled and, when feeding was selected, create a linked night-feed record without turning one waking into two.

For a plausible measured interval, OBubba stores the wake duration. The live timer then keeps subtracting that fixed number after sleep resumes.

Example:

- asleep since 7:30pm;
- paused 1:55–2:20am;
- resumed with a recorded 25-minute wake;
- checked at 3:00am.

The wall span is 7h 30m. The live “asleep for” result is 7h 05m.

The night remains one night. Pausing does not chop it into two unrelated sleeps; it adds an awake interval inside the outer bedtime-to-morning span.

## Why “since 7:30pm” can stay on screen

A timer strip may simultaneously communicate:

**Night sleep · 4h · since 7:30pm**

That is not necessarily contradictory:

- “since 7:30pm” names the original event anchor;
- “4h” names the known sleep accumulated inside it.

The current interface relies on the parent understanding that distinction. A clearer version would say:

**4h asleep · night started 7:30pm · 30m awake**

That equation would turn a potential support question into immediate proof of how the result was built.

## Which wakes are subtracted?

The current live helper counts two forms of evidence.

### A completed, timed night wake

The entry is a night wake, is no longer pending settlement and has a positive recorded duration. That duration is deducted exactly once.

### A night wake that is open right now

The entry is marked as pending settlement and has a start time. OBubba calculates its live elapsed duration so sleep time does not advance while baby is known to be awake.

Daytime wakes do not enter this total. A pause attached to a nap has its own nap-stir handling. The helper is deliberately about night sleep.

## Which wakes are not subtracted?

### An untimed wake

If you know baby woke but do not know for how long, the wake can still count as a waking. OBubba does not invent a default five, twenty or forty minutes to subtract.

The result may therefore overestimate actual sleep, but the uncertainty stays visible in the underlying record rather than being replaced by false precision.

### A plain sound or movement that was not logged

The app cannot detect an unseen arousal. It is not reading brain activity, movement or breathing. It only knows the family’s timer and wake entries.

### An implausibly old open pause

For the live deduction helper, an open interval of ten hours or more is treated as stale rather than trusted as a real settling session. This prevents a forgotten Pause from subtracting most of a day.

### A resumed gap longer than 90 minutes

The resume flow has a stricter uncertainty rule. If the pause-to-resume gap is longer than 90 minutes, the current app does not store that whole gap as a measured `wakeDuration`.

That protects families who paused, fell asleep and remembered to resume much later. Otherwise an accidental two-hour delay could become a confident “two hours awake” fact and halve the night’s sleep total.

The trade-off is important: a genuine two-hour split night also loses its precise awake-minutes deduction unless it was represented through other accurate sleep arcs. After Resume, the live clock may therefore count more sleep than truly occurred. The app should label that wake **duration unknown** and invite a quick correction rather than silently dropping the duration.

## How the app avoids subtracting one wake twice

Midnight creates a storage problem. A 2am wake belongs to the night that began yesterday, but it is also stored in today’s calendar bucket.

The live helper reads both:

- today’s entries; and
- the reconstructed physical night.

That is necessary because a pre-midnight pause may exist only in one source while an after-midnight pause appears in the other. But reading both can produce the same wake twice.

OBubba therefore de-duplicates by entry ID. For older or imported records without an ID, it falls back to matching the wake time and duration. A single 30-minute waking should subtract 30 minutes—not 60.

The code also handles a pause that crosses midnight. A wake from 11:30pm to 12:15am is 45 minutes, not a negative number or almost 24 hours.

## What if the wake is longer than the time since bedtime?

Corrupt, misdated or stale records can create impossible arithmetic. The current display clamps its adjusted start so it cannot move later than now. The live counter bottoms out at zero rather than showing negative sleep.

That is a crash-and-nonsense guard, not a repair of the underlying log. If the number looks impossible, open the timeline and correct the wake or sleep start you actually know.

## Live elapsed time and final night sleep should agree—but may not

They use the same principle: outer sleep time minus known awake time. They do not use the exact same presentation path.

The live clock asks, “How much sleep has accumulated so far?” Final reports reconstruct a completed night across bedtime, after-midnight entries and morning wake. They can merge overlapping sleep arcs and subtract timed wakes inside the relevant span.

The two can differ when:

- the wake was never resumed or ended;
- a duration was unknown;
- a pause was abandoned long enough to trigger a stale guard;
- the sleep start or morning wake was edited later;
- duplicate or imported entries need reconstruction;
- a very long pause was deliberately kept untimed;
- partner sync had not yet brought the latest change to this device.

Treat the live number as the best current read from the visible record, not an irreversible total. The completed night should be reviewed after the real morning wake.

For the full morning calculation, read [How much did my baby actually sleep last night?](/blog/how-much-baby-actually-slept-last-night.html).

## A simple way to log a waking at 2am

1. **Pause when baby is meaningfully awake** and you are actively responding or observing a sustained waking.
2. **Do not pause for every grunt or wriggle.** Babies can move and make sounds in lighter sleep.
3. **Resume when sleep genuinely restarts.** Use the observable transition, not when the parent finally returns to bed.
4. **Record the feed or settling route if useful.** Keep it connected to the same waking.
5. **Correct the time later if necessary.** Honest approximation is better than leaving a known wrong interval.

The NHS says babies have individual waking and sleeping patterns, and night waking is normal—especially in the early months. Tracking should reduce arithmetic, not turn ordinary waking into a performance score.

## What OBubba should improve next

The new subtraction fixes the most important trust issue: the live timer no longer needs to count a known wake as sleep. The next version should make the evidence visible.

- Show **night span**, **known awake** and **asleep** as a three-line equation.
- Keep the frozen sleep total visible while the wake is open.
- Let parents tap the deducted minutes to see which wakes contributed.
- Mark untimed wakes separately from zero-minute wakes.
- Offer a correction when a pause exceeds the 90-minute certainty cap.
- Explain when a stale pause is ignored.
- Show last-sync time when another carer controls the timer.
- Keep the Lock Screen, widget, centre clock and bottom strip on one shared elapsed source.
- Add a final morning reconciliation explaining any difference from the last live value.
- Let Luna answer “Why is the timer lower?” with the exact bedtime and deducted wakes.

The best timer does not merely show a plausible number. It lets an exhausted parent verify the number in one glance.

## The honest verdict

If OBubba’s “asleep for” timer is lower than time since bedtime, first total the night wakes you paused and resumed. A matching difference is expected:

**elapsed night span − known awake intervals = live recorded sleep**

The bedtime anchor stays intact, the night remains one continuous record and the awake gaps remain visible instead of being counted as sleep.

The limitation is equally important. OBubba subtracts only what the record can support. An untimed, stale or deliberately untrusted long wake may remain outside the exact arithmetic. That is better than hidden invention, but the UI should say so.

**[Try OBubba free →](/baby-sleep-tracker.html)** — run one calm night timer, pause meaningful wakings and keep bedtime span, known awake time and actual logged sleep connected.

## Frequently asked questions

### Why is “asleep for” lower than “since bedtime”?

OBubba subtracts the duration of recorded night-wake pauses. “Since bedtime” preserves the original start; “asleep for” describes sleep accumulated inside that span.

### Does Pause end the night sleep?

No. It opens a night-wake interval inside the same bedtime record. Resume returns to that same night; Wake for the day closes it.

### Does the timer keep counting while I am settling my baby?

The current Flutter logic counts the open pause’s live duration and stops adding it to sleep. The screen changes to a woke/settling state until Resume.

### Why was my two-hour wake not fully deducted?

The current resume flow refuses to store a pause longer than 90 minutes as confidently measured awake time, because a forgotten Resume can look identical to a genuine long wake. Correct the record with the times you know.

### Are night feeds automatically deducted from sleep?

Not simply because a feed exists. A linked timed waking can contribute awake minutes; an untimed or dream feed does not receive an invented duration.

### Does this apply to naps?

This exact helper applies only to night sleep. Naps have separate stir/pause handling so a daytime event cannot become a night wake.

### Is the timer a medical measure of sleep?

No. It is a family-entered tracking estimate, not polysomnography, breathing monitoring or a safety device.

## Sources and safer-sleep note

- [NHS: Helping your baby to sleep](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/)
- [NHS Best Start in Life: Your baby’s sleep patterns](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/your-babys-sleep-patterns/)
- [NHS Best Start in Life: Safer sleep advice for babies](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/)

For the first six months, current NHS guidance says the safest place is a separate cot or Moses basket in the same room as you, with baby placed on their back. Use a firm, flat mattress and keep the sleep space clear. An app timer cannot tell whether a baby is breathing normally, comfortable or safe. Check the baby directly and seek urgent help for serious concerns.

*OBubba is a tracking and education tool, not medical advice, a baby monitor or a diagnostic sleep study.*
