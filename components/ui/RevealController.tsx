"use client";

import { useEffect } from "react";

/**
 * Arms the CSS reveal system. Adding `reveal-ready` (which hides `.reveal`
 * elements) and wiring the IntersectionObserver happen together in one effect,
 * so they can never desync: if this never runs, `.reveal` content stays visible.
 */
export default function RevealController() {
  useEffect(() => {
    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    // No observer support (or reduced motion handled in CSS) → just reveal all.
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    root.classList.add("reveal-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => io.observe(el));

    // Safety net: if anything prevents observation, reveal everything after 2.5s.
    const fallback = window.setTimeout(() => {
      els.forEach((el) => el.classList.add("is-visible"));
    }, 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return null;
}
