import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { EZOIC_HEAD_SCRIPTS } from "./ezoic-head.mjs";
import { renderWordSeoHeadTags } from "./word-seo.mjs";
import {
  extractOrigin,
  getCommonMistake,
  hyphenateByCount,
  respellingFromIpa,
  stressFromIpa,
  todayIsoDate,
} from "./word-linguistics.mjs";

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

/** Category → related editorial guides (static guide.html?slug=) */
export const CATEGORY_GUIDE_LINKS = {
  food: [
    ["commonly-mispronounced-english-words", "Commonly mispronounced words"],
    ["how-to-read-ipa-phonetic-symbols", "How to read IPA"],
  ],
  places: [
    ["commonly-mispronounced-english-words", "Commonly mispronounced words"],
    ["us-vs-uk-pronunciation-differences", "US vs UK pronunciation"],
  ],
  names: [
    ["commonly-mispronounced-english-words", "Commonly mispronounced words"],
    ["linguistic-accents-in-global-marketing", "Accents in marketing"],
  ],
  brands: [
    ["choosing-voices-for-brand-consistency", "Choosing brand voices"],
    ["linguistic-accents-in-global-marketing", "Accents in marketing"],
  ],
  medical: [
    ["science-of-syllables-and-stress", "Syllables and stress"],
    ["how-to-read-ipa-phonetic-symbols", "How to read IPA"],
  ],
  animals: [
    ["commonly-mispronounced-english-words", "Commonly mispronounced words"],
    ["building-a-pronunciation-practice-routine", "Practice routine"],
  ],
  science: [
    ["science-of-syllables-and-stress", "Syllables and stress"],
    ["how-to-read-ipa-phonetic-symbols", "How to read IPA"],
  ],
  business: [
    ["linguistic-accents-in-global-marketing", "Accents in marketing"],
    ["why-pronunciation-matters-for-learners", "Why pronunciation matters"],
  ],
  everyday: [
    ["us-vs-uk-pronunciation-differences", "US vs UK pronunciation"],
    ["building-a-pronunciation-practice-routine", "Practice routine"],
  ],
  arts: [
    ["choosing-voices-for-brand-consistency", "Choosing brand voices"],
    ["how-to-read-ipa-phonetic-symbols", "How to read IPA"],
  ],
  sports: [
    ["building-a-pronunciation-practice-routine", "Practice routine"],
    ["commonly-mispronounced-english-words", "Commonly mispronounced words"],
  ],
  tech: [
    ["how-ai-speech-synthesis-works", "How AI speech synthesis works"],
    ["on-demand-tts-and-click-gating", "On-demand TTS"],
  ],
  nature: [
    ["science-of-syllables-and-stress", "Syllables and stress"],
    ["how-to-read-ipa-phonetic-symbols", "How to read IPA"],
  ],
  law: [
    ["commonly-mispronounced-english-words", "Commonly mispronounced words"],
    ["how-to-read-ipa-phonetic-symbols", "How to read IPA"],
  ],
  mythology: [
    ["commonly-mispronounced-english-words", "Commonly mispronounced words"],
    ["how-to-read-ipa-phonetic-symbols", "How to read IPA"],
  ],
};

const HUB_SLUGS = [
  "food", "places", "names", "brands", "medical", "animals", "science",
  "business", "everyday", "arts", "sports", "tech", "nature", "law", "mythology",
];

