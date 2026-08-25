import Link from "next/link";
import { ExportShare } from "@/components/ExportShare";
import { SearchBox } from "@/components/SearchBox";
import { QuickCopyButton } from "@/components/QuickCopyButton";
import { StableSlot } from "@/components/StableSlot";
import { getToolAffiliateForLanguage } from "@/lib/dataset";

type GuidePrimaryToolProps = {
  /** Clipboard payload — typically keyword + canonical URL */
  copyText: string;
  historyHref: string;
  shareTitle: string;
  sharePath: string;
  shareDetail?: string;
  language?: string;
  accent?: string;
  /** Optional seed query for the pronunciation search */
  seedQuery?: string;
};

/**
 * Above-the-fold tool strip for programmatic guide [slug] pages.
 * Search + conversion CTA + quick copy stay visible without scrolling on mobile.
 */
export function GuidePrimaryTool({
  copyText,
  historyHref,
  shareTitle,
  sharePath,
  shareDetail,
  language,
  accent,
  seedQuery = "",
}: GuidePrimaryToolProps) {
  const tool = language ? getToolAffiliateForLanguage(language) : null;
  const external = tool ? /^https?:\/\//i.test(tool.href) : false;

  return (
    <StableSlot minHeight="9.5rem" className="guide-primary-tool-slot">
      <section
        className="rounded-2xl border border-voice/25 bg-voice-glow/40 p-3 shadow-card sm:p-4"
        aria-label="Try Speakur tools"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-voice-dark">
            Try it now
          </p>
          <QuickCopyButton text={copyText} historyHref={historyHref} />
        </div>

        <div className="mt-2">
          <SearchBox initialQuery={seedQuery} autoFocus={false} compact />
        </div>

        <ExportShare
          className="mt-3"
          title={shareTitle}
          path={sharePath}
          kind="guide"
          detail={shareDetail}
        />

        {tool ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-voice/15 pt-3">
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-ink-muted">
              Conversion
            </span>
            {language ? (
              <span className="rounded-full border border-paper-line bg-paper-raised px-2 py-0.5 text-[0.65rem] text-ink-muted">
                {language}
              </span>
            ) : null}
            {accent ? (
              <span className="rounded-full border border-dashed border-paper-line px-2 py-0.5 text-[0.65rem] text-ink-muted">
                {accent}
              </span>
            ) : null}
            {external ? (
              <a
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="ml-auto inline-flex min-h-[2.5rem] items-center rounded-full bg-voice px-3 py-1.5 text-xs font-medium text-paper-raised transition hover:bg-voice-dark sm:text-sm"
              >
                {tool.cta}
              </a>
            ) : (
              <Link
                href={tool.href}
                className="ml-auto inline-flex min-h-[2.5rem] items-center rounded-full bg-voice px-3 py-1.5 text-xs font-medium text-paper-raised transition hover:bg-voice-dark sm:text-sm"
              >
                {tool.cta}
              </Link>
            )}
          </div>
        ) : null}
      </section>
    </StableSlot>
  );
}

export default GuidePrimaryTool;
