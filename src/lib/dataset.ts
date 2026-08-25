import dataset from "@/data/dataset.json";
import { siteConfig } from "@/site.config";

export type PageLanguageMeta = {
  language: string;
  accent: string;
  name?: string;
  applicationCategory?: string;
  inLanguage?: string;
  parentCategory?: string;
  tags?: string[];
  primaryKeyword?: string;
  path?: string;
  faq?: { question: string; answer: string }[];
};

export type ToolAffiliate = {
  id: string;
  label: string;
  title: string;
  description: string;
  href: string;
  cta: string;
};

export type RelatedLink = {
  slug: string;
  href: string;
  /** Natural anchor text from the target’s primary keyword */
  anchorText: string;
  name: string;
  parentCategory: string;
  sharedTags: string[];
  score: number;
};

type HowToStepTemplate = {
  name: string;
  text: string;
};

type DatasetSchema = {
  softwareApplication: {
    applicationCategory: string;
    applicationSubCategory?: string;
    operatingSystem: string;
    softwareVersion?: string;
    offers: { price: string; priceCurrency: string };
    publisher: { name: string; url: string };
    featureList?: string[];
    parameterDescriptions?: Record<string, string>;
  };
  howTo: {
    totalTime: string;
    estimatedCost: { currency: string; value: string };
    tool: string;
    stepTemplates: HowToStepTemplate[];
  };
  webPage?: {
    isPartOf: { name: string; url: string };
    parameterDescriptions?: Record<string, string>;
  };
  breadcrumb?: {
    homeName: string;
    homePath: string;
    guidesName: string;
    guidesPath: string;
    wordsName: string;
    wordsPath: string;
  };
  defaults: {
    language: string;
    accent: string;
    inLanguage: string;
  };
  internalLinks?: {
    relatedLimit: number;
    minInbound: number;
  };
};

type DatasetFile = {
  version: number;
  schema: DatasetSchema;
  pages: Record<string, PageLanguageMeta>;
  toolAffiliates: Record<string, ToolAffiliate>;
};

const data = dataset as DatasetFile;

const RELATED_LIMIT = data.schema.internalLinks?.relatedLimit ?? 6;
const MIN_INBOUND = data.schema.internalLinks?.minInbound ?? 3;

/** Read language/accent metadata for a guide (or other) slug from dataset.json */
export function getPageLanguageMeta(slug: string): PageLanguageMeta | null {
  return data.pages[slug] ?? null;
}

export function getDatasetSchema(): DatasetSchema {
  return data.schema;
}

export function listDatasetPageSlugs(): string[] {
  return Object.keys(data.pages);
}

/** Map a target language string to its affiliate referral tool */
export function getToolAffiliateForLanguage(language: string): ToolAffiliate {
  const exact = data.toolAffiliates[language];
  if (exact) return exact;
  const normalized = language.trim().toLowerCase();
  const hit = Object.entries(data.toolAffiliates).find(
    ([key]) => key.toLowerCase() === normalized,
  );
  if (hit) return hit[1];
  return data.toolAffiliates.default;
}

export function listDatasetLanguages(): string[] {
  return Object.keys(data.toolAffiliates).filter((key) => key !== "default");
}

function pageHref(slug: string, meta: PageLanguageMeta): string {
  return meta.path || `/guides/${slug}`;
}

function naturalAnchor(meta: PageLanguageMeta, slug: string): string {
  const keyword = (meta.primaryKeyword || meta.name || slug).trim();
  // Never emit generic CTAs
  if (/^(click here|read more|learn more|here|link)$/i.test(keyword)) {
    return meta.name || slug.replace(/-/g, " ");
  }
  return keyword;
}

function relatedScore(a: PageLanguageMeta, b: PageLanguageMeta): number {
  let score = 0;
  if (a.parentCategory && a.parentCategory === b.parentCategory) score += 10;
  const tagsA = new Set((a.tags || []).map((t) => t.toLowerCase()));
  const tagsB = (b.tags || []).map((t) => t.toLowerCase());
  for (const tag of tagsB) {
    if (tagsA.has(tag)) score += 3;
  }
  if (a.language && a.language === b.language) score += 1;
  if (a.accent && a.accent === b.accent) score += 1;
  return score;
}

function sharedTags(a: PageLanguageMeta, b: PageLanguageMeta): string[] {
  const tagsA = new Set((a.tags || []).map((t) => t.toLowerCase()));
  return (b.tags || []).filter((t) => tagsA.has(t.toLowerCase()));
}

