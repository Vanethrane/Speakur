import { buildProgrammaticJsonLd, type ProgrammaticSchemaInput } from "@/lib/dataset";

type HeadMetadataProps = ProgrammaticSchemaInput;

/**
 * Head metadata component: emits valid Schema.org JSON-LD for
 * SoftwareApplication and HowTo on every programmatic page.
 * Variables (applicationCategory, name, steps, etc.) come from dataset.json.
 */
export function HeadMetadata(props: HeadMetadataProps) {
  const { softwareApplication, howTo } = buildProgrammaticJsonLd(props);

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD must be raw serialized objects for crawlers
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplication),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howTo),
        }}
      />
    </>
  );
}

export default HeadMetadata;
