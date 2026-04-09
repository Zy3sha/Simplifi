# OBubba Test Checklist — Build 15
> Rebuild in Xcode (⇧⌘K → ⌘R) first, then go through each section

## 1. BASIC FLOW (5 min)
- [ ] App launches without crash
- [ ] Hero card shows correct state (sleeping/awake/nap)
- [ ] Quick-log row: tap Feed → logs ✓
- [ ] Quick-log row: tap Nappy → logs ✓
- [ ] Quick-log row: tap Nap → timer starts ✓
- [ ] Stop nap → timer stops, entry appears in timeline ✓
- [ ] Quick-log row: tap Wake → logs ✓
- [ ] Scroll the page — no accidental button taps ✓
- [ ] Tap "Today" card → segmented control shows [Log | Plan] ✓
- [ ] Swipe between Log and Plan ✓
- [ ] "Coming Up" card shows above the timeline ✓

## 2. HERO CARD STATES (5 min)
- [ ] Morning (no wake logged): shows "Good morning" or "Ready to start"
- [ ] Evening (after 5pm, no entries): shows "Good evening 🌙"
- [ ] Nap running: shows "Nap X" with timer
- [ ] Long nap (>60min): shows gentle message (NOT "wake the baby")
- [ ] Feed overdue: shows "might be ready for a feed" (NOT "feed now!")
- [ ] Night mode (bedtime logged): shows "Sleeping peacefully 🌙"
- [ ] Night mode + baby awake (paused): shows "Baby is awake"
- [ ] Last feed time shows during night mode ✓

## 3. OBSERVATIONS / JOURNAL (3 min)
- [ ] Tap "What we noticed" → journal opens
- [ ] Shows relevant observations (max 5 per day)
- [ ] Tap "Got it, thanks" → journal clears
- [ ] Reopen journal → empty (observations cleared)
- [ ] New observations appear after more logging

## 4. WELLBEING (3 min)
- [ ] "How are you feeling?" card visible on Today tab
- [ ] Tap "OK" → warm toast message
- [ ] Tap "Struggling" → full support modal opens (NOT just a toast)
- [ ] Support modal shows crisis helplines (UK numbers for you)
- [ ] Tap phone number → calls
- [ ] Tap "I hear you 💜" → modal closes

## 5. BUBBA CARE (5 min)
- [ ] Account → Bubba Care → Share and Print → share sheet opens
- [ ] QR code in the care guide works when scanned (opens care.html)
- [ ] Carer portal loads on Samsung/other phone
- [ ] Carer portal shows baby name, age, stats
- [ ] Live status card shows (sleeping/awake/etc)
- [ ] "Don't worry, you can't break anything" message visible
- [ ] Fonts are readable (14px minimum)
- [ ] Log a feed from carer portal → appears in main app for review

## 6. WEANING (3 min)
- [ ] Weaning section shows food suggestion
- [ ] Allergens appear in rotation (every 3rd suggestion)
- [ ] "Try later" button works → food skips, comes back later
- [ ] After 5pm: shows "Weaning meals done for today"
- [ ] Recipe Library: nutrient filter chips work (Iron-rich, Allergens, etc)

## 7. ACCOUNT (3 min)
- [ ] Share & Sync button works
- [ ] Bubba Care button works
- [ ] Save to Cloud button works
- [ ] App Tour button visible (not duplicated)
- [ ] Gentle Mode toggle in Preferences → shows "💛 On"
- [ ] Nursery Mode toggle → shows "🏫 On"
- [ ] Parenting style: tap each option → highlights correctly
- [ ] Child Settings: medical conditions (Reflux, CMPA, NICU, Tongue tie)

## 8. INSIGHTS (3 min)
- [ ] Sleep section loads without crash
- [ ] Weekly Rhythm chart visible (premium) or paywall teaser
- [ ] Day Score tiles: tap each → explainer modal opens
- [ ] "Why?" dropdown: opens, shows sleep pressure info
- [ ] "Does this match?" prompt at bottom of Why panel
- [ ] Tap "Baby seems tired earlier" → toast confirms

## 9. SHARE CARDS (3 min)
- [ ] Send to Family → Quick Summary → preview card appears
- [ ] Send to Family → Full Detailed Log → preview card appears (NOT text)
- [ ] Share button on preview → share sheet with image
- [ ] Morning/Evening Handover buttons work

## 10. NIGHT WAKES (test tonight)
- [ ] Bedtime logged → bed timer starts → Live Activity on lock screen
- [ ] "Baby awake" → night wake logged IMMEDIATELY
- [ ] Settle method selection → tap "Baby's settled, back to sleep"
- [ ] Wake entry updated with settle method + duration
- [ ] Morning: log wake → overnight timer shows final duration (not disappears)

## 11. EDGE CASES
- [ ] No DOB set → hero card shows "Add date of birth" prompt
- [ ] Premature baby (if due date set): shows "(adjusted: Xw)" in age display
- [ ] Archive child (if 2+ children): archive option works, memorial page opens
- [ ] Partner sync: tap "Sync now" in Account → syncs
- [ ] Sign out → sign back in → data restores

## BUGS FOUND
Write them here as you test:

1.
2.
3.
4.
5.
