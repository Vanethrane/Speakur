import dataset from "@/data/dataset.json";
import {
  buildProgrammaticJsonLd,
  getPageLanguageMeta,
  type ProgrammaticJsonLdGraph,
  type ProgrammaticSchemaInput,
} from "@/lib/dataset";
import { siteConfig } from "@/site.config";

type TitleGeneratorConfig = {
  maxLength: number;
  brand: string;
  brandSeparator: string;
  actionVerbs: Record<string, string[]>;
  templates: Record<string, string[]>;
};

type DatasetSchemaSlice = {
  titleGenerator?: TitleGeneratorConfig;
  faqPage?: FaqPageConfig;
  softwareApplication?: {
    offers?: { price?: string; priceCurrency?: string };
    featureList?: string[];
  };
  howTo?: {
    totalTime?: string;
    estimatedCost?: { currency?: string; value?: string };
    tool?: string;
    stepTemplates?: { name: string; text: string }[];
  };
  defaults?: { language?: string; accent?: string; inLanguage?: string };
};

type FaqTemplate = { question: string; answer: string };

type FaqPageConfig = {
  minQuestions: number;
  maxQuestions: number;
  categoryLabels: Record<string, string>;
  word: FaqTemplate[];
  guide: FaqTemplate[];
};

type DatasetPageSlice = {
  faq?: FaqTemplate[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqPageInput = ProgrammaticSchemaInput & {
  phonetic?: string;
  syllables?: number | null;
  readingMinutes?: number;
};

const schema = (dataset as { schema: DatasetSchemaSlice }).schema;
const titleCfg: TitleGeneratorConfig = schema.titleGenerator ?? {
  maxLength: 60,
  brand: "Speakur",
  brandSeparator: " · ",
  actionVerbs: {
    word: ["Instant Audio", "Try Free", "Hear Free"],
    guide: ["Try Free", "Free Guide"],
    site: ["Try Free"],
  },
  templates: {
    word: ["{name} · {hook} {yearShort}"],
    guide: ["{keyword} · {hook} {yearShort}"],
    site: ["{name} · {hook} {yearShort}"],
  },
};

export type SEOPageType = "word" | "guide" | "site" | "programmatic";

export type DynamicTitleInput = {
  slug?: string;
  pageType: SEOPageType;
  /** Primary display name (word, guide title, page name) */
  name: string;
  keyword?: string;
  phonetic?: string;
  syllables?: number | null;
  readingMinutes?: number;
  accent?: string;
  language?: string;
  /** Include brand suffix when room allows (default true) */
  includeBrand?: boolean;
};

export type DynamicTitleResult = {
  title: string;
  length: number;
  hook: string;
  spec: string;
  year: number;
  yearShort: string;
  truncated: boolean;
};

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h + seed.charCodeAt(i) * (i + 1)) % 9973;
  }
  return h;
}

function pickHook(pageType: SEOPageType, seed: string): string {
  const hooks =
    titleCfg.actionVerbs[pageType] ||
    titleCfg.actionVerbs.guide ||
    titleCfg.actionVerbs.site ||
    ["Try Free"];
  return hooks[hashSeed(seed || pageType) % hooks.length];
}

function formatPrice(): string {
  const price = schema.softwareApplication?.offers?.price;
  if (price === "0" || Number(price) === 0) return "Free";
  const currency = schema.softwareApplication?.offers?.priceCurrency || "USD";
  return currency === "USD" && price ? `$${price}` : "Free";
}

function formatAccents(accent?: string): string {
  if (!accent || accent === "neutral") return "US+UK";
  if (accent === "us" || accent === "us-uk") return "US+UK";
  if (accent === "uk") return "UK";
  if (accent === "multi") return "US+UK";
  return accent.toUpperCase().slice(0, 6);
}

function formatReadMin(minutes?: number): string {
  if (!minutes || minutes < 1) return "2";
  return String(Math.min(99, Math.round(minutes)));
}

function formatSpec(input: DynamicTitleInput): string {
  const parts: string[] = [];
  if (input.pageType === "word") {
    if (input.syllables && input.syllables > 0) {
      parts.push(`${input.syllables} syl`);
    }
    parts.push(formatAccents(input.accent));
  } else if (input.pageType === "guide" && input.readingMinutes) {
    parts.push(`${formatReadMin(input.readingMinutes)} min`);
  }
  const featureCount = schema.softwareApplication?.featureList?.length;
  if (featureCount && parts.length === 0) {
    parts.push(`${featureCount} tools`);
  }
  if (parts.length === 0) parts.push(formatPrice());
  return parts.join(" · ");
}

