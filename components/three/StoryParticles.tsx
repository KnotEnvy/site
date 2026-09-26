"use client";

/* Per SkyCanvas's hard-won rule: r3f CLONES a `uniforms` object passed as a
   JSX prop, so every per-frame uniform write goes through the material on the
   mesh ref, never through the useMemo'd object. */

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { story } from "@/lib/story";

/* -------------------------------------------------------------------------- */
/*  The Ascent's "spirit": a few thousand points of light that the story       */
/*  reshapes chapter by chapter. Every target shape is generated ONCE on the   */
/*  CPU into its own attribute; the morph between neighbouring shapes, the     */
/*  per-particle stagger, the mid-flight burst, wing beats, galactic rotation  */
/*  and the final rising release all live in the vertex shader behind a        */
/*  handful of uniforms. Zero per-particle CPU work per frame.                 */
/*                                                                             */
/*  Screen-locked in front of the camera (like the EEG set-piece) so it sits   */
/*  beside the chapter text however the camera rig banks and sways. Blending   */
/*  is chosen PER PARTICLE (see FRAG): light shapes are additive and HDR-      */
/*  bright so the threshold Bloom makes them glow; the stone heart is solid,   */
/*  so it can actually look darker than the sky behind it.                     */
/* -------------------------------------------------------------------------- */

/** Deterministic pseudo-random in [0, 1) - pure, so shapes are stable. */
function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Roughly gaussian in [-1, 1] from two hashes (sum of uniforms). */
function soft(n: number): number {
  return (hash(n) + hash(n + 17.17) + hash(n + 41.41) - 1.5) / 1.5;
}

type ShapeFn = (i: number, count: number, out: Float32Array, o: number) => void;

/** 0 - SCATTER: disconnected dust, drifting apart around where the figure
 *  will form. Kept to a loose cloud rather than filling the screen - at full
 *  width it read as a snowstorm, not as pieces of a person. */
const scatter: ShapeFn = (i, _n, out, o) => {
  const u = hash(i + 0.5) * 2 - 1;
  const th = hash(i + 1.5) * Math.PI * 2;
  const r = 0.3 + Math.cbrt(hash(i + 2.5)) * 1.25;
  const s = Math.sqrt(1 - u * u);
  out[o] = Math.cos(th) * s * r * 1.2;
  out[o + 1] = u * r * 0.95;
  out[o + 2] = Math.sin(th) * s * r * 0.7;
};

/** 1 - GALAXY: a two-armed grand-design spiral, a haze of disk stars and a
 *  bright bulge, stored in the disk plane (x, y) with thickness in z; the
 *  shader spins and tilts it. (Three straight-ish arms read as a propeller.) */
const galaxy: ShapeFn = (i, _n, out, o) => {
  const k = hash(i + 3.3);
  if (k < 0.14) {
    // Central bulge
    const r = Math.abs(soft(i + 4.4)) * 0.18;
    const a = hash(i + 5.5) * Math.PI * 2;
    out[o] = Math.cos(a) * r;
    out[o + 1] = Math.sin(a) * r;
    out[o + 2] = soft(i + 6.6) * 0.08;
    return;
  }
  if (k < 0.4) {
    // Diffuse disk: exponential falloff, no arm structure.
    const r = 0.1 - Math.log(1 - hash(i + 7.1) * 0.95) * 0.3;
    const a = hash(i + 7.4) * Math.PI * 2;
    out[o] = Math.cos(a) * Math.min(r, 1.15);
    out[o + 1] = Math.sin(a) * Math.min(r, 1.15);
    out[o + 2] = soft(i + 7.9) * 0.04;
    return;
  }
  const arm = i % 2;
  const t = Math.pow(hash(i + 7.7), 0.8);
  const r = 0.14 + t * 1.0;
  // Arm width grows outward, like real spiral arms.
  const spread = (0.05 + 0.16 * t) * soft(i + 8.8);
  const a = arm * Math.PI + Math.log(r / 0.14) * 2.6 + spread * 3.2;
  out[o] = Math.cos(a) * r + soft(i + 9.9) * 0.025;
  out[o + 1] = Math.sin(a) * r + soft(i + 10.1) * 0.025;
  out[o + 2] = soft(i + 11.1) * 0.04 * (1 - t);
};

