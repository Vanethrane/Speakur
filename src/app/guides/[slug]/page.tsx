import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideParagraph } from "@/components/GuideParagraph";
import { GuidePrimaryTool } from "@/components/GuidePrimaryTool";
import { HeadMetadata } from "@/components/HeadMetadata";
import { RelatedToolsConversions } from "@/components/RelatedToolsConversions";
import { SiteShell, Prose } from "@/components/SiteChrome";
import { ALL_GUIDES, getGuide, guideWordCount } from "@/content/guides";
import { getPageLanguageMeta } from "@/lib/dataset";
import { buildProgrammaticSocialMetadata } from "@/lib/og-meta";
import { siteConfig } from "@/site.config";

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

  return buildProgrammaticSocialMetadata({
    slug,
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    pageType: "guide",
    publishedAt: guide.publishedAt,
    readingMinutes: guide.readingMinutes,
  });
}

/** Programmatic [slug] page engine */
export default async function GuideSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const words = guideWordCount(guide);
  const pageMeta = getPageLanguageMeta(slug);
  const guidePath = `/guides/${guide.slug}`;
  const copyText = `${pageMeta?.primaryKeyword || guide.title} — ${siteConfig.domain}${guidePath}`;

  return (
    <SiteShell>
      <HeadMetadata
        slug={slug}
        name={pageMeta?.name || guide.title}
        description={guide.description}
        path={guidePath}
        pageType="guide"
        readingMinutes={guide.readingMinutes}
      />
      <article className="pb-12 pt-1">
        <GuidePrimaryTool
          copyText={copyText}
          historyHref={guidePath}
          shareTitle={guide.title}
          sharePath={guidePath}
          shareDetail={pageMeta?.primaryKeyword || guide.description}
          language={pageMeta?.language}
          accent={pageMeta?.accent}
          seedQuery={pageMeta?.primaryKeyword?.split(/\s+/).slice(-1)[0]}
        />

        <header className="mt-5">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-voice">Guide</p>
          <h1 className="mt-2 font-display text-2xl leading-tight tracking-tight text-ink sm:mt-3 sm:text-5xl">
            {guide.title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
            {guide.description}
          </p>
          <p className="mt-2 text-xs text-ink-muted sm:text-sm">
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
        </header>

        {guide.synopsis?.length ? (
          <aside className="mt-8 rounded-2xl border border-paper-line bg-paper-raised p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-voice">Synopsis</p>
            <div className="mt-3 space-y-3 text-base leading-relaxed text-ink">
              {guide.synopsis.map((paragraph) => (
                <GuideParagraph key={paragraph.slice(0, 40)} text={paragraph} />
              ))}
            </div>
          </aside>
        ) : null}

        <Prose>
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <GuideParagraph key={paragraph.slice(0, 48)} text={paragraph} />
              ))}
            </section>
          ))}
        </Prose>

        {guide.tldr?.length ? (
          <aside className="mt-10 rounded-2xl border border-voice/25 bg-voice-glow/40 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-voice-dark">TL;DR</p>
            <div className="mt-3 space-y-3 text-base leading-relaxed text-ink">
              {guide.tldr.map((paragraph) => (
                <GuideParagraph key={paragraph.slice(0, 40)} text={paragraph} />
              ))}
            </div>
          </aside>
        ) : null}

        <RelatedToolsConversions slug={slug} />

        <p className="mt-12 text-sm text-ink-muted">
          <Link href="/guides" className="underline underline-offset-4 hover:text-voice-dark">
            All guides
          </Link>
          {" · "}
          <Link href="/" className="underline underline-offset-4 hover:text-voice-dark">
            Pronunciation search
          </Link>
          {" · "}
          <Link href="/words/" className="underline underline-offset-4 hover:text-voice-dark">
            Word directories
          </Link>
        </p>
      </article>
    </SiteShell>
  );
}
