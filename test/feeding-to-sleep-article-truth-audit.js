import assert from 'node:assert/strict';
import fs from 'node:fs';

const article = fs.readFileSync(
  new URL('../content/blog/is-feeding-to-sleep-a-bad-habit.md', import.meta.url),
  'utf8',
);

assert.match(article, /at least three recorded resettles/i);
assert.match(article, /at least 80% of them/i);
assert.match(article, /From roughly 17 weeks/i);
assert.match(article, /Build the anchors:[\s\S]*at least four nights/i);
assert.match(article, /continuing to feed real night hunger/i);
assert.match(article, /cannot see latch quality, measure milk transfer, determine whether a baby is hungry/i);

assert.match(article, /Recording feeds, sleep, meaningful wakes and how a wake was settled in \*\*Track\*\* is free/i);
assert.match(article, /association \*\*Guidance\*\* and \*\*Care → Sleep Consultant\*\* plan are Premium features/i);
assert.match(article, /through the first two corrected-age months/i);

assert.match(article, /Keep hunger and settling in the same picture/);
assert.match(article, /utm_source=feeding_to_sleep_article/);
assert.match(article, /utm_medium=owned_search/);
assert.match(article, /utm_campaign=from_bump_to_baby_auto/);
assert.match(article, /utm_content=auto_20260925_feeding_to_sleep/);

console.log('Feeding-to-sleep article truth and attribution audit passed.');
