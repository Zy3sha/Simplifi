---
title: "Why Does OBubba Say ‘Milk Intake Dipped Around This Tooth’?"
slug: why-obubba-says-milk-intake-dipped-around-this-tooth
description: "See how OBubba compares feeding before and around a logged tooth, why mixed feeding stays quiet, and when a milk dip needs more than teething comfort."
date: 2027-04-08
updated: 2027-04-08
author: OBubba
tags: OBubba milk intake dipped around tooth, baby drinking less milk teething, teething baby refusing bottle, breastfeeding less while teething, baby milk intake tracker, baby feeding trend app, teething feed dip, wet nappies baby, mixed feeding tracker, baby weaning and milk, baby first tooth feeding, OBubba teething tracker
heroImage: /obubba-milk-intake-dipped-around-tooth.jpg
---

The first tooth finally appears. Your baby is chewing everything, pushing the bottle away or taking a few short breastfeeds instead of their usual rhythm. Then OBubba surfaces:

> **Milk intake dipped around this tooth**

The wording sounds causal. The current Flutter detector is more modest than the title: it starts from a tooth the parent actually logged, compares daytime feeding before and around that eruption date, and reports a card only after the chosen measure falls by at least 15%.

It also refuses to combine bottle millilitres with breastfeeding minutes. That is a genuinely valuable guardrail. But this is still pattern matching—not a diagnosis of sore gums, intake, hydration or illness.

Here is exactly how the app earns the sentence, why a mixed-fed baby may receive no card, what “from N days” really means and when feeding changes need a health check rather than another teething explanation.

## The short answer

Every gate below must pass:

| Gate | Current Flutter rule |
|---|---|
| Eruption anchor | An **actual named tooth** logged today or during the previous 5 days |
| Around-tooth window | Logged feed days from **D−5 through min(D+5, today)** |
| Baseline | Logged feed days from **D−19 through D−6** |
| Minimum history | At least **2 around-tooth days** and **5 baseline days** |
| Bottle route | Bottle-like records are at least **70%** of milk-feed records; compare daytime ml/day |
| Breast route | If bottle route does not win, breast-like records are at least **70%**; compare daytime minutes/day |
| Mixed route | Neither reaches 70%; stay silent |
| Change needed | Around-tooth mean is at least **15% lower** than baseline |
| Urgency | 15–29% is low; **30%+ is medium** |

The Brain supplies 26 calendar days of feed history, which is enough for the oldest possible comparison when the tooth was five days ago.

![The exact Flutter decision path behind OBubba’s milk-dip-around-a-tooth insight.](/obubba-teething-feed-dip-detector.svg "OBubba requires an actual tooth logged in the past five days, compares a 14-day pre-tooth baseline with logged days around the eruption, chooses either bottle millilitres or breast minutes when one mode reaches 70%, and speaks only after a drop of at least 15%. Mixed feeding remains quiet rather than combining unlike units.")

## A real tooth entry comes first

OBubba’s Teeth history can contain two kinds of records:

- a selected tooth with a date; or
- a note-only entry such as “seemed grizzly, maybe teething.”

Only the first kind can anchor this detector. The tooth field must be non-empty and its date must parse successfully. A symptom note, red cheek, rough night or “maybe teething” comment cannot create **this tooth** in the card title.

That is an important honesty boundary. The app does not infer an eruption from age or fussiness and then attach a feeding decline to it.

The tooth must have been logged on today’s date or one of the previous five calendar days. A six-day-old eruption is too old. A future-dated tooth is ignored, even when a partner-sync or date-entry mistake puts it only one day ahead.

If several qualifying teeth exist, Flutter chooses the most recent eruption date. Two teeth entered on the same date share the same date-based identity, so the detector treats them as one eruption event for acknowledgement purposes.

## The two date windows sit around the tooth

Call the eruption date **D**.

The baseline is:

> **D−19 through D−6**

That is a 14-calendar-day period ending immediately before the near-tooth window.

The comparison window is:

> **D−5 through D+5, stopping at today**

If the tooth appeared today, the comparison can only use the five days before it plus today. If it appeared three days ago, the window can include three post-eruption days. It keeps filling until the tooth is six days old, when the detector stops qualifying entirely.

