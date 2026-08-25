(function () {
  const year = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = year;
  });

  /** Mark fonts ready without blocking first paint (font-display: swap). */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      document.documentElement.classList.add("fonts-ready");
      document.body.classList.add("fonts-ready");
    });
  } else {
    document.documentElement.classList.add("fonts-ready");
  }

  function ensureAdSlots() {
    const shell = document.querySelector(".shell") || document.body;
    let top = document.getElementById("speakur-ad-top");
    if (!top) {
      top = document.createElement("div");
      top.id = "speakur-ad-top";
      top.className = "ad-slot ad-slot-top stable-slot";
      top.setAttribute("aria-label", "Advertisement");
      const header = shell.querySelector("header");
      if (header) header.insertAdjacentElement("afterend", top);
      else shell.insertAdjacentElement("afterbegin", top);
    }

    let bottom = document.getElementById("speakur-ad-bottom");
    if (!bottom) {
      bottom = document.createElement("div");
      bottom.id = "speakur-ad-bottom";
      bottom.className = "ad-slot ad-slot-bottom stable-slot";
      bottom.setAttribute("aria-label", "Advertisement");
      const footer = shell.querySelector("footer");
      if (footer) footer.insertAdjacentElement("beforebegin", bottom);
      else shell.appendChild(bottom);
    }
    return { top, bottom };
  }

  function applySlotHeights(top, bottom) {
    const mobile =
      window.SpeakurAds && SpeakurAds.isMobileViewport
        ? SpeakurAds.isMobileViewport()
        : window.matchMedia("(max-width: 767px)").matches;
    const cfg =
      window.SpeakurAds && (mobile ? SpeakurAds.mobile : SpeakurAds.desktop);
    if (cfg && cfg.top) {
      top.style.minHeight = (cfg.top.minHeight || cfg.top.height || 60) + "px";
    } else {
      top.style.minHeight = mobile ? "50px" : "90px";
    }
    if (cfg && cfg.bottom) {
      bottom.style.minHeight =
        (cfg.bottom.minHeight || cfg.bottom.height || 90) + "px";
    } else {
      bottom.style.minHeight = mobile ? "600px" : "90px";
    }
  }

  // Reserve ad geometry immediately (sync) so deferred work doesn't shift layout
  const slots = ensureAdSlots();
  applySlotHeights(slots.top, slots.bottom);

  function loadAds() {
    if (!window.SpeakurAds || !SpeakurAds.loadPlacements) {
      console.warn("[Speakur] ad-config.js must load before site.js");
      return;
    }
    applySlotHeights(slots.top, slots.bottom);
    SpeakurAds.loadPlacements(slots.top, slots.bottom);
  }

  // Short delay after first paint — placeholders already reserve CLS space
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(loadAds, 120);
    });
  } else {
    setTimeout(loadAds, 120);
  }
})();
