import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const article = readFileSync(
  new URL('../content/blog/baby-waking-every-two-hours.md', import.meta.url),
  'utf8',
);

test('scheduled two-hour-waking article pins the immediate wake-card inputs', () => {
  assert.match(article, /parent's chosen reason, the wake's time and position in the night, recorded day-sleep total, and recent teething, illness or developmental context/);
  assert.match(article, /does \*\*not currently receive the exact last-feed gap, bedtime or final wake window\*\*/);
  assert.match(article, /ranks the strongest grounded signals and shows at most three/);
  assert.match(article, /under roughly 16 weeks/);
  assert.match(article, /immediate card only labels hunger when the parent selected hunger/);
  assert.match(article, /does not infer overtiredness from an unavailable final wake window/);
  assert.match(article, /only uses a sleep-cycle label when the parent selected “just unsettled”/);
  assert.match(article, /does not currently infer one from cycle timing alone/);
  assert.match(article, /stays out of the way instead of guessing/);
  assert.doesNotMatch(article, /sleep-cycle timing is a fallback/);
  assert.doesNotMatch(article, /if there is not enough evidence, the app says so/);
});

test('scheduled two-hour-waking article pins the broader disruption gate', () => {
  assert.match(article, /reviews ten prior nights/);
  assert.match(article, /at least two of the latest five nights contain three or more recorded wakes/);
  assert.match(article, /latest nights show a clear rise above the baby's own baseline/);
  assert.match(article, /Recent illness, teething, a recorded milestone, new food and measured feeding-volume changes/);
  assert.match(article, /None of those signals prove causation/);
});

test('scheduled two-hour-waking article states current urgent-care boundaries', () => {
  assert.match(article, /call 999 or go to A&E/);
  assert.match(article, /\*\*38°C or above for a baby under three months\*\*/);
  assert.match(article, /\*\*39°C or above for a baby aged three to six months\*\*/);
  assert.match(article, /Call NHS 111 if you are worried about any symptom or do not know what to do/);
  assert.match(article, /never to sleep with a baby on a sofa or armchair/i);
  assert.match(article, /not medical advice/);
});

test('scheduled two-hour-waking article states entitlement and one attributable CTA', () => {
  assert.match(article, /Logging wakes, feeds and naps in \*\*Track\*\*[^\n]*is free/);
  assert.match(article, /deeper personalised \*\*Guidance\*\* panel and \*\*Care → Sleep Consultant\*\* are Premium features/);
  assert.match(article, /during pregnancy and through the first two corrected-age months/);
  assert.match(article, /Turn repeated wakes into one useful question/);
  const url = '/app.html?utm_source=two_hour_waking_article&utm_medium=owned_search&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20260930_two_hour_waking';
  assert.equal(article.split(url).length - 1, 1);
});

test('scheduled two-hour-waking article contains no em-dash copy markers', () => {
  assert.doesNotMatch(article, /—/);
});
