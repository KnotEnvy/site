"use client";

import { Fragment } from "react";
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
 *
 * Letters are grouped into unbreakable per-word spans. Every letter is its own
 * inline-block, so without the grouping a long heading could wrap BETWEEN ANY
 * TWO LETTERS ("EXPL / AIN") - the home page's short headlines never showed
 * it, the longer section titles on the new pages did.
 */
export default function SplitText({ text, className, delay = 0, stagger = 0.03 }: Props) {
  const hydrated = useHydrated();

  if (!hydrated) return <span className={className}>{text}</span>;

  const words = text.split(" ");
  // Index of each word's first letter, so the stagger runs continuously
  // across the whole line rather than restarting per word.
  const starts = words.map((_, wi) => words.slice(0, wi).reduce((n, w) => n + w.length + 1, 0));

  return (
    <span
      className={clsx("inline-block", className)}
      aria-label={text}
      style={{ perspective: 500 }}
    >
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span aria-hidden className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, ci) => (
              <motion.span
                key={ci}
                className="inline-block"
                initial={{ opacity: 0, y: "0.5em", rotateX: -60 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-12% 0px" }}
                transition={{
                  delay: delay + (starts[wi] + ci) * stagger,
                  type: "spring",
                  stiffness: 320,
                  damping: 26,
                }}
                style={{ transformOrigin: "bottom" }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
          {wi < words.length - 1 && " "}
        </Fragment>
      ))}
    </span>
  );
}
