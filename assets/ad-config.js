/**
 * Ad stack configuration.
 * Ezoic returns 403 ("Monetization not allowed") until the site is approved —
 * keep enabled: false to avoid console errors, CORS noise, and wasted JS.
 *
 * When Ezoic approves speakur.com: set enabled: true and redeploy.
 */
(function (global) {
  global.SPEAKUR_AD_CONFIG = {
    enabled: false,
    provider: "ezoic",
  };

  /** @deprecated Adsterra removed */
  global.SpeakurAds = {
    disabled: true,
    reason: "Use SPEAKUR_AD_CONFIG.enabled + Ezoic when approved",
    loadPlacements: function () {},
  };
})(typeof window !== "undefined" ? window : globalThis);
