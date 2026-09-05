import assert from 'node:assert/strict';
import fs from 'node:fs';

const article = fs.readFileSync('content/blog/baby-only-naps-30-minutes-short-naps.md', 'utf8');

assert.match(article, /under about five months, short and irregular naps are often part of normal sleep development/i);
assert.match(article, /at least three qualifying days among the last seven days examined/i);
assert.match(article, /at least two completed naps must have been logged and every one must have been under 45 minutes/i);
assert.match(article, /under about 22 weeks/i);
assert.match(article, /Nap logging[\s\S]*remains available without Premium/i);
assert.match(article, /Personalised countdowns, deeper sleep insights and tomorrow planning are Premium features/i);
assert.match(article, /first two corrected-age months/i);
assert.match(article, /utm_source=short_naps_article/);
assert.match(article, /utm_medium=owned_search/);
assert.match(article, /utm_campaign=from_bump_to_baby_auto/);
assert.match(article, /utm_content=auto_20260919_short_naps/);
assert.doesNotMatch(article, /fix(?:es|ed)? (?:your )?(?:baby'?s )?sleep/i);
assert.match(article, /cannot guarantee a longer nap/i);

console.log('Short naps article truth audit passed');
