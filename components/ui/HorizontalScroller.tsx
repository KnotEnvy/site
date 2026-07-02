"use client";

import { useRef } from "react";

type Props = {
  children: React.ReactNode;
  /** Accessible name for the scrollable region. */
  label: string;
  className?: string;
};

/**
 * Reusable swipe rail. Native scroll-snap drives touch + trackpad; mouse users
 * get click-drag and prev/next arrows. Items should be `shrink-0 snap-start`.
 */
export default function HorizontalScroller({ children, label, className }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });

  const nudge = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return; // touch already scrolls natively
    const el = trackRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
    // Do NOT capture the pointer here: while the track holds the capture, the
    // browser retargets the eventual `click` to the track itself, so buttons
    // and links inside the rail can never be clicked. Capture is taken lazily
    // in onPointerMove, once the gesture is unambiguously a drag.
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (!drag.current.moved && Math.abs(dx) > 4) {
      drag.current.moved = true;
      el.setPointerCapture(e.pointerId);
    }
    if (drag.current.moved) el.scrollLeft = drag.current.startLeft - dx;
  };

  const endDrag = (e: React.PointerEvent) => {
    drag.current.active = false;
    trackRef.current?.releasePointerCapture?.(e.pointerId);
  };

  // Swallow click only when it was actually a drag, so links/buttons still work.
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <div className={className}>
      <div
        ref={trackRef}
        role="region"
        aria-label={label}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-6 px-6 py-2 [touch-action:pan-x] cursor-grab active:cursor-grabbing"
      >
        {children}
      </div>

      <div className="mt-6 flex items-center gap-3 px-6">
        <button
          type="button"
          onClick={() => nudge(-1)}
          aria-label="Scroll left"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/40 bg-white/20 text-xl text-white backdrop-blur transition hover:bg-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => nudge(1)}
          aria-label="Scroll right"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/40 bg-white/20 text-xl text-white backdrop-blur transition hover:bg-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          →
        </button>
        <span className="ml-1 select-none text-sm font-medium tracking-wide text-white/80">
          Swipe to explore
        </span>
      </div>
    </div>
  );
}
