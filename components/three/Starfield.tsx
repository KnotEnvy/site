"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { SkyState } from "@/lib/palette";

/* -------------------------------------------------------------------------- */
/*  Starfield - the night sky for the journeys that pass through darkness      */
/*  (The Ascent's void, Great Minds' deep space, the Evidence page's passage). */
/*  A shell of points just inside the sky dome that follows the camera, so     */
/*  stars sit at "infinity" with no parallax. Twinkle is in the shader; a few  */
/*  stars in every hundred are pushed past the Bloom threshold so they sparkle */
/*  like real bright stars. Presence comes from the palette (`state.stars`).  */
/* -------------------------------------------------------------------------- */

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const VERT = /* glsl */ `
  attribute vec2 aStar;       // x: phase, y: magnitude 0..1
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vBright;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float tw = 0.75 + 0.25 * sin(uTime * (0.6 + aStar.x * 2.4) + aStar.x * 60.0);
    float mag = pow(aStar.y, 3.0);
    vBright = (0.35 + mag * 2.6) * tw;
    gl_PointSize = (1.2 + mag * 3.2) * uPixelRatio;
  }
`;

const FRAG = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uTint;
  varying float vBright;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d);
    if (r > 0.5) discard;
    float core = smoothstep(0.5, 0.0, r);
    gl_FragColor = vec4(uTint * vBright, core * uOpacity);
  }
`;

export default function Starfield({
  count,
  state,
  calm,
}: {
  count: number;
  state: SkyState;
  calm: boolean;
}) {
  const ref = useRef<THREE.Points>(null);
  const { camera, gl } = useThree();

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const star = new Float32Array(count * 2);
    const R = 52; // just inside the 60-unit sky dome
    for (let i = 0; i < count; i++) {
      // Upper hemisphere, biased toward the zenith, a little below the horizon.
      const y = -0.15 + hash(i + 1.1) * 1.15;
      const th = hash(i + 2.2) * Math.PI * 2;
      const s = Math.sqrt(Math.max(0, 1 - y * y));
      pos[i * 3] = Math.cos(th) * s * R;
      pos[i * 3 + 1] = y * R;
      pos[i * 3 + 2] = Math.sin(th) * s * R;
      star[i * 2] = hash(i + 3.3);
      star[i * 2 + 1] = hash(i + 4.4);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aStar", new THREE.BufferAttribute(star, 2));
    return g;
  }, [count]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uPixelRatio: { value: 1 },
      uTint: { value: new THREE.Color("#e8eeff") },
    }),
    []
  );

  useFrame((_, delta) => {
    const p = ref.current;
    if (!p) return;
    const u = (p.material as THREE.ShaderMaterial).uniforms;
    u.uTime.value += Math.min(delta, 0.05) * (calm ? 0.15 : 1);
    u.uOpacity.value = state.stars;
    u.uPixelRatio.value = gl.getPixelRatio();
    p.visible = state.stars > 0.01;
    // Stars live at infinity: follow the camera, never parallax.
    p.position.copy(camera.position);
  });

  if (count === 0) return null;

  return (
    <points ref={ref} renderOrder={0} frustumCulled={false} visible={false}>
      <primitive object={geometry} attach="geometry" />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </points>
  );
}
