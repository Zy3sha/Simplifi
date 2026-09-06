const fs = require('node:fs');

const article = fs.readFileSync('content/blog/first-night-away-baby-babysitter-handover.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const careScreen = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/care_screen.dart', 'utf8');
const carerRepository = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/repositories/carer_repository.dart', 'utf8');
const bubbaCareScreen = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/bubba_care_start_screen.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('Bubba Care opens without the Premium gate',
  careScreen.includes("if (title == 'Bubba Care')")
  && careScreen.includes('const BubbaCareScreen()'));
assert('the parent creates a private portal token and URL',
  carerRepository.includes("static const _portalBase = 'https://obubba-d9ccc.web.app/care.html'")
  && carerRepository.includes("final token = _randToken();")
  && carerRepository.includes("url: careUrl(token, childId: childCode)"));
assert('ending a session preserves entries then closes access',
  carerRepository.includes('finalizeOpenNap: true')
  && carerRepository.includes("'ended': true")
  && carerRepository.includes('await _revokeToken(currentToken);'));
assert('the shipped interface promises save, clear and fresh-link behaviour',
  bubbaCareScreen.includes("logs into your app, then clears their page.")
  && bubbaCareScreen.includes('hands you a brand-new link'));
assert('the article cites current sitter and safer-sleep sources',
  article.includes('https://www.nspcc.org.uk/advice-for-families/home-alone/')
  && article.includes('Safer-Sleep-Awareness-A-Guide-For-Childminders-Foster-Carers-Nannies-and-Nursery-Settings.pdf'));
assert('the product section uses only the temporary carer route',
  article.includes('How OBubba gives a babysitter right-sized access')
  && article.includes('They do not need to install OBubba or create their own login.')
  && !article.includes('Carer Handoff briefing')
  && !article.includes('developmental phase'));
assert('the CTA has fixed privacy-safe attribution',
  article.includes('/baby-care-handover-app.html?utm_source=first_night_away_article&utm_medium=owned_search&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20261219_first_night_away'));
assert('the article contains no em or en dash', !/[—–]/.test(article));

for (const asset of [
  'obubba-first-night-away-babysitter-v20260906.jpg',
  'obubba-no-download-carer-flow-v20260906.svg',
]) {
  assert(`${asset} exists at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
