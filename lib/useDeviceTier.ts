"use client";

import { useState } from "react";

export type Tier = "low" | "mid" | "high";

export interface CloudQuality {
  tier: Tier;
  /** Device pixel ratio cap for the WebGL canvas. */
  dpr: [number, number];
  /** Particle segments per cloud puff. */
  segments: number;
  /** Shared instance budget across all clouds. */
  limit: number;
  /** Whether antialiasing is worth the cost. */
  antialias: boolean;
  /** Run the postprocessing stack (Bloom/Vignette)? Off on low-end. */
  effects: boolean;
  /** MSAA sample count for the EffectComposer (0 = none). */
  multisampling: number;
  /** Number of rising ember particles in the lower descent. */
  embers: number;
}

const QUALITY: Record<Tier, CloudQuality> = {
  low: {
    tier: "low",
    dpr: [1, 1],
    segments: 16,
    limit: 120,
    antialias: false,
    effects: false,
    multisampling: 0,
    embers: 0,
  },
  mid: {
    tier: "mid",
    dpr: [1, 1.5],
    segments: 30,
    limit: 200,
    antialias: true,
    effects: true,
    multisampling: 0,
    embers: 70,
  },
  high: {
    tier: "high",
    dpr: [1, 1.75],
    segments: 44,
    limit: 300,
    antialias: true,
    effects: true,
    multisampling: 2,
    embers: 140,
  },
};

function detectQuality(): CloudQuality {
  if (typeof navigator === "undefined") return QUALITY.mid;

  const cores = navigator.hardwareConcurrency ?? 4;
  // deviceMemory is non-standard but widely supported on Chromium.
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 768;

  let tier: Tier;
  if (mem <= 2 || cores <= 2) tier = "low";
  else if (coarse || small || mem <= 4 || cores <= 4) tier = "mid";
  else tier = "high";

  return QUALITY[tier];
}

/**
 * Picks a cloud quality preset from coarse device heuristics. Keeps the same
 * WebGL engine on every device (per the brief) while scaling resolution and
 * particle counts so budget phones don't drop frames.
 *
 * The cloud canvas is client-only (`ssr: false`), so we can detect once in a
 * lazy initializer — no effect, no cascading render, no hydration mismatch.
 */
export function useDeviceTier(): CloudQuality {
  const [quality] = useState<CloudQuality>(detectQuality);
  return quality;
}
