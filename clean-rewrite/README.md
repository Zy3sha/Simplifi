# OBubba Clean Rewrite Lab

This workspace is for the clean rewrite and audit work only. The store-ready app is preserved separately on GitHub as `store-ready-2026-05-17`.

## Rules For The Rewrite

- Keep the current parent-facing product surface unless a rendered UI check proves it is dead or harmful.
- Treat Track/Clock, Care, Grow, Account, onboarding, partner sync, Bubba Care, Parent Room, subscriptions, and native store builds as first-class product areas.
- Move code out of the single giant app file in passes, with tests staying green after each pass.
- Delete old UI only after it is absent from rendered screens, route state, tests, and native/care output.
- Prefer boring professional structure: small modules, one source of truth for timers/log classification, explicit screen ownership, and build commands that cannot quietly sync stale assets.

## Passes

1. Store-ready preservation and build guardrails.
2. UI-to-code inventory.
3. Data model and timer/log classification extraction.
4. Sleep prediction engine extraction.
5. Screen-by-screen component extraction.
6. Native build and store release verification.

Run the current inventory with:

```bash
npm run audit:clean-ui
```
