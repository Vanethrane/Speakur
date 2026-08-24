/**
 * Generate real static word pages:
 *   /{category}/{word}/index.html
 *
 * Modes:
 *   node scripts/generate-word-pages.mjs           # with dictionary API (slow)
 *   node scripts/generate-word-pages.mjs --fast    # no API; speech-fallback pages (for large catalogs)
 *   node scripts/generate-word-pages.mjs --limit=500
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";
import {
  lookupWord,
  renderCategoryPage,
  renderWordPage,
  renderWordsHub,
  syllableCount,
} from "./lib/word-html.mjs";

const ROOT = process.cwd();
const catalog = JSON.parse(readFileSync(join(ROOT, "data/catalog.json"), "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const args = process.argv.slice(2);
const FAST = args.includes("--fast");
const limitArg = args.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : Infinity;

async function main() {
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
      if (generated >= LIMIT) break;
      if (generated % 250 === 0) {
        process.stdout.write(`\n[${generated}] `);
      }
      let entry = null;
      let syllables = null;
      if (!FAST) {
        try {
          const looked = await lookupWord(word);
          if (looked.ok) entry = looked.entry;
          syllables = await syllableCount(word);
        } catch {
          /* minimal page */
        }
      }
      const pageDir = join(catDir, word);
      mkdirSync(pageDir, { recursive: true });
      writeFileSync(
        join(pageDir, "index.html"),
        renderWordPage({ category, word, entry, syllables, siblings: words }),
      );
      allPaths.push(`/${category.slug}/${word}/`);
      generated += 1;
      if (!FAST) {
        process.stdout.write(`${word} `);
        await sleep(80);
      }
    }
    if (generated >= LIMIT) break;
  }

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
  if (FAST) console.log("Fast mode: pages use browser speech until refill:words is run.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
