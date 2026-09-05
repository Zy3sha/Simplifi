import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const article = readFileSync(
  new URL('../content/blog/what-should-baby-wear-to-sleep.md', import.meta.url),
  'utf8',
);
const renderer = readFileSync(
  new URL('../tools/render-seo.mjs', import.meta.url),
  'utf8',
);

test('scheduled sleepwear article preserves current safer-sleep guidance', () => {
  assert.match(article, /room temperature of 16–20°C/);
  assert.match(article, /2\.5 TOG for 16–20°C/);
  assert.match(article, /1\.0 TOG for 20–24°C/);
  assert.match(article, /0\.5 TOG for 24–27°C/);
  assert.match(article, /chest or the back of their neck/);
  assert.match(article, /manufacturer’s instructions/);
  assert.match(article, /Avoid weighted sleeping bags and weighted swaddles/);
});

test('scheduled sleepwear article states urgent fever and product limits', () => {
  assert.match(article, /under three months with a temperature of 38°C or higher need urgent medical advice/);
  assert.match(article, /does not claim to sense your baby's body temperature/);
  assert.match(article, /cannot see whether the neck opening fits/);
  assert.match(article, /never pre-fills the indoor temperature from the outdoor forecast/);
});

test('scheduled sleepwear article states entitlement and one attributable CTA', () => {
  assert.match(article, /Safe Sleep guide and its room-temperature tool are free/);
  assert.match(article, /Premium adds deeper personalised sleep analysis and planning/);
  assert.match(article, /through your baby's first two corrected-age months/);
  assert.match(article, /Dress for the room, not the season/);
  const url = '/app.html?utm_source=baby_sleepwear_article&utm_medium=owned_search&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20261004_baby_sleepwear';
  assert.equal(article.split(url).length - 1, 1);
});

test('scheduled sleepwear article discloses fictional profile data and ships both referenced images', () => {
  assert.match(article, /fictional baby profile/);
  for (const asset of [
    'obubba-what-baby-wear-to-sleep.jpg',
    'obubba-safe-sleep-room-temperature-app.jpg',
  ]) {
    assert.equal(existsSync(new URL(`../${asset}`, import.meta.url)), true);
    assert.match(renderer, new RegExp(`'${asset.replaceAll('.', '\\.')}'`));
  }
});

test('scheduled sleepwear article contains no em-dash copy markers', () => {
  assert.doesNotMatch(article, /—/);
});
