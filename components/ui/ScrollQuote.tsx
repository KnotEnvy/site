"use client";

import { Fragment, useRef, useSyncExternalStore } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { clsx } from "@/lib/clsx";

const emptySubscribe = () => () => {};

/** True only after client hydration — SSR-safe, no setState-in-effect. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function Word({
  progress,
  range,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  children: string;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}

/**
 * A chapter interstitial: a big display-type statement that brightens word by
 * word as it scrolls through the viewport, with a gentle parallax rise.
 *
 * SSR-safe & visible-by-default: plain text until hydration (no opacity trap,
 * see criticalLessons in handoff.json). Under reduced motion the parallax is
 * dropped; the word reveal is opacity-only and scroll-linked, not autonomous.
 */
export default function ScrollQuote({
  kicker,
  text,
  support,
  accent = "text-white",
  className,
}: {
  kicker?: string;
  text: string;
  support?: string;
  /** Text colour class for the kicker line, e.g. "text-heaven". */
  accent?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.92", "start 0.38"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [48, 0]);

  const words = text.split(" ");
  // Each word owns a staggered slice of the scroll range; the final word
  // finishes just before the block reaches its resting position.
  const step = 0.75 / words.length;

  return (
    <div
      ref={ref}
      className={clsx("mx-auto max-w-5xl px-6 py-20 text-center sm:py-28", className)}
    >
      {/* Parallax only after hydration: the server cannot know the visitor's
          reduced-motion setting, so SSR-ing the transform hydration-mismatches
          (and sticks, permanently offsetting the quote) on reduced-motion
          devices. Until hydration the block simply sits at rest. */}
      <motion.div style={hydrated && !reduced ? { y } : undefined}>
        {kicker && (
          <p className={clsx("text-xs font-bold uppercase tracking-[0.26em]", accent)}>
            {kicker}
          </p>
        )}
        <blockquote className="display-md mt-5 font-display text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.45)]">
          {hydrated ? (
            <>
              <span className="sr-only">{text}</span>
              <span aria-hidden="true">
                {words.map((word, i) => (
                  <Fragment key={`${word}-${i}`}>
                    <Word
                      progress={scrollYProgress}
                      range={[i * step, i * step + 0.25]}
                    >
                      {word}
                    </Word>{" "}
                  </Fragment>
                ))}
              </span>
            </>
          ) : (
            text
          )}
        </blockquote>
        {support && (
          <p className="mx-auto mt-6 max-w-2xl font-sans text-base normal-case leading-relaxed tracking-normal text-white/80">
            {support}
          </p>
        )}
      </motion.div>
    </div>
  );
}
