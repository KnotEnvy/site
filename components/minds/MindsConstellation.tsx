"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useLenis } from "lenis/react";
import { useHydrated } from "@/lib/useHydrated";
import type { Mind } from "@/lib/content/minds";
import { clsx } from "@/lib/clsx";

/**
 * The founders of modern science as a constellation. The lines between them
 * draw themselves as the section scrolls through (one continuous thread,
 * in chronological-ish order), and every star is a real button: hover or
 * focus to read who it is, click to jump to their card below.
 *
 * Decorative only in the sense that the same people and quotes are also in
 * the server-rendered cards - so nothing here is the only copy of anything.
 */
export default function MindsConstellation({ minds }: { minds: Mind[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const lenis = useLenis();
  const [active, setActive] = useState<string | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "center 0.45"] });
  const draw = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const pts = minds.filter((m) => m.star).map((m) => ({ ...m, x: m.star![0] * 10, y: m.star![1] * 5 }));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
  const current = pts.find((p) => p.id === active);

  const go = (id: string) => {
    const el = document.getElementById(`mind-${id}`);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -100 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div ref={ref} className="relative">
      <svg viewBox="-20 -20 1040 540" className="w-full overflow-visible" aria-hidden="true">
        <defs>
          <radialGradient id="star-glow">
            <stop offset="0%" stopColor="#fffaf0" />
            <stop offset="35%" stopColor="#ffcf7a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffcf7a" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Faint full path, then the drawn one on top. */}
        <path d={d} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="4 8" />
        <motion.path
          d={d}
          fill="none"
          stroke="#ffcf7a"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={hydrated ? { pathLength: draw } : undefined}
          className="drop-shadow-[0_0_6px_rgba(255,207,122,0.8)]"
        />
        {pts.map((p) => (
          <g key={p.id} transform={`translate(${p.x} ${p.y})`}>
            <circle r={active === p.id ? 34 : 22} fill="url(#star-glow)" className="transition-all duration-500" />
            <circle r={4} fill="#fffaf0" />
          </g>
        ))}
      </svg>

      {/* Real, focusable buttons laid over the stars. */}
      <ul className="absolute inset-0">
        {pts.map((p) => (
          <li
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${((p.x + 20) / 1040) * 100}%`, top: `${((p.y + 20) / 540) * 100}%` }}
          >
            <button
              type="button"
              onMouseEnter={() => setActive(p.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(p.id)}
              onBlur={() => setActive(null)}
              onClick={() => go(p.id)}
              className="group flex flex-col items-center gap-1 rounded-full p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-dawn"
              aria-label={`${p.name}, ${p.field}. Read more`}
            >
              <span className="h-4 w-4" />
              <span
                className={clsx(
                  "whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] transition sm:text-xs",
                  active === p.id ? "bg-dawn text-ink" : "bg-night/60 text-white/80 ring-1 ring-white/10"
                )}
              >
                {p.name.split(" ").slice(-1)[0]}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div aria-live="polite" className="pointer-events-none mt-4 min-h-[3.5rem] text-center">
        {current && (
          <p className="copy inline-block rounded-2xl bg-night/70 px-5 py-3 text-sm text-white/90 ring-1 ring-white/15 backdrop-blur">
            <span className="font-semibold text-dawn">{current.name}</span> · {current.years} · {current.known}
          </p>
        )}
      </div>
    </div>
  );
}
