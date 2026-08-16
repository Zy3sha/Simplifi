const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(ROOT, 'blog/what-to-track-newborn-without-overtracking.html'), 'utf8');
const generator = fs.readFileSync(path.join(ROOT, 'tools/render-seo.mjs'), 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS ${label}`);
}

const actions = ['log_feed', 'log_sleep', 'log_nappy'];
for (const action of actions) {
  const uri = `obubba://?action=${action}`;
  assert(`built page exposes allow-listed ${action} action`, page.includes(`href="${uri}"`));
  assert(`generator preserves allow-listed ${action} action`, generator.includes(`href="${uri}"`));
}

const deepLinks = [...page.matchAll(/href="(obubba:\/\/[^\"]*)"/g)].map((match) => match[1]);
assert('exactly three returning-family deep links are rendered', deepLinks.length === 3);
assert('deep links contain only the allow-listed action parameter', deepLinks.every((link) => /^obubba:\/\/\?action=(log_feed|log_sleep|log_nappy)$/.test(link)));
assert('no care detail or identifier is placed in a deep link', deepLinks.every((link) => !/(baby|child|name|email|code|token|date|feed_time|sleep_time|nappy_time)=/i.test(link)));
assert('privacy boundary is visible beside the actions', page.includes('No baby or care details are placed in the link.'));
assert('country-neutral App Store route remains present', page.includes('https://apps.apple.com/app/obubba-baby-sleep-tracker/id6760968757'));
assert('attributed Google Play acquisition route remains present', page.includes('utm_content%3Dauto_20260815_minimum_useful_log_builder'));

if (process.exitCode) process.exit(process.exitCode);
console.log(`Returning-family deep-link audit passed (${deepLinks.length} actions).`);
