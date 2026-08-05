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

### Localisation plan (largest untapped lever)

The app ships 11 locales. The App Store listing ships 1.

Shipped in app (obubba_flutter_main/lib/l10n): de, en, es, es_419, es_MX, fr, ja, ko, pt, zh, zh_Hant.

Every App Store localisation gets its OWN 30-char name, 30-char subtitle and 100-char keyword field, indexed independently in that storefront. Competitors do this heavily: Baby Tracker! runs 34 locales, Baby Tracker 33, Baby+ 19, The Wonder Weeks 16, Baby Tracker - Newborn Log 14. OBubba and Owly both run 1.

Priority order:
1. English (U.K.), English (Australia), English (Canada) - these are separate App Store localisations from English (U.S.) and cost zero translation. Each adds a fresh 100-char keyword field in a market OBubba already sells in. Use them to split UK/US vocabulary: "nappy" in en-GB/en-AU, "diaper" in en-US/en-CA, which frees ~7 characters in each field.
2. The 10 non-English locales already translated in-app.

### Non-metadata factors measured against the top trackers

Checked 5 August 2026 across the GB top-12 for "baby tracker":

- Update cadence: top apps ship every 1-3 weeks (Baby Feed Timer 5 Aug, BabyCentre 3 Aug, Wonder Weeks 3 Aug, Huckleberry 30 Jul, WTE 29 Jul). OBubba shipped 5 Aug. Already best-in-class; keep it up, Apple weights recency.
- Screenshots: OBubba runs 10 iPhone + 10 iPad, the maximum, matching Huckleberry, Nara and WTE. No gap here.
- App age: every app in the top 10 launched 2010-2020. OBubba launched 1 April 2026. This is the one factor that cannot be fixed with metadata and is the real reason the head term is out of reach.
- Apple Search Ads: a 4-rating competitor (Owly) appears on head terms it does not rank for organically, which is the signature of a bought keyword. This is the only way to appear on "baby tracker" in the near term.

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
