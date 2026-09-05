import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const article = readFileSync(
  new URL('../content/blog/how-to-help-baby-with-jet-lag.md', import.meta.url),
  'utf8',
);
const renderer = readFileSync(
  new URL('../tools/render-seo.mjs', import.meta.url),
  'utf8',
);

test('scheduled jet-lag article preserves current travel and safer-sleep guidance', () => {
  assert.match(article, /adjusting a child's sleep schedule for two or three days before departure/);
  assert.match(article, /local morning.*daylight/is);
  assert.match(article, /short rescue nap/);
  assert.match(article, /firm, flat mattress/);
  assert.match(article, /Do not give a baby melatonin/);
  assert.match(article, /melatonin is prescription-only/);
});

test('scheduled jet-lag article states current product behavior precisely', () => {
  assert.match(article, /12 hours behind to 12 hours ahead/);
  assert.match(article, /30-minute pre-travel bedtime shifts for up to three days/);
  assert.match(article, /saves one active plan on the device/);
  assert.match(article, /day N of about M/);
  assert.match(article, /offset divided into 30-minute daily steps/);
  assert.match(article, /not.*prediction of when a particular baby's circadian rhythm will settle/);
});

test('scheduled jet-lag article states limits, entitlement and one attributable CTA', () => {
  assert.match(article, /does not automatically observe or confirm that any suggested step happened/);
  assert.match(article, /keep milk feeds responsive/);
  assert.match(article, /Travel planner is free/);
  assert.match(article, /Premium adds deeper personalised sleep analysis and planning/);
  assert.match(article, /through your baby's first two corrected-age months/);
  const url = '/app.html?utm_source=baby_jet_lag_article&utm_medium=owned_search&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20261006_baby_jet_lag';
  assert.equal(article.split(url).length - 1, 1);
});

test('scheduled jet-lag article discloses example data and ships both referenced images', () => {
  assert.match(article, /fictional example settings for a five-hour eastward trip/);
  for (const asset of [
    'obubba-baby-jet-lag-travel-plan.jpg',
    'obubba-baby-timezone-plan-app.jpg',
  ]) {
    assert.equal(existsSync(new URL(`../${asset}`, import.meta.url)), true);
    assert.match(renderer, new RegExp(`'${asset.replaceAll('.', '\\.')}'`));
  }
});

test('scheduled jet-lag article contains no em-dash copy markers', () => {
  assert.doesNotMatch(article, /—/);
});
