const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'start', 'index.html'), 'utf8');
const privacy = fs.readFileSync(path.join(root, 'privacy.html'), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .filter((script) => script.trim());

if (scripts.length !== 2) throw new Error(`Expected two inline store-router scripts; found ${scripts.length}`);
scripts.forEach((script, index) => new vm.Script(script, { filename: `store-router-inline-${index}.js` }));

function runRouter({ userAgent, search }) {
  const listeners = {};
  const elements = {
    android: {
      href: 'https://play.google.com/store/apps/details?id=com.obubba.app',
      addEventListener(type, fn) { listeners[`android:${type}`] = fn; },
    },
    ios: {
      href: 'https://apps.apple.com/app/obubba-baby-sleep-tracker/id6760968757',
      addEventListener(type, fn) { listeners[`ios:${type}`] = fn; },
    },
  };
  let replaced = '';
  const context = {
    URL,
    URLSearchParams,
    Set,
    Date,
    document: { getElementById: (id) => elements[id] },
    navigator: { userAgent },
    location: {
      origin: 'https://obubba.com',
      pathname: '/start/',
      search,
      replace(url) { replaced = url; },
    },
    setTimeout(fn) { fn(); return 1; },
  };
  context.window = context;
  vm.createContext(context);
  scripts.forEach((script) => vm.runInContext(script, context));
  return { context, elements, listeners, replaced };
}

const safeSearch = '?utm_source=owned_search&utm_medium=website&utm_campaign=from_bump_to_baby_auto&utm_content=auto_router_test&baby_name=private';
for (const test of [
  { name: 'Android', userAgent: 'Mozilla/5.0 Android', destination: 'play.google.com' },
  { name: 'iOS', userAgent: 'Mozilla/5.0 iPhone', destination: 'apps.apple.com' },
  { name: 'desktop', userAgent: 'Mozilla/5.0 Macintosh', destination: '' },
]) {
  const result = runRouter({ userAgent: test.userAgent, search: safeSearch });
  const consent = result.context.dataLayer.find((row) => row[0] === 'consent');
  if (!consent || consent[2].analytics_storage !== 'denied' || consent[2].ad_storage !== 'denied') {
    throw new Error(`${test.name}: denied analytics/ad storage is missing`);
  }
  const routeEvent = result.context.dataLayer.find((row) => row[0] === 'event' && row[1].startsWith('store_route'));
  if (!routeEvent || routeEvent[2].page_location.includes('baby_name')) {
    throw new Error(`${test.name}: route event missing or contains an unapproved value`);
  }
  if (!result.elements.android.href.includes('referrer=') || result.elements.android.href.includes('baby_name')) {
    throw new Error(`${test.name}: Google Play attribution is missing or unsafe`);
  }
  if (test.destination && !result.replaced.includes(test.destination)) throw new Error(`${test.name}: automatic route failed`);
  if (!test.destination && result.replaced) throw new Error(`${test.name}: desktop route should remain on the choice page`);
}

const unsafe = runRouter({
  userAgent: 'Mozilla/5.0 Android',
  search: '?utm_source=private-name&utm_medium=private-email&utm_campaign=private&utm_content=parent@example.com',
});
if (unsafe.elements.android.href.includes('referrer=')) throw new Error('Unapproved values leaked into the Play referrer');
const unsafeEvent = unsafe.context.dataLayer.find((row) => row[0] === 'event' && row[1] === 'store_route');
if (!unsafeEvent || unsafeEvent[2].ob_source !== 'direct' || unsafeEvent[2].ob_content !== 'none' || unsafeEvent[2].page_location.includes('private')) {
  throw new Error('Unapproved values leaked into analytics');
}

for (const disclosure of [
  'analytics_storage: \'denied\'',
  'ad_storage: \'denied\'',
  'No baby or care information is included',
]) {
  if (!html.includes(disclosure)) throw new Error(`Store router disclosure/config missing: ${disclosure}`);
}
for (const disclosure of ['cookieless', 'baby, care, contact or account data', 'Google Analytics']) {
  if (!privacy.includes(disclosure)) throw new Error(`Privacy disclosure missing: ${disclosure}`);
}

console.log('Store router audit passed: safe campaign labels, cookieless measurement, mobile routing and privacy disclosure are present.');
