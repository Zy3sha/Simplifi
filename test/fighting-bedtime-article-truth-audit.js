import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const article = readFileSync(
  new URL('../content/blog/why-is-my-baby-fighting-bedtime.md', import.meta.url),
  'utf8',
);

test('scheduled bedtime-resistance article pins the current detector thresholds', () => {
  assert.match(article, /at least two recent nights/);
  assert.match(article, /25 minutes or longer/);
  assert.match(article, /at or after 8:30pm/);
  assert.match(article, /before 7pm/);
  assert.match(article, /roughly 8–10 months/);
  assert.match(article, /never tells a resisting baby to go later/);
});

test('scheduled bedtime-resistance article states the product boundary and entitlement', () => {
  assert.match(article, /Recording sleep, the end of the final nap and bedtime settling in \*\*Track\*\* is free/);
  assert.match(article, /Personalised \*\*Tomorrow's plan\*\*, \*\*Guidance\*\* and \*\*Care → Sleep Consultant\*\* are Premium features/);
  assert.match(article, /during pregnancy and through the first two corrected-age months/);
  assert.match(article, /cannot see tired cues/);
  assert.match(article, /cannot observe tired cues, diagnose a cause of distress, supervise sleep or replace advice/);
});

test('scheduled bedtime-resistance CTA has one attributable action', () => {
  const url = '/app.html?utm_source=fighting_bedtime_article&utm_medium=owned_search&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20260926_fighting_bedtime';
  assert.match(article, /Find the bedtime lever before changing everything/);
  assert.equal(article.split(url).length - 1, 1);
});

test('scheduled bedtime-resistance article keeps safer-sleep and medical escalation visible', () => {
  assert.match(article, /Always place your baby on their back/);
  assert.match(article, /firm, flat mattress/);
  assert.match(article, /Never fall asleep together on a sofa or armchair/);
  assert.match(article, /Use NHS 111 or your GP as appropriate and call 999 for a life-threatening emergency/);
});
