# OBubba Design System

OBubba is a **smart baby tracker** — feeds, sleep, naps, nappies, milestones, growth, and gentle NHS/WHO-aligned guidance — built by a tired mum at 3am who got fed up juggling 5 different apps. The product's personality is warm, a little tender, never clinical; it sounds like "a hug from one tired parent to another."

- **Company / app:** OBubba — Smart Baby Tracker
- **Platforms:** iOS, Android (Capacitor PWA), web
- **Domain:** obubba.com
- **Two product surfaces in the codebase:**
  - **Main app** — parent-facing PWA (feeds, naps, insights, development, account). Entry point: `index.html` → `app.js` (compiled from `app.jsx`).
  - **Care portal** — read-only + quick-log page for babysitters / nursery / grandparents, accessed via QR. Entry point: `care.html`. Self-contained single-file.

## Source material

All context extracted from the repo **[Zy3sha/Simplifi](https://github.com/Zy3sha/Simplifi)** @ `main` (default branch; file called "Simplifi" but product is named "OBubba"). Relevant files read:

- `index.html` — splash screen, meta, font imports
- `styles.css` — full design token system (light + dark modes, glass, glow, cards)
- `theme.js` — auto day/night theme switching (7pm dark, 7am light)
- `manifest.json` — PWA colors, icons, shortcuts
- `MANIFEST.md` — product rules & feature status checklist
- `APPSTORE_LISTING.md` — tone-of-voice, feature copy
- `care.html` — carer portal UI (the fully-hand-written surface; best reference for un-minified component patterns)
- `assets/*.png` — mascot (Obubba the baby) in 5 poses: happy, loading, thinking, celebration, sleeping

The main app's source `app.jsx` is 3 MB / ~70k lines, so components in this system are reconstructed from the visual token grammar in `styles.css` + the patterns clearly visible in `care.html`, rather than by importing the minified component tree directly. The intent is **pixel-fidelity to the live app's look**, not line-by-line component reproduction.

## Index

| Path | What's in it |
|---|---|
| `colors_and_type.css` | All CSS custom properties — colors, gradients, shadows, radii, type tokens. Import this first. |
| `assets/` | Mascot PNGs, app icons, og-image. See **Iconography** below. |
| `preview/*.html` | Individual Design System cards — type, color, spacing, component states. Opened by the Design System tab. |
| `ui_kits/app/` | Main app UI kit — React components for the parent PWA. Open `ui_kits/app/index.html` for the interactive demo. |
| `SKILL.md` | Agent skill manifest — compatible with Claude Code's Skills. |

## Content fundamentals

OBubba's copy is first-person-emotional, never instructional. It's written the way one tired parent talks to another at 2am.

**Tone:** Warm, lowercase-leaning, tactile. Uses "you" and "your baby" / baby's name. Never "user," "account," "parent." Short sentences. Occasional em-dash for intimacy.

**Voice examples (verbatim, from APPSTORE_LISTING.md and care.html):**
- "OBubba was built by a tired mum at 3am who got fed up juggling 5 different apps."
- "Like having a sleep consultant and a best friend in your pocket."
- "Just a hug from one tired parent to another."
- "Don't worry, you can't break anything here. Just tap and go."
- "Entries go to parents for review 💛"
- "No ads. No selling your data."

**Casing:** Mixed. Buttons are Title Case or sentence-style ("Save Feed ✓", "Baby Woke", "Bed Now!"). Tabs use Title Case (Today / Insights / Development / Account). Eyebrow/meta labels are UPPERCASE with letter-spacing.

**I vs you:** Almost always "you/your." First-person "I" only for the sleep-consultant persona ("What I'm Noticing"). The app never refers to itself as "OBubba does X" — it just *does* X.

**Emoji:** Used generously but with intention — only ~15 recurring emoji act as functional icons:
- 🍼 feed · 💤 / 😴 nap · 🌙 bedtime · ☀️ wake · 💩 nappy · 💧 wet
- 💛 love/reassurance · 🧸 soothing · ⚠️ alert · 📞 contact · 📋 notes · 📖 guide
- 🥱 sleepy · 😫 overtired · 🌤️ just-woke
Never decorative emoji sprinkled through body copy.

**Vibe:** Soft, slow, forgiving. Tells you predictions are "a loose guide — always follow sleepy cues." Never presents anything as medical advice. Every warning is softened ("could gently wake them," "don't worry"). The only hard red UI is the allergy alert banner.

## Visual foundations

**Two moods, auto-switched by clock:** Light (7am–7pm, "powder pink · lilac · cream") and Dark (7pm–7am, "warm amber night"). Bedtime logging forces dark; morning wake forces light. Both modes share identical structure — they're tints of the same system, not separate skins.

**Colors:**
- Backgrounds are *watercolor washes*, not flat fills — `body::before` stacks 6 radial gradients of blush/cream/rose over a 135° linear gradient. Dark mode replaces the washes with amber embers over deep navy `#080e1c`.
- A faint sparkle layer (`body::after`) scatters ~9 radial pixel-dots at low opacity — present in both modes, tiny enough to feel like dust not decoration.
- Primary accent `#C07088` (terracotta rose) anchors CTAs; `#6FA898` (mint) signals reassurance/success; `#7AABC4` (sky) for info / boy accent; `#D4A855` (gold) for premium. Alert red `#C94030` only on the allergy banner.

**Type:** `Parisienne` (script) for the **OBubba wordmark** — handwritten, flowing, personal. `Playfair Display` (serif) for headings and hero numbers. `DM Sans` for everything else. `Spectral` loaded as a secondary display serif. Monospace for timer values and amounts (`54px` bold, family `ui-monospace`).

**Spacing:** Generous. Card padding `16–22px`. Sheets `24px`. Gap between action tiles `8–10px`. Hit targets never below 44px (explicit in care.html: action buttons `min-height: 110px`).

**Backgrounds:** Radial/linear watercolor gradients. No hand-drawn illustrations outside the mascot PNGs. No repeating patterns/textures. Full-bleed imagery only on the welcome/splash screen.

**Animation:** Understated. One motion primitive — `obCardEnter` — fades cards in with a 6px translateY rise over 260ms `cubic-bezier(0.22,1,0.36,1)`. Hero numbers get a bouncy pulse (`obNumPulse`, 600ms) when their value changes. "Priority" notifications get a slow 6s color-shifting glow (`prioGlow`). Everything respects `prefers-reduced-motion`. Splash mascot breathes on a 3.5s loop; Zzz characters drift up on 2.8s stagger. Never bouncy or punchy.

**Hover / press states:** Buttons scale to `0.96` on active with `transform 0.06s ease` — fast snap, no bounce. No hover states (mobile-first). Pressing a tile lightens its bg slightly (`#F8F1EA` in care.html).

**Borders:** 1–2px, very soft. Light mode: `rgba(255,225,235,0.4)`. Dark mode: `rgba(255,190,90,0.25)`. Interior cards use `#E8DED3` or `#F0D0C8` on the cream palette; rarely pure black.

**Shadow system — the signature move:** "Corner glow," not drop-shadow. Two-point negative-offset shadows (top-left pink + bottom-right lilac in light; top-left amber + bottom-right deep-amber in dark) with tight blur — elements feel lit from opposite corners, not floating above. Cards add an additional `0 8px 24px` warm brown drop for physical lift. All elements also carry `0 0 24–80px` soft glows in the card's own hue. The result: cards look halo'd, not embossed.

**Protection gradients vs capsules:** Neither. Text sits directly on the washed background; legibility is maintained by the pale cream base and hardcoded `color` rules per theme.

**Layout rules:** Mobile-first. The main app fixes a bottom nav (`position:fixed; bottom:0`) and a top header with `backdrop-filter`. Care portal uses a `max-width:560px` centered column. Sheets slide up from the bottom (`border-radius:24px 24px 0 0`), with a 40×4px handle on top.

**Transparency & blur:** Used surgically. Only `.glass-card` + `.glass-entry` and sheet modals get `backdrop-filter: blur(20px) saturate(1.6)` — everything else relies on background gradients + shadows alone, to stay fast on older phones (per code comment: "backdrop-filter only on class-based elements").

**Imagery vibe:** Warm, illustrative, hand-drawn style (the Obubba mascot PNGs look like watercolor children's-book spot illustrations — cheeks flushed, closed eyes, muted palette). No photography.

**Corner radii:** Very rounded. Buttons `14–18px`. Cards `20–22px`. Hero `24px`. Pills `99px`. Sheet tops `28px` corner (care.html) or `24px` (main app). Mascot hero `36px`.

**Cards:** Semi-transparent white/rgba(18,30,52) with 1.5px pale border, thick multi-layer shadow (see above), an internal top-highlight gradient overlay (`.glass-card::before`) that fills the top 48% with `rgba(255,255,255,0.22)` to simulate a curved surface, and a thin 1.5px bottom sparkle line (`::after`). In dark mode the highlight becomes warm amber `rgba(255,200,120,0.10)`.

## Iconography

OBubba uses **emoji as a first-class icon system**, not as decoration. No icon font, no SVG sprite, no Lucide/Heroicons — functional icons are just unicode emoji rendered large (24–36px for actions, 18–20px inline). This is a deliberate product choice: it reads as warm and human, not clinical-medical.

**The working set** (every functional icon in the app):
`🍼` feed · `💤 😴` nap/sleep · `🌙` bedtime · `☀️ 🌤️` wake · `💩` nappy · `💧` wet · `🛁` bath · `💊` medicine · `🌡️` temperature · `👶` baby · `🧸` soothing · `📞` contact · `📋` note · `📖` guide · `⚠️` alert · `💛` love · `✓` confirm · `›` disclosure · `▼` expand · `🔒` locked · `🌍` translate.

**Logos and assets** live in `assets/`:
- `icon.png` (960×960, 960 KB) — app icon, Obubba mascot headshot (used as iOS/Android home-screen icon)
- `icon-192.png`, `icon-512.png` — PWA sized variants
- `obubba-happy.png`, `obubba-loading.png`, `obubba-thinking.png`, `obubba-celebration.png`, `sleep-baby.png` — the 5 mascot poses, used on splash, welcome, and celebration moments
- `og-image.png` — 1200×630 social share card

**The wordmark** is typeset, not a logo file: **"OBubba"** in `Parisienne` script (weight 400). Main app header uses `30px`. Mixed-case always — never all-caps.

**Flagged substitutions:** None yet — all mascot PNGs and the app icon are the originals from the repo. Fonts (Parisienne, Playfair Display, Spectral, DM Sans) load from Google Fonts, same as production.

---

If anything here feels wrong, shout — especially on tone, since this system is as much about voice as it is about color.
