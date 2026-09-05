import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const article = readFileSync(
  new URL('../content/blog/is-my-baby-ready-for-solids.md', import.meta.url),
  'utf8',
);
const renderer = readFileSync(
  new URL('../tools/render-seo.mjs', import.meta.url),
  'utf8',
);

test('scheduled solids-readiness article preserves current NHS guidance', () => {
  assert.match(article, /stay sitting and hold their head steady/);
  assert.match(article, /coordinate their eyes, hands and mouth/);
  assert.match(article, /swallow food rather than automatically pushing it back out/);
  assert.match(article, /waking in the night is not a readiness sign/);
  assert.match(article, /milk remains the main source of nutrition and the main drink throughout the first year/i);
  assert.match(article, /born prematurely, ask your health visitor, GP, dietitian or neonatal team/);
});

test('scheduled solids-readiness article states current app behavior precisely', () => {
  assert.match(article, /free \*\*Before first tastes\*\* screen/);
  assert.match(article, /combines the baby's corrected age with a three-sign checklist/);
  assert.match(article, /saved on the device for the selected child/);
  assert.match(article, /rather than being inferred or medically assessed by the app/);
  assert.match(article, /does not certify that swallowing is safe/);
});

test('scheduled solids-readiness article states entitlement and one attributable CTA', () => {
  assert.match(article, /Premium adds deeper personalised sleep analysis and planning/);
  assert.match(article, /through your baby's first two corrected-age months/);
  const url = '/app.html?utm_source=solids_readiness_article&utm_medium=owned_search&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20261007_solids_readiness';
  assert.equal(article.split(url).length - 1, 1);
});

test('scheduled solids-readiness article discloses example data and ships both images', () => {
  assert.match(article, /fictional example readiness selections/);
  for (const asset of [
    'obubba-baby-ready-for-solids.jpg',
    'obubba-solids-readiness-checklist-app.jpg',
  ]) {
    assert.equal(existsSync(new URL(`../${asset}`, import.meta.url)), true);
    assert.match(renderer, new RegExp(`'${asset.replaceAll('.', '\\.')}'`));
  }
});

test('scheduled solids-readiness article contains no em-dash copy markers', () => {
  assert.doesNotMatch(article, /—/);
});
