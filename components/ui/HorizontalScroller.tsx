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
function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Swipe glyph: a double-headed horizontal arrow. */
function SwipeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path
        d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

      {/* Controls sit on a dark frosted scrim rather than a translucent white
          one: the descent sky runs from near-white cloud to near-black fire, and
          white-on-white washed the affordance out at the top of the page. */}
      <div className="mt-6 flex items-center gap-3 px-6">
        <button
          type="button"
          onClick={() => nudge(-1)}
          aria-label="Scroll left"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink/75 text-white shadow-lg ring-1 ring-white/50 backdrop-blur transition hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Arrow className="h-4 w-4 rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => nudge(1)}
          aria-label="Scroll right"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink/75 text-white shadow-lg ring-1 ring-white/50 backdrop-blur transition hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Arrow className="h-4 w-4" />
        </button>
        <span className="flex select-none items-center gap-2 rounded-full bg-ink/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-lg ring-1 ring-white/25 backdrop-blur sm:text-sm">
          <SwipeGlyph className="h-4 w-4 shrink-0" />
          Swipe to explore
        </span>
      </div>
    </div>
  );
}
