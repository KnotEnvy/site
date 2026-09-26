import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import SplitText from "@/components/ui/SplitText";
import { pageFor } from "@/lib/pages";
import { clsx } from "@/lib/clsx";

/**
 * The turn at the bottom of the Descent. The home page ends in fire on
 * purpose - and this is where it stops being a warning and becomes an
 * invitation: the way back up, into the rest of the site.
 *
 * The Ascent gets the big door, with a column of light motes rising through it
 * (pure CSS, so it costs nothing and the global reduced-motion rule stills
 * it). The other pages get smaller doors, each with its own glyph.
 */

const DOORS = [
  { href: "/evidence", glyph: "pulse" },
  { href: "/great-minds", glyph: "orbit" },
  { href: "/scripture", glyph: "book" },
  { href: "/begin", glyph: "sunrise" },
] as const;

function Glyph({ kind }: { kind: (typeof DOORS)[number]["glyph"] }) {
  const common = {
    viewBox: "0 0 48 48",
    className: "h-10 w-10",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (kind) {
    case "pulse":
      return (
        <svg {...common}>
          <path d="M3 26h9l4-10 6 20 5-14 3 4h15" />
        </svg>
      );
    case "orbit":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="5" />
          <ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(-25 24 24)" />
          <circle cx="41" cy="16" r="2" fill="currentColor" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M24 12c-5-4-12-4-18-2v26c6-2 13-2 18 2 5-4 12-4 18-2V10c-6-2-13-2-18 2z" />
          <path d="M24 12v26" />
        </svg>
      );
    case "sunrise":
      return (
        <svg {...common}>
          <path d="M6 34h36M12 34a12 12 0 0124 0" />
          <path d="M24 10v6M11 17l4 4M37 17l-4 4M4 26h4M40 26h4" />
        </svg>
      );
  }
}

export default function TheWayUp() {
  const ascent = pageFor("/the-ascent");

  return (
    <section id="the-way-up" aria-labelledby="way-up-heading" className="relative z-10 overflow-x-clip py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal from="down">
          <p className="inline-block rounded-full bg-ink/65 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.26em] text-dawn ring-1 ring-white/15 backdrop-blur">
            The bottom of the descent
          </p>
        </Reveal>
        <h2 id="way-up-heading" className="display-lg mt-5">
          <span className="block">
            <SplitText text="There is" className="text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]" />
          </span>
          <span className="block">
            <SplitText text="a way up." delay={0.15} className="text-dawn drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]" />
          </span>
        </h2>
        <Reveal from="left" delay={0.2}>
          <p className="copy mt-8 max-w-2xl rounded-2xl bg-ink/60 p-5 text-lg text-paper/90 ring-1 ring-white/10 backdrop-blur-md">
            Almost every account of darkness in these vaults ends the same way:
            someone called out, and a light reached down. The descent is not
            the end of the story. It is the reason the rest of it matters.
          </p>
        </Reveal>

        {/* The big door: The Ascent */}
        <Reveal from="in" className="mt-14">
          <Link
            href={ascent.href}
            className="group relative block min-h-[22rem] overflow-hidden rounded-3xl bg-gradient-to-t from-[#fff1c0]/25 via-[#34479a]/40 to-[#050822]/80 p-8 text-white ring-1 ring-white/20 backdrop-blur-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:p-12"
          >
            {/* Rising motes of light */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-0">
              {Array.from({ length: 18 }, (_, i) => (
                <span
                  key={i}
                  className="mote"
                  style={
                    {
                      left: `${(i * 53) % 100}%`,
                      "--mote-delay": `${(i * 0.73) % 6}s`,
                      "--mote-dur": `${6 + ((i * 1.7) % 5)}s`,
                      "--mote-size": `${3 + (i % 4) * 2}px`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(255,241,192,0.55),rgba(255,241,192,0)_65%)] transition-transform duration-1000 group-hover:scale-110"
            />

            <span className="relative block text-xs font-bold uppercase tracking-[0.26em] text-dawn">
              New · An interactive story
            </span>
            <span className="relative mt-4 block font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.88]">
              The Ascent
            </span>
            <span className="copy relative mt-5 block max-w-xl text-lg text-white/85">
              From darkness into light. Scroll through the wonders of creation
              and watch what God&apos;s love makes of a life, in a story that
              moves with you.
            </span>
            <span className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-dawn px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-ink transition group-hover:gap-3">
              Begin the ascent
              <svg viewBox="0 0 24 24" className="h-4 w-4 -rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </Reveal>

        {/* The other doors */}
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DOORS.map((d, i) => {
            const p = pageFor(d.href);
            return (
              <li key={d.href}>
                <Reveal from={i % 2 === 0 ? "tilt-left" : "tilt-right"} delay={i * 0.06} className="h-full">
                  <Link
                    href={p.href}
                    className={clsx(
                      "group flex h-full flex-col rounded-2xl bg-ink/60 p-6 text-paper ring-1 ring-white/12 backdrop-blur-md transition hover:bg-ink/75",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                    )}
                  >
                    <span className="block w-fit text-dawn transition-transform duration-500 group-hover:-translate-y-1">
                      <Glyph kind={d.glyph} />
                    </span>
                    <span className="mt-5 font-display text-3xl leading-none">{p.nav}</span>
                    <span className="copy mt-2 flex-1 text-sm text-paper/70">{p.hook}</span>
                    <span className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-dawn">
                      Explore <span aria-hidden="true" className="inline-block transition group-hover:translate-x-1">→</span>
                    </span>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
