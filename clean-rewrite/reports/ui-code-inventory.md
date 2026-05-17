# OBubba UI-Code Inventory

Generated: 2026-05-17T10:25:00.499Z

This report is deliberately conservative. Items listed as candidates still need a rendered UI check before deletion.

## Canonical Route State

| Signal | Value |
| --- | --- |
| Tabs | day, develop, insights, settings |
| Day subscreens | log, news, notes, plan, today, weaning, weaning_before, weaning_journal, weaning_journey, weaning_next_week, weaning_report, weaning_this_week, weaning*, wellbeing |
| Care insight filters | feeding, growth, nightwean, reports, safesleep, sleep, travel |
| Static test ids | 146 |
| Dynamic test-id expressions | 10 |
| CSS classes | 502 |

## High-Risk Cleanup Candidates

### CSS selectors for test ids not present in current app source

- None found.

### CSS class selectors not found in app/care/index source

- None found.

### Legacy/old/final-lock style blocks to review

- [styles.css:1123] Care dashboard priority tools final lock: Weaning and Parent Room lead the Care page.
- [styles.css:1130] Care dashboard Insight card final lock: Sleep, Feeding, Growth and Reports live inside one readable Insight card.
- [styles.css:1317] ═══ Liquid glass parity pass Native screenshots were still reading as chunky dark/gold. This final layer removes the old amber frame language and makes Today match the cleaner Apple glass preview: translucent surfaces, hairline borders, subtle lift, compact controls, and no wrapped quick-action grid. ═══
- [styles.css:1465] Final native glass refinement: reduce the old warm outline/glow language on inline-styled controls so phone builds match the cleaner preview.
- [styles.css:1841] Hard stop for the older halo pass. Keep the two inset corner blooms, but remove every outside glow/shadow from rounded app surfaces so cards do not look wrapped in light.
- [styles.css:2637] Night small-control candle pass. These repeated 4am controls should feel like dark glass catching orange candlelight, not a yellow/gold UI theme. Keep the warmth on the rim and the lower reflection only so labels stay crisp.
- [styles.css:3405] Weaning style choice final lock: puree, baby-led and mixed stay readable on small phones.
- [styles.css:3424] Weaning recipe prep sheet final lock: opened recipes answer prep first, then details.
- [styles.css:4023] Night log experiment: keep the navy glass face, but swap sheet/log rims from amber candlelight to a soft violet edge so the logging windows feel cleaner.
- [styles.css:4271] Physical end guard: rounded navigation capsules. Keep this after the dock clamp so the old loved four-pill navigation wins.
- [styles.css:4303] Day view visual repair. The selected tab needs a visible but contained spotlight. Keep this at the very end because several older guards reset the same controls.
- [styles.css:4461] Retired Track status card readability guard.
- [styles.css:4681] Absolute final rounded navigation buttons. Bring back the older four-capsule tab feel inside the native dock while keeping the newer fixed-height/safe-area clamp that prevents bottom overlap.
- [styles.css:4788] Physical end guard: rounded navigation capsules. This has to sit after the dock clamp, otherwise the clamp's transparent button reset wins and the older four-pill navigation disappears.
- [styles.css:4896] Physical end guard: rounded navigation capsules. Keep this after the dock clamp so the old loved four-pill navigation wins.
- [styles.css:5624] Clock global toast translucent glass final lock: toasts must float as clear frost, not opaque blocks.
- [styles.css:5930] Physical end guard: rounded navigation capsules. This has to sit after the dock clamp, otherwise the clamp's transparent button reset wins and the older four-pill navigation disappears.
- [styles.css:5963] Day view final repair. Keep this at physical EOF: older generated guards above also target button press and bottom navigation.
- [styles.css:5967] Daylight premium v2 pass. Day mode should feel as deliberately designed as night mode: pearl glass, clearer ink, visible warm/cool rims, and physical separation from the page. The small final lock at EOF keeps the one-tap log on the same material after the joined-log layout pass.
- [styles.css:6208] Clock lab daylight final lock: win after the older night-lab reference blocks.
- [styles.css:6564] Clock lab requested log colour and touch-target final lock.
- [styles.css:6672] Clock lab thin outline arc final lock: timed logs stay line-like, not filled bands.
- [styles.css:6723] Clock lab requested log colour final lock: wake yellow, feed light blue, nappy highlighter yellow-green, solids purple.
- [styles.css:7171] Clock lab reassurance note absolute final lock: quiet integrated bedtime care.
- [styles.css:7242] Clock lab reassurance note final lock: quiet integrated bedtime care.
- [styles.css:7650] Clock lab reference log colours: neon blue, warm gold, ice blue, and violet.
- [styles.css:7728] Clock lab day-mode specificity lock: app-day must win over older adjacent content selectors.
- [styles.css:7872] Clock lab app-day actual final lock: the lab day preview must use OBubba's real light app mode, not the old cream concept.
- [styles.css:9841] Clock home lab: gated prototype for the new Track landing surface.
- [styles.css:11054] Night header polish. Keep the compact header height, but stop it reading as a flat grey strip. The header now has its own muted plum/navy glass with a rose-gold rim so it feels designed, not washed over.
- [styles.css:12203] Daylight premium pass. Night mode already has depth from darkness. Day mode needs contrast from glass edges, cooler light, and shadow separation so it does not feel washed into one pale peach surface. Keep this at EOF so it wins over older day repair guards without touching dark mode.
- [styles.css:12382] Today's Play activities pass. This screen is now intentionally low-load: one development card and tiny play ideas, with the old analysis layers retired from the visible UI.
- [styles.css:12715] Daylight premium v2 final lock. Daylight gets this small afterburner to keep the richer material on the visible clock tools.
- [styles.css:12775] Clock lab emoji visibility final lock: keep native emoji large after older clock rules.
- [styles.css:12826] Clock lab daylight absolute final lock: day preview must stay airy even over dark app chrome.
- [styles.css:12954] Clock lab app-day actual final lock: the lab day preview must use OBubba's real light app mode, not the old cream concept.
- [styles.css:13224] Clock lab requested log colour and touch-target final lock.
- [styles.css:13295] Clock lab thin outline arc final lock: timed logs stay line-like, not filled bands.
- [styles.css:13351] Clock lab centre title face-fit final lock.
- [styles.css:13368] Clock lab neon marker final lock: night wakes use the same small marker language as every other point log.
- [styles.css:13421] Clock lab outside bedtime visual weight final lock: keep bedtime tappable via the invisible rail, but draw the visible outside arc as a slim line.
- [styles.css:13437] Clock lab night-wake duration final lock: soothed minutes render as the log arc, not a duplicate marker.
- [styles.css:13453] Clock lab logs totals final lock: split sleep into night sleep and naps without widening the panel.
- [styles.css:13464] Clock lab ghost prediction arcs final lock: today-only future hints stay dashed and secondary to real logs.
- [styles.css:13491] Clock lab small point-log final lock: dots should not overpower duration arcs.
- [styles.css:13517] Clock lab kindness centered calm final lock: no side glow, no detached dot.
- [styles.css:13556] Clock lab timer orbit dot final lock: one travelling point only, never a ring.
- [styles.css:13580] Clock lab readable ordered totals final lock: feed, nappies, naps, awake, night sleep.
- [styles.css:13599] Clock lab day-context import final lock: Today type lives in the opt-in clock lab, not the normal Track dashboard.
- [styles.css:13746] Clock lab kindness rhythm-ribbon final lock: reassurance belongs to the clock, not a floating header.
- [styles.css:13822] Clock lab Today type below logs final lock: context follows the one-tap tools.
- [styles.css:13834] Clock lab last-night debrief import final lock: Guidance keeps the existing Sleep debrief one tap away.
- [styles.css:13906] Clock lab Guidance direct tools final lock: no copied mini hero, no hidden More drawer.
- [styles.css:13907] Clock lab Plan direct tools final lock: Plan owns the softer-day action.
- [styles.css:13965] Clock lab Guidance noticed inline final lock: relevant journal cards live inside Guidance.
- [styles.css:14118] Clock lab top exhale final lock: kindness returns above the clock as a small app-aware moment.
- [styles.css:14208] Clock lab wake-window hover final lock: wake-window arcs report duration without becoming chunky.
- [styles.css:14227] Clock lab completed-arc hover final lock: the invisible rail owns hover so nap arcs do not flicker.
- [styles.css:14264] Clock lab prediction chip below-clock final lock: chips and hover tips do not sit on top of arcs.
- [styles.css:14285] Clock lab daylight contrast audit final lock: day Track is soft, but never washed out.
- [styles.css:14342] Clock lab day reference final lock: pearl/sky app glass, no pink wash behind the clock, and normal pre-clock bottom navigation chrome.
- [styles.css:14482] Clock lab day controls final lock: same clock scale as night, no extra outer orb, and light glass log buttons.
- [styles.css:14635] Clock lab emoji no-tile final lock: log emojis sit directly on the glass buttons.
- [styles.css:14664] Clock lab log label fit final lock: log buttons can use two tidy lines instead of clipping words.
- [styles.css:14723] Clock lab bottom-nav clearance final lock: opened drawers stay reachable above the fixed app navigation.
- [styles.css:14744] Clock lab neon wake-window final lock: wake-window arcs are highlighter pink in day and night.
- [styles.css:14760] Clock lab old Track affordances final lock: bedtime routine, bridge naps and nap-refused choices live on the new clock home.
- [styles.css:15164] Clock lab highlighter-set final lock: every logged type keeps its own neon marker colour.
- [styles.css:15298] Clock lab readable drawer actions final lock: embedded Guidance cards and drawer endings must stay legible above glass/nav.
- [styles.css:15330] Clock lab 3D dial final lock: day and night faces use real SVG bevel, recess and glass layers.
- [styles.css:15415] Clock lab no-scratch rim final lock: decorative glass curves stay out of the dial.
- [styles.css:15465] Clock lab firefly orb final lock: night presence uses the pressed navigation amber glow, not insect wings.
- [styles.css:15496] Clock lab presence hover final lock: fireflies explain shared awake presence without covering clock arcs.
- [styles.css:15632] Clock lab solid dot final lock: point logs are filled highlighter circles, not hollow rings.
- [styles.css:15647] Clock lab day sun final lock: centre art reads as a sun, with corona, warm core and proper rays.
- [styles.css:15674] Clock lab centre timer hit target final lock: only the Nap now / active timer text starts or pauses timers.
- [styles.css:15695] Clock lab Guidance unread pulse final lock: new guidance glows until the Guidance tab is opened and looked at.
- [styles.css:15751] Clock lab Logs tab row format final lock: colour badge, label, time, then type or duration detail.
- [styles.css:15847] Clock lab mobile arc info final lock: tapping a log arc opens the card, then the card owns editing.
- [styles.css:15900] Care read-first audit final lock: Care sections lead with warm consultant context before charts or records.
- [styles.css:16908] Final readability lock. This sits last on purpose: many older glass passes use inline-style matching and late button rules, so text colour must be normalised after all surfaces have settled.
- [styles.css:17045] Android WebView clock render stability final lock. Later glass/firefly passes deliberately look richer on iOS and desktop, but Android WebView can flicker when fixed full-screen layers, backdrop-filter, blend modes and animated SVG filters overlap. This final pass keeps the same clock layout with static, concrete surfaces and explicit readable text.
- [styles.css:17617] Clock lab quick-log fit final lock: the collapsed one-tap row should use the full card width instead of leaving a dead gap after Pump.
- [styles.css:17796] Clock lab nap sweet spot final lock: one-glance timing signal on top of OBubba's existing prediction and learned wake-window data.

