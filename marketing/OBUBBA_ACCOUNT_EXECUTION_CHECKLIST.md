# OBubba Account Execution Checklist

This file lists the tasks I can execute once the relevant account is open and signed in. These actions affect external accounts, so they need an authenticated browser session and a final confirmation before publishing or sending.

## Status snapshot - 2026-05-14

Completed:
- Submitted `https://obubba.com/sitemap.xml` in Google Search Console.
- Requested indexing for priority Search Console URLs that could be inspected during the session, including `https://obubba.com/baby-tracker-app-uk.html` and `https://obubba.com/blog/newborn-feeding-and-nappy-log.html`.
- Created and saved an App Store Connect custom product page draft named `Sleep Rhythm`.
- Uploaded 10 iPhone 6.5" screenshots and 10 iPad 13" screenshots to the `Sleep Rhythm` custom product page draft.
- Added sleep-rhythm promotional text and selected relevant App Store keywords for the draft.
- Generated iPad 13 screenshot assets at `/Users/zyesha/Desktop/APPLE_UPLOAD_USE_THESE_IPAD_13_SCREENSHOTS`.
- Opened Google Play Console, confirmed the OBubba app record, and located Store listings, Store listing experiments, and Store performance pages.
- On 2026-05-14, filled the Google Play `OBubba Sleep Tracker` custom listing fields in Safari and selected `Search keywords` targeting, but did not save it because Play Console showed `No historical search data available` and zero selectable keywords.
- Submitted App Store version `2.7.8` with build `50`; App Store Connect shows `2.7.8 Waiting for Review`.
- Updated App Store app information to `OBubba Baby Tracker`, subtitle `Sleep, feeds, naps & nappies`, primary category `Lifestyle`, secondary category `Health & Fitness`.
- Submitted four App Store custom product pages for review: `Sleep Rhythm`, `Newborn Daily Log`, `Family Handovers`, and `Weaning And Milestones`.
- Updated the Google Play main store listing app name, short description and full description, then sent the 3 changes for review from Publishing overview.

Needs monitoring or later action:
- Monitor App Store review and manually release `2.7.8` after approval, because the version was left on manual release.
- Monitor Apple custom product page review and use approved page URLs in ads, creator links and campaign reporting.
- Monitor Google Play quick checks and review. Managed publishing is off, so approved Play listing changes may publish automatically.
- Create Google Play custom store listings when Play exposes selectable keyword data or after a matching Google Ads campaign exists.
- Start App Store and Google Play experiments after the approved listings are live.
- Social posts and outreach messages: drafts are ready, but posting/sending should be confirmed per channel.

## Google Search Console

Needs: verified `obubba.com` property.

Actions:
1. Done: Open Google Search Console.
2. Done: Submit sitemap: `https://obubba.com/sitemap.xml`.
3. In progress: Use URL Inspection for the priority URLs in `marketing/OBUBBA_SEARCH_CONSOLE_URLS.txt`.
4. In progress: Request indexing for the highest-priority pages first:
   - `https://obubba.com/`
   - `https://obubba.com/best-baby-tracker.html`
   - `https://obubba.com/baby-tracker-app-uk.html`
   - `https://obubba.com/newborn-feeding-and-nappy-log.html`
   - `https://obubba.com/baby-wake-window-tracker.html`
   - `https://obubba.com/blog/best-baby-tracker-app-uk.html`

## App Store Connect

Needs: App Store Connect access to OBubba.

Actions:
1. Done: Submitted version `2.7.8` with build `50` for review.
2. Done: Updated App Information fields for the next app version:
   - Name: `OBubba Baby Tracker`
   - Subtitle: `Sleep, feeds, naps & nappies`
   - Primary category: `Lifestyle`
   - Secondary category: `Health & Fitness`
3. Use `marketing/OBUBBA_ASO_EXPERIMENT_PLAN.md` for subtitle and screenshot tests after approval.
4. Create custom product pages:
   - Submitted for review: Sleep Rhythm (`77bb6034-ab63-4416-94dd-64be87633399`)
   - Submitted for review: Newborn Daily Log
   - Submitted for review: Family Handovers
   - Submitted for review: Weaning And Milestones
5. Pending: Manually release version `2.7.8` only after App Review approval and a final smoke check.

## Google Play Console

Needs: Play Console access to OBubba.

Actions:
1. Done: Updated the main store listing copy from `APPSTORE_LISTING.md` and sent 3 listing changes for review.
2. Create custom store listings:
   - Sleep Tracker: prepared in the Console but not saved because keyword targeting currently has no selectable historical keyword data.
   - Newborn Tracker
   - Shared Care
   - Weaning Tracker
3. Start listing experiments:
   - Short description control vs newborn-focused variant.
   - First screenshot control vs sleep-rhythm variant.
4. Do not start the experiments until the main listing changes are approved and live.

## TikTok and Instagram

Needs: signed-in brand account or creator workflow.

Actions:
1. Use `marketing/OBUBBA_SOCIAL_POSTING_CALENDAR.csv` as the 14-day schedule.
2. Use scripts and captions from `marketing/OBUBBA_CREATOR_PR_KIT.md`.
3. Add UTM URLs from `marketing/OBUBBA_TRACKING_URLS.csv`.
4. Post one short video per day.

## Creator and PR Outreach

Needs: email account or social DMs.

Actions:
1. Use `marketing/OBUBBA_OUTREACH_QUEUE.csv` to source prospects.
2. Use the pitch in `marketing/OBUBBA_CREATOR_PR_KIT.md`.
3. Track each contact with status: sourced, contacted, replied, sent code, posted, declined.
4. Use unique UTM links for each creator when possible.

## Analytics

Needs: Google Search Console, store analytics and app analytics access.

Weekly numbers:
- Search Console impressions by landing page.
- Search Console clicks by query.
- Store clicks from website pages.
- App Store product page views and conversion.
- Google Play store listing visitors and acquisitions.
- Social views, saves, shares and profile clicks.
- Creator posts live and installs attributed by UTM.
