"use client";

import { motion, useTransform } from "motion/react";
import { scrollProgress } from "@/lib/scroll";

/**
 * A fixed Heaven→Hell progress rail. The marker tracks scroll depth and shifts
 * colour through the descent palette. Purely a scroll readout (no autonomous
 * motion), so it stays reduced-motion friendly. Hidden on small screens.
 */
export default function DescentRail() {
  const top = useTransform(scrollProgress, [0, 1], ["0%", "100%"]);
  const color = useTransform(
    scrollProgress,
    [0, 0.5, 0.75, 1],
    ["#cfeaff", "#b87fbf", "#ff7a2a", "#ff2a0a"]
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-5 top-1/2 z-40 hidden h-52 -translate-y-1/2 md:block"
    >
      <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
        Heaven
      </span>
      <div className="relative h-full w-px bg-white/25">
        <motion.span
          style={{ top, backgroundColor: color }}
          className="absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_14px_3px_rgba(255,255,255,0.45)]"
        />
      </div>
      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
        Hell
      </span>
    </div>
  );
}
