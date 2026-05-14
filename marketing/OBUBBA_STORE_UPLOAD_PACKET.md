# OBubba Store Upload Packet

Updated: 2026-05-14

This is the practical console checklist for finishing OBubba in App Store Connect and Google Play Console.

## What Is Already Finished

- Website SEO pages, image sitemap and visual identity page are pushed to GitHub.
- App Store iPhone 6.5 inch screenshots exist and dimensions are valid.
- App Store iPad 13 inch screenshots exist and dimensions are valid.
- Google Play phone screenshots exist and dimensions are valid.
- Google Play feature graphic exists and dimensions are valid.
- Store copy has been rewritten in `APPSTORE_LISTING.md`.
- Apple metadata length issues were fixed in the upload copy.
- Apple category recommendation was corrected: use Lifestyle for parenting, not a non-existent "Parenting" category.

## What Still Requires Console Access

These cannot be truthfully marked complete until someone with an active logged-in console session does them:

- Paste App Store listing fields into App Store Connect.
- Upload or reorder App Store screenshots.
- Submit App Store metadata/custom product pages for review.
- Paste Google Play main store listing fields.
- Upload or reorder Google Play screenshots and feature graphic.
- Create Google Play custom store listings.
- Start Google Play store listing experiments.

## Official Limits Used

- Apple app name: 30 characters max.
- Apple subtitle: 30 characters max.
- Apple keyword field: 100 characters max.
- Apple supports up to 10 screenshots and 3 app previews per localization.
- Google Play app name: 30 characters max.
- Google Play short description: 80 characters max.
- Google Play full description: 4000 characters max.
- Google Play feature graphic: 1024 x 500.

References:
- Apple app information: https://developer.apple.com/help/app-store-connect/reference/app-information/
- Apple platform version information: https://developer.apple.com/help/app-store-connect/reference/platform-version-information
- Apple categories: https://developer.apple.com/app-store/categories/
- Google Play app setup and listing fields: https://support.google.com/googleplay/android-developer/answer/9859152
- Google Play preview assets: https://support.google.com/googleplay/android-developer/answer/9866151
- Google Play metadata policy: https://support.google.com/googleplay/android-developer/answer/9898842

## App Store Connect Main Upload

App:
- App Store Connect app id: `6760968757`
- Public app id: `id6760968757`

Use exact metadata from:
- `APPSTORE_LISTING.md`

Required paths:
- iPhone screenshots: `/Users/zyesha/Desktop/APPLE_UPLOAD_USE_THESE_6_5_SCREENSHOTS`
- iPad screenshots: `/Users/zyesha/Desktop/APPLE_UPLOAD_USE_THESE_IPAD_13_SCREENSHOTS`

Screenshot order:
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

Recommended App Store product page fields:
- Name: `OBubba Baby Tracker`
- Subtitle: `Sleep, feeds, naps & nappies`
- Promotional text: `Understand your baby's rhythm with gentle tracking for feeds, naps, night wakes, nappies, carers and calmer next steps.`
- Keywords: `newborn,breastfeeding,bottle,weaning,growth,milestone,routine,wake,window,parent,carer,diary`
- Primary category: `Lifestyle`
- Secondary category: `Health & Fitness`
- Privacy policy URL: `https://obubba.com/privacy`
- Support URL: `https://obubba.com`
- Marketing URL: `https://obubba.com`

Do not click `Add for Review` until screenshots, pricing and subscriptions are checked in the version page.

## Apple Custom Product Pages

Create these after the main product page is stable. Each one can use custom screenshots and promotional text. Public URLs only work after review approval.

### 1. Sleep Rhythm

Reference name:
`Sleep Rhythm`

Promotional text:
Track naps, night wakes and bedtime rhythm with gentle guidance that looks at the whole baby day.

Screenshot order:
1. `04-sleep-advice-that-reads-the-whole-night.png`
2. `01-know-what-baby-needs-next.png`
3. `02-less-alone-at-3am.png`
4. `03-one-calm-place-for-care.png`
5. `06-parents-need-care-too.png`
6. `08-bubba-care-for-your-village.png`

Landing page for matching ads:
`https://obubba.com/baby-wake-window-tracker.html?utm_source=app_store&utm_medium=custom_product_page&utm_campaign=sleep`

### 2. Newborn Daily Log

Reference name:
`Newborn Daily Log`

Promotional text:
Feeds, nappies, sleep and notes in one calm log, so 3am care does not live in tired memory.

Screenshot order:
1. `03-one-calm-place-for-care.png`
2. `01-know-what-baby-needs-next.png`
3. `09-feeding-support-for-every-route.png`
4. `02-less-alone-at-3am.png`
5. `04-sleep-advice-that-reads-the-whole-night.png`
6. `08-bubba-care-for-your-village.png`

