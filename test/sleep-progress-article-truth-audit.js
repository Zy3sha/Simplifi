import assert from 'node:assert/strict';
import fs from 'node:fs';

const articlePath = 'content/blog/is-baby-sleep-improving-compare-weeks-not-nights.md';
const article = fs.readFileSync(articlePath, 'utf8');
const digest = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/weekly_digest.dart', 'utf8');
const metrics = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/day_metrics.dart', 'utf8');
const parentRoom = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/parent_room_screen.dart', 'utf8');

assert.match(article, /date: 2026-11-11/);
assert.match(article, /utm_campaign=auto_20261111_sleep_progress/);
assert.doesNotMatch(article, /—/);
assert.match(article, /at least two logged days/);
assert.match(digest, /thisW\.daysWithData < 2/);
assert.match(digest, /priorW\.nightDays >= 2 && thisW\.nightDays >= 2/);
assert.match(digest, /priorW\.napDays >= 2 && thisW\.napDays >= 2/);
assert.match(digest, /thisW\.totalSleepDays >= 5 && priorW\.totalSleepDays >= 5/);
assert.match(digest, /wakeDelta >= 0\.5/);
assert.match(digest, /daySleepDelta >= 20/);
assert.match(digest, /totalDelta >= 30/);
assert.match(digest, /napDelta <= -0\.5/);
assert.match(metrics, /MERGE overlapping\/nested arcs before summing/);
assert.match(parentRoom, /Your wins this week/);
assert.ok(fs.existsSync('obubba-baby-sleep-improving-weekly-review.jpg'));
assert.ok(fs.existsSync('obubba-reports-clinic-prep-app.jpg'));

console.log('Sleep-progress article truth audit passed.');
