"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { MotionConfig, useReducedMotion } from "motion/react";
import { scrollProgress } from "@/lib/scroll";

/** Mirrors Lenis' whole-page progress into the shared motion value each scroll. */
function ScrollBridge() {
  useLenis((lenis) => {
    scrollProgress.set(Number.isFinite(lenis.progress) ? lenis.progress : 0);
  });
  return null;
}

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();

  return (
    <ReactLenis
      root
      options={{
        // Under reduced-motion, collapse smoothing to an instant, native feel.
        lerp: reduced ? 1 : 0.1,
        duration: reduced ? 0 : 1.15,
        smoothWheel: !reduced,
        syncTouch: false,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
      }}
    >
      <ScrollBridge />
      {/* `reducedMotion="user"` strips transform animations for users who ask. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ReactLenis>
  );
}
