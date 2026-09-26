import * as THREE from "three";
import { DESCENT_STOPS, stop, type SkyStop } from "@/lib/palette";

/**
 * Journeys: one sky per page.
 *
 * The WebGL canvas lives in the root layout and survives navigation, so instead
 * of every page mounting its own scene, each page selects a JOURNEY. A journey
 * is three things, all functions of whole-page scroll progress `sp` in [0, 1]:
 *
 *   stops   - the palette keyframes (lib/palette.ts), sampled every frame
 *   fx      - how present each set-piece is (god-rays, fire, EEG, flare, ...)
 *   camera  - the path the camera flies as you scroll
 *
 * Moving between pages the sky state is DAMPED toward the new journey, so a
 * navigation reads as the camera flying from one world into the next.
 *
 * THE DESCENT (home) must look exactly as it did before journeys existed: its
 * fx below are the original hard-coded curves from SkyCanvas, moved verbatim.
 */

export type JourneyId = "descent" | "ascent" | "cosmos" | "sanctuary" | "passage" | "dawn";

/** Per-frame presence of each set-piece, 0..1. Mutated in place, never allocated. */
export interface FxState {
  /** Tunnel-of-light god-rays at the sun. */
  shaft: number;
  /** Well of fire rising from below. */
  lava: number;
  /** Clinical heart-monitor trace. */
  eeg: number;
  /** Amplitude of the heartbeat on that trace: 1 = beating, 0 = flatline. */
  eegAmp: number;
  /** Lens flare ghosts off the sun. */
  flare: number;
  /** Near-field cloud rush density. */
  rush: number;
  /** How far the rush has turned from white cumulus to dark ash/smoke. */
  ash: number;
}

export function createFx(): FxState {
  return { shaft: 0, lava: 0, eeg: 0, eegAmp: 1, flare: 0, rush: 0, ash: 0 };
}

export interface JourneyCamera {
  /** Camera height at the top and bottom of the page (scroll 0 and 1). */
  y0: number;
  y1: number;
  /** Sideways sway amplitude and how many half-waves over the page. */
  sway: number;
  swayFreq: number;
  /** Toward/away surge amplitude and frequency. */
  surge: number;
  surgeFreq: number;
  /** How far below the camera it looks. Negative looks UP. */
  lookDown: number;
  /** Banking roll into the sway. */
  bank: number;
}

export interface Journey {
  id: JourneyId;
  stops: SkyStop[];
  camera: JourneyCamera;
  fx: (sp: number, out: FxState) => FxState;
  /** Labels for the fixed progress rail (top, bottom). */
  rail: [string, string];
}

const ss = THREE.MathUtils.smoothstep;

/** A bump: rises across [a, b], holds, falls across [c, d]. */
function bump(x: number, a: number, b: number, c: number, d: number) {
  return ss(x, a, b) * (1 - ss(x, c, d));
}

/* ------------------------------------------------------------------------- */
/*  THE DESCENT - home. Heaven into Hell.                                     */
/* ------------------------------------------------------------------------- */
const descent: Journey = {
  id: "descent",
  stops: DESCENT_STOPS,
  camera: {
    y0: 8,
    y1: -16,
    sway: 6,
    swayFreq: 2.5,
    surge: 5,
    surgeFreq: 3,
    lookDown: 3,
    bank: 0.1,
  },
  fx: (sp, o) => {
    o.shaft = 1 - ss(sp, 0.04, 0.34);
    o.lava = ss(sp, 0.62, 0.92);
    o.eeg = ss(sp, 0.34, 0.44) * (1 - ss(sp, 0.6, 0.7));
    o.eegAmp = 1;
    o.flare = 1 - ss(sp, 0.1, 0.55);
    const heaven = 1 - ss(sp, 0.03, 0.4);
    const hell = ss(sp, 0.58, 0.92);
    o.rush = 0.06 + 0.8 * Math.max(heaven, hell * 0.85);
    o.ash = ss(sp, 0.5, 0.95);
    return o;
  },
  rail: ["Heaven", "Hell"],
};

/* ------------------------------------------------------------------------- */
/*  THE ASCENT - the story. The Descent's mirror: from a starless void, up    */
/*  through a night of wonder and a rose dawn, into the radiance of Heaven.   */
/*  Motes of light rise past you instead of embers.                           */
/* ------------------------------------------------------------------------- */
const HEAVEN_GLORY = {
  top: "#2b86e0",
  horizon: "#fff3d8",
  ground: "#fffaf0",
  light: "#fff8e6",
  sun: "#fff1c0",
  lightIntensity: 3.0,
  ambient: 1.1,
  sunIntensity: 2.2,
  fogDensity: 0.006,
};

