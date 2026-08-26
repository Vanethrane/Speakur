/**
 * Generate interactive practice tools under /tools/.
 * Usage: node scripts/write-practice-tools.mjs
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { chrome, escapeHtml } from "./lib/word-html.mjs";

const ROOT = process.cwd();

const PAIRS = [
  { a: "ship", b: "sheep", focus: "ɪ vs iː", paths: ["/everyday/ship/", "/everyday/sheep/"] },
  { a: "bit", b: "beat", focus: "ɪ vs iː", paths: ["/everyday/bit/", "/everyday/beat/"] },
  { a: "full", b: "fool", focus: "ʊ vs uː", paths: ["/everyday/full/", "/everyday/fool/"] },
  { a: "cot", b: "caught", focus: "ɑ vs ɔ", paths: ["/everyday/cot/", "/everyday/caught/"] },
  { a: "thin", b: "tin", focus: "θ vs t", paths: ["/everyday/thin/", "/everyday/tin/"] },
  { a: "rice", b: "lice", focus: "r vs l", paths: ["/everyday/rice/", "/everyday/lice/"] },
  { a: "pray", b: "play", focus: "r vs l", paths: ["/everyday/pray/", "/everyday/play/"] },
  { a: "vest", b: "west", focus: "v vs w", paths: ["/everyday/vest/", "/everyday/west/"] },
  { a: "live", b: "leave", focus: "ɪ vs iː", paths: ["/everyday/live/", "/everyday/leave/"] },
  { a: "desert", b: "dessert", focus: "stress shift", paths: ["/nature/desert/", "/food/dessert/"] },
];

function toolPage({ title, description, crumb, body, scripts = [] }) {
  const { head, foot } = chrome({
    title: `${title} · Speakur`,
    description,
    depth: 2,
    active: "tools",
  });
  const extra = scripts
    .map((s) => `    <script defer src="../../assets/${s}"></script>`)
    .join("\n");
  return `${head}
    <main>
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="../../index.html">Home</a>
        <span>/</span>
        <a href="../">Tools</a>
        <span>/</span>
        <span>${escapeHtml(crumb)}</span>
      </nav>
      <p class="eyebrow">Practice tool</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="lede">${escapeHtml(description)}</p>
      ${body}
      <p class="note" style="margin-top:2rem"><a href="../">All tools</a> · <a href="../../index.html">Search a word</a> · <a href="../../guides.html">Guides</a></p>
    </main>
    <script defer src="../../assets/word-play.js"></script>
${extra}
${foot}`;
}

function stubPage({ title, description, crumb, guideSlug, guideLabel }) {
  return toolPage({
    title,
    description,
    crumb,
    body: `<div class="stub-note">
        <p style="margin:0;line-height:1.55;">
          Listed in the Tools menu so you can find it later. The interactive version is next —
          meanwhile try <a href="../../guide.html?slug=${encodeURIComponent(guideSlug)}">${escapeHtml(guideLabel)}</a>
          or the <a href="../">tools hub</a>.
        </p>
      </div>`,
  });
}

function write(dirRel, html) {
  const dir = join(ROOT, dirRel);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
  console.log(`Wrote ${dirRel}/index.html`);
}

function writeMinimalPairs() {
  const rows = PAIRS.map(
    (p) => `<div class="pair-row">
          <div class="pair-words">
            <a href="../..${p.paths[0]}">${escapeHtml(p.a)}</a>
            <span class="pair-vs">vs</span>
            <a href="../..${p.paths[1]}">${escapeHtml(p.b)}</a>
          </div>
          <span class="pair-focus">${escapeHtml(p.focus)}</span>
          <div class="plays" style="margin-top:0">
            <button type="button" class="play btn-voice" data-play data-lang="en-US" data-word="${escapeHtml(p.a)}" style="min-height:2.5rem">Hear ${escapeHtml(p.a)}</button>
            <button type="button" class="play btn-voice" data-play data-lang="en-US" data-word="${escapeHtml(p.b)}" style="min-height:2.5rem">Hear ${escapeHtml(p.b)}</button>
            <button type="button" class="play play-compare" data-pair-compare data-a="${escapeHtml(p.a)}" data-b="${escapeHtml(p.b)}" style="min-height:2.5rem">Compare</button>
          </div>
        </div>`,
  ).join("\n        ");

  write(
    "tools/minimal-pairs",
    toolPage({
      title: "Minimal-pair trainer",
      description:
        "Train sounds dictionaries bury: hear near-miss pairs, then open each word page for IPA, syllables, and Slow playback.",
      crumb: "Minimal pairs",
      scripts: ["tools-practice.js"],
      body: `<section class="tool-block" id="minimal-pairs">
        <h2>Hear the difference</h2>
        <p class="lede">Click Compare to play both words back-to-back. Then open the word pages to practice with Slow audio.</p>
        <div class="pair-grid">${rows}</div>
      </section>`,
    }),
  );
}

function writeUsUk() {
  write(
    "tools/us-uk",
    toolPage({
      title: "US ↔ UK switcher",
      description:
        "Look up a word and compare American and British pronunciation when both clips exist — labeled, no autoplay.",
      crumb: "US ↔ UK",
      scripts: ["word-lookup.js", "tools-practice.js"],
      body: `<section class="tool-block" id="us-uk">
        <h2>Compare accents for one word</h2>
        <p class="lede">Type a word Speakur already knows. If US and UK dictionary clips exist, play them side by side.</p>
        <form class="compare-tool-form" id="us-uk-form" autocomplete="off">
          <label class="sr-only" for="us-uk-q">Word to compare</label>
          <input id="us-uk-q" type="search" placeholder="e.g. schedule, vitamin, tomato" spellcheck="false" required />
          <button type="submit" class="play btn-voice" style="min-height:2.75rem">Look up</button>
        </form>
        <p class="compare-tool-status" id="us-uk-status" role="status"></p>
        <div class="compare-tool-result" id="us-uk-result" hidden>
          <p class="ipa" id="us-uk-ipa"></p>
          <div class="plays accent-plays">
            <button type="button" class="play btn-voice" id="us-uk-play-us" data-play data-lang="en-US" style="min-height:2.75rem"><span class="play-stack"><span class="play-accent">US</span><span class="play-sub">American</span></span></button>
            <button type="button" class="play btn-voice" id="us-uk-play-uk" data-play data-lang="en-GB" style="min-height:2.75rem"><span class="play-stack"><span class="play-accent">UK</span><span class="play-sub">British</span></span></button>
            <button type="button" class="play play-compare" id="us-uk-compare" data-compare style="min-height:2.75rem"><span class="icon">⇄</span> Compare</button>
            <button type="button" class="play btn-voice play-slow" id="us-uk-slow" data-play data-lang="en-US" data-rate="0.72" style="min-height:2.75rem"><span class="play-stack"><span class="play-accent">Slow</span><span class="play-sub">Practice pace</span></span></button>
          </div>
          <p class="note" id="us-uk-page-link"></p>
        </div>
      </section>
      <p class="note" style="margin-top:1.25rem"><a href="../../guide.html?slug=us-vs-uk-pronunciation-differences">US vs UK pronunciation guide</a></p>`,
    }),
  );
}

function writeIpa() {
  write(
    "tools/ipa",
    toolPage({
      title: "IPA cheat sheet",
      description:
        "Tap a phonetic symbol for an example word and click-to-play audio — then practice Slow on any word page.",
      crumb: "IPA",
      scripts: ["tools-ipa.js"],
      body: `<section class="tool-block" id="ipa-app">
        <h2>Interactive IPA</h2>
        <p class="lede">Tap a symbol to see an example, then Play. Symbols use common General American cues.</p>
        <h3 class="tool-subhead">Vowels</h3>
        <div class="ipa-grid" id="ipa-vowels"></div>
        <h3 class="tool-subhead">Consonants</h3>
        <div class="ipa-grid" id="ipa-consonants"></div>
        <div class="ipa-detail" id="ipa-detail" aria-live="polite">
          <p class="note" style="margin:0">Choose a symbol to hear an example.</p>
        </div>
        <p class="note" style="margin-top:1rem"><a href="../../guide.html?slug=how-to-read-ipa-phonetic-symbols">Full IPA guide</a> · <a href="../minimal-pairs/">Minimal-pair trainer</a></p>
      </section>`,
    }),
  );
}

function writeHomophones() {
  write(
    "tools/homophones",
    toolPage({
      title: "Homophone check",
      description: "Same sound, different spelling — hear each form and read the quick cue.",
      crumb: "Homophones",
      scripts: ["tools-homophones.js"],
      body: `<div id="homo-app"></div>
      <p class="note" style="margin-top:1.25rem"><a href="../../guide.html?slug=commonly-mispronounced-english-words">Commonly mispronounced words</a></p>`,
    }),
  );
}

function writeDangerList() {
  write(
    "tools/danger-list",
    toolPage({
      title: "Danger-list deck",
      description:
        "Save words that trip you up. Stored only in this browser (localStorage). Run a 5-minute loop when you have a gap.",
      crumb: "Danger list",
      scripts: ["tools-danger-list.js"],
      body: `<section class="tool-block">
        <form id="danger-add" class="compare-tool-form" autocomplete="off">
          <label class="sr-only" for="danger-q">Add a word</label>
          <input id="danger-q" name="q" placeholder="Add a hard word…" spellcheck="false" />
          <button type="submit" class="play btn-voice" style="min-height:2.75rem">Save</button>
        </form>
        <p id="danger-status" role="status" aria-live="polite" class="note" style="margin:0.75rem 0 0;"></p>
        <ul class="danger-list" id="danger-list"></ul>
        <div class="tool-actions">
          <button type="button" class="btn btn-voice" id="danger-start">Start 5-minute loop</button>
          <button type="button" class="choice-btn" id="danger-clear">Clear deck</button>
        </div>
        <div id="danger-session" class="tool-block" style="display:none;margin-top:1rem;" data-word="">
          <p class="note" id="danger-timer" style="margin:0;">5:00</p>
          <p id="danger-current" style="margin:0.75rem 0 0;font-family:Fraunces,Georgia,serif;font-size:2rem;"></p>
          <div class="tool-actions">
            <button type="button" class="play btn-voice" id="danger-play" data-play data-lang="en-US"><span class="icon">▶</span> Play</button>
            <button type="button" class="play btn-voice" id="danger-slow" data-play data-lang="en-US" data-rate="0.72"><span class="icon">▶</span> Slow</button>
            <button type="button" class="btn btn-voice" id="danger-next">Next</button>
          </div>
        </div>
      </section>`,
    }),
  );
}

function writeStubs() {
  write(
    "tools/syllable-stress",
    stubPage({
      title: "Syllable & stress highlighter",
      description: "Paste a sentence, mark ˈ stress, and clap the syllable count.",
      crumb: "Syllable & stress",
      guideSlug: "science-of-syllables-and-stress",
      guideLabel: "Syllables and stress",
    }),
  );
  write(
    "tools/name-coach",
    stubPage({
      title: "Name coach",
      description: "First/last name lookup with slow replay for introductions.",
      crumb: "Name coach",
      guideSlug: "commonly-mispronounced-english-words",
      guideLabel: "Commonly mispronounced words",
    }),
  );
  write(
    "tools/warm-up",
    stubPage({
      title: "Speaking warm-up",
      description: "A 60-second random set from a category hub.",
      crumb: "Warm-up",
      guideSlug: "building-a-pronunciation-practice-routine",
      guideLabel: "Practice routine",
    }),
  );
}

function updateHub() {
  const hubPath = join(ROOT, "tools", "index.html");
  if (!existsSync(hubPath)) return;
  let html = readFileSync(hubPath, "utf8");
  const cards = `<div class="tools-grid" data-practice-tools="1">
        <a class="tool-card" href="./ipa/"><span class="tool-status">Ready</span><h2>IPA cheat sheet</h2><p>Tap a symbol for an example word and audio.</p></a>
        <a class="tool-card" href="./minimal-pairs/"><span class="tool-status">Ready</span><h2>Minimal-pair trainer</h2><p>Hear A/B contrasts and Compare near-miss pairs.</p></a>
        <a class="tool-card" href="./homophones/"><span class="tool-status">Ready</span><h2>Homophone check</h2><p>Their/there/they’re-style sets with cues and audio.</p></a>
        <a class="tool-card" href="./danger-list/"><span class="tool-status">Ready</span><h2>Danger-list deck</h2><p>Save hard words locally and run a 5-minute loop.</p></a>
        <a class="tool-card" href="./us-uk/"><span class="tool-status">Ready</span><h2>US ↔ UK switcher</h2><p>Same spelling, both accents side by side.</p></a>
        <a class="tool-card" href="./syllable-stress/"><span class="tool-status is-stub">Coming soon</span><h2>Syllable &amp; stress highlighter</h2><p>Paste a sentence, mark ˈ and clap the count.</p></a>
        <a class="tool-card" href="./name-coach/"><span class="tool-status is-stub">Coming soon</span><h2>Name coach</h2><p>First/last name lookup with slow replay.</p></a>
        <a class="tool-card" href="./warm-up/"><span class="tool-status is-stub">Coming soon</span><h2>Speaking warm-up</h2><p>A 60-second random set from a category hub.</p></a>
      </div>`;

  if (html.includes('data-practice-tools="1"')) {
    html = html.replace(/<div class="tools-grid" data-practice-tools="1">[\s\S]*?<\/div>/, cards);
  } else if (html.includes('class="card-stack"')) {
    html = html.replace(/<div class="card-stack">[\s\S]*?<\/div>/, cards);
  } else if (html.includes("<main>")) {
    html = html.replace(
      /(<p class="lede">[\s\S]*?<\/p>)/,
      `$1\n      ${cards}`,
    );
  }
  writeFileSync(hubPath, html);
  console.log("Updated tools/index.html hub cards");
}

/** Patch primary nav on main static HTML files to Tools pill dropdown. */
function patchNav() {
  const NAV = (home) => `<nav aria-label="Primary">
          <a class="nav-home" href="${home}index.html">Home</a>
          <a href="${home}words/">Words</a>
          <a href="${home}guides.html">Guides</a>
          <details class="nav-dropdown">
            <summary class="nav-pill">Tools</summary>
            <ul class="nav-dropdown-menu" role="list">
              <li><a href="${home}tools/"><strong>All tools</strong></a></li>
              <li><a href="${home}tools/ipa/">IPA cheat sheet</a></li>
              <li><a href="${home}tools/minimal-pairs/">Minimal-pair trainer</a></li>
              <li><a href="${home}tools/homophones/">Homophone check</a></li>
              <li><a href="${home}tools/danger-list/">Danger-list deck</a></li>
              <li><a href="${home}tools/us-uk/">US ↔ UK switcher</a></li>
              <li><a href="${home}tools/syllable-stress/">Syllable &amp; stress highlighter</a></li>
              <li><a href="${home}tools/name-coach/">Name coach</a></li>
              <li><a href="${home}tools/warm-up/">Speaking warm-up</a></li>
            </ul>
          </details>
          <a href="${home}about.html">About</a>
          <a href="${home}contact.html">Contact</a>
        </nav>`;

  const files = [
    ["index.html", "./"],
    ["about.html", "./"],
    ["contact.html", "./"],
    ["donate.html", "./"],
    ["guides.html", "./"],
    ["guide.html", "./"],
    ["privacy.html", "./"],
    ["terms.html", "./"],
    ["404.html", "/"],
    ["tools.html", "./"],
    ["words/index.html", "../"],
  ];
  const re = /<nav aria-label="Primary">[\s\S]*?<\/nav>/i;
  let n = 0;
  for (const [rel, home] of files) {
    const file = join(ROOT, rel);
    if (!existsSync(file)) continue;
    const html = readFileSync(file, "utf8");
    if (!re.test(html)) continue;
    writeFileSync(file, html.replace(re, NAV(home)));
    n++;
  }
  console.log(`Patched Tools dropdown nav on ${n} pages`);
}

writeMinimalPairs();
writeUsUk();
writeIpa();
writeHomophones();
writeDangerList();
writeStubs();
updateHub();
patchNav();