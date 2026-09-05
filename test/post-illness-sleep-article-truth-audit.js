import assert from 'node:assert/strict';
import fs from 'node:fs';

const article = fs.readFileSync(
  new URL('../content/blog/baby-sleep-worse-after-illness-reset-plan.md', import.meta.url),
  'utf8',
);

assert.match(article, /at least two recent nights with three or more wakes, or a meaningful rise against that baby's earlier pattern/i);
assert.match(article, /around \*\*5 to 14 days old\*\*/i);
assert.match(article, /at least seven recorded nights/i);
assert.match(article, /last two nights to return within one wake of baseline/i);
assert.match(article, /cannot hear breathing, see skin colour, measure hydration, verify a thermometer reading or decide that a baby is medically well/i);

assert.match(article, /core \*\*Track\*\* logs[^.]+are free/i);
assert.match(article, /Tonight's Guidance\*\*, \*\*Insights\*\* and the sleep Coach are Premium features/i);
assert.match(article, /through the first two corrected-age months/i);

assert.match(article, /Track recovery without starting over/);
assert.match(article, /utm_source=post_illness_sleep_article/);
assert.match(article, /utm_medium=owned_search/);
assert.match(article, /utm_campaign=from_bump_to_baby_auto/);
assert.match(article, /utm_content=auto_20260922_post_illness_sleep/);

console.log('Post-illness sleep article truth and attribution audit passed.');
