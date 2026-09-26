import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import SplitText from "@/components/ui/SplitText";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { clsx } from "@/lib/clsx";
import type { Tone } from "@/components/ui/Panel";

/**
 * The opening of every inner page: breadcrumb, eyebrow chip, a huge display
 * H1 that assembles letter by letter, and a lede in a glass panel.
 *
 * Exactly one <h1> per page, and it is real text in the server HTML (SplitText
 * only animates after hydration), which is what search engines index.
 */
export default function PageHero({
  eyebrow,
  lines,
  lede,
  tone = "dark",
  trail,
  children,
  aside,
  className,
  titleSize = "xl",
}: {
  eyebrow: string;
  /** H1 lines; each can carry its own colour class. */
  lines: { text: string; className?: string }[];
  lede: React.ReactNode;
  tone?: Tone;
  trail?: { name: string; path: string }[];
  /** Actions under the lede. */
  children?: React.ReactNode;
  /** Optional right-hand column (art, stats) on wide screens. */
  aside?: React.ReactNode;
  className?: string;
  /** "lg" for long, question-style titles. A prop rather than a utility
   *  override: .display-* is unlayered CSS and beats Tailwind utilities
   *  (handoff.json criticalLessons #10). */
  titleSize?: "xl" | "lg";
}) {
  const dark = tone === "dark";
  return (
    <section
      className={clsx(
        "relative flex min-h-[92svh] flex-col justify-center overflow-x-clip px-4 pb-20 pt-28 sm:px-6",
        className
      )}
    >
      <div
        className={clsx(
          "mx-auto grid w-full max-w-7xl gap-10",
          aside ? "lg:grid-cols-[1.15fr_0.85fr] lg:items-center" : undefined
        )}
      >
        <div>
          {trail && (
            <Reveal from="down" data-og="hide">
              <Breadcrumbs trail={trail} tone={tone} />
            </Reveal>
          )}
          <Reveal from="down" delay={0.05} className="mt-5">
            <p
              className={clsx(
                "inline-block rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.22em] backdrop-blur",
                dark ? "bg-white/10 text-dawn ring-1 ring-white/15" : "bg-paper/85 text-ink/70"
              )}
            >
              {eyebrow}
            </p>
          </Reveal>

          <h1 className={clsx(titleSize === "xl" ? "display-xl" : "display-lg", "mt-5")}>
            {lines.map((line, i) => (
              <span key={line.text} className="block">
                <SplitText
                  text={line.text}
                  delay={0.1 + i * 0.16}
                  className={clsx(
                    // Dark shadow behind white type; a light glow behind ink type -
                    // a dark shadow under dark letters just reads as a smudge.
                    dark
                      ? "drop-shadow-[0_4px_30px_rgba(0,0,0,0.45)]"
                      : "drop-shadow-[0_2px_22px_rgba(255,250,235,0.7)]",
                    line.className ?? (dark ? "text-white" : "text-ink")
                  )}
                />
              </span>
            ))}
          </h1>

          <Reveal delay={0.35} from="left" className="mt-8 max-w-2xl" data-og="hide">
            <div
              className={clsx(
                "copy rounded-2xl p-5 text-base backdrop-blur-md sm:text-lg",
                dark ? "bg-night/55 text-white/90 ring-1 ring-white/12" : "bg-paper/88 text-ink/85"
              )}
            >
              {lede}
            </div>
          </Reveal>

          {children && (
            <Reveal delay={0.5} from="up" className="mt-8" data-og="hide">
              {children}
            </Reveal>
          )}
        </div>

        {aside && (
          <Reveal delay={0.3} from="right" className="hidden lg:block">
            {aside}
          </Reveal>
        )}
      </div>
    </section>
  );
}

/** Pill-shaped call-to-action links used in heroes and chapter ends. */
export function PillLink({
  href,
  children,
  variant = "primary",
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "dawn" | "outline";
  external?: boolean;
}) {
  const cls = clsx(
    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-[0.14em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
    variant === "primary" && "bg-blaze text-white shadow-lg shadow-blaze/30 hover:bg-sky-deep",
    variant === "dawn" && "bg-dawn text-ink shadow-lg shadow-dawn/30 hover:bg-white",
    variant === "ghost" && "bg-white/10 text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/20",
    // For light skies, where the white ghost button disappears.
    variant === "outline" && "bg-paper/70 text-ink ring-1 ring-ink/25 backdrop-blur hover:bg-paper"
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  // Internal routes go through next/link for client-side navigation.
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
