# OBubba Launch Readiness Report

Date: 2026-05-02  
Repo audited: `/Users/zyesha/Desktop/simplify dev`  
App version checked: `2.7.5` / native build `42`  
Platforms: iOS, Android, hosted carer portal, PWA/SEO assets

## Executive status

**Recommendation: technically ready for final real-device release QA and closed beta. Amber for full paid-growth launch until store metadata, attribution, and live purchase/delete flows are verified in production-like tracks.**

This is the correct Desktop repo, and it is materially different from `/Users/zyesha/dev/Simplify`. The major blockers flagged in the earlier stale audit are fixed here:

- Packaged native purchase bridge is present in `dist`, `public`, iOS public assets, and Android public assets.
- Production owner premium override is disabled.
- Premium is not granted from local cache alone.
- `deleteAccount` Cloud Function exists and deletes Firebase Auth after verified cleanup.
- Firestore rules are much tighter and covered by repo audits.
- Backend reminder logic uses per-user timezone helpers.
- iOS and Android versions are aligned at `2.7.5`.

## Verification run

| Check | Result | Notes |
| --- | --- | --- |
| `npm run build` | Pass | Build completed, cache-busted app assets, rendered SEO/blog/sitemap assets, and cleaned duplicate generated artifacts. |
| `npm test` | Pass | Full audit suite passed after build cleanup. Includes sleep, Firestore rules, account security, premium entitlement, store readiness, native bridge, functions, privacy, runtime safety, image safety, carer portal, and artifact checks. |
| Sleep engine matrix | Pass | 73 scenario cases plus 13,971 combinatorial sweep cases; 0 hard failures and 0 warnings. |
| Android debug build | Pass | `./gradlew :app:assembleDebug` succeeded. APK output: `android/app/build/outputs/apk/debug/app-debug.apk` at about 51 MB. |
| iOS simulator build | Pass | `xcodebuild ... iphonesimulator` succeeded. Only Pods script-phase warnings were shown. No widget version mismatch warning. |
| Native purchase bridge parity | Pass | `native-plugins.js` line count is 1125 across `dist`, `public`, iOS public, and Android public copies. |

## Current go/no-go

### Closed beta / TestFlight / internal Play testing

**Go.** The codebase has enough automated coverage and native build proof to move into controlled real-parent testing.

Beta must still verify on physical devices:

- iOS sandbox purchase, restore, expired subscription, and lifetime purchase.
- Google Play test purchase, restore/acknowledgement, and subscription state.
- Delete account callable from a real signed-in account.
- Bubba Care share, expired care link, ended session, and carer logging.
- Push notification permission, local reminders, timer notifications, and notification tap actions.
- App resume after backgrounding while timers are active.
- Offline logging followed by sync.
- First-session onboarding in under 60 seconds.

### App Store / Google Play submission

**Almost go.** The code and builds look much healthier, but store-facing metadata must be made consistent before submission.

Submission gates:

- Confirm App Store Connect and Play Console subscription products match in-app pricing.
- Align `APPSTORE_LISTING.md`, App Review response, screenshots, terms, and paywall pricing.
- Confirm Google Play Data safety/account deletion URL is live and matches the app’s delete flow.
- Confirm App Store privacy answers match `PrivacyInfo.xcprivacy`, privacy policy, Firebase usage, photos, location, voice/speech, baby health/fitness data, and account sync.
- Run real sandbox/TestFlight and Play internal-track purchase tests before sending review.

### Paid growth launch

**Amber.** Do not scale paid ads until attribution and retention events are proven. A technically working app is not enough; parent acquisition will waste money if installs cannot be tied to first useful action and trial/purchase quality.

Growth gates:

