"use client";

/* This is the WebGL render-loop file. react-three-fiber's whole model is to
   mutate three.js objects (camera, scene, fog, materials, shader uniforms)
   directly inside useFrame every tick — that runs outside React's
   render/reconciliation, so the React Compiler "immutability" rule (which
   assumes values returned from hooks stay frozen) does not apply here. */
/* eslint-disable react-hooks/immutability */

/* IMPORTANT (learned the hard way): r3f CLONES a `uniforms` object passed as a
   JSX prop — the material on the mesh gets its own uniform wrappers. Mutating
   the useMemo'd prop object from useFrame therefore does NOTHING for scalar
   uniforms (`u.value = x` writes to a dead clone; `.value.copy()` only worked
   by accident because the clone shares the same Color instance). Every frame-
   driven uniform update below reads the material off the mesh ref instead. */

/* JOURNEYS: the canvas lives in the root layout and survives navigation, so
   each page picks a journey (lib/journeys.ts) instead of mounting its own
   scene. Every set-piece below reads its presence from one damped `fx` state
   rather than hard-coding a scroll range, so the same pieces can play a
   different part on each page - and a page change cross-fades between skies
   instead of cutting. */

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Clouds, Cloud } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { scrollProgress, pointer } from "@/lib/scroll";
import { useDeviceTier } from "@/lib/useDeviceTier";
import {
  copySky,
  createSkyState,
  dampSky,
  sampleSky,
  type SkyState,
} from "@/lib/palette";
import { JOURNEYS, createFx, type FxState, type JourneyId } from "@/lib/journeys";
import Starfield from "@/components/three/Starfield";
import StoryParticles from "@/components/three/StoryParticles";

/* -------------------------------------------------------------------------- */
/*  Cloud field — a volume the camera falls THROUGH, spread across the whole   */
/*  descent (y from Heaven high to Hell low) and in depth (z) so we fly past   */
/*  puffs rather than staring at a flat wall of them.                          */
/* -------------------------------------------------------------------------- */
type Puff = {
  position: [number, number, number];
  bounds: [number, number, number];
  volume: number;
  scale: number;
  opacity: number;
  seed: number;
  speed: number;
};

const CLOUD_FIELD: Puff[] = [
  { position: [-7, 9, -3], bounds: [9, 2.4, 3], volume: 9, scale: 1.25, opacity: 0.9, seed: 1, speed: 0.14 },
  { position: [8, 6.5, -6], bounds: [7, 2, 3], volume: 7, scale: 1.05, opacity: 0.75, seed: 2, speed: 0.1 },
  { position: [0, 3, 2], bounds: [11, 2.6, 3], volume: 10, scale: 1.4, opacity: 0.92, seed: 3, speed: 0.18 },
  { position: [-9, 0, -2], bounds: [7, 2, 3], volume: 7, scale: 1.0, opacity: 0.82, seed: 4, speed: 0.16 },
  { position: [9, -3, 1], bounds: [8, 2.2, 3], volume: 8, scale: 1.1, opacity: 0.8, seed: 5, speed: 0.12 },
  { position: [-4, -6, -4], bounds: [8, 2.2, 3], volume: 8, scale: 1.15, opacity: 0.85, seed: 6, speed: 0.15 },
  { position: [6, -9, -1], bounds: [7, 2, 3], volume: 7, scale: 1.0, opacity: 0.8, seed: 7, speed: 0.13 },
  { position: [-7, -12, 2], bounds: [9, 2.4, 3], volume: 9, scale: 1.25, opacity: 0.9, seed: 8, speed: 0.17 },
  { position: [3, -15, -3], bounds: [8, 2.2, 3], volume: 8, scale: 1.1, opacity: 0.88, seed: 9, speed: 0.14 },
];

/* -------------------------------------------------------------------------- */
/*  Sky dome — a large inward-facing sphere that follows the camera. A simple  */
/*  3-stop vertical gradient (ground / horizon / zenith) recoloured each frame */
/*  from the descent palette. This is the atmosphere the whole scene lives in. */
/* -------------------------------------------------------------------------- */
const DOME_VERT = /* glsl */ `
  varying float vY;
  void main() {
    vY = normalize(position).y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const DOME_FRAG = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uGround;
  varying float vY;
  void main() {
    vec3 col = vY > 0.0
      ? mix(uHorizon, uTop, smoothstep(0.0, 0.55, vY))
      : mix(uHorizon, uGround, smoothstep(0.0, -0.5, vY));
    gl_FragColor = vec4(col, 1.0);
  }
`;

