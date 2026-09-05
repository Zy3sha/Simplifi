import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const article = readFileSync(
  new URL('../content/blog/baby-awake-for-hours-at-night-split-night.md', import.meta.url),
  'utf8',
);

test('scheduled split-night article pins the current detection boundaries', () => {
  assert.match(article, /explicitly timed wake of at least 60 minutes or a credible gap of at least 60 minutes between two sleep arcs/);
  assert.match(article, /must start more than 45 minutes after bedtime/);
  assert.match(article, /open pause or forgotten timer is not trusted as a multi-hour wake/);
  assert.match(article, /ignored when another wake or feed was already logged inside it/);
  assert.match(article, /at least two qualifying nights from up to seven observed nights/);
  assert.match(article, /stays quiet below about 16 weeks/);
  assert.doesNotMatch(article, /needs a measured wake of at least 60 minutes/);
  assert.doesNotMatch(article, /not automatically promoted to a split-night verdict/);
});

test('scheduled split-night article separates direct inputs from adjacent context', () => {
  assert.match(article, /checks the bedtime day's sleep, not the following day's naps/);
  assert.match(article, /If day sleep was low, it explicitly says \*\*do not cut it\*\*/);
  assert.match(article, /They are not all inputs to the same split-night rule/);
  assert.match(article, /current app using fictional example data/);
  assert.match(article, /hypotheses from logged data, not diagnoses/);
});

test('scheduled split-night article states current urgent and safer-sleep boundaries', () => {
  assert.match(article, /call 999 or go to A&E/);
  assert.match(article, /38°C or higher in a baby under three months/);
  assert.match(article, /39°C or higher from three to six months/);
  assert.match(article, /Call NHS 111 if you are worried or do not know what to do/);
  assert.match(article, /never to fall asleep with a baby on a sofa or armchair/i);
  assert.match(article, /not medical advice/);
});

test('scheduled split-night article states entitlement and one attributable CTA', () => {
  assert.match(article, /immediate Track read are free/);
  assert.match(article, /Deeper Guidance and \*\*Care → Sleep Consultant\*\* are Premium/);
  assert.match(article, /through your baby's first two corrected-age months/);
  assert.match(article, /Make one long wake useful tomorrow/);
  const url = '/app.html?utm_source=split_night_article&utm_medium=owned_search&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20261001_split_night';
  assert.equal(article.split(url).length - 1, 1);
});

test('scheduled split-night article contains no em-dash copy markers', () => {
  assert.doesNotMatch(article, /—/);
});
