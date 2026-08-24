import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/SiteChrome";
import { getAllGuides, guideWordCount } from "@/content/guides";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Long-form Speakur editorial guides on pronunciation, speech synthesis, accents, localization, and responsible publishing.",
};

export default function GuidesIndexPage() {
  const guides = getAllGuides();

  return (
    <SiteShell>
      <section className="py-12">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-voice">Editorial</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-ink sm:text-5xl">
          Guides
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">
          {guides.length} long-form articles on speech, accents, localization, teaching, and how
          Speakur keeps audio cost-efficient. Each guide is server-rendered HTML for readers and
          search engines.
        </p>

        <ul className="mt-10 space-y-4">
          {guides.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/guides/${guide.slug}`}
                className="block rounded-2xl border border-paper-line bg-paper-raised p-5 shadow-card transition hover:border-voice"
              >
                <p className="text-xs uppercase tracking-wide text-ink-muted">
                  {guide.publishedAt} · {guide.readingMinutes} min · {guideWordCount(guide)} words
                </p>
                <h2 className="mt-2 font-display text-2xl text-ink">{guide.title}</h2>
                <p className="mt-2 text-ink-muted">{guide.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </SiteShell>
  );
}
