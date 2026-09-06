const fs = require('node:fs');

const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const paths = [...sitemap.matchAll(/<loc>https:\/\/obubba\.com([^<]*)<\/loc>/g)]
  .map((match) => match[1])
  .filter((urlPath) => urlPath === '/' || urlPath.endsWith('.html'));
const requiredConsent = [
  "ad_storage: 'denied'",
  "analytics_storage: 'denied'",
  "ad_user_data: 'denied'",
  "ad_personalization: 'denied'",
  "gtag('set', 'ads_data_redaction', true)",
  "allow_google_signals",
  "allow_ad_personalization_signals",
];

for (const urlPath of paths) {
  const file = urlPath === '/' ? 'index.html' : urlPath.slice(1);
  const html = fs.readFileSync(file, 'utf8');
  for (const marker of requiredConsent) {
    if (!html.includes(marker)) throw new Error(`${file} is missing ${marker}`);
  }
  const consentIndex = html.indexOf("gtag('consent', 'default'");
  const loaderIndex = html.indexOf('googletagmanager.com/gtag/js');
  if (consentIndex < 0 || loaderIndex < 0 || consentIndex > loaderIndex) {
    throw new Error(`${file} does not set denied consent before loading the Google tag`);
  }
  const loaderCount = (html.match(/googletagmanager\.com\/gtag\/js/g) || []).length;
  if (loaderCount !== 1) throw new Error(`${file} has ${loaderCount} Google tag loaders`);
  if (/send_page_view\s*:\s*false/.test(html)
      && !/gtag\s*\(\s*['"]event['"]\s*,\s*['"]page_view['"]/.test(html)) {
    throw new Error(`${file} disables automatic page views without sending a bounded manual page view`);
  }
  const hasStoreLink = html.includes('apps.apple.com') || html.includes('play.google.com');
  const hasStoreMeasurement = html.includes("gtag('event', 'store_click'")
    || html.includes('window.gtag("event", "press_action"');
  if (urlPath !== '/' && hasStoreLink && !hasStoreMeasurement) {
    throw new Error(`${file} does not measure its store-link intent`);
  }
}

console.log(`sitewide cookieless analytics audit passed for ${paths.length} pages`);
