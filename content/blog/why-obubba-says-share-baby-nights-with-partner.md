---
title: "Why Does OBubba Say ‘Share Maya’s Nights With Your Partner’?"
slug: why-obubba-says-share-baby-nights-with-partner
description: "Why OBubba surfaces its Family Sharing prompt after three complete nights, what a complete night means, and what live partner sync can—and cannot—share."
date: 2027-01-29
updated: 2027-01-29
author: OBubba
tags: share baby nights with partner, OBubba Family Sharing, baby tracker for two parents, shared baby sleep tracker, partner baby tracker app, co-parent live sync, three nights logged, baby night shift handover, share baby tracker code, per-child family sharing, avoid duplicate baby logs, parenting mental load app
heroImage: /obubba-share-nights-with-partner.jpg
---

You have logged three broken nights. You can now remember roughly when the baby went down, who fed at 2am and whether the 5am stir became morning. Then OBubba says:

**“Share Maya’s nights with your partner.”**

Did the app detect that one person is doing every wake? Has it measured an unfair division of care? Does tapping the card invite somebody automatically?

No. We traced the current Flutter partner-invite detector, its caller, the insight dialog, the live Family Sharing roster and the code-rotation path. The card has a much narrower trigger: **at least three of the last 14 reconstructed nights contain both a bedtime and a morning wake.**

That threshold means the record has become useful enough to share. It does not prove that you have a partner, that you are logging alone or that another trusted adult is absent.

The feature behind the prompt is genuinely useful: two phones can read and add to the same baby’s live timeline, access is limited to that child, the owner can see a participant roster and the invite can be replaced when access should end. But the current prompt needs a more honest connection to that feature.

## The short answer

| Question | Current Flutter behaviour |
|---|---|
| When can the prompt appear? | At **3 complete nights** within the latest 14-night window |
| What is a complete night here? | The night analyser reconstructed both a **bedtime** and a **morning wake** |
| Must the nights be consecutive? | No |
| Does it check whether someone is already connected? | No |
| Does it know who handled each wake? | No |
| Does its button open Family Sharing? | No; **“Got it”** acknowledges and closes the insight |
| Can it be hidden? | “Got it” uses a stable per-child dismissal; the separate snooze hides it for one week |
| What can Family Sharing do? | Give another trusted person live read-and-write access to this baby’s record |

![The exact three-complete-night gate behind OBubba’s partner-sharing prompt, followed by the separate Family Sharing access decision.](/obubba-partner-invite-three-night-logic.svg "The insight reads night completeness, not relationship status or who performed the care. Family Sharing is a separate, deliberate access action.")

The useful translation is:

> “You now have a night record worth sharing. If another trusted person regularly cares for this baby, one live timeline may reduce handover work.”

It is not:

> “OBubba has discovered that your partner is not helping.”

## Why the app waits for three complete nights

The detector is intentionally delayed. At zero, one or two complete nights it returns nothing. From the third complete night onward, it creates a low-urgency routine insight.

That delay is a product decision, not sleep science. The idea is to let a parent experience the value of the night record before asking them to bring somebody else into it.

The caller looks across the baby’s **14 most recent nights**. Each night passes through the normal night analyser. It counts only when that analyser can identify both ends:

- a bedtime
- a morning wake

A night with six carefully logged wakes but no morning wake may not count. A night with bedtime and morning wake can count even if the middle was sparsely logged. The threshold measures whether OBubba can frame the night, not whether the diary is perfect.

The three nights do not need to be consecutive, and they are not necessarily the three nights immediately before the prompt. Three usable nights scattered across the 14-night window are enough.

## What the detector does not read

The function receives only two values: the baby’s name and the number of complete nights. It does not receive:

- the Family Sharing participant list
- the number of adults in the household
- who logged each entry
- who physically settled or fed the baby
- whether care already happens in shifts
- relationship status, family structure or safety context

This matters because the user-facing body begins with **“Logging on your own?”** That is a question, not a finding. A partner may already be connected. A grandparent may be covering mornings without using the app. A solo parent may not have anybody appropriate to invite. A separated co-parent may need strictly bounded access—or no shared access at all.

The code comments describe the prompt as a growth and retention tool. That is legitimate product intent: a fuller shared record can make the app more useful and another connected carer can become an active user. But acquisition intent should never be disguised as an interpersonal diagnosis.

## A small evidence-label bug

The insight records the number of complete nights as its sample size. In the generic insight dialog, however, no unit is supplied for this particular card. The shared formatter therefore falls back to **days**.

At the threshold, a parent can see an evidence footer equivalent to **“early read · 3 days”**, even though the gate counted three complete nights.

