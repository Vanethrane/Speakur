import Link from "next/link";
import { uniqueSeedWords } from "@/lib/words";
import { AdSlot } from "@/components/ads";
import { HistoryProvider } from "@/components/HistoryDrawer";
import { StableSlot } from "@/components/StableSlot";
import { ToolsNavDropdown } from "@/components/ToolsNavDropdown";

export const HARD_WORDS = uniqueSeedWords().slice(0, 8);

const FOOTER_PRODUCT = [
  { href: "/", label: "Pronunciation search" },
  { href: "/tools", label: "Practice tools" },
  { href: "/words", label: "Word directories" },
  { href: "/guides", label: "Editorial guides" },
  { href: "/donate", label: "Donate" },
  { href: "/guides/how-to-read-ipa-phonetic-symbols", label: "IPA guide" },
  { href: "/guides/commonly-mispronounced-english-words", label: "Tricky words" },
] as const;

const FOOTER_TRUST = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
] as const;

const NAV = [
  { href: "/words", label: "Words" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="font-display text-2xl tracking-tight text-ink">
          Speakur
        </Link>
        <nav aria-label="Primary" className="flex flex-wrap items-center gap-4 text-sm text-ink-muted">
          {NAV.slice(0, 2).map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-voice-dark">
              {item.label}
            </Link>
          ))}
          <ToolsNavDropdown />
          {NAV.slice(2).map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-voice-dark">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-paper-line pt-10">
      <div className="grid gap-8 sm:grid-cols-3">
        <div>
          <p className="font-display text-xl text-ink">Speakur</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
            Pronunciation search and editorial guides for creators, learners, and global marketers.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">Product</p>
          <ul className="mt-3 space-y-2 text-sm">
            {FOOTER_PRODUCT.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink hover:text-voice-dark">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">
            Trust &amp; legal
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {FOOTER_TRUST.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink hover:text-voice-dark">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-10 pb-2 text-xs text-ink-muted">
        © {new Date().getFullYear()} Speakur. Text content is server-rendered for search indexing.
      </p>
    </footer>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <HistoryProvider>
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-8">
        <SiteHeader />
        <StableSlot
          minHeight="90px"
          className="ad-slot-top mt-4 border-b border-paper-line pb-4"
          aria-label="Advertisement"
        >
          <AdSlot slotType="banner" />
        </StableSlot>
        <div className="flex-1" style={{ minHeight: "20rem", contain: "layout" }}>
          {children}
        </div>
        <StableSlot
          minHeight="90px"
          className="ad-slot-bottom mt-8 border-t border-paper-line pt-4"
          aria-label="Advertisement"
        >
          <AdSlot slotType="inline" />
        </StableSlot>
        <SiteFooter />
      </div>
    </HistoryProvider>
  );
}

export function PopularWords() {
  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-muted">
        People look up
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {HARD_WORDS.map((word) => (
          <Link
            key={word}
            href={`/w/${word}`}
            className="rounded-full border border-paper-line bg-paper-raised px-4 py-2 text-sm text-ink hover:border-voice hover:text-voice-dark"
          >
            {word}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose-speakur mt-8 space-y-5 text-base leading-relaxed text-ink [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:tracking-tight [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_li]:ml-5 [&_li]:list-disc [&_p]:text-ink [&_ul]:space-y-2">
      {children}
    </div>
  );
}
