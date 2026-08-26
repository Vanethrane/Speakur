/**
 * Generate Phase 1 trust pages + lightweight tools/research stubs.
 * Usage: node scripts/write-trust-pages.mjs
 */
import { mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { chrome, escapeHtml, renderExploreMoreHtml } from "./lib/word-html.mjs";

const ROOT = process.cwd();
const CRITICAL = readFileSync(join(ROOT, "assets/critical.css"), "utf8");
const FONT =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Outfit:wght@400;500;600&display=swap";

function staticShell({ title, description, canonical, body, depth = 0, active = "" }) {
  // Prefer chrome for depth>0; root static pages use a matching shell with header search.
  if (depth > 0) {
    const { head, foot } = chrome({ title, description, depth, active });
    return `${head}\n    <main>\n${body}\n    </main>\n${foot}`;
  }
  const home = "./";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <script data-cfasync="false" src="https://cmp.gatekeeperconsent.com/min.js"></script>
  <script data-cfasync="false" src="https://the.gatekeeperconsent.com/cmp.min.js"></script>
  <script async src="https://www.ezojs.com/ezoic/sa.min.js"></script>
  <script>
    window.ezstandalone = window.ezstandalone || {};
    ezstandalone.cmd = ezstandalone.cmd || [];
  </script>
  <script src="https://ezoicanalytics.com/analytics.js"></script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="https://www.speakur.com${canonical}" />
  <style>${CRITICAL}</style>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="style" href="${FONT}" />
  <link rel="stylesheet" href="${FONT}" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="${FONT}" /></noscript>
  <link rel="stylesheet" href="./assets/site.css" />
  <link rel="icon" href="/assets/icon.svg" type="image/svg+xml" />
  <meta name="theme-color" content="#0d6e66" />
</head>
<body>
  <div class="shell">
    <header class="site-header">
      <div class="header-row">
        <a class="brand" href="${home}index.html">Speakur</a>
        <nav aria-label="Primary">
          <a class="nav-home" href="${home}index.html">Home</a>
          <a href="${home}words/">Words</a>
          <a href="${home}tools/">Tools</a>
          <a href="${home}guides.html">Guides</a>
          <a href="${home}about.html">About</a>
          <a href="${home}contact.html">Contact</a>
        </nav>
      </div>
      <form id="speakur-header-form" class="header-search" role="search" autocomplete="off">
        <label class="sr-only" for="speakur-header-q">Search guides, tools, and words</label>
        <input id="speakur-header-q" type="search" placeholder="Search guides, tools, words…" spellcheck="false" />
        <button type="submit" aria-label="Search">Go</button>
        <ul id="speakur-header-results" class="header-search-results" role="listbox" hidden></ul>
      </form>
    </header>
    <div id="speakur-ad-top" class="ad-slot ad-slot-top stable-slot" role="region" aria-label="Advertisement" style="min-height:60px"></div>
    <main>
${body}
${renderExploreMoreHtml({ depth: 0, includeGuides: true })}
    </main>
    <div id="speakur-ad-bottom" class="ad-slot ad-slot-bottom stable-slot" role="region" aria-label="Advertisement" style="min-height:90px"></div>
    <footer>
      <div class="footer-grid">
        <div>
          <div class="footer-brand">Speakur</div>
          <p class="footer-copy">Pronunciation reference built on structured linguistic data.</p>
        </div>
        <div>
          <h3>Product</h3>
          <ul>
            <li><a href="./index.html">Pronunciation search</a></li>
            <li><a href="./words/">Word directories</a></li>
            <li><a href="./tools/">Tools</a></li>
            <li><a href="./research/">Research / Data</a></li>
            <li><a href="./guides.html">Editorial guides</a></li>
          </ul>
        </div>
        <div>
          <h3>Trust &amp; legal</h3>
          <ul>
            <li><a href="./about.html">About Us</a></li>
            <li><a href="./methodology.html">Methodology &amp; sources</a></li>
            <li><a href="./editorial-policy.html">Editorial policy</a></li>
            <li><a href="./correction-policy.html">Correction policy</a></li>
            <li><a href="./authors/speakur-editorial.html">Authors</a></li>
            <li><a href="./privacy.html">Privacy Policy</a></li>
            <li><a href="./terms.html">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <p class="legal">© <span data-year></span> Speakur.</p>
    </footer>
  </div>
  <script defer src="./assets/search-index.js"></script>
  <script defer src="./assets/header-search.js"></script>
  <script defer src="./assets/site.js"></script>
</body>
</html>`;
}

const pages = [
  {
    file: "editorial-policy.html",
    title: "Editorial Policy · Speakur",
    description: "How Speakur selects, writes, and maintains pronunciation reference pages and guides.",
    canonical: "/editorial-policy.html",
    body: `      <p class="eyebrow">Trust</p>
      <h1>Editorial policy</h1>
      <p class="lede">Speakur publishes pronunciation reference pages and educational guides. Our standard is structured linguistic data first — not AI-generated filler.</p>
      <div class="prose">
        <h2>What we publish</h2>
        <ul>
          <li>Word pronunciation reference pages with IPA, audio labels, and definitions when available</li>
          <li>Directory hubs by topic (food, medical, names, places, brands, and more)</li>
          <li>Long-form guides on accents, IPA, teaching, and speech technology</li>
        </ul>
        <h2>Quality bar</h2>
        <p>New or upgraded word pages should surface IPA, syllable cues, and definitions when upstream data exists. We prefer curated common-mistake notes over generic boilerplate. Identical HowTo prose across tens of thousands of pages is treated as a defect.</p>
        <h2>Independence</h2>
        <p>Advertising may appear on the site. Ads do not decide which pronunciations we label or which words we prioritize for editorial review.</p>
        <h2>Corrections</h2>
        <p>See our <a href="./correction-policy.html">Correction policy</a>. Report issues via <a href="./contact.html">Contact</a>.</p>
        <p class="note">Last updated: 2026-08-26 · <a href="./authors/speakur-editorial.html">Speakur Editorial</a></p>
      </div>`,
  },
  {
    file: "methodology.html",
    title: "Pronunciation Methodology & Data Sources · Speakur",
    description: "How Speakur builds pronunciation pages: Free Dictionary API, Datamuse, IPA, audio attribution, and last-verified dates.",
    canonical: "/methodology.html",
    body: `      <p class="eyebrow">Trust</p>
      <h1>Methodology &amp; data sources</h1>
      <p class="lede">Speakur’s moat is a pronunciation graph — structured fields you can trust and correct — not a blog of thin pages.</p>
      <div class="prose">
        <h2>Pronunciation methodology</h2>
        <ol>
          <li><strong>IPA first.</strong> When an upstream dictionary entry includes IPA, we render it server-side.</li>
          <li><strong>Accent labels.</strong> US and UK play buttons use audio URLs that encode accent when available. A Native control appears only for a real non-US/UK source clip.</li>
          <li><strong>Syllables &amp; stress.</strong> Syllable counts come from Datamuse when available; stress descriptions follow IPA primary-stress marks (ˈ).</li>
          <li><strong>Phonetic spelling.</strong> Respelling is derived from IPA or curated preferred forms for known hard words — labeled as best-effort when derived.</li>
          <li><strong>Practice.</strong> Short word-specific cues replace cloned HowTo filler. HowTo JSON-LD may remain for search; visible copy must not be identical across the catalog.</li>
        </ol>
        <h2>Data sources</h2>
        <ul>
          <li><strong>Free Dictionary API</strong> — definitions, phonetics, and public-domain-style audio clips when present</li>
          <li><strong>Datamuse</strong> — syllable counts and definition fallback when the primary API 404s</li>
          <li><strong>Speakur curated notes</strong> — common mispronunciations for known hard words (<code>data/common-mistakes.json</code>)</li>
          <li><strong>Browser speech</strong> — click-gated fallback when no dictionary clip exists</li>
        </ul>
        <h2>Audio attribution</h2>
        <p>Each word page lists Sources and audio provenance. Dictionary clips are preferred; TTS/browser speech is disclosed when used. We do not autoplay audio.</p>
        <h2>Last verified</h2>
        <p>Word pages carry a <strong>Last verified</strong> date set at generation or enrichment time. Regeneration or a successful data refill updates that stamp. Methodology last reviewed: <time datetime="2026-08-26">2026-08-26</time>.</p>
        <p><a href="./editorial-policy.html">Editorial policy</a> · <a href="./correction-policy.html">Correction policy</a> · <a href="./research/">Research / Data</a></p>
      </div>`,
  },
  {
    file: "correction-policy.html",
    title: "Correction Policy · Speakur",
    description: "How to report pronunciation, IPA, or definition errors on Speakur and how we handle updates.",
    canonical: "/correction-policy.html",
    body: `      <p class="eyebrow">Trust</p>
      <h1>Correction policy</h1>
      <p class="lede">Language data can be wrong. We correct substantive errors and document what changed when we can.</p>
      <div class="prose">
        <h2>What to report</h2>
        <ul>
          <li>Wrong or misleading IPA / phonetic spelling</li>
          <li>Mislabeled US vs UK audio</li>
          <li>Broken or mismatched dictionary clips</li>
          <li>Definition or example errors</li>
          <li>Curated common-mistake notes that need nuance</li>
        </ul>
        <h2>How to report</h2>
        <p>Use <a href="./contact.html">Contact</a> with the word URL, the incorrect field, and a preferred correction plus a source if you have one (learner’s dictionary, style guide, or native-speaker recording).</p>
        <h2>What we do</h2>
        <ol>
          <li>Triage against structured sources and editorial judgment</li>
          <li>Patch the page template data or curated JSON</li>
          <li>Update <strong>Last verified</strong> on the affected page when practical</li>
        </ol>
        <p>We may decline style-only preferences when multiple standard forms exist; in those cases we label accents or note variation.</p>
        <p class="note">Last updated: 2026-08-26</p>
      </div>`,
  },
];

function authorPage() {
  const body = `      <p class="eyebrow">Authors</p>
      <h1>Speakur Editorial</h1>
      <p class="lede">Collective byline for Speakur’s pronunciation reference standards, trust pages, and curated hard-word notes.</p>
      <div class="prose">
        <h2>Role</h2>
        <p>Speakur Editorial maintains methodology, correction workflows, and quality bars for word pages. Individual contributor profiles may be added as the research graph grows.</p>
        <h2>Contact</h2>
        <p><a href="../contact.html">Contact Speakur</a> · <a href="../methodology.html">Methodology</a> · <a href="../editorial-policy.html">Editorial policy</a></p>
        <p class="note">Profile stub · Updated 2026-08-26</p>
      </div>`;
  const html = staticShell({
    title: "Speakur Editorial · Authors · Speakur",
    description: "Author profile for Speakur Editorial — pronunciation reference standards and trust policies.",
    canonical: "/authors/speakur-editorial.html",
    body,
  }).replace(/href="\.\//g, 'href="../').replace(/src="\.\/assets\//g, 'src="../assets/');
  // Fix double-replaced explore paths carefully — rewrite file with depth-aware shell instead
  return null;
}

function writeAuthor() {
  const { head, foot } = chrome({
    title: "Speakur Editorial · Authors · Speakur",
    description: "Author profile for Speakur Editorial — pronunciation reference standards and trust policies.",
    depth: 1,
  });
  const body = `      <p class="eyebrow">Authors</p>
      <h1>Speakur Editorial</h1>
      <p class="lede">Collective byline for Speakur’s pronunciation reference standards, trust pages, and curated hard-word notes.</p>
      <div class="prose">
        <h2>Role</h2>
        <p>Speakur Editorial maintains methodology, correction workflows, and quality bars for word pages. Individual contributor profiles may be added as the research graph grows.</p>
        <h2>Standards</h2>
        <ul>
          <li><a href="../methodology.html">Methodology &amp; sources</a></li>
          <li><a href="../editorial-policy.html">Editorial policy</a></li>
          <li><a href="../correction-policy.html">Correction policy</a></li>
        </ul>
        <p><a href="../contact.html">Contact</a></p>
        <p class="note">Profile stub · Updated 2026-08-26</p>
      </div>
      ${renderExploreMoreHtml({ depth: 1 })}`;
  return `${head}\n    <main>\n${body}\n    </main>\n${foot}`;
}

function writeTools() {
  const { head, foot } = chrome({
    title: "Practice tools · Speakur",
    description: "Pronunciation practice tools on Speakur — search, word directories, and upcoming drills.",
    depth: 1,
    active: "tools",
  });
  const body = `      <p class="eyebrow">Tools</p>
      <h1>Practice tools</h1>
      <p class="lede">Lightweight practice surfaces that plug into Speakur’s pronunciation graph. Advanced scoring and multi-accent studios are on the roadmap.</p>
      <div class="prose">
        <ul>
          <li><a href="../index.html">Pronunciation search</a> — look up any catalog word</li>
          <li><a href="../words/">Word directories</a> — browse by topic</li>
          <li>On each word page: Listen, Practice cues, and local Record yourself (no upload / no AI scoring)</li>
        </ul>
        <h2>Coming later</h2>
        <p>Minimal pairs, side-by-side accent studio, and optional scoring — see <a href="../research/">Research / Data</a> and About for the deferred roadmap.</p>
      </div>
      ${renderExploreMoreHtml({ depth: 1 })}`;
  return `${head}\n    <main>\n${body}\n    </main>\n${foot}`;
}

function writeResearch() {
  const roadmap = JSON.parse(readFileSync(join(ROOT, "data/speakur-roadmap.json"), "utf8"));
  const { head, foot } = chrome({
    title: "Research / Data · Speakur",
    description: "Speakur pronunciation graph roadmap: shipped trust & reference work, deferred SEO surface, moat, and distribution.",
    depth: 1,
  });
  const phase = (key, title) => {
    const block = roadmap.backlog[key];
    return `<h3>${escapeHtml(title)} <span class="note">(${escapeHtml(block.status)})</span></h3>
        <ul>${block.items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
  };
  const body = `      <p class="eyebrow">Research</p>
      <h1>Research / Data</h1>
      <p class="lede">${escapeHtml(roadmap.northStar)}</p>
      <div class="prose">
        <h2>Shipped</h2>
        <p>Phase 1 trust pages and Phase 2 word-reference template (IPA, stress, mistakes, sources, last verified).</p>
        <h2>Deferred backlog</h2>
        ${phase("phase3_seo_surface", "Phase 3 — SEO surface")}
        ${phase("phase4_moat", "Phase 4 — Moat")}
        ${phase("phase5_distribution", "Phase 5 — Distribution")}
        <p class="note">Roadmap data: <code>data/speakur-roadmap.json</code> · Updated ${escapeHtml(roadmap.updated)}</p>
      </div>
      ${renderExploreMoreHtml({ depth: 1 })}`;
  return `${head}\n    <main>\n${body}\n    </main>\n${foot}`;
}

for (const p of pages) {
  writeFileSync(join(ROOT, p.file), staticShell(p));
  console.log("wrote", p.file);
}

mkdirSync(join(ROOT, "authors"), { recursive: true });
writeFileSync(join(ROOT, "authors/speakur-editorial.html"), writeAuthor());
console.log("wrote authors/speakur-editorial.html");

mkdirSync(join(ROOT, "tools"), { recursive: true });
writeFileSync(join(ROOT, "tools/index.html"), writeTools());
console.log("wrote tools/index.html");

mkdirSync(join(ROOT, "research"), { recursive: true });
writeFileSync(join(ROOT, "research/index.html"), writeResearch());
console.log("wrote research/index.html");

// dead code path silenced
void authorPage;
