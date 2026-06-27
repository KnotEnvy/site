"use client";

/* This is the WebGL render-loop file. react-three-fiber's whole model is to
   mutate three.js objects (camera, scene, fog, materials, shader uniforms)
   directly inside useFrame every tick — that runs outside React's
   render/reconciliation, so the React Compiler "immutability" rule (which
   assumes values returned from hooks stay frozen) does not apply here. */
/* eslint-disable react-hooks/immutability */

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Clouds, Cloud } from "@react-three/drei";
import {
  EffectComposer,
  SelectiveBloom,
  Vignette,
  Selection,
  Select,
} from "@react-three/postprocessing";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { scrollProgress, pointer, ripples } from "@/lib/scroll";
import { useDeviceTier } from "@/lib/useDeviceTier";
import { createSkyState, sampleSky, type SkyState } from "@/lib/palette";

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
    uniforms.uTop.value.copy(state.top);
    uniforms.uHorizon.value.copy(state.horizon);
    uniforms.uGround.value.copy(state.ground);
    if (ref.current) ref.current.position.copy(camera.position);
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
  varying float vAlpha;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d);
    if (r > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, r);
    vec3 col = mix(uColorCool, uColorHot, soft);
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
      uColorHot: { value: new THREE.Color("#ffd58a") },
      uColorCool: { value: new THREE.Color("#ff3b14") },
    }),
    []
  );

  useFrame((_, delta) => {
    uniforms.uTime.value += Math.min(delta, 0.05);
    uniforms.uOpacity.value = state.ember;
    const p = ref.current;
    if (p) {
      // Surround the viewer: anchor the column below the camera so embers rise past it.
      p.position.set(camera.position.x, camera.position.y - 18, camera.position.z - 2);
    }
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
    float intensity = core * 1.3 + rays * falloff * 0.85;
    float alpha = intensity * smoothstep(0.5, 0.0, r) * uStrength;
    // Push past 1.0 so the Bloom threshold catches the brightest core.
    gl_FragColor = vec4(uColor * (1.0 + core * 0.8), alpha);
  }
`;

function LightShaft({ state, calm }: { state: SkyState; calm: boolean }) {
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
    uniforms.uTime.value += Math.min(delta, 0.05) * (calm ? 0.25 : 1);
    const sp = THREE.MathUtils.clamp(scrollProgress.get(), 0, 1);
    // Brightest at the very top; gone by the first third of the descent.
    const strength = 1 - THREE.MathUtils.smoothstep(sp, 0.04, 0.34);
    uniforms.uStrength.value = strength;
    // Tint with the sun so the radiance stays in chromatic sync with the sky.
    uniforms.uColor.value.copy(state.sun).lerp(state.light, 0.4);

    const m = ref.current;
    if (m) {
      m.visible = strength > 0.01;
      // Sit at the sun and billboard toward the camera so the shafts always
      // fan across the view; the clouds between occlude them into god-rays.
      m.position.set(7, state.sunY, -32);
      m.quaternion.copy(camera.quaternion);
    }
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
    gl_FragColor = vec4(col * (1.0 + body * 0.6), alpha);
  }
`;

function LavaGlow({ state, calm }: { state: SkyState; calm: boolean }) {
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
    uniforms.uTime.value += Math.min(delta, 0.05) * (calm ? 0.3 : 1);
    const sp = THREE.MathUtils.clamp(scrollProgress.get(), 0, 1);
    const strength = THREE.MathUtils.smoothstep(sp, 0.62, 0.92);
    uniforms.uStrength.value = strength;
    uniforms.uHot.value.copy(state.ground);
    uniforms.uCool.value.copy(state.horizon);

    const m = ref.current;
    if (m) {
      m.visible = strength > 0.01;
      // Anchor below and ahead of the camera so the fire rises to meet you.
      m.position.set(camera.position.x, camera.position.y - 11, camera.position.z - 15);
      m.quaternion.copy(camera.quaternion);
    }
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

function LensFlare({ state }: { state: SkyState }) {
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
    const sp = THREE.MathUtils.clamp(scrollProgress.get(), 0, 1);
    // Project the sun to screen space; bail if it's behind the camera.
    sunNdc.set(7, state.sunY, -32).project(camera);
    const inFront = sunNdc.z < 1;
    const heaven = 1 - THREE.MathUtils.smoothstep(sp, 0.1, 0.55);
    const strength = inFront ? heaven : 0;

    // Cursor proximity to the sun (pointer.y is DOM y-down → flip to NDC y-up).
    const px = pointer.x;
    const py = -pointer.y;
    const d = Math.hypot(px - sunNdc.x, py - sunNdc.y);
    const near = THREE.MathUtils.clamp(1 - d / 1.2, 0, 1);

    for (let i = 0; i < FLARE_GHOSTS.length; i++) {
      const g = FLARE_GHOSTS[i];
      const m = meshes.current[i];
      const u = uniformsList[i];
      if (!m) continue;
      if (strength <= 0.01) {
        m.visible = false;
        continue;
      }
      m.visible = true;
      place(m, sunNdc.x * g.k + px * 0.03, sunNdc.y * g.k + py * 0.03, 9.5 + i * 0.03);
      m.quaternion.copy(camera.quaternion);
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
    float sig = beat(vUv.x * 3.0);
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
    gl_FragColor = vec4(uColor * (1.0 + glow), alpha);
  }
`;

function EEGMonitor({ state, calm }: { state: SkyState; calm: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const dir = useMemo(() => new THREE.Vector3(), []);
  const clinical = useMemo(() => new THREE.Color("#7fe9ff"), []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uStrength: { value: 0 },
      uColor: { value: new THREE.Color("#7fe9ff") },
    }),
    []
  );

  useFrame((_, delta) => {
    uniforms.uTime.value += Math.min(delta, 0.05) * (calm ? 0.4 : 1);
    const sp = THREE.MathUtils.clamp(scrollProgress.get(), 0, 1);
    // Present across the Science zone only — a bump in the middle of the descent.
    const strength =
      THREE.MathUtils.smoothstep(sp, 0.34, 0.44) *
      (1 - THREE.MathUtils.smoothstep(sp, 0.6, 0.7));
    uniforms.uStrength.value = strength;
    // The descent slightly tints the monitor without losing its clinical cast.
    uniforms.uColor.value.copy(clinical).lerp(state.light, 0.15);

    const m = ref.current;
    if (m) {
      m.visible = strength > 0.01;
      // Float it ahead of and just below the look line, billboarded to camera.
      dir.set(0, -0.12, 0.5).unproject(camera).sub(camera.position).normalize();
      m.position.copy(camera.position).addScaledVector(dir, 13);
      m.quaternion.copy(camera.quaternion);
    }
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
/*  the clouds where you point, and every click/tap fires an expanding          */
/*  shockwave ring (colour pulled from the current descent palette).            */
/* -------------------------------------------------------------------------- */
const BURST_POOL = 6;
const BURST_LIFE = 1100; // ms

function Interactions({ state }: { state: SkyState }) {
  const { camera } = useThree();
  const light = useRef<THREE.PointLight>(null);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const slots = useRef(
    Array.from({ length: BURST_POOL }, () => ({ active: false, start: 0, x: 0, y: 0 }))
  );

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

    // Drain queued ripples into any free pool slots.
    while (ripples.length) {
      const r = ripples.shift();
      if (!r) break;
      const slot = slots.current.find((s) => !s.active);
      if (!slot) break;
      slot.active = true;
      slot.start = r.start;
      slot.x = r.x;
      slot.y = r.y;
    }

    const now = performance.now();
    for (let i = 0; i < BURST_POOL; i++) {
      const s = slots.current[i];
      const m = meshes.current[i];
      if (!m) continue;
      if (!s.active) {
        m.visible = false;
        continue;
      }
      const age = (now - s.start) / BURST_LIFE;
      if (age >= 1) {
        s.active = false;
        m.visible = false;
        continue;
      }
      m.visible = true;
      place(m, s.x, s.y, 12);
      m.quaternion.copy(camera.quaternion); // billboard toward camera
      m.scale.setScalar(0.6 + age * 7);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.color.copy(state.sun);
      mat.opacity = (1 - age) * 0.7;
    }
  });

  return (
    <>
      <pointLight ref={light} intensity={2.2} distance={32} decay={2} color="#fff4d6" />
      {Array.from({ length: BURST_POOL }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          visible={false}
          renderOrder={3}
        >
          <ringGeometry args={[0.66, 1, 64]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0}
            toneMapped={false}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            fog={false}
          />
        </mesh>
      ))}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  The scene: applies the palette to fog/lights/sun each frame and flies the  */
/*  camera down a non-linear path (descend + bank sideways + surge toward/away)*/
/* -------------------------------------------------------------------------- */
function SkyScene({ lite }: { lite: boolean }) {
  const quality = useDeviceTier();
  const calm = !!useReducedMotion();
  const { camera, scene } = useThree();

  const state = useMemo(() => createSkyState(), []);
  const lookTarget = useRef(new THREE.Vector3(0, 4, -10));

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

  useFrame((st, delta) => {
    const d = Math.min(delta, 0.05);
    const sp = THREE.MathUtils.clamp(scrollProgress.get(), 0, 1);
    sampleSky(sp, state);

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
      const mat = sunRef.current.material as THREE.MeshBasicMaterial;
      mat.color.copy(state.sun);
      sunRef.current.scale.setScalar(2.2 + state.sunIntensity * 1.6);
    }

    // --- Camera rig ---------------------------------------------------------
    if (calm) {
      // Reduced motion: still descend THROUGH the cloud field as you scroll
      // (it's user-driven, so a11y-safe) plus the full descent colour — but no
      // autonomous banking, surge, or idle drift that could trigger vestibular
      // discomfort.
      const ty = THREE.MathUtils.lerp(6, -12, sp);
      camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.6, 2, d);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, ty, 2.5, d);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, 14, 2, d);
      lookTarget.current.set(pointer.x * 1.5, ty - 2, -10);
      camera.lookAt(lookTarget.current);
      camera.rotation.z = 0;
      return;
    }

    const t = st.clock.elapsedTime;

    // Descend through the cloud field; sway sideways and surge toward/away so
    // the journey reads as anything but a straight line.
    const ty = THREE.MathUtils.lerp(8, -16, sp);
    const tx = Math.sin(sp * Math.PI * 2.5) * 6 + pointer.x * 1.6;
    const tz = 12 + Math.sin(sp * Math.PI * 3.0) * 5 + Math.cos(sp * Math.PI * 1.3) * 2;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, tx, 3, d);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, ty, 3, d);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, tz, 3, d);

    // Aim slightly ahead and down, with idle drift + cursor influence.
    const lookX = Math.sin(sp * Math.PI * 2.5 + 0.7) * 3 + pointer.x * 2;
    const lookY = ty - 3 - pointer.y * 2 + Math.sin(t * 0.3) * 0.5;
    const lookZ = tz - 12;
    lookTarget.current.x = THREE.MathUtils.damp(lookTarget.current.x, lookX, 3, d);
    lookTarget.current.y = THREE.MathUtils.damp(lookTarget.current.y, lookY, 3, d);
    lookTarget.current.z = THREE.MathUtils.damp(lookTarget.current.z, lookZ, 3, d);
    camera.lookAt(lookTarget.current);

    // Bank into the sideways sway for a sense of flight.
    camera.rotation.z = Math.cos(sp * Math.PI * 2.5) * 0.1 - pointer.x * 0.03;
  });

  return (
    <>
      <SkyDome state={state} />

      <ambientLight ref={ambientRef} intensity={1.7} />
      <directionalLight ref={keyRef} position={[6, 12, 6]} intensity={2.6} color="#fff6e0" />
      <directionalLight position={[-8, -6, -6]} intensity={0.5} color="#bcd9ff" />

      {/* Sun / fire-source — emissive sphere. Wrapped in <Select> so the
          SelectiveBloom pass turns it (and only it, not the clouds) into a glow. */}
      <Select enabled>
        <mesh ref={sunRef} position={[7, 9, -32]}>
          <sphereGeometry args={[3, 24, 24]} />
          <meshBasicMaterial color="#fff3d0" toneMapped={false} fog={false} />
        </mesh>
      </Select>

      <Clouds
        material={THREE.MeshLambertMaterial}
        limit={quality.limit}
        range={quality.limit}
        frustumCulled={false}
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

      {/* Thematic set-pieces — all emissive/additive, so they're grouped under
          <Select> to be the only things the SelectiveBloom pass makes glow.
          Skipped in lite recovery mode (cheap shader planes/points). */}
      <Select enabled>
        {!lite && <LightShaft state={state} calm={calm} />}
        {!lite && <LavaGlow state={state} calm={calm} />}
        {!lite && <LensFlare state={state} />}
        {!lite && <EEGMonitor state={state} calm={calm} />}
        <Embers count={lite ? 0 : quality.embers} state={state} />
        <Interactions state={state} />
      </Select>
    </>
  );
}

type SkyCanvasProps = {
  /** "Lite" mode after a context loss: no postprocessing/embers, DPR 1. */
  lite?: boolean;
  /** Notified when the WebGL context is lost (the host handles recovery). */
  onContextLost?: () => void;
};

export default function SkyCanvas({ lite = false, onContextLost }: SkyCanvasProps) {
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
      {/* <Selection> wraps BOTH the scene and the composer so the SelectiveBloom
          pass can see the objects wrapped in <Select> inside SkyScene. */}
      <Selection>
        <SkyScene lite={lite} />

        {effects && (
          <EffectComposer multisampling={quality.multisampling}>
            {/* Only the <Select>-wrapped emissives (sun, shafts, flare, lava,
                EEG, embers, rings) reach this pass — so the clouds no longer
                bloom. A low threshold lets all of those glow; modest intensity
                keeps the brightest cores from blowing out. */}
            <SelectiveBloom
              intensity={0.9}
              luminanceThreshold={0.1}
              luminanceSmoothing={0.2}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.3} darkness={0.5} />
          </EffectComposer>
        )}
      </Selection>
    </Canvas>
  );
}
