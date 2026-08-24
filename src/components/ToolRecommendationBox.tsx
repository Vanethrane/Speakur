import Link from "next/link";
import {
  getToolAffiliateForLanguage,
  type PageLanguageMeta,
} from "@/lib/dataset";

type ToolRecommendationBoxProps = {
  /** Target language from dataset.json (e.g. "Japanese", "English Voiceover") */
  language: string;
  /** Optional accent tag from dataset.json for display context */
  accent?: string;
  className?: string;
};

/**
 * Maps the page’s target language to a matching affiliate referral tool.
 * Japanese → Japanese toolkit; English Voiceover → English studio; etc.
 */
export function ToolRecommendationBox({
  language,
  accent,
  className = "",
}: ToolRecommendationBoxProps) {
  const tool = getToolAffiliateForLanguage(language);
  const external = /^https?:\/\//i.test(tool.href);

  const body = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-voice">
          Recommended tool
        </p>
        <span className="rounded-full border border-paper-line bg-paper px-2.5 py-0.5 text-xs text-ink-muted">
          {language}
        </span>
        {accent ? (
          <span className="rounded-full border border-dashed border-paper-line px-2.5 py-0.5 text-xs text-ink-muted">
            accent: {accent}
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-xl leading-snug tracking-tight text-ink">
        {tool.title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{tool.description}</p>
      <span className="mt-4 inline-flex text-sm font-medium text-voice-dark underline-offset-4 group-hover:underline">
        {tool.cta}
      </span>
    </>
  );

  const shellClass = `group mt-10 block rounded-xl border border-paper-line bg-paper-raised px-5 py-4 transition hover:border-voice ${className}`;

  if (external) {
    return (
      <aside className={shellClass} data-tool={tool.id} data-language={language}>
        <a
          href={tool.href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-voice"
        >
          {body}
        </a>
      </aside>
    );
  }

  return (
    <aside className={shellClass} data-tool={tool.id} data-language={language}>
      <Link
        href={tool.href}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-voice"
      >
        {body}
      </Link>
    </aside>
  );
}

/** Convenience: render from a full dataset page meta object */
export function ToolRecommendationFromMeta({
  meta,
  className,
}: {
  meta: PageLanguageMeta;
  className?: string;
}) {
  return (
    <ToolRecommendationBox
      language={meta.language}
      accent={meta.accent}
      className={className}
    />
  );
}
