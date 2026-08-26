/**
 * Patch existing word pages that still use the old play chrome.
 * Adds practice-strip + clearer US/UK/Slow labels when missing.
 *
 * Usage:
 *   node scripts/patch-pronunciation-ux.mjs
 *   node scripts/patch-pronunciation-ux.mjs --limit=200
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { CATEGORY_GUIDE_LINKS } from "./lib/word-html.mjs";

const ROOT = process.cwd();
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v === undefined ? true : v];
    }),
);
const LIMIT = Number(args.limit || Infinity);

const HUBS = Object.keys(CATEGORY_GUIDE_LINKS);

function practiceStrip(word, slug) {
  const guides = CATEGORY_GUIDE_LINKS[slug] || [
    ["how-to-read-ipa-phonetic-symbols", "How to read IPA"],
    ["building-a-pronunciation-practice-routine", "Practice routine"],
  ];
  const guideLinks = guides
    .slice(0, 2)
    .map(
      ([s, label]) =>
        `<a href="../../guide.html?slug=${encodeURIComponent(s)}">${label}</a>`,
    )
    .join(" · ");
  return `<section class="practice-strip" data-practice-strip="1" aria-labelledby="practice-strip-heading">
        <h2 id="practice-strip-heading">Keep practicing</h2>
        <ul class="practice-links">
          <li><a href="../../tools/minimal-pairs/">Minimal pairs</a> — train similar sounds</li>
          <li><a href="../../tools/ipa/">IPA cheat sheet</a> — decode the symbols for “${word}”</li>
          <li><a href="../../tools/us-uk/">US vs UK tool</a> — compare accents side by side</li>
          <li>${guideLinks}</li>
        </ul>
      </section>`;
}

function patchHtml(html, word, slug) {
  let next = html;
  let changed = false;

  // Clearer play labels on legacy buttons
  const replacements = [
    [/>\s*<span class="icon">▶<\/span>\s*US \(free\)\s*</g, '><span class="play-stack"><span class="play-accent">US</span><span class="play-sub">American</span></span><'],
    [/>\s*<span class="icon">▶<\/span>\s*UK \(free\)\s*</g, '><span class="play-stack"><span class="play-accent">UK</span><span class="play-sub">British</span></span><'],
    [/>\s*<span class="icon">▶<\/span>\s*Slow\s*</g, '><span class="play-stack"><span class="play-accent">Slow</span><span class="play-sub">Practice pace</span></span><'],
  ];
  for (const [re, rep] of replacements) {
    const after = next.replace(re, rep);
    if (after !== next) {
      next = after;
      changed = true;
    }
  }

  if (!next.includes('data-practice-strip="1"') && next.includes("</article>")) {
    next = next.replace("</article>", `</article>\n\n      ${practiceStrip(word, slug)}`);
    changed = true;
  }

  if (!next.includes('data-pronounce-ux="1"') && next.includes('class="word-card')) {
    next = next.replace('class="word-card', 'class="word-card');
    next = next.replace(
      /(<article class="word-card[^"]*")/,
      '$1 data-pronounce-ux="1"',
    );
    if (next.includes('data-pronounce-ux="1"')) changed = true;
  }

  // Point legacy tools.html anchors at the tools hub
  const toolsFixed = next
    .replace(/tools\.html#minimal-pairs/g, "tools/minimal-pairs/")
    .replace(/tools\.html#ipa-cheat/g, "tools/ipa/")
    .replace(/tools\.html#us-uk/g, "tools/us-uk/")
    .replace(/href="([^"]*)tools\.html"/g, 'href="$1tools/"');
  if (toolsFixed !== next) {
    next = toolsFixed;
    changed = true;
  }

  return { html: next, changed };
}

function main() {
  let scanned = 0;
  let changed = 0;
  for (const slug of HUBS) {
    const dir = join(ROOT, slug);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      if (!name.isDirectory()) continue;
      if (scanned >= LIMIT) break;
      const file = join(dir, name.name, "index.html");
      if (!existsSync(file)) continue;
      scanned += 1;
      const html = readFileSync(file, "utf8");
      const result = patchHtml(html, name.name, slug);
      if (result.changed) {
        writeFileSync(file, result.html);
        changed += 1;
      }
    }
    if (scanned >= LIMIT) break;
  }
  console.log(`Pronunciation UX patch: scanned=${scanned} changed=${changed}`);
}

main();
