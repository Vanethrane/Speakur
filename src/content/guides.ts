import { GUIDES as GUIDES_A } from "./guides-part-a";
import { GUIDES_B } from "./guides-part-b";
import { GUIDES_C } from "./guides-part-c";
import { GUIDE_EXPANSIONS } from "./guide-expansions";
import { GUIDE_EXPANSIONS_B } from "./guide-expansions-b";
import { GUIDE_REWRITES } from "./guide-rewrites";
import type { Guide } from "./types";
import { guideWordCount } from "./types";

export type { Guide } from "./types";
export { guideWordCount } from "./types";

function withExpansions(guide: Guide): Guide {
  const rewrite = GUIDE_REWRITES[guide.slug];
  const extra = [
    ...(GUIDE_EXPANSIONS[guide.slug] ?? []),
    ...(GUIDE_EXPANSIONS_B[guide.slug] ?? []),
    ...(rewrite?.sections ?? []),
  ];

  // Drop any leftover templated "Extended notes" sections if present in source parts
  const baseSections = guide.sections.filter(
    (s) => !/^Extended notes:/i.test(s.heading),
  );

  const sections = [...baseSections, ...extra];
  const synopsis = rewrite?.synopsis;
  const tldr = rewrite?.tldr;

  // Recalculate reading minutes from expanded length (~220 wpm)
  const words = guideWordCount({
    ...guide,
    synopsis,
    tldr,
    sections,
  });
  const readingMinutes = Math.max(guide.readingMinutes, Math.round(words / 220) || 1);

  return {
    ...guide,
    synopsis,
    tldr,
    sections,
    readingMinutes,
  };
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
