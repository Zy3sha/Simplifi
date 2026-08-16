#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const PAGE = path.join(ROOT, 'blog', 'baby-care-handover-template-grandparents-nursery.html');
const html = fs.readFileSync(PAGE, 'utf8').replaceAll('&amp;', '&');
const start = html.indexOf('<section class="handover-tool"');
const end = html.indexOf('</script>', start);
const section = start >= 0 && end > start ? html.slice(start, end + 9) : '';
const expectedShareUrl = 'https://obubba.com/blog/baby-care-handover-template-grandparents-nursery.html?utm_source=handover_share&utm_medium=copy_share&utm_campaign=from_bump_to_baby_auto&utm_content=five_line_handover_builder#five-line-handover';
const failures = [];

const requireText = (pattern, message) => {
  if (!pattern.test(section)) failures.push(message);
};

if (!section) failures.push('handover tool section is missing');
if (!section.includes(expectedShareUrl)) failures.push('exact attributed share URL is missing');
requireText(/id="five-line-handover"/, 'shareable anchor is missing');
requireText(/id="copy-handover-link"/, 'copy-builder-link action is missing');
requireText(/navigator\.clipboard\.writeText\(field\.value\)/, 'private handover copy action is missing');
requireText(/navigator\.clipboard\.writeText\(shareUrl\)/, 'builder-link copy action is missing');
requireText(/navigator\.share\([\s\S]*url: shareUrl/, 'share sheet does not use the attributed builder URL');
requireText(/incoming\.get\('utm_source'\) === 'handover_share'/, 'incoming share source gate is missing');
requireText(/incoming\.get\('utm_campaign'\) === 'from_bump_to_baby_auto'/, 'incoming campaign gate is missing');
requireText(/incoming\.get\('utm_content'\) === 'five_line_handover_builder'/, 'incoming share-content gate is missing');
requireText(/utm_content: 'five_line_handover_builder_landing'/, 'shared-visitor Play content key is missing');
requireText(/url\.searchParams\.set\('referrer', referrer\.toString\(\)\)/, 'shared-visitor Play referrer override is missing');
requireText(/does not collect or save what you type/, 'local-data boundary is missing');
requireText(/choosing Share passes the text to your device's share sheet/, 'share transmission boundary is missing');

for (const forbidden of ['localStorage', 'sessionStorage', 'fetch(', 'XMLHttpRequest', 'sendBeacon']) {
  if (section.includes(forbidden)) failures.push(`handover tool must not use ${forbidden}`);
}

if (!failures.length) {
  const scriptMatch = section.match(/<script>([\s\S]*?)<\/script>/);
  if (!scriptMatch) {
    failures.push('handover runtime script is missing');
  } else {
    const listeners = new Map();
    const copied = [];
    const shared = [];
    const makeButton = (id) => ({ id, addEventListener: (type, handler) => listeners.set(`${id}:${type}`, handler) });
    const field = { id: 'handover-template', value: 'Baby handover\nLast feed: 08:00', focus() {}, select() {} };
    const status = { id: 'handover-status', textContent: '' };
    const elements = {
      'handover-template': field,
      'handover-status': status,
      'copy-handover': makeButton('copy-handover'),
      'copy-handover-link': makeButton('copy-handover-link'),
      'share-handover': makeButton('share-handover'),
      'print-handover': makeButton('print-handover'),
    };
    const playAnchors = [
      { href: 'https://play.google.com/store/apps/details?id=com.obubba.app&referrer=old' },
      { href: 'https://play.google.com/store/apps/details?id=com.obubba.app&referrer=old' },
    ];
    const context = {
      URL,
      URLSearchParams,
      document: {
        getElementById: (id) => elements[id],
        querySelectorAll: (selector) => selector.includes('play.google.com') ? playAnchors : [],
      },
      navigator: {
        clipboard: { writeText: async (value) => { copied.push(value); } },
        share: async (payload) => { shared.push(payload); },
      },
      window: {
        location: { search: new URL(expectedShareUrl).search },
        print() {},
      },
    };
    vm.runInNewContext(scriptMatch[1], context);

    for (const anchor of playAnchors) {
      const url = new URL(anchor.href);
      const referrer = new URLSearchParams(url.searchParams.get('referrer'));
      const expected = {
        utm_source: 'handover_share',
        utm_medium: 'copy_share',
        utm_campaign: 'from_bump_to_baby_auto',
        utm_content: 'five_line_handover_builder_landing',
      };
      for (const [key, value] of Object.entries(expected)) {
        if (referrer.get(key) !== value) failures.push(`runtime Play referrer ${key} mismatch`);
      }
    }

    Promise.resolve()
      .then(() => listeners.get('copy-handover:click')())
      .then(() => listeners.get('copy-handover-link:click')())
      .then(() => listeners.get('share-handover:click')())
      .then(() => {
        if (copied[0] !== field.value) failures.push('runtime handover copy payload mismatch');
        if (copied[1] !== expectedShareUrl) failures.push('runtime builder-link copy payload mismatch');
        if (shared[0]?.url !== expectedShareUrl) failures.push('runtime share URL mismatch');
        if (shared[0]?.text !== field.value) failures.push('runtime share text mismatch');
        finish();
      })
      .catch((error) => {
        failures.push(`runtime simulation failed: ${error.message}`);
        finish();
      });
  }
}

function finish() {
  if (failures.length) {
    console.error(`Handover share-loop audit failed (${failures.length}):`);
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
    return;
  }

  console.log('Handover share-loop audit passed: attributed sharing, privacy boundary, and Android downstream attribution are present.');
}

if (failures.length || !section.match(/<script>([\s\S]*?)<\/script>/)) finish();
