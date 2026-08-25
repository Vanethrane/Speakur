import {
  guessWordCategorySlug,
  normalizeSearchQuery,
  type HeaderSearchEntry,
} from "@/lib/header-search";

/** Compact word tuple: [word, category, nextHref, staticHref] */
export type GlobalWordTuple = [word: string, category: string, href: string, staticHref: string];

export type GlobalMetaEntry = HeaderSearchEntry;

export type GlobalSearchIndex = {
  v: number;
  words: GlobalWordTuple[];
  meta: GlobalMetaEntry[];
  wordCount?: number;
  metaCount?: number;
};

export type GlobalSearchResult = {
  id: string;
  type: GlobalMetaEntry["type"] | "word";
  label: string;
  hint: string;
  href: string;
  score: number;
};

export type GlobalSearchResponse = {
  results: GlobalSearchResult[];
  /** True when no query matches — showing closest items instead */
  isFallback: boolean;
  elapsedMs: number;
};

let cachedIndex: GlobalSearchIndex | null = null;
let loadPromise: Promise<GlobalSearchIndex> | null = null;

export function clearGlobalSearchCache(): void {
  cachedIndex = null;
  loadPromise = null;
}

/** Fetch and cache the generated index (lazy, once per session). */
export async function loadGlobalSearchIndex(): Promise<GlobalSearchIndex> {
  if (cachedIndex) return cachedIndex;
  if (!loadPromise) {
    loadPromise = fetch("/global-search-index.json", { cache: "force-cache" })
      .then((res) => {
        if (!res.ok) throw new Error(`Search index HTTP ${res.status}`);
        return res.json() as Promise<GlobalSearchIndex>;
      })
      .then((data) => {
        cachedIndex = data;
        return data;
      });
  }
  return loadPromise;
}

function wordToResult(tuple: GlobalWordTuple, score: number): GlobalSearchResult {
  const [word, category, href] = tuple;
  return {
    id: `word:${word}`,
    type: "word",
    label: word,
    hint: `${category} · pronounce`,
    href,
    score,
  };
}

function metaToResult(entry: GlobalMetaEntry, score: number): GlobalSearchResult {
  return {
    id: entry.id,
    type: entry.type,
    label: entry.label,
    hint: entry.hint,
    href: entry.href,
    score,
  };
}

function scoreMeta(query: string, entry: GlobalMetaEntry): number {
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

function scoreWord(query: string, word: string): number {
  if (word === query) return 120;
  if (word.startsWith(query)) return 85 + Math.min(query.length, 10);
  if (query.length >= 3 && word.includes(query)) return 45;
  return 0;
}

/** Binary search: first index where words[i][0] >= query */
function lowerBound(words: GlobalWordTuple[], query: string): number {
  let lo = 0;
  let hi = words.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (words[mid][0] < query) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function collectWordPrefixMatches(
  words: GlobalWordTuple[],
  query: string,
  limit: number,
): GlobalSearchResult[] {
  const out: GlobalSearchResult[] = [];
  const start = lowerBound(words, query);

  for (let i = start; i < words.length && out.length < limit; i++) {
    const [word] = words[i];
    if (!word.startsWith(query)) break;
    out.push(wordToResult(words[i], scoreWord(query, word)));
  }

  if (out.length < limit && query.length >= 3) {
    for (let i = start; i < words.length && out.length < limit; i++) {
      const tuple = words[i];
      const word = tuple[0];
      if (word.startsWith(query)) continue;
      if (!word.includes(query)) {
        if (word[0] > query[0]) break;
        continue;
      }
      out.push(wordToResult(tuple, scoreWord(query, word)));
    }
  }

  return out;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

function findClosestResults(
  query: string,
  index: GlobalSearchIndex,
  limit: number,
): GlobalSearchResult[] {
  const q = query;
  const first = q[0] || "";
  const scored: GlobalSearchResult[] = [];

  for (const entry of index.meta) {
    const label = entry.label.toLowerCase();
    const dist = levenshtein(q, label);
    scored.push(metaToResult(entry, 500 - dist));
  }

  const maxDist = Math.max(3, Math.ceil(q.length * 0.45));
  for (const tuple of index.words) {
    const word = tuple[0];
    if (first && word[0] !== first && Math.abs(word.length - q.length) > 3) continue;
    const dist = levenshtein(q, word);
    if (dist <= maxDist) {
      scored.push(wordToResult(tuple, 500 - dist));
    }
  }

  scored.sort(
    (a, b) => b.score - a.score || a.label.localeCompare(b.label),
  );

  const tools = scored.filter((r) => r.type === "tool").slice(0, limit);
  if (tools.length >= limit) return tools;

  const seen = new Set(tools.map((t) => t.id));
  const rest = scored.filter((r) => !seen.has(r.id));
  return [...tools, ...rest].slice(0, limit);
}

/**
 * Filter 10k+ items client-side. Target <10ms on warm index for typical queries.
 */
export function searchGlobalIndex(
  query: string,
  index: GlobalSearchIndex,
  limit = 12,
): GlobalSearchResponse {
  const started = typeof performance !== "undefined" ? performance.now() : 0;
  const q = normalizeSearchQuery(query);

  if (!q) {
    return { results: [], isFallback: false, elapsedMs: 0 };
  }

  const merged: GlobalSearchResult[] = [];

  for (const entry of index.meta) {
    const score = scoreMeta(q, entry);
    if (score > 0) merged.push(metaToResult(entry, score));
  }

  merged.push(...collectWordPrefixMatches(index.words, q, limit));

  merged.sort(
    (a, b) => b.score - a.score || a.label.localeCompare(b.label),
  );

  const unique = new Map<string, GlobalSearchResult>();
  for (const row of merged) {
    if (!unique.has(row.id)) unique.set(row.id, row);
  }

  let results = [...unique.values()].slice(0, limit);
  let isFallback = false;

  if (results.length === 0) {
    results = findClosestResults(q, index, 3);
    isFallback = true;
  }

  const elapsedMs =
    typeof performance !== "undefined" ? performance.now() - started : 0;

  return { results, isFallback, elapsedMs };
}

/** Resolve navigation for Enter with no selection — never dead-end. */
export function resolveGlobalSearchHref(
  query: string,
  index: GlobalSearchIndex,
  picked?: GlobalSearchResult | null,
): string {
  if (picked) return picked.href;

  const { results, isFallback } = searchGlobalIndex(query, index, 8);
  if (results.length > 0) return results[0].href;

  const q = normalizeSearchQuery(query);
  if (/^[a-z][a-z0-9'-]*$/i.test(q)) {
    const start = lowerBound(index.words, q);
    if (start < index.words.length && index.words[start][0] === q) {
      return index.words[start][2];
    }
    const category = guessWordCategorySlug(q);
    const catEntry = index.meta.find((e) => e.id === `wordcat:${category}`);
    if (catEntry) return catEntry.href;
    return `/w/${encodeURIComponent(q)}`;
  }

  if (isFallback && results[0]) return results[0].href;

  const categoryFallback = index.meta.find((e) => e.type === "category");
  return categoryFallback?.href || "/guides";
}
