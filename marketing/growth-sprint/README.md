# OBubba Growth Sprint Pack

Prepared: 2026-05-15

Goal: turn the current Firebase spike into a repeatable path toward 5,000 paid users.

This folder is the practical upload/control pack. It uses only asset paths that were verified locally on 2026-05-15.

## What Is Ready

- Apple Search Ads campaign build sheet: `apple_search_ads_build_sheet.csv`
- Google App Campaign asset sheet: `google_app_campaign_assets.csv`
- App Store custom product page plan: `store_custom_pages_and_experiments.md`
- Google Play listing experiment plan: `store_custom_pages_and_experiments.md`
- Apple custom product page status sheet: `apple_custom_product_page_status.csv`
- Google Play custom listing upload sheet: `google_play_custom_listing_upload_sheet.csv`
- Paid ads launch guardrails: `paid_ads_launch_guardrails.md`
- Payment and final-click handoff: `payment_and_final_click_handoff.md`
- Release artifact status: `release_artifact_status.md`
- Creator, PR, and community outreach kit: `creator_pr_outreach_kit.md`
- 5,000 paid-user revenue model: `paid_user_projection.md`
- Tonight action checklist: `tonight_operator_checklist.md`

## Current External Account Status

Last reconciled from local runbooks: 2026-05-15.

- App Store version `2.7.8` build `50` was submitted on 2026-05-14 and is still treated as pending/manual-release until live status is rechecked in App Store Connect.
- Four App Store custom product pages were submitted for review: `Sleep Rhythm`, `Newborn Daily Log`, `Family Handovers`, and `Weaning And Milestones`.
- Google Play main listing copy changes were sent for review on 2026-05-14. Managed publishing was off, so approved changes may publish automatically.
- Google Play custom store listings were prepared, but Play Console previously showed no selectable search keyword data. Create them only when targeting can be attached to search keywords or to a matching Google Ads campaign.
- Paid ad campaigns have not been launched from this pack. Build paused drafts first, then get final confirmation before spend.

## Verified Asset Roots

- Android screenshots: `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/android/phone-upload-1080x1920/`
- Android feature graphic: `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/android/feature-graphic-1024x500.png`
- Google Play preview video: `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/android/video-for-youtube/obubba-google-play-preview-1080x1920.mp4`
- Apple iPhone 6.9 screenshots: `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-9-upload-1290x2796/`
- Apple iPhone 6.5 screenshots: `/Users/zyesha/Desktop/obubba-clock-lab/app-store-screenshots/apple-upload/iphone-6-5-upload-1284x2778/`
- Short ad videos: `/Users/zyesha/Desktop/obubba-clock-lab/marketing/obubba-launch-ads/renders/`
- Static ad images: `/Users/zyesha/Desktop/obubba-clock-lab/marketing/obubba-launch-ads/renders/static/ad-pack/`

## Guardrails

I can prepare everything account-side, inspect pages, and draft uploads. I should not launch spend, submit public metadata, push store changes live, release approved versions, or enter payment details without a final action-time confirmation because those are public or financial actions.

Payment details stay with the account owner. If Apple Ads, Google Ads, App Store Connect, Google Play, TikTok, Meta, or any other service asks for bank/card details, pause and let the owner enter them directly in the browser.

## Recommended Order

1. Put tracking first: check Firebase events in Google Ads and Apple Ads dashboards.
2. Create store page variants before campaigns, so ads land on matching pages.
3. Launch only tiny tests first:
   - Apple Search Ads: GB exact/high-intent first.
   - Google App Campaign: GB Android install test with Firebase events.
4. Judge the first 72 hours by `onboarding_completed`, `first_log_created`, and `trial_started`, not purchase.
5. Judge purchase only after each cohort has aged past the trial.
