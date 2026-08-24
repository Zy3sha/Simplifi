const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');

assert.match(html, /<aside class="sync-code-help" aria-label="Join an existing OBubba baby record">/);
assert.match(html, /Got an OBubba sync code\?/);
assert.match(html, /Import your data \/ Connect/);
assert.match(html, /Connect &mdash; live sync/);
assert.match(html, /Keep the code private\./);
assert.match(html, /href="\/partner-baby-tracker-app\.html">Show me how to connect both phones<\/a>/);
assert.strictEqual((html.match(/Got an OBubba sync code\?/g) || []).length, 1);
assert.doesNotMatch(html, /[A-Z0-9]{6,8}.*sync code/);

console.log('Homepage sync-code help audit passed.');
