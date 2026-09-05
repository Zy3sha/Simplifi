import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const article = readFileSync(
  new URL('../content/blog/iron-rich-foods-for-babies-weaning.md', import.meta.url),
  'utf8',
);

test('scheduled iron-foods article preserves current NHS feeding guidance', () => {
  assert.match(article, /milk remains the main drink/);
  assert.match(article, /iron-containing foods join the diet from around six months/);
  assert.match(article, /vitamin C helps the body absorb iron/);
  assert.match(article, /does not give parents a universal gram target/);
  assert.match(article, /continue responsive milk feeds/);
});

test('scheduled iron-foods article pins the current insight threshold and matching safeguards', () => {
  assert.match(article, /from 26 weeks only after at least three recent solids meals/);
  assert.match(article, /roughly the last 21 days/);
  assert.match(article, /“goat” does not falsely count as “oat”/);
  assert.match(article, /“jellybean” does not count as “bean”/);
});

test('scheduled iron-foods article states current product capabilities and limits', () => {
  assert.match(article, /search 34 first-food ideas/);
  assert.match(article, /count iron-rich meals and unique foods in Weaning Progress/);
  assert.match(article, /exclude any allergen with a recorded reaction from future recipe suggestions/);
  assert.match(article, /does not know how much beef was swallowed/);
  assert.match(article, /fictional example data/);
});

test('scheduled iron-foods article states the entitlement boundary and one attributable CTA', () => {
  assert.match(article, /34-food reference, solids logging, Weaning Progress and the six-meal weekly plan are free/);
  assert.match(article, /Premium expands the personalised recipe selection and full recipe garden/);
  assert.match(article, /through your baby's first two corrected-age months/);
  assert.match(article, /Let the app remember which food comes next/);
  const url = '/app.html?utm_source=iron_foods_article&utm_medium=owned_search&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20261003_iron_foods';
  assert.equal(article.split(url).length - 1, 1);
});

test('scheduled iron-foods article contains no em-dash copy markers', () => {
  assert.doesNotMatch(article, /—/);
});
