/** Ezoic loader — only runs when SPEAKUR_AD_CONFIG.enabled is true. */
export const AD_CONFIG_INLINE = `  <script>
    window.SPEAKUR_AD_CONFIG = window.SPEAKUR_AD_CONFIG || { enabled: false, provider: "ezoic" };
  </script>`;

export const EZOIC_HEAD_SCRIPTS = `${AD_CONFIG_INLINE}
  <script>
    (function () {
      var cfg = window.SPEAKUR_AD_CONFIG || {};
      if (!cfg.enabled) return;

      function inject(src, attrs) {
        var s = document.createElement("script");
        s.src = src;
        if (attrs) {
          Object.keys(attrs).forEach(function (k) {
            s.setAttribute(k, attrs[k]);
          });
        }
        document.head.appendChild(s);
      }

      inject("https://cmp.gatekeeperconsent.com/min.js", { "data-cfasync": "false" });
      inject("https://the.gatekeeperconsent.com/cmp.min.js", { "data-cfasync": "false" });
      inject("https://www.ezojs.com/ezoic/sa.min.js", { async: "" });
      window.ezstandalone = window.ezstandalone || {};
      ezstandalone.cmd = ezstandalone.cmd || [];

      function loadAnalytics() {
        if (document.querySelector('script[src*="ezoicanalytics.com/analytics.js"]')) return;
        inject("https://ezoicanalytics.com/analytics.js", { async: "" });
      }
      if ("requestIdleCallback" in window) {
        requestIdleCallback(loadAnalytics, { timeout: 3500 });
      } else {
        window.addEventListener("load", function () {
          setTimeout(loadAnalytics, 1200);
        });
      }
    })();
  </script>
`;

export const EZOIC_MARKER = "SPEAKUR_AD_CONFIG";

/** One showAds({}) per placement spot (Ezoic Step 3). */
export const EZOIC_SHOW_ADS_SNIPPET = `<script>
    window.ezstandalone = window.ezstandalone || {};
    ezstandalone.cmd = ezstandalone.cmd || [];
    ezstandalone.cmd.push(function () {
        ezstandalone.showAds({});
    });
</script>`;
