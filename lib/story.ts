/**
 * Bridge between The Ascent's scroll-driven DOM chapters and the particle
 * "spirit" that the WebGL sky draws for them.
 *
 * Like `pointer` in lib/scroll.ts this is a plain mutable object: the page's
 * StoryDriver writes it on scroll, SkyCanvas reads it inside useFrame. No React
 * state, no re-renders, nothing to hydrate.
 */

/** The shapes the particles can take, in story order. */
export const STORY_SHAPES = [
  "scatter", // 0 - lost: drifting, disconnected dust
  "galaxy", // 1 - the heavens declare
  "helix", // 2 - fearfully and wonderfully made
  "star", // 3 - known by name: everything converges on one point of light
  "heart", // 4 - a heart of stone, broken open by light
  "butterfly", // 5 - a new creation
  "radiance", // 6 - the cross, radiant: infinitely more
] as const;

export const story = {
  /** Continuous shape index: 2.5 = halfway from helix to star. */
  shape: 0,
  /** 0..1 - light spreading through the stone heart (chapter "Broken Open"). */
  ignite: 0,
  /** 0..1 - the final release: the figure dissolves into rising light. */
  rise: 0,
  /** 0..1 - overall presence; the driver fades the spirit in at the start. */
  presence: 0,
};

/** Reset between visits so a return to the page starts in the dark again. */
export function resetStory() {
  story.shape = 0;
  story.ignite = 0;
  story.rise = 0;
  story.presence = 0;
}
