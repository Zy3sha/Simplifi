const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'app.html'), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .filter((script) => script.trim());
if (scripts.length !== 2) throw new Error(`Expected JSON-LD plus one executable script; found ${scripts.length}`);
const router = scripts[1];
new vm.Script(router, {filename: 'app-download-router.js'});

function route(search, userAgent = 'Mozilla/5.0 Android') {
  const listeners = {};
  const download = {
    href: '',
    addEventListener(type, callback) { listeners[type] = callback; },
  };
  const context = {
    URL,
    URLSearchParams,
    Set,
    window: null,
    location: {search},
    navigator: {userAgent, platform: 'Linux armv8l'},
    document: {getElementById: (id) => id === 'download-now' ? download : null},
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(router, context);
  return download.href;
}

const attributed = route('?utm_source=bedtime_story_article&utm_medium=owned_search&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20260906_bedtime_story&baby_name=private');
const parsed = new URL(attributed);
if (parsed.hostname !== 'play.google.com') throw new Error('Android was not routed to Google Play');
const referrer = new URLSearchParams(parsed.searchParams.get('referrer') || '');
const expected = {
  utm_source: 'owned_search',
  utm_medium: 'owned_search',
  utm_campaign: 'from_bump_to_baby_auto',
  utm_content: 'auto_20260906_bedtime_story',
};
for (const [key, value] of Object.entries(expected)) {
  if (referrer.get(key) !== value) throw new Error(`${key} was not preserved safely`);
}
if (attributed.includes('baby_name') || attributed.includes('private')) throw new Error('Unapproved query data leaked to Google Play');

const unsafe = route('?utm_source=parent@example.com&utm_medium=private&utm_campaign=other&utm_content=parent@example.com');
if (new URL(unsafe).searchParams.has('referrer')) throw new Error('Unapproved campaign values reached Google Play');

const ios = route('?utm_source=instagram&utm_medium=organic_social&utm_campaign=from_bump_to_baby_auto&utm_content=auto_ios_test', 'Mozilla/5.0 iPhone');
if (new URL(ios).hostname !== 'apps.apple.com' || ios.includes('referrer=')) throw new Error('iOS route changed unexpectedly');

console.log('App download attribution audit passed: approved Android campaign labels survive the Play handoff and private query data is excluded.');
