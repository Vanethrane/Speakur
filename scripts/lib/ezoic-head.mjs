/** Defer Ezoic analytics until after first paint to reduce main-thread JS during load. */
export const EZOIC_HEAD_SCRIPTS = `  <script data-cfasync="false" src="https://cmp.gatekeeperconsent.com/min.js"></script>
  <script data-cfasync="false" src="https://the.gatekeeperconsent.com/cmp.min.js"></script>
  <script async src="https://www.ezojs.com/ezoic/sa.min.js"></script>
  <script>
    window.ezstandalone = window.ezstandalone || {};
    ezstandalone.cmd = ezstandalone.cmd || [];
  </script>
  <script>
    (function () {
      function loadAnalytics() {
        if (document.querySelector('script[src*="ezoicanalytics.com/analytics.js"]')) return;
        var s = document.createElement("script");
        s.src = "https://ezoicanalytics.com/analytics.js";
        s.async = true;
        document.head.appendChild(s);
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
