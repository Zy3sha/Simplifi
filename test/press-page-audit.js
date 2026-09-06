#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const press = fs.readFileSync(path.join(root, 'press.html'), 'utf8');
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const llms = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');
const imageSitemap = fs.readFileSync(path.join(root, 'image-sitemap.xml'), 'utf8');
const structuredDataBlocks = [...press.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map((match) => JSON.parse(match[1]));
const pressGraph = structuredDataBlocks.flatMap((block) => block['@graph'] || [block]);
const founderEntity = pressGraph.find((entity) => entity['@id'] === 'https://obubba.com/press.html#zyesha-reynolds');
const contributionEntity = pressGraph.find((entity) => entity['@id'] === 'https://newbornstages.com/when-someone-takes-over-the-baby-they-should-take-over-the-thinking-too/#article');

const checks = [
  ['canonical press URL', press.includes('<link rel="canonical" href="https://obubba.com/press.html"/>')],
  ['single h1', (press.match(/<h1\b/g) || []).length === 1],
  ['founder identity', press.includes('Zyesha Reynolds')],
  ['non-medical boundary', press.includes('not a diagnostic or medical tool')],
  ['no endorsement boundary', press.includes('do not imply a partnership, clinical endorsement or outcome guarantee')],
  ['Apple listing', press.includes('id6760968757')],
  ['Google Play package', press.includes('id=com.obubba.app')],
  ['campaign attribution', press.includes('utm_campaign%3Dfrom_bump_to_baby_auto')],
  ['existing GA4 property', press.includes('gtag/js?id=G-Y7CHSL1YHZ') && press.includes('gtag("config", "G-Y7CHSL1YHZ")')],
  ['fixed press action event', press.includes('gtag("event", "press_action"')],
  ['media enquiry measurement', press.includes('data-press-action="media_enquiry"')],
  ['iOS store-exit measurement', press.includes('data-press-action="store_exit_ios"')],
  ['Android store-exit measurement', press.includes('data-press-action="store_exit_android"')],
  ['walkthrough measurement', press.includes('data-press-action="professional_walkthrough"')],
  ['published founder contribution', press.includes('When Someone Takes Over the Baby, They Should Take Over the Thinking Too') && press.includes('newbornstages.com/when-someone-takes-over-the-baby-they-should-take-over-the-thinking-too/')],
  ['contribution is not framed as endorsement', press.includes('a founder contribution, not an endorsement of OBubba by the publication')],
  ['founder contribution measurement', press.includes('data-press-action="founder_contribution_newborn_stages"')],
  ['safe external contribution link', press.includes('target="_blank" rel="noopener" data-press-action="founder_contribution_newborn_stages"')],
  ['stable founder entity', founderEntity?.['@type'] === 'Person' && founderEntity?.name === 'Zyesha Reynolds' && founderEntity?.worksFor?.['@id'] === 'https://obubba.com/#organization'],
  ['founder entity portrait', founderEntity?.image === 'https://obubba.com/obubba-founder-zyesha-reynolds.jpg'],
  ['verified contribution entity', contributionEntity?.['@type'] === 'Article' && contributionEntity?.author?.['@id'] === 'https://obubba.com/press.html#zyesha-reynolds' && contributionEntity?.datePublished === '2026-08-28'],
  ['five asset measurements', ['icon', 'feeding', 'care', 'grow', 'founder'].every((asset) => press.includes(`data-press-action="asset_download_${asset}"`))],
  ['no dynamic URL analytics payload', !/link_url\s*:|location\.(href|search)|URLSearchParams/.test(press)],
  ['press contact', press.includes('hello@obubba.com')],
  ['downloadable icon', press.includes('obubba-baby-tracker-app-icon-crowned-baby.png" download')],
  ['downloadable feeding screen', press.includes('obubba-screen-feeding.jpg" download')],
  ['downloadable care screen', press.includes('obubba-screen-care.jpg" download')],
  ['downloadable grow screen', press.includes('obubba-screen-grow.jpg" download')],
  ['downloadable founder portrait', press.includes('obubba-founder-zyesha-reynolds.jpg" download')],
  ['founder portrait exists', fs.existsSync(path.join(root, 'obubba-founder-zyesha-reynolds.jpg'))],
  ['homepage founder portrait', home.includes('<img src="/obubba-founder-zyesha-reynolds.jpg"') && home.includes('alt="Zyesha Reynolds, founder of OBubba"')],
  ['founder portrait image discovery', imageSitemap.includes('<loc>https://obubba.com/press.html</loc>') && imageSitemap.includes('<image:loc>https://obubba.com/obubba-founder-zyesha-reynolds.jpg</image:loc>')],
  ['homepage discovery link', home.includes('<a href="/press.html">Press &amp; media</a>')],
  ['sitemap discovery', sitemap.includes('<loc>https://obubba.com/press.html</loc>')],
  ['AI-readable discovery', llms.includes('[press and media resources](https://obubba.com/press.html)')],
];

const failures = checks.filter(([, passed]) => !passed);
if (failures.length) {
  failures.forEach(([label]) => console.error(`FAIL: ${label}`));
  process.exit(1);
}

checks.forEach(([label]) => console.log(`PASS: ${label}`));