function SkyDome({ state }: { state: SkyState }) {
  const ref = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uGround: { value: new THREE.Color() },
    }),
    []
  );

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const u = (mesh.material as THREE.ShaderMaterial).uniforms;
    u.uTop.value.copy(state.top);
    u.uHorizon.value.copy(state.horizon);
    u.uGround.value.copy(state.ground);
    mesh.position.copy(camera.position);
  });

  return (
    <mesh ref={ref} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[60, 32, 16]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={DOME_VERT}
        fragmentShader={DOME_FRAG}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Embers — GPU-animated rising fire particles. Cheap: positions loop in the  */
/*  vertex shader from a time uniform; opacity fades in with the descent.      */
/*  The point cloud follows the camera so embers always surround the viewer.   */
/* -------------------------------------------------------------------------- */
const EMBER_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vAlpha;
  const float RANGE = 36.0;
  void main() {
    vec3 p = position;
    float speed = 1.4 + aSeed * 2.4;
    p.y = mod(position.y + uTime * speed, RANGE);
    p.x += sin(uTime * 0.6 + aSeed * 6.2831) * 1.4;
    p.z += cos(uTime * 0.5 + aSeed * 4.0) * 1.0;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float fade = smoothstep(0.0, 5.0, p.y) * (1.0 - smoothstep(RANGE - 10.0, RANGE, p.y));
    vAlpha = fade * (0.5 + aSeed * 0.5);
    gl_PointSize = (uSize * uPixelRatio) / max(-mv.z, 1.0);
  }
`;

const EMBER_FRAG = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColorHot;
  uniform vec3 uColorCool;
  uniform vec3 uLightHot;
  uniform vec3 uLightCool;
  uniform float uTint;      // 0 = fire embers, 1 = golden motes of light
  varying float vAlpha;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d);
    if (r > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, r);
    vec3 fire = mix(uColorCool, uColorHot, soft);
    vec3 light = mix(uLightCool, uLightHot, soft);
    vec3 col = mix(fire, light, uTint);
    gl_FragColor = vec4(col, soft * vAlpha * uOpacity);
  }
`;

/** Deterministic pseudo-random in [0, 1) from a number — pure & stable across renders. */
function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function Embers({ count, state }: { count: number; state: SkyState }) {
  const ref = useRef<THREE.Points>(null);
  const { camera } = useThree();

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (hash(i + 1) * 2 - 1) * 20;
      pos[i * 3 + 1] = hash(i + 7.3) * 36;
      pos[i * 3 + 2] = (hash(i + 19.1) * 2 - 1) * 16 - 2;
      seed[i] = hash(i + 41.7);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uSize: { value: 130 },
      uPixelRatio: {
        value: typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1,
      },
      // HDR-hot (>1) so ember cores cross the Bloom threshold like sparks.
      uColorHot: { value: new THREE.Color("#ffd58a").multiplyScalar(2.2) },
      uColorCool: { value: new THREE.Color("#ff3b14").multiplyScalar(1.6) },
      // The same column, re-tinted, becomes rising motes of light on the
      // journeys that climb toward Heaven. Softer than fire - still sparkles.
      uLightHot: { value: new THREE.Color("#fff6e0").multiplyScalar(1.9) },
      uLightCool: { value: new THREE.Color("#ffc46a").multiplyScalar(1.2) },
      uTint: { value: 0 },
    }),
    []
  );

  useFrame((_, delta) => {
    const p = ref.current;
    if (!p) return;
    const u = (p.material as THREE.ShaderMaterial).uniforms;
    u.uTime.value += Math.min(delta, 0.05);
    u.uOpacity.value = state.ember;
    u.uTint.value = state.emberTint;
    p.visible = state.ember > 0.005;
    // Surround the viewer: anchor the column below the camera so embers rise past it.
    p.position.set(camera.position.x, camera.position.y - 18, camera.position.z - 2);
  });

  if (count === 0) return null;

  return (
    <points ref={ref} frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={EMBER_VERT}
        fragmentShader={EMBER_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* -------------------------------------------------------------------------- */
/*  Cloud rush — the near-field layer you actually fly INTO. A slab of soft     */
/*  billboards that streams toward the lens as you scroll: puffs rise out of    */
/*  the far haze, swell, and dissolve just before they reach the camera, so     */
/*  the descent reads as falling THROUGH weather instead of past a backdrop.    */
/*                                                                              */
/*  The drei <Clouds> field above is volumetric and world-anchored — great for  */
/*  mid-distance body, far too expensive to thicken into a foreground. This is  */
/*  ONE InstancedBufferGeometry in ONE draw call with zero per-instance CPU     */
/*  work: the whole march lives in the vertex shader behind a single uTravel.   */
/*                                                                              */
/*  Kept deliberately under the Bloom luminance threshold (1.05) so, like the   */
/*  white cloud field, these never wash the scene out — only emissives glow.    */
/* -------------------------------------------------------------------------- */

/** Depth of the wrapping slab, in world units ahead of the lens. */
const RUSH_DEPTH = 38;
/** How far the field marches over one full page scroll (~20 slab lengths).
 *  This is THE dial for how hard the sky rushes: raise it and scrolling rips
 *  the clouds past you, lower it and the descent turns stately. */
const RUSH_TRAVEL = RUSH_DEPTH * 20;
/** Gentle autonomous drift so the sky still moves while the page sits still. */
const RUSH_IDLE = 2.4;

const RUSH_VERT = /* glsl */ `
  attribute vec3 aOffset;   // xy = lateral placement, z = phase within the slab
  attribute vec4 aParams;   // x = scale, y = seed, z = opacity, w = spin
  uniform float uTravel;
  uniform float uDepth;
  uniform float uTime;
  uniform vec2 uNearFade;   // (gone, fully present) distance from the lens
  varying vec2 vUv;
  varying float vFade;
  varying float vShade;

  void main() {
    vUv = uv;
    float scale = aParams.x;

    // March toward the lens, wrapping through the slab: -uDepth (far) .. 0 (eye).
    float z = mod(aOffset.z + uTravel, uDepth);
    vec4 mv = modelViewMatrix * vec4(aOffset.xy, z - uDepth, 1.0);
    float dist = max(-mv.z, 0.0);

    // Billboard in VIEW space — always square to the lens, no matrix churn.
    float a = uTime * aParams.w + aParams.y * 6.2831;
    float cs = cos(a);
    float sn = sin(a);
    vec2 corner = vec2(
      position.x * cs - position.y * sn,
      position.x * sn + position.y * cs
    ) * scale;
    mv.xy += corner;

    gl_Position = projectionMatrix * mv;

    // Rise out of the far haze; dissolve before clipping through the camera.
    // Written as 1.0 - smoothstep(lo, hi, x) rather than smoothstep(hi, lo, x):
    // GLSL ES leaves smoothstep undefined when edge0 >= edge1, and every driver
    // happening to do the right thing is not a guarantee.
    float far = 1.0 - smoothstep(uDepth * 0.62, uDepth, dist);
    float near = smoothstep(uNearFade.x, uNearFade.y, dist);
    vFade = far * near * aParams.z;

    // View-space vertical gradient: tops catch the key light, undersides sit
    // in shadow. Read off the ROTATED corner so shading ignores the spin.
    vShade = clamp(0.5 + corner.y / (2.0 * scale), 0.0, 1.0);
  }
`;

const RUSH_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uLit;
  uniform vec3 uShade;
  uniform float uOpacity;
  varying vec2 vUv;
  varying float vFade;
  varying float vShade;

  void main() {
    float a = texture2D(uMap, vUv).a;
    // Most of a cloud sprite is empty — skip the blend entirely out there.
    if (a < 0.01) discard;
    // Harden the falloff: the raw sprite is a soft radial blob, and dozens of
    // them overlapped average into flat haze. The power curve restores an edge.
    a = pow(a, 1.7);
    vec3 col = mix(uShade, uLit, smoothstep(0.04, 0.98, vShade));
    gl_FragColor = vec4(col, a * vFade * uOpacity);
  }
`;

function CloudRush({
  count,
  state,
  fx,
  calm,
}: {
  count: number;
  state: SkyState;
  fx: FxState;
  calm: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const drift = useRef(0);
  const slabQ = useRef(new THREE.Quaternion());
  const synced = useRef(false);

  const white = useMemo(() => new THREE.Color("#ffffff"), []);
  const ashShade = useMemo(() => new THREE.Color("#150708"), []);

  const texture = useMemo(() => {
    // Self-hosted sprite — never add a runtime CDN dependency to the canvas.
    const t = new THREE.TextureLoader().load("/textures/cloud.png");
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);

  const geometry = useMemo(() => {
    const g = new THREE.InstancedBufferGeometry();
    // Borrow a unit quad's buffers. Do NOT dispose the source geometry: it
    // shares the very attribute objects the renderer keys its GPU buffers on.
    const quad = new THREE.PlaneGeometry(1, 1);
    g.setIndex(quad.getIndex());
    g.setAttribute("position", quad.getAttribute("position"));
    g.setAttribute("uv", quad.getAttribute("uv"));

    const offset = new Float32Array(count * 3);
    const params = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      offset[i * 3] = (hash(i + 3.1) * 2 - 1) * 20;
      offset[i * 3 + 1] = (hash(i + 11.7) * 2 - 1) * 13;
      // Evenly phased through the slab so puffs arrive in a steady stream
      // rather than clumping into visible waves.
      offset[i * 3 + 2] = (i / Math.max(count, 1)) * RUSH_DEPTH;
      params[i * 4] = 4 + hash(i + 23.3) * 18; // scale
      params[i * 4 + 1] = hash(i + 37.9); // seed
      params[i * 4 + 2] = 0.34 + hash(i + 53.5) * 0.42; // per-puff opacity
      params[i * 4 + 3] = (hash(i + 67.1) * 2 - 1) * 0.06; // spin
    }
    g.setAttribute("aOffset", new THREE.InstancedBufferAttribute(offset, 3));
    g.setAttribute("aParams", new THREE.InstancedBufferAttribute(params, 4));
    g.instanceCount = count;
    return g;
  }, [count]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uTravel: { value: 0 },
      uDepth: { value: RUSH_DEPTH },
      uTime: { value: 0 },
      uNearFade: { value: new THREE.Vector2(0.6, 4) },
      uLit: { value: new THREE.Color() },
      uShade: { value: new THREE.Color() },
      uOpacity: { value: 0 },
    }),
    [texture]
  );

  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    const d = Math.min(delta, 0.05);
    const sp = THREE.MathUtils.clamp(scrollProgress.get(), 0, 1);
    const u = (m.material as THREE.ShaderMaterial).uniforms;

    // Scroll pulls the field past you. Under reduced motion the approach is
    // halved and the idle drift stops — the rush toward the eye is what
    // carries vestibular risk. Density and colour are NOT reduced: the calm
    // path is what reduced-motion visitors actually see, so it has to be the
    // same view, just a slower one.
    u.uTime.value += d * (calm ? 0.12 : 1);
    drift.current += d * RUSH_IDLE * (calm ? 0 : 1);
    u.uTravel.value = sp * RUSH_TRAVEL * (calm ? 0.5 : 1) + drift.current;
    u.uNearFade.value.set(calm ? 4.5 : 0.3, calm ? 12 : 2.6);

    // Presence comes from the journey. On the Descent: dense cumulus at the top
    // (you enter the sky), thinned to almost nothing through the middle so the
    // set-pieces read, then back as ash and smoke near Hell — lighter there
    // than in Heaven, so the fire still burns through rather than being
    // curtained off.
    const presence = fx.rush;
    u.uOpacity.value = presence;

    // Tint: white cumulus -> dusk violet -> dark ash lit by the glow below.
    // Every term stays under 1.05 so these never cross the Bloom threshold.
    const ash = fx.ash;
    u.uLit.value
      .copy(white)
      .lerp(state.light, 0.4)
      .lerp(state.ground, ash * 0.9)
      .multiplyScalar(1 - ash * 0.55);
    // Shadowed undersides take the HORIZON's own colour rather than a fixed
    // blue-grey: a neutral grey averaged over the ember sky desaturated the
    // whole of Hell, which is exactly the drama this descent is built on.
    u.uShade.value
      .copy(state.horizon)
      .multiplyScalar(0.45)
      .lerp(ashShade, ash * 0.8);

    // `.image` lands only once the sprite has decoded; without this the first
    // frames would flash untextured white quads across the whole viewport.
    m.visible = presence > 0.01 && !!texture.image;

    // Anchor the slab to the camera, but let its orientation LAG behind: a
    // rigid lock paints the clouds onto the lens with no parallax when the rig
    // banks, and the whole point is that you feel yourself moving through them.
    if (!synced.current) {
      slabQ.current.copy(camera.quaternion);
      synced.current = true;
    }
    slabQ.current.slerp(camera.quaternion, 1 - Math.exp(-2.5 * d));
    m.position.copy(camera.position);
    m.quaternion.copy(slabQ.current);
  });

  if (count === 0) return null;

  return (
    <mesh ref={ref} renderOrder={1} visible={false} frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={RUSH_VERT}
        fragmentShader={RUSH_FRAG}
        transparent
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tunnel of Light — the canonical NDE motif. Radial god-ray shafts stream     */
/*  from the sun, brightest at the very top of the descent (the "move toward    */
/*  the light" threshold) and gone by the first third. Anchored far away at the */
/*  sun so the cloud field you fall THROUGH occludes it into real shafts of      */
/*  light. Additive + emissive so the existing Bloom turns it into a glow.       */
/* -------------------------------------------------------------------------- */
const SHAFT_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SHAFT_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uStrength;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p);
    float a = atan(p.y, p.x);
    // Crisp radial spokes, slowly turning, with a softer harmonic layered in.
    float rays = 0.5 + 0.5 * sin(a * 16.0 + sin(a * 6.0 + uTime * 0.18) * 1.4 + uTime * 0.05);
    rays = pow(rays, 3.0);
    float core = smoothstep(0.5, 0.0, r);          // luminous centre
    float falloff = smoothstep(0.5, 0.04, r);       // fade to the rim
    // Rays carry the look; the core stays restrained so Heaven keeps its blue.
    float intensity = core * 0.8 + rays * falloff * 1.0;
    float alpha = intensity * smoothstep(0.5, 0.0, r) * uStrength;
    // Push into HDR (>1) so the Bloom luminance threshold catches the shafts.
    gl_FragColor = vec4(uColor * (1.15 + core * 0.85), alpha);
  }
`;

function LightShaft({ state, fx, calm }: { state: SkyState; fx: FxState; calm: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uStrength: { value: 0 },
      uColor: { value: new THREE.Color("#fff3d0") },
    }),
    []
  );

  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    const u = (m.material as THREE.ShaderMaterial).uniforms;
    u.uTime.value += Math.min(delta, 0.05) * (calm ? 0.25 : 1);
    // On the Descent: brightest at the very top, gone by the first third. On
    // the climbing journeys it is the light waiting at the END.
    const strength = fx.shaft;
    u.uStrength.value = strength;
    // Tint with the sun so the radiance stays in chromatic sync with the sky.
    u.uColor.value.copy(state.sun).lerp(state.light, 0.4);

    m.visible = strength > 0.01;
    // Sit at the sun and billboard toward the camera so the shafts always
    // fan across the view; the clouds between occlude them into god-rays.
    m.position.set(7, state.sunY, -32);
    m.quaternion.copy(camera.quaternion);
  });

  return (
    <mesh ref={ref} scale={58} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={SHAFT_VERT}
        fragmentShader={SHAFT_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Well of Fire — the descent's dread bookend. A turbulent wall of flame wells */
/*  up from below/ahead, fading in over the final third and pulling its hot/    */
/*  cool colours from the palette's ground & horizon. Billboarded below the     */
/*  look line (like the embers) so it always frames as fire rising to meet you. */
/* -------------------------------------------------------------------------- */
const LAVA_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LAVA_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uStrength;
  uniform vec3 uHot;
  uniform vec3 uCool;
  varying vec2 vUv;
  void main() {
    float up = vUv.y;                                  // 0 at the base, 1 at the top
    // Licking flame tongues from two beating sine bands.
    float flame = (0.5 + 0.5 * sin(vUv.x * 12.0 + uTime * 1.5))
                * (0.5 + 0.5 * sin(vUv.x * 7.0 - uTime * 1.1 + up * 4.0));
    float body = smoothstep(1.0, 0.0, up);             // bright base, fades upward
    float edge = body * (0.55 + 0.45 * flame);
    vec3 col = mix(uHot, uCool, up * 0.85);
    float sides = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
    float alpha = edge * sides * uStrength;
    // HDR-hot at the base so the flame crosses the Bloom threshold and glows.
    gl_FragColor = vec4(col * (1.2 + body * 1.4), alpha);
  }
`;

function LavaGlow({ state, fx, calm }: { state: SkyState; fx: FxState; calm: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uStrength: { value: 0 },
      uHot: { value: new THREE.Color("#ff6a1f") },
      uCool: { value: new THREE.Color("#7a1a08") },
    }),
    []
  );

  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    const u = (m.material as THREE.ShaderMaterial).uniforms;
    u.uTime.value += Math.min(delta, 0.05) * (calm ? 0.3 : 1);
    const strength = fx.lava;
    u.uStrength.value = strength;
    u.uHot.value.copy(state.ground);
    u.uCool.value.copy(state.horizon);

    m.visible = strength > 0.01;
    // Anchor below and ahead of the camera so the fire rises to meet you.
    m.position.set(camera.position.x, camera.position.y - 11, camera.position.z - 15);
    m.quaternion.copy(camera.quaternion);
  });

  return (
    <mesh ref={ref} scale={44} renderOrder={2} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={LAVA_VERT}
        fragmentShader={LAVA_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Lens flare — a camera artifact that sells the sun as a real light source.   */
/*  Additive "ghosts" march from the sun's screen position through the centre   */
/*  (and out the far side), warm near the sun, cooling as they cross. The core  */
/*  halo blooms brighter as the cursor nears the light. Lives through Heaven &   */
/*  day, fades before Hell so it reads as divine glare. A pure screen-space      */
/*  overlay (depthTest off, drawn last).                                         */
/* -------------------------------------------------------------------------- */
const FLARE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FLARE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uRing;   // 0 = soft disc, 1 = thin ring
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;          // 0 centre .. 1 edge
    float disc = smoothstep(1.0, 0.0, r);
    float ring = smoothstep(0.07, 0.0, abs(r - 0.8));
    float a = mix(disc * disc, ring, uRing) * uOpacity;
    gl_FragColor = vec4(uColor, a);
  }
`;

// Ghost layout along the sun→centre axis. k>0 sits between sun and centre,
// k<0 mirrors out the opposite side; tint 0=warm sun, 1=cool. Deterministic.
const FLARE_GHOSTS = [
  { k: 1.0, scale: 2.2, opacity: 0.55, ring: 0, tint: 0.0 }, // bright core halo at the sun
  { k: 1.0, scale: 4.6, opacity: 0.16, ring: 1, tint: 0.1 }, // wide outer ring at the sun
  { k: 0.62, scale: 0.7, opacity: 0.32, ring: 0, tint: 0.3 },
  { k: 0.42, scale: 1.3, opacity: 0.18, ring: 1, tint: 0.55 },
  { k: 0.15, scale: 0.5, opacity: 0.28, ring: 0, tint: 0.4 },
  { k: -0.25, scale: 0.9, opacity: 0.18, ring: 0, tint: 0.7 },
  { k: -0.6, scale: 1.5, opacity: 0.14, ring: 1, tint: 0.5 },
  { k: -1.0, scale: 0.6, opacity: 0.24, ring: 0, tint: 0.85 },
];

function LensFlare({ state, fx }: { state: SkyState; fx: FxState }) {
  const { camera } = useThree();
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const sunNdc = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const cool = useMemo(() => new THREE.Color("#bcd9ff"), []);
  const uniformsList = useMemo(
    () =>
      FLARE_GHOSTS.map((g) => ({
        uColor: { value: new THREE.Color() },
        uOpacity: { value: 0 },
        uRing: { value: g.ring },
      })),
    []
  );

  // Project an NDC point onto a plane `dist` units in front of the camera.
  const place = (obj: THREE.Object3D, x: number, y: number, dist: number) => {
    dir.set(x, y, 0.5).unproject(camera).sub(camera.position).normalize();
    obj.position.copy(camera.position).addScaledVector(dir, dist);
  };

  useFrame(() => {
    // Project the sun to screen space; bail if it's behind the camera.
    sunNdc.set(7, state.sunY, -32).project(camera);
    const inFront = sunNdc.z < 1;
    const strength = inFront ? fx.flare : 0;

    // Cursor proximity to the sun (pointer.y is DOM y-down → flip to NDC y-up).
    const px = pointer.x;
    const py = -pointer.y;
    const d = Math.hypot(px - sunNdc.x, py - sunNdc.y);
    const near = THREE.MathUtils.clamp(1 - d / 1.2, 0, 1);

    for (let i = 0; i < FLARE_GHOSTS.length; i++) {
      const g = FLARE_GHOSTS[i];
      const m = meshes.current[i];
      if (!m) continue;
      if (strength <= 0.01) {
        m.visible = false;
        continue;
      }
      m.visible = true;
      place(m, sunNdc.x * g.k + px * 0.03, sunNdc.y * g.k + py * 0.03, 9.5 + i * 0.03);
      m.quaternion.copy(camera.quaternion);
      const u = (m.material as THREE.ShaderMaterial).uniforms;
      u.uColor.value.copy(state.sun).lerp(cool, g.tint);
      let op = g.opacity * strength;
      if (g.k === 1 && g.ring === 0) op *= 0.7 + near * 0.7; // core reacts to the cursor
      u.uOpacity.value = op;
    }
  });

  return (
    <>
      {FLARE_GHOSTS.map((g, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          scale={g.scale}
          renderOrder={10}
          visible={false}
          frustumCulled={false}
        >
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            uniforms={uniformsList[i]}
            vertexShader={FLARE_VERT}
            fragmentShader={FLARE_FRAG}
            transparent
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
            fog={false}
          />
        </mesh>
      ))}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  EEG monitor — the Science set-piece. A clinical heart-monitor trace sweeps   */
/*  across the mid-descent (the "what happens when the heart stops" zone): a     */
/*  phosphor PQRST heartbeat in cold cyan, fading in over the Science playlist   */
/*  and out before Hell. Bloomed so the trace truly glows like a CRT monitor.    */
/* -------------------------------------------------------------------------- */
const EEG_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const EEG_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uStrength;
  uniform float uAmp;     // 1 = beating, 0 = flatline (the Evidence page)
  uniform vec3 uColor;
  varying vec2 vUv;

  // A stylised PQRST heartbeat as a function of phase.
  float beat(float x) {
    float ph = fract(x);
    float p = exp(-pow((ph - 0.30) * 16.0, 2.0)) * 0.12;
    float q = -exp(-pow((ph - 0.45) * 46.0, 2.0)) * 0.18;
    float r = exp(-pow((ph - 0.50) * 34.0, 2.0)) * 0.90;
    float s = -exp(-pow((ph - 0.55) * 46.0, 2.0)) * 0.28;
    float t = exp(-pow((ph - 0.74) * 12.0, 2.0)) * 0.18;
    return p + q + r + s + t;
  }

  void main() {
    float sig = beat(vUv.x * 3.0) * uAmp;
    float centerY = 0.5 + sig * 0.34;
    float d = abs(vUv.y - centerY);

    // A sweep head races left→right; the trace glows brightest just behind it
    // and fades like phosphor, exactly like a hospital monitor.
    float sweep = fract(uTime * 0.22);
    float behind = fract(sweep - vUv.x);
    float phosphor = smoothstep(1.0, 0.0, behind);
    float line = smoothstep(0.022, 0.0, d) * phosphor;
    float head = smoothstep(0.012, 0.0, abs(vUv.x - sweep));

    float glow = line * 1.4 + head * 0.8;
    // Soft-feather the panel edges so there's no hard rectangle.
    float frame = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x)
                * smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
    float alpha = glow * frame * uStrength;
    // The trace runs HDR-hot so the Bloom pass gives it a true phosphor glow.
    gl_FragColor = vec4(uColor * (1.0 + glow * 1.6), alpha);
  }
`;

function EEGMonitor({ state, fx, calm }: { state: SkyState; fx: FxState; calm: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const dir = useMemo(() => new THREE.Vector3(), []);
  const clinical = useMemo(() => new THREE.Color("#7fe9ff"), []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uStrength: { value: 0 },
      uAmp: { value: 1 },
      uColor: { value: new THREE.Color("#7fe9ff") },
    }),
    []
  );

  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    const u = (m.material as THREE.ShaderMaterial).uniforms;
    u.uTime.value += Math.min(delta, 0.05) * (calm ? 0.4 : 1);
    // On the Descent: a bump across the Science zone. On the Evidence page the
    // same monitor opens the page, beating, then flatlines as you scroll.
    const strength = fx.eeg;
    u.uStrength.value = strength;
    u.uAmp.value = fx.eegAmp;
    // The descent slightly tints the monitor without losing its clinical cast.
    u.uColor.value.copy(clinical).lerp(state.light, 0.15);

    m.visible = strength > 0.01;
    // Float it ahead of and just below the look line, billboarded to camera.
    dir.set(0, -0.12, 0.5).unproject(camera).sub(camera.position).normalize();
    m.position.copy(camera.position).addScaledVector(dir, 13);
    m.quaternion.copy(camera.quaternion);
  });

  return (
    <mesh ref={ref} visible={false} scale={[9, 3, 1]} renderOrder={4} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={EEG_VERT}
        fragmentShader={EEG_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Interactions — the sky reacts to you. A cursor-following light brightens    */
/*  the clouds where you point.                                                 */
/*                                                                              */
/*  This used to ALSO fire an expanding shockwave ring on every click/tap (a    */
/*  6-slot pool of additive HDR rings). Removed 2026-08-21 at the stakeholder's */
/*  direction: it fired on every interaction — including taps on video cards    */
/*  and nav links — and pulled the eye away from the content. The pointerdown   */
/*  listener and the ripple queue that fed it are gone too (CloudCanvas.tsx,    */
/*  lib/scroll.ts); don't re-add one without re-adding the other.               */
/* -------------------------------------------------------------------------- */
function Interactions({ state }: { state: SkyState }) {
  const { camera } = useThree();
  const light = useRef<THREE.PointLight>(null);
  const dir = useMemo(() => new THREE.Vector3(), []);

  // Project an NDC point onto a plane `dist` units in front of the camera.
  const place = (obj: THREE.Object3D, x: number, y: number, dist: number) => {
    dir.set(x, y, 0.5).unproject(camera).sub(camera.position).normalize();
    obj.position.copy(camera.position).addScaledVector(dir, dist);
  };

  useFrame(() => {
    // Cursor light — note pointer.y is DOM y-down, so flip it for NDC.
    if (light.current) {
      place(light.current, pointer.x, -pointer.y, 11);
      light.current.color.copy(state.light);
    }
  });

  return <pointLight ref={light} intensity={2.2} distance={32} decay={2} color="#fff4d6" />;
}

/* -------------------------------------------------------------------------- */
/*  The scene: applies the journey's palette to fog/lights/sun each frame and  */
/*  flies the camera along the journey's non-linear path (travel + sway + bank */
/*  + surge toward/away).                                                      */
/* -------------------------------------------------------------------------- */

/* The sun as a soft, glowing orb (every journey except the Descent). The
   Descent's hard-edged disc is part of its approved look - a blood-red sun
   over Hell - but on the other journeys the same disc, whenever it wasn't
   bright enough to bloom, read as a flat cardboard circle sitting behind the
   page's text. This version fades to nothing at its rim (a view-angle
   falloff), so it only ever reads as light. */
const SOFT_SUN_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const SOFT_SUN_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float f = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
    float a = pow(f, 2.4);
    gl_FragColor = vec4(uColor * (0.55 + 0.9 * f), a);
  }
`;

/** How quickly the sky eases toward its target (per second). High enough that
 *  scrolling still feels direct; low enough that a page change reads as the
 *  camera flying from one world into the next rather than a hard cut. */
const SKY_EASE = 4.5;

function SkyScene({ lite, journey }: { lite: boolean; journey: JourneyId }) {
  const quality = useDeviceTier();
  const calm = !!useReducedMotion();
  const { camera, scene } = useThree();

  // `state` / `fx` are what every set-piece reads; `target*` is the journey
  // sampled at the current scroll; the former eases toward the latter.
  const state = useMemo(() => createSkyState(), []);
  const target = useMemo(() => createSkyState(), []);
  const fx = useMemo(() => createFx(), []);
  const targetFx = useMemo(() => createFx(), []);
  const primed = useRef(false);
  const lookTarget = useRef(new THREE.Vector3(0, 4, -10));
  const softSunUniforms = useMemo(() => ({ uColor: { value: new THREE.Color("#fff3d0") } }), []);

  const sunRef = useRef<THREE.Mesh>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  // One exponential fog instance for the whole scene; recoloured every frame.
  const fog = useMemo(() => new THREE.FogExp2("#cfe9ff", 0.01), []);
  useEffect(() => {
    const previous = scene.fog;
    scene.fog = fog;
    return () => {
      scene.fog = previous;
    };
  }, [scene, fog]);

  const clouds = useMemo(
    () => (lite || quality.tier === "low" ? CLOUD_FIELD.slice(0, 6) : CLOUD_FIELD),
    [lite, quality.tier]
  );

  // Near-field puff budget. Its own count rather than a slice of `quality.limit`
  // — that budget is drei's SHARED instancer allocation for <Clouds>, and
  // borrowing from it would quietly starve the volumetric field. Big billboards
  // close to the lens are fill-rate bound, so low-end devices get a thin veil
  // and a recovered (lite) context gets none at all.
  const rushCount = useMemo(() => {
    if (lite) return 0;
    if (quality.tier === "low") return 12;
    return quality.tier === "mid" ? 38 : 64;
  }, [lite, quality.tier]);

  // The story "spirit" and the starfield cost GPU time, so they are budgeted
  // per tier like everything else; the spirit only mounts on The Ascent.
  const storyCount = useMemo(() => {
    if (lite) return 1600;
    if (quality.tier === "low") return 1800;
    return quality.tier === "mid" ? 3200 : 5200;
  }, [lite, quality.tier]);
  const starCount = lite ? 400 : quality.tier === "low" ? 500 : quality.tier === "mid" ? 900 : 1400;

  useFrame((st, delta) => {
    const d = Math.min(delta, 0.05);
    const sp = THREE.MathUtils.clamp(scrollProgress.get(), 0, 1);
    const J = JOURNEYS[journey];
    sampleSky(sp, target, J.stops);
    J.fx(sp, targetFx);
    if (!primed.current) {
      copySky(state, target);
      Object.assign(fx, targetFx);
      primed.current = true;
    } else {
      const a = 1 - Math.exp(-SKY_EASE * d);
      dampSky(state, target, a);
      fx.shaft += (targetFx.shaft - fx.shaft) * a;
      fx.lava += (targetFx.lava - fx.lava) * a;
      fx.eeg += (targetFx.eeg - fx.eeg) * a;
      fx.eegAmp += (targetFx.eegAmp - fx.eegAmp) * a;
      fx.flare += (targetFx.flare - fx.flare) * a;
      fx.rush += (targetFx.rush - fx.rush) * a;
      fx.ash += (targetFx.ash - fx.ash) * a;
    }
    const cam = J.camera;

    // --- Atmosphere ---------------------------------------------------------
    fog.color.copy(state.horizon);
    fog.density = state.fogDensity;
    if (ambientRef.current) ambientRef.current.intensity = state.ambient;
    if (keyRef.current) {
      keyRef.current.color.copy(state.light);
      keyRef.current.intensity = state.lightIntensity;
      keyRef.current.position.set(6, state.sunY + 5, 6);
    }
    if (sunRef.current) {
      sunRef.current.position.set(7, state.sunY, -32);
      const mat = sunRef.current.material as THREE.MeshBasicMaterial | THREE.ShaderMaterial;
      // Push the sun into HDR (>1) so the Bloom luminance threshold catches it
      // while the clouds (which sit near 1.0) stay below and don't wash out.
      // Kept modest — at ~3x the halo swallows the whole Heaven sky.
      const k = 0.85 + state.sunIntensity * 0.55;
      if ("uniforms" in mat && mat.uniforms.uColor) {
        mat.uniforms.uColor.value.copy(state.sun).multiplyScalar(k);
        // The soft orb loses its outer rim to the falloff; draw it larger so
        // its visible glow matches the disc's footprint.
        sunRef.current.scale.setScalar((2.2 + state.sunIntensity * 1.6) * 1.35);
      } else {
        (mat as THREE.MeshBasicMaterial).color.copy(state.sun).multiplyScalar(k);
        sunRef.current.scale.setScalar(2.2 + state.sunIntensity * 1.6);
      }
    }

    // --- Camera rig ---------------------------------------------------------
    if (calm) {
      // Reduced motion: still travel THROUGH the cloud field as you scroll
      // (it's user-driven, so a11y-safe) plus the full journey colour — but no
      // autonomous banking, surge, or idle drift that could trigger vestibular
      // discomfort. (On the Descent this is exactly the original 6 -> -12.)
      const ty = THREE.MathUtils.lerp(cam.y0 * 0.75, cam.y1 * 0.75, sp);
      camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.6, 2, d);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, ty, 2.5, d);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, 14, 2, d);
      lookTarget.current.set(pointer.x * 1.5, ty - cam.lookDown * (2 / 3), -10);
      camera.lookAt(lookTarget.current);
      camera.rotation.z = 0;
      return;
    }

    const t = st.clock.elapsedTime;

    // Travel through the cloud field; sway sideways and surge toward/away so
    // the journey reads as anything but a straight line.
    const ty = THREE.MathUtils.lerp(cam.y0, cam.y1, sp);
    const tx = Math.sin(sp * Math.PI * cam.swayFreq) * cam.sway + pointer.x * 1.6;
    const tz =
      12 + Math.sin(sp * Math.PI * cam.surgeFreq) * cam.surge + Math.cos(sp * Math.PI * 1.3) * 2;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, tx, 3, d);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, ty, 3, d);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, tz, 3, d);

    // Aim slightly ahead (down on the Descent, up on the climbs), with idle
    // drift + cursor influence.
    const lookX = Math.sin(sp * Math.PI * cam.swayFreq + 0.7) * cam.sway * 0.5 + pointer.x * 2;
    const lookY = ty - cam.lookDown - pointer.y * 2 + Math.sin(t * 0.3) * 0.5;
    const lookZ = tz - 12;
    lookTarget.current.x = THREE.MathUtils.damp(lookTarget.current.x, lookX, 3, d);
    lookTarget.current.y = THREE.MathUtils.damp(lookTarget.current.y, lookY, 3, d);
    lookTarget.current.z = THREE.MathUtils.damp(lookTarget.current.z, lookZ, 3, d);
    camera.lookAt(lookTarget.current);

    // Bank into the sideways sway for a sense of flight.
    camera.rotation.z = Math.cos(sp * Math.PI * cam.swayFreq) * cam.bank - pointer.x * 0.03;
  });

  return (
    <>
      <SkyDome state={state} />
      <Starfield count={starCount} state={state} calm={calm} />

      <ambientLight ref={ambientRef} intensity={1.7} />
      <directionalLight ref={keyRef} position={[6, 12, 6]} intensity={2.6} color="#fff6e0" />
      <directionalLight position={[-8, -6, -6]} intensity={0.5} color="#bcd9ff" />

      {/* Sun / fire-source — emissive sphere, pushed past 1.0 in useFrame so
          the Bloom threshold turns it (and not the clouds) into a glow. */}
      <mesh ref={sunRef} position={[7, 9, -32]}>
        <sphereGeometry args={[3, 32, 32]} />
        {journey === "descent" ? (
          <meshBasicMaterial key="disc" color="#fff3d0" toneMapped={false} fog={false} />
        ) : (
          <shaderMaterial
            key="soft"
            uniforms={softSunUniforms}
            vertexShader={SOFT_SUN_VERT}
            fragmentShader={SOFT_SUN_FRAG}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            fog={false}
          />
        )}
      </mesh>

      <Clouds
        material={THREE.MeshLambertMaterial}
        limit={quality.limit}
        range={quality.limit}
        frustumCulled={false}
        // Self-hosted copy of drei's cloud sprite — the default is fetched from
        // a third-party CDN at runtime, and when that request fails the whole
        // canvas dies to the error boundary. Never ship a CDN dependency here.
        texture="/textures/cloud.png"
      >
        {clouds.map((cl, i) => (
          <Cloud
            key={i}
            seed={cl.seed}
            segments={lite ? 14 : quality.segments}
            bounds={cl.bounds}
            volume={cl.volume}
            position={cl.position}
            scale={cl.scale}
            opacity={cl.opacity}
            color="#ffffff"
            // Even under reduced motion, keep a slow, non-vestibular billow so
            // the sky still breathes (the descent colour also still animates).
            speed={calm ? 0.05 : cl.speed}
            growth={4}
            fade={40}
          />
        ))}
      </Clouds>

      {/* The near-field layer the camera flies INTO — streams toward the lens
          with scroll. Drawn after the world (renderOrder 1) so it occludes the
          god-rays into real shafts, and before the additive set-pieces so fire
          and flare still read through it. */}
      <CloudRush count={rushCount} state={state} fx={fx} calm={calm} />

      {/* Thematic set-pieces — all emissive/additive, with colours pushed into
          HDR (>1) so only they cross the Bloom luminance threshold and glow.
          Skipped in lite recovery mode (cheap shader planes/points). Each
          one's presence comes from the journey's fx curves. */}
      {!lite && <LightShaft state={state} fx={fx} calm={calm} />}
      {!lite && <LavaGlow state={state} fx={fx} calm={calm} />}
      {!lite && <LensFlare state={state} fx={fx} />}
      {!lite && <EEGMonitor state={state} fx={fx} calm={calm} />}
      <Embers count={lite ? 0 : quality.embers} state={state} />
      <Interactions state={state} />

      {/* The Ascent's particle "spirit". It IS that page's visual narrative,
          so unlike the ornamental set-pieces it survives lite mode (with a
          smaller budget). Mounted only on that journey. */}
      {journey === "ascent" && <StoryParticles count={storyCount} calm={calm} />}
    </>
  );
}

