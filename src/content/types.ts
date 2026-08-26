export type GuideSection = {
  heading: string;
  paragraphs: string[];
};

export type Guide = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readingMinutes: number;
  /** Short overview shown above the article body */
  synopsis?: string[];
  /** Closing summary shown after the article body */
  tldr?: string[];
  sections: GuideSection[];
};

export function guideWordCount(guide: Guide): number {
  const text = [
    guide.title,
    guide.description,
    ...(guide.synopsis || []),
    ...(guide.tldr || []),
    ...guide.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
  ].join(" ");
  return text.trim().split(/\s+/).filter(Boolean).length;
}
