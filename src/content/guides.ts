import { GUIDES as GUIDES_A } from "./guides-part-a";
import { GUIDES_B } from "./guides-part-b";
import { GUIDES_C } from "./guides-part-c";
import { GUIDE_EXPANSIONS } from "./guide-expansions";
import { GUIDE_EXPANSIONS_B } from "./guide-expansions-b";
import { GUIDE_EXPANSIONS_C } from "./guide-expansions-c";
import type { Guide } from "./types";
import { guideWordCount } from "./types";

export type { Guide } from "./types";
export { guideWordCount } from "./types";

function withExpansions(guide: Guide): Guide {
  const extra = [
    ...(GUIDE_EXPANSIONS[guide.slug] ?? []),
    ...(GUIDE_EXPANSIONS_B[guide.slug] ?? []),
    ...(GUIDE_EXPANSIONS_C[guide.slug] ?? []),
  ];
  if (extra.length === 0) return guide;
  return { ...guide, sections: [...guide.sections, ...extra] };
}

export const ALL_GUIDES: Guide[] = [...GUIDES_A, ...GUIDES_B, ...GUIDES_C].map(withExpansions);

export function getGuide(slug: string): Guide | undefined {
  return ALL_GUIDES.find((guide) => guide.slug === slug);
}

export function getAllGuides(): Guide[] {
  return [...ALL_GUIDES].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function assertGuideLengths(minWords = 800): { slug: string; words: number }[] {
  return ALL_GUIDES.map((guide) => ({
    slug: guide.slug,
    words: guideWordCount(guide),
  })).filter((row) => row.words < minWords);
}