The app therefore does not wait for a completed 11-day experiment. It can speak while the near-tooth window is still developing.

Only dates whose feed list is non-empty enter either group. Missing dates are skipped; they are not assumed to be zero-intake days. The minimum is two logged dates around the tooth and five in the baseline.

## “From 8 days” does not mean eight consecutive full diaries

The evidence label adds the number of included window and baseline dates.

If there are two near-tooth days and five baseline days, the sample size is seven. Because the near-tooth group has fewer than three days or the baseline has fewer than seven, the card says:

> **early read · 7 days**

Once both sides reach at least three and seven respectively, it changes to **from N days**.

The label does not prove that every feed on those dates was logged. One bottle record can make a date count. Nor does it show the balance of the groups: “from 10 days” could mean three around the tooth and seven baseline, or five and five.

This is a sample-of-logged-days label, not a completeness score.

## First the app chooses one feeding language

Millilitres and minutes are different measurements. OBubba counts milk-feed records across both periods to choose one route.

Bottle-like means:

- feed type `bottle`, `both` or the legacy `milk`; and
- a positive amount.

Breast-like means:

- feed type `breast` or `both`; and
- at least one side has a recorded duration.

If bottle-like records make up at least 70% of all milk-feed records, the app uses the bottle route. Otherwise, if breast-like records reach 70%, it uses the breast route. Bottle is checked first, so a set where both tests could pass takes the millilitre route.

The denominator deliberately excludes solids. A weaning baby who logs bottles plus meals should still be recognisable as bottle-fed for this comparison.

If neither milk mode reaches 70%, the function returns nothing. It will not add 420ml to 35 breastfeeding minutes and call the result “455 milk.”

![A genuine OBubba Flutter feeding screen explaining that bottle millilitres are only the measured part of a mixed-feeding day and that breast and bottle records both matter.](/obubba-screen-feeding.jpg "This genuine app screen shows OBubba’s mixed-feeding principle: bottle ml is only the measured part, so the app does not judge total feeding from bottle volume alone. The teething-feed detector follows the same caution by staying silent when neither bottle nor breast records dominate.")

## Bottle-fed route: daytime millilitres per logged day

For every included date, OBubba totals the amounts from daytime bottle-like feeds. Night feeds are excluded.

It then calculates:

> mean around-tooth ml/day versus mean baseline ml/day

Imagine seven baseline days average 700ml and three near-tooth days average 560ml:

> (700 − 560) ÷ 700 × 100 = **20% dip**

That clears the 15% threshold and produces a low-urgency card. The body would report the rounded percentage and both daily means in the family’s selected volume unit.

This route measures the amount logged as taken, not the amount offered. It cannot see discarded milk, an unlogged top-up or how effectively the baby swallowed.

## Breastfed route: minutes are explicitly a proxy

For a breast-dominant history, the app adds left- and right-side daytime minutes on each included date. It compares mean minutes per day before and around the tooth.

The card itself says this is **“a rough proxy for intake, since breast volume isn’t measured.”** That caveat is essential.

A shorter breastfeed can reflect:

- discomfort;
- distraction;
- more efficient transfer;
- a different let-down;
- incomplete timer use;
- switching sides without logging; or
- a real fall in milk taken.

The detector knows only duration. It does not listen for swallowing, assess attachment, weigh the baby before and after a feed or measure milk transfer.

So the title **Milk intake dipped** is stronger than the breast-route evidence. For that route, the literal finding is: **logged daytime breastfeeding minutes fell**.

## The card measures daytime—not the whole 24 hours

Every feed marked `night` is excluded from the proxy and from the feed-type denominator.

That means daytime bottle volume could fall while night feeds rise. A baby who is reverse cycling or feeding more overnight may show a daytime dip without a matching 24-hour reduction.

The app has separate features for night-feed trends and reverse-cycling patterns. This detector does not combine them before writing the title.

Read **Milk intake dipped around this tooth** as shorthand for:

> “The selected daytime feeding measure was lower on logged days near a recently recorded tooth.”

That is useful, but narrower than “your baby took less milk overall.”

