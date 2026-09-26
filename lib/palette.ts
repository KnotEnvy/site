import * as THREE from "three";

/**
 * Sky palettes.
 *
 * A single scalar — whole-page scroll progress in [0, 1] — drives the entire
 * atmosphere. Every WebGL surface (sky dome, fog, lights, sun, embers, stars)
 * reads its colour and intensity from one sampled `SkyState`, so the world
 * stays in chromatic sync as the camera moves.
 *
 * Each page has its own JOURNEY (lib/journeys.ts) - its own list of stops. The
 * home page is the original Descent: Heaven (top) into ember-red dread
 * (bottom). Its stops below are unchanged from the pre-journey version.
 *
 * Sampling is allocation-free: `sampleSky` mutates a reused `SkyState` so it can
 * be called every frame inside `useFrame` without churning the GC.
 */

export interface SkyState {
  /** Zenith colour of the sky dome. */
  top: THREE.Color;
  /** Horizon band colour (also the fog colour). */
  horizon: THREE.Color;
  /** Below-horizon colour — the ground glow / fire from below at the bottom. */
  ground: THREE.Color;
  /** Key (sun) light colour. */
  light: THREE.Color;
  /** Emissive colour of the sun/fire-source sphere. */
  sun: THREE.Color;
  /** Key light intensity. */
  lightIntensity: number;
  /** Ambient fill intensity. */
  ambient: number;
  /** Sun emissive intensity (scales its glow/bloom). */
  sunIntensity: number;
  /** Sun vertical position. */
  sunY: number;
  /** FogExp2 density — clear in the light, smoky in the dark. */
  fogDensity: number;
  /** Rising particle presence 0..1 (fire embers, or motes of light). */
  ember: number;
  /** 0 = fire embers, 1 = golden motes of light. */
  emberTint: number;
  /** Starfield presence 0..1. */
  stars: number;
}

export type SkyStop = { t: number } & {
  [K in keyof SkyState]: SkyState[K];
};

const c = (hex: string) => new THREE.Color(hex);

type StopInput = {
  t: number;
  top: string;
  horizon: string;
  ground: string;
  light: string;
  sun: string;
  lightIntensity: number;
  ambient: number;
  sunIntensity: number;
  sunY: number;
  fogDensity: number;
  ember: number;
  emberTint?: number;
  stars?: number;
};

/** Build a stop from hex strings; tint and stars default to 0. */
export function stop(s: StopInput): SkyStop {
  return {
    t: s.t,
    top: c(s.top),
    horizon: c(s.horizon),
    ground: c(s.ground),
    light: c(s.light),
    sun: c(s.sun),
    lightIntensity: s.lightIntensity,
    ambient: s.ambient,
    sunIntensity: s.sunIntensity,
    sunY: s.sunY,
    fogDensity: s.fogDensity,
    ember: s.ember,
    emberTint: s.emberTint ?? 0,
    stars: s.stars ?? 0,
  };
}

/**
 * THE DESCENT (home page). Tone: "cinematic dread" — beautiful but increasingly
 * ominous. White-gold → blue day → violet dusk → ember orange → deep fire.
 * Never gory. These values are the ones the stakeholder approved; do not tune
 * them as a side effect of working on another journey.
 */
export const DESCENT_STOPS: SkyStop[] = [
  // 0.00 — HEAVEN: a glorious BLUE sky so the white clouds actually read.
  // The "gold" of heaven comes from the bloomed sun, not a washed-out sky.
  stop({
    t: 0,
    top: "#2b86e0",
    horizon: "#cfeaff",
    ground: "#eaf6ff",
    light: "#fff4d6",
    sun: "#ffe7ac",
    lightIntensity: 2.9,
    ambient: 1.05,
    sunIntensity: 1.7,
    sunY: 10,
    fogDensity: 0.006,
    ember: 0,
  }),
  // 0.25 — DAY: open blue
  stop({
    t: 0.25,
    top: "#2f7fd6",
    horizon: "#bfe2ff",
    ground: "#e7f4ff",
    light: "#ffffff",
    sun: "#fff4d6",
    lightIntensity: 2.6,
    ambient: 0.95,
    sunIntensity: 1.2,
    sunY: 6,
    fogDensity: 0.01,
    ember: 0,
  }),
  // 0.50 — DUSK: violet turn, warmth creeping into the horizon
  stop({
    t: 0.5,
    top: "#46408f",
    horizon: "#b87fbf",
    ground: "#f0a085",
    light: "#ffd0b0",
    sun: "#ff9e6b",
    lightIntensity: 2.2,
    ambient: 0.8,
    sunIntensity: 1.4,
    sunY: 2,
    fogDensity: 0.018,
    ember: 0.2,
  }),
  // 0.75 — EMBER: the sky burns orange, clouds become lit smoke
  stop({
    t: 0.75,
    top: "#48202f",
    horizon: "#b8431f",
    ground: "#ff7a2a",
    light: "#ff7a3c",
    sun: "#ff5a1f",
    lightIntensity: 2.0,
    ambient: 0.6,
    sunIntensity: 1.8,
    sunY: -1,
    fogDensity: 0.03,
    ember: 0.65,
  }),
  // 1.00 — HELL: deep red-black with fire welling from below
  stop({
    t: 1,
    top: "#140404",
    horizon: "#6e1606",
    ground: "#ff3a12",
    light: "#ff4015",
    sun: "#ff2a0a",
    lightIntensity: 1.9,
    ambient: 0.45,
    sunIntensity: 2.3,
    sunY: -7,
    fogDensity: 0.05,
    ember: 1,
  }),
];