## Most Repeated Render Test Ids

| Test id | Count |
| --- | --- |
| clock-home-log-buttons | 3 |
| plan-ahead-card | 2 |
| sleep-consultant-summary | 2 |
| tour-backdrop | 2 |
| tour-readable-copy | 2 |
| tour-step-label | 2 |
| weaning-style-choice | 2 |
| '+id+' | 1 |
| account-daily-log-reminder-preference | 1 |
| account-daily-log-reminder-time | 1 |
| account-daily-log-reminder-toggle | 1 |
| account-day-boundary-section | 1 |
| account-first-aid-section | 1 |
| account-guides-section | 1 |
| account-haptics-preference | 1 |
| account-haptics-toggle | 1 |
| account-preferences-section | 1 |
| account-time-capsule-section | 1 |
| activity-edit-sheet | 1 |
| add-recipe-next-week | 1 |
| add-recipe-this-week | 1 |
| breast-start-picker | 1 |
| breast-timer-edit-sheet | 1 |
| bubba-care-growth-prompt | 1 |
| care-dashboard-tools | 1 |

## Dynamic Test-Id Expressions

- `_modeRead6.testId`
- `"care-section-guide-"+kind`
- `"care-tile-"+f.id`
- `"weaning-recipe-prep-"+option`
- `"weaning-style-option-"+opt.id`
- `"weaning-tool-"+tab.id`
- `clockBedtimeLogged ? "clock-tomorrow-plan-locked" : "clock-today-plan-locked"`
- `clockBedtimeLogged ? "clock-tomorrow-plan" : "clock-today-plan"`
- `isTodaysWeaningPlanRow ? "clock-plan-weaning-actions" : "clock-plan-row-actions"`
- `testId`

## Largest Root Files

| File | Size |
| --- | --- |
| app.jsx | 4504 KB |
| app.js | 3800 KB |
| app.min.js | 2606 KB |
| sleep-baby.png | 1183 KB |
| obubba-thinking.png | 1098 KB |
| obubba-loading.png | 1040 KB |
| obubba-celebration.png | 999 KB |
| obubba-happy.png | 966 KB |
| styles.css | 774 KB |
| styles.min.css | 609 KB |
| obubba-happy.jpeg | 287 KB |
| package-lock.json | 286 KB |
