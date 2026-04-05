# OBubba Refactor Map

> Planning document — NO code changes have been made.
> Read this from your phone, then execute on laptop.

## Overview

`app.jsx` is **28,845 lines** in a single monolithic React component. The architecture is actually well-designed internally (clear section comments, well-named helpers) — the problem is that pure, testable logic is buried inside the App component where it can't be imported, tested, or reused.

Goal: extract **~6,500 LOC of testable logic** into modules, leaving `app.jsx` around 15,000 LOC of UI.

---

## Top 10 Extraction Candidates (ranked)

| # | Module | Lines | LOC | Risk | Value | Notes |
|---|--------|-------|-----|------|-------|-------|
| 1 | **Time Utilities** | 94–616 | ~400 | LOW | HIGH | Pure functions, zero deps — easiest win |
| 2 | **WHO Growth Percentiles** | 1625–1800 | ~150 | LOW | HIGH | Pure math, LMS tables |
| 3 | **Sleep Science Engine** | 7560–8650 | ~900 | MED | HIGH | Wake windows, AASM ranges — foundation for #8 |
| 4 | **Allergen & Weaning** | 802–938 | ~130+400 | LOW | MED | Removes huge data tables from app.jsx |
| 5 | **Timer State Machine** | 6800–7500 | ~700 | MED | HIGH | Custom hook: `useTimers()` |
| 6 | **CSV Import/Export** | 2985–3140 | ~150 | LOW | MED | Pure data transformation |
| 7 | **Night Classification** | 13033–13400 | ~350 | MED | HIGH | Core IP — protect with tests |
| 8 | **Prediction Engine** | 7639–8120 | ~450 | MED | HIGH | Your moat — must be tested |
| 9 | **Auth & Account** | 5200–6100 | ~900 | HIGH | MED | Custom hook: `useAuth()` |
| 10 | **Insights Cards** | 7470–12500 | ~2000 | HIGH | HIGH | Biggest win, hardest extraction |

---

## Cross-Cutting Concerns (fix these first or they'll bite)

1. **Root state** (`children`, `days`) — every module reads these. Pass `activeChild` as a single object.
2. **`localStorage` coupling** — create a `useLocalStorage()` hook, use consistently.
3. **Firebase sync** — extract `useFirebaseSync()` hook; errors bubble via callbacks.
4. **Theme global** (`window._themeCallback`) — keep theme in App; pass `C` as param to helpers.
5. **Timer interval leaks** — hook manages refs + cleanup, not scattered `setInterval`s.

---

## Recommended Extraction Order

### ✅ Phase 1 — Foundation (2 weeks)
**Low risk, builds momentum, unlocks testing.**

**Week 1** (550 LOC out): `/utils/time.js` + `/utils/growthPercentiles.js`
- Both are pure functions with zero side effects
- Write **5 tests for each** as you extract — sets up your test harness
- Safe to ship in isolation

**Week 2** (1,300 LOC out): `/logic/sleepScience.js` + `/logic/weaning.js`
- Sleep science is the foundation for predictions & night classification
- Weaning extraction removes 400 LOC of static data tables
- Still pure functions, still low risk

### 🟡 Phase 2 — Hooks & Logic (3 weeks)

**Week 3** (700 LOC out): `/hooks/useTimers.js`
- Encapsulates nap, breast, bedtime timers
- Moderate refactor: setters passed as params, hook owns interval cleanup
- Needs Phase 1 time utils first

**Week 4** (150 LOC out): `/utils/csvIO.js`
- Quick win, isolated

**Week 5** (350 LOC out): `/logic/nightClassification.js`
- Pass `(entries, bedMins, morningMins)` explicitly
- Write tests BEFORE extracting — this is core IP

### 🔴 Phase 3 — Hard Stuff (5+ weeks)

**Week 6** (450 LOC out): `/logic/sleepPredictions.js` ⚡ **Your moat**
- Decouple from `resolvedDay` closure
- Aim for 20+ tests covering edge cases (early wake, fragmented nights, regression)

**Week 7–8** (900 LOC out): `/hooks/useAuth.js`
- High risk: Firebase callbacks, error handling, account consistency
- Do NOT start until timer hook pattern is proven

**Week 9–10** (2,000 LOC out): `/logic/insights.js`
- Biggest payoff, hardest extraction
- 50+ helper functions
- Requires Weeks 2, 5, 6 complete

---

## What to Leave Alone (for now)

### UI Rendering (lines 12,500–28,827, ~16k LOC)
Tabs, day view, forms, modals. **Touch last.** After logic extractions, the right UI component boundaries become obvious. Attempting this first creates circular-dependency spaghetti.

### Cloud Sync Layer (lines 4,400–6,200, ~1.8k LOC)
Tangled with auth, hard to mock Firebase, well-tested in production. Defer until after Week 8 auth extraction.

---

## Quick Reference Checklist

```
Phase 1 (safe wins):
[ ] /utils/time.js              ~400 LOC
[ ] /utils/growthPercentiles.js ~150 LOC
[ ] /logic/sleepScience.js      ~900 LOC
[ ] /logic/weaning.js           ~530 LOC

Phase 2 (hooks):
[ ] /hooks/useTimers.js         ~700 LOC
[ ] /utils/csvIO.js             ~150 LOC
[ ] /logic/nightClassification.js ~350 LOC

Phase 3 (core IP + hard):
[ ] /logic/sleepPredictions.js  ~450 LOC  ⚡ MOAT
[ ] /hooks/useAuth.js           ~900 LOC
[ ] /logic/insights.js          ~2000 LOC

Deferred:
- UI component extraction (16k LOC)
- /hooks/useFirebaseSync.js (1.8k LOC)
```

**After all extractions: app.jsx ≈ 15,000 LOC (pure UI)**

---

## Testing Strategy

- Set up **Vitest** (Vite-native, zero config) in Phase 1 Week 1
- Each extracted logic module gets its own `.test.js`
- Target: 5–10 tests per module minimum
- Predictions module (#8) deserves 20+ tests — it's your IP
- No React mounting needed for logic tests — they run in milliseconds

---

## One Rule

**Never extract and refactor in the same commit.** Extract first (code moves, behaviour identical), commit, verify. Then refactor in separate commits. Makes bugs 10× easier to find.
