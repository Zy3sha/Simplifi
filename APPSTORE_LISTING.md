# OBubba - App Store & Google Play Listing

Status: upload-ready metadata packet
Updated: 2026-05-14

This file is the canonical store listing copy for OBubba. The longer console workflow, custom product pages, custom store listings and experiments live in `marketing/OBUBBA_STORE_UPLOAD_PACKET.md`.

## Limits Checked

- Apple app name: 30 characters max.
- Apple subtitle: 30 characters max.
- Apple keywords: 100 characters max.
- Google Play app name: 30 characters max.
- Google Play short description: 80 characters max.
- Google Play full description: 4000 characters max.

## App Store Connect

### App Information

App name:
OBubba: Baby Sleep Tracker

Character count: 26 / 30

Subtitle:
Nap Schedule & Wake Windows

Character count: 27 / 30

Recommended categories:
- Primary: Medical
- Secondary: Health & Fitness

Note: Apple does not have a top-level "Parenting" category. Apple lists parenting under Lifestyle, but the baby-tracker cluster sits in Medical: 10 of the 12 apps ranking top-12 for "baby tracker" in the GB store are Medical primary (Baby Tracker - Newborn Log, Huckleberry, Nara, Glow, Baby Connect, Baby+, Baby Tracker, Baby Tracker!). Do not enter "Parenting" as an App Store category.

Age rating:
4+

### iOS Version Information

Promotional text:
Meet Luna, your sleep coach. She reads your baby's own logs to name why last night went wrong - and what to change tonight.

Character count: 123 / 170

Note: promotional text is NOT indexed by App Store search. It exists only to convert a visitor who is already on the page, so it carries the differentiator rather than keywords.

Keywords:
newborn,feeding,breastfeeding,bottle,nappy,diaper,weaning,milestone,routine,coach,training,log,twins

Character count: 100 / 100

### ASO rationale (why these strings)

Measured 5 August 2026 against Apple's search endpoint, GB and US storefronts.

What changed and why:

1. Name: "Baby Tracker" -> "Baby Sleep Tracker". The old name chased "baby tracker", the single most contested term in the category, where the weakest app in the GB top 10 has 854 ratings and OBubba does not appear in 184 results. That term is not winnable this year. "Baby Sleep Tracker" carries three exact phrases instead of one - "baby sleep tracker", "baby sleep" and "sleep tracker" - all of which have weak top tens (5 of the GB top 10 for "baby sleep tracker" have under 200 ratings).

2. Subtitle: dropped "Pregnancy" and "Feeding". Pregnancy is unwinnable (Pregnancy+ 39,767 ratings, BabyCentre 18,494) and was consuming a third of the field. The subtitle now carries the two highest-value two-word phrases that are NOT in the name, since adjacent words form phrases and scattered keyword tokens do not: "nap schedule" and "wake windows". GB "wake window" has 6 of its top 10 under 200 ratings and OBubba currently does not rank at all.

3. Keywords: removed every word already covered by name or subtitle (baby, sleep, tracker, nap, schedule, wake, window). Apple combines tokens across the three fields, so repeating a word wastes characters. The freed budget went to "coach" and "training" - OBubba is absent from "baby sleep coach" and "sleep training baby" in both stores despite shipping a gentle sleep-training coach, purely because neither word appears in any indexed field.

4. Do not put keywords in the description. Apple does not index the App Store description at all. Only app name, subtitle, keyword field, developer name and in-app purchase display names are indexed. (Google Play is the opposite - see below.)

Alternatives if you prefer keyword-first over brand-first:
- Name: "Baby Sleep Tracker: OBubba" (26 / 30). Marginally stronger for generic queries and better search-result CTR; costs brand recall. Huckleberry ranks top-4 brand-first, but on 70,758 ratings.
- Keywords swap: replace "twins" with "growth" (97 / 100) if growth tracking matters more than the twins niche.

### Localisation status (CORRECTION + what was applied)

