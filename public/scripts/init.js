/* Lelemon — analytics & lazy loaders (defer).
 * Config se inyecta vía window.__LELEMON__ en un mini-script inline previo. */
(function () {
  var cfg = window.__LELEMON__ || {};
  var META_PIXEL_ID = cfg.metaPixelId;
  var POSTHOG_KEY = cfg.posthogKey;
  var POSTHOG_HOST = cfg.posthogHost;
  var GA4_MEASUREMENT_ID = cfg.ga4Id;

  // Stubs — encolan hasta que cargue el real
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.fbq = window.fbq || function () {
    (window.fbq.q = window.fbq.q || []).push([].slice.call(arguments));
  };
  window.posthog = window.posthog || [];

  function loadPixel() {
    if (window._pixelLoaded) return;
    window._pixelLoaded = true;
    var savedQueue = (window.fbq && window.fbq.q) || [];
    delete window.fbq;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
    savedQueue.forEach(function (args) { window.fbq.apply(null, args); });
  }

  function loadPostHog() {
    if (window._posthogLoaded) return;
    window._posthogLoaded = true;
    !function (t, e) { var o, n, p, r; e.__SV || (window.posthog = e, e._i = [], e.init = function (i, s, a) { function g(t, e) { var o = e.split("."); 2 == o.length && (t = t[o[0]], e = o[1]), t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } } (p = t.createElement("script")).type = "text/javascript", p.crossOrigin = "anonymous", p.async = !0, p.src = s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js", (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r); var u = e; for (void 0 !== a ? u = e[a] = [] : a = "posthog", u.people = u.people || [], u.toString = function (t) { var e = "posthog"; return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e }, u.people.toString = function () { return u.toString(1) + ".people (stub)" }, o = "init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId captureTraceFeedback captureTraceMetric".split(" "), n = 0; n < o.length; n++)g(u, o[n]); e._i.push([i, s, a]) }, e.__SV = 1) }(document, window.posthog || []);
    window.posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      defaults: '2026-01-30',
      person_profiles: 'identified_only',
    });
  }

  function loadGA4() {
    if (window._ga4Loaded || !GA4_MEASUREMENT_ID) return;
    window._ga4Loaded = true;
    var s = document.createElement('script');
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_MEASUREMENT_ID;
    s.async = true;
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID);
  }

  function loadTurnstile() {
    if (window.turnstile || window._turnstileLoading) return;
    window._turnstileLoading = true;
    var s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }
  window.loadTurnstile = loadTurnstile;

  function loadAllAnalytics() {
    loadPixel();
    loadPostHog();
    loadGA4();
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadAllAnalytics, { timeout: 3000 });
  } else {
    window.addEventListener('load', function () { setTimeout(loadAllAnalytics, 1500); });
  }

  // Primera interacción: cargar todo
  ['click', 'scroll', 'touchstart', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, function handler() {
      loadAllAnalytics();
      loadTurnstile();
    }, { once: true, passive: true });
  });

  // CTA tracking — delegado, sin querySelectorAll inicial
  document.addEventListener('click', function (e) {
    var target = e.target;
    var waCta = target.closest && target.closest('[data-wa-cta]');
    if (waCta) {
      var section = (waCta.closest('section') && waCta.closest('section').id)
        || (waCta.closest('nav') && waCta.closest('nav').tagName)
        || 'unknown';
      window.fbq('track', 'Contact', { content_name: 'whatsapp_click', content_category: section });
      window.gtag('event', 'contact', { event_category: 'whatsapp', event_label: section });
      window.posthog.capture && window.posthog.capture('whatsapp_click', { source: section });
      return;
    }
    var pricingCta = target.closest && target.closest('#pricing-cta');
    if (pricingCta) {
      window.fbq('track', 'Schedule', { content_name: 'Pricing CTA' });
      window.gtag('event', 'schedule', { event_category: 'CTA', event_label: 'Pricing' });
      window.posthog.capture && window.posthog.capture('pricing_cta_click');
    }
  });
})();
