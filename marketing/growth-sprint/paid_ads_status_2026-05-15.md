# OBubba Paid Ads Status

Prepared: 2026-05-15

## Build Readiness

- Web build passed with cache version `1778854141`.
- Android build passed: `2.7.8 (59)`.
- iOS simulator build passed: `2.7.8 (50)`.
- Android emulator smoke passed on `emulator-5554`.
- Android breast timer smoke passed: one tap starts timer, active side highlights, switching sides pauses/resumes the correct side.
- Android crash buffer stayed empty after startup and breast timer smoke.

## Google Play

- Live production release is still `2.7.8 (58)`.
- `2.7.8 (58)` has a Play Console timer-service crash affecting ad readiness.
- Uploaded `2.7.8 (59)` AAB through the Android Publisher API.
- `2.7.8 (59)` is attached to production as a draft release, not live.
- Draft release notes: `Stability fixes for Android feeding timers and background timer notifications before the ad launch.`
- Owner confirmation needed before sending the draft to review or publishing:
  `Submit/release this OBubba store change now.`

## Apple Ads

- Apple Ads is signed in and linked to `OLife Labs Limited`.
- Account creation appears complete; Safari reached `Create Campaign`.
- Account fields observed before campaign creation:
  - Account name: `OLife Labs Limited`
  - Country: `United Kingdom`
  - Phone country code: `+44`
  - Legal entity name: `OLife Labs Limited`
  - Primary contact name: `Zyesha Reynolds`
  - Email: `zy3sha@gmail.com`
- App selection later succeeded:
  - Apple Ads found `OBubba Baby Tracker`.
  - `Search Results` placement was selected.
  - Campaign name entered: `ios_asa_uk_us_au_brand_2026_05`.
- 2026-05-16 update:
  - User approved choosing Apple Ads countries from Firebase performance rather than forcing GB-only.
  - Firebase overview export dated 2026-05-14 shows the strongest country-attributed active-user signal in `GB` 968, `US` 468, `AU` 223, then `CA` 80, `NZ` 39, `IE` 38, `ZA` 26.
  - Recommended Apple launch set is `United Kingdom`, `United States`, `Australia`.
  - Add `Canada`, `Ireland`, and `New Zealand` only if Apple allows a separate low-spend campaign/cap.
  - Hold `South Africa` and the long tail for now.
  - Safari has since redirected Apple Ads back to Apple sign-in, so campaign creation cannot continue until the owner signs in again.
- Campaign created:
  - Campaign ID: `2143866197`.
  - Placement: `Search Results`.
  - Countries/regions: `Australia`, `United Kingdom`, `United States`.
  - Daily budget: `GBP 8.00`.
  - Ad group: `brand_search_manual`.
  - Default max CPT bid: `GBP 0.30`.
  - Intended start: `2026-05-16 00:00`.
  - Intended end: `2026-05-25 00:00`.
- Current blocker:
  - Campaign status remains `On hold`.
  - Apple Ads showed hold reasons `No payment method` and `App pending review`.
  - User later said payment details were entered, but the Apple Ads campaign page still showed `No payment method` when checked.
- Owner action needed:
  - Confirm the payment method was added in Apple Ads specifically, then refresh campaign `2143866197`.
  - If `No payment method` clears and only `App pending review` remains, wait for Apple review before expecting spend.
  - Do not increase the campaign above `GBP 8/day` or the `GBP 80` Apple test cap.

## Google Ads

- Google Ads account setup page is open for `272-475-8468`.
- Business name `OBubba` is filled.
- Destination is set to app download page.
- Android app is linked: `com.obubba.app - OBubba Baby Tracker`.
- Draft campaign path reached Google App Campaign review.
- Draft settings entered:
  - Campaign name: `OBubba Android UK installs - Bubba Care`
  - Location: `United Kingdom`
  - Language: `English`
  - EU political ads: `Doesn't have EU political ads`
  - Budget: `GBP 10/day`
  - Target CPI tried: `GBP 0.20`
- Text assets were re-entered successfully in the editor:
  - Headlines: `Bubba Care support`, `Partner sync for baby`, `Parent Room support`, `Fireflies at 3am`, `Less lonely nights`.
  - Descriptions focus on Bubba Care, partner sync, Parent Room mental-health support, and fireflies reducing lonely 3am moments.
- The page still shows the Google Ads warning: `Turn off ad blockers`.
- Current blocker symptom:
  - Safari per-site content blockers appear off for `ads.google.com`, no obvious local blocker app/extension was found, but Google Ads still displays `Turn off ad blockers`.
  - A fresh campaign tab still re-used the same Google Ads draft session and returned to `Changes failed to save`.
  - Review flags `Locations: Item not found`, `Languages: Item not found`, and `Ad assets: Item not found` even when the visible review values show `United Kingdom`, `English`, and `5 headlines and 5 descriptions`.
- Owner action needed:
  - Try Google Ads in a clean Chrome/Safari profile signed into `zy3sha@gmail.com`, with no content blockers/extensions, or ask Google Ads support to clear the stuck draft session.
  - Do not launch until review shows no `Item not found` errors.
- Chrome incognito follow-up:
  - User opened a Chrome incognito tab.
  - The Google Ads draft URL was opened there and is signed into `zy3sha@gmail.com`.
  - Account picker showed `OBubba 272-475-8468 (Setup in progress)`.
  - Chrome currently blocks AppleScript JavaScript automation with `Allow JavaScript from Apple Events` turned off, so the form cannot be inspected directly.
  - Google Ads found the app and previewed `OBubba Baby Tracker`.
  - Headlines were entered and verified: `Bubba Care support`, `Partner sync for baby`, `Parent Room support`, `Fireflies at 3am`, `Less lonely nights`.
  - Descriptions verified so far:
    - `Bubba Care, partner sync and Parent Room support for calmer baby tracking.`
    - `Fireflies show other parents are awake too, so 3am feels less lonely.`
    - `Track feeds, sleep and care with your partner in one calm place.`
  - A fourth description paste was attempted, but the Mac locked immediately afterward and the result was not verified.
  - Current blocker: the desktop is on the macOS lock screen, so no further safe browser automation or launch/review click can be performed until the owner unlocks it.

## Launch Guardrail

- First spend should stay under `GBP 20/day` total.
- Owner hard cap: `GBP 200` all-in across all ad platforms.
- Recommended starting split:
  - Google App Campaign: `GBP 10/day`, GB only, stop before `GBP 100`.
  - Apple Search Ads: `GBP 8-10/day`, Firebase-proven countries only, stop before `GBP 80`.
  - Keep at least `GBP 20` unspent reserve until the first quality read.
- Owner confirmation needed before paid spend:
  `Launch OBubba paid ads with a hard cap of GBP ___ total and GBP ___ per day.`
