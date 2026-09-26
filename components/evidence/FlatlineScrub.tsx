"use client";

import { useRef } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useHydrated } from "@/lib/useHydrated";
import { clsx } from "@/lib/clsx";
import { hashf } from "@/lib/prng";

/* -------------------------------------------------------------------------- */
/*  The first minutes of clinical death, scrubbed by scroll.                  */
/*                                                                            */
/*  A pinned hospital monitor. Scrolling runs its clock: the heartbeat         */
/*  flattens into asystole, cortical EEG fades to a flat line within about 10  */
/*  to 20 seconds - and then, against that silence, the experiences patients   */
/*  report arrive one by one.                                                  */
/*                                                                            */
/*  Everything visual is written straight to the DOM from the scroll value     */
/*  (no React re-render per frame). The traces scroll with a CSS animation     */
/*  that the global reduced-motion rule stills; the scrub itself is driven by  */
/*  the visitor's own scrolling. All narration is server-rendered text.        */
/* -------------------------------------------------------------------------- */

const REPORTS = [
  { at: 0.36, label: "Floating above the body", pct: "24%", body: "Watching the team work, from somewhere near the ceiling." },
  { at: 0.45, label: "A tunnel", pct: "31%", body: "Drawn through darkness toward a point of light." },
  { at: 0.54, label: "The light", pct: "23%", body: "Brighter than the sun, yet it doesn't hurt. Experienced as a presence." },
  { at: 0.63, label: "Loved ones", pct: "32%", body: "Relatives who had already died, waiting to meet them." },
  { at: 0.72, label: "A life review", pct: "13%", body: "Their whole life at once, felt from the other side too." },
  { at: 0.81, label: "A border", pct: "8%", body: "A line they understood they could not cross and come back." },
  { at: 0.9, label: "Sent back", pct: "", body: "Often reluctantly. Almost always changed." },
];

/** A PQRST heartbeat, tiled: 6 beats across 1200 units, drawn twice for a seamless loop. */
function ecgPath() {
  const beat = (x: number) =>
    `L${x} 50 L${x + 40} 50 Q${x + 50} 42 ${x + 60} 50 L${x + 78} 50 L${x + 84} 58 L${x + 92} 8 L${x + 100} 70 L${x + 108} 50 L${x + 128} 50 Q${x + 145} 36 ${x + 162} 50 L${x + 200} 50`;
  let d = "M0 50 ";
  for (let i = 0; i < 12; i++) d += beat(i * 200) + " ";
  return d;
}

/** Irregular EEG-like squiggle, tiled twice. */
function eegPath() {
  let d = "M0 30 ";
  for (let i = 1; i <= 240; i++) {
    const x = i * 10;
    const y = 30 + (hashf(i % 120) - 0.5) * 34 * (0.6 + 0.4 * Math.sin(i * 0.37));
    d += `L${x} ${y.toFixed(1)} `;
  }
  return d;
}

const ECG = ecgPath();
const EEG = eegPath();