function shortenName(name: string, max: number): string {
  const trimmed = name.trim();
  if (trimmed.length <= max) return trimmed;
  if (max <= 3) return trimmed.slice(0, max);
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function applyTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

function buildVars(input: DynamicTitleInput, hook: string): Record<string, string> {
  const year = new Date().getFullYear();
  const keyword = (input.keyword || input.name).trim();
  return {
    name: input.name.trim(),
    keyword,
    hook,
    year: String(year),
    yearShort: `'${String(year).slice(-2)}`,
    price: formatPrice(),
    accents: formatAccents(input.accent),
    readMin: formatReadMin(input.readingMinutes),
    spec: formatSpec(input),
    brand: titleCfg.brand,
  };
}

function withBrand(core: string, includeBrand: boolean): string {
  if (!includeBrand) return core;
  const suffix = `${titleCfg.brandSeparator}${titleCfg.brand}`;
  const max = titleCfg.maxLength;
  if (`${core}${suffix}`.length <= max) return `${core}${suffix}`;
  return core;
}

function clampTitle(title: string): { title: string; truncated: boolean } {
  const max = titleCfg.maxLength;
  if (title.length <= max) return { title, truncated: false };
  const clipped = title.slice(0, max).trimEnd();
  const lastSep = Math.max(clipped.lastIndexOf(" · "), clipped.lastIndexOf(" - "));
  if (lastSep > max * 0.55) {
    return { title: clipped.slice(0, lastSep).trimEnd(), truncated: true };
  }
  return { title: clipped.replace(/\s+\S*$/, "").trimEnd() || clipped, truncated: true };
}

/**
 * Build a high-CTR `<title>` under 60 characters using dataset.json variables.
 * Tries multiple templates (hooks, year, specs) and keeps the richest that fits.
 */
export function buildDynamicTitle(input: DynamicTitleInput): DynamicTitleResult {
  const page = input.slug ? getPageLanguageMeta(input.slug) : null;
  const merged: DynamicTitleInput = {
    ...input,
    name: page?.name?.trim() || input.name.trim(),
    keyword: page?.primaryKeyword?.trim() || input.keyword?.trim() || input.name.trim(),
    accent: input.accent || page?.accent,
    language: input.language || page?.language,
  };

  const seed = input.slug || merged.name || merged.pageType;
  const hook = pickHook(merged.pageType, seed);
  const vars = buildVars(merged, hook);
  const templates =
    titleCfg.templates[merged.pageType] ||
    titleCfg.templates.guide ||
    titleCfg.templates.site ||
    ["{keyword} · {hook} {yearShort}"];

  const includeBrand = input.includeBrand !== false;
  let best = "";
  let truncated = false;

  for (const template of templates) {
    let core = applyTemplate(template, vars).replace(/\s+/g, " ").trim();
    core = core.replace(/\s·\s·/g, " · ").replace(/^\s·\s|\s·\s$/g, "").trim();
    const candidate = withBrand(core, includeBrand);
    const clamped = clampTitle(candidate);
    if (clamped.title.length > best.length && clamped.title.length <= titleCfg.maxLength) {
      best = clamped.title;
      truncated = clamped.truncated;
    }
    if (best.length >= titleCfg.maxLength - 3) break;
  }

  if (!best) {
    const fallbackCore = shortenName(
      `${merged.keyword} · ${hook}`,
      titleCfg.maxLength - (includeBrand ? titleCfg.brandSeparator.length + titleCfg.brand.length : 0),
    );
    const clamped = clampTitle(withBrand(fallbackCore, includeBrand));
    best = clamped.title;
    truncated = clamped.truncated;
  }

  if (best.length > titleCfg.maxLength) {
    best = best.slice(0, titleCfg.maxLength).trimEnd();
    truncated = true;
  }

  const year = new Date().getFullYear();
  return {
    title: best,
    length: best.length,
    hook,
    spec: vars.spec,
    year,
    yearShort: vars.yearShort,
    truncated,
  };
}

/** Next.js Metadata title object — absolute to bypass layout template overflow. */
export function dynamicTitleMetadata(input: DynamicTitleInput) {
  const { title } = buildDynamicTitle(input);
  return { absolute: title } as const;
}

export function getTitleGeneratorConfig(): TitleGeneratorConfig {
  return titleCfg;
}

export function assertTitleLength(title: string): boolean {
  return title.length <= titleCfg.maxLength;
}

function absolutePageUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const base = siteConfig.domain.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function interpolateFaqTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template
    .replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function faqPriceLabel(): string {
  const price = schema.softwareApplication?.offers?.price;
  return price === "0" || Number(price) === 0 ? "free" : "affordable";
}

function buildFaqVars(input: FaqPageInput): Record<string, string> {
  const page = input.slug ? getPageLanguageMeta(input.slug) : null;
  const faqCfg = schema.faqPage;
  const name = page?.name?.trim() || input.name.trim();
  const primaryKeyword = page?.primaryKeyword?.trim() || name;
  const parentCategory = page?.parentCategory || "learning-teaching";
  const parentCategoryLabel =
    faqCfg?.categoryLabels?.[parentCategory] ||
    parentCategory.replace(/-/g, " ");
  const url = absolutePageUrl(input.path);
  const year = String(new Date().getFullYear());
  const phonetic = input.phonetic?.trim();
  const phoneticSuffix = phonetic ? ` (${phonetic})` : "";
  const syllableSuffix =
    input.syllables && input.syllables > 0
      ? ` across ${input.syllables} syllables`
      : "";

  return {
    name,
    primaryKeyword,
    url,
    year,
    language: page?.language || schema.defaults?.language || "English",
    accent: page?.accent || "neutral",
    parentCategory,
    parentCategoryLabel,
    priceLabel: faqPriceLabel(),
    phoneticSuffix,
    syllableSuffix,
    readMin: input.readingMinutes ? String(input.readingMinutes) : "5",
  };
}

/**
 * Resolve 2–3 FAQ items for a route — page-specific `faq` in dataset.json first,
 * then schema templates for word/guide programmatic pages.
 */
export function buildFaqItems(input: FaqPageInput): FaqItem[] {
  const faqCfg = schema.faqPage;
  if (!faqCfg) return [];

  const pageData = input.slug
    ? ((dataset as { pages: Record<string, DatasetPageSlice> }).pages[input.slug]?.faq ??
      null)
    : null;

  const vars = buildFaqVars(input);
  const maxQ = faqCfg.maxQuestions ?? 3;

  let source: FaqTemplate[] = [];
  if (pageData?.length) {
    source = pageData;
  } else {
    const pageType = input.pageType || (input.slug ? "guide" : "word");
    source =
      pageType === "word"
        ? faqCfg.word || []
        : pageType === "guide" || pageType === "programmatic"
          ? faqCfg.guide || []
          : [];
  }

  const items = source
    .slice(0, maxQ)
    .map((tpl) => ({
      question: interpolateFaqTemplate(tpl.question, vars),
      answer: interpolateFaqTemplate(tpl.answer, vars),
    }))
    .filter((item) => item.question.length > 0 && item.answer.length > 40);

  return items.slice(0, maxQ);
}

/** Valid schema.org FAQPage node for Google Rich Results. */
export function buildFaqPageNode(
  input: FaqPageInput,
): Record<string, unknown> | null {
  const items = buildFaqItems(input);
  const faqCfg = schema.faqPage;
  const minQ = faqCfg?.minQuestions ?? 2;
  if (items.length < minQ) return null;

  const url = absolutePageUrl(input.path);

  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    url,
    inLanguage: getPageLanguageMeta(input.slug || "")?.inLanguage || "en",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** Valid schema.org HowTo node for “how to pronounce” rich results. */
export function buildHowToNode(
  input: FaqPageInput,
): Record<string, unknown> | null {
  const howTo = schema.howTo;
  const steps = howTo?.stepTemplates;
  if (!steps?.length) return null;

  const url = absolutePageUrl(input.path);
  const name = input.name.trim();
  const vars: Record<string, string> = {
    name,
    word: name,
    url,
    phonetic: input.phonetic || "",
    path: input.path,
  };

  const howToName =
    input.pageType === "guide"
      ? `How to follow “${name}” on Speakur`
      : `How to pronounce ${name}`;

  return {
    "@type": "HowTo",
    "@id": `${url}#howto`,
    name: howToName,
    description:
      input.description ||
      `Step-by-step guide to pronounce “${name}” with free audio and IPA on Speakur.`,
    totalTime: howTo.totalTime || "PT2M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: howTo.estimatedCost?.currency || "USD",
      value: howTo.estimatedCost?.value || "0",
    },
    tool: [
      {
        "@type": "HowToTool",
        name: howTo.tool || "Speakur pronunciation search",
      },
    ],
    step: steps.map((tpl, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: interpolateFaqTemplate(tpl.name, vars),
      text: interpolateFaqTemplate(tpl.text, vars),
      url: `${url}#step-${index + 1}`,
    })),
  };
}