CORRECTION to an earlier note in this file: the claim that "the App Store listing ships 1 locale" was WRONG. It came from the app binary's declared languages (iTunes lookup languageCodesISO2A), not from the store listing. The listing already had 13 localisations.

The real problem was different and worse: all 11 non-English localisations contained ENGLISH text. Every one of them carried the subtitle "Sleep, feeds, naps & nappies" and the identical English keyword string:

    newborn,breastfeeding,sleep,weaning,growth,milestone,routine,wake,window,parent,carer,tracker

That is 1,100 characters of keyword field spent on English words in storefronts where parents search in Japanese, Korean, Chinese, German, Spanish, Portuguese, Arabic and Bengali. The localisations existed; they were never localised.

APPLIED 5 August 2026 via the App Store Connect API (key UU9YN54BH5) to a newly created version 3.2.3, state PREPARE_FOR_SUBMISSION:

- Category changed to Medical / Health & Fitness (was Health & Fitness / Lifestyle).
- App name and subtitle written for all 15 locales.
- Keyword field rewritten in the correct language for all 15 locales.
- en-AU and en-CA created (they did not exist before).
- Promotional text set on the four English locales.

Verified by reading every field back from Apple: 15 of 15 locales match, 0 mismatches. No build is attached and nothing has been submitted for review - that step is deliberately left to a human.

Rewriting the 13 existing locales into their actual languages and adding en-AU/en-CA takes usable indexed keyword characters from roughly 200 (the two English fields; the other 11 were duplicate English) to 1,341 across 15 locales.

Priority order:
1. English (U.K.), English (Australia), English (Canada). These are separate App Store localisations from English (U.S.) and cost ZERO translation. Each adds a fresh 100-char keyword field in a market OBubba already sells in. They also let you stop paying for both vocabularies in one field: "nappy" only in en-GB/en-AU, "diaper" only in en-US/en-CA.
2. The 10 non-English locales already translated in the app.

Every string below is within Apple's limits (verified by character count, shown per cell).

