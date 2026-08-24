/**
 * Generate real static word pages:
 *   /{category}/{word}/index.html
 * Example: /medical/appendectomy/
 *
 * Fetches free dictionary API at build time so HTML contains text for crawlers.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const catalog = JSON.parse(readFileSync(join(ROOT, "data/catalog.json"), "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function accentFromAudio(audio = "") {
  const lower = audio.toLowerCase();
  if (lower.includes("-us") || lower.includes("_us") || lower.includes("/us/")) return "us";
  if (lower.includes("-uk") || lower.includes("_uk") || lower.includes("/uk/")) return "uk";
  return "other";
}

function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function lookupWord(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  try {
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const entries = await res.json();
    return entries[0] || null;
  } catch (err) {
    console.warn(`  lookup failed for ${word}:`, err.message);
    return null;
  }
}

async function syllableCount(word) {
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

function chrome({ title, description, depth, active }) {
  const asset = "../".repeat(depth) + "assets/";
  const home = "../".repeat(depth) || "./";
  return {
    head: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${asset}site.css" />
  <link rel="stylesheet" href="${asset}word-page.css" />
</head>
<body>
  <div class="shell">
    <header>
      <a class="brand" href="${home}index.html">Speakur</a>
      <nav aria-label="Primary">
        <a class="nav-home" href="${home}index.html">Home</a>
        <a href="${home}words/index.html"${active === "words" ? ' aria-current="page"' : ""}>Words</a>
        <a href="${home}guides.html">Guides</a>
        <a href="${home}about.html">About</a>
        <a href="${home}contact.html">Contact</a>
      </nav>
    </header>`,
    foot: `
    <footer>
      <div class="footer-grid">
        <div>
          <div class="footer-brand">Speakur</div>
          <p class="footer-copy">Real pages for real words — organized by topic.</p>
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
  <script src="${asset}site.js"></script>
</body>
</html>`,
  };
}

function renderWordPage({ category, word, entry, syllables, siblings }) {
  const { head, foot } = chrome({
    title: `How to pronounce ${word} · ${category.title} · Speakur`,
    description: `Hear how to pronounce “${word}” in the ${category.title} section. IPA, syllables, and free audio.`,
    depth: 2,
  });

  const phonetic =
    entry?.phonetic ||
    entry?.phonetics?.find((p) => p.text)?.text ||
    "";

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
      <article class="word-card" data-word="${escapeHtml(word)}">
        <div class="word-head">
          <div>
            <h1>${escapeHtml(word)}</h1>
            <p class="ipa">${escapeHtml(phonetic || "Phonetic spelling unavailable")}</p>
          </div>
          <button type="button" class="play btn-voice" data-play data-audio="${escapeHtml(anyAudio)}" data-lang="en-US">
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

        <div class="plays">
          <button type="button" class="play btn-voice" data-play data-audio="${escapeHtml(usAudio)}" data-lang="en-US"><span class="icon">▶</span> US (free)</button>
          <button type="button" class="play btn-voice" data-play data-audio="${escapeHtml(ukAudio)}" data-lang="en-GB"><span class="icon">▶</span> UK (free)</button>
          <button type="button" class="play btn-voice" data-play data-audio="${escapeHtml(anyAudio)}" data-lang="en-US" data-rate="0.72"><span class="icon">▶</span> Slow</button>
        </div>
        <p class="note">This is a dedicated page at <strong>/${escapeHtml(category.slug)}/${escapeHtml(word)}/</strong>. Audio uses free dictionary clips when available, otherwise browser speech after you click Play.</p>
        ${meaningsHtml}
      </article>

      <section class="related">
        <h2>More in ${escapeHtml(category.title)}</h2>
        <div class="chip-row">${siblingHtml}</div>
        <p class="note"><a href="../">All ${escapeHtml(category.title)} words</a> · <a href="../../words/">All directories</a></p>
      </section>
    </main>
    <script src="../../assets/word-play.js"></script>
${foot}`;
}

function renderCategoryPage(category, words) {
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

function renderWordsHub(categories) {
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
      <p class="lede">Every entry is a real page with its own path — for example <code>/medical/appendectomy/</code> — not a single-page app route.</p>
      <div class="card-stack">${cards}</div>
    </main>
${foot}`;
}

async function main() {
  // Clean previous generated category folders (keep known static roots)
  for (const c of catalog.categories) {
    const dir = join(ROOT, c.slug);
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  }
  const wordsDir = join(ROOT, "words");
  if (existsSync(wordsDir)) rmSync(wordsDir, { recursive: true, force: true });

  mkdirSync(wordsDir, { recursive: true });
  writeFileSync(join(wordsDir, "index.html"), renderWordsHub(catalog.categories));

  const allPaths = [];
  let generated = 0;

  for (const category of catalog.categories) {
    const catDir = join(ROOT, category.slug);
    mkdirSync(catDir, { recursive: true });
    const words = [...new Set(category.words.map((w) => w.toLowerCase()))].sort();
    writeFileSync(join(catDir, "index.html"), renderCategoryPage(category, words));
    allPaths.push(`/${category.slug}/`);

    for (const word of words) {
      process.stdout.write(`Generating /${category.slug}/${word}/ ... `);
      const [entry, syllables] = await Promise.all([lookupWord(word), syllableCount(word)]);
      const pageDir = join(catDir, word);
      mkdirSync(pageDir, { recursive: true });
      writeFileSync(
        join(pageDir, "index.html"),
        renderWordPage({ category, word, entry, syllables, siblings: words }),
      );
      allPaths.push(`/${category.slug}/${word}/`);
      generated += 1;
      console.log(entry ? "ok" : "ok (minimal)");
      await sleep(120); // be kind to free APIs
    }
  }

  // Machine-readable index for search redirects
  const flat = [];
  for (const category of catalog.categories) {
    for (const word of category.words) {
      flat.push({
        word: word.toLowerCase(),
        category: category.slug,
        path: `/${category.slug}/${word.toLowerCase()}/`,
      });
    }
  }
  writeFileSync(
    join(ROOT, "assets/word-index.js"),
    `window.SPEAKUR_WORD_INDEX = ${JSON.stringify(flat, null, 2)};\n`,
  );

  writeFileSync(join(ROOT, "data/generated-paths.json"), JSON.stringify(allPaths, null, 2));
  console.log(`\nDone. ${generated} word pages + ${catalog.categories.length} category hubs + /words/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