/** 2 - HELIX: the double helix of DNA - two backbones and the base-pair rungs.
 *  Stored upright and unrotated; the shader turns it. */
const helix: ShapeFn = (i, _n, out, o) => {
  const R = 0.42;
  const TURNS = 6.2;
  const isRung = hash(i + 12.2) < 0.3;
  let h = hash(i + 13.3) * 2.3 - 1.15;
  if (isRung) h = Math.round(h * 9) / 9; // discrete base pairs
  const phase = h * TURNS;
  if (isRung) {
    const k = hash(i + 14.4) * 2 - 1;
    out[o] = Math.cos(phase) * R * k;
    out[o + 1] = h;
    out[o + 2] = Math.sin(phase) * R * k;
  } else {
    const strand = i % 2 === 0 ? 0 : Math.PI;
    out[o] = Math.cos(phase + strand) * R + soft(i + 15.5) * 0.025;
    out[o + 1] = h + soft(i + 16.6) * 0.02;
    out[o + 2] = Math.sin(phase + strand) * R + soft(i + 17.7) * 0.025;
  }
};

/** 3 - STAR: everything converges on a single point of light, with a halo. */
const star: ShapeFn = (i, _n, out, o) => {
  const halo = hash(i + 18.8) < 0.22;
  const r = halo ? 0.12 + Math.pow(hash(i + 19.9), 2) * 0.55 : Math.abs(soft(i + 20.2)) * 0.07;
  const u = hash(i + 21.1) * 2 - 1;
  const th = hash(i + 22.2) * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  out[o] = Math.cos(th) * s * r;
  out[o + 1] = u * r;
  out[o + 2] = Math.sin(th) * s * r;
};

/** 4 - HEART: the classic parametric heart, filled, with a crisp outline. */
const heart: ShapeFn = (i, _n, out, o) => {
  const t = hash(i + 23.3) * Math.PI * 2;
  const bx = (16 * Math.pow(Math.sin(t), 3)) / 17;
  const by = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17;
  const edge = hash(i + 24.4) < 0.32;
  const f = edge ? 0.97 + hash(i + 25.5) * 0.05 : Math.sqrt(hash(i + 26.6));
  out[o] = bx * f;
  out[o + 1] = by * f + 0.12;
  out[o + 2] = soft(i + 27.7) * 0.28 * (1 - f * 0.7);
};

/** 5 - BUTTERFLY: Temple Fay's butterfly curve, ray-filled from the body. */
const butterfly: ShapeFn = (i, _n, out, o) => {
  const t = hash(i + 28.8) * Math.PI * 12;
  const r = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5);
  const bx = Math.sin(t) * r;
  const by = Math.cos(t) * r;
  // A strong outline is what makes the curve read as wings; the fill is lace.
  const edge = hash(i + 29.9) < 0.58;
  const f = edge ? 0.985 + hash(i + 30.9) * 0.03 : 0.12 + 0.88 * Math.sqrt(hash(i + 30.3));
  out[o] = (bx * f) / 3.4;
  out[o + 1] = (by * f) / 3.4 - 0.32;
  out[o + 2] = soft(i + 31.1) * 0.04;
};

/** 6 - RADIANCE: the cross, with a fan of rays and a halo of light. */
const radiance: ShapeFn = (i, _n, out, o) => {
  const k = hash(i + 32.2);
  const cy = 0.34; // where the beams cross
  if (k < 0.46) {
    // The cross itself - area-weighted between the upright and the beam.
    if (hash(i + 33.3) < 0.62) {
      out[o] = (hash(i + 34.4) * 2 - 1) * 0.085;
      out[o + 1] = -1.1 + hash(i + 35.5) * 2.05;
    } else {
      out[o] = (hash(i + 36.6) * 2 - 1) * 0.62;
      out[o + 1] = cy + (hash(i + 37.7) * 2 - 1) * 0.085;
    }
    out[o + 2] = soft(i + 38.8) * 0.05;
  } else if (k < 0.82) {
    // Rays fanning out from the crossing point.
    const ray = Math.floor(hash(i + 39.9) * 28);
    const a = (ray / 28) * Math.PI * 2 + soft(i + 40.4) * 0.018;
    const r = 0.55 + Math.pow(hash(i + 41.4), 0.8) * 1.15;
    out[o] = Math.cos(a) * r;
    out[o + 1] = cy + Math.sin(a) * r;
    out[o + 2] = soft(i + 42.2) * 0.05;
  } else {
    // A soft halo ring behind the crossing point.
    const a = hash(i + 43.3) * Math.PI * 2;
    const r = 0.78 + soft(i + 44.4) * 0.06;
    out[o] = Math.cos(a) * r;
    out[o + 1] = cy + Math.sin(a) * r;
    out[o + 2] = -0.05;
  }
};

