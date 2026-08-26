/**
 * Patch existing static word pages toward the reference layout:
 * - Replace cloned HowTo visible sections with short practice cues
 * - Inject Sources + Last verified when missing
 * - Inject curated common-mistake block when applicable
 *
 * Does NOT wipe URLs. Safe to run repeatedly.
 *
 * Usage:
 *   node scripts/patch-word-reference.mjs
 *   node scripts/patch-word-reference.mjs --limit=200
 *   node scripts/patch-word-reference.mjs --words=worcestershire,quinoa,epitome
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { getCommonMistake, todayIsoDate } from "./lib/word-linguistics.mjs";

const ROOT = process.cwd();
const CATEGORIES = [
  "food", "places", "names", "brands", "medical", "animals", "science",
  "business", "everyday", "arts", "sports", "tech", "nature", "law", "mythology",
];
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : Infinity;
const wordsArg = process.argv.find((a) => a.startsWith("--words="));
const ONLY = wordsArg
  ? new Set(wordsArg.split("=")[1].split(",").map((w) => w.trim().toLowerCase()))
  : null;

function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function extractWord(html, fallback) {
  const m = html.match(/data-word="([^"]+)"/);
  return (m ? m[1] : fallback || "").toLowerCase();
}

function extractIpa(html) {
  const m = html.match(/class="ipa"[^>]*>\s*([^<]+)/i);
  return m ? m[1].trim() : "";
}

function practiceBlock(word, ipa) {
  const stress = ipa.includes("ˈ") || ipa.includes("'")
    ? "Put weight on the ˈ-marked syllable in the IPA."
    : "Match the loudest beat you hear.";
  return `<section class="practice-block" aria-labelledby="practice-heading" data-patched-practice="1">
        <h2 id="practice-heading">Practice</h2>
        <ol class="practice-cues">
          <li>Play <strong>US</strong>, then <strong>UK</strong> — note the first differing vowel.</li>
          <li>${escapeHtml(stress)} Shadow <strong>Slow</strong> once.</li>
          <li>Say “${escapeHtml(word)}” three times from memory, then replay normal speed.</li>
        </ol>
        <p class="note"><a href="../../tools/">More practice tools</a> · <a href="../../methodology.html">Methodology</a></p>
      </section>`;
}

function mistakeBlock(word, mistake) {
  return `<section class="common-mistake" aria-labelledby="mistake-heading" data-patched-mistake="1">
        <h2 id="mistake-heading">Common mispronunciation</h2>
        <p class="mistake-bad"><strong>Avoid:</strong> ${escapeHtml(mistake.mistake)}</p>
        <p class="mistake-good"><strong>Prefer:</strong> ${escapeHtml(mistake.preferred)}</p>
        ${mistake.note ? `<p class="note">${escapeHtml(mistake.note)}</p>` : ""}
      </section>`;
}

function sourcesBlock(word, verified, hasMistake) {
  return `<section class="sources trust-meta" aria-labelledby="sources-heading" data-patched-sources="1">
        <h2 id="sources-heading">Sources</h2>
        <ul class="source-list">
          <li>Linguistic fields: Free Dictionary API / Datamuse when present</li>
          <li>Audio: dictionary clips when available; otherwise click-gated browser speech</li>
          <li>Editorial: <a href="../../methodology.html">Methodology</a> · <a href="../../correction-policy.html">Correction policy</a></li>
          ${hasMistake ? `<li>Common-mistake note: Speakur curated entry for “${escapeHtml(word)}”</li>` : ""}
        </ul>
        <p class="last-verified"><strong>Last verified:</strong> <time datetime="${verified}">${verified}</time></p>
      </section>`;
}

function patchHtml(html, word) {
  let out = html;
  let changed = false;
  const ipa = extractIpa(out);
  const verified = todayIsoDate();
  const mistake = getCommonMistake(word);

  // Kill cloned HowTo list sections (visible filler)
  if (/<section class="howto"[\s\S]*?<\/section>/i.test(out)) {
    out = out.replace(
      /<section class="howto"[\s\S]*?<\/section>/i,
      practiceBlock(word, ipa),
    );
    changed = true;
  } else if (!out.includes('data-patched-practice="1"') && !out.includes('id="practice-heading"')) {
    // Insert practice before related or explore-more
    if (out.includes('<section class="related')) {
      out = out.replace(
        '<section class="related',
        `${practiceBlock(word, ipa)}\n\n      <section class="related`,
      );
      changed = true;
    }
  }

  if (mistake && !out.includes('id="mistake-heading"')) {
    const block = mistakeBlock(word, mistake);
    if (out.includes('<section class="meanings"')) {
      out = out.replace(
        /(<\/section>\s*)(<section class="howto"|<section class="practice-block"|<section class="related"|<div id="speakur-ad-mid")/,
        `</section>\n      ${block}\n\n      $2`,
      );
      // fallback if regex missed
      if (!out.includes('id="mistake-heading"')) {
        out = out.replace(
          /<\/article>/,
          `${block}\n      </article>`,
        );
      }
    } else {
      out = out.replace(/<\/article>/, `${block}\n      </article>`);
    }
    changed = true;
  }

  if (!out.includes('data-patched-sources="1"') && !out.includes('id="sources-heading"')) {
    const src = sourcesBlock(word, verified, Boolean(mistake));
    if (out.includes("</article>")) {
      out = out.replace(/<\/article>/, `${src}\n      </article>`);
      changed = true;
    }
  }

  // Trust footer link nudge on word pages
  if (out.includes("Trust &amp; legal") && !out.includes("methodology.html")) {
    out = out.replace(
      /(<h3>Trust &amp; legal<\/h3>\s*<ul>\s*<li><a href="[^"]*about\.html">About Us<\/a><\/li>)/,
      `$1\n            <li><a href="../../methodology.html">Methodology &amp; sources</a></li>\n            <li><a href="../../editorial-policy.html">Editorial policy</a></li>\n            <li><a href="../../correction-policy.html">Correction policy</a></li>`,
    );
    changed = true;
  }

  return { out, changed };
}

function collectPages() {
  const pages = [];
  for (const slug of CATEGORIES) {
    const catDir = join(ROOT, slug);
    if (!existsSync(catDir)) continue;
    for (const ent of readdirSync(catDir, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      if (ONLY && !ONLY.has(ent.name.toLowerCase())) continue;
      pages.push({
        file: join(catDir, ent.name, "index.html"),
        word: ent.name,
        category: slug,
      });
    }
  }
  return pages;
}

let updated = 0;
let scanned = 0;
for (const page of collectPages()) {
  if (updated >= LIMIT) break;
  if (!existsSync(page.file)) continue;
  scanned += 1;
  const html = readFileSync(page.file, "utf8");
  const word = extractWord(html, page.word);
  const { out, changed } = patchHtml(html, word);
  if (changed) {
    writeFileSync(page.file, out);
    updated += 1;
    if (updated <= 20 || ONLY) console.log("patched", `/${page.category}/${word}/`);
  }
}
console.log(`Done. scanned=${scanned} updated=${updated}`);
