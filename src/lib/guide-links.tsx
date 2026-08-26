export type GuideLinkPart = {
  type: "text" | "link";
  value: string;
  href?: string;
};

/** Split `[label](/path)` markdown into typed parts for React rendering. */
export function splitLinkParts(text: string): GuideLinkPart[] {
  const parts: GuideLinkPart[] = [];
  const re = /\[([^\]]+)\]\((\/[^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    if (match.index > last) {
      parts.push({ type: "text", value: text.slice(last, match.index) });
    }
    parts.push({ type: "link", value: match[1], href: match[2] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  if (parts.length === 0) parts.push({ type: "text", value: text });
  return parts;
}

/** Escape HTML then turn markdown links into anchors (static pages). */
export function linkifyGuideHtml(text: string): string {
  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const parts = splitLinkParts(text);
  return parts
    .map((part) => {
      if (part.type === "link" && part.href?.startsWith("/")) {
        return `<a href="${escape(part.href)}">${escape(part.value)}</a>`;
      }
      return escape(part.value);
    })
    .join("");
}