const lerp = THREE.MathUtils.lerp;

/** Allocate a reusable state object once, then feed it to `sampleSky`. */
export function createSkyState(): SkyState {
  return {
    top: new THREE.Color(),
    horizon: new THREE.Color(),
    ground: new THREE.Color(),
    light: new THREE.Color(),
    sun: new THREE.Color(),
    lightIntensity: 0,
    ambient: 0,
    sunIntensity: 0,
    sunY: 0,
    fogDensity: 0,
    ember: 0,
    emberTint: 0,
    stars: 0,
  };
}

/**
 * Sample a journey at progress `t` (0..1) into `out`. No allocations.
 */
export function sampleSky(t: number, out: SkyState, stops: SkyStop[] = DESCENT_STOPS): SkyState {
  const p = THREE.MathUtils.clamp(t, 0, 1);

  // Find the bracketing keyframes.
  let i = 0;
  while (i < stops.length - 2 && p > stops[i + 1].t) i++;
  const a = stops[i];
  const b = stops[i + 1];
  const span = b.t - a.t || 1;
  const k = THREE.MathUtils.clamp((p - a.t) / span, 0, 1);

  out.top.copy(a.top).lerp(b.top, k);
  out.horizon.copy(a.horizon).lerp(b.horizon, k);
  out.ground.copy(a.ground).lerp(b.ground, k);
  out.light.copy(a.light).lerp(b.light, k);
  out.sun.copy(a.sun).lerp(b.sun, k);

  out.lightIntensity = lerp(a.lightIntensity, b.lightIntensity, k);
  out.ambient = lerp(a.ambient, b.ambient, k);
  out.sunIntensity = lerp(a.sunIntensity, b.sunIntensity, k);
  out.sunY = lerp(a.sunY, b.sunY, k);
  out.fogDensity = lerp(a.fogDensity, b.fogDensity, k);
  out.ember = lerp(a.ember, b.ember, k);
  out.emberTint = lerp(a.emberTint, b.emberTint, k);
  out.stars = lerp(a.stars, b.stars, k);

  return out;
}

/**
 * Ease `current` toward `target` by `alpha` (0..1). Called every frame with a
 * frame-rate independent alpha, this is what turns a page change into a
 * cross-fade between two skies instead of a hard cut. No allocations.
 */
export function dampSky(current: SkyState, target: SkyState, alpha: number): SkyState {
  current.top.lerp(target.top, alpha);
  current.horizon.lerp(target.horizon, alpha);
  current.ground.lerp(target.ground, alpha);
  current.light.lerp(target.light, alpha);
  current.sun.lerp(target.sun, alpha);
  current.lightIntensity = lerp(current.lightIntensity, target.lightIntensity, alpha);
  current.ambient = lerp(current.ambient, target.ambient, alpha);
  current.sunIntensity = lerp(current.sunIntensity, target.sunIntensity, alpha);
  current.sunY = lerp(current.sunY, target.sunY, alpha);
  current.fogDensity = lerp(current.fogDensity, target.fogDensity, alpha);
  current.ember = lerp(current.ember, target.ember, alpha);
  current.emberTint = lerp(current.emberTint, target.emberTint, alpha);
  current.stars = lerp(current.stars, target.stars, alpha);
  return current;
}

/** Copy one state into another (used for the very first frame). */
export function copySky(into: SkyState, from: SkyState): SkyState {
  return dampSky(into, from, 1);
}