That does not change when the card appears, but it weakens trust. The footer should say **“early read · 3 nights”**. A transparent app should use the same unit in its calculation and its explanation.

## “Got it” does not invite anyone

The card explains that Family Sharing lives under Account, but the current insight has no primary navigation action. The gold button says **“Got it”**. Pressing it marks the stable `partnerinvite` key as seen for this child and closes the dialog.

Because that dismissal key does not include a date or the night count, the same prompt should not return for that baby after acknowledgement—even when ten, 30 or 90 nights are later available.

There is also a generic **“Don’t show this for a week”** option. That snoozes the card rather than permanently acknowledging it. If the three-night condition is still true after the snooze expires, it can appear again.

The better interaction would be two explicit choices:

- **Open Family Sharing**
- **Not for this family**

The first should navigate directly to the access panel. The second should dismiss the prompt durably without requiring a parent to explain their family structure.

## What Family Sharing actually does

Family Sharing is not a forwarded screenshot and not a second diary. The owner reveals a sync code for one baby and sends it privately to a trusted person. On the other phone, that person chooses **“Connect — live sync”**.

Both devices then work from the same changing child record. A feed, nappy, sleep or note added on one phone can appear on the other instead of being retyped from messages in the morning.

![The real OBubba connection screen explains that Connect creates shared live data while importing creates a separate copy.](/obubba-connect-live-family-sync.jpg "The current receiving screen clearly distinguishes live connection from a private imported snapshot.")

That distinction matters:

| Choice | Result |
|---|---|
| **Connect — live sync** | Both phones continue reading and writing the same baby’s record |
| **Import a separate copy** | This phone receives its own snapshot; later edits do not remain live-linked |

If the goal is a two-person night handover, choose live sync. Two disconnected copies recreate the exact reconciliation work the feature is meant to remove.

## Access is per child

The current Family Sharing card is scoped to the active baby. Its interface explicitly says that somebody using Maya’s code can see and add logs for Maya only. They do not automatically receive another child from the owner’s account.

That is especially useful for:

- co-parents who share one child but have other children
- blended families
- a nanny or regular relative responsible for one baby
- twins whose access needs differ

The owner’s screen streams the participant roster directly from the shared record, so it can update as soon as somebody joins. It shows other participants, their display name when available and a joined date.

There is an important boundary: a person with the sync code can join that child’s logs. Treat the code like a private access credential. Send it directly, not in a public group, social post or image that may be forwarded beyond the intended person.

## How to connect another trusted adult

On the phone that already has the baby:

1. Open **Account → Family Sharing**.
2. Open **Invite someone**.
3. Check that you are sharing the intended baby.
4. Send the displayed sync code privately.

On the receiving phone:

1. Open the connect/import flow.
2. Enter the child’s sync code.
3. Choose **Connect — live sync**, not a separate copy.
4. Confirm that both phones show the same recent entry before relying on it overnight.

Do this in daylight, not for the first time at 3am. Log one harmless test note, check it appears on both phones, then remove it if you do not need it.

The child sync code is not the same thing as a broader family recovery code. Use the invitation shown inside the child’s Family Sharing panel.

## A shared timeline is not a care rota

Live data reduces memory work. It does not decide who is on duty.

Before a night shift, agree three things out loud:

1. **Who is responsible now?** One adult needs a genuine rest window, not a promise that they will still answer every cry.
2. **Who closes the timer?** Normally, the adult who ends the sleep or feed should update it.
3. **What requires waking the other person?** Feeding-plan limits, medicine, breathing concerns, fever, unusual responsiveness and anything that feels wrong belong in the human handover.

For a morning handover, the useful summary is short:

- last effective feed and anything unusual
- last nappy when output matters
- current sleep state and open timer
- medicine name, dose and time if applicable
- what soothed the baby
- any safety or health concern

Do not use entry counts to score contribution. The person who logged a feed may not be the person who washed the bottle, soothed for 40 minutes or protected the other parent’s sleep. OBubba’s shared child record does not measure invisible care fairly.

## Sharing nights can protect rest—but not by delaying the baby

The NHS says looking after a baby can be extremely tiring, especially while the baby wakes several times a night. It suggests sharing nights where possible: a partner may share formula feeds, help with nappies or take early-morning care so a breastfeeding parent can return to sleep.

The shift should change **which adult responds**, not whether the baby receives responsive care. Follow hunger cues and any individual feeding or neonatal plan. Shared tracking is not permission to stretch feeds, chase a zero-wake target or leave a distressed baby waiting for the “correct” parent.

Exhaustion also has a safer-sleep dimension. The Lullaby Trust advises never falling asleep with a baby on a sofa or armchair and continuing to use a clear, flat, separate sleep space. If one adult is at risk of nodding off, the useful action is a safer handover—not another perfectly completed log.

