# OBubba App Store + Google Play Ads Launch Pack

Prepared: 2026-05-14

This is the paid app acquisition setup pack for Apple Ads/App Store and Google Ads App campaigns. It is ready for account upload, but live spend still needs owner approval.

Update 2026-05-15: the upload-ready, verified-file version of this pack now lives in `marketing/growth-sprint/`. Use that folder for account work because every referenced asset path was checked locally after the first pass:

- `marketing/growth-sprint/apple_search_ads_build_sheet.csv`
- `marketing/growth-sprint/google_app_campaign_assets.csv`
- `marketing/growth-sprint/store_custom_pages_and_experiments.md`
- `marketing/growth-sprint/creator_pr_outreach_kit.md`
- `marketing/growth-sprint/paid_user_projection.md`
- `marketing/growth-sprint/tonight_operator_checklist.md`

## Measurement First

Use these Firebase events as the paid traffic quality ladder:

1. `first_open`
2. `onboarding_started`
3. `onboarding_completed`
4. `child_added`
5. `first_log_created`
6. `three_logs_created`
7. `trial_started`
8. `paywall_viewed`
9. `purchase_started`
10. `purchase_success`

Campaign names should include platform, country, intent, and date:

- `ios_asa_gb_sleep_rhythm_2026_05`
- `ios_asa_gb_baby_tracker_2026_05`
- `android_google_gb_app_installs_2026_05`
- `android_google_us_app_installs_2026_05`

## Launch Guardrails

- Start countries separately: GB first, then US, AU, CA.
- Do not mix iOS and Android reporting in one dashboard view.
- First optimization target: installs/first opens until enough data arrives.
- Quality target after volume: `first_log_created`, then `three_logs_created`.
- Paid spend is not approved by this document. Launch paused or with tiny test budget only after owner approval.

## Apple Ads Setup

Official notes used:

- Apple Ads campaigns can target App Store Search Results and other Apple ad placements.
- Custom product pages can be used as ad variations so the App Store page matches the keyword/audience intent.
- Apple Ads Search Results campaigns should be split by intent so bids, search terms, and product pages stay readable.
- Reference: https://developer.apple.com/app-store/custom-product-pages/

Recommended first campaign type: Search Results.

### Campaign 1: Brand Defense

Name: `ios_asa_gb_brand_2026_05`

Goal: capture people already searching for OBubba or close misspellings.

Ad groups:

- Exact brand
- Broad brand misspellings

Keywords:

- obubba
- o bubba
- obuba
- obubby
- obubba baby tracker
- obubba app
- obubba sleep

Custom product page:

- Default App Store page.

Bid posture:

- Highest intent, low volume. Keep bids competitive enough to own the brand result.

### Campaign 2: Baby Tracker Core

Name: `ios_asa_gb_baby_tracker_2026_05`

Goal: capture broad parent demand.

Keywords:

- baby tracker
- baby tracker app
- newborn tracker
- newborn tracker app
- baby log app
- baby logging app
- baby routine app
- baby schedule app
- baby care app
- infant tracker
- feeding and sleep tracker
- baby feed tracker
- baby nappy tracker
- baby nap tracker

Custom product page:

- All-in-one tracker page.
- First screenshot: "Know what baby needs next"
- Follow with care timeline, sleep insight, feeding support, and family sync.

### Campaign 3: Sleep + Rhythm

Name: `ios_asa_gb_sleep_rhythm_2026_05`

Goal: enter the strongest emotional category without sounding like a generic sleep chart.

Keywords:

- baby sleep tracker
- baby sleep app
- baby nap tracker
- newborn sleep tracker
- baby wake windows
- baby wake window app
- baby bedtime app
- night wake tracker
- baby sleep schedule
- baby sleep routine
- baby sleep consultant app
- baby sleep advice

Custom product page:

- Sleep/rhythm page.
- First screenshot: clock/rhythm visual.
- Support line: "OBubba learns your baby's rhythm from real logs."

### Campaign 4: Shared Baby Brain

Name: `ios_asa_gb_family_sync_2026_05`

Goal: own partner sync and care handover.

Keywords:

- baby tracker for parents
- shared baby tracker
- baby tracker family
- baby app for couples
- baby care handover
- baby diary app
- baby routine share
- co parent baby app
- grandparents baby app

Custom product page:

- Bubba Care / family sync page.
- First screenshot: shared timeline or account/sync screen.
- Support line: "Mum logs it. Dad sees it. Everyone stays calmer."

### Campaign 5: Competitor Discovery

Name: `ios_asa_gb_competitor_discovery_2026_05`

Goal: learn what competitor-intent traffic costs.

Important:

- Do not use competitor trademarks in ad copy or screenshots.
- Keep this as a separate low-budget test.

Keywords:

- huckleberry baby tracker
- huckleberry sleep app
- napper baby sleep
- nara baby tracker
- onoco baby tracker
- baby tracker plus
- feed baby app

Custom product page:

- Sleep/rhythm page for sleep competitors.
- All-in-one tracker page for broad tracker competitors.

## Google Ads App Campaign Setup

Official notes used:

- Google App campaigns use automated targeting across Google Search, Google Play, YouTube, Discover, Display, and other inventory.
- Text assets must work independently because Google mixes them.
- Google App campaigns support headline assets up to 30 characters and descriptions up to 90 characters.
- Reference: https://support.google.com/google-ads/answer/6357595

Recommended first campaign type:

- App campaign for installs.

Campaigns:

- `android_google_gb_app_installs_2026_05`
- `android_google_us_app_installs_2026_05`
- `android_google_au_app_installs_2026_05`

Primary goal:

- Installs / first opens at launch.

Secondary quality signals:

- `onboarding_completed`
- `first_log_created`
- `three_logs_created`
- `trial_started`
- `purchase_success`

### Google Headlines

All are 30 characters or less.

- Understand baby rhythm
- Track feeds and sleep
- Baby tracker for 3am
- One calm baby app
- Feeds naps nappies
- Mum logs Dad sees
- Your shared baby brain
- Less guessing tonight
- Learn your baby rhythm
- Newborn tracking made calm

### Google Descriptions

All are 90 characters or less.

- Track feeds, naps, nappies, sleep and night wakes in one calm place.
- OBubba learns your baby rhythm from real logs, not generic charts.
- Built by a tired parent to make baby care easier at 3am.
- Share one baby timeline across iPhone and Android.
- Start with one log and see calmer patterns over time.
- For newborns, night wakes, feeds, naps, weaning and family handovers.
- Keep parents and carers in sync without messages and memory tests.
- Free to start. Premium adds deeper guidance and calmer planning.

### Asset Mapping

Use these existing repo assets first:

- Horizontal image: `app-store-screenshots/android/feature-graphic-1024x500.png`
- Android phone screenshots: `app-store-screenshots/android/phone-upload-1080x1920/`
- Google Play preview video: `app-store-screenshots/android/video-for-youtube/obubba-google-play-preview-1080x1920.mp4`
- Fireflies feature video: `app-store-screenshots/video/obubba-fireflies-feature-tour-iphone-886x1920.mp4`
- Launch ads video set: `marketing/obubba-launch-ads/renders/`

Preferred video upload order:

1. `marketing/obubba-launch-ads/renders/obubba-ad-03-3am-night-logging.mp4`
2. `marketing/obubba-launch-ads/renders/obubba-ad-02-ios-android-sync.mp4`
3. `marketing/obubba-launch-ads/renders/obubba-ad-01-all-in-one.mp4`
4. `app-store-screenshots/video/obubba-fireflies-feature-tour-iphone-886x1920.mp4`

### Creative Angles

Use these as separate asset groups when the account allows asset grouping.

#### 1. 3am Rescue

Hook:

- "At 3am, memory is gone. OBubba remembers."

Best assets:

- Night logging video.
- Clock/rhythm screenshot.
- Sleep insight screenshot.

Best descriptions:

- Built by a tired parent to make baby care easier at 3am.
- Track feeds, naps, nappies, sleep and night wakes in one calm place.

#### 2. Shared Baby Brain

Hook:

- "Mum logs it. Dad sees it."

Best assets:

- iOS + Android partner sync video.
- Bubba Care screenshot.
- Account/sync screenshot.

Best descriptions:

- Share one baby timeline across iPhone and Android.
- Keep parents and carers in sync without messages and memory tests.

#### 3. Baby Rhythm

Hook:

- "Generic charts do not know your baby."

Best assets:

- Fireflies/clock video.
- Sleep insight screenshot.
- Track night screenshot.

Best descriptions:

- OBubba learns your baby rhythm from real logs, not generic charts.
- Start with one log and see calmer patterns over time.

## Negative / Exclusion Notes

Apple Ads negative keyword candidates:

- pregnancy
- contraction timer
- baby names
- baby games
- pregnancy tracker
- ovulation
- fertility
- toddler games
- baby monitor camera

Google App campaigns have less manual keyword control. Use store listing quality, asset pruning, and country/language separation to steer traffic.

## First Week Reading

Day 1-2:

- Check installs, first opens, and crash-free users.
- Pause any asset rejected by platform policy.

Day 3-4:

- Compare `onboarding_completed / first_open`.
- Compare `first_log_created / first_open`.
- Watch Android vs iOS separately.

Day 5-7:

- Move budget toward the campaign with strongest `three_logs_created / first_open`.
- Do not judge by installs alone.
- Keep spend low until Firebase purchase and premium funnel events are clean.