const ss = (x: number, a: number, b: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/** Seconds on the clock for a scroll position: 0-20 s over the first 30%. */
function secondsAt(p: number) {
  return p < 0.3 ? (p / 0.3) * 20 : 20 + ((p - 0.3) / 0.7) * 220;
}

function Report({
  progress,
  at,
  label,
  pct,
  body,
}: {
  progress: MotionValue<number>;
  at: number;
  label: string;
  pct: string;
  body: string;
}) {
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  const opacity = useTransform(progress, [at, at + 0.05], [0.12, 1]);
  const x = useTransform(progress, [at, at + 0.06], [28, 0]);
  const glow = useTransform(progress, [at, at + 0.04, at + 0.12], [0, 1, 0.35]);
  const shadow = useTransform(glow, (g) => `0 0 ${Math.round(30 * g)}px rgba(255, 240, 200, ${0.5 * g})`);
  return (
    <motion.li
      style={!hydrated ? undefined : reduced ? { opacity } : { opacity, x, boxShadow: shadow }}
      className="flex items-start gap-4 rounded-2xl bg-night/60 p-4 ring-1 ring-white/12 backdrop-blur-md"
    >
      <span className="mt-0.5 w-12 shrink-0 font-display text-2xl leading-none text-dawn">{pct || "↩"}</span>
      <span className="min-w-0">
        <span className="block font-semibold text-white">{label}</span>
        <span className="copy block text-sm text-white/70">{body}</span>
      </span>
    </motion.li>
  );
}

export default function FlatlineScrub() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const clock = useRef<HTMLSpanElement>(null);
  const ecg = useRef<SVGGElement>(null);
  const eeg = useRef<SVGGElement>(null);
  const ecgLabel = useRef<HTMLSpanElement>(null);
  const eegLabel = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const monitor = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const ecgAmp = 1 - ss(p, 0.05, 0.14);
    const eegAmp = 1 - ss(p, 0.12, 0.3);
    const s = secondsAt(p);
    if (clock.current) {
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      clock.current.textContent = `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    }
    if (ecg.current) ecg.current.style.transform = `scaleY(${Math.max(ecgAmp, 0.02)})`;
    if (eeg.current) eeg.current.style.transform = `scaleY(${Math.max(eegAmp, 0.02)})`;
    if (ecgLabel.current) {
      ecgLabel.current.textContent =
        p < 0.05 ? "Heart · normal rhythm" : p < 0.14 ? "Heart · cardiac arrest" : "Heart · asystole, no heartbeat";
    }
    if (eegLabel.current) {
      eegLabel.current.textContent =
        p < 0.12 ? "Brain · cortical EEG active" : p < 0.3 ? "Brain · EEG fading" : "Brain · EEG flat";
    }
    if (bar.current) bar.current.style.transform = `scaleX(${Math.min(Math.max(p, 0), 1)})`;
    monitor.current?.classList.toggle("is-flat", ecgAmp < 0.05);
  });

  return (
    <section ref={ref} aria-labelledby="flatline-title" className="relative h-[360vh]">
      <div className="sticky top-0 flex min-h-[100svh] items-center overflow-hidden py-24">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="inline-block rounded-full bg-ink/60 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-[#7fe9ff] ring-1 ring-white/15 backdrop-blur">
              Chapter 01 · The first minutes
            </p>
            <h2 id="flatline-title" className="display-md mt-4 text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
              The heart stops. Keep scrolling.
            </h2>

            {/* The monitor */}
            <div
              ref={monitor}
              className="monitor mt-6 rounded-2xl bg-[#04070c]/85 p-5 ring-1 ring-[#7fe9ff]/25 backdrop-blur-md sm:p-6"
              role="img"
              aria-label="A patient monitor: the heart trace flattens to asystole, then brain activity fades to a flat line within about 20 seconds."
            >
              <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.2em] text-[#7fe9ff]/80">
                <span>Clinical death · elapsed</span>
                <span ref={clock} className="text-lg tracking-[0.1em] text-white tabular-nums">
                  00:00
                </span>
              </div>

              <div className="mt-4">
                <span ref={ecgLabel} className="monitor-label font-mono text-[11px] uppercase tracking-[0.18em]">
                  Heart · normal rhythm
                </span>
                <svg viewBox="0 0 1200 100" preserveAspectRatio="none" className="mt-1 h-20 w-full overflow-hidden" aria-hidden="true">
                  <g ref={ecg} style={{ transformOrigin: "50% 50%", transformBox: "fill-box" }}>
                    <path d={ECG} className="trace trace-ecg" fill="none" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                  </g>
                </svg>
              </div>

              <div className="mt-3">
                <span ref={eegLabel} className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#b7a8ff]">
                  Brain · cortical EEG active
                </span>
                <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="mt-1 h-12 w-full overflow-hidden" aria-hidden="true">
                  <g ref={eeg} style={{ transformOrigin: "50% 50%", transformBox: "fill-box" }}>
                    <path d={EEG} className="trace trace-eeg" fill="none" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                  </g>
                </svg>
              </div>

              <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                <span ref={bar} className="block h-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-[#7fe9ff] via-[#b7a8ff] to-dawn" />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
                <span>0 s · arrest</span>
                <span>~10–20 s · EEG flat</span>
                <span>minutes · CPR</span>
              </div>
            </div>

            <p className="copy mt-5 max-w-xl rounded-2xl bg-night/55 p-4 text-sm text-white/80 ring-1 ring-white/10 backdrop-blur-md">
              In cardiac arrest, measurable cortical activity typically fades within
              about 10 to 20 seconds. Nobody knows exactly when during an arrest
              these experiences happen, which is why researchers now hide images
              above resuscitation beds that only someone looking down from the
              ceiling could see.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70 drop-shadow">
              And yet, what patients report
            </p>
            <ol className="mt-4 space-y-3">
              {REPORTS.map((r) => (
                <Report key={r.label} progress={scrollYProgress} {...r} />
              ))}
            </ol>
            <p className={clsx("mt-4 text-xs text-white/55")}>
              Percentages: share of the 62 patients with an NDE in the Dutch
              prospective study (van Lommel et al., <cite>The Lancet</cite>, 2001).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
