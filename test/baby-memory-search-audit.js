const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(ROOT, 'baby-memory-book.html'), 'utf8');

const requireOnce = (label, value) => {
  const count = page.split(value).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one occurrence, found ${count}`);
};

requireOnce('title', '<title>Baby Memory App for Real Milestones &amp; Growth | OBubba</title>');
requireOnce('canonical', '<link rel="canonical" href="https://obubba.com/baby-memory-book.html"/>');

for (const value of [
  'A baby memory app written from the moments you really logged.',
  'achieved milestones, the first recorded tooth, growth checks and the dates when letters were sealed for later',
  'One dated moment is enough to start',
  'does not claim photo or caption storage',
  'Sealed letter text is not exposed early',
  'Start a real memory book on iPhone',
  'Start a real memory book on Android',
  'auto_20260824_baby_memory_app_search_refresh',
]) {
  if (!page.includes(value)) throw new Error(`Missing answer, boundary or CTA: ${value}`);
}

if (/save (?:baby )?memories, photos|save photos and captions|store photos and captions|automatically captures/i.test(page)) {
  throw new Error('The page claims unsupported photo, caption or automatic capture behaviour');
}

console.log('Baby-memory search audit passed: intent, current product truth, privacy boundary and CTAs are present.');
