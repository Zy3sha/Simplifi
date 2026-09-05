import assert from 'node:assert/strict';
import fs from 'node:fs';

const article = fs.readFileSync(
  new URL('../content/blog/move-baby-from-purees-to-lumpy-food.md', import.meta.url),
  'utf8',
);

assert.match(article, /at least five recent solids entries with recognisable texture wording/i);
assert.match(article, /at least 60% of those classified meals are still smooth purées/i);
assert.match(article, /at least three recent refused meals clustered within seven days/i);
assert.match(article, /latest no more than four days old/i);
assert.match(article, /two seven-day windows when each has enough classified meals/i);
assert.match(article, /cannot see the food, its softness, cut, temperature, bones or the baby's seating/i);

assert.match(article, /Food logging and the age-stage \*\*Care → Weaning Progress\*\* guide are available without Premium/i);
assert.match(article, /texture-pattern \*\*Guidance\*\* is a Premium feature/i);
assert.match(article, /through the first two corrected-age months/i);

assert.match(article, /Track the texture, not the clean bowl/);
assert.match(article, /utm_source=weaning_texture_article/);
assert.match(article, /utm_medium=owned_search/);
assert.match(article, /utm_campaign=from_bump_to_baby_auto/);
assert.match(article, /utm_content=auto_20260924_weaning_texture/);

console.log('Weaning-texture article truth and attribution audit passed.');
