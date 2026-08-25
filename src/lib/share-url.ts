import { siteConfig } from "@/site.config";

export type ShareKind = "pronunciation" | "guide" | "tool";

export type SharePayload = {
  title: string;
  path: string;
  kind?: ShareKind;
  phonetic?: string | null;
  detail?: string;
  audioPreview?: string;
};

/** Canonical absolute URL for sharing (short path under domain root). */
export function buildShareUrl(path: string): string {
  const base = siteConfig.domain.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** Compact link shown in UI — omits protocol for readability. */
export function formatShortLink(path: string): string {
  const url = buildShareUrl(path);
  return url.replace(/^https?:\/\//i, "");
}

/** Forum-friendly one-liner for Discord, Reddit, Slack, etc. */
export function buildForumShareText(payload: SharePayload): string {
  const url = buildShareUrl(payload.path);
  const short = formatShortLink(payload.path);
  const parts: string[] = [];

  if (payload.kind === "pronunciation") {
    parts.push(`**${payload.title}**`);
    if (payload.phonetic) parts.push(payload.phonetic);
    if (payload.detail) parts.push(payload.detail);
    parts.push(`Hear free US & UK audio → ${url}`);
    return parts.join(" · ");
  }

  parts.push(`**${payload.title}**`);
  if (payload.detail) parts.push(payload.detail);
  parts.push(short);
  return parts.join(" · ");
}

export function shareCardFilename(payload: SharePayload): string {
  const slug = payload.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `speakur-${slug || "result"}.png`;
}
