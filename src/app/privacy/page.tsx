import type { Metadata } from "next";
import Link from "next/link";
import { dynamicTitleMetadata } from "@/components/SEOHead";
import { SiteShell } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: dynamicTitleMetadata({
    pageType: "site",
    name: "Privacy Policy",
    keyword: "Speakur privacy",
  }),
  description:
    "Speakur privacy policy covering cookies, analytics, third-party ad serving, and AI text-to-speech processing.",
};

export default function PrivacyPage() {
  return (
    <SiteShell>
      <article className="py-12">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-voice">Legal</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-ink">Privacy Policy</h1>
        <p className="mt-3 text-sm text-ink-muted">Last updated: April 28, 2026</p>

        <div className="mt-8 space-y-5 text-base leading-relaxed text-ink">
          <p>
            This Privacy Policy explains how Speakur (“we,” “us,” or “our”) collects, uses, and
            shares information when you use speakur.com and related services. By using the site, you
            agree to this policy. For contractual terms, see our{" "}
            <Link href="/terms" className="text-voice-dark underline underline-offset-4">
              Terms of Service
            </Link>
            .
          </p>

          <h2 className="pt-2 font-display text-2xl">Information we collect</h2>
          <p>
            We may collect information you submit (such as contact-form contents and email address),
            technical data (IP address, browser type, device, referring URL, timestamps), and usage
            data (pages viewed, searches performed, Play clicks). We do not require an account for
            basic pronunciation lookup.
          </p>

          <h2 className="pt-2 font-display text-2xl">Cookies and similar technologies</h2>
          <p>
            We use cookies, local storage, pixels, and similar technologies to operate the site,
            remember preferences, measure performance, secure the service, and—when advertising is
            enabled—support third-party ad serving and measurement. Cookies may be first-party
            (set by Speakur) or third-party (set by analytics, advertising, fraud-prevention, or
            embedded partners). You can control cookies through your browser settings; blocking
            some cookies may limit features.
          </p>
          <p>
            Where required by law, we will present a consent experience before non-essential cookies
            and similar technologies run. Essential cookies needed for security and basic operation
            may continue to function.
          </p>

          <h2 className="pt-2 font-display text-2xl">Third-party ad serving</h2>
          <p>
            Speakur may display advertising to keep pronunciation search and editorial guides free.
            When ads are active, third-party ad servers and demand partners may collect or receive
            information about your browser and device, including cookie identifiers, IP address,
            approximate location, and pages or apps where ads appear. Those partners may use this
            information to serve ads, measure campaigns, detect fraud, and—depending on your region
            and consent choices—limit or personalize advertising. We require partners to prohibit
            deceptive ads that impersonate Speakur UI or system warnings.
          </p>
          <p>
            Third-party ad serving technologies may set or read cookies and use pixels or similar
            tools on our pages. Your choices may be managed through our consent tools (when shown),
            industry opt-out pages where available, and browser controls. This Policy specifically
            discloses that third-party ad serving and cookies may be used on Speakur.
          </p>

          <h2 className="pt-2 font-display text-2xl">Analytics</h2>
          <p>
            We may use first-party and third-party analytics to understand aggregate traffic,
            diagnose errors, and improve content. Analytics providers may process IP addresses and
            event data under their own terms.
          </p>

          <h2 className="pt-2 font-display text-2xl">AI text-to-speech and audio caching</h2>
          <p>
            If you click to generate studio pronunciation audio, the word or short text you request
            may be sent to a text-to-speech provider (such as OpenAI) to create an MP3. We aim to
            cache the resulting file in object storage (for example Cloudflare R2) so repeat plays
            do not resend the text. Do not submit sensitive personal data into synthesis inputs.
            Crawlers that only load HTML do not trigger synthesis.
          </p>

          <h2 className="pt-2 font-display text-2xl">How we use information</h2>
          <p>
            We use information to provide and improve Speakur, respond to contact requests, secure
            the service, comply with law, measure content performance, and—when enabled—fund the
            service through advertising.
          </p>

          <h2 className="pt-2 font-display text-2xl">Sharing</h2>
          <p>
            We share data with service providers who help us host, store, analyze, secure, and
            (when applicable) monetize the site, including cloud hosts, object storage, analytics,
            advertising/ad-serving partners, and AI API vendors. We may disclose information if
            required by law or to protect rights and safety. We do not sell personal information in
            the traditional sense; some advertising disclosures may be considered “sharing” under
            certain state laws—use available opt-outs where provided.
          </p>

          <h2 className="pt-2 font-display text-2xl">Retention and security</h2>
          <p>
            We retain information as needed for the purposes above, then delete or aggregate it.
            No method of transmission or storage is perfectly secure; we use reasonable safeguards
            appropriate to the risk.
          </p>

          <h2 className="pt-2 font-display text-2xl">Children</h2>
          <p>
            Speakur is not directed to children under 13 (or under 16 where applicable), and we do
            not knowingly collect personal information from them. Contact us if you believe a child
            provided personal data.
          </p>

          <h2 className="pt-2 font-display text-2xl">Your rights and contact</h2>
          <p>
            Depending on your location, you may have rights to access, correct, delete, or restrict
            certain processing, or to opt out of targeted advertising. Email{" "}
            <a className="text-voice-dark underline underline-offset-4" href="mailto:privacy@speakur.com">
              privacy@speakur.com
            </a>{" "}
            or use our{" "}
            <Link href="/contact" className="text-voice-dark underline underline-offset-4">
              Contact
            </Link>{" "}
            form. We may update this Policy; the “Last updated” date will change when we do.
          </p>
        </div>
      </article>
    </SiteShell>
  );
}
