import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HeadMetadata } from "@/components/HeadMetadata";
import { SiteShell, Prose } from "@/components/SiteChrome";
import { ToolRecommendationBox } from "@/components/ToolRecommendationBox";
import { ALL_GUIDES, getGuide, guideWordCount } from "@/content/guides";
import { getPageLanguageMeta } from "@/lib/dataset";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = false;

export function generateStaticParams() {
  return ALL_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: "Guide not found" };
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: "article",
      publishedTime: guide.publishedAt,
    },
  };
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const words = guideWordCount(guide);
  const pageMeta = getPageLanguageMeta(slug);

  return (
    <SiteShell>
      <HeadMetadata
        slug={slug}
        name={pageMeta?.name || guide.title}
        description={guide.description}
        path={`/guides/${guide.slug}`}
        pageType="guide"
      />
      <article className="py-12">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-voice">Guide</p>
        <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
          {guide.title}
        </h1>
        <p className="mt-4 text-lg text-ink-muted">{guide.description}</p>
        <p className="mt-3 text-sm text-ink-muted">
          Published {guide.publishedAt} · {guide.readingMinutes} min read · {words} words
          {pageMeta ? (
            <>
              {" · "}
              <span className="text-ink">
                {pageMeta.language}
                {pageMeta.accent ? ` · ${pageMeta.accent}` : ""}
              </span>
            </>
          ) : null}
        </p>

        <Prose>
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </section>
          ))}
        </Prose>

        {pageMeta ? (
          <ToolRecommendationBox language={pageMeta.language} accent={pageMeta.accent} />
        ) : null}

        <p className="mt-12 text-sm text-ink-muted">
          <Link href="/guides" className="underline underline-offset-4 hover:text-voice-dark">
            All guides
          </Link>
          {" · "}
          <Link href="/" className="underline underline-offset-4 hover:text-voice-dark">
            Pronunciation search
          </Link>
        </p>
      </article>
    </SiteShell>
  );
}
