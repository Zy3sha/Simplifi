#!/usr/bin/env node

const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('baby-care-handover-app.html', 'utf8').replaceAll('&amp;', '&');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
const attributionScript = scripts.find((script) => script.includes("gtag('event', 'store_click'"));
const failures = [];

function assert(label, condition) {
  if (!condition) failures.push(label);
  else console.log(`PASS: ${label}`);
}

assert('the handover landing has click measurement', Boolean(attributionScript));
assert('the handover landing preserves only a complete approved campaign tuple',
  attributionScript?.includes("campaign === 'from_bump_to_baby_auto'")
  && attributionScript?.includes('/^auto_[A-Za-z0-9_-]{1,100}$/')
  && attributionScript?.includes("'first_night_away_article'"));
assert('the handover landing has a stable fallback content ID',
  attributionScript?.includes("content: \"auto_20260816_owned_baby-care-handover-app\""));
assert('the measurement contains no care or family fields',
  !/baby_name|child_name|token|backupCode|carerNotes|emergencyContacts/.test(attributionScript || ''));

if (attributionScript) {
  const events = [];
  const links = [
    { hostname: 'apps.apple.com', listeners: {}, addEventListener(type, handler) { this.listeners[type] = handler; } },
    { hostname: 'play.google.com', listeners: {}, addEventListener(type, handler) { this.listeners[type] = handler; } },
  ];
  const context = {
    URLSearchParams,
    Set,
    location: {
      origin: 'https://obubba.com',
      pathname: '/baby-care-handover-app.html',
      search: '?utm_source=first_night_away_article&utm_medium=owned_search&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20261219_first_night_away',
    },
    document: { querySelectorAll: () => links },
    gtag: (...args) => events.push(args),
  };
  vm.runInNewContext(attributionScript, context);
  links[0].listeners.click();
  links[1].listeners.click();
  for (const [index, store] of ['app_store', 'google_play'].entries()) {
    const params = events[index]?.[2] || {};
    assert(`${store} click keeps the originating content ID`,
      params.store === store
      && params.ob_source === 'first_night_away_article'
      && params.ob_medium === 'owned_search'
      && params.ob_campaign === 'from_bump_to_baby_auto'
      && params.ob_content === 'auto_20261219_first_night_away');
  }
}

if (failures.length) {
  console.error(`Handover origin attribution audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Handover origin attribution audit passed: iPhone and Android clicks retain an approved originating content ID without care data.');
