/**
 * Inject manifest, theme-color, and pwa-install.js into static HTML files.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");

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

const PWA_HEAD = `  <link rel="manifest" href="/manifest.json" />
  <link rel="icon" href="/assets/icon.svg" type="image/svg+xml" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <meta name="theme-color" content="#0d6e66" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Speakur" />
`;

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

function injectHead(html) {
  let out = html;
  if (!out.includes('rel="manifest"')) {
    out = out.replace(/<meta name="viewport"[^>]*>\s*/i, (m) => `${m}${PWA_HEAD}`);
  } else {
    if (!out.includes('rel="icon"')) {
      out = out.replace(
        /<link rel="manifest"[^>]*>/,
        (m) =>
          `${m}\n  <link rel="icon" href="/assets/icon.svg" type="image/svg+xml" />\n  <link rel="icon" href="/favicon.ico" sizes="any" />\n  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />`,
      );
    } else if (!out.includes("favicon.ico")) {
      out = out.replace(
        /<link rel="icon" href="\/assets\/icon\.svg"[^>]*>/,
        (m) =>
          `${m}\n  <link rel="icon" href="/favicon.ico" sizes="any" />\n  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />`,
      );
    } else if (!out.includes("apple-touch-icon")) {
      out = out.replace(
        /<link rel="icon" href="\/favicon\.ico"[^>]*>/,
        (m) => `${m}\n  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />`,
      );
    }
  }
  return out;
}

function injectScript(html, prefix) {
  if (html.includes("pwa-install.js")) return html;
  const tag = `  <script defer src="${prefix}pwa-install.js"></script>\n`;
  return html.replace(/<\/body>/i, `${tag}</body>`);
}

function patchFile(filePath) {
  const original = readFileSync(filePath, "utf8");
  const prefix = assetPrefix(filePath);
  let html = injectHead(original);
  html = injectScript(html, prefix);
  if (html === original) return false;
  writeFileSync(filePath, html);
  return true;
}

const files = walk(ROOT);
let changed = 0;
for (const file of files) {
  if (patchFile(file)) changed += 1;
}
console.log(`PWA patch: updated ${changed} / ${files.length} HTML files`);
