// Autonomous ratings/traction monitor. NO API key needed. Pulls iOS rating counts +
// averages for OBubba and rivals from the public iTunes lookup API and appends a row
// to marketing/ratings-monitor.csv, so you can see who is gaining reviews over time.
import fs from 'fs';
import path from 'path';
import { fetchText } from './anthropic.mjs';

const ROOT = process.cwd();
const today = new Date().toISOString().slice(0, 10);

const APPS = [
  ['obubba', 6760968757],
  ['nappi', 6758960996],
  ['napnap', 6759227457],
];

const cells = [today];
const cols = ['date'];
for (const [name, id] of APPS) {
  cols.push(`${name}_ratings`, `${name}_stars`);
  try {
    const j = JSON.parse(await fetchText(`https://itunes.apple.com/lookup?id=${id}`));
    const r = (j.results && j.results[0]) || {};
    cells.push(r.userRatingCount ?? '', r.averageUserRating ?? '');
  } catch (e) { cells.push('', ''); }
}

const file = path.join(ROOT, 'marketing', 'ratings-monitor.csv');
if (!fs.existsSync(file)) fs.writeFileSync(file, cols.join(',') + '\n');
fs.appendFileSync(file, cells.join(',') + '\n');
console.log('ratings-monitor row:', cells.join(', '));
