/**
 * Inject cross-link "Explore more" blocks across static HTML that lack them.
 *
 * - All category word pages (slug/word/index.html)
 * - Category hubs
 * - words/index.html
 * - Core trust/marketing pages
 *
 * Usage: node scripts/patch-cross-links.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { renderExploreMoreHtml, CATEGORY_GUIDE_LINKS } from "./lib/word-html.mjs";

const ROOT = process.cwd();
const HUBS = Object.keys(CATEGORY_GUIDE_LINKS);

function writeRetry(path, body) {
  for (let i = 1; i <= 5; i++) {
    try {
      writeFileSync(path, body);
      return true;
    } catch (err) {
      if (i === 5) {
        console.warn(`  write failed ${path}: ${err.code || err.message}`);
        return false;
      }
      // brief pause without busy-spin
      const sab = new SharedArrayBuffer(4);
      Atomics.wait(new Int32Array(sab), 0, 0, 200 * i);
    }
  }
  return false;
}

const STATIC_EXPLORE = `
<section class="explore-more" data-crosslinks="1">
  <h2>Explore more on Speakur</h2>
  <div class="explore-grid">
    <div>
      <h3>Look up &amp; learn</h3>
      <ul>
        <li><a href="./index.html">Pronunciation search</a></li>
        <li><a href="./words/">Word directories</a></li>
        <li><a href="./tools/">Tools</a></li>
        <li><a href="./research/">Research / Data</a></li>
        <li><a href="./guides.html">Editorial guides</a></li>
        <li><a href="./guide.html?slug=how-to-read-ipa-phonetic-symbols">How to read IPA</a></li>
        <li><a href="./guide.html?slug=commonly-mispronounced-english-words">Commonly mispronounced words</a></li>
        <li><a href="./guide.html?slug=us-vs-uk-pronunciation-differences">US vs UK pronunciation</a></li>
      </ul>
    </div>
    <div>
      <h3>Topic hubs</h3>
      <ul>
        <li><a href="./food/">Food</a></li>
        <li><a href="./medical/">Medical</a></li>
        <li><a href="./places/">Places</a></li>
        <li><a href="./names/">Names</a></li>
        <li><a href="./everyday/">Everyday English</a></li>
        <li><a href="./tech/">Tech</a></li>
      </ul>
    </div>
    <div>
      <h3>Trust</h3>
      <ul>
        <li><a href="./about.html">About</a></li>
        <li><a href="./contact.html">Contact</a></li>
        <li><a href="./donate.html">Donate</a></li>
        <li><a href="./privacy.html">Privacy</a></li>
        <li><a href="./terms.html">Terms</a></li>
      </ul>
    </div>
  </div>
</section>`;

function patchBeforeMainClose(html, block) {
  if (html.includes('data-crosslinks="1"')) return { html, changed: false };
  if (!html.includes("</main>")) return { html, changed: false };
  return {
    html: html.replace("</main>", `${block}\n    </main>`),
    changed: true,
  };
}

function patchWordPages() {
  let changed = 0;
  let scanned = 0;
  for (const slug of HUBS) {
    const dir = join(ROOT, slug);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      if (!name.isDirectory()) continue;
      const file = join(dir, name.name, "index.html");
      if (!existsSync(file)) continue;
      scanned += 1;
      const html = readFileSync(file, "utf8");
      if (html.includes('data-crosslinks="1"')) continue;
      const block = renderExploreMoreHtml({ depth: 2, categorySlug: slug });
      const next = html.replace("</main>", `${block}\n    </main>`);
      if (next !== html) {
        if (writeRetry(file, next)) changed += 1;
      }
      if (scanned % 2000 === 0) {
        console.log(`  … scanned ${scanned}, patched ${changed}`);
      }
    }
  }
  return { scanned, changed };
}

function patchHubs() {
  let changed = 0;
  for (const slug of HUBS) {
    const file = join(ROOT, slug, "index.html");
    if (!existsSync(file)) continue;
    const html = readFileSync(file, "utf8");
    const block = renderExploreMoreHtml({ depth: 1, categorySlug: slug });
    const { html: next, changed: did } = patchBeforeMainClose(html, block);
    if (did) {
      writeRetry(file, next);
      changed += 1;
    }
  }
  const wordsHub = join(ROOT, "words", "index.html");
  if (existsSync(wordsHub)) {
    const html = readFileSync(wordsHub, "utf8");
    const block = renderExploreMoreHtml({ depth: 1, categorySlug: "", includeGuides: true });
    const { html: next, changed: did } = patchBeforeMainClose(html, block);
    if (did) {
      writeRetry(wordsHub, next);
      changed += 1;
    }
  }
  return changed;
}

function patchStaticPages() {
  const files = [
    "about.html",
    "contact.html",
    "donate.html",
    "privacy.html",
    "terms.html",
    "guides.html",
    "guide.html",
    "index.html",
  ];
  let changed = 0;
  for (const name of files) {
    const file = join(ROOT, name);
    if (!existsSync(file)) continue;
    const html = readFileSync(file, "utf8");
    const { html: next, changed: did } = patchBeforeMainClose(html, STATIC_EXPLORE);
    if (did) {
      writeRetry(file, next);
      changed += 1;
      console.log(`  patched ${name}`);
    }
  }
  return changed;
}

function ensureCss() {
  const cssPath = join(ROOT, "assets/site.css");
  if (!existsSync(cssPath)) return;
  let css = readFileSync(cssPath, "utf8");
  if (css.includes(".explore-more")) return;
  css += `

.explore-more {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--paper-line);
}
.explore-more h2 {
  margin: 0;
  font-family: Fraunces, Georgia, serif;
  font-size: 1.35rem;
}
.explore-grid {
  display: grid;
  gap: 1.25rem;
  margin-top: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}
.explore-more h3 {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-muted);
}
.explore-more ul {
  list-style: none;
  margin: 0.65rem 0 0;
  padding: 0;
}
.explore-more li { margin: 0.35rem 0; }
.explore-more a {
  color: var(--voice-dark);
  text-decoration: underline;
  text-underline-offset: 3px;
  font-size: 0.95rem;
}
`;
  writeRetry(cssPath, css);
  console.log("  added .explore-more styles to site.css");
}

console.log("Patching cross-links…");
ensureCss();
const hubs = patchHubs();
console.log(`Hubs/words index patched: ${hubs}`);
const staticN = patchStaticPages();
console.log(`Static pages patched: ${staticN}`);
console.log("Word pages (this may take a bit)…");
const words = patchWordPages();
console.log(`Word pages scanned=${words.scanned} patched=${words.changed}`);
console.log("Done.");