export function renderExploreMoreHtml({ depth = 2, categorySlug = "", includeGuides = true } = {}) {
  const root = "../".repeat(depth) || "./";
  const guideLinks = includeGuides
    ? (CATEGORY_GUIDE_LINKS[categorySlug] || [
        ["how-to-read-ipa-phonetic-symbols", "How to read IPA"],
        ["commonly-mispronounced-english-words", "Commonly mispronounced words"],
      ])
    : [];
  const otherHubs = HUB_SLUGS.filter((s) => s !== categorySlug).slice(0, 6);

  const guideHtml = guideLinks
    .map(
      ([slug, label]) =>
        `<li><a href="${root}guide.html?slug=${encodeURIComponent(slug)}">${escapeHtml(label)}</a></li>`,
    )
    .join("");
  const hubHtml = otherHubs
    .map((s) => `<li><a href="${root}${s}/">${escapeHtml(s)}</a></li>`)
    .join("");

  return `<section class="explore-more" data-crosslinks="1">
        <h2>Explore more on Speakur</h2>
        <div class="explore-grid">
          <div>
            <h3>Tools</h3>
            <ul>
              <li><a href="${root}tools/">Practice tools hub</a></li>
              <li><a href="${root}tools/ipa/">IPA cheat sheet</a></li>
              <li><a href="${root}tools/minimal-pairs/">Minimal-pair trainer</a></li>
              <li><a href="${root}index.html">Pronunciation search</a></li>
              <li><a href="${root}words/">Word directories</a></li>
              <li><a href="${root}guides.html">All guides</a></li>
            </ul>
          </div>
          ${
            guideHtml
              ? `<div><h3>Related guides</h3><ul>${guideHtml}</ul></div>`
              : ""
          }
          <div>
            <h3>Trust</h3>
            <ul>
              <li><a href="${root}methodology.html">Methodology &amp; sources</a></li>
              <li><a href="${root}editorial-policy.html">Editorial policy</a></li>
              <li><a href="${root}correction-policy.html">Correction policy</a></li>
              <li><a href="${root}authors/speakur-editorial.html">Authors</a></li>
            </ul>
          </div>
          <div>
            <h3>Other directories</h3>
            <ul>${hubHtml}</ul>
          </div>
        </div>
      </section>`;
}

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
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
          <a href="${home}words/"${active === "words" ? ' aria-current="page"' : ""}>Words</a>
          <a href="${home}guides.html"${active === "guides" ? ' aria-current="page"' : ""}>Guides</a>
          <details class="nav-dropdown"${active === "tools" ? " open" : ""}>
            <summary class="nav-pill"${active === "tools" ? ' aria-current="page"' : ""}>Tools</summary>
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
              <li><a href="${home}tools/generator/">Pronunciation generator</a></li>
            </ul>
          </details>
          <a href="${home}about.html"${active === "about" ? ' aria-current="page"' : ""}>About</a>
          <a href="${home}contact.html"${active === "contact" ? ' aria-current="page"' : ""}>Contact</a>
        </nav>
      </div>
    </header>
    <div id="speakur-ad-top" class="ad-slot ad-slot-top stable-slot" role="region" aria-label="Advertisement" style="min-height:90px"></div>`,
    foot: `
    <div id="speakur-ad-bottom" class="ad-slot ad-slot-bottom stable-slot" role="region" aria-label="Advertisement" style="min-height:90px"></div>
    <footer>
      <div class="footer-grid">
        <div>
          <div class="footer-brand">Speakur</div>
          <p class="footer-copy">Free pronunciation help for learners, creators, and professionals who need to say English words clearly and correctly.</p>
        </div>
        <div>
          <h3>Product</h3>
          <ul>
            <li><a href="${home}index.html">Pronunciation search</a></li>
            <li><a href="${home}words/index.html">Word directories</a></li>
            <li><a href="${home}tools/">Tools</a></li>
            <li><a href="${home}guides.html">Editorial guides</a></li>
            <li><a href="${home}research/">Research / Data</a></li>
            <li><a href="${home}donate.html">Donate</a></li>
          </ul>
        </div>
        <div>
          <h3>Trust &amp; legal</h3>
          <ul>
            <li><a href="${home}about.html">About Us</a></li>
            <li><a href="${home}methodology.html">Methodology &amp; sources</a></li>
            <li><a href="${home}editorial-policy.html">Editorial policy</a></li>
            <li><a href="${home}correction-policy.html">Correction policy</a></li>
            <li><a href="${home}authors/speakur-editorial.html">Authors</a></li>
            <li><a href="${home}contact.html">Contact</a></li>
            <li><a href="${home}privacy.html">Privacy Policy</a></li>
            <li><a href="${home}terms.html">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <p class="legal">© <span data-year></span> Speakur. <a href="${home}index.html">Home</a> · <a href="${home}tools/">Tools</a> · <a href="${home}words/">Words</a> · <a href="${home}guides.html">Guides</a></p>
    </footer>
  </div>
  <script defer src="${asset}site.js"></script>
  <script defer src="${asset}pwa-install.js"></script>