| Locale | Code | App name (30) | Subtitle (30) | Keywords (100) |
|---|---|---|---|---|
| English (U.K.) | `en-GB` | OBubba: Baby Sleep Tracker <br>`26/30` | Nap Schedule & Wake Windows <br>`27/30` | newborn,feeding,breastfeeding,bottle,nappy,weaning,milestone,routine,coach,training,log,twins,diary <br>`99/100` |
| English (U.S.) | `en-US` | OBubba: Baby Sleep Tracker <br>`26/30` | Nap Schedule & Wake Windows <br>`27/30` | newborn,feeding,breastfeeding,bottle,diaper,solids,milestone,routine,coach,training,log,daycare,pump <br>`100/100` |
| English (Australia) | `en-AU` | OBubba: Baby Sleep Tracker <br>`26/30` | Newborn Nap Timer & Feeds <br>`25/30` | wake,window,schedule,breastfeeding,bottle,nappy,weaning,milestone,routine,coach,training,twins,dummy <br>`100/100` |
| English (Canada) | `en-CA` | OBubba: Baby Sleep Tracker <br>`26/30` | Newborn Nap Timer & Feeds <br>`25/30` | wake,window,schedule,breastfeeding,bottle,diaper,solids,milestone,routine,coach,training,twins,log <br>`98/100` |
| German | `de` | OBubba: Baby Schlaf Tracker <br>`27/30` | Schlafplan & Wachfenster <br>`24/30` | neugeborenes,stillen,fläschchen,windel,beikost,meilenstein,routine,schlafcoach,protokoll,zwillinge <br>`98/100` |
| French | `fr` | OBubba: Suivi Sommeil Bébé <br>`26/30` | Siestes & Fenêtres d'éveil <br>`26/30` | nouveau-né,allaitement,biberon,couche,diversification,étape,routine,coach,journal,jumeaux,rythme <br>`96/100` |
| Spanish (Spain) | `es` | OBubba: Sueño del Bebé <br>`22/30` | Siestas y Ventanas de Sueño <br>`27/30` | recién nacido,lactancia,biberón,pañal,alimentación,hito,rutina,entrenador,registro,gemelos,horario <br>`98/100` |
| Spanish (Mexico) | `es-MX` | OBubba: Sueño del Bebé <br>`22/30` | Siestas y Ventanas de Sueño <br>`27/30` | recién nacido,lactancia,mamila,pañal,papilla,hito,rutina,entrenador,registro,gemelos,horario,bebé <br>`97/100` |
| Spanish (Latin America) | `es-419` | OBubba: Sueño del Bebé <br>`22/30` | Siestas y Ventanas de Sueño <br>`27/30` | recién nacido,lactancia,mamadera,pañal,papilla,hito,rutina,entrenador,registro,mellizos,horario <br>`95/100` |
| Portuguese | `pt` | OBubba: Sono do Bebê <br>`20/30` | Sonecas e Janelas de Sono <br>`25/30` | recém-nascido,amamentação,mamadeira,fralda,papinha,marco,rotina,treinador,registro,gêmeos,horário <br>`97/100` |
| Japanese | `ja` | OBubba: 赤ちゃん睡眠記録 <br>`16/30` | お昼寝スケジュールと活動時間 <br>`14/30` | 新生児,授乳,ミルク,おむつ,離乳食,発達,生活リズム,寝かしつけ,記録,双子,育児日記,寝ぐずり,夜泣き,睡眠退行,授乳間隔,成長記録,ねんねトレーニング <br>`78/100` |
| Korean | `ko` | OBubba: 아기 수면 기록 <br>`16/30` | 낮잠 스케줄과 깨어있는 시간 <br>`15/30` | 신생아,수유,분유,기저귀,이유식,발달,생활패턴,수면교육,기록,쌍둥이,육아일기,통잠,밤수유,수면퇴행,성장기록,낮잠시간,아기수면 <br>`69/100` |
| Chinese (Simplified) | `zh-Hans` | OBubba: 宝宝睡眠记录 <br>`14/30` | 小睡时间表与清醒时长 <br>`10/30` | 新生儿,母乳,奶瓶,尿布,辅食,里程碑,作息,睡眠训练,记录,双胞胎,育儿,哄睡,夜奶,睡眠倒退,成长记录,宝宝作息,喂养记录 <br>`63/100` |
| Chinese (Traditional) | `zh-Hant` | OBubba: 寶寶睡眠記錄 <br>`14/30` | 小睡時間表與清醒時長 <br>`10/30` | 新生兒,母乳,奶瓶,尿布,副食品,里程碑,作息,睡眠訓練,記錄,雙胞胎,育兒,哄睡,夜奶,睡眠倒退,成長記錄,寶寶作息,餵養記錄 <br>`64/100` |

Notes on the table:

- The app name is held constant across locales for brand consistency; the subtitle is deliberately varied between the GB/US pair and the AU/CA pair so the two pairs cover different phrases ("nap schedule" + "wake windows" vs "newborn nap timer" + "feeds") instead of duplicating one another.
- No word is repeated between a locale's name, subtitle and keyword field. Apple combines tokens across all three, so repetition is wasted budget.
- "dummy" in en-AU is the Australian term for a pacifier/soother; it has no en-GB or en-US equivalent worth the characters.
- The CJK keyword fields sit at 41-64 of 100 characters because each CJK character counts as one, so these fields have real headroom left. Have a native speaker fill the remainder - that is free ranking surface.
- The non-English strings were written by an English speaker and are grammatically plausible but NOT native-reviewed. Get a native speaker to check ja, ko, zh-Hans and zh-Hant in particular before submitting; a mistranslated keyword wastes the whole field. The European-language strings (de, fr, es, pt) are lower risk but still worth a read-through.

### In-app purchase display names (free indexed surface, currently wasted)

Apple indexes in-app purchase display names. The current names carry no search value:

| Current | Suggested | Len |
|---|---|---|
| OBubba Premium - Monthly | Premium: Sleep Plans & Coach | 28 |
| OBubba Premium - Annual | Premium Year: Nap Predictions | 29 |
| OBubba Premium - Lifetime | Premium Forever: Sleep Reports | 30 |

