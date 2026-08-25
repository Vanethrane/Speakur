import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { EZOIC_HEAD_SCRIPTS } from "./ezoic-head.mjs";
import { renderHowToStepsHtml, renderWordSeoHeadTags } from "./word-seo.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CRITICAL_CSS = readFileSync(join(__dirname, "../../assets/critical.css"), "utf8");

/**
 * Shared HTML rendering for static word / category / hub pages.
 */
export function accentFromAudio(audio = "") {
  const lower = audio.toLowerCase();
  if (lower.includes("-us") || lower.includes("_us") || lower.includes("/us/")) return "us";
  if (lower.includes("-uk") || lower.includes("_uk") || lower.includes("/uk/")) return "uk";
  return "other";
}

export function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Outfit:wght@400;500;600&display=swap";

export function chrome({ title, description, depth, active, seoExtra = "" }) {
  const asset = "../".repeat(depth) + "assets/";
  const home = "../".repeat(depth) || "./";
  return {
    head: `<!DOCTYPE html>
<html lang="en">
<head>
${EZOIC_HEAD_SCRIPTS}  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
${seoExtra || `  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="" />`}
  <style>${CRITICAL_CSS}</style>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="style" href="${FONT_HREF}" />
  <link rel="stylesheet" href="${FONT_HREF}" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="${FONT_HREF}" /></noscript>
  <link rel="stylesheet" href="${asset}site.css" />
  <link rel="stylesheet" href="${asset}word-page.css" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="icon" href="/assets/icon.svg" type="image/svg+xml" />
  <meta name="theme-color" content="#0d6e66" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Speakur" />
</head>
<body data-static-site="1">
  <div class="shell">
    <header class="site-header">
      <div class="header-row">
        <a class="brand" href="${home}index.html">Speakur</a>
        <nav aria-label="Primary">
          <a class="nav-home" href="${home}index.html">Home</a>
          <a href="${home}words/index.html"${active === "words" ? ' aria-current="page"' : ""}>Words</a>
          <a href="${home}guides.html">Guides</a>
          <a href="${home}about.html">About</a>
          <a href="${home}contact.html">Contact</a>
        </nav>
      </div>
      <button
        type="button"
        id="speakur-global-search-trigger"
        class="gs-trigger"
        data-index-url="${asset}global-search-index.json"
        aria-label="Open search (Command K)"
      >
        <span aria-hidden="true">⌕</span>
        <span>Search words, guides, tools…</span>
        <kbd>⌘K</kbd>
      </button>
    </header>
    <div id="speakur-ad-top" class="ad-slot ad-slot-top stable-slot" aria-label="Advertisement" style="min-height:90px"></div>`,
    foot: `
    <div id="speakur-ad-bottom" class="ad-slot ad-slot-bottom stable-slot" aria-label="Advertisement" style="min-height:90px"></div>
    <footer>
      <div class="footer-grid">
        <div>
          <div class="footer-brand">Speakur</div>
          <p class="footer-copy">Free pronunciation help for learners, creators, and professionals who need to say English words clearly and correctly.</p>
        </div>
        <div>
          <h3>Product</h3>
          <ul>
            <li><a href="${home}index.html">Home</a></li>
            <li><a href="${home}words/index.html">Word directories</a></li>
            <li><a href="${home}guides.html">Editorial guides</a></li>
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
      <p class="legal">© <span data-year></span> Speakur. <a href="${home}index.html">Home</a></p>
    </footer>
  </div>
  <script defer src="${asset}global-search-modal.js"></script>
  <script defer src="${asset}site.js"></script>
  <script defer src="${asset}pwa-install.js"></script>
</body>
</html>`,
  };
}

