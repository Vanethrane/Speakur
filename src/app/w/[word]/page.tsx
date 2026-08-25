import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HeadMetadata } from "@/components/HeadMetadata";
import { PopularWords, SiteShell } from "@/components/SiteChrome";
import { WordResult } from "@/components/WordResult";
import { lookupPronunciation } from "@/lib/pronounce";
import { buildProgrammaticSocialMetadata } from "@/lib/og-meta";
import { uniqueSeedWords } from "@/lib/words";

type PageProps = {
  params: Promise<{ word: string }>;
};

/** Cache forever at the CDN after first render — no paid TTS on crawl/render. */
export const revalidate = false;

export function generateStaticParams() {
  return uniqueSeedWords()
    .slice(0, 200)
    .map((word) => ({ word }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { word } = await params;
  const decoded = decodeURIComponent(word);
  const result = await lookupPronunciation(decoded);
  const phonetic = result?.phonetic ? ` ${result.phonetic}` : "";
  const description = result
    ? `Hear how to say “${decoded}”${phonetic}. IPA phonetic spelling, syllable count, and on-demand audio.`
    : `Hear how to say “${decoded}”. IPA phonetic spelling and free pronunciation audio.`;

  return buildProgrammaticSocialMetadata({
    title: decoded,
    description,
    path: `/w/${encodeURIComponent(decoded.toLowerCase())}`,
    pageType: "word",
    phonetic: result?.phonetic,
    syllables: result?.syllables ?? null,
    accent: result?.phonetics?.some((p) => p.accent === "uk") ? "us-uk" : "us",
  });
}

export default async function WordPage({ params }: PageProps) {
  const { word } = await params;
  const decoded = decodeURIComponent(word);
  const result = await lookupPronunciation(decoded);

  if (!result) {
    notFound();
  }

  const description = `Hear how to say “${result.word}”${
    result.phonetic ? ` ${result.phonetic}` : ""
  }. IPA phonetic spelling, syllable count, and on-demand audio.`;

  return (
    <SiteShell>
      <HeadMetadata
        name={result.word}
        description={description}
        path={`/w/${encodeURIComponent(result.word.toLowerCase())}`}
        pageType="word"
        phonetic={result.phonetic}
        syllables={result.syllables ?? null}
      />
      <div className="pt-1">
        <WordResult result={result} />
      </div>
      <div className="mt-10">
        <PopularWords />
      </div>
      <p className="mt-12 text-sm text-ink-muted">
        <Link
          href="/guides"
          className="underline decoration-paper-line underline-offset-4 hover:text-voice-dark"
        >
          Read pronunciation guides
        </Link>
        {" · "}
        <Link
          href="/"
          className="underline decoration-paper-line underline-offset-4 hover:text-voice-dark"
        >
          Back to search
        </Link>
      </p>
    </SiteShell>
  );
}
