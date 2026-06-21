"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Clouds, Cloud } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { scrollProgress, pointer } from "@/lib/scroll";
import { useDeviceTier } from "@/lib/useDeviceTier";

/** Static layout of cloud puffs — varied for a sense of depth. */
const CLOUD_LAYOUT = [
  { position: [-8, 2.6, -2], bounds: [8, 2.4, 2], volume: 8, scale: 1.15, opacity: 0.85, seed: 1, speed: 0.16, color: "#ffffff" },
  { position: [7.5, 3.6, -4], bounds: [7, 2, 2], volume: 7, scale: 1.0, opacity: 0.7, seed: 2, speed: 0.12, color: "#eaf3ff" },
  { position: [0, -0.8, 0.5], bounds: [10, 2.6, 2], volume: 9, scale: 1.3, opacity: 0.92, seed: 3, speed: 0.2, color: "#ffffff" },
  { position: [-6.5, -3.4, 2], bounds: [6, 2, 2], volume: 6, scale: 0.95, opacity: 0.8, seed: 4, speed: 0.18, color: "#ffffff" },
  { position: [9, -2.6, -1], bounds: [7, 2, 2], volume: 7, scale: 1.0, opacity: 0.72, seed: 5, speed: 0.14, color: "#f2f8ff" },
  { position: [3, 5.6, -5], bounds: [6, 1.8, 2], volume: 6, scale: 0.9, opacity: 0.6, seed: 6, speed: 0.1, color: "#e6f1ff" },
] as const;

function SkyScene() {
  const quality = useDeviceTier();
  const calm = !!useReducedMotion();

  const group = useRef<THREE.Group>(null);

  const visible = useMemo(
    () => (quality.tier === "low" ? CLOUD_LAYOUT.slice(0, 5) : CLOUD_LAYOUT),
    [quality.tier]
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    // Clamp delta so a stutter/tab-restore doesn't lurch the scene.
    const d = Math.min(delta, 0.05);

    if (calm) {
      // Calm: hold a neutral resting pose.
      g.position.x = THREE.MathUtils.damp(g.position.x, 0, 3, d);
      g.position.y = THREE.MathUtils.damp(g.position.y, 0, 3, d);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0, 3, d);
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, 0, 3, d);
      return;
    }

    const sp = scrollProgress.get(); // 0..1 down the page
    const t = state.clock.elapsedTime;

    // Vertical parallax: clouds rise & drift toward you as you scroll down.
    const targetY = -1.5 + sp * 7.5;
    const targetZ = sp * 3.2;
    // Lazy idle drift on top of everything.
    const driftX = Math.sin(t * 0.06) * 1.2;

    // Cursor parallax — gentle.
    const targetRotY = pointer.x * 0.12;
    const targetRotX = -pointer.y * 0.07;

    g.position.x = THREE.MathUtils.damp(g.position.x, driftX + pointer.x * 0.6, 2.5, d);
    g.position.y = THREE.MathUtils.damp(g.position.y, targetY, 3, d);
    g.position.z = THREE.MathUtils.damp(g.position.z, targetZ, 3, d);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetRotY, 3, d);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetRotX, 3, d);
  });

  return (
    <group ref={group}>
      <Clouds
        material={THREE.MeshLambertMaterial}
        limit={quality.limit}
        range={quality.limit}
        frustumCulled={false}
      >
        {visible.map((c, i) => (
          <Cloud
            key={i}
            seed={c.seed}
            segments={quality.segments}
            bounds={c.bounds as unknown as [number, number, number]}
            volume={c.volume}
            position={c.position as unknown as [number, number, number]}
            scale={c.scale}
            opacity={c.opacity}
            color={c.color}
            speed={calm ? 0 : c.speed}
            growth={4}
            fade={30}
          />
        ))}
      </Clouds>
    </group>
  );
}

export default function SkyCanvas() {
  const quality = useDeviceTier();

  return (
    <Canvas
      flat
      dpr={quality.dpr}
      camera={{ position: [0, 0, 14], fov: 50 }}
      gl={{
        alpha: true,
        antialias: quality.antialias,
        powerPreference: "high-performance",
      }}
      style={{ background: "transparent" }}
    >
      {/* Soft daylight so the Lambert clouds read as dimensional, not flat. */}
      <ambientLight intensity={1.6} />
      <directionalLight position={[6, 10, 8]} intensity={2.4} color="#fffaf0" />
      <directionalLight position={[-8, -4, -6]} intensity={0.6} color="#bcd9ff" />
      <SkyScene />
    </Canvas>
  );
}
