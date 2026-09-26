"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";

/* -------------------------------------------------------------------------- */
/*  "In the beginning" - the expansion of the universe, scrubbed by scroll.    */
/*                                                                             */
/*  A canvas of matter flying out from a single point: white-hot at first,    */
/*  cooling through gold to red, with the first light (the cosmic microwave    */
/*  background) flashing as a ring, then stars and galaxies condensing. The   */
/*  milestones beside it are real figures, rendered as ordinary text.          */
/*                                                                             */
/*  Scroll-linked only - nothing moves unless the visitor scrolls - so it is   */
/*  reduced-motion safe. Redraws happen on scroll, not on a loop.             */
/* -------------------------------------------------------------------------- */

const N = 700;

function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

type P = { a: number; r: number; s: number; clump: number };

const PARTICLES: P[] = Array.from({ length: N }, (_, i) => ({
  a: hash(i + 1) * Math.PI * 2,
  r: Math.pow(hash(i + 2), 0.6),
  s: 0.6 + hash(i + 3) * 1.6,
  clump: Math.floor(hash(i + 4) * 9),
}));

// Where matter gathers into galaxies late in the expansion.
const CLUMPS = Array.from({ length: 9 }, (_, i) => ({
  a: hash(i + 50) * Math.PI * 2,
  r: 0.35 + hash(i + 60) * 0.55,
}));

export const MILESTONES = [
  { at: 0.02, t: "0", label: "The beginning", body: "All of space, time, matter and energy, from a single point." },
  { at: 0.34, t: "380,000 years", label: "First light", body: "The universe cools enough for light to travel freely. We still detect it today as the cosmic microwave background." },
  { at: 0.62, t: "~200 million years", label: "The first stars", body: "Gravity gathers gas into stars, which begin forging heavier elements." },
  { at: 0.9, t: "13.8 billion years", label: "Today", body: "Hundreds of billions of galaxies - and one small planet where someone is reading this." },
];

export default function BigBangScrub() {
  const ref = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<(HTMLLIElement | null)[]>([]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.3"] });

  const draw = (p: number) => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = c.clientWidth;
    const h = c.clientHeight;
    if (c.width !== Math.round(w * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.48;
    const e = Math.pow(Math.min(Math.max(p, 0), 1), 0.7);
    const cool = Math.min(p / 0.5, 1); // white-hot -> red
    const form = Math.min(Math.max((p - 0.55) / 0.35, 0), 1); // clumping into galaxies

    // The flash at the beginning.
    const flash = Math.max(0, 1 - p / 0.12);
    if (flash > 0) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * (0.15 + e));
      g.addColorStop(0, `rgba(255,255,255,${flash})`);
      g.addColorStop(1, "rgba(255,240,200,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // First light: a ring that washes outward around 380,000 years.
    const cmb = Math.max(0, 1 - Math.abs(p - 0.36) / 0.08);
    if (cmb > 0) {
      ctx.strokeStyle = `rgba(255,190,120,${0.55 * cmb})`;
      ctx.lineWidth = 18 * cmb;
      ctx.beginPath();
      ctx.arc(cx, cy, R * e * 1.02, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < N; i++) {
      const pt = PARTICLES[i];
      const cl = CLUMPS[pt.clump];
      // Free expansion, then gravitational gathering toward a clump.
      let x = Math.cos(pt.a) * pt.r * e;
      let y = Math.sin(pt.a) * pt.r * e;
      const gx = Math.cos(cl.a) * cl.r * e + Math.cos(pt.a * 7) * 0.05 * pt.r;
      const gy = Math.sin(cl.a) * cl.r * e + Math.sin(pt.a * 7) * 0.05 * pt.r;
      x += (gx - x) * form * 0.8;
      y += (gy - y) * form * 0.8;

      const rr = Math.round(255);
      const gg = Math.round(255 - cool * 110 + form * 60);
      const bb = Math.round(240 - cool * 190 + form * 120);
      const a = 0.25 + 0.55 * (1 - cool * 0.5) + form * 0.2;
      ctx.fillStyle = `rgba(${rr},${gg},${bb},${Math.min(a, 1)})`;
      const size = pt.s * (0.8 + form * 0.9);
      ctx.beginPath();
      ctx.arc(cx + x * R, cy + y * R * 0.8, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";

    // Milestones light up as they're reached.
    MILESTONES.forEach((m, i) => {
      labels.current[i]?.classList.toggle("is-on", p >= m.at);
    });
  };

  useMotionValueEvent(scrollYProgress, "change", draw);
  useEffect(() => {
    draw(scrollYProgress.get());
    const onResize = () => draw(scrollYProgress.get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // draw only touches refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-night/70 ring-1 ring-white/10 sm:aspect-[4/3]">
        <canvas
          ref={canvas}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="An animation of the universe expanding from a single point, cooling, and gathering into galaxies."
        />
      </div>
      <ol className="space-y-3">
        {MILESTONES.map((m, i) => (
          <li
            key={m.label}
            ref={(el) => {
              labels.current[i] = el;
            }}
            className="milestone rounded-2xl bg-night/55 p-4 ring-1 ring-white/10 backdrop-blur-md"
          >
            <p className="font-display text-2xl leading-none text-dawn">{m.t}</p>
            <p className="mt-1 font-semibold text-white">{m.label}</p>
            <p className="copy text-sm text-white/70">{m.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