Landing page for matching ads:
`https://obubba.com/newborn-feeding-and-nappy-log.html?utm_source=app_store&utm_medium=custom_product_page&utm_campaign=newborn`

### 3. Family Handovers

Reference name:
`Family Handovers`

Promotional text:
Share the baby day with partners, grandparents, nurseries and babysitters without five tired texts.

Screenshot order:
1. `08-bubba-care-for-your-village.png`
2. `03-one-calm-place-for-care.png`
3. `01-know-what-baby-needs-next.png`
4. `02-less-alone-at-3am.png`
5. `09-feeding-support-for-every-route.png`
6. `10-travel-with-less-rhythm-chaos.png`

Landing page for matching ads:
`https://obubba.com/nursery-baby-handover-app.html?utm_source=app_store&utm_medium=custom_product_page&utm_campaign=handover`

### 4. Weaning And Milestones

Reference name:
`Weaning And Milestones`

Promotional text:
Keep first foods, allergens, play ideas, milestones and memory book moments beside the baby day.

Screenshot order:
1. `05-weaning-without-the-panic.png`
2. `07-play-that-fits-their-stage.png`
3. `03-one-calm-place-for-care.png`
4. `01-know-what-baby-needs-next.png`
5. `06-parents-need-care-too.png`
6. `09-feeding-support-for-every-route.png`

Landing page for matching ads:
`https://obubba.com/baby-weaning-tracker.html?utm_source=app_store&utm_medium=custom_product_page&utm_campaign=weaning`

## Google Play Main Store Listing

App:
- Package: `com.obubba.app`
- Play Console app id: `4972336244180701679`
- Store listings page: `https://play.google.com/console/u/0/developers/8912859958315035631/app/4972336244180701679/store-listings`
- Experiments page: `https://play.google.com/console/u/0/developers/8912859958315035631/app/4972336244180701679/store-listing-experiments/overview`

Use exact text from:
- `APPSTORE_LISTING.md`

Fields:
- App name: `OBubba Baby Tracker`
- Short description: `Track feeds, sleep, naps and nappies. Learn your baby's rhythm.`
- Full description: use the Google Play full description in `APPSTORE_LISTING.md`.
- Category: `Parenting`
- Privacy policy: `https://obubba.com/privacy`
- Contact email: `hello@obubba.com`
- Website: `https://obubba.com`

Assets:
- Feature graphic: `/Users/zyesha/Desktop/ANDROID_UPLOAD_USE_THESE/feature-graphic-1024x500.png`
- Phone screenshots: `/Users/zyesha/Desktop/ANDROID_UPLOAD_USE_THESE/screenshots-phone-1080x1920`
- Optional YouTube preview source: `/Users/zyesha/Desktop/ANDROID_UPLOAD_USE_THESE/video-for-youtube/obubba-google-play-preview-1080x1920.mp4`

Google Play screenshot order:
1. `01-know-what-baby-needs-next.png`
2. `02-less-alone-at-3am.png`
3. `03-one-calm-place-for-care.png`
4. `04-sleep-advice-that-reads-the-whole-night.png`
5. `05-weaning-without-the-panic.png`
6. `06-parents-need-care-too.png`
7. `07-play-that-fits-their-stage.png`
8. `08-bubba-care-for-your-village.png`

## Google Play Custom Store Listings

Create these from Play Console > Store presence > Custom store listings.

### 1. Sleep Tracker

Listing name:
`OBubba Sleep Tracker`

Targeting:
- Search intent / ad group where available
- Keywords/intents: baby sleep tracker, nap tracker, wake window tracker, baby routine app

Short description:
Track naps, night wakes, bedtime and wake windows in one calm baby sleep app.

Full description opener:
OBubba helps tired parents understand baby sleep in the context of the whole day. Track naps, feeds, nappies, bedtime, night wakes and mood notes in one calm timeline, then use patterns to plan the next gentle step.

Screenshot order:
1. `04-sleep-advice-that-reads-the-whole-night.png`
2. `01-know-what-baby-needs-next.png`
3. `02-less-alone-at-3am.png`
4. `03-one-calm-place-for-care.png`
5. `06-parents-need-care-too.png`
6. `08-bubba-care-for-your-village.png`

Landing URL:
`https://obubba.com/baby-wake-window-tracker.html?utm_source=google_play&utm_medium=custom_store_listing&utm_campaign=sleep`

### 2. Newborn Tracker

Listing name:
`OBubba Newborn Tracker`

Targeting:
- Keywords/intents: newborn tracker, baby feeding log, nappy log, baby daily log

Short description:
Track newborn feeds, nappies, sleep and notes without relying on tired memory.

