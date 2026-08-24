/**
 * Add one word to the catalog and write its static page.
 * Usage: node scripts/add-word.mjs <word> [category]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import {
  guessCategory,
  lookupWord,
  renderCategoryPage,
  renderWordPage,
  renderWordsHub,
  syllableCount,
} from "./lib/word-html.mjs";

const ROOT = process.cwd();

function loadCatalog() {
  return JSON.parse(readFileSync(join(ROOT, "data/catalog.json"), "utf8"));
}

function saveCatalog(catalog) {
  writeFileSync(join(ROOT, "data/catalog.json"), JSON.stringify(catalog, null, 2) + "\n");
}

function writeWordIndex(catalog) {
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
}

function refreshHubs(catalog) {
  const wordsDir = join(ROOT, "words");
  mkdirSync(wordsDir, { recursive: true });
  writeFileSync(join(wordsDir, "index.html"), renderWordsHub(catalog.categories));

  for (const category of catalog.categories) {
    const words = [...new Set(category.words.map((w) => w.toLowerCase()))].sort();
    const catDir = join(ROOT, category.slug);
    mkdirSync(catDir, { recursive: true });
    writeFileSync(join(catDir, "index.html"), renderCategoryPage(category, words));
  }
}

export async function addWord(rawWord, rawCategory) {
  const word = String(rawWord || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z'-]/g, "");
  if (!word || word.length < 2) {
    return { ok: false, error: "invalid_word", message: "Enter a valid English word." };
  }

  const catalog = loadCatalog();
  const existing = catalog.categories.find((c) =>
    c.words.some((w) => w.toLowerCase() === word),
  );
  if (existing) {
    return {
      ok: true,
      created: false,
      category: existing.slug,
      path: `/${existing.slug}/${word}/`,
      message: "Word already in the directory.",
    };
  }

  let categorySlug = (rawCategory || "").trim().toLowerCase();
  if (!categorySlug || !catalog.categories.some((c) => c.slug === categorySlug)) {
    categorySlug = guessCategory(word, catalog);
  }
  const category = catalog.categories.find((c) => c.slug === categorySlug);
  if (!category) {
    return { ok: false, error: "bad_category", message: "Unknown category." };
  }

  let entry = null;
  let syllables = null;
  let lookupNote = null;
  try {
    const looked = await lookupWord(word);
    if (looked.ok) {
      entry = looked.entry;
    } else if (looked.reason === "not_found") {
      return {
        ok: false,
        error: "not_found",
        message: `“${word}” isn’t in the free dictionary. Check the spelling and try again.`,
      };
    } else {
      lookupNote = "Dictionary was temporarily unavailable; page saved with browser-speech fallback.";
    }
    syllables = await syllableCount(word);
  } catch {
    lookupNote = "Dictionary was temporarily unavailable; page saved with browser-speech fallback.";
  }

  category.words.push(word);
  category.words = [...new Set(category.words.map((w) => w.toLowerCase()))].sort();
  saveCatalog(catalog);

  const words = category.words;
  const pageDir = join(ROOT, category.slug, word);
  mkdirSync(pageDir, { recursive: true });
  writeFileSync(
    join(pageDir, "index.html"),
    renderWordPage({ category, word, entry, syllables, siblings: words }),
  );

  refreshHubs(catalog);
  writeWordIndex(catalog);

  // Inline sitemap touch so we don't spawn a child that can hang on Windows
  try {
    const base = "https://www.speakur.com";
    const urls = [
      ["/", "daily", "1.0"],
      ["/index.html", "daily", "1.0"],
      ["/words/", "daily", "0.95"],
      ["/guides.html", "weekly", "0.85"],
      ["/about.html", "monthly", "0.7"],
      ["/contact.html", "monthly", "0.7"],
      ["/privacy.html", "monthly", "0.6"],
      ["/terms.html", "monthly", "0.6"],
    ];
    for (const cat of catalog.categories) {
      urls.push([`/${cat.slug}/`, "weekly", "0.85"]);
      for (const w of cat.words) {
        urls.push([`/${cat.slug}/${w.toLowerCase()}/`, "monthly", "0.8"]);
      }
    }
    const body = urls
      .map(
        ([path, freq, priority]) =>
          `  <url><loc>${base}${path}</loc><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`,
      )
      .join("\n");
    writeFileSync(
      join(ROOT, "sitemap.xml"),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    );
  } catch {
    /* ignore */
  }

  return {
    ok: true,
    created: true,
    category: category.slug,
    path: `/${category.slug}/${word}/`,
    message: lookupNote || `Added /${category.slug}/${word}/`,
  };
}

const isMain =
  process.argv[1] &&
  (process.argv[1].endsWith("add-word.mjs") || process.argv[1].includes("add-word"));

if (isMain) {
  const [, , wordArg, categoryArg] = process.argv;
  if (!wordArg) {
    console.error("Usage: node scripts/add-word.mjs <word> [category]");
    process.exit(1);
  }
  addWord(wordArg, categoryArg)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.ok ? 0 : 1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
