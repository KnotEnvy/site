import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { NAV_PAGES, nextPage } from "@/lib/pages";
import { clsx } from "@/lib/clsx";

/**
 * The foot of every page: one big door to the next chapter of the site, and
 * smaller doors to the rest. Nobody should reach the bottom of a page and find
 * a dead end - and every page linking to every other is also how search
 * engines learn the site is one connected body of work.
 */
export default function ContinueJourney({
  from,
  tone = "dark",
  heading = "Continue the discovery",
}: {
  from: string;
  tone?: "light" | "dark";
  heading?: string;
}) {
  const next = nextPage(from);
  const others = NAV_PAGES.filter((p) => p.href !== from && p.href !== next.href);
  const dark = tone === "dark";

  return (
    <section aria-labelledby="continue-heading" className="relative z-10 overflow-x-clip px-4 pb-24 pt-12 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <Reveal from="in">
          <p
            id="continue-heading"
            className="inline-block rounded-full bg-ink/60 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-white ring-1 ring-white/15 backdrop-blur"
          >
            {heading}
          </p>
        </Reveal>

        <Reveal from="up" className="mt-6">
          <Link
            href={next.href}
            className={clsx(
              "group relative block overflow-hidden rounded-3xl p-8 backdrop-blur-md transition sm:p-12",
              dark ? "bg-night/60 text-white ring-1 ring-white/15 hover:bg-night/70" : "bg-paper/90 text-ink ring-1 ring-black/5 hover:bg-paper",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            )}
          >
            {/* Light gathering at the far edge - the door is open. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,207,122,0.45),rgba(255,207,122,0)_65%)] transition-transform duration-700 group-hover:scale-125"
            />
            <span className={clsx("relative text-xs font-bold uppercase tracking-[0.24em]", dark ? "text-dawn" : "text-blaze")}>
              Next · {next.nav}
            </span>
            <span className="relative mt-3 block font-display text-[clamp(2.2rem,6vw,4.5rem)] leading-[0.92]">
              {next.name}
            </span>
            <span className={clsx("copy relative mt-4 block max-w-2xl text-lg", dark ? "text-white/75" : "text-ink/75")}>
              {next.hook}
            </span>
            <span
              className={clsx(
                "relative mt-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-[0.14em] transition group-hover:gap-3",
                dark ? "bg-dawn text-ink" : "bg-blaze text-white"
              )}
            >
              Continue
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </Reveal>

        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((p, i) => (
            <li key={p.href}>
              <Reveal delay={i * 0.06} from="up" className="h-full">
                <Link
                  href={p.href}
                  className={clsx(
                    "group block h-full rounded-2xl p-5 backdrop-blur-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white",
                    dark ? "bg-night/50 text-white ring-1 ring-white/10 hover:bg-night/65" : "bg-paper/85 text-ink ring-1 ring-black/5 hover:bg-paper"
                  )}
                >
                  <span className="font-display text-2xl leading-none">{p.nav}</span>
                  <span className={clsx("copy mt-2 block text-sm", dark ? "text-white/65" : "text-ink/65")}>{p.hook}</span>
                  <span aria-hidden="true" className="mt-3 inline-block transition group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