function rankedCandidates(slug: string): { slug: string; score: number }[] {
  const self = data.pages[slug];
  if (!self) return [];
  return Object.entries(data.pages)
    .filter(([other]) => other !== slug)
    .map(([other, meta]) => ({ slug: other, score: relatedScore(self, meta) }))
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug));
}

/**
 * Build outbound related-link sets for every page, then reinforce edges so
 * each page receives at least MIN_INBOUND inbound links from siblings.
 */
function buildRelatedGraph(
  outboundLimit = RELATED_LIMIT,
  minInbound = MIN_INBOUND,
): Map<string, string[]> {
  const slugs = Object.keys(data.pages);
  const outbound = new Map<string, string[]>();

  for (const slug of slugs) {
    const picks = rankedCandidates(slug)
      .slice(0, outboundLimit)
      .map((row) => row.slug);
    outbound.set(slug, picks);
  }

  const inboundCount = (target: string) => {
    let n = 0;
    for (const [, links] of outbound) {
      if (links.includes(target)) n += 1;
    }
    return n;
  };

  // Reinforce: pages short on inbound get reciprocal / high-score inbound edges
  let guard = 0;
  while (guard < 500) {
    guard += 1;
    const needy = slugs
      .map((slug) => ({ slug, inbound: inboundCount(slug) }))
      .filter((row) => row.inbound < minInbound)
      .sort((a, b) => a.inbound - b.inbound || a.slug.localeCompare(b.slug));

    if (needy.length === 0) break;

    const target = needy[0].slug;
    const donors = rankedCandidates(target)
      .map((row) => row.slug)
      .filter((donor) => {
        const links = outbound.get(donor) || [];
        return !links.includes(target);
      });

    let linked = false;
    for (const donor of donors) {
      const links = [...(outbound.get(donor) || [])];
      if (links.includes(target)) continue;

      if (links.length < outboundLimit) {
        links.push(target);
        outbound.set(donor, links);
        linked = true;
        break;
      }

      // Replace the weakest (last) related item if needed to satisfy inbound floor
      const self = data.pages[donor];
      const weakest = links
        .map((s) => ({ slug: s, score: relatedScore(self, data.pages[s]) }))
        .sort((a, b) => a.score - b.score || a.slug.localeCompare(b.slug))[0];
      const targetScore = relatedScore(self, data.pages[target]);
      if (weakest && targetScore >= weakest.score) {
        outbound.set(
          donor,
          links.map((s) => (s === weakest.slug ? target : s)),
        );
        linked = true;
        break;
      }
    }

    if (!linked) {
      // Last resort: force first available donor to append (may exceed limit by 1)
      const donor = donors[0] || slugs.find((s) => s !== target);
      if (!donor) break;
      const links = [...(outbound.get(donor) || [])];
      if (!links.includes(target)) {
        links.push(target);
        outbound.set(donor, links);
      } else {
        break;
      }
    }
  }

  return outbound;
}

let cachedGraph: Map<string, string[]> | null = null;

function relatedGraph(): Map<string, string[]> {
  if (!cachedGraph) cachedGraph = buildRelatedGraph();
  return cachedGraph;
}

/** Related Tools & Conversions links for a programmatic slug page */
export function getRelatedToolsAndConversions(
  slug: string,
  limit = RELATED_LIMIT,
): RelatedLink[] {
  const self = data.pages[slug];
  if (!self) return [];

  const targets = (relatedGraph().get(slug) || []).slice(0, limit);
  return targets.map((otherSlug) => {
    const meta = data.pages[otherSlug];
    return {
      slug: otherSlug,
      href: pageHref(otherSlug, meta),
      anchorText: naturalAnchor(meta, otherSlug),
      name: meta.name || otherSlug,
      parentCategory: meta.parentCategory || "general",
      sharedTags: sharedTags(self, meta),
      score: relatedScore(self, meta),
    };
  });
}

/** Inbound sibling count (for QA / guarantees) */
export function countInboundLinks(slug: string): number {
  let n = 0;
  for (const [, links] of relatedGraph()) {
    if (links.includes(slug)) n += 1;
  }
  return n;
}

/** Assert every dataset page has ≥ minInbound sibling inbound links */
export function assertMinInboundLinks(minInbound = MIN_INBOUND): {
  ok: boolean;
  failures: { slug: string; inbound: number }[];
} {
  const failures = Object.keys(data.pages)
    .map((slug) => ({ slug, inbound: countInboundLinks(slug) }))
    .filter((row) => row.inbound < minInbound);
  return { ok: failures.length === 0, failures };
}

export type ProgrammaticSchemaInput = {
  slug?: string;
  name: string;
  description: string;
  path: string;
  pageType?: "word" | "guide" | "programmatic";
};

