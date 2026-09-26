"use client";

import { useMemo, useState } from "react";
import { clsx } from "@/lib/clsx";

type Passage = { ref: string; text: string };

const LEVELS = [
  { label: "Read it", hide: 0 },
  { label: "Some gaps", hide: 0.35 },
  { label: "Mostly gone", hide: 0.7 },
  { label: "From memory", hide: 1 },
];

function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * "I have hidden your word in my heart" (Psalm 119:11). A classic
 * memorisation exercise: read the verse, then watch words fall away level by
 * level and fill them in from memory. Tap a gap to peek at that word. The
 * words that vanish are chosen deterministically, so each level only ever
 * hides MORE of the words the previous level hid.
 */
export default function MemoryVerse({ passages }: { passages: Passage[] }) {
  const [pi, setPi] = useState(0);
  const [level, setLevel] = useState(0);
  const [peek, setPeek] = useState<Set<number>>(new Set());

  const passage = passages[pi];
  const words = useMemo(() => passage.text.split(/\s+/), [passage]);
  const order = useMemo(() => words.map((_, i) => hash(i + pi * 31)), [words, pi]);

  const choose = (i: number) => {
    setPi(i);
    setLevel(0);
    setPeek(new Set());
  };
  const setLvl = (l: number) => {
    setLevel(l);
    setPeek(new Set());
  };

  return (
    <div className="rounded-3xl bg-paper/90 p-5 shadow-2xl ring-1 ring-black/5 backdrop-blur-md sm:p-8">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a verse">
        {passages.map((p, i) => (
          <button
            key={p.ref}
            type="button"
            aria-pressed={pi === i}
            onClick={() => choose(i)}
            className={clsx(
              "rounded-full px-3.5 py-1.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-scripture",
              pi === i ? "bg-ink text-paper" : "bg-ink/5 text-ink/75 hover:bg-ink/10"
            )}
          >
            {p.ref}
          </button>
        ))}
      </div>

      <p className="verse mt-6 min-h-[8rem] text-2xl leading-[1.7] text-ink sm:text-3xl" aria-live="polite">
        {words.map((w, i) => {
          const hidden = order[i] < LEVELS[level].hide && !peek.has(i);
          return (
            <span key={`${pi}-${i}`}>
              {hidden ? (
                <button
                  type="button"
                  onClick={() => setPeek((s) => new Set(s).add(i))}
                  className="inline-block rounded-md bg-scripture/20 align-baseline text-transparent ring-1 ring-scripture/40 transition hover:bg-scripture/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-scripture"
                  aria-label="Hidden word. Tap to reveal"
                >
                  {w.replace(/./g, "_")}
                </button>
              ) : (
                <span className={clsx(peek.has(i) && "text-scripture-deep")}>{w}</span>
              )}{" "}
            </span>
          );
        })}
      </p>
      <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-ink/60">{passage.ref}</p>

      <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Difficulty">
        {LEVELS.map((l, i) => (
          <button
            key={l.label}
            type="button"
            aria-pressed={level === i}
            onClick={() => setLvl(i)}
            className={clsx(
              "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-scripture",
              level === i ? "bg-scripture text-ink" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
            )}
          >
            {i + 1}. {l.label}
          </button>
        ))}
        {level > 0 && (
          <button
            type="button"
            onClick={() => setPeek(new Set(words.map((_, i) => i)))}
            className="ml-auto text-xs font-bold uppercase tracking-[0.14em] text-ink/60 underline-offset-4 hover:text-ink hover:underline"
          >
            Check yourself
          </button>
        )}
      </div>
    </div>
  );
}
