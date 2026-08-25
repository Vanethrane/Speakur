/**
 * PWA install prompt + service worker registration for static Speakur pages.
 * Shows banner after 45s on site OR 3 interactions (whichever comes first).
 */
(function () {
  var SITE_NAME = "Speakur";
  var TIME_MS = 45000;
  var INTERACTIONS_NEEDED = 3;
  var DISMISS_KEY = "speakur.pwa.banner.dismissed";

  var startedAt = Date.now();
  var interactions = 0;
  var bannerShown = false;
  var deferredPrompt = null;

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function isDismissed() {
    try {
      return window.localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  }

  function eligible() {
    return interactions >= INTERACTIONS_NEEDED || Date.now() - startedAt >= TIME_MS;
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {
        /* offline dev / file:// */
      });
    });
  }

  function countInteraction() {
    interactions += 1;
    window.dispatchEvent(
      new CustomEvent("speakur:pwa-interaction", { detail: { count: interactions } }),
    );
    maybeShowBanner();
  }

  function trackInteractions() {
    document.addEventListener(
      "click",
      function (event) {
        if (
          event.target.closest(
            "button, a, input, select, textarea, form, [role='button'], .play, .gs-trigger",
          )
        ) {
          countInteraction();
        }
      },
      true,
    );
    document.addEventListener(
      "submit",
      function () {
        countInteraction();
      },
      true,
    );
    window.addEventListener("speakur:interaction", countInteraction);
  }

  function dismissBanner() {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    var node = document.getElementById("speakur-pwa-banner");
    if (node) node.remove();
  }

  function showBanner() {
    if (bannerShown || isStandalone() || isDismissed()) return;
    if (!eligible()) return;
    bannerShown = true;

    if (document.getElementById("speakur-pwa-banner")) return;

    var bar = document.createElement("aside");
    bar.id = "speakur-pwa-banner";
    bar.className = "pwa-banner";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Install Speakur app");

    var text = document.createElement("p");
    text.className = "pwa-banner-text";
    text.textContent =
      "Add " + SITE_NAME + " to Home Screen for Offline Access";

    var actions = document.createElement("div");
    actions.className = "pwa-banner-actions";

    var installBtn = document.createElement("button");
    installBtn.type = "button";
    installBtn.className = "pwa-banner-install";
    installBtn.textContent = "Add";

    installBtn.addEventListener("click", function () {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.finally(function () {
          deferredPrompt = null;
          dismissBanner();
        });
        return;
      }
      dismissBanner();
    });

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "pwa-banner-close";
    closeBtn.setAttribute("aria-label", "Dismiss");
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", dismissBanner);

    actions.appendChild(installBtn);
    actions.appendChild(closeBtn);
    bar.appendChild(text);
    bar.appendChild(actions);
    document.body.appendChild(bar);
  }

  function maybeShowBanner() {
    if (!eligible()) return;
    showBanner();
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
    maybeShowBanner();
  });

  registerServiceWorker();
  trackInteractions();
  window.setTimeout(maybeShowBanner, TIME_MS);

  window.SpeakurPwa = {
    trackInteraction: countInteraction,
    showBanner: showBanner,
  };
})();
