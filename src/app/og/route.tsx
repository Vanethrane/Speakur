import { ImageResponse } from "next/og";
import { getPageLanguageMeta } from "@/lib/dataset";
import { getSocialCardConfig } from "@/lib/og-meta";

export const runtime = "edge";

/**
 * Dynamic social card image.
 * GET /og?title=...&keyword=...&eyebrow=...&slug=...
 * Overlays the page’s core keyword/title on the Speakur branded template.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || undefined;
  const page = slug ? getPageLanguageMeta(slug) : null;

  const title =
    searchParams.get("title") ||
    page?.name ||
    page?.primaryKeyword ||
    "Speakur";
  const keyword =
    searchParams.get("keyword") || page?.primaryKeyword || title;
  const eyebrow =
    searchParams.get("eyebrow") ||
    page?.parentCategory?.replace(/-/g, " ") ||
    page?.language ||
    "Pronunciation";

  const card = getSocialCardConfig();
  const displayTitle = title.length > 90 ? `${title.slice(0, 87)}…` : title;
  const displayKeyword =
    keyword.length > 64 ? `${keyword.slice(0, 61)}…` : keyword;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: `linear-gradient(145deg, ${card.background} 0%, ${card.surface} 55%, #084640 100%)`,
          color: card.ink,
          fontFamily: "Georgia, Times New Roman, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: card.accent,
            }}
          />
          <div
            style={{
              fontSize: 28,
              letterSpacing: "-0.02em",
              fontWeight: 600,
            }}
          >
            {card.brandName}
          </div>
          <div
            style={{
              marginLeft: 12,
              fontSize: 20,
              color: card.muted,
              fontFamily: "system-ui, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 22,
              color: card.accent,
              fontFamily: "system-ui, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
            }}
          >
            {displayKeyword}
          </div>
          <div
            style={{
              fontSize: displayTitle.length > 48 ? 54 : 64,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              fontWeight: 600,
              maxWidth: 980,
            }}
          >
            {displayTitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: 22, color: card.muted }}>{card.tagline}</div>
          <div style={{ fontSize: 22, color: card.accent }}>speakur.com</div>
        </div>
      </div>
    ),
    {
      width: card.width,
      height: card.height,
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    },
  );
}
