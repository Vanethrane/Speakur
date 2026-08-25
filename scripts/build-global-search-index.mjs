/**
 * Builds public/global-search-index.json — compact index for client-side Cmd+K search.
 * Merges dataset.json (guides, tools, categories) + assets/word-index.js (10k+ words).
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataset = JSON.parse(readFileSync(join(ROOT, "src/data/dataset.json"), "utf8"));

const DATASET_CATEGORY_LABEL = {
  "speech-tech": "Speech tech",
  "accents-localization": "Accents & localization",
  "learning-teaching": "Learning & teaching",
  "publishing-ops": "Publishing & ops",
};

const WORD_CATEGORIES = [
  { slug: "medical", label: "Medical pronunciations", terms: ["medical", "medicine", "health", "clinical"] },
  { slug: "food", label: "Food & drink", terms: ["food", "drink", "culinary", "recipe", "restaurant"] },
  { slug: "everyday", label: "Everyday English", terms: ["everyday", "common", "english", "daily"] },
  { slug: "science", label: "Science", terms: ["science", "scientific", "research", "physics", "biology"] },
  { slug: "business", label: "Business", terms: ["business", "finance", "marketing", "corporate"] },
  { slug: "places", label: "Places", terms: ["places", "geography", "cities", "countries"] },
  { slug: "names", label: "Names", terms: ["names", "people", "given names"] },
  { slug: "brands", label: "Brands", terms: ["brands", "company", "product"] },
  { slug: "animals", label: "Animals", terms: ["animals", "pets", "wildlife"] },
  { slug: "arts", label: "Arts & culture", terms: ["arts", "culture", "music", "theatre"] },
  { slug: "sports", label: "Sports", terms: ["sports", "athletics", "fitness"] },
  { slug: "tech", label: "Tech", terms: ["tech", "technology", "software", "digital"] },
  { slug: "nature", label: "Nature", terms: ["nature", "environment", "weather"] },
  { slug: "law", label: "Law", terms: ["law", "legal", "court"] },
  { slug: "mythology", label: "Mythology", terms: ["mythology", "myth", "legend"] },
];

function collectTerms(...parts) {
  const out = new Set();
  for (const part of parts) {
    if (!part) continue;
    const lower = String(part).toLowerCase().trim();
    if (lower) out.add(lower);
    for (const token of lower.split(/[\s/–—-]+/)) {
      if (token.length >= 2) out.add(token);
    }
  }
  return [...out];
}

function loadWordIndex() {
  const raw = readFileSync(join(ROOT, "assets/word-index.js"), "utf8");
  const json = raw.replace(/^[\s\S]*?=\s*/, "").replace(/;\s*$/, "");
  return JSON.parse(json);
}

function buildMeta() {
  const meta = [];

  for (const [slug, page] of Object.entries(dataset.pages)) {
    meta.push({
      id: `guide:${slug}`,
      type: "guide",
      label: page.name || slug.replace(/-/g, " "),
      hint: page.primaryKeyword || page.parentCategory?.replace(/-/g, " ") || "Guide",
      href: page.path || `/guides/${slug}`,
      staticHref: `/guide.html?slug=${encodeURIComponent(slug)}`,
      terms: collectTerms(
        slug,
        page.name,
        page.primaryKeyword,
        page.parentCategory,
        page.language,
        page.accent,
        ...(page.tags || []),
      ),
    });
  }

  for (const [language, tool] of Object.entries(dataset.toolAffiliates)) {
    if (language === "default") continue;
    const external = /^https?:\/\//i.test(tool.href);
    meta.push({
      id: `tool:${tool.id}`,
      type: "tool",
      label: tool.title,
      hint: tool.label || language,
      href: tool.href,
      staticHref: external ? tool.href : tool.href.startsWith("/") ? tool.href : `/${tool.href}`,
      terms: collectTerms(language, tool.title, tool.label, tool.description, tool.cta),
    });
  }

  const seen = new Set();
  for (const [slug, page] of Object.entries(dataset.pages)) {
    const cat = page.parentCategory;
    if (!cat || seen.has(cat)) continue;
    seen.add(cat);
    meta.push({
      id: `category:${cat}`,
      type: "category",
      label: DATASET_CATEGORY_LABEL[cat] || cat.replace(/-/g, " "),
      hint: "Guide category",
      href: page.path || `/guides/${slug}`,
      staticHref: `/guide.html?slug=${encodeURIComponent(slug)}`,
      terms: collectTerms(cat, DATASET_CATEGORY_LABEL[cat], ...(page.tags || [])),
    });
  }

  for (const cat of WORD_CATEGORIES) {
    meta.push({
      id: `wordcat:${cat.slug}`,
      type: "word-category",
      label: cat.label,
      hint: "Word directory",
      href: "/guides/commonly-mispronounced-english-words",
      staticHref: `/${cat.slug}/`,
      terms: collectTerms(cat.slug, cat.label, ...cat.terms),
    });
  }

  return meta;
}

function buildWords(rows) {
  /** @type {[string, string, string, string][]} */
  const words = rows.map((row) => {
    const word = String(row.word).toLowerCase();
    const category = row.category || "everyday";
    const href = `/w/${encodeURIComponent(word)}`;
    const staticHref = row.path?.startsWith("/") ? row.path : `/${category}/${encodeURIComponent(word)}/`;
    return [word, category, href, staticHref];
  });

  words.sort((a, b) => a[0].localeCompare(b[0]));
  return words;
}

const wordRows = loadWordIndex();
const payload = {
  v: 1,
  builtAt: new Date().toISOString(),
  wordCount: wordRows.length,
  metaCount: 0,
  words: buildWords(wordRows),
  meta: buildMeta(),
};
payload.metaCount = payload.meta.length;

const outDir = join(ROOT, "public");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "global-search-index.json");
writeFileSync(outPath, JSON.stringify(payload));
writeFileSync(join(ROOT, "assets/global-search-index.json"), JSON.stringify(payload));

console.log(
  `Wrote public/global-search-index.json — ${payload.words.length} words + ${payload.meta.length} meta entries`,
);
