const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('baby-nappy-tracker.html', 'utf8');

assert.match(html, /<title>Baby Nappy Tracker App for Feeds &amp; Changes \| OBubba<\/title>/);
assert.match(html, /<h1>Track wet and dirty nappies beside feeds and sleep\.<\/h1>/);
assert.match(html, /What should a baby nappy tracker app record\?/);
assert.match(html, /A minimum useful nappy log/);
assert.match(html, /A nappy log is context, not a diagnosis/);
assert.match(html, /Partner Sync keeps invited parents on the live record/);
assert.match(html, /Track the next change/);
assert.doesNotMatch(html, /From search query to OBubba download/);
assert.doesNotMatch(html, /Should parents try OBubba\?/);
assert.doesNotMatch(html, /diagnoses|guarantees|prevents|treats/iu);

console.log('Baby nappy app search refresh audit passed.');
