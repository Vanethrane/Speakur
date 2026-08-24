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
};

export type AffiliateOffer = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  eyebrow?: string;
};

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
    /**
     * Adsterra network scripts (High Revenue Format banner + Profitable Rate CPM).
     * Omit a slot (or leave scriptSrc empty) to fall back to NativeAffiliateCard.
     */
    networks: {
      banner: {
        key: "a84b19562a190beed36c0b0018e410ed",
        scriptSrc:
          "https://www.highrevenueformat.com/a84b19562a190beed36c0b0018e410ed/invoke.js",
        format: "iframe",
        width: 468,
        height: 60,
        params: {},
      },
      sidebar: {
        key: "26ba66c47ebf20b100ccb19e5e6b1280",
        scriptSrc:
          "https://pl31013431.profitableratecpmnetwork.com/26ba66c47ebf20b100ccb19e5e6b1280/invoke.js",
        format: "container",
        containerId: "container-26ba66c47ebf20b100ccb19e5e6b1280",
        async: true,
        cfAsyncFalse: true,
      },
      inline: {
        key: "26ba66c47ebf20b100ccb19e5e6b1280",
        scriptSrc:
          "https://pl31013431.profitableratecpmnetwork.com/26ba66c47ebf20b100ccb19e5e6b1280/invoke.js",
        format: "container",
        containerId: "container-26ba66c47ebf20b100ccb19e5e6b1280",
        async: true,
        cfAsyncFalse: true,
      },
    } satisfies Partial<Record<AdSlotType, AdNetworkConfig | undefined>>,

    /** Reserved heights so fallbacks match ad unit footprints (CLS). */
    reservedHeight: {
      banner: 60,
      sidebar: 250,
      inline: 90,
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

/** True when a slot has a usable network script in site.config. */
export function hasAdNetworkScript(slotType: AdSlotType): boolean {
  const network = siteConfig.ads.networks[slotType];
  return Boolean(network?.scriptSrc && network.key);
}