Full description opener:
Newborn care is too much to keep in your head at 3am. OBubba keeps feeds, nappies, naps, sleep and notes together, so parents and carers can see what happened without rebuilding the day from memory.

Screenshot order:
1. `03-one-calm-place-for-care.png`
2. `01-know-what-baby-needs-next.png`
3. `09-feeding-support-for-every-route.png`
4. `02-less-alone-at-3am.png`
5. `04-sleep-advice-that-reads-the-whole-night.png`
6. `08-bubba-care-for-your-village.png`

Landing URL:
`https://obubba.com/newborn-feeding-and-nappy-log.html?utm_source=google_play&utm_medium=custom_store_listing&utm_campaign=newborn`

### 3. Shared Care

Listing name:
`OBubba Shared Care`

Targeting:
- Keywords/intents: partner baby tracker, baby tracker for grandparents, nursery handover

Short description:
Share feeds, naps, nappies and routines with partners, grandparents and carers.

Full description opener:
OBubba helps baby care stop living in one parent's head. Track the day once, then use clear care context for partners, grandparents, nurseries, babysitters and family handovers.

Screenshot order:
1. `08-bubba-care-for-your-village.png`
2. `03-one-calm-place-for-care.png`
3. `01-know-what-baby-needs-next.png`
4. `02-less-alone-at-3am.png`
5. `09-feeding-support-for-every-route.png`
6. `10-travel-with-less-rhythm-chaos.png`

Landing URL:
`https://obubba.com/nursery-baby-handover-app.html?utm_source=google_play&utm_medium=custom_store_listing&utm_campaign=handover`

### 4. Weaning And Milestones

Listing name:
`OBubba Weaning Tracker`

Targeting:
- Keywords/intents: baby weaning tracker, allergen tracker, baby milestone tracker, baby memory book

Short description:
Track first foods, allergens, milestones and memories beside the baby day.

Full description opener:
OBubba keeps weaning, allergens, reactions, milestones and memory book moments beside the everyday baby log, so parents can see the whole picture without another separate app.

Screenshot order:
1. `05-weaning-without-the-panic.png`
2. `07-play-that-fits-their-stage.png`
3. `03-one-calm-place-for-care.png`
4. `01-know-what-baby-needs-next.png`
5. `06-parents-need-care-too.png`
6. `09-feeding-support-for-every-route.png`

Landing URL:
`https://obubba.com/baby-weaning-tracker.html?utm_source=google_play&utm_medium=custom_store_listing&utm_campaign=weaning`

## Store Listing Experiments

Run one variable at a time. Do not change description and screenshot order in the same experiment unless traffic is too low and the test is clearly exploratory.

### Google Play Experiment 1: Short Description

Name:
`Short description - rhythm clarity`

Control:
`Track feeds, sleep, naps and nappies. Learn your baby's rhythm.`

Variant A:
`Baby feeds, naps, sleep and nappies in one calm tracker.`

Variant B:
`Understand feeds, sleep, nappies and night wakes without tired memory.`

Primary metric:
Store listing conversion rate.

### Google Play Experiment 2: First Screenshot

Name:
`First screenshot - sleep rhythm`

Control:
`01-know-what-baby-needs-next.png`

Variant A:
`04-sleep-advice-that-reads-the-whole-night.png`

Variant B:
`03-one-calm-place-for-care.png`

Primary metric:
Store listing conversion rate.

### Apple Product Page Optimization Test

Test:
`First screenshot promise`

Control first screenshot:
`01-know-what-baby-needs-next.png`

Treatment A first screenshot:
`04-sleep-advice-that-reads-the-whole-night.png`

Treatment B first screenshot:
`03-one-calm-place-for-care.png`

Keep name, subtitle, promotional text and screenshots 2-10 unchanged during the test.

## Tracking Checklist

Track weekly:
- App Store impressions
- App Store product page views
- App Store conversion rate
- Google Play store listing visitors
- Google Play acquisitions
- Store search terms where available
- Website store-button clicks by landing page
- Install to onboarding completion
- Trial start
- Trial to paid conversion

UTM rule:
- Apple custom product page campaign: `utm_source=app_store&utm_medium=custom_product_page`
- Google custom store listing campaign: `utm_source=google_play&utm_medium=custom_store_listing`
- Website SEO campaign: `utm_source=organic&utm_medium=website`

## Final Human Clicks

1. Paste main App Store metadata.
2. Upload App Store iPhone and iPad screenshots.
3. Confirm subscriptions/prices are correct.
4. Add App Store custom product pages.
5. Submit App Store changes for review.
6. Paste Google Play main listing metadata.
7. Upload Google Play screenshots and feature graphic.
8. Create Google Play custom store listings.
9. Start Google Play experiments only after listings are live.
