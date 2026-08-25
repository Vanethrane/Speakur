import type { Metadata } from "next";
import Link from "next/link";
import { dynamicTitleMetadata } from "@/components/SEOHead";
import { SiteShell } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: dynamicTitleMetadata({
    pageType: "site",
    name: "About Speakur",
    keyword: "About pronunciation search",
  }),
  description:
    "Speakur helps people hear how words are pronounced and learn from long-form guides on speech, accents, and audio localization.",
};

export default function AboutPage() {
  return (
    <SiteShell>
      <article className="py-12">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-voice">About Us</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-ink sm:text-5xl">
          Hear the word. Keep the cadence.
        </h1>
        <div className="mt-8 space-y-5 text-base leading-relaxed text-ink">
          <p>
            Speakur is a pronunciation search and learning platform. Type a word, read its IPA
            phonetic spelling, see syllable cues, and play audio—without making search crawlers
            trigger paid text-to-speech on every hit. We believe useful language tools should be
            fast for humans, honest for advertisers, and readable in raw HTML for Google.
          </p>
          <p>
            Our mission is to make spoken language more accessible for learners, creators,
            educators, and global marketers. Too many products either hide behind apps with thin
            public content or generate endless doorway pages with almost no teaching value. Speakur
            pairs programmatic pronunciation pages with a growing library of editorial guides on
            speech synthesis, accents, localization, classroom practice, accessibility, and
            responsible ad tech.
          </p>
          <h2 className="pt-4 font-display text-2xl text-ink">What we build</h2>
          <p>
            The core product is instant pronunciation lookup. Definitions and phonetics are
            server-rendered so crawlers and assistive technologies receive real text. Studio-quality
            synthesis, when enabled, runs only after a user clicks Play, then caches permanently in
            object storage. Free dictionary audio is used whenever it already exists.
          </p>
          <p>
            Alongside the utility, we publish long-form articles—each intended to stand alone as
            genuine teaching content. That editorial layer is deliberate: it helps users go deeper,
            and it demonstrates to reviewers that Speakur is a real information resource, not a
            blank shell.
          </p>
          <h2 className="pt-4 font-display text-2xl text-ink">Who we serve</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Language learners who need a calm, fast reference</li>
            <li>Teachers building pronunciation routines</li>
            <li>Marketers and localization teams aligning product-name audio</li>
            <li>Creators who care about accents and intelligibility</li>
          </ul>
          <h2 className="pt-4 font-display text-2xl text-ink">Contact</h2>
          <p>
            Questions about the product, partnerships, privacy, or accessibility barriers are
            welcome on our{" "}
            <Link href="/contact" className="text-voice-dark underline underline-offset-4">
              Contact
            </Link>{" "}
            page. Legal terms live in{" "}
            <Link href="/terms" className="text-voice-dark underline underline-offset-4">
              Terms of Service
            </Link>
            ; data practices are described in our{" "}
            <Link href="/privacy" className="text-voice-dark underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </article>
    </SiteShell>
  );
}
