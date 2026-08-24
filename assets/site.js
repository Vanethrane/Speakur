(function () {
  const year = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = year;
  });

  if (!document.getElementById("speakur-ad-styles")) {
    const style = document.createElement("style");
    style.id = "speakur-ad-styles";
    style.textContent = `
      .ad-slot {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        margin: 1.25rem 0;
        min-height: 60px;
        overflow: hidden;
      }
      .ad-slot-top {
        margin-top: 1rem;
        margin-bottom: 0.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--paper-line, #e4d9c8);
      }
      .ad-slot-bottom {
        margin-top: 2rem;
        margin-bottom: 0.5rem;
        padding-top: 1.25rem;
        border-top: 1px solid var(--paper-line, #e4d9c8);
      }
      .ad-slot iframe {
        max-width: 100%;
      }
    `;
    document.head.appendChild(style);
  }

  /** Adsterra / High Revenue Format + Profitable Rate CPM — every page via site.js */
  function injectAds() {
    if (document.documentElement.dataset.speakurAds === "1") return;
    document.documentElement.dataset.speakurAds = "1";

    const shell = document.querySelector(".shell") || document.body;

    // Top banner (Adsterra High Revenue Format 468x60)
    const top = document.createElement("div");
    top.id = "speakur-ad-top";
    top.className = "ad-slot ad-slot-top";
    top.setAttribute("aria-label", "Advertisement");

    const header = shell.querySelector("header");
    if (header) header.insertAdjacentElement("afterend", top);
    else shell.insertAdjacentElement("afterbegin", top);

    window.atOptions = {
      key: "a84b19562a190beed36c0b0018e410ed",
      format: "iframe",
      height: 60,
      width: 468,
      params: {},
    };
    const banner = document.createElement("script");
    banner.src =
      "https://www.highrevenueformat.com/a84b19562a190beed36c0b0018e410ed/invoke.js";
    top.appendChild(banner);

    // Bottom unit (Adsterra Profitable Rate CPM Network)
    const bottom = document.createElement("div");
    bottom.id = "speakur-ad-bottom";
    bottom.className = "ad-slot ad-slot-bottom";
    bottom.setAttribute("aria-label", "Advertisement");

    const netScript = document.createElement("script");
    netScript.async = true;
    netScript.setAttribute("data-cfasync", "false");
    netScript.src =
      "https://pl31013431.profitableratecpmnetwork.com/26ba66c47ebf20b100ccb19e5e6b1280/invoke.js";

    const container = document.createElement("div");
    container.id = "container-26ba66c47ebf20b100ccb19e5e6b1280";

    bottom.appendChild(netScript);
    bottom.appendChild(container);

    const footer = shell.querySelector("footer");
    if (footer) footer.insertAdjacentElement("beforebegin", bottom);
    else shell.appendChild(bottom);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectAds);
  } else {
    injectAds();
  }
})();
