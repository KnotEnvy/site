"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Arms the CSS reveal system. Adding `reveal-ready` (which hides `.reveal`
 * elements) and wiring the IntersectionObservers happen together in one effect,
 * so they can never desync: if this never runs, `.reveal` content stays visible.
 *
 * Two observers, deliberately:
 *   enterIO — one-shot, adds `is-visible` as a block arrives.
 *   exitIO  — persistent and reversible, toggles `is-leaving` as a block drifts
 *             off the top. Scroll back up and it un-sets, so the page reads the
 *             same in both directions.
 *
 * MULTI-PAGE: this lives in the root layout, which persists across client-side
 * navigation. It used to scan `.reveal` exactly once on first mount - fine for
 * a one-page site, but every block on a page reached by navigation would have
 * been hidden by `reveal-ready` and never observed, i.e. invisible forever. So
 * the effect re-arms on every pathname change, and a MutationObserver adopts
 * any `.reveal` that mounts later (streamed or conditionally rendered content).
 *
 * All of it is class toggling against CSS in globals.css — no inline styles, no
 * SSR'd transforms — so this stays safe for server components and cannot
 * reintroduce the hydration mismatch that stuck a stale transform on
 * reduced-motion machines.
 */
export default function RevealController() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const els = new Set<HTMLElement>();

    // No observer support (or reduced motion handled in CSS) → just reveal all.
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => el.classList.add("is-visible"));
      return;
    }

    root.classList.add("reveal-ready");

    // Proof that the observer actually delivers. Until we've seen a real
    // callback we must assume it might be broken and rescue everything.
    let observerWorks = false;

    // A block arrives once 12% of it is in view - OR once a fifth of the
    // screen's height of it is, whichever comes first. The pixel rule is for
    // TALL blocks: the 12% ratio is area-based, so a 1,800px card on a phone
    // (the reading plan) could sit half-visible yet under 12%, and a hidden
    // block's sideways entrance offset (reveal--left: -110px) shaves its
    // intersecting WIDTH too. Both left real content invisible on screen.
    // Several thresholds so the callback fires often enough to notice.
    const MIN_VISIBLE_PX = () => window.innerHeight * 0.15;
    const enterIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observerWorks = true;
          if (entry.intersectionRatio >= 0.12 || entry.intersectionRect.height >= MIN_VISIBLE_PX()) {
            entry.target.classList.add("is-visible");
            enterIO.unobserve(entry.target);
          }
        }
      },
      { threshold: [0, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12], rootMargin: "0px 0px -8% 0px" }
    );

    // A block is leaving once its bottom edge has climbed into the top fifth of
    // the screen — by then it is mostly gone, so the drift plays on the way out
    // instead of hiding anything the visitor is still reading.
    const EXIT_LINE = 0.22;

    // Authoritative pass over every block. IntersectionObserver is used only as
    // a cheap "something moved" signal, NOT as the source of truth: it fires on
    // threshold CROSSINGS, so a block that jumps from above the viewport to
    // below it (scroll restoration on reload, an anchor jump, or scrolling back
    // to the top) never receives a callback and would keep a stale `is-leaving`
    // — i.e. stay invisible. Recomputing all of them costs one layout read per
    // block on an event that only fires on crossings, and it self-heals every
    // missed transition.
    const reconcileExits = () => {
      const line = window.innerHeight * EXIT_LINE;
      // At the very bottom of the document there is no scroll left to carry a
      // block the rest of the way out. On a short viewport the final rail can
      // land above the exit line and stick there, leaving a blank strip the
      // visitor can never clear. Never hide something still on screen when
      // there is nowhere further to go.
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const atEnd = window.scrollY >= maxScroll - 2;

      for (const el of els) {
        if (!el.isConnected) {
          els.delete(el);
          continue;
        }
        const rect = el.getBoundingClientRect();
        const leaving = rect.bottom < line && !(atEnd && rect.bottom > 0);
        if (leaving === el.classList.contains("is-leaving")) continue;
        // The stagger delay is an ENTRANCE affordance only. Left in place it
        // would also delay every exit and, worse, every re-entry: a block with
        // delay={0.5} would sit blank for half a second before its fade even
        // started, right as the visitor scrolled back onto it.
        el.style.transitionDelay = "0s";
        el.classList.toggle("is-leaving", leaving);
      }
    };

    const exitIO = new IntersectionObserver(reconcileExits, {
      threshold: 0,
      rootMargin: `-${EXIT_LINE * 100}% 0px 0px 0px`,
    });

    /** Start observing any `.reveal` not yet tracked. */
    const adopt = () => {
      document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
        if (els.has(el)) return;
        els.add(el);
        if (!el.classList.contains("is-visible")) enterIO.observe(el);
        exitIO.observe(el);
      });
    };
    adopt();

    // Late arrivals (streamed segments, conditionally rendered blocks). Batched
    // to one pass per frame however many nodes land at once.
    let pending = 0;
    const mo = new MutationObserver(() => {
      if (pending) return;
      pending = requestAnimationFrame(() => {
        pending = 0;
        adopt();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // Reconcile once up front: the browser may already have restored a deep
    // scroll position before this effect ran.
    reconcileExits();

    // Resizing moves the exit line without moving the page, so nothing would
    // cross a threshold and no observer callback would fire.
    window.addEventListener("resize", reconcileExits, { passive: true });

    // Safety net. This used to reveal EVERY element unconditionally, which
    // quietly destroyed the whole point of the system: 2.5s after load the
    // entire page below the fold was already marked visible, so nothing ever
    // animated in on scroll. Now the blanket rescue only runs when the observer
    // has provably failed to deliver a single callback; otherwise we rescue
    // just what is already on screen (which genuinely must not be stuck
    // invisible) and leave everything further down to animate on arrival.
    const fallback = window.setTimeout(() => {
      if (!observerWorks) {
        els.forEach((el) => el.classList.add("is-visible"));
        return;
      }
      for (const el of els) {
        const rect = el.getBoundingClientRect();
        // A `display: none` element (e.g. the hero collage below `lg`) reports
        // an all-zero rect, which would read as "on screen" and burn its
        // entrance before the visitor ever widens the window to see it.
        if (rect.width === 0 && rect.height === 0) continue;
        if (rect.top < window.innerHeight) {
          el.classList.add("is-visible");
          enterIO.unobserve(el);
        }
      }
    }, 2500);

    return () => {
      enterIO.disconnect();
      exitIO.disconnect();
      mo.disconnect();
      if (pending) cancelAnimationFrame(pending);
      window.removeEventListener("resize", reconcileExits);
      window.clearTimeout(fallback);
      // Hiding is conditional on this class, so dropping it on the way out
      // guarantees content can never be stranded invisible by an unmount.
      root.classList.remove("reveal-ready");
    };
  }, [pathname]);

  return null;
}