type SkyCanvasProps = {
  /** "Lite" mode after a context loss: no postprocessing/embers, DPR 1. */
  lite?: boolean;
  /** Which page's sky to fly (lib/journeys.ts). */
  journey?: JourneyId;
  /** Notified when the WebGL context is lost (the host handles recovery). */
  onContextLost?: () => void;
};

export default function SkyCanvas({ lite = false, journey = "descent", onContextLost }: SkyCanvasProps) {
  const quality = useDeviceTier();

  // Pause the render loop while the tab is hidden — saves GPU/battery and eases
  // driver stress (a contributor to context loss on flaky Windows GPUs).
  const [active, setActive] = useState(true);
  useEffect(() => {
    const onVisibility = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // After a context loss, drop everything expensive so the rebuilt context is
  // far more likely to survive.
  const effects = !lite && quality.effects;
  const dpr: [number, number] = lite ? [1, 1] : quality.dpr;
  const antialias = !lite && !effects && quality.antialias;

  return (
    <Canvas
      flat
      frameloop={active ? "always" : "never"}
      dpr={dpr}
      camera={{ position: [0, 8, 14], fov: 55, near: 0.1, far: 200 }}
      gl={{
        alpha: true,
        // When the EffectComposer runs it does its own AA via multisampling,
        // so skip the canvas-level MSAA to avoid paying for both.
        antialias,
        // "default" (not "high-performance") avoids forcing a discrete-GPU
        // switch on hybrid laptops — a common cause of WebGL context loss on
        // Windows. Stability over raw throughput for a background sky.
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
      }}
      style={{ background: "transparent" }}
      onCreated={({ gl }) => {
        const canvas = gl.domElement;
        // onCreated can run more than once against the same canvas (e.g. under
        // StrictMode's double-mount); never register duplicate listeners or a
        // single loss gets double-counted against the recovery budget.
        if (canvas.dataset.lossHandled) return;
        canvas.dataset.lossHandled = "1";
        canvas.addEventListener(
          "webglcontextlost",
          (e) => {
            e.preventDefault();
            console.warn("[SkyCanvas] WebGL context lost.");
            onContextLost?.();
          },
          false
        );
        canvas.addEventListener("webglcontextrestored", () => {
          console.info("[SkyCanvas] WebGL context restored.");
        });
      }}
    >
      <SkyScene lite={lite} journey={journey} />

      {effects && (
        <EffectComposer multisampling={quality.multisampling}>
          {/* Threshold-based selectivity: the composer renders into an HDR
              (half-float) buffer, and only the emissives pushed past 1.0 (sun,
              shafts, lava, EEG, embers, rings) cross the luminance threshold —
              the white clouds sit at ~1.0 and stay below it, so they no longer
              wash out. (The previous <Selection>/<SelectiveBloom> approach
              re-created the bloom pass in a render loop and crashed the WebGL
              context — do not reintroduce it.) */}
          <Bloom
            intensity={0.7}
            luminanceThreshold={1.05}
            luminanceSmoothing={0.25}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.3} darkness={0.5} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