export type ProgrammaticJsonLdGraph = {
  "@context": "https://schema.org";
  "@graph": Record<string, unknown>[];
};

function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const base = siteConfig.domain.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Single JSON-LD document (@graph) with SoftwareApplication, WebPage, and
 * BreadcrumbList — fields populated from dataset.json for server render.
 */
export function buildProgrammaticJsonLd(input: ProgrammaticSchemaInput): ProgrammaticJsonLdGraph {
  const schema = data.schema;
  const page = input.slug ? data.pages[input.slug] : undefined;
  const name = page?.name?.trim() || input.name.trim();
  const applicationCategory =
    page?.applicationCategory || schema.softwareApplication.applicationCategory;
  const inLanguage = page?.inLanguage || schema.defaults.inLanguage;
  const language = page?.language || schema.defaults.language;
  const accent = page?.accent || schema.defaults.accent;
  const primaryKeyword = page?.primaryKeyword || name;
  const parentCategory = page?.parentCategory || schema.softwareApplication.applicationSubCategory;
  const url = absoluteUrl(input.path);
  const pageType = input.pageType || (input.slug ? "guide" : "word");

  const crumb = schema.breadcrumb || {
    homeName: "Speakur",
    homePath: "/",
    guidesName: "Guides",
    guidesPath: "/guides",
    wordsName: "Words",
    wordsPath: "/words",
  };
  const webPageCfg = schema.webPage || {
    isPartOf: schema.softwareApplication.publisher,
  };

  const softwareId = `${url}#software`;
  const webPageId = `${url}#webpage`;
  const breadcrumbId = `${url}#breadcrumb`;

  const softwareApplication: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    "@id": softwareId,
    name,
    description: input.description,
    url,
    applicationCategory,
    applicationSubCategory: schema.softwareApplication.applicationSubCategory,
    operatingSystem: schema.softwareApplication.operatingSystem || "Web",
    softwareVersion: schema.softwareApplication.softwareVersion,
    inLanguage,
    offers: {
      "@type": "Offer",
      price: schema.softwareApplication.offers.price,
      priceCurrency: schema.softwareApplication.offers.priceCurrency,
    },
    publisher: {
      "@type": "Organization",
      name: schema.softwareApplication.publisher.name,
      url: schema.softwareApplication.publisher.url,
    },
    featureList: schema.softwareApplication.featureList,
    keywords: [name, primaryKeyword, language, accent, parentCategory, "pronunciation"]
      .filter(Boolean)
      .join(", "),
  };

  if (schema.softwareApplication.parameterDescriptions) {
    softwareApplication.additionalProperty = Object.entries(
      schema.softwareApplication.parameterDescriptions,
    ).map(([key, description]) => ({
      "@type": "PropertyValue",
      name: key,
      description,
      value:
        key === "name"
          ? name
          : key === "operatingSystem"
            ? schema.softwareApplication.operatingSystem
            : key === "applicationCategory"
              ? applicationCategory
              : key === "inLanguage"
                ? inLanguage
                : undefined,
    }));
  }

  const breadcrumbItems =
    pageType === "word"
      ? [
          { name: crumb.homeName, path: crumb.homePath },
          { name: crumb.wordsName, path: crumb.wordsPath },
          { name, path: input.path },
        ]
      : [
          { name: crumb.homeName, path: crumb.homePath },
          { name: crumb.guidesName, path: crumb.guidesPath },
          { name, path: input.path },
        ];

  const breadcrumbList: Record<string, unknown> = {
    "@type": "BreadcrumbList",
    "@id": breadcrumbId,
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };

  const webPage: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": webPageId,
    url,
    name,
    description: input.description,
    inLanguage,
    isPartOf: {
      "@type": "WebSite",
      name: webPageCfg.isPartOf.name,
      url: webPageCfg.isPartOf.url,
    },
    about: { "@id": softwareId },
    breadcrumb: { "@id": breadcrumbId },
    primaryImageOfPage: undefined,
    keywords: [primaryKeyword, ...(page?.tags || [])].filter(Boolean).join(", "),
  };

  if (webPageCfg.parameterDescriptions) {
    webPage.additionalProperty = Object.entries(webPageCfg.parameterDescriptions).map(
      ([key, description]) => ({
        "@type": "PropertyValue",
        name: key,
        description,
      }),
    );
  }

  // Drop undefined keys for valid, compact JSON-LD
  if (webPage.primaryImageOfPage === undefined) delete webPage.primaryImageOfPage;

  return {
    "@context": "https://schema.org",
    "@graph": [softwareApplication, webPage, breadcrumbList],
  };
}
