// Autonomous competitor watch. Fetches rival store + web pages, asks Anthropic to
// spot what is driving their downloads/reviews and produce a ranked, copyable
// action list for OBubba, then appends a dated section to marketing/competitor-watch.md.
// Writes ONLY to that report file (zero site risk). The workflow commits it.
import fs from 'fs';
import path from 'path';
import { anthropic, fetchText } from './anthropic.mjs';

const ROOT = process.cwd();
const today = new Date().toISOString().slice(0, 10);

// iTunes lookup returns rating counts/averages as JSON (no key needed).
const SOURCES = [
  ['OBubba iOS', 'https://itunes.apple.com/lookup?id=6760968757'],
  ['nappi iOS', 'https://itunes.apple.com/lookup?id=6758960996'],
  ['NapNap iOS', 'https://itunes.apple.com/lookup?id=6759227457'],
  ['nappi web', 'https://nappi.app/'],
  ['NapNap web', 'https://napnap.baby/'],
  ['nappi comparison blog', 'https://nappi.app/blog/best-baby-tracker-apps'],
];

const chunks = [];
for (const [label, url] of SOURCES) {
  try {
    const text = (await fetchText(url)).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 6000);
    chunks.push(`### ${label} (${url})\n${text}`);
  } catch (e) { chunks.push(`### ${label} (${url})\n[fetch failed: ${e.message}]`); }
}

const system = `You are a growth analyst for OBubba, a baby SLEEP app being out-downloaded on Android by nappi and NapNap. The rivals win on organic Play-listing localization + an SEO comparison/guide farm, not paid ads. Be concrete, never fabricate numbers (say "unconfirmed"), and prioritise Android-acquisition tactics OBubba can copy.`;

const prompt = `Below is today's raw fetch of OBubba's and rivals' store/web pages. Compare against what a growth team already knows (rivals localise the Play listing into 15-22 languages and run comparison + wake-window guide content) and report:
1. Any CHANGE or signal worth noting (new rating counts, new pages, new keywords/features, pricing).
2. A RANKED list of 3-6 copyable actions for OBubba, most impactful first, each with a one-line "how".
Keep it tight (~300-400 words), markdown, no preamble.

${chunks.join('\n\n')}`;

const report = await anthropic({ system, prompt, maxTokens: 1500 });
const file = path.join(ROOT, 'marketing', 'competitor-watch.md');
const header = fs.existsSync(file) ? '' : '# OBubba Competitor Watch (autonomous)\n\n';
fs.appendFileSync(file, `${header}\n---\n\n## ${today}\n\n${report}\n`);
console.log(`Appended competitor watch for ${today} to marketing/competitor-watch.md`);
