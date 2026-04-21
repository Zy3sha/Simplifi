# OBubba — Main app UI kit

Mobile PWA for parents. Watercolour glass aesthetic, auto day/night theme, emoji-first iconography. Every screen composes from the same primitives: `PhoneFrame`, `AppHeader`, `BottomNav`, and the `GlassCard` container.

## Components
- `PhoneFrame.jsx` — 390×844 iPhone bezel + dynamic island, with the watercolour body background
- `AppHeader.jsx` — baby-name chip · Parisienne "OBubba" wordmark · theme toggle
- `BottomNav.jsx` — fixed tab bar (Today / Insights / Growth / Account)
- `GlassCard.jsx` — signature frosted container; `hero` variant adds warm radial wash
- `HeroCard.jsx` — headline status + last-feed / next-nap stats
- `QuickActions.jsx` — 4-up emoji tile grid
- `TimelineList.jsx` — activity log rows
- `LogSheet.jsx` — bottom sheet for logging feeds / sleep / nappy / notes
- `TodayScreen.jsx`, `InsightsScreen.jsx`, `GrowthScreen.jsx`, `AccountScreen.jsx` — full screens

## Open
- `index.html` — interactive demo. Tap a quick-action tile to open the log sheet; switch tabs via the bottom nav; toggle day/night via the 🌙 button in the header.
