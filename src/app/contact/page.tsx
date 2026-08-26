import type { Metadata } from "next";
import { dynamicTitleMetadata } from "@/components/SEOHead";
import { SiteShell } from "@/components/SiteChrome";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: dynamicTitleMetadata({
    pageType: "site",
    name: "Contact Speakur",
    keyword: "Contact pronunciation support",
  }),
  description: "Contact the Speakur team for product, privacy, partnership, or accessibility questions.",
};

export default function ContactPage() {
  return (
    <SiteShell>
      <article className="py-12">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-voice">Contact</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-ink">Get in touch</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">
          We read every message about product feedback, partnerships, privacy requests, and
          accessibility barriers. Use the form below or email us directly.
        </p>

        <div className="mt-8 rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-card">
          <h2 className="font-display text-xl text-ink">Working contact details</h2>
          <dl className="mt-4 space-y-3 text-sm text-ink">
            <div>
              <dt className="text-ink-muted">Email</dt>
              <dd>
                <a className="text-voice-dark underline underline-offset-4" href="mailto:vanethrane@gmail.com">
                  vanethrane@gmail.com
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted">Privacy</dt>
              <dd>
                <a className="text-voice-dark underline underline-offset-4" href="mailto:vanethrane@gmail.com">
                  vanethrane@gmail.com
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted">Mailing address</dt>
              <dd className="leading-relaxed">
                Speakur
                <br />
                548 Market St, PMB 37281
                <br />
                San Francisco, CA 94104
                <br />
                United States
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8">
          <h2 className="font-display text-xl text-ink">Contact form</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Submitting opens your email client with a prefilled message to vanethrane@gmail.com.
          </p>
          <div className="mt-4">
            <ContactForm />
          </div>
        </div>
      </article>
    </SiteShell>
  );
}
