"use client";

import { useEffect, useState } from "react";
import { clsx } from "@/lib/clsx";

/* -------------------------------------------------------------------------- */
/*  "Be still" - a one-minute breath prayer on Psalm 46:10.                    */
/*                                                                             */
/*  The Christian practice of breath prayer: a short line of Scripture        */
/*  prayed in rhythm with slow breathing. In for four ("Be still"), hold for  */
/*  two ("and know"), out for six ("that I am God"), five times. The orb      */
/*  swells and settles with the breath.                                        */
/*                                                                             */
/*  Nothing moves until the visitor presses Begin. Under reduced motion the   */
/*  orb brightens and dims instead of growing (see .breath-orb in globals).   */
/*  Each phase is announced through a polite live region for screen readers. */
/* -------------------------------------------------------------------------- */

const PHASES = [
  { key: "in", words: "Be still", cue: "Breathe in", secs: 4 },
  { key: "hold", words: "and know", cue: "Hold", secs: 2 },
  { key: "out", words: "that I am God", cue: "Breathe out", secs: 6 },
] as const;

const CYCLES = 5;

export default function BreathPrayer() {
  // step -1 = idle, 0..(CYCLES*3 - 1) = running, CYCLES*3 = done
  const [step, setStep] = useState(-1);
  const running = step >= 0 && step < CYCLES * 3;
  const done = step === CYCLES * 3;
  const phase = running ? PHASES[step % 3] : null;
  const cycle = running ? Math.floor(step / 3) + 1 : 0;

  useEffect(() => {
    if (!running || !phase) return;
    const t = window.setTimeout(() => setStep((s) => s + 1), phase.secs * 1000);
    return () => window.clearTimeout(t);
  }, [running, phase, step]);

  const expanded = phase?.key === "in" || phase?.key === "hold";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-night/70 p-6 text-center ring-1 ring-white/12 backdrop-blur-md sm:p-10">
      <p className="text-xs font-bold uppercase tracking-[0.26em] text-dawn">A breath prayer · Psalm 46:10</p>

      <div className="relative mx-auto mt-8 grid h-64 w-64 place-items-center sm:h-80 sm:w-80">
        <div
          aria-hidden="true"
          className={clsx("breath-orb absolute inset-0 rounded-full", expanded && "is-full")}
          style={{ "--dur": `${phase?.secs ?? 1.2}s` } as React.CSSProperties}
        />
        <div className="relative px-6">
          <p className="verse text-2xl font-semibold text-ink sm:text-3xl" aria-hidden="true">
            {phase ? phase.words : done ? "Amen." : "Be still"}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-ink/60" aria-hidden="true">
            {phase ? `${phase.cue} · ${cycle} of ${CYCLES}` : done ? "Notice what is different" : "One minute"}
          </p>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {phase ? `${phase.cue}: ${phase.words}. Breath ${cycle} of ${CYCLES}.` : done ? "Finished. Amen." : ""}
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {!running ? (
          <button
            type="button"
            onClick={() => setStep(0)}
            className="rounded-full bg-dawn px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-ink transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {done ? "Pray it again" : "Begin"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep(-1)}
            className="rounded-full bg-white/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white ring-1 ring-white/25 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Stop
          </button>
        )}
      </div>

      <p className="copy mx-auto mt-6 max-w-md text-sm text-white/65">
        In for four: <em>Be still.</em> Hold for two: <em>and know.</em> Out for six:{" "}
        <em>that I am God.</em> Five slow breaths. Christians have prayed this way
        for centuries.
      </p>
    </div>
  );
}
