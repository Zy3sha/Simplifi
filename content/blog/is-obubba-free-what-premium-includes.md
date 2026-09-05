---
title: "Is OBubba Free? What You Can Do Before Paying"
slug: is-obubba-free-what-premium-includes
description: "OBubba is free to download and core baby tracking stays free. See exactly what the current app includes, when the 14-day trial starts and what Premium unlocks."
date: 2027-05-12
updated: 2027-05-12
author: OBubba
tags: is OBubba free, OBubba Premium, OBubba price, free baby tracker app, baby sleep tracker free, baby feeding tracker free, OBubba free trial, baby tracker subscription, OBubba app review, baby app without subscription
heroImage: /obubba-free-vs-premium.jpg
---

Downloading a baby tracker should not begin with a puzzle: what works now, what disappears later, and will your family history be held behind a subscription?

Here is the straight answer.

**OBubba is free to download, and core tracking stays free.** You can record everyday care and use the basic app without paying. Premium is for the deeper layer: exact sleep timing, personalised plans and guidance, Luna, sleep coaching, selected deep-dives and extra recipe choice.

There are two unusually generous parts of the current Flutter app too:

- pregnancy and approximately the first two months after birth are automatically **on OBubba**, with Premium access during that early phase; and
- after that early window, a new eligible family gets a one-time **14-day Premium trial** rather than losing the trial while pregnancy or newborn access is already active.

That means you can learn whether the logging itself fits your hands before deciding whether the predictive layer earns a place in your budget.

![A parent checks a baby-care app during a quiet evening cuddle with an awake baby.](/obubba-free-vs-premium.jpg "The useful test is not whether a paywall looks persuasive. It is whether the free tracker reduces remembering, and whether Premium answers a question your family genuinely has.")

## What stays free in the current app

The paywall itself makes one promise in plain language: **“Core tracking always stays free.”** The reviewed Flutter routes support that promise.

### One baby’s everyday timeline

Free tracking includes the ordinary events parents reach for at 3am:

- breastfeeding, bottles, feeds and pumping
- naps, bedtime sleep, wakes and live timers
- wet and dirty nappies
- solids and notes
- medicine and temperature records
- activities and other care moments

You can add an event now or later, review the timeline, correct a mistake and delete an entry. An expired trial does not erase the history or stop the free logging controls from working.

The exact predicted countdown is a different layer. The code explicitly keeps **active timers, logging and the prediction engine** available while reserving the displayed next-nap or bedtime target for Premium.

### The practical Care library

Several useful Care tools open without a Premium check in the current build:

- Sound Machine
- Bedtime Stories
- Crying Helper
- Safe Sleep
- Breastfeeding guidance
- Reminders and appointments
- Parent Room
- basic Weaning & First Foods support
- Bubba Care handovers

The free weaning screen still offers a four-item **Try these next** rotation when age and history make it appropriate. From about the six-month readiness window, it also shows two personalised recipe ideas; Premium expands that weekly choice and opens the wider recipe layer.

Safety and wellbeing are not used as bait. The private postnatal wellbeing check can appear above the Track guidance lock, and the source comment is explicit: screening for postnatal depression must never sit behind Premium.

### Growth, development and the family record

The current Grow routes do not introduce a general Premium wall around growth, milestones, teeth, age-relevant activities or the memory book. Reports also open from Care without the shared paywall.

Family sharing and Bubba Care are present as ordinary routes in the reviewed Flutter build rather than being stopped by the same `isPremium` check used for sleep coaching. Store descriptions sometimes summarise “sharing” broadly under Premium, so the interface on your installed version is the final authority if that commercial boundary changes.

## What Premium unlocks

![The real OBubba Flutter Premium screen showing its four main benefit areas, three UK plan choices and the promise that core tracking stays free.](/obubba-premium-paywall-app.jpg "Current debug-harness capture with a fictional baby profile. StoreKit supplies live local prices in production; this review screen uses the app’s public UK preview prices.")

Premium is not “the same log without adverts”. It unlocks the interpretation and planning layer built on top of those logs.

