/**
 * Build Speakur /tools/ hub + tool pages, and patch primary nav on main static HTML.
 * Usage: node scripts/build-tools-pages.mjs
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { EZOIC_HEAD_SCRIPTS } from "./lib/ezoic-head.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FONT =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Outfit:wght@400;500;600&display=swap";

const TOOLS = [
  {
    slug: "ipa",
    label: "IPA cheat sheet",
    blurb: "Tap a phonetic symbol for an example word and click-to-play audio.",
    status: "ready",
    script: "tools-ipa.js",
  },
  {
    slug: "minimal-pairs",
    label: "Minimal-pair trainer",
    blurb: "Two words, Play A/B, then choose which stress or vowel you heard.",
    status: "ready",
    script: "tools-minimal-pairs.js",
  },
  {
    slug: "homophones",
    label: "Homophone check",
    blurb: "Their / there / they’re-style sets with meanings and audio.",
    status: "ready",
    script: "tools-homophones.js",
  },
  {
    slug: "danger-list",
    label: "Danger-list deck",
    blurb: "Save hard words locally and run a 5-minute practice loop.",
    status: "ready",
    script: "tools-danger-list.js",
  },
  {
    slug: "us-uk",
    label: "US ↔ UK switcher",
    blurb: "Same spelling, American and British IPA + audio side by side.",
    status: "ready",
    script: "tools-us-uk.js",
  },
  {
    slug: "syllable-stress",
    label: "Syllable & stress highlighter",
    blurb: "Paste a sentence, mark ˈ stress, and clap the syllable count.",
    status: "stub",
    guide: ["science-of-syllables-and-stress", "Syllables and stress"],
  },
  {
    slug: "name-coach",
    label: "Name coach",
    blurb: "First/last name lookup with slow replay for introductions.",
    status: "stub",
    guide: ["commonly-mispronounced-english-words", "Commonly mispronounced words"],
  },
  {
    slug: "warm-up",
    label: "Speaking warm-up",
    blurb: "A 60-second random set from a category hub.",
    status: "stub",
    guide: ["building-a-pronunciation-practice-routine", "Practice routine"],
  },
];

function navHtml(home, { toolsOpen = false } = {}) {
  const items = TOOLS.map((t) => `<li><a href="${home}tools/${t.slug}/">${t.label}</a></li>`).join(
    "\n              ",
  );
  return `<a class="nav-home" href="${home}index.html">Home</a>
          <a href="${home}words/">Words</a>
          <a href="${home}guides.html">Guides</a>
          <details class="nav-dropdown"${toolsOpen ? " open" : ""}>
            <summary class="nav-pill"${toolsOpen ? ' aria-current="page"' : ""}>Tools</summary>
            <ul class="nav-dropdown-menu" role="list">
              <li><a href="${home}tools/"><strong>All tools</strong></a></li>
              ${items}
            </ul>
          </details>
          <a href="${home}about.html">About</a>
          <a href="${home}contact.html">Contact</a>`;
}

function pageShell({
  title,
  description,
  canonical,
  depth,
  body,
  extraScripts = [],
  toolsOpen = true,
}) {
  const asset = "../".repeat(depth) + "assets/";
  const home = "../".repeat(depth) || "./";
  const scripts = [
    `<script defer src="${asset}word-play.js"></script>`,
    ...extraScripts.map((s) => `<script defer src="${asset}${s}"></script>`),
    `<script defer src="${asset}site.js"></script>`,
    `<script defer src="${asset}search-index.js"></script>`,
    `<script defer src="${asset}header-search.js"></script>`,
  ].join("\n  ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
${EZOIC_HEAD_SCRIPTS}  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="style" href="${FONT}" />
  <link rel="stylesheet" href="${FONT}" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="${FONT}" /></noscript>
  <link rel="stylesheet" href="${asset}site.css" />
  <link rel="icon" href="/assets/icon.svg" type="image/svg+xml" />
  <meta name="theme-color" content="#0d6e66" />
</head>
<body data-static-site="1">
  <div class="shell">
    <header class="site-header">
      <div class="header-row">
        <a class="brand" href="${home}index.html">Speakur</a>
        <nav aria-label="Primary">
          ${navHtml(home, { toolsOpen })}
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
    </main>
    <div id="speakur-ad-bottom" class="ad-slot ad-slot-bottom stable-slot" role="region" aria-label="Advertisement" style="min-height:90px"></div>
    <footer>
      <div class="footer-grid">
        <div>
          <div class="footer-brand">Speakur</div>
          <p class="footer-copy">Free pronunciation help for learners, creators, and professionals.</p>
        </div>
        <div>
          <h3>Product</h3>
          <ul>
            <li><a href="${home}index.html">Pronunciation search</a></li>
            <li><a href="${home}tools/">Practice tools</a></li>
            <li><a href="${home}words/">Word directories</a></li>
            <li><a href="${home}guides.html">Editorial guides</a></li>
            <li><a href="${home}donate.html">Donate</a></li>
          </ul>
        </div>
        <div>
          <h3>Trust &amp; legal</h3>
          <ul>
            <li><a href="${home}about.html">About Us</a></li>
            <li><a href="${home}contact.html">Contact</a></li>
            <li><a href="${home}privacy.html">Privacy Policy</a></li>
            <li><a href="${home}terms.html">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <p class="legal">© <span data-year></span> Speakur. <a href="${home}index.html">Home</a> · <a href="${home}tools/">Tools</a> · <a href="${home}guides.html">Guides</a></p>
    </footer>
  </div>
  ${scripts}
</body>
</html>
`;
}

function hubBody() {
  const cards = TOOLS.map((t) => {
    const status =
      t.status === "ready"
        ? `<span class="tool-status">Ready</span>`
        : `<span class="tool-status is-stub">Coming soon</span>`;
    return `<a class="tool-card" href="./${t.slug}/" id="${t.slug}">
          ${status}
          <h2>${t.label}</h2>
          <p>${t.blurb}</p>
        </a>`;
  }).join("\n        ");
  return `      <p class="eyebrow">Practice</p>
      <h1>Tools</h1>
      <p class="lede">
        Static pronunciation trainers that run in your browser — no accounts. Tap the
        <strong>Tools</strong> pill in the top nav anytime to jump back here.
      </p>
      <div class="tools-grid">
        ${cards}
      </div>`;
}

function crumbs(label) {
  return `<nav class="tool-crumbs" aria-label="Breadcrumb">
        <a href="../../index.html">Home</a><span>/</span>
        <a href="../">Tools</a><span>/</span>
        <span>${label}</span>
      </nav>`;
}

function toolBodies() {
  return {
    ipa: `${crumbs("IPA cheat sheet")}
      <p class="eyebrow">Interactive</p>
      <h1>IPA cheat sheet</h1>
      <p class="lede">Tap a symbol to see an example word, then play audio. Symbols use common General American cues.</p>
      <div class="panel" id="ipa-app">
        <h2 style="margin:0;font-family:Fraunces,Georgia,serif;font-size:1.15rem;">Vowels</h2>
        <div class="ipa-grid" id="ipa-vowels"></div>
        <h2 style="margin:1.25rem 0 0;font-family:Fraunces,Georgia,serif;font-size:1.15rem;">Consonants</h2>
        <div class="ipa-grid" id="ipa-consonants"></div>
        <div class="ipa-detail" id="ipa-detail" aria-live="polite">
          <p class="note" style="margin:0">Choose a symbol to hear an example.</p>
        </div>
      </div>
      <p class="note" style="margin-top:1.25rem">Deeper reading: <a href="../../guide.html?slug=how-to-read-ipa-phonetic-symbols">How to read IPA</a>.</p>`,

    "minimal-pairs": `${crumbs("Minimal-pair trainer")}
      <p class="eyebrow">Listening</p>
      <h1>Minimal-pair trainer</h1>
      <p class="lede">Play A and B, then pick which word you heard — stress pairs and vowel contrasts.</p>
      <div class="panel" id="mp-app" data-word="">
        <p class="note" id="mp-prompt" style="margin:0">Loading…</p>
        <p id="mp-pair" style="margin:1rem 0 0;font-family:Fraunces,Georgia,serif;font-size:1.75rem;letter-spacing:-0.02em;"></p>
        <div class="tool-actions">
          <button type="button" class="play btn-voice" id="mp-play-a"><span class="icon">▶</span> Play A</button>
          <button type="button" class="play btn-voice" id="mp-play-b"><span class="icon">▶</span> Play B</button>
          <button type="button" class="play btn-voice" id="mp-play-mystery" data-rate="1"><span class="icon">▶</span> Mystery</button>
        </div>
        <div class="choice-row" id="mp-choices"></div>
        <p id="mp-feedback" role="status" aria-live="polite" style="margin:1rem 0 0;min-height:1.5rem;"></p>
        <div class="tool-actions">
          <button type="button" class="btn btn-voice" id="mp-next">Next pair</button>
        </div>
        <p class="note" id="mp-score" style="margin:1rem 0 0;">Score: 0 / 0</p>
      </div>`,

    homophones: `${crumbs("Homophone check")}
      <p class="eyebrow">Disambiguate</p>
      <h1>Homophone check</h1>
      <p class="lede">Same sound, different spelling — hear each form and read the quick cue.</p>
      <div id="homo-app"></div>
      <p class="note" style="margin-top:1.25rem">Related: <a href="../../guide.html?slug=commonly-mispronounced-english-words">Commonly mispronounced words</a>.</p>`,

    "danger-list": `${crumbs("Danger-list deck")}
      <p class="eyebrow">Local practice</p>
      <h1>Danger-list deck</h1>
      <p class="lede">Save words that trip you up. Stored only in this browser (localStorage). Run a 5-minute loop when you have a gap.</p>
      <div class="panel">
        <form id="danger-add" class="search-row" autocomplete="off" style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <label class="sr-only" for="danger-q">Add a word</label>
          <input id="danger-q" name="q" placeholder="Add a hard word…" spellcheck="false" style="flex:1;min-width:12rem;" />
          <button type="submit" class="btn btn-voice">Save</button>
        </form>
        <p id="danger-status" role="status" aria-live="polite" class="note" style="margin:0.75rem 0 0;"></p>
        <ul class="danger-list" id="danger-list"></ul>
        <div class="tool-actions">
          <button type="button" class="btn btn-voice" id="danger-start">Start 5-minute loop</button>
          <button type="button" class="btn" id="danger-clear" style="background:transparent;border:1px solid var(--paper-line);color:var(--ink-muted);">Clear deck</button>
        </div>
        <div id="danger-session" class="panel" style="display:none;margin-top:1rem;background:var(--paper);" data-word="">
          <p class="note" id="danger-timer" style="margin:0;">5:00</p>
          <p id="danger-current" style="margin:0.75rem 0 0;font-family:Fraunces,Georgia,serif;font-size:2rem;"></p>
          <div class="tool-actions">
            <button type="button" class="play btn-voice" id="danger-play" data-play data-lang="en-US"><span class="icon">▶</span> Play</button>
            <button type="button" class="play btn-voice" id="danger-slow" data-play data-lang="en-US" data-rate="0.72"><span class="icon">▶</span> Slow</button>
            <button type="button" class="btn btn-voice" id="danger-next">Next</button>
          </div>
        </div>
      </div>`,

    "us-uk": `${crumbs("US ↔ UK switcher")}
      <p class="eyebrow">Accents</p>
      <h1>US ↔ UK switcher</h1>
      <p class="lede">Look up one spelling and compare American and British IPA with free dictionary audio when available.</p>
      <div class="panel">
        <form id="usuk-form" class="search-row" autocomplete="off" style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <label class="sr-only" for="usuk-q">Word</label>
          <input id="usuk-q" placeholder="Type a word — schedule, tomato, garage…" spellcheck="false" style="flex:1;min-width:12rem;" />
          <button type="submit" class="btn btn-voice">Compare</button>
        </form>
        <p id="usuk-status" role="status" class="note" style="margin:0.75rem 0 0;"></p>
        <div class="usuk-cols" id="usuk-result" hidden>
          <div class="usuk-col" data-word="">
            <h3>US</h3>
            <p class="ipa" id="usuk-us-ipa">—</p>
            <div class="tool-actions">
              <button type="button" class="play btn-voice" id="usuk-us-play" data-play data-lang="en-US"><span class="icon">▶</span> Play US</button>
            </div>
          </div>
          <div class="usuk-col" data-word="">
            <h3>UK</h3>
            <p class="ipa" id="usuk-uk-ipa">—</p>
            <div class="tool-actions">
              <button type="button" class="play btn-voice" id="usuk-uk-play" data-play data-lang="en-GB"><span class="icon">▶</span> Play UK</button>
            </div>
          </div>
        </div>
      </div>
      <p class="note" style="margin-top:1.25rem">Guide: <a href="../../guide.html?slug=us-vs-uk-pronunciation-differences">US vs UK pronunciation</a>.</p>`,
  };
}

function stubBody(tool) {
  const [slug, label] = tool.guide || ["how-to-read-ipa-phonetic-symbols", "How to read IPA"];
  return `${crumbs(tool.label)}
      <p class="eyebrow">Coming soon</p>
      <h1>${tool.label}</h1>
      <p class="lede">${tool.blurb}</p>
      <div class="stub-note">
        <p style="margin:0;line-height:1.55;">
          This tool is listed in the Tools menu so you can find it later. The interactive version is next —
          meanwhile try the related guide
          <a href="../../guide.html?slug=${encodeURIComponent(slug)}">${label}</a>
          or browse the <a href="../">tools hub</a>.
        </p>
      </div>`;
}

// --- write pages ---
mkdirSync(join(ROOT, "tools"), { recursive: true });
writeFileSync(
  join(ROOT, "tools", "index.html"),
  pageShell({
    title: "Practice tools · Speakur",
    description:
      "Speakur pronunciation tools: IPA cheat sheet, minimal pairs, homophones, danger-list deck, and more — free, static, no accounts.",
    canonical: "https://www.speakur.com/tools/",
    depth: 1,
    body: hubBody(),
    toolsOpen: true,
  }),
);

const bodies = toolBodies();
for (const tool of TOOLS) {
  const dir = join(ROOT, "tools", tool.slug);
  mkdirSync(dir, { recursive: true });
  const body = bodies[tool.slug] || stubBody(tool);
  const scripts = tool.script ? [tool.script] : [];
  writeFileSync(
    join(dir, "index.html"),
    pageShell({
      title: `${tool.label} · Tools · Speakur`,
      description: tool.blurb,
      canonical: `https://www.speakur.com/tools/${tool.slug}/`,
      depth: 2,
      body,
      extraScripts: scripts,
      toolsOpen: true,
    }),
  );
}

/** Replace primary nav blocks on main static pages. */
const NAV_RE =
  /<nav aria-label="Primary">[\s\S]*?<\/nav>/i;

const PATCH_FILES = [
  ["index.html", "./"],
  ["about.html", "./"],
  ["contact.html", "./"],
  ["donate.html", "./"],
  ["guides.html", "./"],
  ["guide.html", "./"],
  ["privacy.html", "./"],
  ["terms.html", "./"],
  ["404.html", "/"],
  ["words/index.html", "../"],
];

let patched = 0;
for (const [rel, home] of PATCH_FILES) {
  const file = join(ROOT, rel);
  if (!existsSync(file)) continue;
  let html = readFileSync(file, "utf8");
  if (!NAV_RE.test(html)) continue;
  const next = html.replace(NAV_RE, `<nav aria-label="Primary">\n          ${navHtml(home)}\n        </nav>`);
  if (next !== html) {
    writeFileSync(file, next);
    patched++;
  }
}

console.log(`Wrote tools hub + ${TOOLS.length} tool pages; patched nav on ${patched} HTML files.`);