const ascent: Journey = {
  id: "ascent",
  stops: [
    // VOID - lost, starless, nearly black
    stop({
      t: 0,
      top: "#020308",
      horizon: "#0a0c1c",
      ground: "#0f0a16",
      light: "#5f6bc2",
      sun: "#141733",
      lightIntensity: 0.55,
      ambient: 0.16,
      sunIntensity: 0.15,
      sunY: -42,
      fogDensity: 0.045,
      ember: 0.08,
      emberTint: 1,
      stars: 0.05,
    }),
    // THE HEAVENS DECLARE - a night thick with stars
    stop({
      t: 0.18,
      top: "#050822",
      horizon: "#161b46",
      ground: "#1b1331",
      light: "#8fa0ff",
      sun: "#2c3070",
      lightIntensity: 0.9,
      ambient: 0.28,
      sunIntensity: 0.25,
      sunY: -42,
      fogDensity: 0.028,
      ember: 0.15,
      emberTint: 1,
      stars: 1,
    }),
    // KNOWN - pre-dawn indigo, the first warmth on the horizon
    stop({
      t: 0.4,
      top: "#161a52",
      horizon: "#57488c",
      ground: "#a65e7c",
      light: "#d8a2c4",
      sun: "#ff9e7a",
      lightIntensity: 1.4,
      ambient: 0.48,
      sunIntensity: 0.8,
      sunY: -42,
      fogDensity: 0.022,
      ember: 0.3,
      emberTint: 1,
      stars: 0.75,
    }),
    // BROKEN OPEN - dawn breaks, rose and amber
    stop({
      t: 0.55,
      top: "#34479a",
      horizon: "#f0a070",
      ground: "#ffc58a",
      light: "#ffd2a0",
      sun: "#ffb070",
      lightIntensity: 2.0,
      ambient: 0.75,
      sunIntensity: 1.5,
      sunY: -42,
      fogDensity: 0.016,
      ember: 0.55,
      emberTint: 1,
      stars: 0.15,
    }),
    // MADE NEW - sunrise gold
    stop({
      t: 0.7,
      top: "#3a82d6",
      horizon: "#ffe2b4",
      ground: "#fff0d8",
      light: "#fff0cc",
      sun: "#ffe39a",
      lightIntensity: 2.6,
      ambient: 0.95,
      sunIntensity: 1.9,
      sunY: -38,
      fogDensity: 0.01,
      ember: 0.7,
      emberTint: 1,
      stars: 0,
    }),
    // GLORY - the light of Heaven
    stop({ t: 1, ...HEAVEN_GLORY, sunY: 11, ember: 0.85, emberTint: 1, stars: 0 }),
  ],
  camera: {
    y0: -16,
    y1: 9,
    sway: 4,
    swayFreq: 2,
    surge: 3,
    surgeFreq: 2.5,
    lookDown: -1.5,
    bank: 0.06,
  },
  fx: (sp, o) => {
    o.shaft = ss(sp, 0.6, 0.9);
    o.lava = 0;
    o.eeg = 0;
    o.eegAmp = 1;
    o.flare = ss(sp, 0.66, 0.9) * 0.8;
    // Thin, faintly lit mist in the dark; full cumulus as you break into light.
    o.rush = 0.1 + 0.55 * ss(sp, 0.48, 0.85);
    o.ash = 1 - ss(sp, 0.3, 0.62);
    return o;
  },
  rail: ["Darkness", "Light"],
};

