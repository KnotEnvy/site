"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/ui/Reveal";
import { clsx } from "@/lib/clsx";

const STATS: { value: number; suffix?: string; label: string }[] = [
  { value: 4000, suffix: "+", label: "documented cases behind the research in these vaults" },
  { value: 41, label: "first-hand testimonies, curated into three playlists" },
  { value: 50, label: "years of clinical study since doctors first wrote it down" },
  { value: 1, label: "appointment nobody cancels" },
];

/**
 * Counts from 0 to `value` when scrolled into view. Visible by default: the
 * final number is server-rendered as plain text; if JS never runs (or reduced
 * motion is on) it simply stays there.
 */
function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!inView || !el || reduced) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = `${Math.round(v).toLocaleString("en-US")}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduced, value, suffix]);

  return (
    <span ref={ref}>
      {value.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

/** A band of scroll-triggered counters: the evidence, at a glance. */
export default function EvidenceStats({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "grid grid-cols-2 gap-x-6 gap-y-12 rounded-3xl bg-ink/40 px-8 py-12 ring-1 ring-white/15 backdrop-blur-md lg:grid-cols-4",
        className
      )}
    >
      {STATS.map((stat, i) => (
        <Reveal key={stat.label} delay={i * 0.08}>
          <div className="text-center">
            <p className="font-display text-6xl text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.45)] sm:text-7xl">
              <CountUp value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mx-auto mt-3 max-w-[24ch] font-sans text-sm normal-case leading-relaxed tracking-normal text-white/85 drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">
              {stat.label}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
