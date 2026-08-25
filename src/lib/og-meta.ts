import type { Metadata } from "next";
import dataset from "@/data/dataset.json";
import { buildDynamicTitle } from "@/components/SEOHead";
import { getPageLanguageMeta } from "@/lib/dataset";import { siteConfig } from "@/site.config";

type SocialCardConfig = {
  width: number;
  height: number;
  brandName: string;
  tagline: string;
  background: string;
  surface: string;
  accent: string;
  ink: string;
  muted: string;
  twitterCard: "summary" | "summary_large_image" | "app" | "player";
  endpointPath: string;
};

const socialCard = ((dataset as { schema?: { socialCard?: SocialCardConfig } }).schema
  ?.socialCard || {
  width: 1200,
  height: 630,
  brandName: "Speakur",
  tagline: "Hear how any word is pronounced",
  background: "#0a524c",
  surface: "#0d6e66",
  accent: "#e8f4f2",
  ink: "#fffaf3",
  muted: "#b7d4cf",
  twitterCard: "summary_large_image",
  endpointPath: "/og",
}) as SocialCardConfig;

export function getSocialCardConfig(): SocialCardConfig {
  return socialCard;
}

export type OgMetaInput = {
  /** dataset.json page key when available */
  slug?: string;
  title: string;
  description: string;
  path: string;
  pageType?: "guide" | "word" | "programmatic" | "site";
  publishedAt?: string;
  phonetic?: string;
  syllables?: number | null;
  readingMinutes?: number;
  accent?: string;
  language?: string;
};

function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const base = siteConfig.domain.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Dynamic OG image URL — overlays keyword/title on the branded social card */
export function buildOgImageUrl(input: {
  title: string;
  keyword?: string;
  eyebrow?: string;
  slug?: string;
}): string {
  const params = new URLSearchParams();
  params.set("title", input.title.slice(0, 140));
  if (input.keyword) params.set("keyword", input.keyword.slice(0, 80));
  if (input.eyebrow) params.set("eyebrow", input.eyebrow.slice(0, 60));
  if (input.slug) params.set("slug", input.slug);
  return absoluteUrl(`${socialCard.endpointPath}?${params.toString()}`);
}

/**
 * Server-side Open Graph + Twitter metadata from dataset.json parameters.
 */
export function buildProgrammaticSocialMetadata(input: OgMetaInput): Metadata {
  const page = input.slug ? getPageLanguageMeta(input.slug) : null;
  const pageType = input.pageType || (input.slug ? "guide" : "word");
  const displayName = page?.name || input.title;

  const dynamic = buildDynamicTitle({
    slug: input.slug,
    pageType: pageType === "programmatic" ? "guide" : pageType,
    name: displayName,
    keyword: page?.primaryKeyword || input.title,
    phonetic: input.phonetic,
    syllables: input.syllables,
    readingMinutes: input.readingMinutes,
    accent: input.accent || page?.accent,
    language: input.language || page?.language,
  });

  const title = dynamic.title;
  const description = input.description;
  const keyword = page?.primaryKeyword || displayName;
  const eyebrow =
    page?.parentCategory?.replace(/-/g, " ") ||
    (input.pageType === "word" ? "Pronunciation" : "Guide");

  const ogImage = buildOgImageUrl({
    title: displayName,
    keyword,
    eyebrow,
    slug: input.slug,
  });

  const canonical = absoluteUrl(input.path);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: input.path },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: socialCard.brandName,
      locale: page?.inLanguage === "en" ? "en_US" : page?.inLanguage || "en_US",
      type: input.pageType === "guide" ? "article" : "website",
      ...(input.publishedAt ? { publishedTime: input.publishedAt } : {}),
      images: [
        {
          url: ogImage,
          width: socialCard.width,
          height: socialCard.height,
          alt: `${keyword} — ${socialCard.brandName}`,
        },
      ],
    },
    twitter: {
      card: socialCard.twitterCard,
      title,
      description,
      images: [ogImage],
    },
  };
}
