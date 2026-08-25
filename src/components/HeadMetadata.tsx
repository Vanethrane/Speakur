import { SEOHead, type SEOHeadProps } from "@/components/SEOHead";

export type HeadMetadataProps = SEOHeadProps;

/**
 * Server-rendered page head JSON-LD (no client hydration).
 * Emits one application/ld+json script with SoftwareApplication, WebPage,
 * BreadcrumbList, FAQPage, and HowTo (when dataset templates exist).
 */
export function HeadMetadata(props: HeadMetadataProps) {
  return <SEOHead {...props} />;
}

export default HeadMetadata;