| Premium area | What changes in the current Flutter app |
|---|---|
| Exact sleep timing | The clock can show the predicted next nap or bedtime target rather than only the free tracking state |
| Live readiness | The nap-and-feed readiness meter opens instead of showing its Premium explanation |
| Tomorrow’s plan | The Plan panel maps predicted naps, wind-down and bedtime; the evening can preview tomorrow |
| Guidance | The fuller Guidance panel, correlations and selected sleep or feeding deep-dives open |
| Tonight’s Story | The personalised evening summary opens from its free teaser banner |
| Luna | The conversational coach can answer from the baby’s real logged day |
| Sleep Consultant | A personalised 14-day sleep-plan flow becomes available |
| Night Weaning | The readiness-aware, seven-night plan opens when the family chooses that path |
| Weaning recipes | The weekly personalised recipe set expands beyond the two free suggestions |
| Premium on another baby | A baby can be added as Free from the Track baby switcher; deeper guidance on that baby needs its own valid Premium access |

The distinction matters. **Free remembers what happened. Premium spends more of the app’s work on what may help next.**

Neither tier observes the baby, measures sleep or diagnoses why a night was difficult. Premium reads parent-entered records and applies the app’s rules and pattern engines. A more detailed answer can still be uncertain when the history is sparse, unusual or wrong.

## How the free early phase actually works

The current entitlement code treats two situations as Premium-active even when no subscription has been purchased:

1. the active profile is still in pregnancy mode; or
2. the baby’s corrected age is below nine weeks.

Corrected age matters for a baby born early. The early phase follows the same fairer developmental clock used elsewhere in OBubba rather than simply counting from the calendar birth date.

This access is described inside the Account screen as **“Premium — on us”**. It is not a charge and it is not the same thing as restoring a purchase.

![A vertical map showing free core tracking, the pregnancy and early-newborn Premium gift, the deferred 14-day trial and the optional paid plans.](/obubba-free-premium-map.svg "Free core tracking is the permanent foundation. Early-phase access and the trial temporarily open the deeper Premium layer; buying remains a separate choice.")

The one-time 14-day trial is deliberately deferred while this early access is active. On an eligible launch after the early phase, the app checks the store and any previous trial record before starting it. If the store cannot confirm the state, the code defers rather than creating a fresh-looking trial that might later expire a returning subscriber incorrectly.

That is a small implementation detail with a humane outcome: installing during pregnancy should not silently consume a trial that ends before the baby arrives.

## How much does OBubba Premium cost?

The genuine Flutter paywall has three plan shapes: monthly, yearly and lifetime. Its UK review mode currently displays:

| Plan | UK review price | Billing note shown in app |
|---|---:|---|
| Monthly | £7.99 | billed monthly |
| Yearly | £79.99 | £6.67 a month |
| Lifetime | £129.99 | one payment |

These are the app’s current public preview values, not a promise that every storefront or future version has the same price. The production paywall reads the product and currency from Apple or Google. Check the confirmation sheet on your own device before buying; that is the price you are agreeing to.

