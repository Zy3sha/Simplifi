# Tonight Operator Checklist

Prepared: 2026-05-15

## No-Approval Work Completed/Ready

- Verified local ad and store assets exist.
- Built Apple Search Ads campaign sheet.
- Built Google App Campaign asset sheet.
- Built App Store custom page plan.
- Built Google Play listing experiment plan.
- Reconciled the 2026-05-14 account runbook:
  - App Store `2.7.8` build `50` was submitted and is manual-release after approval.
  - Four App Store custom product pages were submitted for review.
  - Google Play main listing changes were sent for review.
  - Google Play custom listings are prepared but should wait for keyword or ad-campaign targeting.
- Built payment/final-click guardrails.
- Built creator, PR and outreach kit.
- Built 5,000 paid-user projection model.

## Account Work To Do In Safari

### App Store Connect

1. Open App Store Connect and check version `2.7.8` build `50`.
2. If it is approved, smoke-test the live build first, then manually release only after final confirmation.
3. Check custom product page review status:
   - Sleep Rhythm
   - Newborn Daily Log
   - Family Handovers
   - Weaning And Milestones
4. Copy approved public URLs into `apple_custom_product_page_status.csv` and the Apple Search Ads build sheet.
5. Create product page optimization test only after the approved listing/pages are available:
   - Test A: first screenshot.

Do not release or submit public metadata without final confirmation.

### Apple Search Ads

1. Create campaigns from `apple_search_ads_build_sheet.csv`.
2. Keep campaigns paused until final approval.
3. Set countries separately: GB first, then US/AU after quality is visible.
4. Attach matching custom product pages to ad variations.
5. Use exact match first.
6. Do not set large budgets until conversion data is visible.

Do not launch spend without final confirmation. If billing asks for a bank/card, stop and let the owner enter it directly.

### Google Play Console

1. Check whether the main store listing changes have been approved or are still in review.
2. Create custom store listings only if Play Console exposes selectable search keyword targeting or a Google Ads app campaign can be attached:
   - OBubba Sleep Tracker
   - OBubba Newborn Tracker
   - OBubba Shared Care
   - OBubba Weaning Tracker
3. Use `google_play_custom_listing_upload_sheet.csv` and verified assets from `store_custom_pages_and_experiments.md`.
4. Create listing experiment after the main listing is approved/live:
   - Short description control vs rhythm variant.
5. Keep experiment draft until ready.

Do not publish public listing changes without final confirmation.

### Google Ads

1. Create app campaign shell from `google_app_campaign_assets.csv`.
2. Add text assets.
3. Add verified videos and images.
4. Connect Firebase/Google Play conversion events if prompted.
5. Start with install or first-open optimization.
6. Move toward `first_log_created` only after enough volume.

Do not launch spend without final confirmation. If billing asks for a bank/card, stop and let the owner enter it directly.

## Payment Stop

Use `payment_and_final_click_handoff.md` whenever a screen asks for billing, bank/card details, tax details, confirmation to launch, submit for review, publish, or release.

## First 72-Hour Read

Ignore purchases until trials mature.

Read:

- Store listing conversion
- CPI
- First open
- Onboarding completed
- First log created
- Trial started
- D1 retention

Cut or pause:

- Any ad group with installs but weak `first_log_created`.
- Any creative with cheap CPI but poor trial start rate.
- Any country with weak onboarding completion.
