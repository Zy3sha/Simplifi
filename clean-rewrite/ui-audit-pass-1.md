# UI Audit Pass 1

Date: 2026-05-17
Workspace: `/Users/zyesha/Desktop/obubba-clean-lab`

## Rendered UI Checked

- Track/Clock home with Logs, Plan, and Guidance panels.
- One-tap logging controls and active timer controls.
- Care dashboard tools: Bubba Care, Weaning, Breastfeeding, Parent Room, Sleep Coach, Night Weaning.
- Care insight/reference routes: Sleep, Reports, Safe Sleep.
- Grow weekly companion landing.
- Account family/sharing/settings landing.

## Code Cross-Check

- Current UI route state maps to internal tabs: `day`, `insights`, `develop`, `settings`.
- Current day subscreens are: `today`, `log`, `plan`, `notes`, `news`, `weaning*`, and `wellbeing`.
- Current Care filters are: `travel`, `feeding`, `sleep`, `growth`, `reports`, `safesleep`, `nightwean`.
- The main app still lives mostly inside one very large `app.jsx`, and the styling layer has many late override blocks.

## Findings

### P1 Build/Release Hygiene

Plain `npm run cap:sync` synced whatever was already in `dist`. If `dist` was stale, native iOS/Android assets could be stale too. This is a release-process risk because a professional app store copy must not depend on remembering the command order.

Fixed in this lab: `cap:sync` now runs `npm run build` before Capacitor sync.

### P2 App-Link Asset Drift

`public/.well-known/apple-app-site-association` existed, but the build was not copying `.well-known` into `dist`, so Capacitor sync removed it from native public assets. Firebase hosting was also ignoring all dot directories, which would hide `.well-known` from hosted output.

Fixed in this lab: build now copies `.well-known`, Firebase no longer ignores all dot directories, and the build-artifact audit now checks these files.

### P2 Styling/Old UI Debt

The rendered UI is coherent, but `styles.css` contains many layered “final lock”, “old”, “older”, “retired”, and “prototype” blocks. Some are still protecting current UI, so they should not be deleted blindly.

Confirmed cleanup completed in this lab: CSS no longer styles `[data-testid="today-hero"]`, because the current app source no longer renders that retired hero surface.

### P2 Monolith Risk

`app.jsx` is about 4.5 MB and `styles.css` is about 774 KB. That size makes bugs easier to introduce because unrelated product areas share one huge edit surface.

## Guardrails Added

- `npm run audit:clean-ui` writes `clean-rewrite/reports/ui-code-inventory.md`.
- `test/build-artifacts-audit.js` now catches missing `.well-known` app-link files and stale service-worker/native asset drift.

## Next Rewrite Pass

1. Extract timer/log classification into a pure core module with fixtures for bedtime, catch-up, night wake, feed, nappy, and carer entries.
2. Extract the sleep prediction engine from UI rendering.
3. Split canonical screens into screen-owned modules: TrackClock, CareDashboard, CareSleep, Weaning, ParentRoom, Grow, Account.
4. Keep build/store checks green after every extraction.
