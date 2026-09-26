"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
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

/** Height of the fixed header; anchor jumps land below it. */
const HEADER_OFFSET = -80;

/**
 * Keeps Lenis honest across client-side navigation.
 *
 * Lenis wraps the document once, in the root layout, and knows nothing about
 * routes. Without this, a navigation could leave it holding the previous
 * page's scroll target (so the new page animates in from mid-scroll), and
 * `scrollProgress` - which drives the whole WebGL sky - would keep the old
 * page's value until the visitor happened to scroll. So on every pathname
 * change we: jump to the top (or to the #hash a link asked for), re-measure
 * the new document, and re-publish progress.
 *
 * Back/forward navigations are left alone: the browser restores the reader's
 * position there, and yanking them to the top would lose their place.
 */
function RouteSync() {
  const lenis = useLenis();
  const pathname = usePathname();
  const popped = useRef(false);
  const first = useRef(true);

  useEffect(() => {
    const onPop = () => {
      popped.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (!lenis) return;
    // The first load is the browser's business (native anchor + restoration).
    if (first.current) {
      first.current = false;
      return;
    }
    const wasPop = popped.current;
    popped.current = false;

    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        lenis.resize();
        const hash = window.location.hash;
        if (!wasPop) {
          const target = hash ? document.querySelector(hash) : null;
          if (target) {
            lenis.scrollTo(target as HTMLElement, { offset: HEADER_OFFSET, immediate: true, force: true });
          } else {
            lenis.scrollTo(0, { immediate: true, force: true });
          }
        }
        scrollProgress.set(Number.isFinite(lenis.progress) ? lenis.progress : 0);
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname, lenis]);

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
      <RouteSync />
      {/* `reducedMotion="user"` strips transform animations for users who ask. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ReactLenis>
  );
}