IAP display names are limited to 30 characters and are reviewed by Apple, so keep them describing the actual product. This is a small lever, but it is free and it is currently returning nothing.

### Non-metadata factors measured against the top trackers

Checked 5 August 2026 across the GB top-12 for "baby tracker":

- Update cadence: top apps ship every 1-3 weeks (Baby Feed Timer 5 Aug, BabyCentre 3 Aug, Wonder Weeks 3 Aug, Huckleberry 30 Jul, WTE 29 Jul). OBubba shipped 5 Aug. Already best-in-class; keep it up, Apple weights recency.
- Screenshots: OBubba runs 10 iPhone + 10 iPad, the maximum, matching Huckleberry, Nara and WTE. No gap here.
- App age: every app in the top 10 launched 2010-2020. OBubba launched 1 April 2026. This is the one factor that cannot be fixed with metadata and is the real reason the head term is out of reach.
- Apple Search Ads: a 4-rating competitor (Owly) appears on head terms it does not rank for organically, which is the signature of a bought keyword. This is the only way to appear on "baby tracker" in the near term.

### How to apply these changes, and when they take effect

What can be changed WITHOUT a new version submission:
- Primary and secondary category (App Information - takes effect within hours)
- Promotional text
- In-app purchase display names (go through IAP review, usually same-day)

What REQUIRES a new version submission and review:
- App name, subtitle, keyword field, description
- Adding any new localisation

So the name/subtitle/keyword/localisation work all ships together with the next binary. Do the category change today, on its own - it is free and immediate.

Expected timeline from the day the new version is APPROVED:

| When | What happens |
|---|---|
| Day 0 | Version approved and released. |
| Day 0-3 | Apple re-indexes the new name, subtitle and keyword fields. New terms become searchable. |
| Day 3-10 | First ranking positions appear on the new terms, usually volatile and lower than they will settle. |
| Week 2-4 | Positions stabilise as Apple accumulates impression and conversion data for each new term. This is the number to judge the change by. |
| Week 4+ | Further movement comes from download velocity and conversion rate, not from the metadata. |

Add 24-48 hours of App Review before Day 0.

Important caveat: renaming an app usually causes a short-term ranking DIP on the terms it already held (here: "newborn tracker", "weaning tracker", "nappy tracker") while Apple re-learns the listing. Expect roughly 1-2 weeks of noise before the net gain is readable. Do not judge the change in week 1, and do not revert it in week 1.

Measurement: re-run the rank check before submitting to capture a clean baseline, then again at day 7 and day 28. The comparison only means something against a pre-change baseline captured the same way.

Description:

OBubba is a baby tracker and newborn tracker for sleep, feeds, breastfeeding, bottles, nappies, routines, wake windows, weaning, growth and milestones.

Made by a mum on maternity leave, OBubba helps tired parents keep the baby day in one calm place without relying on exhausted memory.

WHY PARENTS USE OBUBBA

- Fast baby tracking for feeds, sleep, naps and nappies
- A gentle rhythm clock for naps, bedtime and night wakes
- Wake window and bedtime guidance based on your baby's recent pattern
- Night mode for low-light logging at 3am
- Bubba Care handovers for partners, grandparents, nurseries and babysitters
- Health visitor style summaries and family reports
- Growth, milestone, weaning, allergen and memory book tools
- Parent wellbeing check-ins and calm support notes

OBUBBA IS BUILT FOR REAL FAMILY LIFE

Babies do not follow perfect charts. Unlike basic baby tracking apps, OBubba learns your baby's own rhythm and keeps the useful details together so you can notice patterns, share care and understand what might help next.

Use OBubba when you want to know:
- When did baby last feed?
- How long was that nap?
- How many nappies today?
- Was bedtime harder after a short final nap?
- What should I tell the person caring for baby?

PREMIUM FEATURES

OBubba Premium adds deeper sleep guidance, personal rhythm insights, trends, reports, partner and carer sharing, weaning tools, memory book features and more.

