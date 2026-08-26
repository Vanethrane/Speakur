import type { MetadataRoute } from "next";
import { ALL_GUIDES } from "@/content/guides";
import { sitemapChunkCount } from "@/lib/words";

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakur.com").replace(/\/$/, "");
}

/** Sitemap index: core pages, guides, trust pages, and chunked word sitemaps. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  const chunks = sitemapChunkCount();

  const staticRoutes = ["", "/guides", "/about", "/contact", "/donate", "/privacy", "/terms"];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/guides" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  for (const guide of ALL_GUIDES) {
    entries.push({
      url: `${base}/guides/${guide.slug}`,
      lastModified: new Date(guide.publishedAt),
      changeFrequency: "monthly",
      priority: 0.75,
    });
  }

  for (let i = 0; i < chunks; i += 1) {
    entries.push({
      url: `${base}/sitemaps/${i + 1}.xml`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  return entries;
}
