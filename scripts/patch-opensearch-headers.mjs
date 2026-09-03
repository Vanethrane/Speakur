/**
 * Patch OpenSearch <link> + ensure header search scripts on static HTML.
 * Skips node_modules / .git / huge regenerated trees unless --all.
 *
 * Usage:
 *   node scripts/patch-opensearch-headers.mjs
 *   node scripts/patch-opensearch-headers.mjs --all
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ALL = process.argv.includes("--all");
const SKIP = new Set(["node_modules", ".git", ".next", "out", "public", "src", "data", "scripts", "client", "server"]);
const CATEGORY_DIRS = new Set([
  "food", "places", "names", "brands", "medical", "animals", "science",
  "business", "everyday", "arts", "sports", "tech", "nature", "law", "mythology", "words",
]);

const OPENSEARCH_LINK =
  '<link rel="search" type="application/opensearchdescription+xml" title="Speakur" href="/opensearch.xml" />';

function walk(dir, out = [], depth = 0) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    if (!ALL && depth === 0 && CATEGORY_DIRS.has(name)) continue;
    const p = join(dir, name);
    try {
      if (statSync(p).isDirectory()) walk(p, out, depth + 1);
      else if (name.endsWith(".html")) out.push(p);
    } catch {
      /* skip */
    }
  }
  return out;
}

function assetPrefix(html) {
  const m = html.match(/<script defer src="([^"]*?)site\.js"><\/script>/);
  if (m) return m[1].replace(/site\.js$/, "");
  const brand = html.match(/<a class="brand" href="([^"]+)">Speakur<\/a>/);
  if (!brand) return "/assets/";
  const home = brand[1].replace(/index\.html$/, "");
  if (home.startsWith("/")) return "/assets/";
  return `${home}assets/`;
}

function patch(html) {
  let next = html;
  if (!next.includes('type="application/opensearchdescription+xml"')) {
    if (/<\/head>/i.test(next)) {
      next = next.replace(/<\/head>/i, `  ${OPENSEARCH_LINK}\n</head>`);
    }
  }

  const prefix = assetPrefix(next);
  if (!next.includes("header-search.js")) {
    if (next.includes("search-index.js")) {
      next = next.replace(
        /(<script defer src="[^"]*search-index\.js"><\/script>)/,
        `$1\n  <script defer src="${prefix}header-search.js"></script>`,
      );
    } else if (next.includes("site.js")) {
      next = next.replace(
        /(<script defer src="[^"]*site\.js"><\/script>)/,
        `<script defer src="${prefix}search-index.js"></script>\n  <script defer src="${prefix}header-search.js"></script>\n  $1`,
      );
    }
  }

  // Ensure header search form exists when site-header is present
  if (next.includes("site-header") && !next.includes("speakur-header-q")) {
    next = next.replace(
      /(<header class="site-header">[\s\S]*?<\/div>\s*)(<\/header>)/i,
      `$1<form id="speakur-header-form" class="header-search" role="search" autocomplete="off">
        <label class="sr-only" for="speakur-header-q">Search guides, tools, and words</label>
        <input id="speakur-header-q" type="search" placeholder="Search guides, tools, words…" spellcheck="false" />
        <button type="submit" aria-label="Search">Go</button>
        <ul id="speakur-header-results" class="header-search-results" role="listbox" hidden></ul>
      </form>
    $2`,
    );
  }

  return next;
}

const files = walk(ROOT);
let changed = 0;
for (const file of files) {
  const original = readFileSync(file, "utf8");
  const next = patch(original);
  if (next !== original) {
    writeFileSync(file, next);
    changed += 1;
  }
}
console.log(`Patched OpenSearch/header search on ${changed}/${files.length} HTML files (all=${ALL})`);
