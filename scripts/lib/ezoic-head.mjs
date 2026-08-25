/** Ezoic Privacy + Header scripts — must be first in <head>; privacy before header. */
export const EZOIC_HEAD_SCRIPTS = `  <script data-cfasync="false" src="https://cmp.gatekeeperconsent.com/min.js"></script>
  <script data-cfasync="false" src="https://the.gatekeeperconsent.com/cmp.min.js"></script>
  <script async src="https://www.ezojs.com/ezoic/sa.min.js"></script>
  <script>
    window.ezstandalone = window.ezstandalone || {};
    ezstandalone.cmd = ezstandalone.cmd || [];
  </script>
  <script src="https://ezoicanalytics.com/analytics.js"></script>
`;

export const EZOIC_MARKER = "cmp.gatekeeperconsent.com";

/** One showAds({}) per placement spot (Ezoic Step 3). */
export const EZOIC_SHOW_ADS_SNIPPET = `<script>
    window.ezstandalone = window.ezstandalone || {};
    ezstandalone.cmd = ezstandalone.cmd || [];
    ezstandalone.cmd.push(function () {
        ezstandalone.showAds({});
    });
</script>`;