## Solids are excluded from one calculation—but can affect the date mean

Flutter correctly removes solids from the milk-mode denominator. A bowl of porridge does not make a bottle-fed baby look mixed-fed.

There is a subtler edge case. A date enters the window when its feed list is non-empty. Because the Brain passes every `feed` entry, a date containing only a solids feed still counts as a logged date. Its milk proxy is then zero.

If near-tooth days contain solids entries but missing milk logs, those zeroes can lower the around-tooth mean and manufacture or enlarge a dip. The same issue can affect the baseline in the opposite direction.

For an honest comparison, record milk consistently on any day you log solids. The detector does not currently require at least one qualifying milk feed on every included date.

## Fifteen percent speaks; 30% changes priority

The drop is calculated from the two arithmetic means:

> (baseline mean − around-tooth mean) ÷ baseline mean × 100

If the baseline is zero, the detector stays silent. If the drop is under 15%, it stays silent.

At exactly 15%, the card can appear with low urgency. At 30% or above, it becomes medium urgency. There is no high-urgency branch inside this function.

That distinction affects ordering in the insight system: medium findings sit above low ones. It does not mean a 29% feeding fall is medically safe or a 30% fall proves dehydration. The thresholds are product rules, not clinical cut-offs.

The health-and-wet-nappy picture still outranks the percentage.

## The app does not actually verify sore gums

The body says sore gums commonly make feeds less comfortable, and the “why” text frames the pattern as common with eruption discomfort.

But the detector does not require:

- sore or swollen gums;
- chewing or dribbling;
- a painful feed;
- a rejected teat;
- a teething symptom entry;
- improvement after cooling the gum; or
- absence of illness.

The only tooth evidence is the logged eruption date. The app sees timing, not mechanism.

Other reasons for reduced feeding can overlap with a new tooth: congestion, sore throat, ear pain, oral thrush, reflux, constipation, vomiting, diarrhoea, bottle-flow problems, distraction or a change in solids. Teething and illness can occur together.

The most honest interpretation is correlation: **the feed measure fell in a window surrounding a recorded eruption**.

## Age is passed in—but does not change the result

The Brain passes the baby’s age in weeks into the detector. The current function never reads it.

There is no minimum or maximum age gate, no different percentage by age and no adjustment for stage of weaning. If the records satisfy the dates and maths, the same rule can run for any child profile.

