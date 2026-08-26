/**
 * Turn markdown-style [label](url) into React nodes or HTML.
 * Absolute Speakur paths work on both Next (/guides/…) and static hosts.
 */

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

export function linkifyToHtml(text: string): string {
  const escaped = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  return escaped.replace(LINK_RE, (_m, label, href) => {
    const safeHref = String(href).replace(/"/g, "");
    return `<a href="${safeHref}">${label}</a>`;
  });
}

export function splitLinkParts(text: string): Array<{ type: "text" | "link"; value: string; href?: string }> {
  const parts: Array<{ type: "text" | "link"; value: string; href?: string }> = [];
  let last = 0;
  const re = new RegExp(LINK_RE.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ type: "text", value: text.slice(last, m.index) });
    parts.push({ type: "link", value: m[1], href: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return parts.length ? parts : [{ type: "text", value: text }];
}
