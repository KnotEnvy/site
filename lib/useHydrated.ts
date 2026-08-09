"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True only after client hydration — SSR-safe, and no setState-in-effect (which
 * the React Compiler eslint rules ban).
 *
 * Gate every motion style that depends on client-only state on this AND on
 * `useReducedMotion()`. The server cannot know a visitor's motion preference,
 * so SSR-ing such a transform hydration-mismatches — and React keeps the stale
 * server attribute, permanently offsetting the element on exactly the machines
 * that asked for less motion.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
