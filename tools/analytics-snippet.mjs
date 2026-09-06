export const MEASUREMENT_ID = 'G-Y7CHSL1YHZ';

export function cookielessAnalytics({trackStoreLinks = true} = {}) {
  const storeTracking = trackStoreLinks ? `
    document.addEventListener('DOMContentLoaded', () => {
      document.addEventListener('click', (event) => {
        const anchor = event.target.closest('a[href]');
        if (!anchor) return;
        let target;
        try { target = new URL(anchor.href, window.location.href); } catch { return; }
        const store = target.hostname === 'apps.apple.com'
          ? 'ios'
          : target.hostname === 'play.google.com' ? 'android' : null;
        if (!store) return;
        gtag('event', 'store_click', {
          store,
          page_path: window.location.pathname,
          transport_type: 'beacon'
        });
      });
    });` : '';

  return `<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    gtag('set', 'ads_data_redaction', true);
    gtag('set', 'allow_google_signals', false);
    gtag('set', 'allow_ad_personalization_signals', false);
    gtag('js', new Date());
    gtag('config', '${MEASUREMENT_ID}');${storeTracking}
  </script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}"></script>`;
}
