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
      top.setAttribute("role", "region");
      top.setAttribute("aria-label", "Advertisement");
      const header = shell.querySelector("header");
      if (header) header.insertAdjacentElement("afterend", top);
      else shell.insertAdjacentElement("afterbegin", top);
    }

    let mid = document.getElementById("speakur-ad-mid");

    let bottom = document.getElementById("speakur-ad-bottom");
    if (!bottom) {
      bottom = document.createElement("div");
      bottom.id = "speakur-ad-bottom";
      bottom.className = "ad-slot ad-slot-bottom stable-slot";
      bottom.setAttribute("role", "region");
      bottom.setAttribute("aria-label", "Advertisement");
      const footer = shell.querySelector("footer");
      if (footer) footer.insertAdjacentElement("beforebegin", bottom);
      else shell.appendChild(bottom);
    }
    return { top, mid, bottom };
  }

  /**
   * Ezoic Step 3: one showAds({}) per placement spot.
   * Queued on ezstandalone.cmd so it runs after the header script is ready.
   */
  function activateEzoicSlot(el) {
    if (!el || el.dataset.ezoicAds === "1") return;
    el.dataset.ezoicAds = "1";
    if (!el.style.minHeight) el.style.minHeight = "90px";
    const s = document.createElement("script");
    s.textContent =
      "window.ezstandalone=window.ezstandalone||{};" +
      "ezstandalone.cmd=ezstandalone.cmd||[];" +
      "ezstandalone.cmd.push(function(){ezstandalone.showAds({});});";
    el.appendChild(s);
  }

  function loadEzoicAds() {
    const cfg = window.SPEAKUR_AD_CONFIG || {};
    const slots = ensureAdSlots();
    if (cfg.enabled === false) {
      [slots.top, slots.mid, slots.bottom].forEach((el) => {
        if (!el) return;
        el.hidden = true;
        el.style.minHeight = "0";
        el.style.margin = "0";
        el.style.padding = "0";
        el.style.border = "0";
      });
      return;
    }
    activateEzoicSlot(slots.top);
    if (slots.mid) activateEzoicSlot(slots.mid);
    activateEzoicSlot(slots.bottom);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadEzoicAds);
  } else {
    loadEzoicAds();
  }

  /** Tools nav: one open dropdown at a time; close on outside click / Escape. */
  function initNavDropdowns() {
    const dropdowns = Array.from(document.querySelectorAll("nav .nav-dropdown"));
    if (!dropdowns.length) return;

    function closeAll(except) {
      dropdowns.forEach((d) => {
        if (d !== except) d.open = false;
      });
    }

    dropdowns.forEach((details) => {
      details.addEventListener("toggle", () => {
        if (details.open) closeAll(details);
      });
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest || e.target.closest(".nav-dropdown")) return;
      closeAll(null);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll(null);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavDropdowns);
  } else {
    initNavDropdowns();
  }
})();
