import { wordsForSitemapChunk, sitemapChunkCount } from "@/lib/words";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://speakur.com").replace(/\/$/, "");
}

export const revalidate = false;

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const match = /^(\d+)\.xml$/.exec(id);
  if (!match) {
    return new Response("Not found", { status: 404 });
  }

  const chunkNumber = Number(match[1]);
  const total = sitemapChunkCount();
  if (chunkNumber < 1 || chunkNumber > total) {
    return new Response("Not found", { status: 404 });
  }

  const base = siteUrl();
  const words = wordsForSitemapChunk(chunkNumber - 1);
  const urls = words
    .map(
      (word) => `  <url>
    <loc>${base}/w/${encodeURIComponent(word)}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
