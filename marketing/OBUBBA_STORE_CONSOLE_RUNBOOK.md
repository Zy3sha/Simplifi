# OBubba Store Console Runbook

Date: 2026-05-13

This runbook captures the account-side growth work that has to happen inside App Store Connect and Google Play Console.

## App Store Connect

App:
- OBubba
- App Store Connect app id: `6760968757`

Custom product page draft:
- Reference name: `Sleep Rhythm`
- Product page id: `77bb6034-ab63-4416-94dd-64be87633399`
- Draft URL: `https://appstoreconnect.apple.com/apps/6760968757/distribution/productpages/781bf252-00e4-4734-b9d4-4367ef251a72`
- Expected public URL after approval: `https://apps.apple.com/app/id6760968757?ppid=77bb6034-ab63-4416-94dd-64be87633399`

Saved draft assets:
- iPhone 6.5" screenshots: `/Users/zyesha/Desktop/APPLE_UPLOAD_USE_THESE_6_5_SCREENSHOTS`
- iPad 13" screenshots: `/Users/zyesha/Desktop/APPLE_UPLOAD_USE_THESE_IPAD_13_SCREENSHOTS`

Saved draft promotional text:
> Understand your baby's rhythm with gentle sleep, feed and wake tracking, bedtime guidance, and calmer next steps for exhausted parents.

Saved draft keywords:
- baby tracker
- newborn
- sleep tracker
- nap
- parenting
- infant

Next action:
- Review screenshots and copy in App Store Connect.
- Click `Add for Review` only after explicit approval.

## Google Play Console

App:
- OBubba
- Package: `com.obubba.app`
- Play Console app id: `4972336244180701679`
- Store listings page: `https://play.google.com/console/u/0/developers/8912859958315035631/app/4972336244180701679/store-listings`
- Experiments page: `https://play.google.com/console/u/0/developers/8912859958315035631/app/4972336244180701679/store-listing-experiments/overview`

Note:
- Play Console ignored scripted Safari clicks on `Create custom store listing`.
- Continue by clicking `Create custom store listing` manually, or grant Accessibility permission for automation.

### Custom Store Listing: Sleep Tracker

Name:
OBubba Sleep Tracker

Targeting:
- Use search intent / organic acquisition where available.
- Keywords/intents: baby sleep tracker, nap tracker, wake window tracker, baby routine app.

Short description:
Track naps, night wakes, bedtime and wake windows in one calm baby sleep tracker.

Full description opener:
OBubba helps tired parents understand baby sleep in the context of the whole day. Track naps, feeds, nappies, bedtime, night wakes and mood notes in one calm timeline, then use patterns to plan the next gentle step.

Screenshot source:
- Phone screenshots: `/Users/zyesha/Desktop/ANDROID_UPLOAD_USE_THESE/screenshots-phone-1080x1920`
- First screenshots to prioritize: `04-sleep-advice-that-reads-the-whole-night.png`, `01-know-what-baby-needs-next.png`, `02-less-alone-at-3am.png`

Landing URL for campaigns:
`https://obubba.com/baby-wake-window-tracker.html?utm_source=google_play&utm_medium=custom_store_listing&utm_campaign=sleep`

### Custom Store Listing: Newborn Tracker

Name:
OBubba Newborn Tracker

Targeting:
- Keywords/intents: newborn tracker, baby feeding log, nappy log, baby daily log.

Short description:
Track newborn feeds, nappies, sleep and notes without relying on tired memory.

Full description opener:
Newborn care is too much to keep in your head at 3am. OBubba keeps feeds, nappies, naps, sleep and notes together, so parents and carers can see what happened without rebuilding the day from memory.

Screenshot source:
- Phone screenshots: `/Users/zyesha/Desktop/ANDROID_UPLOAD_USE_THESE/screenshots-phone-1080x1920`
- First screenshots to prioritize: `03-one-calm-place-for-care.png`, `01-know-what-baby-needs-next.png`, `09-feeding-support-for-every-route.png`

Landing URL for campaigns:
`https://obubba.com/newborn-feeding-and-nappy-log.html?utm_source=google_play&utm_medium=custom_store_listing&utm_campaign=newborn`

### Custom Store Listing: Shared Care

Name:
OBubba Shared Care

Targeting:
- Keywords/intents: partner baby tracker, baby tracker for grandparents, nursery handover.

Short description:
Share feeds, naps, nappies and routines with partners, grandparents and carers.

Full description opener:
OBubba helps baby care stop living in one parent's head. Track the day once, then use clear care context for partners, grandparents, nurseries, babysitters and family handovers.

Screenshot source:
- Phone screenshots: `/Users/zyesha/Desktop/ANDROID_UPLOAD_USE_THESE/screenshots-phone-1080x1920`
- First screenshots to prioritize: `08-bubba-care-for-your-village.png`, `03-one-calm-place-for-care.png`, `01-know-what-baby-needs-next.png`

Landing URL for campaigns:
`https://obubba.com/nursery-baby-handover-app.html?utm_source=google_play&utm_medium=custom_store_listing&utm_campaign=handover`

## Google Play Experiments

Experiment 1:
- Name: `Short description - newborn clarity`
- Control: current short description.
- Variant: `Track newborn feeds, nappies, sleep and notes without relying on tired memory.`
- Primary metric: store listing conversion.

Experiment 2:
- Name: `First screenshot - sleep rhythm`
- Control: current first screenshot.
- Variant first screenshot: `/Users/zyesha/Desktop/ANDROID_UPLOAD_USE_THESE/screenshots-phone-1080x1920/04-sleep-advice-that-reads-the-whole-night.png`
- Primary metric: store listing conversion.

Experiment 3:
- Name: `First screenshot - one calm place`
- Control: current first screenshot.
- Variant first screenshot: `/Users/zyesha/Desktop/ANDROID_UPLOAD_USE_THESE/screenshots-phone-1080x1920/03-one-calm-place-for-care.png`
- Primary metric: store listing conversion.

Do not start experiments until the variants are reviewed and approved.

