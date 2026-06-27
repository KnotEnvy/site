"use client";

import { motion } from "motion/react";
import { useSyncExternalStore } from "react";
import { clsx } from "@/lib/clsx";

type Props = {
  text: string;
  className?: string;
  /** Seconds before the first letter starts. */
  delay?: number;
  /** Seconds between letters. */
  stagger?: number;
};

const emptySubscribe = () => () => {};

/** True only after client hydration — SSR-safe, no setState-in-effect. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Per-letter headline animation with a spring stagger.
 *
 * SSR-safe & visible-by-default: renders plain text on the server and until
 * hydration, then swaps to animated letters. If JS never runs, the text is
 * simply there — no opacity:0 trap (see criticalLessons in handoff.json).
 * Reduced motion is handled by the app-wide <MotionConfig reducedMotion="user">.
 */
export default function SplitText({ text, className, delay = 0, stagger = 0.03 }: Props) {
  const hydrated = useHydrated();

  if (!hydrated) return <span className={className}>{text}</span>;

  return (
    <span
      className={clsx("inline-block", className)}
      aria-label={text}
      style={{ perspective: 500 }}
    >
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          initial={{ opacity: 0, y: "0.5em", rotateX: -60 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-12% 0px" }}
          transition={{
            delay: delay + i * stagger,
            type: "spring",
            stiffness: 320,
            damping: 26,
          }}
          style={{ transformOrigin: "bottom" }}
        >
          {/\s/.test(ch) ? " " : ch}
        </motion.span>
      ))}
    </span>
  );
}
