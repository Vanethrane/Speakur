import type { Metadata } from "next";
import Link from "next/link";
import { dynamicTitleMetadata } from "@/components/SEOHead";
import { SiteShell } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: dynamicTitleMetadata({
    pageType: "site",
    name: "Terms of Service",
    keyword: "Speakur terms",
  }),
  description: "Terms of Service governing use of the Speakur pronunciation search and editorial guides.",
};

export default function TermsPage() {
  return (
    <SiteShell>
      <article className="py-12">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-voice">Legal</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-ink">Terms of Service</h1>
        <p className="mt-3 text-sm text-ink-muted">Last updated: April 28, 2026</p>

        <div className="mt-8 space-y-5 text-base leading-relaxed text-ink">
          <p>
            These Terms of Service (“Terms”) govern your access to and use of Speakur websites and
            services. By using Speakur, you agree to these Terms and our{" "}
            <Link href="/privacy" className="text-voice-dark underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </p>

          <h2 className="pt-2 font-display text-2xl">Service description</h2>
          <p>
            Speakur provides pronunciation lookup, related reference information, editorial guides,
            and optional on-demand audio. Features may change. We do not guarantee uninterrupted
            availability or that every word, accent, or definition is complete or error-free.
          </p>

          <h2 className="pt-2 font-display text-2xl">Acceptable use</h2>
          <p>
            You agree not to misuse Speakur, including by attempting to scrape in ways that degrade
            service, bypass rate limits, trigger automated paid synthesis at scale, reverse engineer
            except where allowed by law, upload unlawful content, or use the service to impersonate
            others or generate deceptive media. Voice cloning features, if ever offered, may require
            additional consent rules.
          </p>

          <h2 className="pt-2 font-display text-2xl">Accounts and communications</h2>
          <p>
            If accounts are introduced, you are responsible for credentials and activity under your
            account. You may contact us as described on the Contact page. Electronic notices to the
            email you provide satisfy written notice requirements.
          </p>

          <h2 className="pt-2 font-display text-2xl">Intellectual property</h2>
          <p>
            Speakur branding, original editorial content, and software are owned by Speakur or its
            licensors. Dictionary definitions and third-party audio may be subject to upstream
            licenses. You may not copy our guides for commercial redistribution without permission.
            You may link to our public pages.
          </p>

          <h2 className="pt-2 font-display text-2xl">AI-generated audio</h2>
          <p>
            Studio audio may be produced by third-party models. Outputs can be imperfect. Do not
            rely on Speakur as the sole source for safety-critical communication. Cached audio may
            persist after generation; contact us if you believe content should be removed.
          </p>

          <h2 className="pt-2 font-display text-2xl">Advertising</h2>
          <p>
            The service may include third-party advertisements. Ad partners’ technologies are
            described in the Privacy Policy, including cookies and third-party ad serving. Ads are
            not endorsements.
          </p>

          <h2 className="pt-2 font-display text-2xl">Disclaimers</h2>
          <p>
            THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES OF ANY KIND,
            EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
            NON-INFRINGEMENT. Language data can be wrong; verify critical pronunciations with
            qualified humans when needed.
          </p>

          <h2 className="pt-2 font-display text-2xl">Limitation of liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, SPEAKUR AND ITS SUPPLIERS WILL NOT BE LIABLE FOR
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
            PROFITS OR DATA, ARISING FROM YOUR USE OF THE SERVICE. OUR AGGREGATE LIABILITY FOR
            CLAIMS RELATING TO THE SERVICE WILL NOT EXCEED THE GREATER OF TEN US DOLLARS (US $10) OR
            THE AMOUNT YOU PAID US IN THE THREE MONTHS BEFORE THE CLAIM.
          </p>

          <h2 className="pt-2 font-display text-2xl">Indemnity</h2>
          <p>
            You will indemnify and hold harmless Speakur from claims arising out of your misuse of
            the service or violation of these Terms, except to the extent caused by our willful
            misconduct.
          </p>

          <h2 className="pt-2 font-display text-2xl">Governing law</h2>
          <p>
            These Terms are governed by the laws of the State of California, excluding conflict
            rules. Courts in San Francisco County, California, will have exclusive jurisdiction,
            except where prohibited by consumer protection law.
          </p>

          <h2 className="pt-2 font-display text-2xl">Changes and contact</h2>
          <p>
            We may update these Terms by posting a new version. Continued use after changes
            constitutes acceptance. Questions:{" "}
            <a className="text-voice-dark underline underline-offset-4" href="mailto:vanethrane@gmail.com">
              vanethrane@gmail.com
            </a>{" "}
            or{" "}
            <Link href="/contact" className="text-voice-dark underline underline-offset-4">
              Contact
            </Link>
            .
          </p>
        </div>
      </article>
    </SiteShell>
  );
}
