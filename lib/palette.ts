import * as THREE from "three";

/**
 * The Descent palette.
 *
 * A single scalar — whole-page scroll progress in [0, 1] — drives the entire
 * atmosphere from the radiant glories of Heaven (top) down into ember-red dread
 * (bottom). Every WebGL surface (sky dome, fog, lights, sun, embers) reads its
 * colour and intensity from one sampled `SkyState`, so the world stays in
 * perfect chromatic sync as the camera falls.
 *
 * Tone: "cinematic dread" — beautiful but increasingly ominous. White-gold →
 * blue day → violet dusk → ember orange → deep fire. Never gory.
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
  /** Sun vertical position — descends below the horizon into Hell. */
  sunY: number;
  /** FogExp2 density — clear in Heaven, smoky in Hell. */
  fogDensity: number;
  /** Ember presence 0..1 — fades the rising fire particles in on descent. */
  ember: number;
}

interface SkyStop {
  t: number;
  top: THREE.Color;
  horizon: THREE.Color;
  ground: THREE.Color;
  light: THREE.Color;
  sun: THREE.Color;
  lightIntensity: number;
  ambient: number;
  sunIntensity: number;
  sunY: number;
  fogDensity: number;
  ember: number;
}

const c = (hex: string) => new THREE.Color(hex);

/** Keyframes down the descent. `t` ascends 0 → 1. */
const STOPS: SkyStop[] = [
  {
    // 0.00 — HEAVEN: a glorious BLUE sky so the white clouds actually read.
    // The "gold" of heaven comes from the bloomed sun, not a washed-out sky.
    t: 0,
    top: c("#2b86e0"),
    horizon: c("#cfeaff"),
    ground: c("#eaf6ff"),
    light: c("#fff4d6"),
    sun: c("#ffe7ac"),
    lightIntensity: 2.9,
    ambient: 1.05,
    sunIntensity: 1.7,
    sunY: 10,
    fogDensity: 0.006,
    ember: 0,
  },
  {
    // 0.25 — DAY: open blue
    t: 0.25,
    top: c("#2f7fd6"),
    horizon: c("#bfe2ff"),
    ground: c("#e7f4ff"),
    light: c("#ffffff"),
    sun: c("#fff4d6"),
    lightIntensity: 2.6,
    ambient: 0.95,
    sunIntensity: 1.2,
    sunY: 6,
    fogDensity: 0.01,
    ember: 0,
  },
  {
    // 0.50 — DUSK: violet turn, warmth creeping into the horizon
    t: 0.5,
    top: c("#46408f"),
    horizon: c("#b87fbf"),
    ground: c("#f0a085"),
    light: c("#ffd0b0"),
    sun: c("#ff9e6b"),
    lightIntensity: 2.2,
    ambient: 0.8,
    sunIntensity: 1.4,
    sunY: 2,
    fogDensity: 0.018,
    ember: 0.2,
  },
  {
    // 0.75 — EMBER: the sky burns orange, clouds become lit smoke
    t: 0.75,
    top: c("#48202f"),
    horizon: c("#b8431f"),
    ground: c("#ff7a2a"),
    light: c("#ff7a3c"),
    sun: c("#ff5a1f"),
    lightIntensity: 2.0,
    ambient: 0.6,
    sunIntensity: 1.8,
    sunY: -1,
    fogDensity: 0.03,
    ember: 0.65,
  },
  {
    // 1.00 — HELL: deep red-black with fire welling from below
    t: 1,
    top: c("#140404"),
    horizon: c("#6e1606"),
    ground: c("#ff3a12"),
    light: c("#ff4015"),
    sun: c("#ff2a0a"),
    lightIntensity: 1.9,
    ambient: 0.45,
    sunIntensity: 2.3,
    sunY: -7,
    fogDensity: 0.05,
    ember: 1,
  },
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
  };
}

/**
 * Sample the descent at progress `t` (0..1) into `out`. No allocations.
 */
export function sampleSky(t: number, out: SkyState): SkyState {
  const p = THREE.MathUtils.clamp(t, 0, 1);

  // Find the bracketing keyframes.
  let i = 0;
  while (i < STOPS.length - 2 && p > STOPS[i + 1].t) i++;
  const a = STOPS[i];
  const b = STOPS[i + 1];
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

  return out;
}
