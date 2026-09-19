// FREE competitor change DETECTOR (no API key, no LLM, no cost). Fetches rivals'
// store + web pages daily, snapshots them, and flags what changed vs the last run.
// It does not "analyse" with judgment (that is the paid agent / a human) - it tells
// you WHAT moved so nothing slips by. Writes snapshots + marketing/competitor-changes.md.
import fs from 'fs';
import path from 'path';
import { fetchText } from './anthropic.mjs';

const ROOT = process.cwd();
const today = new Date().toISOString().slice(0, 10);
const SNAP = path.join(ROOT, 'marketing', 'competitor-snapshots');
fs.mkdirSync(SNAP, { recursive: true });

const SOURCES = [
  ['nappi-itunes', 'https://itunes.apple.com/lookup?id=6758960996'],
  ['napnap-itunes', 'https://itunes.apple.com/lookup?id=6759227457'],
  ['nappi-web', 'https://nappi.app/'],
  ['napnap-web', 'https://napnap.baby/'],
  ['nappi-compare', 'https://nappi.app/blog/best-baby-tracker-apps'],
];

function normalise(raw, url) {
  if (url.includes('itunes.apple.com')) {
    try {
      const r = (JSON.parse(raw).results || [])[0] || {};
      // Keep only the fields worth watching (version, price, desc, languages, ratings).
      return JSON.stringify({
        version: r.version, price: r.formattedPrice, genres: r.genres,
        languages: r.languageCodesISO2A, ratings: r.userRatingCount,
        stars: r.averageUserRating, releaseNotes: r.releaseNotes, description: r.description,
      }, null, 1);
    } catch { return raw.slice(0, 4000); }
  }
  return raw.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000);
}

const changes = [];
for (const [name, url] of SOURCES) {
  let cur;
  try { cur = normalise(await fetchText(url), url); }
  catch (e) { changes.push(`- **${name}**: fetch failed (${e.message})`); continue; }
  const file = path.join(SNAP, `${name}.txt`);
  const prev = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (prev && prev !== cur) {
    const prevLines = new Set(prev.split('\n'));
    const added = cur.split('\n').filter((l) => l.trim() && !prevLines.has(l)).slice(0, 8);
    changes.push(`- **${name} CHANGED** (${url})` + (added.length ? `\n  new/changed:\n${added.map((l) => `    - ${l.trim().slice(0, 200)}`).join('\n')}` : ''));
  } else if (!prev) {
    changes.push(`- **${name}**: baseline captured`);
  }
  fs.writeFileSync(file, cur);
}

if (changes.some((c) => c.includes('CHANGED'))) {
  const file = path.join(ROOT, 'marketing', 'competitor-changes.md');
  const header = fs.existsSync(file) ? '' : '# OBubba Competitor Change Log (free detector)\n\n';
  fs.appendFileSync(file, `${header}## ${today}\n${changes.join('\n')}\n\n`);
  console.log(`Changes detected on ${today}; logged to marketing/competitor-changes.md`);
} else {
  console.log(`No competitor changes detected on ${today} (snapshots refreshed).`);
}
