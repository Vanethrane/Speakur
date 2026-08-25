/**
 * Inject HowTo JSON-LD + how-to meta tags into existing static word pages.
 * Skips files that already have HowTo schema.
 *
 * Usage: node scripts/patch-howto-seo.mjs
 *        node scripts/patch-howto-seo.mjs --limit=500
 *        node scripts/patch-howto-seo.mjs --force   (refresh existing HowTo JSON-LD)
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, extname, basename, dirname } from "path";
import { renderHowToStepsHtml, renderWordSeoHeadTags } from "./lib/word-seo.mjs";

const ROOT = process.cwd();
const SKIP = new Set(["node_modules", ".git", ".next", "out", "public", "assets", "src"]);
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : Infinity;
const FORCE = process.argv.includes("--force");

const CATEGORIES = new Set([
  "food", "places", "names", "brands", "medical", "animals", "science",
  "business", "everyday", "arts", "sports", "tech", "nature", "law", "mythology",
]);

function walkWordPages(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    if (SKIP.has(ent.name) || ent.name.startsWith(".")) continue;
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (CATEGORIES.has(ent.name) || CATEGORIES.has(basename(dirname(p)))) {
        walkWordPages(p, out);
      } else if (CATEGORIES.has(basename(dir))) {
        // word folder under category
        const index = join(p, "index.html");
        try {
          readdirSync(p);
          out.push(index);
        } catch {
          /* ignore */
        }
      }
    }
  }
  return out;
}

function collectPages() {
  const pages = [];
  for (const slug of CATEGORIES) {
    const catDir = join(ROOT, slug);
    let words;
    try {
      words = readdirSync(catDir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of words) {
      if (!ent.isDirectory()) continue;
      pages.push({
        file: join(catDir, ent.name, "index.html"),
        word: ent.name,
        category: slug,
        path: `/${slug}/${ent.name}/`,
      });
    }
  }
  return pages;
}

function extractPhonetic(html) {
  const m = html.match(/class="ipa"[^>]*>\s*([^<]+)/i);
  return m ? m[1].trim() : "";
}

function stripPriorHowToSeo(html) {
  let next = html;
  // Remove prior HowTo/FAQ/WebPage JSON-LD blocks we injected
  next = next.replace(
    /<script type="application\/ld\+json">[\s\S]*?"@type"\s*:\s*"HowTo"[\s\S]*?<\/script>\s*/gi,
    "",
  );
  next = next.replace(/<meta property="og:(?:type|site_name|title|description|url)"[^>]*>\s*/gi, "");
  next = next.replace(/<meta name="twitter:(?:card|title|description)"[^>]*>\s*/gi, "");
  next = next.replace(/<meta name="keywords"[^>]*>\s*/gi, "");
  return next;
}

function patchFile({ file, word, path }) {
  let html;
  try {
    html = readFileSync(file, "utf8");
  } catch {
    return "missing";
  }
  const hasHowTo =
    html.includes('"@type":"HowTo"') || html.includes('"@type": "HowTo"');
  if (hasHowTo && !FORCE) {
    return "skip";
  }

  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  const description =
    descMatch?.[1] ||
    `Learn how to pronounce “${word}” with free US and UK audio, IPA, and practice steps.`;
  const phonetic = extractPhonetic(html);

  const seo = renderWordSeoHeadTags({ word, path, description, phonetic });

  let next = hasHowTo ? stripPriorHowToSeo(html) : html;
  if (/<meta\s+name="description"[^>]*>/i.test(next)) {
    next = next.replace(/<meta\s+name="description"[^>]*>\s*/i, "");
  }
  if (/<link\s+rel="canonical"[^>]*>/i.test(next)) {
    next = next.replace(/<link\s+rel="canonical"[^>]*>\s*/i, "");
  }
  next = next.replace(/<\/title>\s*/i, `</title>\n${seo}`);

  if (!next.includes('class="howto"') && !next.includes('id="howto-heading"')) {
    const howto = renderHowToStepsHtml(word);
    if (howto) {
      if (next.includes('id="speakur-ad-mid"')) {
        next = next.replace(
          /<div id="speakur-ad-mid"/,
          `${howto}\n\n      <div id="speakur-ad-mid"`,
        );
      } else if (next.includes('class="related')) {
        next = next.replace(
          /<section class="related/,
          `${howto}\n\n      <section class="related`,
        );
      } else {
        next = next.replace("</main>", `${howto}\n    </main>`);
      }
    }
  }

  if (next === html) return "skip";
  try {
    writeFileSync(file, next);
    return "updated";
  } catch {
    return "fail";
  }
}

function main() {
  const pages = collectPages();
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const total = Math.min(pages.length, LIMIT);

  for (let i = 0; i < total; i++) {
    if (i > 0 && i % 2500 === 0) console.log(`… ${i}/${total} (updated ${updated})`);
    const result = patchFile(pages[i]);
    if (result === "updated") updated += 1;
    else if (result === "fail" || result === "missing") failed += 1;
    else skipped += 1;
  }

  console.log(
    `HowTo SEO patch done. updated=${updated} skipped=${skipped} failed=${failed} scanned=${total}`,
  );
}

main();