- Install attribution visible by platform/source/campaign.
- Events tracked and visible: `first_open`, `onboarding_started`, `child_added`, `first_log_created`, `three_logs_created`, `carer_share_created`, `partner_invite_tapped`, `paywall_viewed`, `trial_started`, `purchase_started`, `purchase_success`, `restore_success`, `delete_account_success`, `day_2_retained`, `day_7_retained`.
- Custom product pages/store listing variants for sleep, newborn tracking, carer handover, weaning/allergens, and all-in-one positioning.
- 10-15 launch creatives ready before spend.
- Support inbox, refund response, privacy response, and review reply templates ready.

## Remaining risks

### 1. Store/listing price alignment

The intended UK prices are: new users `£7.99/month`, `£79.99/year`, `£129.99 lifetime`; eligible existing users keep grandfathered `£4.99/month`, `£44.99/year`, `£79.99 lifetime`. Other countries use Apple/Google local pricing tiers, exchange-rate handling, taxes, and store rules.

**Risk:** review confusion, parent distrust, support tickets, and subscription setup mistakes if any public/store/review surface drifts from this model.

**Fix:** keep app code, terms, App Review notes, and store listing copy aligned to these two UK tiers, while letting the stores show final local prices outside the UK.

### 2. Dirty working tree is large

The repo has many modified and untracked files, including generated assets, SEO pages, native files, tests, and build outputs. Some deletions are intentional duplicate cleanup, but the release branch should be reviewed carefully before commit.

**Risk:** accidental inclusion/exclusion in the final release.

**Fix:** review `git status`, commit in logical groups, and do one final clean build/test cycle from the intended release branch.

### 3. Native purchase/delete flows still need live-environment proof

Automated audits confirm the code shape, but subscription and deletion flows need real platform checks.

**Risk:** sandbox/configuration issues can pass source audits but fail in App Store Connect, Play Console, Firebase deployment, or entitlement product configuration.

**Fix:** test all purchase plans, restore, cancellation/expiry, account deletion, and reinstall behavior on real devices.

### 4. Paid attribution stack appears Firebase-first

Firebase Analytics is present and privacy-conscious logging audits pass. I did not verify a dedicated MMP or ad-network SDK/callback setup for Meta/TikTok/Google/Apple campaign optimisation.

**Risk:** paid ads may optimize for cheap installs rather than retained parents or trial/purchase quality.

**Fix:** decide whether Firebase/GA4 is enough for launch, or add/configure the attribution pipeline needed for Meta, TikTok, Apple Ads, and Google App Campaigns.

## Product readiness strengths

The Desktop repo has very strong safety coverage for a parent app:

- Sleep engine coverage is unusually deep.
- Firestore and account-security audits are explicit.
- Carer portal has dedicated tests for expired links, ended sessions, safe parsing, and parent-app merge behavior.
- Native bridge, native actions, native time parsing, and store-readiness are audited.
- Privacy logging and dependency checks are present.
- Runtime, image, export HTML, phone links, share payloads, and outbound actions are audited.
- Hosted SEO pages and blog assets are generated by the build.

This is a real launch-quality foundation, not a loose prototype.

## Recommended next sequence

1. Align subscription prices everywhere.
2. Review and commit the current dirty release changes in small groups.
3. Deploy Firebase rules/functions/indexes to a staging or production project.
4. Run real-device purchase/delete/carer/push QA.
5. Create store metadata variants and screenshot sets.
6. Start closed beta with 20-50 parents.
7. Measure onboarding completion, first log, day-2/day-7 retention, carer share, paywall view, trial start, and purchase conversion.
8. Start paid ads only after the retention funnel is visible.

## Best launch positioning

**OBubba is the calm all-in-one baby brain for feeds, sleep, nappies, weaning, growth, and everyone who helps care for baby. Works across iOS and Android.**

First paid ad angles to test:

1. Sleep: “Is baby tired, hungry, or just unsettled?”
2. Partner sync: “Mum has iPhone. Dad has Android. Baby still needs one plan.”
3. Bubba Care: “Stop asking: when did she last feed?”
4. Weaning: “Egg, peanut, dairy... what have we tried?”
5. All-in-one: “Your baby app folder can be one app.”
