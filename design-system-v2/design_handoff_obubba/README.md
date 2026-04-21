# Handoff — OBubba

A design-to-code handoff package for **OBubba**, a smart baby tracker (feeds · sleep · nappies · milestones · growth · gentle guidance). Built from the existing repo **[Zy3sha/Simplifi](https://github.com/Zy3sha/Simplifi)** and designed in this project as a set of hi-fi HTML prototypes.

> **One-line product brief:** "A hug from one tired parent to another." Warm, tactile, never clinical. Watercolour glass UI with auto day/night theme. Mascot-led (Obubba is the baby character). Lowercase-leaning copy, emoji as functional icons, generous spacing, corner-glow shadows, Parisienne script wordmark.

---

## About these files

The HTML files in `prototypes/` are **design references**, not production code. They're React-in-HTML prototypes (Babel-compiled inline) built to lock the visual direction, interaction patterns, and copywriting. **Your job is to recreate these designs in OBubba's real codebase** (the existing Simplifi repo, or whatever target environment the team decides on) using that codebase's established patterns, component library, and build system.

If you are starting from scratch with no codebase: the natural target is **React + Vite + TypeScript + Tailwind**, optionally packaged for mobile via **Capacitor** (matching the original Simplifi setup — it's a PWA shipped as iOS + Android).

## Fidelity

**High fidelity.** Every color, shadow, radius, and type token is final and pulled from the live Simplifi `styles.css`. Copywriting is final (it's the product's voice — do not rewrite). Layouts and interactions are intentional; recreate them pixel-close. Where the HTML has animation jitter or Babel-compile quirks, use the intent, not the bug.

---

## What's in this package

```
design_handoff_obubba/
├── README.md                 ← you are here
├── reference/
│   └── DESIGN_SYSTEM.md      ← full design system: tone, colors, type, shadows, iconography, copy voice
├── tokens/
│   └── colors_and_type.css   ← drop-in CSS custom properties. Import first.
├── prototypes/
│   ├── welcome.html          ← marketing site + 5-screen onboarding (Welcome → Profile → Sleep → Confirm → Arrived)
│   ├── bubbacare.html        ← carer portal (grandparent XL mode, nursery dashboard, household switcher, handoff summary)
│   ├── share_cards.html      ← editorial share-card generator (multi-layout canvas)
│   └── app/
│       ├── index.html              ← main app UI demo (Today / Insights / Growth / Account + log sheet)
│       ├── index_premium.html      ← premium/couture variant with gold accents, confetti, Tweaks panel
│       └── *.jsx                   ← component source for the app prototypes
└── assets/
    ├── obubba-happy.png · obubba-loading.png · obubba-thinking.png · obubba-celebration.png · sleep-baby.png
    ├── icon.png · icon-192.png · icon-512.png · og-image.png
```

---

## Surfaces to build

OBubba has **three surfaces**, each represented by a prototype:

### 1. Marketing + Onboarding — `prototypes/welcome.html`
- **Landing page** (obubba.com) — hero with mascot, value props, single primary CTA ("Get OBubba free").
- **Onboarding flow** (5 screens, full-screen phone-framed):
  1. **Welcome** — mascot + "Let's meet your baby"
  2. **Profile** — name, date of birth, feeding style (breast / bottle / combo)
  3. **Sleep** — typical wake-up and bedtime
  4. **Confirm** — summary review
  5. **Arrived** — celebration, CTA into Today
- Skip-auth (guest mode) is allowed and expected; account creation is deferred.
- **Tweak already wired:** accent color (Rose / Gold / Lilac) recolours the entire flow live.

### 2. Main app — `prototypes/app/index.html` and `index_premium.html`
- Parent-facing PWA. iOS frame at 390×844.
- Four tabs (bottom nav): **Today**, **Insights**, **Growth**, **Account**.
- **Today** — hero status card ("last fed 2h ago · next nap in 15m"), 4-up quick-action tile grid (feed / sleep / nappy / note), timeline list of today's entries.
- **Log sheet** — slides up from bottom, 24px top radius, 40×4px handle. Tap a quick-action tile to open it for that type.
- **Insights** — "What I'm Noticing" sleep-consultant voice, pattern cards, gentle observations.
- **Growth** — milestones, weight/height percentile (WHO curves), development notes.
- **Account** — baby profile, household, notifications, export.
- **Day/night auto-theme** — swaps at 7pm/7am, or forced by bedtime logging. Both modes share identical structure; dark mode is warm amber night, not cold blue.
- **`index_premium.html`** is a premium variant with **gold couture accents**, **mascot breathing animation**, **milestone confetti**, and a full **Tweaks panel** (density, radius, accent, mascot presence, animation level). Implement the base first; the premium layer is an opt-in tier.

### 3. Care portal — `prototypes/bubbacare.html`
- Read-only + quick-log page for babysitters, nursery, grandparents. Accessed via QR code from the main app.
- **Three modes** exposed as tweaks:
  - **Grandparent XL** — huge hit targets (110px min), simplified copy, one primary action per screen.
  - **Nursery dashboard** — multi-child view, key-person assignment, pickup/handoff column.
  - **Household switcher** — parent-side view of who's currently caring, with a live handoff summary.
- No auth; QR token is the access grant. Entries are labelled "for parents to review".
- Self-contained single page with `max-width: 560px` centered column.

### Bonus — `prototypes/share_cards.html`
- Editorial (Vogue-inspired) share-card generator. Multi-layout canvas of milestone / stats / quote cards parents can export and post. Treat as v2.

---

## Design tokens

Everything lives in `tokens/colors_and_type.css` as CSS custom properties. Import it first; reference via `var(--ob-*)` or translate into your theme system (Tailwind config, styled-system, CSS Modules, etc.).

### Palette (light)
| Token | Hex | Use |
|---|---|---|
| `--ob-cream` | `#FFF8F2` | primary bg, warmest point |
| `--ob-cream-deep` | `#FFFEFD` | splash / html bg |
| `--ob-blush` | `#F0D0C8` | soft pink wash |
| `--ob-rose-50` | `#F5E1D8` | mid gradient stop |
| `--ob-rose-100` | `#F0DDD6` | theme-color pink |
| `--ob-rose-200` | `#E8B8B0` | rose token |
| `--ob-lilac` | `#D9CFF3` | sleepy Z purple |
| `--ob-lilac-soft` | `#C0A0DC` | button glow accent |
| `--ob-mist-pink` | `#D9A8C0` | corner glow accent |
| `--ob-ter` | `#C07088` | **primary CTA rose** |
| `--ob-ter-deep` | `#A85A44` | CTA gradient end |
| `--ob-mint` | `#6FA898` | calm / success |
| `--ob-sky` | `#7AABC4` | info / boy accent |
| `--ob-gold` | `#D4A855` | premium / warning |
| `--ob-alert` | `#C94030` | allergy banner only |

### Palette (dark — warm amber night)
| Token | Hex |
|---|---|
| `--ob-cream` | `#080e1c` |
| `--ob-rose-100` | `#101d35` |
| `--ob-lilac` | `#ffbe5a` *(amber in dark)* |
| `--ob-ter` | `#D98B72` |
| `--ob-gold` | `#E0B86A` |

### Text
| Token | Hex | Use |
|---|---|---|
| `--ob-text-deep` | `#5B4F4F` | headings, primary |
| `--ob-text-mid` | `#7A6B6B` | body |
| `--ob-text-lt` | `#A89898` | meta / captions |
| `--ob-text-care` | `#4A3B35` | care portal (darker for older eyes) |

### Radii
`xs 10 · sm 14 · md 16 · lg 22 · xl 24 · pill 99 · sheet 24 24 0 0`

### Spacing scale
`4 · 8 · 12 · 14 · 16 · 18 · 22 · 28` (named `--ob-s-1`…`--ob-s-8`)

### Shadows — the signature move
**Corner glow**, not drop-shadow. Two-point negative-offset shadows — top-left pink + bottom-right lilac in light; top-left amber + bottom-right deep-amber in dark — with tight blur, so elements feel lit from opposite corners, not floating above. Cards add a `0 8px 24px` warm-brown drop for lift, plus an inner top-highlight to simulate a curved surface.

Use the exact `--ob-shadow-card`, `--ob-shadow-corner`, `--ob-shadow-cta` tokens — don't reinvent. Getting the shadow wrong breaks the whole aesthetic.

### Glass
`backdrop-filter: blur(20px) saturate(1.6)` applied **only** to `.glass-card`, `.glass-entry`, and sheet modals. Do not put it on everything — it tanks perf on older phones (per a comment in the original code).

### Type
| Family | Use | Google Fonts |
|---|---|---|
| **Parisienne** | OBubba wordmark only | weight 400 |
| **Playfair Display** | headings, hero numbers | 400/500/600/700 + italic |
| **Spectral** | secondary display serif | 400/500/600/700 + italic |
| **DM Sans** | everything else | 400/500/600/700 + italic |
| `ui-monospace` | timer values & amounts (the 54px bold hero number) | — |

Hero number is **Playfair Display 54px/1 bold**, color `var(--ob-ter)`, family falls back to monospace for aligned digits.

Eyebrow/meta labels are **DM Sans 10px/1.4 bold uppercase** with `letter-spacing: 0.1em`, `color: --ob-text-mid`.

---

## Interactions & animation

- **One motion primitive** — `obCardEnter`: 260ms fade + 6px translateY rise, easing `cubic-bezier(0.22, 1, 0.36, 1)`. Use it when cards mount or the tab changes.
- **Hero number pulse** — `obNumPulse`, 600ms bouncy, fires when the number value changes.
- **Priority glow** — `prioGlow`, 6s color-shifting glow on alert cards.
- **Splash mascot** — breathes on 3.5s loop (`scale(1) ↔ scale(1.02)`); Zzz characters drift up on 2.8s stagger.
- **Button press** — `transform: scale(0.96); transition: 0.06s ease` on `:active`. No bounce. No hover states — this is mobile-first.
- **Tile press** — bg lightens (`#F8F1EA`) on press.
- **Respect `prefers-reduced-motion: reduce`** — disable all the above and fall back to instant state changes.

## State & data

- **Persist everything to localStorage** — including current tab, onboarding step, theme override, and the entry log. The Simplifi codebase already does this; match it.
- **Theme clock** — light 7am–7pm, dark 7pm–7am. Bedtime logging forces dark; wake logging forces light. Users can override manually via the 🌙 button in the header; the override sticks for the session.
- **No backend for V1** — mock data only. When a real API lands, swap `localStorage` reads for fetch calls behind the same shape.
- **Entries** — unified schema `{ id, type: 'feed'|'sleep'|'nappy'|'note', timestamp, meta: {...} }`. The `meta` bag is type-specific.

## Iconography

**Emoji are the icon system** — no Lucide, no Heroicons, no SVG sprite. This is a deliberate product choice: it reads as warm, not clinical.

Working set (do not deviate without approval):
🍼 feed · 💤/😴 nap · 🌙 bedtime · ☀️/🌤️ wake · 💩 nappy · 💧 wet · 🛁 bath · 💊 medicine · 🌡️ temp · 👶 baby · 🧸 soothing · 📞 contact · 📋 note · 📖 guide · ⚠️ alert · 💛 love · ✓ confirm · › disclosure · ▼ expand · 🔒 locked · 🌍 translate

Render large (24–36px for actions, 18–20px inline). Use with `font-feature-settings: 'liga'` off to avoid emoji substitution fights.

## Copy voice — do not rewrite

First-person-emotional, lowercase-leaning, tactile. The product speaks the way one tired parent talks to another at 2am. Buttons are Title Case ("Save Feed ✓"). Tabs are Title Case. Eyebrows are UPPERCASE with tracking. "You/your" not "user/parent." Predictions are always "a loose guide." Every warning is softened.

Full copy rules in `reference/DESIGN_SYSTEM.md`.

## Assets

All in `assets/` — fully reusable, no licensing concerns (they're from the OBubba repo).

- `obubba-happy.png` — default / welcome / home hero
- `obubba-thinking.png` — insights
- `obubba-loading.png` — splash / async states
- `obubba-celebration.png` — milestone unlocks
- `sleep-baby.png` — bedtime / dark mode hero
- `icon.png` / `icon-192.png` / `icon-512.png` — PWA icons
- `og-image.png` — 1200×630 social share

The wordmark is **typeset in Parisienne** — not a logo file. Always mixed case, "OBubba," never all-caps.

---

## Build recommendations

If starting fresh:

- **React + Vite + TypeScript**
- **Tailwind** with the tokens above mapped into `tailwind.config.js` (`theme.extend.colors.ob`, `theme.extend.fontFamily.display`, etc.). Keep the raw CSS custom properties as the source of truth and have Tailwind consume them — that way dark mode is a single `[data-theme="dark"]` toggle.
- **No heavy animation library needed.** CSS keyframes + `transition` cover everything. Reach for Framer Motion only if you need shared-layout transitions across the log sheet.
- **Capacitor** for iOS/Android wrapping (matches the existing PWA setup).
- **shadcn/ui is fine**, but strip its defaults — OBubba's visual language is specific enough that you'll rewrite most primitives anyway. The sheet, dialog, and tabs primitives from Radix are worth keeping for a11y.
- **Routing** — React Router. Onboarding is a linear 5-step flow with query-param state (`?step=profile`). Main app tabs are four top-level routes.

## Open questions / deferred

- **Auth** — the prototypes skip it. Real app uses email magic-link (per Simplifi). Decide whether to add Clerk / Supabase / roll your own.
- **Care portal QR flow** — the prototype shows the landed state; the "generate QR / scan QR" plumbing is TBD.
- **Growth curves** — WHO percentile data needs to be shipped as JSON (or fetched). The prototype uses mock values.
- **Premium tier** — `index_premium.html` implies a paid plan. Pricing / gating TBD.

---

Anything unclear, shout. The design system doc in `reference/DESIGN_SYSTEM.md` has the full tone-of-voice and visual-foundations writeup if you want the deeper context.