</body>
</html>`,
  };
}

export function collectSynonyms(entry, limit = 8) {
  const out = [];
  const seen = new Set();
  const push = (s) => {
    const w = String(s || "")
      .trim()
      .toLowerCase();
    if (!w || !/^[a-z][a-z'-]*$/.test(w) || seen.has(w)) return;
    seen.add(w);
    out.push(w);
  };
  for (const meaning of entry?.meanings || []) {
    for (const s of meaning.synonyms || []) push(s);
    for (const def of meaning.definitions || []) {
      for (const s of def.synonyms || []) push(s);
    }
    if (out.length >= limit) break;
  }
  return out.slice(0, limit);
}

export function stressCue({ phonetic = "", syllables = null } = {}) {
  const ipa = String(phonetic || "");
  const parts = [];
  if (syllables && Number(syllables) > 0) {
    const n = Number(syllables);
    parts.push(`${n} syllable${n === 1 ? "" : "s"}`);
  }
  if (ipa.includes("ˈ") || ipa.includes("'")) {
    parts.push("primary stress follows the ˈ mark in IPA");
  } else if (syllables && Number(syllables) > 1) {
    parts.push("listen for which beat is louder");
  } else if (!parts.length) {
    return "Listen once, then match the vowels and consonants you hear.";
  }
  return parts.join(" · ");
}

function renderAccentPlays({ usAudio, ukAudio, anyAudio }) {
  const us = usAudio || "";
  const uk = ukAudio || "";
  const fallback = anyAudio || "";
  const both = Boolean(us && uk);

  const btn = ({ label, sub, audio, lang, rate, extraClass = "" }) => {
    const rateAttr = rate ? ` data-rate="${rate}"` : "";
    const cls = `play btn-voice play-accent-btn${extraClass ? ` ${extraClass}` : ""}`;
    return `<button type="button" class="${cls}" data-play data-audio="${escapeHtml(audio)}" data-lang="${lang}"${rateAttr} style="min-height:2.75rem">
            <span class="play-stack"><span class="play-accent">${label}</span><span class="play-sub">${sub}</span></span>
          </button>`;
  };

  return `<div class="pronounce-panel" data-pronounce-panel="1">
          <p class="pronounce-label">Hear it clearly</p>
          <div class="plays accent-plays interactive-slot" style="min-height:2.75rem">
            ${btn({ label: "US", sub: "American", audio: us || fallback, lang: "en-US" })}
            ${btn({ label: "UK", sub: "British", audio: uk || fallback, lang: "en-GB" })}
            ${btn({
              label: "Slow",
              sub: "Practice pace",
              audio: us || uk || fallback,
              lang: us ? "en-US" : "en-GB",
              rate: "0.72",
              extraClass: "play-slow",
            })}
          </div>
          ${
            both
              ? `<div class="compare-row">
            <button type="button" class="play play-compare" data-compare data-audio-us="${escapeHtml(us)}" data-audio-uk="${escapeHtml(uk)}" style="min-height:2.75rem">
              <span class="icon">⇄</span> Compare US &amp; UK
            </button>
            <p class="compare-hint">Plays American, then British — notice vowels and r-sounds.</p>
          </div>`
              : `<p class="note accent-note">Labeled accents play free dictionary clips when available; otherwise browser speech after you click.</p>`
          }
        </div>`;
}

function renderRelatedFormsHtml(synonyms, word, depth = 2) {
  if (!synonyms?.length) return "";
  const root = "../".repeat(depth) || "./";
  const chips = synonyms
    .filter((s) => s !== word)
    .map(
      (s) =>
        `<a class="chip" href="${root}index.html?q=${encodeURIComponent(s)}">${escapeHtml(s)}</a>`,
    )
    .join("");
  if (!chips) return "";
  return `<section class="related-forms" aria-labelledby="related-forms-heading">
        <h2 id="related-forms-heading">Related words to practice</h2>
        <p class="note">Say these next — nearby meanings help lock in the sounds.</p>
        <div class="chip-row">${chips}</div>
      </section>`;
}

function renderPracticeStripHtml({ word, categorySlug, hasBothAccents, depth = 2 }) {
  const root = "../".repeat(depth) || "./";
  const guides = CATEGORY_GUIDE_LINKS[categorySlug] || [
    ["how-to-read-ipa-phonetic-symbols", "How to read IPA"],
    ["building-a-pronunciation-practice-routine", "Practice routine"],
  ];
  const guideLinks = guides
    .slice(0, 2)
    .map(
      ([slug, label]) =>
        `<a href="${root}guide.html?slug=${encodeURIComponent(slug)}">${escapeHtml(label)}</a>`,
    )
    .join(" · ");
  return `<section class="practice-strip" data-practice-strip="1" aria-labelledby="practice-strip-heading">
        <h2 id="practice-strip-heading">Keep practicing</h2>
        <ul class="practice-links">
          <li><a href="${root}tools/minimal-pairs/">Minimal pairs</a> — train similar sounds</li>
          <li><a href="${root}tools/ipa/">IPA cheat sheet</a> — decode the symbols for “${escapeHtml(word)}”</li>
          ${
            hasBothAccents
              ? `<li><a href="${root}tools/us-uk/">US vs UK tool</a> — compare accents side by side</li>`
              : `<li><a href="${root}guide.html?slug=us-vs-uk-pronunciation-differences">US vs UK guide</a> — why accents differ</li>`
          }
          <li>${guideLinks}</li>
        </ul>
      </section>`;
}

export function renderWordPage({
  category,
  word,
  entry,
  syllables,
  siblings,
  verifiedAt = null,
  relatedExtra = [],
}) {
  const path = `/${category.slug}/${word}/`;
  const verified = verifiedAt || todayIsoDate();
  const description = `Pronunciation reference for “${word}”: IPA, syllables, stress, definition, and free US/UK audio on Speakur.`;
  const phonetic =
    entry?.phonetic ||
    entry?.phonetics?.find((p) => p.text)?.text ||
    "";
  const seoExtra = renderWordSeoHeadTags({
    word,
    path,
    description,
    phonetic,
    syllables,
  });
  const { head, foot } = chrome({
    title: `${word} pronunciation · ${category.title} · Speakur`,
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
  const nativeAudio =
    phonetics.find((p) => p.accent === "other" && p.audio && p.audio !== usAudio && p.audio !== ukAudio)
      ?.audio || "";
  const anyAudio = usAudio || ukAudio || nativeAudio || phonetics.find((p) => p.audio)?.audio || "";
  const hasBothAccents = Boolean(usAudio && ukAudio);

  const meanings = [];
  for (const meaning of entry?.meanings || []) {
    for (const def of meaning.definitions || []) {
      if (!def.definition) continue;
      meanings.push({
        pos: meaning.partOfSpeech || "unknown",
        def: def.definition,
        ex: def.example || null,
      });
      if (meanings.length >= 3) break;
    }
    if (meanings.length >= 3) break;
  }

  const ipaList = [...new Set(phonetics.map((p) => p.text).filter(Boolean))];
  const mistake = getCommonMistake(word);
  const primaryIpa = phonetic || mistake?.ipa || ipaList[0] || "";
  const respelling =
    (mistake?.preferred ? String(mistake.preferred).split(/[(/]/)[0].trim() : "") ||
    respellingFromIpa(primaryIpa);
  const syllableBreak = mistake?.syllables || hyphenateByCount(word, syllables);
  const stressLabel =
    stressFromIpa(primaryIpa, syllables) ||
    (mistake ? `Primary stress early — prefer “${respelling || word}”` : "") ||
    stressCue({ phonetic: primaryIpa, syllables });
  const origin = extractOrigin(entry);
  const synonyms = collectSynonyms(entry);
  const sourceLabel =
    entry?.source === "datamuse"
      ? "Datamuse (definitions)"
      : entry
        ? "Free Dictionary API"
        : "Speakur catalog + browser speech fallback";

  const metaRows = [
    primaryIpa ? `<div><dt>IPA</dt><dd lang="en-fonipa">${escapeHtml(primaryIpa)}${ipaList.length > 1 ? ` · ${escapeHtml(ipaList.filter((x) => x !== primaryIpa).join(" · "))}` : ""}</dd></div>` : "",
    respelling ? `<div><dt>Phonetic spelling</dt><dd>${escapeHtml(respelling)}</dd></div>` : "",
    syllables || syllableBreak
      ? `<div><dt>Syllables</dt><dd>${syllableBreak ? escapeHtml(syllableBreak) : ""}${syllables ? `${syllableBreak ? " · " : ""}${syllables}` : ""}</dd></div>`
      : "",
    stressLabel ? `<div><dt>Stress</dt><dd>${escapeHtml(stressLabel)}</dd></div>` : "",
  ]
    .filter(Boolean)
    .join("\n          ");

  const listenBlock = `<section class="ref-listen" aria-labelledby="listen-heading">
        <h2 id="listen-heading">Listen</h2>
        <div class="plays accent-plays interactive-slot" style="min-height:2.75rem">
          <button type="button" class="play btn-voice" data-play data-audio="${escapeHtml(usAudio || anyAudio)}" data-lang="en-US" style="min-height:2.75rem"><span class="play-stack"><span class="play-accent">US</span><span class="play-sub">American</span></span></button>
          <button type="button" class="play btn-voice" data-play data-audio="${escapeHtml(ukAudio || anyAudio)}" data-lang="en-GB" style="min-height:2.75rem"><span class="play-stack"><span class="play-accent">UK</span><span class="play-sub">British</span></span></button>
          ${
            nativeAudio
              ? `<button type="button" class="play btn-voice" data-play data-audio="${escapeHtml(nativeAudio)}" data-lang="en" style="min-height:2.75rem"><span class="play-stack"><span class="play-accent">Native</span><span class="play-sub">Source clip</span></span></button>`
              : ""
          }
          <button type="button" class="play btn-voice play-slow" data-play data-audio="${escapeHtml(usAudio || ukAudio || anyAudio)}" data-lang="en-US" data-rate="0.72" style="min-height:2.75rem"><span class="play-stack"><span class="play-accent">Slow</span><span class="play-sub">Practice pace</span></span></button>
        </div>
        ${
          hasBothAccents
            ? `<div class="compare-row">
          <button type="button" class="play play-compare" data-compare data-audio-us="${escapeHtml(usAudio)}" data-audio-uk="${escapeHtml(ukAudio)}" style="min-height:2.75rem"><span class="icon">⇄</span> Compare US &amp; UK</button>
        </div>`
            : ""
        }
        <p class="note">Dictionary clips play when available; otherwise browser speech after you click. Native appears only when a non-US/UK source clip exists.</p>
      </section>`;

  const definitionHtml = meanings.length
    ? `<section class="meanings ref-definition" aria-labelledby="def-heading">
        <h2 id="def-heading">Definition</h2>
        ${meanings
          .map(
            (m) => `<div class="sense">
            <p class="pos">${escapeHtml(m.pos)}</p>
            <p class="def">${escapeHtml(m.def)}</p>
            ${m.ex ? `<p class="ex"><span class="ex-label">Example</span> “${escapeHtml(m.ex)}”</p>` : ""}
          </div>`,
          )
          .join("")}
      </section>`
    : "";

  const mistakeHtml = mistake
    ? `<section class="common-mistake" aria-labelledby="mistake-heading">
        <h2 id="mistake-heading">Common mispronunciation</h2>
        <p class="mistake-bad"><strong>Avoid:</strong> ${escapeHtml(mistake.mistake)}</p>
        <p class="mistake-good"><strong>Prefer:</strong> ${escapeHtml(mistake.preferred)}</p>
        ${mistake.note ? `<p class="note">${escapeHtml(mistake.note)}</p>` : ""}
      </section>`
    : "";

  const originHtml = origin
    ? `<section class="origin" aria-labelledby="origin-heading">
        <h2 id="origin-heading">Origin</h2>
        <p>${escapeHtml(origin)}</p>
      </section>`
    : "";

  const relatedChips = [
    ...siblings.filter((w) => w !== word).slice(0, 10),
    ...synonyms.filter((s) => s !== word),
    ...relatedExtra.filter((w) => w !== word),
  ];
  const seenRel = new Set();
  const relatedHtmlBits = [];
  for (const w of relatedChips) {
    const key = String(w).toLowerCase();
    if (seenRel.has(key)) continue;
    seenRel.add(key);
    const isSibling = siblings.includes(w);
    const href = isSibling
      ? `../${encodeURIComponent(w)}/`
      : `../../index.html?q=${encodeURIComponent(w)}`;
    relatedHtmlBits.push(`<a class="chip" href="${href}">${escapeHtml(w)}</a>`);
    if (relatedHtmlBits.length >= 14) break;
  }
  const relatedHtml = relatedHtmlBits.length
    ? `<section class="related ref-related" aria-labelledby="related-heading">
        <h2 id="related-heading">Related words</h2>
        <div class="chip-row">${relatedHtmlBits.join("")}</div>
      </section>`
    : "";

  const practiceHtml = `<section class="practice-block" aria-labelledby="practice-heading">
        <h2 id="practice-heading">Practice</h2>
        <ol class="practice-cues">
          <li>Play <strong>US</strong>, then <strong>UK</strong>${hasBothAccents ? " (or Compare)" : ""} — note the first differing vowel.</li>
          <li>${stressLabel ? escapeHtml(stressLabel) + "." : "Match the loudest beat you hear."} Shadow <strong>Slow</strong> once.</li>
          <li>Say “${escapeHtml(word)}” three times from memory, then replay normal speed.</li>
        </ol>
        <p class="note"><a href="../../tools/">More practice tools</a> · <a href="../../guide.html?slug=building-a-pronunciation-practice-routine">Practice routine guide</a></p>
      </section>`;

  const recordHtml = `<section class="record-block" aria-labelledby="record-heading" data-record-stub="1">
        <h2 id="record-heading">Record yourself</h2>
        <p class="note">Local microphone playback only — no upload, no AI scoring.</p>
        <div class="record-controls interactive-slot">
          <button type="button" class="play btn-voice" data-record-start style="min-height:2.75rem">Record</button>
          <button type="button" class="play btn-voice play-slow" data-record-stop hidden style="min-height:2.75rem">Stop</button>
          <button type="button" class="play btn-voice" data-record-play hidden style="min-height:2.75rem">Play recording</button>
        </div>
        <p class="record-status note" data-record-status></p>
      </section>`;

  const sourcesHtml = `<section class="sources trust-meta" aria-labelledby="sources-heading">
        <h2 id="sources-heading">Sources</h2>
        <ul class="source-list">
          <li>Linguistic fields: ${escapeHtml(sourceLabel)}</li>
          <li>Audio: Free Dictionary API clips when present; otherwise click-gated browser speech</li>
          <li>Editorial notes: <a href="../../methodology.html">Pronunciation methodology</a> · <a href="../../correction-policy.html">Correction policy</a></li>
          ${mistake ? `<li>Common-mistake note: Speakur curated entry for “${escapeHtml(word)}”</li>` : ""}
        </ul>
        <p class="last-verified"><strong>Last verified:</strong> <time datetime="${escapeHtml(verified)}">${escapeHtml(verified)}</time></p>
      </section>`;

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

      <p class="eyebrow">${escapeHtml(category.title)} · pronunciation reference</p>
      <article class="word-card word-result-slot stable-slot" data-word="${escapeHtml(word)}" data-pronounce-ux="1" data-verified="${escapeHtml(verified)}" style="min-height:18rem">
        <div class="word-head">
          <div>
            <h1>${escapeHtml(word)}</h1>
            ${respelling ? `<p class="phonetic-spelling">${escapeHtml(respelling)}</p>` : ""}
            <p class="ipa" lang="en-fonipa">${escapeHtml(primaryIpa || "IPA unavailable")}</p>
          </div>
        </div>

        ${listenBlock}

        ${metaRows ? `<dl class="meta ref-meta">${metaRows}</dl>` : ""}

        ${definitionHtml}
        ${mistakeHtml}
        ${originHtml}
        ${relatedHtml}
        ${practiceHtml}
        ${recordHtml}
        ${sourcesHtml}
      </article>

      <div id="speakur-ad-mid" class="ad-slot ad-slot-mid stable-slot" role="region" aria-label="Advertisement" style="min-height:90px"></div>

      <section class="related related-grid-slot stable-slot" style="min-height:4rem">
        <h2>More in ${escapeHtml(category.title)}</h2>
        <div class="chip-row">${siblings
          .filter((w) => w !== word)
          .slice(0, 12)
          .map((w) => `<a class="chip" href="../${encodeURIComponent(w)}/">${escapeHtml(w)}</a>`)
          .join("")}</div>
        <p class="note"><a href="../">All ${escapeHtml(category.title)} words</a> · <a href="../../words/">All directories</a> · <a href="../../tools/">Tools</a> · <a href="../../methodology.html">Methodology</a></p>
      </section>

      ${renderExploreMoreHtml({ depth: 2, categorySlug: category.slug })}
    </main>
    <script defer src="../../assets/word-play.js"></script>
${foot}`;
}

