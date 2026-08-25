/** Add header search bar + scripts to static HTML pages missing it. */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP = new Set(["node_modules", ".git", ".next", "out", "public", "src", "data", "scripts"]);

const SEARCH_FORM = (home) => `
      <form id="speakur-header-form" class="header-search" role="search" autocomplete="off">
        <label class="sr-only" for="speakur-header-q">Search guides, tools, and words</label>
        <input id="speakur-header-q" type="search" placeholder="Search guides, tools, words…" spellcheck="false" />
        <button type="submit" aria-label="Search">Go</button>
        <ul id="speakur-header-results" class="header-search-results" role="listbox" hidden></ul>
      </form>`;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    try {
      if (statSync(p).isDirectory()) walk(p, out);
      else if (name.endsWith(".html")) out.push(p);
    } catch {
      /* skip */
    }
  }
  return out;
}

function assetPrefixFromHome(home) {
  if (home.startsWith("/")) return "/assets/";
  return `${home}assets/`;
}

function patchHeader(html) {
  if (html.includes("speakur-header-q")) return html;

  const headerRe =
    /<header(\s[^>]*)?>\s*<a class="brand" href="([^"]+)">Speakur<\/a>\s*<nav aria-label="Primary">([\s\S]*?)<\/nav>\s*<\/header>/i;

  let next = html.replace(headerRe, (_m, attrs, home, navInner) => {
    const cls = attrs && /class=/.test(attrs) ? attrs : ' class="site-header"';
    return `<header${cls}>
      <div class="header-row">
        <a class="brand" href="${home}">Speakur</a>
        <nav aria-label="Primary">${navInner}</nav>
      </div>${SEARCH_FORM(home.replace(/index\.html$/, ""))}
    </header>`;
  });

  return next;
}

function patchScripts(html, assetPrefix) {
  let next = html;
  if (!next.includes("search-index.js")) {
    next = next.replace(
      /(<script defer src="[^"]*ad-config\.js"><\/script>)/,
      `<script defer src="${assetPrefix}search-index.js"></script>\n  <script defer src="${assetPrefix}header-search.js"></script>\n  $1`,
    );
    if (!next.includes("search-index.js")) {
      next = next.replace(
        /(<script defer src="[^"]*site\.js"><\/script>)/,
        `<script defer src="${assetPrefix}search-index.js"></script>\n  <script defer src="${assetPrefix}header-search.js"></script>\n  $1`,
      );
    }
  }
  return next;
}

let changed = 0;
for (const file of walk(ROOT)) {
  try {
    const original = readFileSync(file, "utf8");
    let html = patchHeader(original);
    if (html === original) continue;

    const homeMatch = html.match(/<a class="brand" href="([^"]+)">Speakur<\/a>/);
    const home = homeMatch ? homeMatch[1] : "./index.html";
    const assetPrefix = assetPrefixFromHome(home.replace(/index\.html$/, ""));
    html = patchScripts(html, assetPrefix);

    if (html !== original) {
      writeFileSync(file, html);
      changed++;
    }
  } catch {
    /* skip locked */
  }
}
console.log(`Header search patched on ${changed} HTML files`);
