import assert from 'node:assert/strict';
import fs from 'node:fs';

const article = fs.readFileSync('content/blog/baby-cries-every-evening-witching-hour.md', 'utf8');

assert.match(article, /Track → More logs → Crying/);
assert.match(article, /only considers crying entries and fussy nap wakes between 3pm and 7pm/i);
assert.match(article, /at least four days containing some logged data/i);
assert.match(article, /evening fuss on at least three days/i);
assert.match(article, /at least four qualifying events/i);
assert.match(article, /strict majority of the logged days/i);
assert.match(article, /After at least four soothing outcomes have been recorded/i);
assert.match(article, /Crying logs and the Crying Helper[\s\S]*remain available without Premium/i);
assert.match(article, /deeper Guidance panel[\s\S]*is a Premium feature/i);
assert.match(article, /first two corrected-age months/i);
assert.match(article, /Keep the evening pattern in one calm place/);
assert.match(article, /utm_source=evening_crying_article/);
assert.match(article, /utm_medium=owned_search/);
assert.match(article, /utm_campaign=from_bump_to_baby_auto/);
assert.match(article, /utm_content=auto_20260920_evening_crying/);
assert.match(article, /cannot hear the cry, examine your baby or diagnose colic/i);
assert.doesNotMatch(article, /guarantee(?:s|d)? (?:your )?baby/i);

console.log('Evening crying article truth audit passed');
