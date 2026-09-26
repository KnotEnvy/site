"use client";

import { useId, useMemo, useState } from "react";
import { DIALS } from "@/lib/content/minds";
import { clsx } from "@/lib/clsx";
import { hashf } from "@/lib/prng";

/* -------------------------------------------------------------------------- */
/*  Tune the universe.                                                         */
/*                                                                             */
/*  Three real physical constants as dials. Inside a narrow band the little    */
/*  universe on the right shines, forms a star and a blue planet; nudge any   */
/*  dial out and it fails in the way physics says it would - collapsing,      */
/*  scattering, going dark, or burning out. It is an ILLUSTRATION, labelled   */
/*  as one: the real life-permitting windows are far narrower than any slider */
/*  could show.                                                                */
/*                                                                             */
/*  Plain range inputs: keyboard and screen-reader friendly by default, with  */
/*  aria-valuetext that says what the current setting does.                   */
/* -------------------------------------------------------------------------- */

type DialId = (typeof DIALS)[number]["id"];

const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: (hashf(i + 1) * 2 - 1) * 0.9,
  y: (hashf(i + 2) * 2 - 1) * 0.8,
  s: 0.6 + hashf(i + 3) * 1.6,
  tw: hashf(i + 4),
}));

function state(v: number, window: number) {
  if (v < -window) return "low" as const;
  if (v > window) return "high" as const;
  return "ok" as const;
}

