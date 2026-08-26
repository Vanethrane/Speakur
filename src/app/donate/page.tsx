import type { Metadata } from "next";
import { dynamicTitleMetadata } from "@/components/SEOHead";
import { SiteShell } from "@/components/SiteChrome";
import { DonateOptions } from "@/components/DonateOptions";

export const metadata: Metadata = {
  title: dynamicTitleMetadata({
    pageType: "site",
    name: "Donate to Speakur",
    keyword: "Donate free pronunciation",
  }),
  description:
    "Support Speakur — a free pronunciation resource. Donate via PayPal or Bitcoin to keep audio and pages online.",
  alternates: { canonical: "/donate" },
};

export default function DonatePage() {
  return (
    <SiteShell>
      <article className="py-12">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-voice">Support</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-ink">Keep Speakur free</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">
          Speakur is a free pronunciation resource — search, IPA, and click-to-play audio with no
          paywall. If it helps you teach, learn, or publish, a donation keeps the servers, audio,
          and pages online for everyone.
        </p>
        <DonateOptions />
      </article>
    </SiteShell>
  );
}
