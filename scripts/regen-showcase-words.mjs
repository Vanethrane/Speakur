/**
 * Regenerate a small set of word pages with the canonical reference template.
 * Usage: node scripts/regen-showcase-words.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import {
  lookupWord,
  renderWordPage,
  syllableCount,
} from "./lib/word-html.mjs";

const ROOT = process.cwd();
const catalog = JSON.parse(readFileSync(join(ROOT, "data/catalog.json"), "utf8"));

const SHOWCASE = [
  "worcestershire",
  "quinoa",
  "espresso",
  "epitome",
  "colonel",
  "hyperbole",
  "nuclear",
  "schedule",
];

function findCategory(word) {
  const w = word.toLowerCase();
  for (const c of catalog.categories) {
    if (c.words.some((x) => String(x).toLowerCase() === w)) return c;
  }
  return null;
}

async function main() {
  for (const word of SHOWCASE) {
    const category = findCategory(word);
    if (!category) {
      console.warn("skip (not in catalog)", word);
      continue;
    }
    const siblings = [...new Set(category.words.map((x) => String(x).toLowerCase()))].sort();
    let entry = null;
    let syllables = null;
    try {
      const looked = await lookupWord(word);
      if (looked.ok) entry = looked.entry;
      syllables = await syllableCount(word);
    } catch (err) {
      console.warn("lookup failed", word, err.message);
    }
    const html = renderWordPage({ category, word, entry, syllables, siblings });
    const out = join(ROOT, category.slug, word, "index.html");
    if (!existsSync(join(ROOT, category.slug, word))) {
      console.warn("missing dir", out);
      continue;
    }
    writeFileSync(out, html);
    console.log("regen", `/${category.slug}/${word}/`, entry ? "with-data" : "minimal");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
