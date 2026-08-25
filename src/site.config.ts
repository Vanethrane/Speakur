/**
 * Site-wide Speakur configuration (ads, affiliates, traffic gates).
 * Keep ad network scripts here — AdSlot reads this instead of hardcoding vendors.
 */

export type AdSlotType = "banner" | "sidebar" | "inline";

export type AdNetworkConfig = {
  /** Unique key / placement id from the network */
  key: string;
  /** External invoke script URL */
  scriptSrc: string;
  /** iframe | container — how the network paints into the slot */
  format?: "iframe" | "container";
  width?: number;
  height?: number;
  /** DOM id the network expects (e.g. container-* divs) */
  containerId?: string;
  /** Extra params passed to atOptions-style configs */
  params?: Record<string, unknown>;
  /** Load script with async + data-cfasync="false" when true */
  async?: boolean;
  cfAsyncFalse?: boolean;
  minHeight?: number;
};

export type AffiliateOffer = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  eyebrow?: string;
};

const HRF = "https://www.highrevenueformat.com";

/** Desktop: 468×60 banner + Profitable Rate CPM container */
const desktopNetworks = {
  banner: {
    key: "a84b19562a190beed36c0b0018e410ed",
    scriptSrc: `${HRF}/a84b19562a190beed36c0b0018e410ed/invoke.js`,
    format: "iframe",
    width: 468,
    height: 60,
    minHeight: 60,
    params: {},
  },
  sidebar: {
    key: "26ba66c47ebf20b100ccb19e5e6b1280",
    scriptSrc:
      "https://pl31013431.profitableratecpmnetwork.com/26ba66c47ebf20b100ccb19e5e6b1280/invoke.js",
    format: "container",
    containerId: "container-26ba66c47ebf20b100ccb19e5e6b1280",
    minHeight: 90,
    async: true,
    cfAsyncFalse: true,
  },
  inline: {
    key: "26ba66c47ebf20b100ccb19e5e6b1280",
    scriptSrc:
      "https://pl31013431.profitableratecpmnetwork.com/26ba66c47ebf20b100ccb19e5e6b1280/invoke.js",
    format: "container",
    containerId: "container-26ba66c47ebf20b100ccb19e5e6b1280",
    minHeight: 90,
    async: true,
    cfAsyncFalse: true,
  },
} satisfies Record<AdSlotType, AdNetworkConfig>;

/** Mobile: 160×300 top + 160×600 bottom (High Revenue Format iframe units) */
const mobileNetworks = {
  banner: {
    key: "58bf1a4c6c80ba8cc456be12856d445f",
    scriptSrc: `${HRF}/58bf1a4c6c80ba8cc456be12856d445f/invoke.js`,
    format: "iframe",
    width: 160,
    height: 300,
    minHeight: 300,
    params: {},
    cfAsyncFalse: true,
  },
  sidebar: {
    key: "25a5fb022b4fd71357962f58661b8035",
    scriptSrc: `${HRF}/25a5fb022b4fd71357962f58661b8035/invoke.js`,
    format: "iframe",
    width: 160,
    height: 600,
    minHeight: 600,
    params: {},
    cfAsyncFalse: true,
  },
  inline: {
    key: "25a5fb022b4fd71357962f58661b8035",
    scriptSrc: `${HRF}/25a5fb022b4fd71357962f58661b8035/invoke.js`,
    format: "iframe",
    width: 160,
    height: 600,
    minHeight: 600,
    params: {},
    cfAsyncFalse: true,
  },
} satisfies Record<AdSlotType, AdNetworkConfig>;

export const siteConfig = {
  name: "Speakur",
  domain: "https://www.speakur.com",

  /**
   * Approximate monthly visits used by AdSlot’s minTrafficRequired gate.
   * Set high enough that Adsterra units load on every page by default.
   */
  estimatedMonthlyVisits: 100_000,

  /** When true, AdSlot always prefers network scripts over affiliate fallbacks. */
  forceNetworkAds: true,

  ads: {
    networks: desktopNetworks,
    networksMobile: mobileNetworks,

    /** Reserved heights so fallbacks match ad unit footprints (CLS). */
    reservedHeight: {
      banner: 60,
      sidebar: 250,
      inline: 90,
    } satisfies Record<AdSlotType, number>,

    reservedHeightMobile: {
      banner: 300,
      sidebar: 600,
      inline: 600,
    } satisfies Record<AdSlotType, number>,

    /** Default affiliate cards when a network script is missing or traffic is low */
    affiliateFallback: {
      banner: {
        id: "guides-banner",
        eyebrow: "From Speakur",
        title: "Tricky words, said clearly",
        description: "Browse free pronunciation guides for food, places, names, and more.",
        href: "/guides",
        cta: "Read guides",
      },
      sidebar: {
        id: "words-sidebar",
        eyebrow: "Word directories",
        title: "Real pages for real words",
        description: "Every entry has its own URL — medical, food, everyday English, and beyond.",
        href: "/words",
        cta: "Browse words",
      },
      inline: {
        id: "search-inline",
        eyebrow: "Try search",
        title: "Not sure how to say it?",
        description: "Look up any English word for IPA, syllables, and free click-to-play audio.",
        href: "/",
        cta: "Search a word",
      },
    } satisfies Record<AdSlotType, AffiliateOffer>,
  },
} as const;

export type SiteConfig = typeof siteConfig;

export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

export function getAdNetwork(slotType: AdSlotType, mobile?: boolean): AdNetworkConfig {
  const useMobile = mobile ?? isMobileViewport();
  return useMobile
    ? siteConfig.ads.networksMobile[slotType]
    : siteConfig.ads.networks[slotType];
}

export function getReservedHeight(slotType: AdSlotType, mobile?: boolean): number {
  const useMobile = mobile ?? isMobileViewport();
  return useMobile
    ? siteConfig.ads.reservedHeightMobile[slotType]
    : siteConfig.ads.reservedHeight[slotType];
}

/** True when a slot has a usable network script in site.config. */
export function hasAdNetworkScript(slotType: AdSlotType): boolean {
  const network = getAdNetwork(slotType);
  return Boolean(network?.scriptSrc && network?.key);
}