OBubba is not medical advice and does not diagnose or treat health or sleep conditions. Always speak to your midwife, health visitor, doctor or qualified professional for medical concerns.

No ads. No selling your data. Just a softer way to keep the day together.

Subscription terms: Auto-renewable subscriptions renew unless cancelled at least 24 hours before the end of the current period. Payment is charged to your Apple ID at purchase confirmation. Manage or cancel anytime in App Store account settings. Lifetime is a one-time purchase.

Privacy Policy: https://obubba.com/privacy
Terms of Use: https://obubba.com/terms

Description character count: 2026 / 4000

What's New:

OBubba now has clearer sleep guidance, stronger care handovers, calmer tracking copy and updated store screenshots for feeds, naps, nappies, weaning, milestones and family care.


### URLs

Privacy Policy URL:
https://obubba.com/privacy

Support URL:
https://obubba.com

Marketing URL:
https://obubba.com

Terms of Use:
https://obubba.com/terms

Visual identity page:
https://obubba.com/obubba-visual-identity.html


### In-App Purchases

OBubba Premium - Monthly
- GBP 7.99/month UK price for new users
- Grandfathered eligible existing users may see GBP 4.99/month UK price
- Personal rhythm predictions, sleep guidance, growth charts, weaning tools, partner sync, shareable albums, reports and trends

OBubba Premium - Annual
- GBP 79.99/year UK price for new users
- Grandfathered eligible existing users may see GBP 44.99/year UK price
- Everything in monthly, billed annually

OBubba Premium - Lifetime
- GBP 129.99 one-time UK price for new users
- Grandfathered eligible existing users may see GBP 79.99 one-time UK price
- All premium features forever

Prices in other countries are set by Apple and Google using their local pricing tiers, exchange-rate handling, taxes and store rules. The final local price is shown by the store before purchase confirmation.


### App Store Screenshot Assets

Brand recognition rule:
Every uploaded screenshot should include the OBubba wordmark or app icon visibly inside the artwork, especially the sleep timer / rhythm clock screenshots. Do not upload dark timer-only screenshots without OBubba branding, because visual search can mistake them for other baby sleep apps.

iPhone 6.5 inch screenshots:
`/Users/zyesha/Desktop/APPLE_UPLOAD_USE_THESE_6_5_SCREENSHOTS`

Dimensions verified: 1284 x 2778

iPad 13 inch screenshots:
`/Users/zyesha/Desktop/APPLE_UPLOAD_USE_THESE_IPAD_13_SCREENSHOTS`

Dimensions verified: 2064 x 2752

Upload order:
1. `01-know-what-baby-needs-next.png`
2. `02-less-alone-at-3am.png`
3. `03-one-calm-place-for-care.png`
4. `04-sleep-advice-that-reads-the-whole-night.png`
5. `05-weaning-without-the-panic.png`
6. `06-parents-need-care-too.png`
7. `07-play-that-fits-their-stage.png`
8. `08-bubba-care-for-your-village.png`
9. `09-feeding-support-for-every-route.png`
10. `10-travel-with-less-rhythm-chaos.png`


### App Review Notes

Use this if App Review asks about subscriptions, health data or advice:

OBubba is a parent-held baby tracking and planning app. It logs feeds, sleep, naps, nappies, weaning, growth, milestones and notes, and provides gentle pattern-based guidance. It is not medical advice and does not diagnose or treat any health or sleep condition. Users are directed to qualified professionals for medical concerns. Subscriptions unlock premium planning, trends, guidance, reporting and sharing features. Privacy Policy and Terms are linked in the app and listing.


## Google Play

### Main Store Listing

App name:
OBubba: Baby Sleep Tracker

Character count: 26 / 30

Short description:
Nap predictions, wake windows, feeds & nappies - and why last night went wrong.

Character count: 79 / 80

Note: Google Play works the opposite way to Apple. There is no keyword field; Play indexes the app name, the short description and the FULL description, and it weights term frequency in the full description. So keyword coverage on Play belongs in the long copy below, not in a keyword list. The Apple keyword field and the Play full description are therefore not interchangeable - do not copy one into the other.