export function renderWordPage({ category, word, entry, syllables, siblings }) {
  const path = `/${category.slug}/${word}/`;
  const description = `Learn how to pronounce “${word}” with free US and UK audio, IPA phonetic spelling, and clear practice steps.`;
  const phonetic =
    entry?.phonetic ||
    entry?.phonetics?.find((p) => p.text)?.text ||
    "";
  const seoExtra = renderWordSeoHeadTags({
    word,
    path,
    description,
    phonetic,
  });
  const { head, foot } = chrome({
    title: `How to pronounce ${word} · ${category.title} · Speakur`,
    description,
    depth: 2,
    seoExtra,
  });

  const phonetics = (entry?.phonetics || [])
    .map((p) => ({
      accent: p.audio ? accentFromAudio(p.audio) : "other",
      text: p.text || null,
      audio: p.audio || null,
    }))
    .filter((p) => p.text || p.audio);

  const usAudio = phonetics.find((p) => p.accent === "us" && p.audio)?.audio || "";
  const ukAudio = phonetics.find((p) => p.accent === "uk" && p.audio)?.audio || "";
  const anyAudio = usAudio || ukAudio || phonetics.find((p) => p.audio)?.audio || "";

  const meanings = [];
  for (const meaning of entry?.meanings || []) {
    for (const def of meaning.definitions || []) {
      if (!def.definition) continue;
      meanings.push({
        pos: meaning.partOfSpeech || "unknown",
        def: def.definition,
        ex: def.example || null,
      });
      if (meanings.length >= 5) break;
    }
    if (meanings.length >= 5) break;
  }

  const ipaList = [...new Set(phonetics.map((p) => p.text).filter(Boolean))];

  const meaningsHtml = meanings.length
    ? `<section class="meanings">
        <h2>Meaning</h2>
        ${meanings
          .map(
            (m) => `<div class="sense">
            <p class="pos">${escapeHtml(m.pos)}</p>
            <p class="def">${escapeHtml(m.def)}</p>
            ${m.ex ? `<p class="ex">“${escapeHtml(m.ex)}”</p>` : ""}
          </div>`,
          )
          .join("")}
      </section>`
    : `<section class="meanings"><p class="note">Definition lookup was unavailable at generation time. Audio still works via browser speech.</p></section>`;

  const siblingHtml = siblings
    .filter((w) => w !== word)
    .slice(0, 12)
    .map((w) => `<a class="chip" href="../${encodeURIComponent(w)}/">${escapeHtml(w)}</a>`)
    .join("");

  return `${head}
    <main>
      <nav class="crumbs" aria-label="Breadcrumb">
        <a class="crumb-home" href="../../index.html">Home</a>
        <span>/</span>
        <a href="../../words/">Words</a>
        <span>/</span>
        <a href="../">${escapeHtml(category.title)}</a>
        <span>/</span>
        <span>${escapeHtml(word)}</span>
      </nav>

      <p class="eyebrow">${escapeHtml(category.title)} pronunciation</p>
      <article class="word-card word-result-slot stable-slot" data-word="${escapeHtml(word)}" style="min-height:18rem">
        <div class="word-head">
          <div>
            <h1>${escapeHtml(word)}</h1>
            <p class="ipa">${escapeHtml(phonetic || "Phonetic spelling unavailable")}</p>
          </div>
          <button type="button" class="play btn-voice" data-play data-audio="${escapeHtml(anyAudio)}" data-lang="en-US" style="min-height:2.75rem">
            <span class="icon">▶</span> Play
          </button>
        </div>

        <dl class="meta">
          ${
            syllables
              ? `<div><dt>Syllables</dt><dd>${syllables}</dd></div>`
              : ""
          }
          ${
            ipaList.length
              ? `<div><dt>IPA</dt><dd>${escapeHtml(ipaList.join(" · "))}</dd></div>`
              : ""
          }
          <div><dt>Path</dt><dd>/${escapeHtml(category.slug)}/${escapeHtml(word)}/</dd></div>
        </dl>

        <div class="plays interactive-slot" style="min-height:2.75rem">
          <button type="button" class="play btn-voice" data-play data-audio="${escapeHtml(usAudio)}" data-lang="en-US" style="min-height:2.75rem"><span class="icon">▶</span> US (free)</button>
          <button type="button" class="play btn-voice" data-play data-audio="${escapeHtml(ukAudio)}" data-lang="en-GB" style="min-height:2.75rem"><span class="icon">▶</span> UK (free)</button>
          <button type="button" class="play btn-voice" data-play data-audio="${escapeHtml(anyAudio)}" data-lang="en-US" data-rate="0.72" style="min-height:2.75rem"><span class="icon">▶</span> Slow</button>
        </div>
        <p class="note">This is a dedicated page at <strong>/${escapeHtml(category.slug)}/${escapeHtml(word)}/</strong>. Audio uses free dictionary clips when available, otherwise browser speech after you click Play.</p>
        ${meaningsHtml}
      </article>

      ${renderHowToStepsHtml(word)}

      <div id="speakur-ad-mid" class="ad-slot ad-slot-mid stable-slot" aria-label="Advertisement" style="min-height:90px"></div>

      <section class="related related-grid-slot stable-slot" style="min-height:8rem">
        <h2>More in ${escapeHtml(category.title)}</h2>
        <div class="chip-row">${siblingHtml}</div>
        <p class="note"><a href="../">All ${escapeHtml(category.title)} words</a> · <a href="../../words/">All directories</a></p>
      </section>
    </main>
    <script defer src="../../assets/word-play.js"></script>
${foot}`;
}

