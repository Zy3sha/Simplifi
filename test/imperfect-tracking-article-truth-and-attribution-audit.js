#!/usr/bin/env node

const fs = require('node:fs');

const article = fs.readFileSync('content/blog/keep-forgetting-log-baby-sleep-feeds.md', 'utf8');
const voiceSheet = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/track/widgets/voice_log_sheet.dart', 'utf8');
const voiceTests = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/test/voice_log_parser_test.dart', 'utf8');
const dayMetrics = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/day_metrics.dart', 'utf8');
const nightWeaning = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/night_weaning.dart', 'utf8');
const catchUpTests = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/test/catch_up_bucketing_test.dart', 'utf8');

function assert(label, condition) {
  if (!condition) throw new Error(`FAIL: ${label}`);
  console.log(`PASS: ${label}`);
}

assert('article has no paused status', !/^status: paused$/m.test(article));
assert('article contains no em or en dash', !/[—–]/.test(article));
assert('article carries exact acquisition attribution', article.includes('utm_content=auto_20261130_imperfect_tracking'));
assert('article preserves the clinical boundary', article.includes('a partial log must never be treated as clinical reassurance'));
assert('article names feature-specific evidence gates', article.includes('feature-specific evidence gates'));
assert('article uses the versioned hero image', article.includes('heroImage: /obubba-imperfect-baby-tracking-20261130.jpg'));
assert('article uses the versioned Quick Log image', article.includes('/obubba-quick-voice-log-app-20261130.jpg'));
assert('versioned hero image exists', fs.existsSync('obubba-imperfect-baby-tracking-20261130.jpg'));
assert('versioned Quick Log image exists', fs.existsSync('obubba-quick-voice-log-app-20261130.jpg'));

assert('Quick Log supports typed or spoken input', voiceSheet.includes('Type or tap to talk in plain English, OBubba sorts it into entries.'));
assert('Quick Log shows parsed entries before save', voiceSheet.includes('OBUBBA HEARD') && voiceSheet.includes("Log ${_loggable.length} entries"));
assert('parser test covers a multi-event sentence', voiceTests.includes("fed 100ml at 8am and then dirty nappy at 9am and then napped 10am to 11am"));
assert('weekly metrics exclude empty days from averages', dayMetrics.includes("over days that actually have data, so empty days don't drag results down"));
assert('night-feed comparison requires at least two nights', nightWeaning.includes('bool get hasData => nights >= 2'));
assert('catch-up tests cover a 2am event rolling to the following date', catchUpTests.includes("dayKeyForCatchUpEntry('2026-06-15', wake('02:00')), '2026-06-16'"));

console.log('Imperfect-tracking article truth and attribution audit passed.');
