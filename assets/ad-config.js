/**
 * Adsterra placement config — desktop vs mobile viewports.
 * Each iframe unit needs its own inline atOptions immediately before invoke.js.
 */
(function (global) {
  const BASE = "https://www.highrevenueformat.com";

  const units = {
    /** Native / social bar container */
    container: {
      type: "container",
      key: "75526e48831df22045d1c0520aed8e12",
      containerId: "container-75526e48831df22045d1c0520aed8e12",
      minHeight: 90,
      scriptSrc:
        "https://pl31014772.profitableratecpmnetwork.com/75526e48831df22045d1c0520aed8e12/invoke.js",
    },
    /** 468×60 */
    banner468: {
      key: "610549a4e2cb8d554bcbe7dbb2e50bb3",
      format: "iframe",
      height: 60,
      width: 468,
      minHeight: 60,
      scriptSrc: BASE + "/610549a4e2cb8d554bcbe7dbb2e50bb3/invoke.js",
    },
    /** 300×160 */
    box300: {
      key: "512008b3fc32c516f23a0bb29bc11139",
      format: "iframe",
      height: 300,
      width: 160,
      minHeight: 300,
      scriptSrc: BASE + "/512008b3fc32c516f23a0bb29bc11139/invoke.js",
    },
    /** 600×160 */
    sky600: {
      key: "9c16ddaedf78550e858f09091b31242b",
      format: "iframe",
      height: 600,
      width: 160,
      minHeight: 600,
      scriptSrc: BASE + "/9c16ddaedf78550e858f09091b31242b/invoke.js",
    },
    /** 320×50 mobile banner */
    mobile320: {
      key: "9b7f3e7d69adbc838531a2a57c1bf1db",
      format: "iframe",
      height: 50,
      width: 320,
      minHeight: 50,
      scriptSrc: BASE + "/9b7f3e7d69adbc838531a2a57c1bf1db/invoke.js",
    },
    /** 728×90 leaderboard */
    leaderboard728: {
      key: "68b1d2aa697cf2ee0f3546e037a5adcf",
      format: "iframe",
      height: 90,
      width: 728,
      minHeight: 90,
      scriptSrc: BASE + "/68b1d2aa697cf2ee0f3546e037a5adcf/invoke.js",
    },
  };

  const desktop = {
    top: units.leaderboard728,
    bottom: units.container,
  };

  const mobile = {
    top: units.mobile320,
    bottom: units.sky600,
  };

  function isMobileViewport() {
    return window.matchMedia("(max-width: 767px)").matches;
  }

  /** Inject one iframe unit — inline atOptions scoped to this mount (required for 2+ units). */
  function loadIframeAd(mount, unit) {
    if (!mount || mount.querySelector('script[data-speakur-ad="' + unit.key + '"]')) return;
    mount.style.minHeight = (unit.minHeight || unit.height) + "px";

    const opts = document.createElement("script");
    opts.textContent =
      "atOptions = " +
      JSON.stringify({
        key: unit.key,
        format: "iframe",
        height: unit.height,
        width: unit.width,
        params: {},
      }) +
      ";";

    const invoke = document.createElement("script");
    invoke.src = unit.scriptSrc;
    invoke.dataset.speakurAd = unit.key;
    invoke.setAttribute("data-cfasync", "false");

    mount.appendChild(opts);
    mount.appendChild(invoke);
  }

  function loadContainerAd(mount, unit) {
    if (!mount || mount.querySelector('script[data-speakur-ad="' + unit.key + '"]')) return;
    mount.style.minHeight = unit.minHeight + "px";

    let box = document.getElementById(unit.containerId);
    if (!box) {
      box = document.createElement("div");
      box.id = unit.containerId;
      box.style.minHeight = unit.minHeight + "px";
      mount.appendChild(box);
    }

    const invoke = document.createElement("script");
    invoke.src = unit.scriptSrc;
    invoke.async = true;
    invoke.dataset.speakurAd = unit.key;
    invoke.setAttribute("data-cfasync", "false");
    mount.appendChild(invoke);
  }

  function loadUnit(mount, unit) {
    if (!mount || !unit) return;
    if (unit.type === "container") loadContainerAd(mount, unit);
    else loadIframeAd(mount, unit);
  }

  function loadPlacements(topMount, bottomMount) {
    if (document.documentElement.dataset.speakurAds === "1") return;
    document.documentElement.dataset.speakurAds = "1";

    const cfg = isMobileViewport() ? mobile : desktop;
    document.documentElement.dataset.speakurAdViewport = isMobileViewport()
      ? "mobile"
      : "desktop";

    loadUnit(topMount, cfg.top);
    loadUnit(bottomMount, cfg.bottom);
  }

  global.SpeakurAds = {
    units,
    desktop,
    mobile,
    isMobileViewport,
    loadIframeAd,
    loadContainerAd,
    loadUnit,
    loadPlacements,
  };
})(typeof window !== "undefined" ? window : globalThis);
