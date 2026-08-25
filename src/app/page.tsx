import Link from "next/link";
import { PopularWords, SiteShell } from "@/components/SiteChrome";
import { SearchBox } from "@/components/SearchBox";
import { getAllGuides } from "@/content/guides";

export default function HomePage() {
  const latestGuides = getAllGuides().slice(0, 3);

  return (
    <SiteShell>
      <section className="flex flex-1 flex-col justify-center py-16">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-voice">
          Pronunciation search
        </p>
        <h1 className="mt-4 max-w-xl font-display text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl">
          How do you say it?
        </h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-muted">
          Speakur is free pronunciation help for English. Look up any word to hear clear US and UK
          audio, see IPA phonetic spelling and syllables, and read plain definitions—so you can speak
          confidently in meetings, classrooms, videos, and everyday conversations.
        </p>
        <div className="mt-10">
          <SearchBox />
        </div>
        <div className="mt-10">
          <PopularWords />
        </div>
        <div className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl text-ink">From the guides</h2>
            <Link href="/guides" className="text-sm text-voice-dark underline underline-offset-4">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {latestGuides.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/guides/${guide.slug}`}
                  className="block rounded-xl border border-paper-line bg-paper-raised px-4 py-3 hover:border-voice"
                >
                  <span className="font-medium text-ink">{guide.title}</span>
                  <span className="mt-1 block text-sm text-ink-muted">{guide.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}
