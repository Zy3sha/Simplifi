import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const article = readFileSync(
  new URL('../content/blog/what-should-baby-wear-outside.md', import.meta.url),
  'utf8',
);
const renderer = readFileSync(
  new URL('../tools/render-seo.mjs', import.meta.url),
  'utf8',
);

test('scheduled outdoor-wear article preserves current NHS and transport safety guidance', () => {
  assert.match(article, /one extra clothing layer for a baby compared with an adult/);
  assert.match(article, /Never drape a muslin, blanket or cloth over the whole pram/);
  assert.match(article, /babies under six months out of direct sunlight/i);
  assert.match(article, /not to feed a baby while they are in a sling/);
  assert.match(article, /Remove bulky outerwear before fastening your baby/);
});

test('scheduled outdoor-wear article states the two weather paths precisely', () => {
  assert.match(article, /quick weather sheet uses feels-like for its outerwear band/);
  assert.match(article, /fills the detailed calculator with the actual local air temperature/);
  assert.match(article, /adjusts the layer grading for the selected context/);
  assert.match(article, /normal, sunny, windy, pram, carrier and car-seat contexts/);
  assert.match(article, /car-seat warning if a bulky coat or snowsuit is selected/);
});

test('scheduled outdoor-wear article states product limits, entitlement and one attributable CTA', () => {
  assert.match(article, /cannot feel your baby's skin/);
  assert.match(article, /cannot.*confirm that a harness fits/);
  assert.match(article, /Outdoor outfit check is free/);
  assert.match(article, /Premium adds deeper personalised sleep analysis and planning/);
  assert.match(article, /through your baby's first two corrected-age months/);
  const url = '/app.html?utm_source=baby_outdoor_wear_article&utm_medium=owned_search&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20261005_baby_outdoor_wear';
  assert.equal(article.split(url).length - 1, 1);
});

test('scheduled outdoor-wear article discloses example data and ships both referenced images', () => {
  assert.match(article, /fictional example temperature, context and layer selections/);
  for (const asset of [
    'obubba-what-baby-wear-outside.jpg',
    'obubba-outdoor-outfit-calculator-app.jpg',
  ]) {
    assert.equal(existsSync(new URL(`../${asset}`, import.meta.url)), true);
    assert.match(renderer, new RegExp(`'${asset.replaceAll('.', '\\.')}'`));
  }
});

test('scheduled outdoor-wear article contains no em-dash copy markers', () => {
  assert.doesNotMatch(article, /—/);
});
