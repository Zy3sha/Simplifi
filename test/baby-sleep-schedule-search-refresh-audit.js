const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync('content/blog/baby-sleep-schedule-guide.md', 'utf8');
const html = fs.readFileSync('blog/baby-sleep-schedule-guide.html', 'utf8');

assert.match(source, /^title: "Baby Sleep Schedule by Age: A Gentle Guide"$/m);
assert.match(source, /^updated: 2026-08-24$/m);
assert.match(source, /A baby sleep schedule is best treated as a flexible pattern, not a timetable/);
assert.match(source, /These are broad planning ranges from AASM guidance, not targets to force/);

assert.match(html, /<title>Baby Sleep Schedule by Age: A Gentle Guide \| OBubba<\/title>/);
assert.match(html, /<h1>Baby Sleep Schedule by Age: A Gentle Guide<\/h1>/);
assert.match(html, /<h3>Baby sleep schedule at a glance<\/h3>/);
assert.match(html, /Baby sleep schedule guidance by age, with sleep-duration ranges/);
assert.doesNotMatch(html, /guaranteed|cure|diagnos|sleep through the night/iu);

console.log('Baby sleep schedule search refresh audit passed.');
