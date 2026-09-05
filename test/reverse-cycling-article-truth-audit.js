import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const article = readFileSync(
  new URL('../content/blog/baby-feeds-more-at-night-than-day-reverse-cycling.md', import.meta.url),
  'utf8',
);

test('scheduled reverse-cycling article pins the current detector', () => {
  assert.match(article, /at least \*\*16 weeks corrected age\*\*/);
  assert.match(article, /at least \*\*two measured daytime milk feeds and two measured night milk feeds\*\*/);
  assert.match(article, /more than \*\*30% larger\*\*/);
  assert.match(article, /exceed \*\*100ml\*\*/);
  assert.match(article, /solids, pumping output and dream feeds are excluded from the comparison/);
  assert.match(article, /if any unmeasured daytime breastfeed appears in the window, the detector switches off/);
});

test('scheduled reverse-cycling article does not overstate the detector inputs', () => {
  assert.match(article, /the narrow reverse-cycling detector itself does not pretend that nappy or growth records prove why night feeding changed/);
  assert.doesNotMatch(article, /keeps wet nappies, night feeds and growth in the review before suggesting/);
  assert.match(article, /does \*\*not\*\* instruct the parent to stop a night feed suddenly/);
  assert.match(article, /cannot see swallowing, assess latch, diagnose a feeding aversion or know whether weight gain is appropriate/);
});

test('scheduled reverse-cycling article states entitlement and one attributable CTA', () => {
  assert.match(article, /Logging breast, bottle and night feeds in \*\*Track\*\* is free/);
  assert.match(article, /Personalised feeding-pattern insights and the \*\*Care → Feeding\*\* deep-dive are Premium features/);
  assert.match(article, /during pregnancy and through the first two corrected-age months/);
  const url = '/app.html?utm_source=reverse_cycling_article&utm_medium=owned_search&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20260928_reverse_cycling';
  assert.match(article, /See whether night is carrying the feeding day/);
  assert.equal(article.split(url).length - 1, 1);
});

test('scheduled reverse-cycling article keeps responsive-feeding and urgent-care boundaries', () => {
  assert.match(article, /Do not suddenly remove night feeds/);
  assert.match(article, /never forcing a baby to finish/);
  assert.match(article, /call 999 for an emergency/);
  assert.match(article, /Never feed on a sofa or armchair if you may fall asleep/);
});
