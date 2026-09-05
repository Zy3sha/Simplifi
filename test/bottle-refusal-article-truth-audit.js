import assert from 'node:assert/strict';
import fs from 'node:fs';

const article = fs.readFileSync('content/blog/baby-refusing-bottle-gentle-plan.md', 'utf8');

assert.match(article, /It cannot guarantee acceptance by day four/i);
assert.match(article, /begin a week or two beforehand/i);
assert.match(article, /Track → Feed → Bottle/);
assert.match(article, /at least six waking hours have passed/i);
assert.match(article, /at least three measured bottle feeds across the prior week/i);
assert.match(article, /suppresses that bottle-only judgement when a breast or combined feed is logged that day/i);
assert.match(article, /Bottle, breast, pumping and nappy logs[\s\S]*remain available without Premium/i);
assert.match(article, /Bubba Coach and the personalised Guidance panel are Premium features/i);
assert.match(article, /first two corrected-age months/i);
assert.match(article, /Build a calmer feeding handover/);
assert.match(article, /utm_source=bottle_refusal_article/);
assert.match(article, /utm_medium=owned_search/);
assert.match(article, /utm_campaign=from_bump_to_baby_auto/);
assert.match(article, /utm_content=auto_20260921_bottle_refusal/);
assert.match(article, /cannot inspect oral function, diagnose pain/i);
assert.doesNotMatch(article, /guarantee(?:s|d)? bottle acceptance/i);

console.log('Bottle refusal article truth audit passed');
