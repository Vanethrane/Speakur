/**
 * Sync catalog.json from add-real-words progress + on-disk pages.
 * Fixes cases where pages were written but catalog save failed on Windows.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import {
  renderCategoryPage,
  renderWordsHub,
} from "./lib/word-html.mjs";

const ROOT = process.cwd();
const PROGRESS = join(ROOT, "data/add-real-words-progress.json");

function sleepSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* spin for rare Windows lock retries */
  }
}

function saveCatalog(catalog) {
  const target = join(ROOT, "data/catalog.json");
  const alt = join(ROOT, "data/catalog.sync.json");
  const body = JSON.stringify(catalog, null, 2) + "\n";
  // Always write alt first (usually unlocked)
  writeFileSync(alt, body);
  let lastErr = null;
  for (let i = 0; i < 15; i++) {
    try {
      writeFileSync(target, body);
      return;
    } catch (err) {
      lastErr = err;
      sleepSync(300 * (i + 1));
    }
  }
  console.warn("Could not update catalog.json (locked). Wrote data/catalog.sync.json instead.");
  if (lastErr) console.warn(lastErr.message);
}

const catalog = JSON.parse(readFileSync(join(ROOT, "data/catalog.json"), "utf8"));
const bySlug = new Map(catalog.categories.map((c) => [c.slug, c]));
const have = new Set();
for (const c of catalog.categories) {
  for (const w of c.words) have.add(String(w).toLowerCase());
}

let progress = { done: {} };
if (existsSync(PROGRESS)) {
  try {
    progress = JSON.parse(readFileSync(PROGRESS, "utf8"));
  } catch {
    /* ignore */
  }
}

let synced = 0;
const entries = Object.entries(progress.done || {});
for (const [word, status] of entries) {
  const w = String(word).toLowerCase();
  if (have.has(w)) {
    // Normalize error marks when page exists
    if (String(status).startsWith("error:")) {
      for (const slug of bySlug.keys()) {
        const page = join(ROOT, slug, w, "index.html");
        if (existsSync(page)) {
          progress.done[w] = `added:${slug}`;
          break;
        }
      }
    }
    continue;
  }

  // Prefer status slug, else scan hubs for the page
  let slug = null;
  const m = /^added:([a-z0-9-]+)$/.exec(String(status));
  if (m) slug = m[1];
  if (!slug) {
    for (const s of bySlug.keys()) {
      if (existsSync(join(ROOT, s, w, "index.html"))) {
        slug = s;
        break;
      }
    }
  }
  if (!slug) continue;
  const page = join(ROOT, slug, w, "index.html");
  if (!existsSync(page)) continue;
  const html = readFileSync(page, "utf8");
  if (!html.includes("<dt>Syllables</dt>")) continue;
  if (!html.includes('class="def"')) continue;

  const cat = bySlug.get(slug);
  if (!cat) continue;
  cat.words.push(w);
  have.add(w);
  progress.done[w] = `added:${slug}`;
  synced += 1;
  console.log(`synced /${slug}/${w}/`);
}

for (const cat of catalog.categories) {
  cat.words = [...new Set(cat.words.map((x) => String(x).toLowerCase()))].sort();
}

saveCatalog(catalog);

mkdirSync(join(ROOT, "words"), { recursive: true });
writeFileSync(join(ROOT, "words", "index.html"), renderWordsHub(catalog.categories));
for (const category of catalog.categories) {
  const words = category.words;
  mkdirSync(join(ROOT, category.slug), { recursive: true });
  writeFileSync(join(ROOT, category.slug, "index.html"), renderCategoryPage(category, words));
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
writeFileSync(join(ROOT, "assets/word-index.js"), `window.SPEAKUR_WORD_INDEX = ${JSON.stringify(flat)};\n`);

progress.updatedAt = new Date().toISOString();
progress.added = Object.values(progress.done).filter((v) => String(v).startsWith("added:")).length;
writeFileSync(PROGRESS, JSON.stringify(progress, null, 2));
console.log(`Done. synced=${synced} catalogWords=${have.size} progressAdded=${progress.added}`);
