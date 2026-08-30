---
title: "What Happens When You Tap ‘I Need Help’ in OBubba?"
slug: what-happens-tap-i-need-help-obubba
description: "OBubba’s ‘I need help’ mood button is a private pause, not an SOS. See exactly what it does, what it saves and how to reach real support."
date: 2027-03-01
updated: 2027-03-01
author: OBubba
tags: OBubba Parent Room, I need help button, parent wellbeing app, postnatal mental health support, new parent overwhelmed, private mood check, EPDS app, baby tracker for parents
heroImage: /obubba-i-need-help-parent-room.jpg
---

If you tap **“I need help”** in OBubba’s Parent Room, the current Flutter app highlights that feeling, shows a kind response and points you towards a slow breath and the **“You’re not alone”** support section further down the page.

It does **not** call anyone, send a message, alert a clinician, notify a partner or save that quick choice to your wellbeing history.

That distinction matters. “I need help” is a private way to admit how this moment feels. It is not an emergency button, and it should never be mistaken for one.

> **If you or somebody else may be in danger, call 999 or go to A&E now. In England, if you need urgent mental-health help but it is not an emergency, use NHS 111 online or call 111 and select the mental-health option. Do not wait for an app to respond.**

## The exact response you get

Open **Care → Parent Room** and find **“How are you today?”** The current app offers six choices: Great, Okay, Struggling, Heavy, Need support and I need help.

When any of the four harder feelings is selected, OBubba says:

> Hard days are real and they’re not a failing. Try a slow breath below, and if this is most days, please reach out. Support is in “You’re not alone”.

The selected face becomes brighter; the other faces soften. There is no score and no interrogation. The purpose is to lower the first barrier: naming the feeling.

![The real OBubba Flutter Parent Room begins with a time-aware welcome, a kind word, recovery support and a private daily feeling check.](/obubba-parent-room-app.jpg "Current OBubba Flutter Parent Room with fictional example profile data. The quick mood row is a screen-local pause, not an emergency alert or clinical record.")

## What is private—and what is actually saved?

The quick “How are you today?” selection lives only in the Parent Room screen’s current state. The Flutter code does not write it to the baby’s timeline, the shared family record or the private EPDS score history.

That means:

- a co-parent does not receive a notification because you tapped it
- a health professional cannot see it
- OBubba cannot later prove that you were safe or unsafe
- the app cannot follow up if you close it
- tapping a brighter face does not cancel a need for help

Privacy can make honesty easier. But privacy also means the parent must deliberately move from the app to a person when support is needed.

## Parent Room has three different doors

The easiest way to understand the design is to separate **pause**, **check** and **connect**. They are related, but they are not interchangeable.

![A three-door map of OBubba Parent Room: the screen-local quick mood, the private completed EPDS check and real-world human support.](/obubba-parent-room-three-doors.svg "The app offers three levels of support with different privacy and action boundaries. Only a real person or emergency service can provide real-world help.")

### Door 1: pause in this moment

Use the quick mood row when your thoughts are moving faster than your words. If “I need help” is the most accurate label, choose it. Then use one small body-based tool:

- the guided **4 seconds in, 4 hold, 6 out** breath
- **5–4–3–2–1 grounding** through the senses
- a **one-minute quiet pause**
- the four-step **Unclench** reset for jaw, shoulders, hands and breath

These tools may help create enough space for the next decision. They do not diagnose a condition, make an unsafe situation safe or replace another adult taking over.

### Door 2: check the past seven days

The separate **“How are YOU doing?”** card opens a private, two-minute EPDS wellbeing check. It asks ten questions one at a time about the previous week.

This is a recognised screen, not a diagnosis. In OBubba’s implementation:

- an unanswered question cannot silently count as the most reassuring answer
- the result appears only after all ten answers are complete
- completion time and total score are saved to an on-device wellbeing history
- the ten individual answers are not added to the baby’s shared care timeline
- any non-zero answer to the self-harm question opens the urgent support route, even if the total score is otherwise low
- a concerning completed result can show region-correct, tap-to-call or tap-to-text support cards

![The real OBubba Flutter EPDS check shows one question at a time, a ten-step progress path and a plain privacy boundary.](/obubba-parent-wellbeing-checkin-app.jpg "OBubba describes the EPDS as a screening tool rather than a diagnosis and saves a score only after the check is completed.")

Opening the check and backing out does not mark it complete. That prevents an unfinished screen from being treated as reassurance.

### Door 3: connect to a human

The **“You’re not alone”** section in Parent Room displays support details that change with the app’s region. For a UK parent, that includes perinatal support, Samaritans, a crisis text route, a GP or health visitor and urgent services. Other supported regions receive their own local directory rather than UK numbers that may not work.