const SHAPES: ShapeFn[] = [scatter, galaxy, helix, star, heart, butterfly, radiance];
const ATTRS = ["position", "aGalaxy", "aHelix", "aStar", "aHeart", "aButterfly", "aRadiance"];

const VERT = /* glsl */ `
  attribute vec3 aGalaxy;
  attribute vec3 aHelix;
  attribute vec3 aStar;
  attribute vec3 aHeart;
  attribute vec3 aButterfly;
  attribute vec3 aRadiance;
  attribute vec2 aSeed;          // x: stagger/order, y: size + tint variation

  uniform float uShape;          // 0..6, continuous
  uniform float uTime;
  uniform float uCalm;           // 1 under reduced motion
  uniform float uIgnite;         // light spreading through the stone heart
  uniform float uRise;           // final release into rising light
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uColors[7];
  uniform float uGlow[7];
  uniform float uAdd[7];         // 1 = additive light, 0 = solid (occludes)
  uniform vec3 uIgniteColor;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vAdd;

  vec3 rotY(vec3 p, float a) {
    float c = cos(a), s = sin(a);
    return vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
  }

  vec3 shapeAt(float idx, float t) {
    if (idx < 0.5) return rotY(position, t * 0.035);
    if (idx < 1.5) {
      // Differential rotation: the inner disk turns faster than the arms.
      vec3 g = aGalaxy;
      float r = length(g.xy);
      float a = t * 0.16 / (0.35 + r);
      float c = cos(a), s = sin(a);
      g.xy = vec2(g.x * c - g.y * s, g.x * s + g.y * c);
      // Tilt the disk toward the viewer so it reads as a galaxy, not a ring.
      float tc = cos(0.62), ts = sin(0.62);
      return vec3(g.x * 1.2, g.y * tc - g.z * ts, g.y * ts + g.z * tc);
    }
    if (idx < 2.5) return rotY(aHelix, t * 0.45) * vec3(1.0, 1.0, 1.0);
    if (idx < 3.5) return aStar * (1.0 + 0.06 * sin(t * 2.2));
    if (idx < 4.5) {
      // A slow heartbeat: a double pulse, like the real thing.
      float ph = fract(t * 0.9);
      float beat = exp(-pow((ph - 0.1) * 16.0, 2.0)) + 0.6 * exp(-pow((ph - 0.28) * 16.0, 2.0));
      return aHeart * (1.0 + beat * 0.045);
    }
    if (idx < 5.5) {
      // Wing beats: each wing hinges on the body (x = 0).
      vec3 b = aButterfly;
      // Gentle beats: past ~0.5 rad the wings foreshorten into an "X".
      float flap = sin(t * 2.2) * 0.32 + 0.18;
      float c = cos(flap), s = sin(flap);
      return vec3(b.x * c, b.y, abs(b.x) * s + b.z);
    }
    return aRadiance;
  }

  void main() {
    float s = clamp(uShape, 0.0, 6.0);
    float i0 = min(floor(s), 5.0);
    float f = s - i0;
    float t = uTime;

    // Particles leave in a staggered wave rather than all at once.
    float st = clamp((f - aSeed.x * 0.4) / 0.6, 0.0, 1.0);
    st = st * st * (3.0 - 2.0 * st);

    vec3 a = shapeAt(i0, t);
    vec3 b = shapeAt(i0 + 1.0, t);
    vec3 p = mix(a, b, st);

    // Mid-flight burst: points bloom outward between shapes. The heart ->
    // butterfly change (the "new creation") bursts hardest.
    vec3 dir = normalize(vec3(
      fract(aSeed.x * 12.9898) * 2.0 - 1.0,
      fract(aSeed.x * 78.233) * 2.0 - 1.0,
      fract(aSeed.y * 37.719) * 2.0 - 1.0) + 0.0001);
    float burst = (i0 > 3.5 && i0 < 4.5) ? 1.5 : 0.45;
    p += dir * sin(st * 3.14159) * burst * (0.35 + aSeed.y * 0.8);

    // Breath: a little life in every point, more when lost and scattered.
    float lost = 1.0 - clamp(s, 0.0, 1.0);
    float amp = (0.012 + lost * 0.08) * (1.0 - uCalm * 0.7);
    p += amp * vec3(
      sin(t * 0.7 + aSeed.x * 40.0),
      cos(t * 0.6 + aSeed.y * 37.0),
      sin(t * 0.5 + aSeed.x * 23.0));

    // The release: the figure gathers into a beam of light and streams up
    // out of frame. Narrow, so it reads as ascending - spread wide it read
    // as snow.
    float lift = fract(aSeed.x * 7.13 + t * (0.06 + aSeed.y * 0.08));
    float beam = 0.04 + 0.14 * lift;
    vec3 risen = vec3(p.x * 0.25 + dir.x * beam, -1.4 + lift * 5.2, p.z * 0.25 + dir.z * beam);
    p = mix(p, risen, uRise);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.45 + aSeed.y) * mix(0.7, 1.0, clamp(uShape, 0.0, 1.0)) / max(-mv.z, 1.0);

    // Colour and brightness follow the same staggered morph.
    int ia = int(i0);
    int ib = int(min(i0 + 1.0, 6.0));
    vec3 col = mix(uColors[ia], uColors[ib], st);
    float glow = mix(uGlow[ia], uGlow[ib], st);

    float add = mix(uAdd[ia], uAdd[ib], st);

    // The galaxy's bulge burns warm, its arms cool blue - like the real thing.
    float galW = 1.0 - clamp(abs(s - 1.0), 0.0, 1.0);
    float core = galW * (1.0 - smoothstep(0.0, 0.32, length(aGalaxy.xy)));
    col = mix(col, vec3(1.0, 0.86, 0.62), core * 0.85);
    glow += core * 1.1;

    // Light breaking through the stone heart, point by point.
    float heartW = 1.0 - clamp(abs(s - 4.0), 0.0, 1.0);
    // Thresholds start above 0 so NOTHING is lit before the light arrives.
    float th = 0.04 + aSeed.x * 0.9;
    float lit = smoothstep(th, th + 0.06, uIgnite) * heartW;
    col = mix(col, uIgniteColor, lit);
    glow = mix(glow, 2.4, lit);
    add = mix(add, 1.0, lit);

    // Per-point variation toward warm white keeps it from reading as flat -
    // but stone stays stone.
    col = mix(col, vec3(1.0, 0.96, 0.9), aSeed.y * 0.35 * add);
    vColor = col * glow;
    vAdd = add;

    float top = 1.0 - smoothstep(2.4, 3.8, p.y) * uRise;
    // The lost dust is fainter and finer than anything the figure becomes.
    float found = clamp(s, 0.0, 1.0);
    vAlpha = (0.35 + aSeed.y * 0.5) * top * mix(0.45, 1.0, found);
  }
`;