export function renderCategoryPage(category, words, subsections = []) {
  const { head, foot } = chrome({
    title: `${category.title} pronunciations · Speakur`,
    description: category.description,
    depth: 1,
    active: "words",
  });

  const subHtml = subsections.length
    ? `<section class="ia-subsections" data-ia-subsections="1">
        <h2>Browse by topic</h2>
        <p class="note">Curated hubs within ${escapeHtml(category.title)}. Word page URLs stay the same.</p>
        <div class="card-stack">
          ${subsections
            .map(
              (s) => `<a class="card" href="${escapeHtml(s.href)}">
            <div class="meta">${s.count} words</div>
            <h2>${escapeHtml(s.title)}</h2>
            <p>${escapeHtml(s.description || "")}</p>
            <p class="note">${escapeHtml(s.pathLabel || s.href)}</p>
          </a>`,
            )
            .join("\n")}
        </div>
      </section>`
    : "";

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
      ${subHtml}
      <ul class="word-index">${list}</ul>
      ${renderExploreMoreHtml({ depth: 1, categorySlug: category.slug })}
    </main>
${foot}`;
}

/**
 * Hierarchical words hub matching the Speakur IA tree.
 * @param {Array} categories catalog categories
 * @param {{ treeHtml?: string }} extras optional pre-rendered IA tree block
 */
export function renderWordsHub(categories, extras = {}) {
  const { head, foot } = chrome({
    title: "Word directories · Speakur",
    description: "Browse Speakur pronunciation pages by category — medical, food, everyday, science, and more.",
    depth: 1,
    active: "words",
  });

  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const primaryOrder = [
    "everyday",
    "food",
    "names",
    "places",
    "brands",
    "medical",
    "science",
    "tech",
    "sports",
  ];
  const primary = primaryOrder.map((s) => bySlug.get(s)).filter(Boolean);
  const rest = categories.filter((c) => !primaryOrder.includes(c.slug));

  const card = (c) => `<a class="card" href="../${escapeHtml(c.slug)}/">
        <div class="meta">${c.words.length} words</div>
        <h2>${escapeHtml(c.title)}</h2>
        <p>${escapeHtml(c.description)}</p>
        <p class="note">/${escapeHtml(c.slug)}/</p>
      </a>`;

  const curated = `
      <section class="ia-subsections" data-ia-words-curated="1">
        <h2>Words collections</h2>
        <p class="note">Curated lists drawn from the live catalog.</p>
        <div class="card-stack">
          <a class="card" href="./difficult/"><h2>Difficult</h2><p>Unusual spellings and stress surprises.</p><p class="note">/words/difficult/</p></a>
          <a class="card" href="./commonly-mispronounced/"><h2>Commonly mispronounced</h2><p>High-traffic tricky everyday words.</p><p class="note">/words/commonly-mispronounced/</p></a>
          <a class="card" href="./academic/"><h2>Academic</h2><p>Classroom and research vocabulary.</p><p class="note">/words/academic/</p></a>
          <a class="card" href="./technical/"><h2>Technical</h2><p>Engineering and software terms.</p><p class="note">/words/technical/</p></a>
          <a class="card" href="../everyday/"><h2>Everyday</h2><p>Common English pronunciation pages.</p><p class="note">/everyday/</p></a>
        </div>
      </section>`;

  return `${head}
    <main>
      <p class="eyebrow">Directories</p>
      <h1>Words by topic</h1>
      <p class="lede">Browse thousands of pronunciation pages organized by topic—medical terms, food, places, tech, and everyday English. Each word includes IPA, syllable cues, and free click-to-play US and UK audio.</p>
      <p class="note"><a href="../index.html">Search any word</a> · <a href="../tools/">Tools</a> · <a href="../guides.html">Editorial guides</a> · <a href="../research/">Research / Data</a> · <a href="../donate.html">Donate</a></p>
      ${extras.treeHtml || ""}
      ${curated}
      <h2>Primary directories</h2>
      <div class="card-stack">${primary.map(card).join("\n")}</div>
      <h2>More directories</h2>
      <div class="card-stack">${rest.map(card).join("\n")}</div>
      ${renderExploreMoreHtml({ depth: 1, categorySlug: "", includeGuides: true })}
    </main>
${foot}`;
}

/**
 * Curated subsection / collection hub listing existing word pages.
 * links: [{ word, href, categoryTitle }]
 */
export function renderSubsectionHub({
  title,
  description,
  depth,
  crumbs,
  pathLabel,
  links,
  guideLinks = [],
  parentHref,
  parentTitle,
  active = "words",
}) {
  const { head, foot } = chrome({
    title: `${title} · Speakur`,
    description,
    depth,
    active,
  });
  const root = "../".repeat(depth) || "./";
  const crumbHtml = crumbs
    .map((c) =>
      c.href
        ? `<a href="${escapeHtml(c.href)}">${escapeHtml(c.label)}</a>`
        : `<span>${escapeHtml(c.label)}</span>`,
    )
    .join("\n        <span>/</span>\n        ");

  const list = links
    .map(
      (row) =>
        `<li><a href="${escapeHtml(row.href)}"><span>${escapeHtml(row.word)}</span><span class="hint">${escapeHtml(row.hint || row.href)}</span></a></li>`,
    )
    .join("\n");

  const guides = guideLinks
    .map(
      ([slug, label]) =>
        `<li><a href="${root}guide.html?slug=${encodeURIComponent(slug)}">${escapeHtml(label)}</a></li>`,
    )
    .join("");

  return `${head}
    <main>
      <nav class="crumbs" aria-label="Breadcrumb">
        ${crumbHtml}
      </nav>
      <p class="eyebrow">Curated hub</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="lede">${escapeHtml(description)}</p>
      <p class="note">${links.length} existing pronunciation pages${pathLabel ? ` · ${escapeHtml(pathLabel)}` : ""}${
        parentHref
          ? ` · <a href="${escapeHtml(parentHref)}">All ${escapeHtml(parentTitle || "words")}</a>`
          : ""
      }</p>
      <ul class="word-index">${list}</ul>
      ${
        guides
          ? `<section class="related"><h2>Related guides</h2><ul>${guides}</ul></section>`
          : ""
      }
      ${renderExploreMoreHtml({ depth, categorySlug: "", includeGuides: true })}
    </main>
${foot}`;
}

export function renderSimpleLanding({
  title,
  description,
  depth,
  active,
  eyebrow,
  lede,
  bodyHtml,
  crumbs = [],
}) {
  const { head, foot } = chrome({ title: `${title} · Speakur`, description, depth, active });
  const crumbHtml = crumbs.length
    ? `<nav class="crumbs" aria-label="Breadcrumb">
        ${crumbs
          .map((c) =>
            c.href
              ? `<a href="${escapeHtml(c.href)}">${escapeHtml(c.label)}</a>`
              : `<span>${escapeHtml(c.label)}</span>`,
          )
          .join("\n        <span>/</span>\n        ")}
      </nav>`
    : "";
  return `${head}
    <main>
      ${crumbHtml}
      <p class="eyebrow">${escapeHtml(eyebrow || title)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="lede">${escapeHtml(lede || description)}</p>
      ${bodyHtml || ""}
      ${renderExploreMoreHtml({ depth, categorySlug: "", includeGuides: true })}
    </main>
${foot}`;
}

async function fetchJson(url, { timeoutMs = 12000, retries = 2 } = {}) {
  let lastErr = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (res.status === 404) return { ok: false, status: 404 };
      if (!res.ok) {
        lastErr = new Error(`HTTP ${res.status}`);
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
        continue;
      }
      return { ok: true, data: await res.json() };
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  return { ok: false, error: lastErr };
}

export async function lookupWord(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  const primary = await fetchJson(url);
  if (primary.ok && Array.isArray(primary.data) && primary.data[0]) {
    return { ok: true, entry: primary.data[0] };
  }
  if (primary.status === 404) {
    // Fall through to Datamuse — some spellings 404 on dictionaryapi
  }

  // Datamuse fallback (definitions + phonetic-ish metadata)
  const dm = await fetchJson(
    `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&qe=sp&md=dpsr&max=1`,
  );
  if (!dm.ok || !Array.isArray(dm.data) || !dm.data[0]) {
    return { ok: false, reason: primary.status === 404 ? "not_found" : "upstream" };
  }
  const row = dm.data[0];
  if (String(row.word || "").toLowerCase() !== String(word).toLowerCase()) {
    return { ok: false, reason: "not_found" };
  }
  const defs = row.defs || [];
  if (!defs.length) return { ok: false, reason: "not_found" };

  const byPos = new Map();
  for (const line of defs.slice(0, 8)) {
    const tab = line.indexOf("\t");
    const pos = tab === -1 ? "unknown" : line.slice(0, tab);
    const definition = tab === -1 ? line : line.slice(tab + 1);
    if (!definition) continue;
    if (!byPos.has(pos)) byPos.set(pos, []);
    byPos.get(pos).push({ definition });
  }
  const meanings = [...byPos.entries()].map(([partOfSpeech, definitions]) => ({
    partOfSpeech,
    definitions,
  }));
  return {
    ok: true,
    entry: {
      word,
      phonetic: "",
      phonetics: [],
      meanings,
      source: "datamuse",
    },
  };
}

export async function syllableCount(word) {
  try {
    const dm = await fetchJson(
      `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&qe=sp&md=s&max=1`,
    );
    if (dm.ok && Array.isArray(dm.data) && dm.data[0]?.numSyllables) {
      return dm.data[0].numSyllables;
    }
  } catch {
    /* fall through */
  }
  return null;
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
