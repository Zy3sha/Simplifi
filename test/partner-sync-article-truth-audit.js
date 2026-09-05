#!/usr/bin/env node

const fs = require('node:fs');

const source = fs.readFileSync(
  'content/blog/share-baby-tracker-with-partner-without-duplicate-logs.md',
  'utf8',
);

const expected = [
  'Account → Share with family',
  'Tap **Send invite**',
  'Connect — live sync',
  'Import a separate copy instead',
  'People with access',
  'Replace code & disconnect everyone',
  'family recovery code',
  'does not upgrade the carer\'s whole account',
  'their own unpaid babies remain on their existing plan',
  'utm_source=partner_sync_article',
  'utm_medium=owned_search',
  'utm_campaign=from_bump_to_baby_auto',
  'utm_content=auto_20260915_partner_sync',
];

for (const marker of expected) {
  if (!source.includes(marker)) {
    throw new Error(`Missing partner-sync truth marker: ${marker}`);
  }
}

if (source.includes('Account → Family sharing → Share with family')) {
  throw new Error('Stale setup path remains: Share with family is the Account hub action');
}

if (source.includes('upgrade the carer\'s whole account.')) {
  throw new Error('Shared-baby Premium must not be represented as account-wide Premium');
}

console.log('Partner-sync article truth audit passed: current setup path, live-versus-copy choice, access controls, recovery-code boundary, per-baby Premium boundary and acquisition attribution are present.');