export function renderCategoryPage(category, words) {
  const { head, foot } = chrome({
    title: `${category.title} pronunciations · Speakur`,
    description: category.description,
    depth: 1,
    active: "words",
  });

  const list = words
    .map(
      (w) =>
        `<li><a href="./${encodeURIComponent(w)}/"><span>${escapeHtml(w)}</span><span class="hint">/${category.slug}/${w}/</span></a></li>`,
    )
    .join("\n");

  return `${head}
    <main>
      <nav class="crumbs" aria-label="Breadcrumb">
        <a class="crumb-home" href="../index.html">Home</a>
        <span>/</span>
        <a href="../words/">Words</a>
        <span>/</span>
        <span>${escapeHtml(category.title)}</span>
      </nav>
      <p class="eyebrow">Word directory</p>
      <h1>${escapeHtml(category.title)}</h1>
      <p class="lede">${escapeHtml(category.description)}</p>
      <p class="note">${words.length} pages in this section. Each word has its own URL.</p>
      <ul class="word-index">${list}</ul>
    </main>
${foot}`;
}

export function renderWordsHub(categories) {
  const { head, foot } = chrome({
    title: "Word directories · Speakur",
    description: "Browse Speakur pronunciation pages by category — medical, food, everyday, science, and more.",
    depth: 1,
    active: "words",
  });

  const cards = categories
    .map(
      (c) => `<a class="card" href="../${escapeHtml(c.slug)}/">
        <div class="meta">${c.words.length} words</div>
        <h2>${escapeHtml(c.title)}</h2>
        <p>${escapeHtml(c.description)}</p>
        <p class="note">/${escapeHtml(c.slug)}/</p>
      </a>`,
    )
    .join("\n");

  return `${head}
    <main>
      <p class="eyebrow">Directories</p>
      <h1>Words by topic</h1>
      <p class="lede">Browse thousands of pronunciation pages organized by topic—medical terms, food, places, tech, and everyday English. Each word includes IPA, syllable cues, and free click-to-play US and UK audio.</p>
      <div class="card-stack">${cards}</div>
    </main>
${foot}`;
}

export async function lookupWord(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  const res = await fetch(url);
  if (res.status === 404) return { ok: false, reason: "not_found" };
  if (!res.ok) return { ok: false, reason: "upstream", status: res.status };
  const entries = await res.json();
  return { ok: true, entry: entries[0] || null };
}

export async function syllableCount(word) {
  try {
    const res = await fetch(
      `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&qe=sp&md=s&max=1`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data[0]?.numSyllables ?? null;
  } catch {
    return null;
  }
}

/** Simple category guess for new words. */
export function guessCategory(word, catalog) {
  const w = word.toLowerCase();
  const rules = [
    ["medical", /osis$|itis$|ectomy$|ology$|emia$|pathy$|phobia$|therapy$|clinic|patient|surgery|vaccine|symptom/],
    ["food", /berry$|latte|espresso|sauce|cheese|bread|wine|spice|fruit|meat|soup|cake|tea$|coffee/],
    ["science", /ology$|metry$|scopy$|particle|atom|cell|gene|quantum|species|planet|chemical/],
    ["business", /market|finance|equity|revenue|vendor|client|strategy|portfolio|synergy|analytic/],
    ["tech", /algorithm|software|browser|server|database|encrypt|cyber|javascript|python|docker|cloud/],
    ["sports", /ball|sport|olympi|athlet|gym|swim|ski|marathon|boxing|tennis|golf|hockey|soccer/],
    ["arts", /ballet|opera|symphony|orchestra|poem|theatre|cinema|sculpt|genre|metaphor|sonnet/],
    ["nature", /mountain|river|ocean|forest|desert|glacier|volcano|hurricane|climate|weather/],
    ["law", /court|judge|jury|lawyer|attorney|statute|felony|subpoena|verdict|contract/],
    ["mythology", /zeus|odin|thor|apollo|athena|dragon|phoenix|unicorn|mythology|legend/],
    ["animals", /dog|cat|bird|fish|horse|lion|tiger|elephant|whale|snake|butterfly|eagle/],
  ];
  for (const [slug, re] of rules) {
    if (re.test(w)) return slug;
  }
  const slugs = (catalog?.categories || []).map((c) => c.slug);
  if (slugs.includes("everyday")) return "everyday";
  return slugs[0] || "everyday";
}
