import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const article = readFileSync(
  new URL('../content/blog/should-i-wake-my-baby-from-a-nap.md', import.meta.url),
  'utf8',
);

test('scheduled nap-waking article pins the current evidence safeguards', () => {
  assert.match(article, /at least three days with naps logged/);
  assert.match(article, /require at least eight nights carrying the relevant factor/);
  assert.match(article, /both sides of the comparison need at least three nights/);
  assert.match(article, /at least 0\.7 extra wakes on average/);
  assert.match(article, /“tends to” accompany more wakes/);
  assert.match(article, /provided at least 15 minutes of nap remains/);
});

test('scheduled nap-waking article states free and Premium boundaries', () => {
  assert.match(article, /live nap clock and recording when your baby actually wakes are free in \*\*Track\*\*/);
  assert.match(article, /Personalised sleep correlations, \*\*Tomorrow's plan\*\*, \*\*Guidance\*\* and \*\*Care → Sleep Consultant\*\* are Premium features/);
  assert.match(article, /during pregnancy and through the first two corrected-age months/);
  assert.match(article, /prediction is \*\*not an alarm or an instruction\*\*/);
});

test('scheduled nap-waking CTA is singular and attributable', () => {
  const url = '/app.html?utm_source=wake_baby_from_nap_article&utm_medium=owned_search&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20260927_wake_nap';
  assert.match(article, /See whether the nap is really the problem/);
  assert.equal(article.split(url).length - 1, 1);
});

test('scheduled nap-waking article keeps feeding, medical and safer-sleep boundaries', () => {
  assert.match(article, /Follow the plan, including waking if advised/);
  assert.match(article, /Do not shake, startle, splash with water or use loud noise/);
  assert.match(article, /Call 999 for a life-threatening emergency/);
  assert.match(article, /Put your baby on their back at the start of every sleep/);
  assert.match(article, /cannot assess feeding effectiveness, weight gain, jaundice, tired cues or whether a baby is clinically difficult to rouse/);
});