/* Premultiplied output with blend (ONE, ONE_MINUS_SRC_ALPHA). The alpha we
   write decides how much of the sky behind a point is covered:
     alpha = coverage       -> ordinary "over" blending: the point is SOLID
                               (the grey stone heart has to darken what's
                               behind it, or it can never read as stone)
     alpha = 0              -> pure ADDITIVE light (galaxy, star, butterfly)
   so one draw call can hold stone and light at once, per particle. */
const FRAG = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vAdd;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d);
    if (r > 0.5) discard;
    float core = smoothstep(0.5, 0.0, r);
    float a = core * vAlpha * uOpacity;
    gl_FragColor = vec4(vColor * (0.6 + core * 0.8) * a, a * (1.0 - vAdd));
  }
`;

const COLORS = ["#8c97d8", "#b3c1ff", "#86e6ff", "#fff4d6", "#6c707b", "#ffd48a", "#fff4d8"];
const GLOW = [0.5, 1.35, 1.25, 2.8, 0.75, 1.9, 2.5];
/** Additive (light) vs solid (stone). The lost dust is half-and-half: it
 *  should read as dim, drifting matter rather than as stars. */
const ADD = [0.55, 1, 1, 1, 0, 1, 1];

/** Distance in front of the lens the figure lives at. */
const DIST = 12;

export default function StoryParticles({ count, calm }: { count: number; calm: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const { camera, gl, size } = useThree();
  const fwd = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const synced = useRef(false);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    SHAPES.forEach((fn, s) => {
      const arr = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) fn(i, count, arr, i * 3);
      g.setAttribute(ATTRS[s], new THREE.BufferAttribute(arr, 3));
    });
    const seed = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      seed[i * 2] = hash(i + 91.3);
      seed[i * 2 + 1] = hash(i + 57.9);
    }
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 2));
    return g;
  }, [count]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uShape: { value: 0 },
      uTime: { value: 0 },
      uCalm: { value: 0 },
      uIgnite: { value: 0 },
      uRise: { value: 0 },
      uSize: { value: 72 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 0 },
      uColors: { value: COLORS.map((h) => new THREE.Color(h)) },
      uGlow: { value: GLOW.slice() },
      uAdd: { value: ADD.slice() },
      uIgniteColor: { value: new THREE.Color("#ffcf7a") },
    }),
    []
  );

  useFrame((_, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const d = Math.min(delta, 0.05);
    const u = (pts.material as THREE.ShaderMaterial).uniforms;

    u.uTime.value += d * (calm ? 0.2 : 1);
    u.uCalm.value = calm ? 1 : 0;
    // Damped toward the driver's targets so a fast scroll still morphs
    // smoothly instead of teleporting between shapes.
    const k = 1 - Math.exp(-6 * d);
    u.uShape.value += (story.shape - u.uShape.value) * k;
    u.uIgnite.value += (story.ignite - u.uIgnite.value) * k;
    u.uRise.value += (story.rise - u.uRise.value) * k;
    u.uOpacity.value += (story.presence - u.uOpacity.value) * (1 - Math.exp(-2.5 * d));
    u.uPixelRatio.value = gl.getPixelRatio();
    pts.visible = u.uOpacity.value > 0.005;

    // Layout: beside the text on landscape screens, above it on portrait.
    const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov ?? 55);
    const h = 2 * DIST * Math.tan(fov / 2);
    const aspect = size.width / Math.max(size.height, 1);
    let offX = 0;
    let offY = 0;
    let scale: number;
    if (aspect > 1.05) {
      offX = h * aspect * 0.2;
      scale = h * 0.26;
    } else {
      // Portrait: a smaller figure in the band above the narration, which
      // fills the lower two-thirds of a phone screen.
      offY = h * 0.3;
      scale = Math.min(h * aspect * 0.3, h * 0.13);
    }
    pts.scale.setScalar(scale);

    fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
    right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    up.set(0, 1, 0).applyQuaternion(camera.quaternion);
    target
      .copy(camera.position)
      .addScaledVector(fwd, DIST)
      .addScaledVector(right, offX)
      .addScaledVector(up, offY);
    if (!synced.current) {
      pts.position.copy(target);
      synced.current = true;
    } else {
      pts.position.lerp(target, 1 - Math.exp(-10 * d));
    }
    pts.quaternion.copy(camera.quaternion);
  });

  if (count === 0) return null;

  return (
    <points ref={ref} renderOrder={6} frustumCulled={false} visible={false}>
      <primitive object={geometry} attach="geometry" />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.CustomBlending}
        blendEquation={THREE.AddEquation}
        blendSrc={THREE.OneFactor}
        blendDst={THREE.OneMinusSrcAlphaFactor}
        fog={false}
      />
    </points>
  );
}
