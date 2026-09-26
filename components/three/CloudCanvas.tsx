"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { pointer } from "@/lib/scroll";
import { journeyForPath } from "@/lib/pages";
import { setSkyStatus } from "@/lib/skyStatus";
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
 * After a few failures we give up and let the CSS gradient (painted on <body>)
 * carry the page on its own.
 *
 * The canvas lives in the root layout and is NEVER remounted on navigation -
 * creating a fresh WebGL context per page would be slow and is exactly the
 * kind of churn that provokes context loss. Instead the route picks a
 * JOURNEY (lib/journeys.ts) and the running scene eases into it.
 */
export default function CloudCanvas() {
  const [canvasKey, setCanvasKey] = useState(0);
  const [lite, setLite] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const losses = useRef(0);
  const journey = journeyForPath(usePathname() ?? "/");

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    // Only pointer MOVE is bridged into the scene. The pointerdown listener
    // that fired a click shockwave was removed 2026-08-21 (see lib/scroll.ts).
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
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
      setSkyStatus("disabled");
      return;
    }
    setLite(true);
    // Give the GPU a breather, then mount a fresh, lighter context.
    window.setTimeout(() => setCanvasKey((k) => k + 1), 600);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      {!disabled && (
        <CanvasErrorBoundary onFail={() => setSkyStatus("disabled")}>
          <SkyCanvas
            key={canvasKey}
            lite={lite}
            journey={journey}
            onContextLost={handleContextLost}
          />
        </CanvasErrorBoundary>
      )}
    </div>
  );
}
