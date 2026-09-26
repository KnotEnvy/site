import { chapterUrl, type Passage } from "@/lib/content/bible";
import { clsx } from "@/lib/clsx";
import type { Tone } from "@/components/ui/Panel";

/**
 * A passage of Scripture set in the serif display face, with its reference and
 * a link to read the whole chapter in context (free, on Bible.com). Semantic
 * <figure>/<blockquote>/<figcaption> so answer engines can attribute the text.
 */
export default function VerseCard({
  passage,
  tone = "light",
  size = "md",
  className,
  bare = false,
}: {
  passage: Passage;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** No panel - for placing directly on a scrim or inside another panel. */
  bare?: boolean;
}) {
  const dark = tone === "dark";
  return (
    <figure
      className={clsx(
        !bare && "rounded-2xl p-6 backdrop-blur-md sm:p-8",
        !bare && (dark ? "bg-night/60 ring-1 ring-white/12" : "bg-paper/88 shadow-xl ring-1 ring-black/5"),
        className
      )}
    >
      {/* One hanging ornament instead of wrapping the text in quote marks:
          many passages are themselves dialogue (“I am the resurrection…”)
          and wrapping them doubled the marks up. */}
      <span
        aria-hidden="true"
        className={clsx(
          "block h-6 font-serif text-6xl leading-none",
          size === "sm" && "h-5 text-5xl",
          dark ? "text-dawn/80" : "text-scripture-deep"
        )}
      >
        “
      </span>
      <blockquote
        cite={chapterUrl(passage)}
        className={clsx(
          "verse",
          size === "lg" && "text-[clamp(1.6rem,3.4vw,2.6rem)]",
          size === "md" && "text-[clamp(1.35rem,2.4vw,1.85rem)]",
          size === "sm" && "text-xl",
          dark ? "text-white" : "text-ink"
        )}
      >
        {passage.text}
      </blockquote>
      <figcaption className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <cite
          className={clsx(
            "text-sm font-bold uppercase not-italic tracking-[0.2em]",
            dark ? "text-dawn" : "text-ink/70"
          )}
        >
          {passage.ref}
        </cite>
        <a
          href={chapterUrl(passage)}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] underline-offset-4 transition hover:underline",
            dark ? "text-white/60 hover:text-white" : "text-ink/50 hover:text-ink"
          )}
        >
          Read the chapter
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="sr-only">(opens Bible.com)</span>
        </a>
      </figcaption>
    </figure>
  );
}
