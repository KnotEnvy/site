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

/**
 * Floor opacity for a word that has not been "read" yet. This used to be 0.14,
 * which vanished completely against the bright ember sky the Chapter 03
 * interstitial sits on (stakeholder feedback: "text low visibility"). 0.45 still
 * reads as a clear brighten on scroll while never dropping below legible.
 */
const DIM = 0.45;

function Word({
  progress,
  range,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  children: string;
}) {
  const opacity = useTransform(progress, range, [DIM, 1]);
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
      className={clsx("relative mx-auto max-w-5xl px-6 py-20 text-center sm:py-28", className)}
    >
      {/* Soft radial scrim. The interstitials float directly on the WebGL sky,
          which runs from near-white cloud to bright fire — white display type
          had nothing to sit on at either extreme. A feathered ellipse keeps the
          cinematic look (no visible panel edge) while guaranteeing contrast. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(6,8,12,0.66)_0%,rgba(6,8,12,0.42)_45%,rgba(6,8,12,0)_78%)]"
      />

      {/* Parallax only after hydration: the server cannot know the visitor's
          reduced-motion setting, so SSR-ing the transform hydration-mismatches
          (and sticks, permanently offsetting the quote) on reduced-motion
          devices. Until hydration the block simply sits at rest. */}
      <motion.div style={hydrated && !reduced ? { y } : undefined}>
        {/* The kicker carries the vault's accent colour, and Chapter 03's red
            sat on the red end of the sky — near-invisible. A dark chip (the same
            pattern as the hero badge) guarantees contrast for every accent. */}
        {kicker && (
          <p
            className={clsx(
              "inline-block rounded-full bg-ink/65 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.26em] ring-1 ring-white/15 backdrop-blur",
              accent
            )}
          >
            {kicker}
          </p>
        )}
        {/* Deliberately larger than .display-md (stakeholder asked for bigger
            chapter type) and double-shadowed: a tight shadow for edge
            definition, a wide one for separation from the sky. */}
        <blockquote className="mt-5 font-display text-[clamp(2rem,6vw,4.25rem)] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] [text-shadow:0_4px_34px_rgba(0,0,0,0.6)]">
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
          <p className="mx-auto mt-6 max-w-2xl font-sans text-base normal-case leading-relaxed tracking-normal text-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] sm:text-lg">
            {support}
          </p>
        )}
      </motion.div>
    </div>
  );
}
