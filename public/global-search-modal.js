/**
 * Global search modal disabled — keep file so existing pages' script tags stay valid.
 * In-page search (home SearchBox / word lookup) is unchanged.
 */
(function () {
  function scrub() {
    var overlay = document.getElementById("speakur-global-search");
    if (overlay) overlay.remove();
    document.documentElement.classList.remove("gs-open");
    document.body.classList.remove("gs-open");
    document.body.style.overflow = "";

    var triggers = document.querySelectorAll(
      "#speakur-global-search-trigger, .gs-trigger, [data-global-search-trigger]",
    );
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].remove();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scrub);
  } else {
    scrub();
  }
})();
