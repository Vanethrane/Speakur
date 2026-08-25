import Link from "next/link";
import {
  getRelatedToolsAndConversions,
  type RelatedLink,
} from "@/lib/dataset";
import { StableSlot } from "@/components/StableSlot";

type RelatedToolsConversionsProps = {
  slug: string;
  className?: string;
};

function RelatedCard({ item }: { item: RelatedLink }) {
  return (
    <li>
      <Link
        href={item.href}
        className="group flex h-full flex-col rounded-xl border border-paper-line bg-paper-raised px-4 py-3 transition hover:border-voice focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-voice"
      >
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-ink-muted">
          {item.parentCategory.replace(/-/g, " ")}
        </p>
        <p className="mt-2 font-medium leading-snug text-ink group-hover:text-voice-dark">
          {item.anchorText}
        </p>
        {item.sharedTags.length > 0 ? (
          <p className="mt-2 text-xs text-ink-muted">
            {item.sharedTags.slice(0, 3).join(" · ")}
          </p>
        ) : (
          <p className="mt-2 text-xs text-ink-muted">{item.name}</p>
        )}
      </Link>
    </li>
  );
}

/**
 * Automated internal linking grid for programmatic [slug] pages.
 * Pulls related siblings from dataset.json (shared parentCategory / tags)
 * and uses each target’s primaryKeyword as natural anchor text.
 */
export function RelatedToolsConversions({
  slug,
  className = "",
}: RelatedToolsConversionsProps) {
  const items = getRelatedToolsAndConversions(slug, 6);
  if (items.length === 0) return null;

  return (
    <StableSlot minHeight="16rem" className="related-grid-slot">
    <section
      className={`mt-14 ${className}`}
      aria-labelledby="related-tools-heading"
      data-internal-links={items.length}
    >
      <h2
        id="related-tools-heading"
        className="font-display text-2xl tracking-tight text-ink"
      >
        Related Tools &amp; Conversions
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
        More Speakur guides in the same category and topic tags — linked with the
        keywords readers actually search.
      </p>
      <ul className="mt-6 grid min-h-[12rem] gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <RelatedCard key={item.slug} item={item} />
        ))}
      </ul>
    </section>
    </StableSlot>
  );
}

export default RelatedToolsConversions;
