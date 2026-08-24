import { SiteShell } from "@/components/SiteChrome";
import { SearchBox } from "@/components/SearchBox";
import Link from "next/link";

export default function NotFound() {
  return (
    <SiteShell>
      <section className="mt-16">
        <h1 className="font-display text-4xl text-ink">We couldn’t find that page</h1>
        <p className="mt-3 text-ink-muted">
          Try a different spelling, browse guides, or return home.
        </p>
        <div className="mt-8">
          <SearchBox autoFocus />
        </div>
        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="text-voice-dark underline underline-offset-4">
            Home
          </Link>
          <Link href="/guides" className="text-voice-dark underline underline-offset-4">
            Guides
          </Link>
          <Link href="/contact" className="text-voice-dark underline underline-offset-4">
            Contact
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
