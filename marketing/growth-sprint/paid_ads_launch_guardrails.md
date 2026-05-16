# OBubba Paid Ads Launch Guardrails

Prepared: 2026-05-15

Use this when creating Apple Search Ads, Google App Campaigns, Meta, TikTok, or creator tests. The goal is learning and quality, not spending fast.

## Payment Rule

Do not enter, request, store, screenshot, or repeat bank/card details.

When an ad platform asks for payment details, stop on that page and let the account owner type them directly. After the payment method is saved, continue only with paused campaigns unless there is explicit final confirmation to launch spend.

## First 7-Day Budget

Owner hard cap: `GBP 200` all-in across all paid ad platforms until a fresh review approves more.

Recommended default:

- Apple Search Ads: `GBP 8-10/day`, Firebase-proven English-speaking countries only, exact/high-intent keywords, stop before `GBP 80`.
- Google App Campaign: `GBP 10/day`, GB only, Android install/first-open learning, stop before `GBP 100`.
- Meta or TikTok: hold until Apple/Google tracking proves quality, or run one tiny creator-style test only inside the remaining reserve.
- Reserve: keep at least `GBP 20` unspent until the first 72-hour quality read.

Hard stop:

- Do not exceed `GBP 20/day` total until the first 72-hour quality read is complete.
- Do not exceed `GBP 200` total without a fresh review of Firebase, App Store, and Play metrics.

## Launch Order

1. Apple Search Ads brand/exact terms, paused draft first.
2. Apple Search Ads baby tracker and sleep rhythm exact terms, paused draft first.
3. Google App Campaign shell with verified Firebase conversion events, paused draft first.
4. One Meta/TikTok creator-style test only after store listings and tracking links are checked.
5. Creator outreach can start without paid spend, but do not pay a creator until terms are confirmed.

## Apple Search Ads Country Set

Firebase overview export dated 2026-05-14 shows active-user signal concentrated in:

- `GB`: 968 active users, `47.2%` of country-attributed users.
- `US`: 468 active users, `22.8%`.
- `AU`: 223 active users, `10.9%`.
- `CA`: 80 active users, `3.9%`.
- `NZ`: 39 active users, `1.9%`.
- `IE`: 38 active users, `1.9%`.
- `ZA`: 26 active users, `1.3%`.

Initial Apple Ads country choice:

- Launch test: `United Kingdom`, `United States`, `Australia`.
- Optional low-spend expansion only if Apple lets us cap separately: `Canada`, `Ireland`, `New Zealand`.
- Hold back for now: `South Africa` and the long tail until conversion quality is clearer.

Budget structure:

- Preferred: three Apple campaigns so spend cannot get swallowed by one market:
  - `ios_asa_uk_brand_2026_05`: `GBP 4/day`, hard stop before `GBP 35`.
  - `ios_asa_us_brand_2026_05`: `GBP 3/day`, hard stop before `GBP 25`.
  - `ios_asa_au_ca_ie_nz_brand_2026_05`: `GBP 2/day`, hard stop before `GBP 20`.
- If Apple only allows one campaign today: one campaign with `GBP 8/day`, selected countries `GB`, `US`, `AU`, and pause by `GBP 80` total spend.

## Quality Gates

Read these before scaling:

- CPI under `GBP 1.50-2.50` is acceptable for early learning.
- Cost per trial should move toward `GBP 3-4`.
- Install to onboarding complete target: `60%+`.
- First open to first log target: `35%+`.
- Trial start from first open target: `40%+`.
- Trial to paid target after trial maturity: `8-12%`.
- D7 retention should hold above `7-10%` before scaling broad audiences.

## Stop Or Pause Rules

Pause a campaign or ad group if:

- Installs are cheap but `first_log_created` is weak.
- Trials start but D1 retention is very weak.
- CPI is over `GBP 3` and there is no strong downstream quality.
- A creative gets clicks but poor onboarding completion.
- A country spends more than `GBP 30` with no meaningful trial activity.

## Scaling Rule

Increase budget only after one full 72-hour read and only by `20-30%` at a time.

Do not scale on purchase data alone while trials are immature. For OBubba, early quality is better measured by `onboarding_completed`, `first_log_created`, `three_logs_created`, `trial_started`, and D1/D7 retention.