Play-specific note on ranking: the listing currently shows no public star rating at all, only "1k+ Downloads", because Play withholds the aggregate until a minimum rating volume is reached. Until that threshold is crossed, the store listing is competing with no visible social proof, which suppresses install rate independently of ranking.

Full description:

OBubba is a baby tracker and newborn tracker for sleep, feeds, breastfeeding, bottles, nappies, routines, wake windows, weaning, growth and milestones.

Made by a mum on maternity leave, OBubba helps tired parents keep the baby day in one calm place without relying on exhausted memory.

Track the baby day without rebuilding it from memory:

- Feeds, breastfeeding, bottles and pumping notes
- Nappies, medicine, temperature and daily notes
- Naps, night wakes, bedtime and wake windows
- Weaning, allergens, growth and milestones
- Memory book moments and family updates
- Bubba Care handovers for partners, grandparents, nurseries and babysitters

OBubba helps you understand your baby's own rhythm.

Unlike basic baby tracking apps, OBubba links the day together. The glowing rhythm clock and simple timeline help you see what happened across feeds, naps, nappies, night wakes, weaning and the tiny clues that are easy to forget at 3am.

Built for real family life:

- Quick logging when you only have one hand free
- Night mode for low-light wake ups
- Gentle bedtime and nap guidance
- Trends and summaries for calmer planning
- Reports for family, carers and health conversations
- Parent wellbeing check-ins

OBubba Premium adds deeper sleep guidance, personal rhythm insights, trends, reports, partner and carer sharing, weaning tools, memory book features and more.

OBubba is not medical advice and does not diagnose or treat health or sleep conditions. Always speak to your midwife, health visitor, doctor or qualified professional for medical concerns.

No ads. No selling your data. Just a softer way to keep the day together.

Privacy Policy: https://obubba.com/privacy
Terms of Use: https://obubba.com/terms

Full description character count: 1739 / 4000


### Google Play Assets

Brand recognition rule:
Every uploaded screenshot should include the OBubba wordmark or app icon visibly inside the artwork, especially the sleep timer / rhythm clock screenshots. Do not upload dark timer-only screenshots without OBubba branding, because Google Lens and AI summaries can confuse visually similar baby sleep apps.

Phone screenshots:
`/Users/zyesha/Desktop/ANDROID_UPLOAD_USE_THESE/screenshots-phone-1080x1920`

Dimensions verified: 1080 x 1920

Upload order:
1. `01-know-what-baby-needs-next.png`
2. `02-less-alone-at-3am.png`
3. `03-one-calm-place-for-care.png`
4. `04-sleep-advice-that-reads-the-whole-night.png`
5. `05-weaning-without-the-panic.png`
6. `06-parents-need-care-too.png`
7. `07-play-that-fits-their-stage.png`
8. `08-bubba-care-for-your-village.png`

Feature graphic:
`/Users/zyesha/Desktop/ANDROID_UPLOAD_USE_THESE/feature-graphic-1024x500.png`

Dimensions verified: 1024 x 500

Preview video source:
`/Users/zyesha/Desktop/ANDROID_UPLOAD_USE_THESE/video-for-youtube/obubba-google-play-preview-1080x1920.mp4`


### Contact Details

Website:
https://obubba.com

Email:
hello@obubba.com

Privacy Policy:
https://obubba.com/privacy

Terms:
https://obubba.com/terms


## Privacy Summary

Use this summary when answering store privacy/data safety forms. The actual console checkboxes must still match the app implementation and latest SDK behaviour.

- Data used to track users: None.
- Account data: email and optional name if the parent creates an account.
- Baby care logs: feeds, sleep, nappies, growth, medicine, temperature, weaning, milestones and notes. This is user-provided baby care data.
- Photos: optional memory book photos and child profile photos.
- Location: used only for appointment travel-time features if the user grants permission.
- Analytics: Firebase/usage analytics for app reliability and product improvement.
- Purchases: in-app purchase/subscription status through Apple and Google billing.
- User control: account deletion and privacy policy are available from the app/site.
