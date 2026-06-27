import { motionValue } from "motion/react";

/**
 * Shared scroll + pointer signals that bridge the DOM/Lenis world into the
 * WebGL render loop without forcing React re-renders.
 *
 * - `scrollProgress` is whole-page progress in the range [0, 1].
 * - `pointer` is the cursor position normalised to [-1, 1] on each axis.
 *
 * The cloud scene reads these every frame via `.get()` inside `useFrame`.
 */
export const scrollProgress = motionValue(0);

export const pointer = { x: 0, y: 0 };

/** A click/tap "shockwave" through the sky, in normalised device coords (y up). */
export type Ripple = { x: number; y: number; start: number };

/** Pending ripples; the WebGL scene drains this queue into a burst pool. */
export const ripples: Ripple[] = [];

/** Queue a ripple at NDC (x, y in -1..1, y up). Called on pointer-down. */
export function addRipple(x: number, y: number): void {
  ripples.push({ x, y, start: performance.now() });
  if (ripples.length > 12) ripples.shift();
}
