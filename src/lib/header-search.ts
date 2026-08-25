import dataset from "@/data/dataset.json";

export type HeaderSearchEntry = {
  id: string;
  type: "guide" | "tool" | "category" | "word-category";
  label: string;
  hint: string;
  /** App-router path (Next.js) */
  href: string;
  /** Static GitHub Pages path (relative to site root) */
  staticHref: string;
  terms: string[];
};

type DatasetPage = {
  language?: string;
  accent?: string;
  name?: string;
  parentCategory?: string;
  tags?: string[];
  primaryKeyword?: string;
  path?: string;
};

type DatasetFile = {
  pages: Record<string, DatasetPage>;
  toolAffiliates: Record<
    string,
    { id: string; label: string; title: string; description: string; href: string; cta: string }
  >;
};

const data = dataset as DatasetFile;

/** Word-directory categories on the static site (map to ./{slug}/). */
export const WORD_CATEGORIES: { slug: string; label: string; terms: string[] }[] = [
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

const DATASET_CATEGORY_LABEL: Record<string, string> = {
  "speech-tech": "Speech tech",
  "accents-localization": "Accents & localization",
  "learning-teaching": "Learning & teaching",
  "publishing-ops": "Publishing & ops",
};

function slugifyGuidePath(slug: string, meta: DatasetPage): string {
  return meta.path || `/guides/${slug}`;
}

function staticGuideHref(slug: string): string {
  return `/guide.html?slug=${encodeURIComponent(slug)}`;
}

function collectTerms(...parts: (string | undefined)[]): string[] {
  const out = new Set<string>();
  for (const part of parts) {
    if (!part) continue;
    const lower = part.toLowerCase().trim();
    if (lower) out.add(lower);
    for (const token of lower.split(/[\s/–—-]+/)) {
      if (token.length >= 2) out.add(token);
    }
  }
  return [...out];
}

/** Build a client-side search index from dataset.json (+ word category hubs). */
export function buildHeaderSearchIndex(): HeaderSearchEntry[] {
  const entries: HeaderSearchEntry[] = [];

  for (const [slug, meta] of Object.entries(data.pages)) {
    const href = slugifyGuidePath(slug, meta);
    entries.push({
      id: `guide:${slug}`,
      type: "guide",
      label: meta.name || slug.replace(/-/g, " "),
      hint: meta.primaryKeyword || meta.parentCategory?.replace(/-/g, " ") || "Guide",
      href,
      staticHref: staticGuideHref(slug),
      terms: collectTerms(
        slug,
        meta.name,
        meta.primaryKeyword,
        meta.parentCategory,
        meta.language,
        meta.accent,
        ...(meta.tags || []),
      ),
    });
  }

  for (const [language, tool] of Object.entries(data.toolAffiliates)) {
    if (language === "default") continue;
    const external = /^https?:\/\//i.test(tool.href);
    entries.push({
      id: `tool:${tool.id}`,
      type: "tool",
      label: tool.title,
      hint: tool.label || language,
      href: external ? tool.href : tool.href,
      staticHref: external ? tool.href : tool.href.startsWith("/") ? tool.href : `/${tool.href}`,
      terms: collectTerms(language, tool.title, tool.label, tool.description, tool.cta),
    });
  }

  const seenCategories = new Set<string>();
  for (const [slug, meta] of Object.entries(data.pages)) {
    const cat = meta.parentCategory;
    if (!cat || seenCategories.has(cat)) continue;
    seenCategories.add(cat);
    const href = slugifyGuidePath(slug, meta);
    entries.push({
      id: `category:${cat}`,
      type: "category",
      label: DATASET_CATEGORY_LABEL[cat] || cat.replace(/-/g, " "),
      hint: "Guide category",
      href,
      staticHref: staticGuideHref(slug),
      terms: collectTerms(cat, DATASET_CATEGORY_LABEL[cat], ...(meta.tags || [])),
    });
  }

  for (const cat of WORD_CATEGORIES) {
    entries.push({
      id: `wordcat:${cat.slug}`,
      type: "word-category",
      label: cat.label,
      hint: "Word directory",
      href: `/guides/commonly-mispronounced-english-words`,
      staticHref: `/${cat.slug}/`,
      terms: collectTerms(cat.slug, cat.label, ...cat.terms),
    });
  }

  return entries;
}

export function normalizeSearchQuery(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

function scoreEntry(query: string, entry: HeaderSearchEntry): number {
  if (!query) return 0;
  let score = 0;
  const label = entry.label.toLowerCase();

  if (label === query) score += 120;
  if (entry.id.endsWith(`:${query.replace(/\s+/g, "-")}`)) score += 110;

  for (const term of entry.terms) {
    if (term === query) score += 90;
    else if (term.startsWith(query)) score += 55;
    else if (query.startsWith(term) && term.length >= 3) score += 40;
    else if (term.includes(query)) score += 28;
  }

  const tokens = query.split(/\s+/).filter((t) => t.length >= 2);
  for (const token of tokens) {
    if (label.includes(token)) score += 12;
    for (const term of entry.terms) {
      if (term.includes(token)) score += 8;
    }
  }

  return score;
}

export function searchHeaderIndex(
  query: string,
  index: HeaderSearchEntry[],
  limit = 8,
): HeaderSearchEntry[] {
  const q = normalizeSearchQuery(query);
  if (q.length < 1) return [];

  return index
    .map((entry) => ({ entry, score: scoreEntry(q, entry) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.label.localeCompare(b.entry.label))
    .slice(0, limit)
    .map((row) => row.entry);
}

/** Lightweight category guess for unknown word queries (mirrors static on-demand rules). */
export function guessWordCategorySlug(word: string): string {
  const w = word.toLowerCase();
  const rules: [string, RegExp][] = [
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
  return "everyday";
}

export type ResolveSearchOptions = {
  /** When true, emit root-relative static-site URLs */
  staticSite?: boolean;
  /** Optional word-index hit `{ word, path }` from SPEAKUR_WORD_INDEX */
  wordHit?: { word: string; path: string } | null;
};

/**
 * Resolve a query to the best destination — never returns a bare 404 target when a category hub fits.
 */
export function resolveHeaderSearch(
  query: string,
  index: HeaderSearchEntry[],
  options: ResolveSearchOptions = {},
): string {
  const q = normalizeSearchQuery(query);
  if (!q) return options.staticSite ? "/index.html" : "/";

  const results = searchHeaderIndex(q, index, 12);
  const exact =
    results.find((r) => r.label.toLowerCase() === q) ||
    results.find((r) => r.id === `guide:${q.replace(/\s+/g, "-")}`) ||
    results.find((r) => r.terms.includes(q));

  if (exact) {
    return options.staticSite ? exact.staticHref : exact.href;
  }

  if (results.length > 0) {
    return options.staticSite ? results[0].staticHref : results[0].href;
  }

  const wordLike = /^[a-z][a-z0-9'-]*$/i.test(q);
  if (wordLike) {
    if (options.wordHit) {
      const p = options.wordHit.path.startsWith("/")
        ? options.wordHit.path
        : `/${options.wordHit.path.replace(/^\.?\//, "")}`;
      return p.endsWith("/") ? p : `${p}/`;
    }

    const category = guessWordCategorySlug(q);
    if (options.staticSite) {
      return `/${category}/${encodeURIComponent(q)}/`;
    }

    const catEntry =
      index.find((e) => e.id === `wordcat:${category}`) ||
      index.find((e) => e.type === "category");
    if (catEntry) return catEntry.href;

    return "/guides/commonly-mispronounced-english-words";
  }

  const categoryFallback = index.find((e) => e.type === "category");
  if (categoryFallback) {
    return options.staticSite ? categoryFallback.staticHref : categoryFallback.href;
  }

  return options.staticSite ? "/guides.html" : "/guides";
}

/** Singleton index for client components (dataset is small). */
let cachedIndex: HeaderSearchEntry[] | null = null;

export function getHeaderSearchIndex(): HeaderSearchEntry[] {
  if (!cachedIndex) cachedIndex = buildHeaderSearchIndex();
  return cachedIndex;
}
