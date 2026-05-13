# OBubba Account Execution Checklist

This file lists the tasks I can execute once the relevant account is open and signed in. These actions affect external accounts, so they need an authenticated browser session and a final confirmation before publishing or sending.

## Status snapshot - 2026-05-13

Completed:
- Submitted `https://obubba.com/sitemap.xml` in Google Search Console.
- Requested indexing for priority Search Console URLs that could be inspected during the session, including `https://obubba.com/baby-tracker-app-uk.html` and `https://obubba.com/blog/newborn-feeding-and-nappy-log.html`.
- Created and saved an App Store Connect custom product page draft named `Sleep Rhythm`.
- Uploaded 10 iPhone 6.5" screenshots and 10 iPad 13" screenshots to the `Sleep Rhythm` custom product page draft.
- Added sleep-rhythm promotional text and selected relevant App Store keywords for the draft.
- Generated iPad 13 screenshot assets at `/Users/zyesha/Desktop/APPLE_UPLOAD_USE_THESE_IPAD_13_SCREENSHOTS`.
- Opened Google Play Console, confirmed the OBubba app record, and located Store listings, Store listing experiments, and Store performance pages.

Needs final confirmation before account submission:
- App Store Connect `Sleep Rhythm` custom product page: click `Add for Review` only after confirming the uploaded media and copy.
- Google Play custom store listings and experiments: Play Console requires a real browser click or Accessibility permission for the create flow; the page is ready, but scripted clicks did not open the form.
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
1. Pending: Update default listing copy from `APPSTORE_LISTING.md`. The current live version fields were locked/read-only because the version is already ready for distribution.
2. Use `marketing/OBUBBA_ASO_EXPERIMENT_PLAN.md` for subtitle and screenshot tests.
3. Create custom product pages:
   - Done as draft: Sleep Rhythm (`77bb6034-ab63-4416-94dd-64be87633399`)
   - Newborn Daily Log
   - Family Handovers
   - Weaning and Milestones
4. Do not submit for review until the final copy and screenshots are confirmed.

## Google Play Console

Needs: Play Console access to OBubba.

Actions:
1. Update main store listing copy from `APPSTORE_LISTING.md`, adapted for Google Play fields.
2. Create custom store listings:
   - Sleep Tracker
   - Newborn Tracker
   - Shared Care
3. Start listing experiments:
   - Short description control vs newborn-focused variant.
   - First screenshot control vs sleep-rhythm variant.
4. Do not start the experiment until screenshots are confirmed.
5. Note: The Play Console create button did not respond to scripted Safari clicks. Use a real browser click on `Create custom listing` or grant Accessibility permission for automation before continuing the creation flow.

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
