/**
 * Bulk-patch static HTML for Core Web Vitals:
 * - inline critical CSS
 * - async Google Fonts (font-display: swap already in URL)
 * - reserved ad slot min-heights
 * - defer all client scripts
 * - stable min-heights on interactive regions
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";

const ROOT = join(fileURLToPath(import.meta.url), "../..");
const CRITICAL = readFileSync(join(ROOT, "assets/critical.css"), "utf8");
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Outfit:wght@400;500;600&display=swap";

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "out",
  "public",
  "src",
  "data",
  "scripts",
]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

function assetPrefix(filePath) {
  const rel = relative(ROOT, filePath).replace(/\\/g, "/");
  const depth = rel.split("/").length - 1;
  if (rel === "404.html") return "/assets/";
  return depth === 0 ? "./assets/" : "../".repeat(depth) + "assets/";
}

function asyncFonts(html) {
  // Remove blocking Google Fonts stylesheet links
  let next = html.replace(
    /<link[^>]*fonts\.googleapis\.com\/css2[^>]*>\s*/gi,
    "",
  );
  if (next.includes(`media="print" onload="this.media='all'"`) && next.includes(FONT_HREF)) {
    return next;
  }
  const fontBlock = `  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="style" href="${FONT_HREF}" />
  <link rel="stylesheet" href="${FONT_HREF}" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="${FONT_HREF}" /></noscript>
`;
  // Drop duplicate preconnects then inject once after charset/viewport block
  next = next.replace(
    /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com"\s*\/?>\s*/gi,
    "",
  );
  next = next.replace(
    /<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com"[^>]*>\s*/gi,
    "",
  );
  if (next.includes("<style>") && next.includes("--ad-banner-h")) {
    return next.replace(/<\/style>\s*/, `</style>\n${fontBlock}`);
  }
  return next.replace(/<\/title>\s*/, `</title>\n${fontBlock}`);
}

function inlineCritical(html) {
  if (html.includes("--ad-banner-h") && html.includes("<style>")) {
    // Already has critical-ish CSS; ensure banner vars exist
    if (!html.includes("--ad-banner-h")) {
      return html.replace("<style>", `<style>\n${CRITICAL}\n`);
    }
    return html;
  }
  // Prefer injecting right after description or title
  const styleTag = `  <style>${CRITICAL}</style>\n`;
  if (/<meta name="description"[^>]*>/i.test(html)) {
    return html.replace(/(<meta name="description"[^>]*>\s*)/i, `$1${styleTag}`);
  }
  return html.replace(/<\/title>\s*/i, `</title>\n${styleTag}`);
}

function ensureAdSlots(html) {
  let next = html;
  if (!next.includes('id="speakur-ad-top"')) {
    next = next.replace(
      /<\/header>\s*/i,
      `</header>
    <div id="speakur-ad-top" class="ad-slot ad-slot-top stable-slot" aria-label="Advertisement" style="min-height:60px"></div>
`,
    );
  } else {
    next = next.replace(
      /id="speakur-ad-top"([^>]*)>/i,
      (m, attrs) => {
        if (/min-height/i.test(attrs) || /min-height/i.test(m)) return m;
        return `id="speakur-ad-top"${attrs} style="min-height:60px">`;
      },
    );
  }
  if (!next.includes('id="speakur-ad-bottom"')) {
    next = next.replace(
      /<footer\b/i,
      `<div id="speakur-ad-bottom" class="ad-slot ad-slot-bottom stable-slot" aria-label="Advertisement" style="min-height:90px"></div>
    <footer`,
    );
  }
  return next;
}

function deferScripts(html) {
  return html.replace(/<script\b([^>]*)>/gi, (full, attrs) => {
    const a = attrs || "";
    if (/type\s*=\s*["']application\/ld\+json["']/i.test(a)) return full;
    if (/type\s*=\s*["']application\/json["']/i.test(a)) return full;
    if (/\bdefer\b/i.test(a) || /\basync\b/i.test(a)) return full;
    // Inline scripts without src cannot be deferred — leave (callers should externalize)
    if (!/\bsrc\s*=/i.test(a)) return full;
    return `<script defer${a}>`;
  });
}

function stableInteractive(html) {
  let next = html;
  next = next.replace(
    /class="search-wrap"/g,
    'class="search-wrap search-slot stable-slot" style="min-height:4.25rem"',
  );
  next = next.replace(
    /class="word-card"/g,
    'class="word-card word-result-slot stable-slot" style="min-height:18rem"',
  );
  next = next.replace(
    /class="plays"/g,
    'class="plays interactive-slot" style="min-height:2.75rem"',
  );
  next = next.replace(
    /class="related"/g,
    'class="related related-grid-slot stable-slot" style="min-height:8rem"',
  );
  return next;
}

function linkSiteCss(html, prefix) {
  // Ensure site.css is present (non-critical, can load after)
  if (html.includes("site.css")) return html;
  return html.replace(
    /<\/head>/i,
    `  <link rel="stylesheet" href="${prefix}site.css" />\n</head>`,
  );
}

function patchFile(filePath) {
  const original = readFileSync(filePath, "utf8");
  let html = original;
  const prefix = assetPrefix(filePath);

  html = inlineCritical(html);
  html = asyncFonts(html);
  html = ensureAdSlots(html);
  html = deferScripts(html);
  html = stableInteractive(html);
  html = linkSiteCss(html, prefix);

  // Top-level pages: ensure site.js is deferred (already handled) and present
  if (!html.includes("site.js") && !filePath.endsWith("404.html")) {
    // skip — some pages may intentionally omit
  }

  if (html === original) return false;
  writeFileSync(filePath, html);
  return true;
}

const files = walk(ROOT);
let changed = 0;
for (const f of files) {
  if (patchFile(f)) changed += 1;
}
console.log(`CWV patch: updated ${changed} / ${files.length} HTML files`);
