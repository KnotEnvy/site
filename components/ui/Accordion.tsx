import { clsx } from "@/lib/clsx";
import type { Tone } from "@/components/ui/Panel";

/**
 * A native <details> disclosure. No JS: it opens without hydration, it is
 * keyboard and screen-reader accessible by default, and the answer text is in
 * the server HTML where search and answer engines can read it.
 */
export default function Accordion({
  summary,
  children,
  tone = "light",
  kicker,
  defaultOpen = false,
  className,
}: {
  summary: React.ReactNode;
  children: React.ReactNode;
  tone?: Tone;
  kicker?: string;
  defaultOpen?: boolean;
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <details
      open={defaultOpen}
      className={clsx(
        "accordion group rounded-2xl backdrop-blur-md transition",
        dark ? "bg-night/60 ring-1 ring-white/12 open:bg-night/75" : "bg-paper/88 shadow-lg ring-1 ring-black/5 open:bg-paper/95",
        className
      )}
    >
      <summary
        className={clsx(
          "flex items-start gap-4 rounded-2xl p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:p-6",
          dark ? "focus-visible:outline-white" : "focus-visible:outline-blaze"
        )}
      >
        <span className="min-w-0 flex-1">
          {kicker && (
            <span
              className={clsx(
                "mb-1 block text-xs font-bold uppercase tracking-[0.2em]",
                dark ? "text-dawn" : "text-science"
              )}
            >
              {kicker}
            </span>
          )}
          <span className={clsx("copy block text-lg font-semibold leading-snug", dark ? "text-white" : "text-ink")}>
            {summary}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={clsx(
            "accordion-icon mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-lg leading-none",
            dark ? "bg-white/10 text-white" : "bg-ink/8 text-ink"
          )}
        >
          +
        </span>
      </summary>
      <div className={clsx("accordion-body copy px-5 pb-6 sm:px-6", dark ? "text-white/85" : "text-ink/80")}>
        {children}
      </div>
    </details>
  );
}