The [App Store listing](https://apps.apple.com/app/id6760968757) currently labels OBubba **Free · In-App Purchases**. [Google Play](https://play.google.com/store/apps/details?id=com.obubba.app&referrer=utm_source%3Downed_search%26utm_medium%3Dseo%26utm_campaign%3Dfrom_bump_to_baby_auto%26utm_content%3Dis_obubba_free) likewise lists in-app purchases and describes free core tracking. Currency, tax and product availability can vary by country and platform.

Monthly and yearly subscriptions renew unless cancelled through the store. Lifetime is one payment. The paywall includes **Restore purchases**, Terms and Privacy links; restoring checks for an existing entitlement and does not create a new charge.

## A better way to decide whether Premium is worth it

Do not buy Premium because one night was awful. Use the trial to answer a question.

### If you mainly need shared memory

Stay with free tracking for a week. Ask:

- Can both carers answer when the last feed, nappy or sleep happened?
- Is correcting a forgotten timer easy enough?
- Does the timeline reduce repeated questions?
- Do you keep using it when the day becomes messy?

If the free record solves the problem, you do not need to invent a reason to upgrade.

### If timing is the hard part

Log representative morning wakes, naps, bedtime and meaningful night wakes before judging Premium. Then test whether the readiness meter and predicted target feel better than an age chart alone.

Follow the baby’s cues over the clock. A prediction should help you prepare; it should not keep an exhausted baby awake or postpone a needed feed.

### If you want help understanding rough nights

Try one repeated question:

> “What changed on the nights with more wakes?”

Compare Tonight’s Story, the Guidance panel, reports and Luna with the underlying log. A trustworthy answer should show its evidence, keep uncertainty visible and avoid pretending one correlation proves a cause.

### If you are considering sleep or night-weaning support

Open the Sleep Consultant or Night Weaning flow only when the baby’s age, feeding, growth and health make that conversation appropriate. Premium access is not readiness. Continue responsive feeding, use safer-sleep guidance and speak to a health professional when feeding, growth, illness or development is a concern.

## What happens when the trial ends?

The Premium surfaces return to their locked or teaser state. Core tracking remains available and the existing baby history is not supposed to become unusable.

You can continue to:

- add and review ordinary logs
- run the core timers
- keep each Free baby’s record
- use the free Care and Grow tools
- decide later whether the deeper layer is worth returning to

If you previously paid, use **Restore purchases** rather than buying again. If you cancel a subscription, the store normally leaves access active until the paid period ends; cancellation stops renewal rather than deleting the child history.

## The honest bottom line

OBubba is not “free” only until you have entered enough precious data to feel trapped. The current app keeps the basic job—remembering the baby day—available without payment.

Premium is most valuable when three things are true:

1. you are already logging enough real events to support personal patterns;
2. timing, planning or interpretation is the problem you want help with; and
3. the trial’s answers reduce decisions rather than adding another dashboard to check.

If that is not true yet, keep using the free tracker. The upgrade should earn its place.

**[Try OBubba free →](/app.html?utm_source=obubba_free_article&utm_medium=owned_search&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20270512_obubba_free)** — begin with one baby, one honest log and no obligation to master the whole app tonight.

## Quick answers

### Is OBubba free forever?

Core tracking stays free in the current app. Premium features require an active trial, early-phase entitlement, subscription, lifetime purchase or another valid grant.

### Does OBubba require a card for the free newborn period?

The pregnancy and under-nine-corrected-week access is an automatic app entitlement, not a purchase. Always read the store confirmation sheet before starting any separate paid product.

### When does the 14-day trial begin?

For an eligible new family, the code defers the one-time trial while pregnancy or early-newborn access is active. It can begin after that free-on-us phase once the app has reconciled the store and prior trial state.

### Can I still log sleep after Premium ends?

Yes. Logging and active timers remain part of core tracking. The exact predicted target, readiness and deeper planning layers are Premium.

### Is Luna free?

The current conversational Luna screen is Premium-gated. Fixed app Guides remain available without that conversation.

### Can I track twins for free?

In the current build, open the baby switcher from Track and choose **Add another baby**. If your account does not have Premium, you can choose **Add as Free** and keep full tracking on that baby; the deeper Premium guidance stays off unless that baby has valid Premium access.

### Will cancelling delete my data?

No. Cancelling a store subscription stops future renewal; it is not a delete-data action. Core tracking and the child history remain separate from the billing choice.

## Product verification

- Current Flutter surfaces reviewed: the shared paywall, Premium provider, Track gates, Care catalogue, Weaning screen, Luna lock and multi-baby route.
- A pre-publication source audit on 5 September 2026 checked the current entitlement provider, paywall, store-product IDs and both add-baby routes. Because this article is scheduled for May 2027, the product and live storefront prices must be checked again before publication.
- The paywall image above is a genuine repository debug-harness capture on an iPhone simulator using fictional profile data. Production prices come from the device storefront.

*Commercial features and prices can change. Check the installed app and the Apple or Google purchase confirmation for the current offer. OBubba is a tracking, planning and educational tool; it does not observe your baby, diagnose a condition or replace advice from a midwife, health visitor, GP or another qualified professional.*