/* ------------------------------------------------------------------------- */
/*  COSMOS - Great Minds. Rise off the earth's blue sky, above the clouds,    */
/*  into deep space. Stars wheel overhead: the book of nature, open.          */
/* ------------------------------------------------------------------------- */
const cosmos: Journey = {
  id: "cosmos",
  stops: [
    stop({
      t: 0,
      top: "#1d5aae",
      horizon: "#9cc8f0",
      ground: "#dcecff",
      light: "#ffffff",
      sun: "#fff1c8",
      lightIntensity: 2.4,
      ambient: 0.9,
      sunIntensity: 1.2,
      sunY: 6,
      fogDensity: 0.01,
      ember: 0,
    }),
    stop({
      t: 0.25,
      top: "#14245e",
      horizon: "#4e64ad",
      ground: "#8f9bd2",
      light: "#d8dcff",
      sun: "#ffd9a8",
      lightIntensity: 1.8,
      ambient: 0.6,
      sunIntensity: 1.0,
      sunY: 2,
      fogDensity: 0.012,
      ember: 0,
      stars: 0.35,
    }),
    stop({
      t: 0.5,
      top: "#050716",
      horizon: "#17163c",
      ground: "#281a44",
      light: "#aab4ff",
      sun: "#c9b8ff",
      lightIntensity: 1.1,
      ambient: 0.3,
      sunIntensity: 0.7,
      sunY: -2,
      fogDensity: 0.008,
      ember: 0.1,
      emberTint: 1,
      stars: 1,
    }),
    stop({
      t: 1,
      top: "#03030c",
      horizon: "#1b0e36",
      ground: "#3a1848",
      light: "#c8a8ff",
      sun: "#ffd6a0",
      lightIntensity: 1.0,
      ambient: 0.25,
      sunIntensity: 1.2,
      sunY: 3,
      fogDensity: 0.006,
      ember: 0.2,
      emberTint: 1,
      stars: 1,
    }),
  ],
  camera: {
    y0: 3,
    y1: 17,
    sway: 3,
    swayFreq: 1.6,
    surge: 2.5,
    surgeFreq: 2,
    lookDown: -3.5,
    bank: 0.05,
  },
  fx: (sp, o) => {
    o.shaft = (1 - ss(sp, 0.02, 0.2)) * 0.5;
    o.lava = 0;
    o.eeg = 0;
    o.eegAmp = 1;
    o.flare = (1 - ss(sp, 0.05, 0.3)) * 0.7;
    // You climb out of the clouds; the near field thins to nothing in space.
    o.rush = 0.05 + 0.5 * (1 - ss(sp, 0.08, 0.35));
    o.ash = ss(sp, 0.2, 0.5) * 0.8;
    return o;
  },
  rail: ["Earth", "Cosmos"],
};

/* ------------------------------------------------------------------------- */
/*  SANCTUARY - Scripture. A reading room made of sky: golden morning light   */
/*  that slowly warms to evening lamplight. Calm, low contrast, easy on the   */
/*  eyes for long reading; a few motes of dust drift in the light.            */
/* ------------------------------------------------------------------------- */
const sanctuary: Journey = {
  id: "sanctuary",
  stops: [
    stop({
      t: 0,
      top: "#3a7ccc",
      horizon: "#ffe7c4",
      ground: "#fff4e2",
      light: "#fff0d0",
      sun: "#ffe2a0",
      lightIntensity: 2.6,
      ambient: 1.0,
      sunIntensity: 1.5,
      sunY: 7,
      fogDensity: 0.008,
      ember: 0.25,
      emberTint: 1,
    }),
    stop({
      t: 0.55,
      top: "#5467b8",
      horizon: "#ffd2a4",
      ground: "#ffe1c2",
      light: "#ffe0b8",
      sun: "#ffc070",
      lightIntensity: 2.3,
      ambient: 0.9,
      sunIntensity: 1.6,
      sunY: 3,
      fogDensity: 0.01,
      ember: 0.3,
      emberTint: 1,
    }),
    stop({
      t: 1,
      top: "#29306c",
      horizon: "#e09468",
      ground: "#f3b985",
      light: "#ffc890",
      sun: "#ff9a50",
      lightIntensity: 1.9,
      ambient: 0.7,
      sunIntensity: 1.7,
      sunY: 0,
      fogDensity: 0.014,
      ember: 0.35,
      emberTint: 1,
      stars: 0.2,
    }),
  ],
  camera: {
    y0: 6,
    y1: -4,
    sway: 2.5,
    swayFreq: 1.5,
    surge: 2,
    surgeFreq: 2,
    lookDown: 2,
    bank: 0.04,
  },
  fx: (sp, o) => {
    o.shaft = 0.55 - 0.25 * ss(sp, 0.2, 0.9);
    o.lava = 0;
    o.eeg = 0;
    o.eegAmp = 1;
    o.flare = 0.45 * (1 - ss(sp, 0.3, 0.8));
    o.rush = 0.12;
    o.ash = ss(sp, 0.6, 1) * 0.3;
    return o;
  },
  rail: ["Morning", "Evening"],
};

