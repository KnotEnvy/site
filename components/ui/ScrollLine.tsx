"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { useHydrated } from "@/lib/useHydrated";
import { clsx } from "@/lib/clsx";

/**
 * A vertical line that draws itself down its container as you scroll through
 * it - the spine of a timeline. Before hydration (and with no JS) it simply
 * renders full length; afterwards it grows with the reader's progress.
 */
export default function ScrollLine({ className, color = "bg-dawn" }: { className?: string; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <div ref={ref} aria-hidden="true" className={clsx("pointer-events-none absolute w-px bg-white/15", className)}>
      <motion.div
        style={hydrated ? { scaleY } : undefined}
        className={clsx("h-full w-full origin-top shadow-[0_0_12px_2px_rgba(255,207,122,0.5)]", color)}
      />
    </div>
  );
}
