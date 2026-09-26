"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMotionValueEvent } from "motion/react";
import { scrollProgress } from "@/lib/scroll";
import { journeyForPath } from "@/lib/pages";
import { JOURNEYS, type JourneyId } from "@/lib/journeys";

/** Marker colour stops per journey, top -> bottom of the page. */
const RAIL_COLORS: Record<JourneyId, [string, string, string, string]> = {
  // The original DescentRail colours, unchanged.
  descent: ["#cfeaff", "#b87fbf", "#ff7a2a", "#ff2a0a"],
  ascent: ["#5f6bc2", "#8fa0ff", "#ffb070", "#fff1c0"],
  cosmos: ["#9cc8f0", "#4e64ad", "#aab4ff", "#ffd6a0"],
  sanctuary: ["#ffe7c4", "#ffd2a4", "#ffc070", "#ff9a50"],
  passage: ["#cfe8ff", "#5a7090", "#9ab0ff", "#fff0c0"],
  dawn: ["#ffb080", "#ffd080", "#ffe8c8", "#fff1c0"],
};

function mixHex(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) =>
    Math.round(((pa >> shift) & 255) + (((pb >> shift) & 255) - ((pa >> shift) & 255)) * t);
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}

function colorAt(stops: string[], p: number) {
  const x = Math.min(Math.max(p, 0), 1) * (stops.length - 1);
  const i = Math.min(Math.floor(x), stops.length - 2);
  return mixHex(stops[i], stops[i + 1], x - i);
}

/**
 * A fixed scroll-progress rail. The marker tracks scroll depth and shifts
 * colour through the current page's journey; the labels name its two ends
 * (Heaven / Hell on the Descent, Darkness / Light on The Ascent, ...).
 * Purely a scroll readout (no autonomous motion), so it stays reduced-motion
 * friendly. Hidden on small screens.
 *
 * Written straight to the DOM from the motion value rather than through React
 * state: it updates on every scroll frame.
 */
export default function JourneyRail() {
  const journey = journeyForPath(usePathname() ?? "/");
  const [topLabel, bottomLabel] = JOURNEYS[journey].rail;
  const marker = useRef<HTMLSpanElement>(null);

  const paint = (p: number) => {
    const el = marker.current;
    if (!el) return;
    el.style.top = `${Math.min(Math.max(p, 0), 1) * 100}%`;
    el.style.backgroundColor = colorAt(RAIL_COLORS[journey], p);
  };

  useMotionValueEvent(scrollProgress, "change", paint);
  // Repaint immediately when the journey (route) changes.
  useEffect(() => paint(scrollProgress.get()));

  return (
    <div
      aria-hidden
      // right-8 (not right-5): the labels centre on the 1px line, and a word
      // like "Darkness" is wider than the old 20px gutter - it was clipping.
      className="pointer-events-none fixed right-8 top-1/2 z-40 hidden h-52 -translate-y-1/2 md:block"
    >
      <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em] text-white/75 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
        {topLabel}
      </span>
      <div className="relative h-full w-px bg-white/25">
        <span
          ref={marker}
          className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_14px_3px_rgba(255,255,255,0.45)]"
          style={{ backgroundColor: RAIL_COLORS[journey][0] }}
        />
      </div>
      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em] text-white/75 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
        {bottomLabel}
      </span>
    </div>
  );
}
