import dataset from "@/data/dataset.json";
import { siteConfig } from "@/site.config";

export type PageLanguageMeta = {
  language: string;
  accent: string;
  name?: string;
  applicationCategory?: string;
  inLanguage?: string;
};

export type ToolAffiliate = {
  id: string;
  label: string;
  title: string;
  description: string;
  href: string;
  cta: string;
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
  };
  howTo: {
    totalTime: string;
    estimatedCost: { currency: string; value: string };
    tool: string;
    stepTemplates: HowToStepTemplate[];
  };
  defaults: {
    language: string;
    accent: string;
    inLanguage: string;
  };
};

type DatasetFile = {
  version: number;
  schema: DatasetSchema;
  pages: Record<string, PageLanguageMeta>;
  toolAffiliates: Record<string, ToolAffiliate>;
};

const data = dataset as DatasetFile;

/** Read language/accent metadata for a guide (or other) slug from dataset.json */
export function getPageLanguageMeta(slug: string): PageLanguageMeta | null {
  return data.pages[slug] ?? null;
}

export function getDatasetSchema(): DatasetSchema {
  return data.schema;
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

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

export type ProgrammaticSchemaInput = {
  /** dataset.json page key when available (guide slug, etc.) */
  slug?: string;
  /** Word or phrase name — becomes Schema.org name */
  name: string;
  description: string;
  /** Absolute or site-relative canonical path */
  path: string;
  pageType?: "word" | "guide" | "programmatic";
};

export type ProgrammaticJsonLd = {
  softwareApplication: Record<string, unknown>;
  howTo: Record<string, unknown>;
};

/** Build SoftwareApplication + HowTo graphs from dataset.json + page variables */
export function buildProgrammaticJsonLd(input: ProgrammaticSchemaInput): ProgrammaticJsonLd {
  const schema = data.schema;
  const page = input.slug ? data.pages[input.slug] : undefined;
  const name = page?.name?.trim() || input.name.trim();
  const applicationCategory =
    page?.applicationCategory || schema.softwareApplication.applicationCategory;
  const inLanguage = page?.inLanguage || schema.defaults.inLanguage;
  const language = page?.language || schema.defaults.language;
  const accent = page?.accent || schema.defaults.accent;
  const url = input.path.startsWith("http")
    ? input.path
    : `${siteConfig.domain.replace(/\/$/, "")}${input.path.startsWith("/") ? input.path : `/${input.path}`}`;

  const vars = { name, url, language, accent };

  const softwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description: input.description,
    url,
    applicationCategory,
    applicationSubCategory: schema.softwareApplication.applicationSubCategory,
    operatingSystem: schema.softwareApplication.operatingSystem,
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
    keywords: [name, language, accent, "pronunciation", "IPA"].filter(Boolean).join(", "),
  };

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to pronounce ${name}`,
    description: input.description,
    totalTime: schema.howTo.totalTime,
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: schema.howTo.estimatedCost.currency,
      value: schema.howTo.estimatedCost.value,
    },
    tool: {
      "@type": "HowToTool",
      name: schema.howTo.tool,
    },
    inLanguage,
    step: schema.howTo.stepTemplates.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: fillTemplate(step.name, vars),
      text: fillTemplate(step.text, vars),
      url,
    })),
  };

  return { softwareApplication, howTo };
}
