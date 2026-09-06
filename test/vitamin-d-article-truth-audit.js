import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const siteRoot = path.resolve(import.meta.dirname, '..');
const appRoot = '/Users/zyesha/development/obubba_flutter_main';
const article = fs.readFileSync(
  path.join(siteRoot, 'content/blog/does-my-baby-need-vitamin-d-drops-uk.md'),
  'utf8',
);
const brain = fs.readFileSync(path.join(appRoot, 'lib/core/engine/brain.dart'), 'utf8');
const health = fs.readFileSync(path.join(appRoot, 'lib/core/engine/health_insights.dart'), 'utf8');
const newborn = fs.readFileSync(path.join(appRoot, 'lib/features/grow/newborn_screen.dart'), 'utf8');
const renderer = fs.readFileSync(path.join(siteRoot, 'tools/render-seo.mjs'), 'utf8');

assert.match(brain, /vitaminDReminder\(ageWeeks: chronoAgeWeeksSafe/);
assert.match(brain, /e\.feedType == 'breast' \|\| e\.feedType == 'both'/);
assert.match(health, /ageWeeks < 1 \|\| ageWeeks > 52/);
assert.match(health, /if \(!breastfeeds\) return null/);
assert.match(health, /8\.5–10µg/);
assert.match(health, /500ml\+/);
assert.match(newborn, /Vitamin D drops\?/);

assert.match(article, /does not add up formula volume/);
assert.match(article, /does not choose a brand, prescribe a dose, diagnose a deficiency/);
assert.match(article, /product label/);
assert.match(article, /neonatal team, health visitor, pharmacist or GP/);
assert.match(article, /utm_content=auto_20261106_vitamin_d/);
assert.doesNotMatch(article, /—/);

for (const asset of ['obubba-baby-vitamin-d-drops.jpg', 'obubba-newborn-reassurance-app.jpg']) {
  assert.equal(fs.existsSync(path.join(siteRoot, asset)), true, `${asset} must exist at the site root`);
  assert.match(renderer, new RegExp(`'${asset.replaceAll('.', '\\.')}'`));
}

console.log('Vitamin D article truth audit passed.');
