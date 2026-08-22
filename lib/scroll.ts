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

// NOTE: there was a click/tap "shockwave" ripple queue here (Ripple type,
// `ripples` array, addRipple()). Removed 2026-08-21 at the stakeholder's
// direction — the expanding rings distracted from the content rather than
// adding to the descent. The cursor-following cloud light was KEPT.