That matters because a milk change in a young infant is not equivalent to a gradual reduction in an older baby eating several meals. NHS guidance says breast milk or first infant formula should remain the main drink through the first year, even though milk naturally reduces as solids increase ([NHS drinks and cups guidance](https://www.nhs.uk/baby/weaning-and-feeding/drinks-and-cups-for-babies-and-young-children/)).

The app’s percentage does not replace age-specific feeding advice.

## What “Got it” changes

This insight has no data-changing primary action. **Got it** acknowledges the finding; it does not add a tooth, edit a feed, schedule bottles or mark the baby hydrated.

The dismissal key includes the selected eruption date. As the around-tooth window gains another day and the percentage changes, acknowledging the card does not make it reappear every morning for the same tooth.

A later tooth has a different date-based identity and can produce a new card. That is the right balance: no daily nagging, but no lifetime dismissal after the first incisor either.

The insight is also classified as a longer-term pattern in the Flutter Track UI. It folds into **What OBubba’s noticed** rather than repeating as a today-guidance card. Higher-urgency safety findings are handled separately and can take priority.

## Why no card may be the responsible result

OBubba stays quiet when:

- there is no named tooth entry;
- the latest actual tooth is more than five days old;
- the tooth date is in the future;
- fewer than two near-tooth feed dates or five baseline dates exist;
- neither bottle nor breast records reach 70%;
- the baseline mean is zero;
- the chosen measure falls by less than 15%;
- the measure is flat or higher; or
- this eruption’s finding has already been acknowledged or snoozed.

For mixed feeding, silence is an accuracy feature. The genuine feeding screen shown above uses the same principle: bottle millilitres are only the measured portion, so they should not be treated as total intake.

No card does not mean feeding is fine. It means this specific comparison could not produce a responsible single-unit trend.

## What to do at the next feed

If the baby is otherwise well and nappies are reassuring, use low-pressure comfort:

1. offer milk calmly and respond to early cues;
2. stop when the baby turns away rather than repeatedly pushing the teat or breast back;
3. try another smaller feed sooner;
4. reduce distraction;
5. check ordinary bottle mechanics or breastfeeding comfort; and
6. keep tracking wet nappies and how alert the baby seems.

The [NHS says a fridge-cooled teething ring may soothe gums](https://www.nhs.uk/baby/babys-development/teething/tips-for-helping-your-teething-baby/). Never freeze it, because a frozen ring can damage gums, and never tie one around the baby’s neck.

Do not dilute formula, add cereal to a bottle or replace missed milk with sweet drinks. Prepare formula exactly as directed.

For a baby already weaning, cool soft foods may feel easier, but solids should not be used to hide a significant milk decline. Continue breast milk or first infant formula as the main drink during the first year.

## Wet nappies matter more than the chart

This detector does not use wet nappies as a gate. It advises the parent to watch them, but a 20% or 35% card can exist whether nappies are normal, unlogged or clearly dropping.

Look at the baby, not only the feed total. Warning signs of dehydration can include:

- fewer wet nappies than usual;
- dark urine;
- dry mouth or lips;
- few or no tears;
- sunken eyes or soft spot;
- unusual drowsiness or irritability; and
- difficulty keeping fluids down.

NHS dehydration guidance emphasises that babies are at greater risk and lists fewer wet nappies, dry mouth, few tears, sunken eyes or fontanelle and drowsiness among the signs ([NHS 111 Wales](https://111.wales.nhs.uk/Encyclopaedia/d/article/dehydration/)).

Seek prompt professional advice if feeding has fallen substantially, nappies are clearly fewer or lighter, swallowing appears painful, the baby is repeatedly vomiting or they seem unwell. Use NHS 111, your GP, health visitor or the urgent route appropriate to the symptoms. Call 999 for life-threatening breathing difficulty, blue or mottled colour, collapse, a seizure, severe floppiness or a baby who is very difficult to wake.

Teething should never become a reason to explain away a sick baby.

## A better way to read the card

Translate **Milk intake dipped around this tooth** into:

> “You logged an actual tooth in the past five days. On enough logged dates around that eruption, one daytime feeding measure is at least 15% below its earlier average.”

Then ask four questions the detector cannot answer:

1. Were those days logged completely?
2. Did night feeding compensate?
3. Are wet nappies and alertness reassuring?
4. Could illness, feeding mechanics or the solids routine explain the same timing?

That turns a confident-looking title into a useful review rather than an automatic diagnosis.

## Keep the evidence together in OBubba

This feature is most useful because the tooth date does not live in isolation. OBubba keeps milk feeds, breast sides and minutes, bottles, solids, wet nappies, temperature, symptoms, sleep and the Smile map in one shared history. A partner or carer can add the feed that would otherwise be missing from the comparison.

That joined-up record makes a better question possible: not simply “Did one bottle get smaller?” but “Did daytime feeding change around this eruption, did nights compensate, and did hydration stay reassuring?”

**[Try OBubba free →](/free-baby-tracker-app.html)** — log the moment once, then let the app look for useful connections without pretending unlike measurements are the same.

## The bottom line

**“Milk intake dipped around this tooth” means OBubba found a named tooth logged within five days, enough feeding dates before and around it, one dominant measurable feed mode, and at least a 15% fall in the mean daytime proxy.**

For bottle-dominant histories, the proxy is logged millilitres. For breast-dominant histories, it is minutes and the card admits that duration cannot measure milk volume. Mixed feeding stays quiet instead of combining incompatible units. A 30% drop raises the card from low to medium urgency.

The thoughtful parts are real: actual tooth required, future dates rejected, unlike units kept separate, sparse history labelled early and acknowledgement tied to one eruption.

The limits are equally real: night feeds are absent, age does not affect the rule, sore gums are not observed, partial days can skew the mean, and a solids-only logged date can enter with zero milk.

Use the card to notice a change and bring the record into one place. Use wet nappies, the baby’s behaviour and professional advice to decide whether that change is safe.
