"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { pointer, addRipple } from "@/lib/scroll";
import CanvasErrorBoundary from "@/components/three/CanvasErrorBoundary";

// WebGL must be client-only; the CSS sky gradient on <body> paints instantly
// behind this transparent canvas so first paint / LCP is never blank.
const SkyCanvas = dynamic(() => import("./SkyCanvas"), { ssr: false });

const MAX_RECOVERIES = 3;

/**
 * Hosts the WebGL sky AND owns its resilience.
 *
 * Some GPUs/drivers (notably flaky Windows hybrid-graphics setups) drop the
 * WebGL context and refuse to restore it. Rather than wait for a restore that
 * never comes, on each loss we:
 *   1) shed the expensive passes (postprocessing, embers, hi-DPR) — "lite" mode,
 *   2) remount the canvas to get a brand-new context after a short breather.
 * After a few failures we give up and let the CSS Heaven→Hell gradient (painted
 * on <body>) carry the descent on its own.
 */
export default function CloudCanvas() {
  const [canvasKey, setCanvasKey] = useState(0);
  const [lite, setLite] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const losses = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onDown = (e: PointerEvent) => {
      // NDC: x right-positive, y up-positive (flip the DOM's y-down).
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      addRipple(x, y);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  const handleContextLost = useCallback(() => {
    losses.current += 1;
    if (losses.current >= MAX_RECOVERIES) {
      console.warn(
        "[CloudCanvas] WebGL context lost repeatedly — falling back to the CSS sky. " +
          "Check that hardware acceleration is enabled (edge://gpu / chrome://gpu)."
      );
      setDisabled(true);
      return;
    }
    setLite(true);
    // Give the GPU a breather, then mount a fresh, lighter context.
    window.setTimeout(() => setCanvasKey((k) => k + 1), 600);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      {!disabled && (
        <CanvasErrorBoundary>
          <SkyCanvas key={canvasKey} lite={lite} onContextLost={handleContextLost} />
        </CanvasErrorBoundary>
      )}
    </div>
  );
}