/* ------------------------------------------------------------------------- */
/*  PASSAGE - Evidence. The shape of an NDE itself: a cold clinical twilight, */
/*  the monitor flatlines, darkness, and then the light at the end.           */
/* ------------------------------------------------------------------------- */
const passage: Journey = {
  id: "passage",
  stops: [
    stop({
      t: 0,
      top: "#1d3350",
      horizon: "#7896b2",
      ground: "#abc0d4",
      light: "#d8ecff",
      sun: "#cfe8ff",
      lightIntensity: 1.8,
      ambient: 0.7,
      sunIntensity: 0.6,
      sunY: 3,
      fogDensity: 0.014,
      ember: 0,
    }),
    stop({
      t: 0.3,
      top: "#0b1320",
      horizon: "#28384d",
      ground: "#38485d",
      light: "#8aa4c0",
      sun: "#5a7090",
      lightIntensity: 1.0,
      ambient: 0.35,
      sunIntensity: 0.3,
      sunY: -2,
      fogDensity: 0.03,
      ember: 0,
      stars: 0.1,
    }),
    stop({
      t: 0.58,
      top: "#04060c",
      horizon: "#101828",
      ground: "#182236",
      light: "#6a80a8",
      sun: "#9ab0ff",
      lightIntensity: 0.8,
      ambient: 0.25,
      sunIntensity: 0.9,
      sunY: 0,
      fogDensity: 0.04,
      ember: 0.1,
      emberTint: 1,
      stars: 0.3,
    }),
    stop({
      t: 0.84,
      top: "#2f6cbc",
      horizon: "#fff0d0",
      ground: "#fff8e8",
      light: "#fff4dc",
      sun: "#fff0c0",
      lightIntensity: 2.6,
      ambient: 1.0,
      sunIntensity: 2.4,
      sunY: 2,
      fogDensity: 0.01,
      ember: 0.3,
      emberTint: 1,
    }),
    stop({ t: 1, ...HEAVEN_GLORY, sunY: 5, ember: 0.35, emberTint: 1 }),
  ],
  camera: {
    y0: 7,
    y1: -10,
    sway: 3,
    swayFreq: 1.8,
    surge: 6,
    surgeFreq: 2.2,
    lookDown: 2,
    bank: 0.06,
  },
  fx: (sp, o) => {
    o.shaft = ss(sp, 0.6, 0.86);
    o.lava = 0;
    // No WebGL heart monitor here: the page has its own, far more legible,
    // scroll-scrubbed monitor (FlatlineScrub), and the set-piece peeking out
    // between its panels read as a stray cross of light once it flattened.
    o.eeg = 0;
    o.eegAmp = 1;
    o.flare = ss(sp, 0.72, 0.95) * 0.7;
    o.rush = 0.08 + 0.35 * ss(sp, 0.7, 0.95);
    o.ash = bump(sp, 0.15, 0.35, 0.6, 0.8);
    return o;
  },
  rail: ["Life", "Beyond"],
};

/* ------------------------------------------------------------------------- */
/*  DAWN - Begin. Night giving way to morning: "joy comes in the morning".    */
/* ------------------------------------------------------------------------- */
const dawn: Journey = {
  id: "dawn",
  stops: [
    stop({
      t: 0,
      top: "#161e4a",
      horizon: "#74669c",
      ground: "#d69a8e",
      light: "#ffd8c0",
      sun: "#ffb080",
      lightIntensity: 1.6,
      ambient: 0.6,
      sunIntensity: 1.2,
      sunY: -1,
      fogDensity: 0.016,
      ember: 0.2,
      emberTint: 1,
      stars: 0.5,
    }),
    stop({
      t: 0.5,
      top: "#386ec6",
      horizon: "#ffd8a8",
      ground: "#ffecd0",
      light: "#ffe8c8",
      sun: "#ffd080",
      lightIntensity: 2.4,
      ambient: 0.9,
      sunIntensity: 1.8,
      sunY: 4,
      fogDensity: 0.01,
      ember: 0.35,
      emberTint: 1,
    }),
    stop({ t: 1, ...HEAVEN_GLORY, sunY: 9, ember: 0.4, emberTint: 1 }),
  ],
  camera: {
    y0: -6,
    y1: 8,
    sway: 3,
    swayFreq: 1.6,
    surge: 3,
    surgeFreq: 2,
    lookDown: 0.5,
    bank: 0.05,
  },
  fx: (sp, o) => {
    o.shaft = ss(sp, 0.25, 0.8) * 0.75;
    o.lava = 0;
    o.eeg = 0;
    o.eegAmp = 1;
    o.flare = ss(sp, 0.35, 0.8) * 0.6;
    o.rush = 0.12 + 0.35 * ss(sp, 0.45, 1);
    o.ash = 1 - ss(sp, 0.1, 0.45);
    return o;
  },
  rail: ["Night", "Morning"],
};

export const JOURNEYS: Record<JourneyId, Journey> = {
  descent,
  ascent,
  cosmos,
  sanctuary,
  passage,
  dawn,
};
