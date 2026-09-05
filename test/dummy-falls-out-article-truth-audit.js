import assert from 'node:assert/strict';
import fs from 'node:fs';

const article = fs.readFileSync(
  new URL('../content/blog/baby-wakes-when-dummy-falls-out.md', import.meta.url),
  'utf8',
);

assert.match(article, /at least three recorded wakes in one night/i);
assert.match(article, /at least 80% of those wakes/i);
assert.match(article, /under roughly six months, the app keeps the dummy/i);
assert.match(article, /structured \*\*Swap the dummy\*\* plan is not offered yet/i);
assert.match(article, /From roughly six months/i);
assert.match(article, /not a promise that a dummy prevents SIDS/i);

assert.match(article, /Recording sleep, meaningful wakes and the resettling method in \*\*Track\*\* is free/i);
assert.match(article, /association insight and \*\*Care → Sleep Consultant\*\* plan are Premium features/i);
assert.match(article, /through the first two corrected-age months/i);

assert.match(article, /See which wakes really need you/);
assert.match(article, /utm_source=dummy_falls_out_article/);
assert.match(article, /utm_medium=owned_search/);
assert.match(article, /utm_campaign=from_bump_to_baby_auto/);
assert.match(article, /utm_content=auto_20260923_dummy_falls_out/);

console.log('Dummy-falls-out article truth and attribution audit passed.');
