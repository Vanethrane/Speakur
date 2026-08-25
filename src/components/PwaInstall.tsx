"use client";

import Script from "next/script";

/** Loads static PWA install banner + service worker registration on Next.js pages. */
export function PwaInstall() {
  return (
    <Script
      src="/pwa-install.js"
      strategy="afterInteractive"
      id="speakur-pwa-install"
    />
  );
}

export default PwaInstall;
