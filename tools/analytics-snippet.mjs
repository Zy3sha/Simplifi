export const MEASUREMENT_ID = 'G-Y7CHSL1YHZ';

// GA4 with Google Consent Mode v2. Analytics storage starts DENIED (cookieless) and
// is granted only after the visitor accepts on the consent banner; a stored "granted"
// choice is honoured on the very next page load (before config) so returning visitors
// get full, cookie-based attribution immediately. Decline keeps the site cookieless.
export function analyticsWithConsent({trackStoreLinks = true} = {}) {
  const storeTracking = trackStoreLinks ? `
      document.addEventListener('click', function (event) {
        var anchor = event.target.closest('a[href]');
        if (!anchor) return;
        var target;
        try { target = new URL(anchor.href, window.location.href); } catch (e) { return; }
        var store = target.hostname === 'apps.apple.com' ? 'ios'
          : (target.hostname === 'play.google.com' ? 'android' : null);
        if (!store) return;
        gtag('event', 'store_click', { store: store, page_path: window.location.pathname, transport_type: 'beacon' });
      });` : '';

  return `<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    var __obConsent = 'denied';
    try { if (localStorage.getItem('ob_analytics_consent') === 'granted') __obConsent = 'granted'; } catch (e) {}
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: __obConsent
    });
    gtag('set', 'ads_data_redaction', true);
    gtag('set', 'allow_ad_personalization_signals', false);
    gtag('js', new Date());
    gtag('config', '${MEASUREMENT_ID}');
    document.addEventListener('DOMContentLoaded', function () {${storeTracking}
      var stored = null;
      try { stored = localStorage.getItem('ob_analytics_consent'); } catch (e) {}
      if (stored === 'granted' || stored === 'denied') return;
      var bar = document.createElement('div');
      bar.className = 'ob-consent';
      bar.setAttribute('role', 'dialog');
      bar.setAttribute('aria-label', 'Analytics cookie choice');
      bar.innerHTML = '<p>We use privacy-first analytics to understand how families find OBubba. Accept analytics cookies, or decline and the site stays completely cookieless. See our <a href="/privacy.html">Privacy Policy</a>.</p><div class="ob-consent-btns"><button type="button" data-ob-decline>Decline</button><button type="button" data-ob-accept>Accept</button></div>';
      document.body.appendChild(bar);
      function choose(v) {
        try { localStorage.setItem('ob_analytics_consent', v); } catch (e) {}
        gtag('consent', 'update', { analytics_storage: v });
        bar.remove();
      }
      bar.querySelector('[data-ob-accept]').addEventListener('click', function () { choose('granted'); });
      bar.querySelector('[data-ob-decline]').addEventListener('click', function () { choose('denied'); });
    });
  </script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}"></script>
  <style>
    .ob-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:560px;margin:0 auto;background:#fff;color:#2b2030;border:1px solid rgba(80,50,80,.18);border-radius:14px;box-shadow:0 18px 50px rgba(55,38,56,.22);padding:16px 18px;font:14px/1.5 Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
    .ob-consent p{margin:0 0 12px}
    .ob-consent a{color:#b8618f;text-decoration:underline}
    .ob-consent-btns{display:flex;gap:10px;justify-content:flex-end}
    .ob-consent button{cursor:pointer;border-radius:10px;padding:9px 18px;font:600 14px Inter,system-ui,sans-serif;border:1px solid rgba(80,50,80,.25);background:#f4eef3;color:#2b2030}
    .ob-consent [data-ob-accept]{background:#b8618f;color:#fff;border-color:#b8618f}
    @media (prefers-color-scheme:dark){.ob-consent{background:#241b28;color:#f3e9f0;border-color:rgba(255,255,255,.14)}.ob-consent button{background:#3a2c40;color:#f3e9f0}.ob-consent [data-ob-accept]{background:#d98cb6;color:#241019;border-color:#d98cb6}}
  </style>`;
}

// Back-compat alias (previous cookieless-only name).
export const cookielessAnalytics = analyticsWithConsent;
