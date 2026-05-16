# OBubba Store Custom Pages and Experiments

Prepared: 2026-05-15

Use this to build App Store custom product pages, Apple product page optimization tests, Google Play custom store listings, and Google Play store listing experiments.

## Apple Custom Product Pages

Create these pages in App Store Connect. Do not publish live changes until final review.

### Page 1: Rhythm Clock

Purpose: sleep tracker, wake windows, baby rhythm, bedtime, nap prediction traffic.

Campaign mapping:

- `ios_asa_gb_sleep_rhythm_2026_05`
- `ios_asa_us_sleep_rhythm_2026_05`
- `ios_asa_au_sleep_rhythm_2026_05`

Promotional text:

OBubba learns your baby's rhythm from real feeds, naps, sleep and night wakes.

Screenshot order:

1. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/01-know-what-baby-needs-next.png`
2. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/04-sleep-advice-that-reads-the-whole-night.png`
3. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/02-less-alone-at-3am.png`
4. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/03-one-calm-place-for-care.png`
5. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/08-bubba-care-for-your-village.png`

### Page 2: Newborn 3am

Purpose: newborn, night waking, first-time parent, 3am logging traffic.

Campaign mapping:

- `ios_asa_gb_baby_tracker_2026_05`
- TikTok/Reels creator links
- Meta Reels newborn audience

Promotional text:

Made for the 3am feed, the half-asleep nappy, and the question: what happened last?

Screenshot order:

1. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/02-less-alone-at-3am.png`
2. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/01-know-what-baby-needs-next.png`
3. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/03-one-calm-place-for-care.png`
4. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/04-sleep-advice-that-reads-the-whole-night.png`
5. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/06-parents-need-care-too.png`

### Page 3: Breastfeeding Support

Purpose: breastfeeding timer, nursing tracker, combi feeding, newborn feeding traffic.

Campaign mapping:

- `ios_asa_gb_breastfeeding_2026_05`
- Creator outreach to breastfeeding/newborn accounts

Promotional text:

Track left and right feeds, bottles, pumps and patterns without losing the thread.

Screenshot order:

1. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/09-feeding-support-for-every-route.png`
2. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/02-less-alone-at-3am.png`
3. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/03-one-calm-place-for-care.png`
4. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/01-know-what-baby-needs-next.png`
5. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/08-bubba-care-for-your-village.png`

### Page 4: Family Sync

Purpose: shared tracker, partner sync, co-parent, carers, village traffic.

Campaign mapping:

- `ios_asa_gb_family_sync_2026_05`
- Meta audience: new parents/couples

Promotional text:

One baby timeline for parents and carers, whether they use iPhone or Android.

Screenshot order:

1. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/08-bubba-care-for-your-village.png`
2. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/03-one-calm-place-for-care.png`
3. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/01-know-what-baby-needs-next.png`
4. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/02-less-alone-at-3am.png`
5. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/06-parents-need-care-too.png`

## Apple Product Page Optimization Tests

Run one test at a time.

### Test A: First Screenshot

Hypothesis: "Know what baby needs next" converts better than "Less alone at 3am" for broad App Store visitors.

Control first screenshot:

- `01-know-what-baby-needs-next.png`

Treatment first screenshot:

- `02-less-alone-at-3am.png`

Primary read:

- App Store product page conversion rate.

Secondary read:

- Firebase `onboarding_completed`, `first_log_created`, `trial_started`.

### Test B: Sleep Benefit Versus All-In-One

Hypothesis: sleep/rhythm positioning converts higher quality trials than all-in-one tracking.

Control:

- Default screenshot order from current listing.

Treatment:

- `04-sleep-advice-that-reads-the-whole-night.png` moved to slot 2.
- `01-know-what-baby-needs-next.png` remains slot 1.

## Google Play Custom Store Listings

### Listing 1: Sleep Rhythm

Short description:

Baby tracker for feeds, naps, sleep and night wakes that learns your rhythm.

Full description opening:

OBubba is a calm baby tracker for tired parents. Log feeds, nappies, naps, sleep and night wakes, then see what your baby's rhythm is trying to tell you.

Asset order:

1. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/android/phone-upload-1080x1920/01-know-what-baby-needs-next.png`
2. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/android/phone-upload-1080x1920/04-sleep-advice-that-reads-the-whole-night.png`
3. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/android/phone-upload-1080x1920/02-less-alone-at-3am.png`
4. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/android/phone-upload-1080x1920/03-one-calm-place-for-care.png`

Feature graphic:

- `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/android/feature-graphic-1024x500.png`

Video:

- `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/android/video-for-youtube/obubba-google-play-preview-1080x1920.mp4`

### Listing 2: Parent Sync

Short description:

One shared baby tracker for feeds, naps, nappies and care handovers.

Asset order:

1. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/android/phone-upload-1080x1920/08-bubba-care-for-your-village.png`
2. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/android/phone-upload-1080x1920/03-one-calm-place-for-care.png`
3. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/android/phone-upload-1080x1920/01-know-what-baby-needs-next.png`
4. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/android/phone-upload-1080x1920/02-less-alone-at-3am.png`

### Listing 3: Breastfeeding and Newborn

Short description:

Track breastfeeds, bottles, naps, nappies and night wakes in one calm app.

Asset order:

1. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/android/extra-screenshots-1080x1920/10-feeding-support-for-every-route.png`
2. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/android/phone-upload-1080x1920/02-less-alone-at-3am.png`
3. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/android/phone-upload-1080x1920/03-one-calm-place-for-care.png`
4. `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/android/phone-upload-1080x1920/01-know-what-baby-needs-next.png`

## Google Play Store Listing Experiments

Run in GB first. Use 50/50 split where Play Console allows. Leave tests until meaningful installs or at least 7 days.

### Experiment 1: Short Description

Control:

Baby tracker for feeds, naps, sleep, nappies, growth and family sync.

Variant:

Understand your baby's rhythm from feeds, naps, sleep and night wakes.

Decision metric:

- Store listing conversion rate.
- Firebase `first_log_created` per first open.

### Experiment 2: First Screenshot

Control first screenshot:

- `01-know-what-baby-needs-next.png`

Variant first screenshot:

- `02-less-alone-at-3am.png`

Decision metric:

- Install conversion.
- Trial start rate.
