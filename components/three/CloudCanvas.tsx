"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { pointer } from "@/lib/scroll";
import CanvasErrorBoundary from "@/components/three/CanvasErrorBoundary";

// WebGL must be client-only; the CSS sky gradient on <body> paints instantly
// behind this transparent canvas so first paint / LCP is never blank.
const SkyCanvas = dynamic(() => import("./SkyCanvas"), { ssr: false });

export default function CloudCanvas() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <CanvasErrorBoundary>
        <SkyCanvas />
      </CanvasErrorBoundary>
    </div>
  );
}
