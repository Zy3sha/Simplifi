import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const article = readFileSync(
  new URL('../content/blog/how-much-water-baby-starting-solids.md', import.meta.url),
  'utf8',
);

test('scheduled water-and-solids article preserves current NHS feeding guidance', () => {
  assert.match(article, /small sips with meals/);
  assert.match(article, /main drink throughout the first year/);
  assert.match(article, /open or non-valved free-flow cup/);
  assert.match(article, /Fully breastfed babies normally do not need extra water before solids/);
  assert.match(article, /formula-fed babies under six months \*\*may\*\* need small sips of cooled boiled water/);
  assert.match(article, /never dilute it/i);
  assert.match(article, /not reaching a universal millilitre target/i);
});

test('scheduled water-and-solids article states current dehydration and urgent-help boundaries', () => {
  assert.match(article, /No single app number or cup measurement can diagnose hydration/);
  assert.match(article, /fewer wet nappies/);
  assert.match(article, /call 999 or go to A&E/);
  assert.match(article, /has not had a wee for 12 hours/);
  assert.match(article, /Call NHS 111 if you are worried or do not know what to do/);
  assert.match(article, /not medical advice/);
});

test('scheduled water-and-solids article pins current product limits', () => {
  assert.match(article, /offers 34 searchable ideas/);
  assert.match(article, /a solids amount is treated as food, not silently added to millilitres of fluid/);
  assert.match(article, /pumping is milk expressed, not automatically counted as milk the baby drank/);
  assert.match(article, /waits for a consistent recent nappy record and until later in the day/);
  assert.match(article, /does \*\*not\*\* claim that cup sips equal a hydration percentage/);
  assert.match(article, /cannot see what spilled, measure breast-milk transfer/);
});

test('scheduled water-and-solids article states entitlement and one attributable CTA', () => {
  assert.match(article, /34-food reference, the pre-weaning guide, Track logging and the six-meal weekly plan are free/);
  assert.match(article, /Premium expands the personalised recipe selection and full recipe garden/);
  assert.match(article, /through your baby's first two corrected-age months/);
  assert.match(article, /Keep milk, meals and nappies in one useful picture/);
  const url = '/app.html?utm_source=water_solids_article&utm_medium=owned_search&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20261002_water_solids';
  assert.equal(article.split(url).length - 1, 1);
});

test('scheduled water-and-solids article contains no em-dash copy markers', () => {
  assert.doesNotMatch(article, /—/);
});
