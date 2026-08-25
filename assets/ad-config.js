/**
 * Legacy Adsterra loader — disabled.
 * Ads are served by Ezoic (header scripts + ezstandalone.showAds in site.js).
 */
(function (global) {
  global.SpeakurAds = {
    disabled: true,
    reason: "Replaced by Ezoic standalone showAds placements",
    loadPlacements: function () {},
  };
})(typeof window !== "undefined" ? window : globalThis);