/** Merge SoftwareApplication, WebPage, BreadcrumbList, FAQPage, and HowTo into one @graph. */
export function buildCombinedJsonLd(input: FaqPageInput): ProgrammaticJsonLdGraph {
  const graph = buildProgrammaticJsonLd(input);
  const faqNode = buildFaqPageNode(input);
  const howToNode = buildHowToNode(input);
  const extras: Record<string, unknown>[] = [];

  const webPage = graph["@graph"].find(
    (node) => (node as { "@type"?: string })["@type"] === "WebPage",
  ) as Record<string, unknown> | undefined;

  if (faqNode) {
    if (webPage) {
      const parts = webPage.hasPart;
      webPage.hasPart = parts
        ? Array.isArray(parts)
          ? [...parts, { "@id": faqNode["@id"] }]
          : [parts, { "@id": faqNode["@id"] }]
        : { "@id": faqNode["@id"] };
    }
    extras.push(faqNode);
  }

  if (howToNode) {
    if (webPage) {
      webPage.mainEntity = { "@id": howToNode["@id"] };
    }
    extras.push(howToNode);
  }

  if (!extras.length) return graph;

  return {
    ...graph,
    "@graph": [...graph["@graph"], ...extras],
  };
}

export type SEOHeadProps = FaqPageInput;

/**
 * Server-rendered JSON-LD for dynamic routes: titles via SEOHead helpers,
 * plus FAQPage and HowTo for rich results when dataset templates exist.
 */
export function SEOHead(props: SEOHeadProps) {
  const graph = buildCombinedJsonLd(props);
  const json = JSON.stringify(graph);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export default SEOHead;