The directory on the main Parent Room is information to act on; it does not make the call for you. After a concerning completed EPDS result, the app’s dedicated contact cards can launch a phone call or text where a number is available.

That is the moment an app must hand over. A breathing animation can support a pause. A questionnaire can surface a pattern. **Only another person can listen, assess risk, share the care and organise treatment or emergency help.**

## Which door should I use right now?

### “I am flooded, but everybody is safe”

Choose the quick feeling that fits. Put both feet on the floor. Try one slow 4–4–6 breath. Then send a specific message to somebody you trust:

> “I’m overloaded and need ten minutes off baby duty. Can you take over now?”

If intense crying is part of the moment, place the baby safely on their back in a clear cot before stepping away briefly. Never shake a baby.

### “This has been most days”

Use the full check if you want help putting the week into words, but do not make the score a permission slip. NHS guidance says to speak to a GP, midwife or health visitor if you think you may have postnatal depression; you do not need every symptom before asking.

You could say:

> “I don’t feel like myself. I’ve been struggling to cope most days and I need to talk about my mental health after having a baby.”

### “I need somebody now”

Skip the self-guided tools and contact a person. In the UK and Ireland, Samaritans can be called free on **116 123**, day or night, for somebody to listen. If you are in England and need urgent mental-health help but nobody is in immediate danger, call **111** and select the mental-health option.

### “Someone may be in immediate danger”

Call **999** or go to **A&E now**. Sudden confusion, hallucinations, unusual fixed beliefs, extreme agitation, a very high or rapidly changing mood, or being unable to sleep despite having the chance can be signs of postpartum psychosis. The NHS describes this as a medical emergency and advises an urgent same-day assessment.

Do not spend time completing a questionnaire first.

## Why put parent support inside a baby tracker?

Feeds, naps, nappies and night wakes are not separate from the person recording them. A difficult night can leave a parent trying to make safety decisions with an exhausted brain. A baby-care app that only asks for more data can add to that load.

OBubba’s current Flutter app takes a different approach:

- Parent Room lives inside **Care**, not buried in account settings
- the greeting changes with the time of day, including the hard evening and late-night hours
- weekly “wins” appear only when real family logs support them
- several fully measured rough nights can prompt a gentle parent check-in
- half-logged nights are not treated as a crisis
- a recently completed wellbeing check suppresses repeat nudging for several days
- parent-distress safety routes are authored and tested rather than handed to a generative reply

None of that allows OBubba to infer a diagnosis from baby sleep. It is a bridge from “the nights have been hard” to the question many trackers forget: **how are you?**

## A better five-minute support plan

Do this when things are relatively calm, not only at breaking point:

1. Open Parent Room once so you know where the breathing tool and support directory live.
2. Save one trusted person as a favourite contact.
3. Agree on a phrase that means immediate handover, with no debate: “I need you now.”
4. Write down your GP, midwife or health-visiting contact.
5. Decide who will call for urgent help if the struggling parent cannot.

The app can hold the map. Your plan supplies the people.

## Frequently asked questions

### Does tapping “I need help” alert my partner?

No. The quick mood choice is screen-local. It does not notify a partner, carer, clinician or emergency service.

### Is “I need help” saved in my baby’s history?

No. It is not written to the baby’s shared care timeline or the private EPDS score history. The separate EPDS flow saves a completion time and total score only when all ten questions are completed.

### Will OBubba call me or check that I am safe?

No. OBubba cannot monitor the room, contact you after the app closes or confirm anybody’s safety. Use real-world support whenever you need it.

### Is the two-minute wellbeing check a diagnosis?

No. It is the EPDS screening tool. A result can help begin a conversation, but diagnosis and care require a health professional. A low score should never overrule your own concern.

### Can my co-parent use Parent Room too?

Yes. The quiet reset tools and quick mood check can help any parent or carer. Postnatal depression can also affect fathers and partners, although some maternal recovery and EPDS wording is specific to the person who gave birth.

**[Try OBubba free →](/app.html)** — one place for sleep, feeds, nappies, weaning, growth and the wellbeing of the person doing the caring.

## Reliable UK support

- [NHS: urgent mental-health support](https://www.nhs.uk/every-mind-matters/urgent-support/)
- [NHS: postnatal depression](https://www.nhs.uk/mental-health/conditions/postnatal-depression/)
- [NHS: postpartum psychosis](https://www.nhs.uk/mental-health/conditions/post-partum-psychosis/)
- [Samaritans: contact a Samaritan](https://www.samaritans.org/how-we-can-help/contact-samaritan/)

*This article gives general information for UK families. OBubba does not diagnose mental-health conditions, assess immediate risk, monitor safety or contact help on your behalf. If you or somebody else may be in danger, call 999 or go to A&E now.*