export default function FineTuning() {
  const uid = useId();
  const [vals, setVals] = useState<Record<DialId, number>>({ gravity: 0.45, strong: -0.35, lambda: 0.6 });

  const states = useMemo(
    () =>
      Object.fromEntries(DIALS.map((d) => [d.id, state(vals[d.id], d.window)])) as Record<DialId, "low" | "high" | "ok">,
    [vals]
  );
  const allOk = DIALS.every((d) => states[d.id] === "ok");

  // How the little universe should look for the current settings.
  const l = vals.lambda;
  const spread = states.lambda === "high" ? 1 + (l - 0.05) * 2.2 : states.lambda === "low" ? Math.max(0.12, 1 + (l + 0.05) * 1.2) : 1;
  const starsLit = states.gravity !== "low";
  const starsHot = states.gravity === "high" || states.strong === "high";
  const planet = allOk;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
      <div className="space-y-6">
        {DIALS.map((d) => {
          const v = vals[d.id];
          const s = states[d.id];
          const pct = ((v + 1) / 2) * 100;
          const id = `${uid}-${d.id}`;
          return (
            <div key={d.id} className="rounded-2xl bg-night/60 p-5 ring-1 ring-white/12 backdrop-blur-md">
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={id} className="font-semibold text-white">
                  {d.label}
                </label>
                <span
                  className={clsx(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em]",
                    s === "ok" ? "bg-emerald-400/20 text-emerald-300" : "bg-red-400/20 text-red-300"
                  )}
                >
                  {s === "ok" ? "Life possible" : "No life"}
                </span>
              </div>
              <p className="copy mt-1 text-sm text-white/60">{d.detail}</p>

              <div className="relative mt-4">
                {/* The life-permitting band */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-emerald-400/35 ring-1 ring-emerald-300/50"
                  style={{ left: `${50 - d.window * 50}%`, width: `${d.window * 100}%` }}
                />
                <input
                  id={id}
                  type="range"
                  min={-1}
                  max={1}
                  step={0.01}
                  value={v}
                  onChange={(e) => setVals((prev) => ({ ...prev, [d.id]: Number(e.target.value) }))}
                  aria-valuetext={s === "ok" ? d.ok : s === "low" ? d.low : d.high}
                  className="tuning-range relative w-full"
                  style={{ "--pct": `${pct}%` } as React.CSSProperties}
                />
              </div>
              <p aria-live="polite" className={clsx("copy mt-3 text-sm", s === "ok" ? "text-emerald-200/90" : "text-red-200/90")}>
                {s === "ok" ? d.ok : s === "low" ? d.low : d.high}
              </p>
            </div>
          );
        })}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setVals({ gravity: 0, strong: 0, lambda: 0 })}
            className="rounded-full bg-dawn px-5 py-2.5 text-sm font-bold uppercase tracking-[0.14em] text-ink transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Set our universe
          </button>
          <button
            type="button"
            onClick={() => {
              // What a universe with random constants would get: almost
              // always, no life. (Event handler, not render - Math.random is fine.)
              const r = () => Math.round((Math.random() * 2 - 1) * 100) / 100;
              setVals({ gravity: r(), strong: r(), lambda: r() });
            }}
            className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold uppercase tracking-[0.14em] text-white ring-1 ring-white/25 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Roll random constants
          </button>
        </div>
      </div>

      <figure className="relative">
        <div
          className={clsx(
            "relative aspect-square overflow-hidden rounded-3xl ring-1 transition-colors duration-700",
            allOk ? "bg-[#070b24] ring-dawn/40" : "bg-[#05060d] ring-white/10"
          )}
        >
          <svg viewBox="-1 -1 2 2" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <radialGradient id={`${uid}-sun`}>
                <stop offset="0%" stopColor="#fffaf0" />
                <stop offset="40%" stopColor={starsHot ? "#ff7a5a" : "#ffd98a"} />
                <stop offset="100%" stopColor={starsHot ? "#ff3a1a" : "#ffb347"} stopOpacity="0" />
              </radialGradient>
              <radialGradient id={`${uid}-gas`}>
                <stop offset="0%" stopColor="#6f7bd6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#6f7bd6" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Background matter */}
            {STARS.map((s, i) => {
              const x = s.x * spread;
              const y = s.y * spread;
              if (!starsLit) {
                return <circle key={i} cx={x} cy={y} r={0.09 * s.s} fill={`url(#${uid}-gas)`} style={{ transition: "all 0.8s" }} />;
              }
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={(starsHot ? 0.006 : 0.008) * s.s}
                  fill={starsHot ? "#ffb0a0" : "#f4f1ff"}
                  opacity={starsHot ? 0.35 + s.tw * 0.3 : 0.5 + s.tw * 0.5}
                  style={{ transition: "all 0.8s" }}
                />
              );
            })}

            {/* The central star */}
            {starsLit && states.lambda !== "high" && (
              <circle cx={0} cy={0} r={starsHot ? 0.12 : 0.2} fill={`url(#${uid}-sun)`} style={{ transition: "all 0.8s" }} />
            )}

            {/* A blue world, only in a universe that can hold one */}
            {planet && (
              <g className="orbit">
                <circle cx={0} cy={0} r={0.46} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={0.004} />
                <circle cx={0.46} cy={0} r={0.035} fill="#4da3ff" />
                <circle cx={0.455} cy={-0.01} r={0.012} fill="#9be0a0" opacity={0.9} />
              </g>
            )}
          </svg>

          <figcaption className="absolute inset-x-4 bottom-4 rounded-xl bg-black/50 px-4 py-3 text-center backdrop-blur">
            <p className={clsx("font-display text-2xl", allOk ? "text-dawn" : "text-white/80")}>
              {allOk ? "A universe that can hold life" : "A universe without life"}
            </p>
          </figcaption>
        </div>
        <p className="copy mt-3 text-xs text-white/55">
          An illustration, not a simulation. The real life-permitting windows are far
          narrower than any slider can show. Physicists debate the explanation (a
          multiverse, a deeper law, or design), but the fine-tuning itself is widely
          acknowledged. See Martin Rees, <cite>Just Six Numbers</cite> (1999), and Geraint Lewis
          &amp; Luke Barnes, <cite>A Fortunate Universe</cite> (2016).
        </p>
      </figure>
    </div>
  );
}