## When not to share

You do not owe an app another user.

Do not share the code merely because a card appeared. Family Sharing is appropriate only when the person is trusted and ongoing access feels safe. It may be wrong when:

- you are a solo parent and do not want the prompt
- a relationship is controlling or abusive
- a separated co-parent should receive information through another agreed route
- a babysitter needs a one-off handover rather than permanent live access
- a relative wants visibility but does not need to add or edit logs

The NHS notes that abuse can begin or worsen during pregnancy or after birth. If shared technology could be monitored, pressured or used to control you, prioritise safety and seek specialist support using a safe device where possible.

For one-off care, OBubba’s Bubba Care handover can be more proportionate than permanent Family Sharing. The right question is not “How many people can we connect?” It is “What is the smallest access surface this care job needs?”

## How to remove access

The current owner control is **“Replace code & disconnect everyone.”** It is intentionally presented as a cautious action because it is destructive.

It does not remove one selected participant. It creates a new child code, moves the current baby record to it, retires the old shared document and clears the old participant access. The owner can then invite only the people who should have the new code.

Use this when the old code was sent too widely or somebody should no longer have access. Do not use it just to re-send an invitation; the existing code can be shared again with an intended trusted person.

After rotation:

- verify the owner still sees the full recent history
- check older archived days if they matter
- confirm unwanted devices no longer receive live changes
- privately send the new code only to continuing participants

The app’s current repository makes a substantial effort to copy recent and archived data and scrub sensitive baby data from the retired document. Code rotation can still involve network operations, so verify the result rather than assuming a button label completed every step.

## What this feature should improve next

The underlying Family Sharing surface is stronger than the prompt that advertises it. Four changes would close the gap:

1. **Read the live roster.** Do not ask “Logging on your own?” when another participant is already connected.
2. **Use an inclusive title.** “Share Maya’s care” or “Invite another trusted carer” fits more families than assuming a partner.
3. **Add a real action.** “Open Family Sharing” should navigate to the per-child access panel.
4. **Fix the evidence unit.** Three complete nights should display as nights, not days.

A fifth improvement would let an owner revoke one participant without rotating everybody. Until then, the interface should continue stating clearly that replacement disconnects all current access.

This is how OBubba can become the app families keep: not by treating every connection as growth, but by making shared care easier **without blurring consent, access or the limits of the data**.

**[Try OBubba’s shared baby timeline →](/app.html)** — keep sleep, feeds, nappies, medicines, weaning and handovers in one per-child record, so the next adult starts with context instead of questions.

## Frequently asked questions

### Why did the prompt appear after three nights?

The current detector counts complete nights in the latest 14-night window. A night counts when the analyser has both bedtime and morning wake. Three qualifying nights unlock the low-urgency invite.

### Does OBubba know that I am logging alone?

No. This detector does not read the Family Sharing roster or identify who performed care. “Logging on your own?” is prompt wording, not a finding.

### Why does the card say “3 days”?

The insight stores a count of complete nights, but the generic evidence formatter defaults to days when this card does not specify a unit. The product should label it as nights.

### Will pressing “Got it” connect my partner?

No. It acknowledges the insight and closes it. Open Account → Family Sharing separately to send a child sync code.

### Can my partner see every baby on my account?

Not from one child’s code. The current sharing model is per child; a person joining Maya’s code receives access to Maya’s shared record.

### Can I remove one person?

The current owner action replaces the code and disconnects everyone using the old one. You then re-invite only the people who should retain access.

### Is Family Sharing suitable for a one-night babysitter?

Usually not. Permanent live read-and-write access may be broader than necessary. Use a concise handover or a more limited Bubba Care session when that fits the job.

## Reliable UK sources

- [NHS: Sleep and tiredness after having a baby](https://www.nhs.uk/baby/support-and-services/sleep-and-tiredness-after-having-a-baby/)
- [NHS: Relationships after having a baby](https://www.nhs.uk/baby/support-and-services/relationships-after-having-a-baby/)
- [NHS: Helping your baby to sleep](https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/)
- [The Lullaby Trust: Sleep deprivation](https://www.lullabytrust.org.uk/baby-safety/being-a-parent-or-caregiver/sleep-deprivation/)
- [The Lullaby Trust: Keeping a clear cot](https://www.lullabytrust.org.uk/baby-safety/safer-sleep-information/keeping-a-clear-cot/)

*This article provides general information for UK families. OBubba cannot determine who performed care, assess relationship safety, supervise a baby, guarantee that a sync operation completed or replace responsive feeding, safer-sleep practice or individual advice from your midwife, health visitor, GP, feeding team, paediatrician or neonatal service.*
