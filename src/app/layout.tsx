import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { PwaInstall } from "@/components/PwaInstall";
import { dynamicTitleMetadata } from "@/components/SEOHead";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-outfit",
  preload: true,
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-fraunces",
  preload: true,
});

export const metadata: Metadata = {
  title: dynamicTitleMetadata({
    pageType: "site",
    name: "Speakur",
    keyword: "Pronunciation search",
  }),
  description:
    "Free English pronunciation search: hear US and UK audio, read IPA and definitions, and learn to say difficult words with confidence.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/assets/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/assets/icon.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    title: "Speakur",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d6e66",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable}`}>
      <head>
        <script data-cfasync="false" src="https://cmp.gatekeeperconsent.com/min.js" />
        <script data-cfasync="false" src="https://the.gatekeeperconsent.com/cmp.min.js" />
        <script async src="https://www.ezojs.com/ezoic/sa.min.js" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.ezstandalone = window.ezstandalone || {};ezstandalone.cmd = ezstandalone.cmd || [];",
          }}
        />
        <script src="https://ezoicanalytics.com/analytics.js" />
        {/* Critical CSS inlined for sub-500ms first paint */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
:root{color-scheme:light;--ink:#1c1712;--paper:#f6f1e8;--voice:#0d6e66;--ad-banner-h:90px;--ad-inline-h:90px}
@media(max-width:767px){:root{--ad-banner-h:90px;--ad-inline-h:90px}}
html{scroll-behavior:smooth}
body{margin:0;min-height:100vh;background:var(--paper);color:var(--ink);font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
.stable-slot{contain:layout;width:100%}
.ad-slot{display:flex;justify-content:center;align-items:center;overflow:hidden;contain:layout style}
.ad-slot-top{min-height:var(--ad-banner-h)}.ad-slot-bottom{min-height:var(--ad-inline-h)}
`,
          }}
        />
      </head>
      <body className={`${outfit.className} antialiased`}>
        {children}
        <PwaInstall />
      </body>
    </html>
  );
}
