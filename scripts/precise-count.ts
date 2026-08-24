import { ALL_GUIDES, guideWordCount, assertGuideLengths } from "../src/content/guides.ts";

const rows = ALL_GUIDES.map((g) => ({ slug: g.slug, words: guideWordCount(g) })).sort(
  (a, b) => a.words - b.words,
);
for (const r of rows) console.log(r.words, r.slug);
console.log("under800", assertGuideLengths(800));
console.log("total", rows.length);
