"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useLenis } from "lenis/react";
import SplitText from "@/components/ui/SplitText";
import VerseCard from "@/components/ui/VerseCard";
import { PillLink } from "@/components/ui/PageHero";
import StoryGlyph from "@/components/ascent/StoryGlyph";
import { story, resetStory } from "@/lib/story";
import { verse, type VerseKey } from "@/lib/content/bible";
import { useHydrated } from "@/lib/useHydrated";
import { useSkyStatus } from "@/lib/skyStatus";
import { clsx } from "@/lib/clsx";

/* -------------------------------------------------------------------------- */
/*  THE ASCENT - an interactive story.                                         */
/*                                                                             */
/*  Eight chapters, each a tall section with a pinned (sticky) stage. While a  */
/*  chapter is pinned, scrolling does two things:                              */
/*    - its lines of narration arrive one after another (DOM, below), and      */
/*    - the particle "spirit" in the WebGL sky morphs toward the chapter's     */
/*      shape (StoryParticles, fed through lib/story.ts by StoryDriver).       */
/*                                                                             */
/*  Every word is real server-rendered text: readable with no JS, by screen    */
/*  readers, and by search engines. Motion is layered on after hydration and,  */
/*  under reduced motion, collapses to opacity only - the story is carried by  */
/*  the visitor's own scrolling, so it is never autonomous movement.          */
/* -------------------------------------------------------------------------- */

type Chapter = {
  id: string;
  numeral: string;
  kicker: string;
  title: string;
  lines: string[];
  verse: VerseKey;
  /** Shape morph across the chapter: from -> to (see STORY_SHAPES). */
  shape: [number, number];
  /** Portion of the chapter's scroll over which the morph happens. */
  morphAt?: [number, number];
  /** Light breaking through the stone heart. */
  ignite?: { from: number; to: number; at: [number, number] };
  /** The final release into rising light. */
  rise?: { at: [number, number] };
  /** Glyph for the no-WebGL fallback stage. */
  glyph: "scatter" | "galaxy" | "helix" | "star" | "heart" | "butterfly" | "radiance";
  extra?: "fruit" | "invitation";
};

const CHAPTERS: Chapter[] = [
  {
    id: "in-the-dark",
    numeral: "I",
    kicker: "Lost",
    title: "In the Dark",
    lines: [
      "Every story of transformation begins in the dark.",
      "Not always a dramatic darkness. Sometimes it is just numb. Busy. Scattered. A life that looks fine from the outside and feels like drifting on the inside.",
      "Pieces of a person, floating apart, looking for something to hold them together.",
    ],
    verse: "Isaiah 9:2",
    shape: [0, 0],
    glyph: "scatter",
  },
  {
    id: "the-heavens-declare",
    numeral: "II",
    kicker: "Wonder",
    title: "The Heavens Declare",
    lines: [
      "Then, one night, you look up.",
      "Hundreds of billions of galaxies. A galaxy like ours holds hundreds of billions of stars. The light reaching your eyes from Andromeda left it two and a half million years ago.",
      "All of it held together by laws precise enough to write down, and to make you wonder who wrote them.",
    ],
    verse: "Psalm 19:1",
    shape: [0, 1],
    glyph: "galaxy",
  },
  {
    id: "wonderfully-made",
    numeral: "III",
    kicker: "Wonder",
    title: "Wonderfully Made",
    lines: [
      "Then you look closer.",
      "Coiled inside almost every cell of your body is about two meters of DNA: a written code more than three billion letters long, copied every time a cell divides.",
      "The God who scattered the galaxies wrote you, letter by letter.",
    ],
    verse: "Psalm 139:14",
    shape: [1, 2],
    glyph: "helix",
  },
  {
    id: "known-by-name",
    numeral: "IV",
    kicker: "Found",
    title: "Known by Name",
    lines: [
      "Here is the part that changes everything.",
      "The One who counts the stars, and calls each of them by name, knows yours.",
      "You are not an accident adrift in a cold universe. You are seen. You are known. You are wanted.",
    ],
    verse: "Isaiah 43:1",
    shape: [2, 3],
    glyph: "star",
  },
  {
    id: "broken-open",
    numeral: "V",
    kicker: "Broken",
    title: "Broken Open",
    lines: [
      "But being truly known is terrifying when you know what is inside you.",
      "Regret. Pride. Wounds you have given and wounds you have taken. Over the years a heart hardens, and no one can chisel it soft on their own.",
      "God does not ask you to fix it first. He offers what no one else can: to break it open with light, and give you a new one.",
    ],
    verse: "Ezekiel 36:26",
    shape: [3, 4],
    morphAt: [0.05, 0.4],
    ignite: { from: 0, to: 1, at: [0.5, 0.92] },
    glyph: "heart",
  },
  {
    id: "made-new",
    numeral: "VI",
    kicker: "Reborn",
    title: "Made New",
    lines: [
      "Inside a chrysalis, a caterpillar does not simply grow wings. Much of its body breaks down, and it is rebuilt into something that could never have flown before.",
      "That is what grace does. Not self-improvement. Not a better version of the old you.",
      "A new creation.",
    ],
    verse: "2 Corinthians 5:17",
    shape: [4, 5],
    ignite: { from: 1, to: 1, at: [0, 1] },
    glyph: "butterfly",
  },
  {
    id: "infinitely-more",
    numeral: "VII",
    kicker: "Transformed",
    title: "Infinitely More",
    lines: [
      "A life joined to God does not just get better. It grows bigger than you.",
      "Love where there was resentment. Joy that does not depend on circumstances. Peace in the storm. Strength you know did not come from you.",
    ],
    verse: "Ephesians 3:20",
    shape: [5, 6],
    glyph: "radiance",
    extra: "fruit",
  },
  {
    id: "arise",
    numeral: "VIII",
    kicker: "Home",
    title: "Arise",
    lines: ["This is not the end of a story.", "It is where yours begins."],
    verse: "Isaiah 60:1",
    shape: [6, 6],
    rise: { at: [0.3, 0.85] },
    glyph: "radiance",
    extra: "invitation",
  },
];

/** The fruit of the Spirit, in the order Galatians 5:22-23 (WEB) gives them. */
const FRUIT = ["love", "joy", "peace", "patience", "kindness", "goodness", "faith", "gentleness", "self-control"];

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const ease = (x: number) => x * x * (3 - 2 * x);
const range = (p: number, [a, b]: [number, number]) => ease(clamp01((p - a) / Math.max(b - a, 1e-4)));

/**
 * Writes the story state for the WebGL spirit from the page's scroll. One
 * authority for the whole page (not one per chapter): it walks the chapters
 * in order and the last one the reader has reached wins, so neighbouring
 * chapters can never fight over the shape on a fast scroll.
 */
function useStoryDriver(sections: React.RefObject<(HTMLElement | null)[]>) {
  const compute = () => {
    const els = sections.current;
    if (!els) return;
    const vh = window.innerHeight;
    let shape = CHAPTERS[0].shape[0];
    let ignite = 0;
    let rise = 0;
    for (let i = 0; i < CHAPTERS.length; i++) {
      const el = els[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top > vh * 0.35) break; // not reached yet
      const span = Math.max(r.height - vh, 1);
      const p = clamp01(-r.top / span);
      const ch = CHAPTERS[i];
      const m = range(p, ch.morphAt ?? [0.05, 0.6]);
      shape = ch.shape[0] + (ch.shape[1] - ch.shape[0]) * m;
      ignite = ch.ignite ? ch.ignite.from + (ch.ignite.to - ch.ignite.from) * range(p, ch.ignite.at) : ignite;
      rise = ch.rise ? range(p, ch.rise.at) : 0;
    }
    story.shape = shape;
    story.ignite = ignite;
    story.rise = rise;
  };

  useLenis(compute);

  useEffect(() => {
    story.presence = 1;
    compute();
    window.addEventListener("resize", compute, { passive: true });
    return () => {
      window.removeEventListener("resize", compute);
      // Leaving the page: fade the spirit out and start in the dark next time.
      resetStory();
    };
    // compute only reads refs and module state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** One line of narration: arrives with the chapter's scroll, dissolves as it leaves. */
function Line({
  progress,
  at,
  children,
  className,
}: {
  progress: MotionValue<number>;
  at: number;
  children: React.ReactNode;
  className?: string;
}) {
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  const opacity = useTransform(progress, [at, at + 0.07, 0.93, 1], [0, 1, 1, 0]);
  const y = useTransform(progress, [at, at + 0.1], [22, 0]);
  // Visible-by-default until hydration (criticalLessons #6 / #11); opacity
  // only under reduced motion.
  const style = !hydrated ? undefined : reduced ? { opacity } : { opacity, y };
  return (
    <motion.div style={style} className={className}>
      {children}
    </motion.div>
  );
}

function FruitChip({ progress, at, word }: { progress: MotionValue<number>; at: number; word: string }) {
  const hydrated = useHydrated();
  const glow = useTransform(progress, [at, at + 0.05], [0, 1]);
  const opacity = useTransform(glow, [0, 1], [0.35, 1]);
  const boxShadow = useTransform(
    glow,
    (g) => `0 0 ${Math.round(22 * g)}px ${Math.round(3 * g)}px rgba(255, 207, 122, ${0.55 * g})`
  );
  return (
    <motion.li
      style={hydrated ? { opacity, boxShadow } : undefined}
      className="rounded-full bg-night/60 px-3.5 py-1.5 text-sm font-semibold capitalize text-dawn ring-1 ring-dawn/40 backdrop-blur"
    >
      {word}
    </motion.li>
  );
}

function ChapterSection({
  chapter,
  index,
  sectionRef,
}: {
  chapter: Chapter;
  index: number;
  sectionRef: (el: HTMLElement | null) => void;
}) {
  const local = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: local, offset: ["start start", "end end"] });
  const sky = useSkyStatus();
  const n = chapter.lines.length;
  // Narration arrives across the first ~55% of the pin; the verse after it.
  const lineAt = (i: number) => 0.04 + (i / Math.max(n, 1)) * 0.46;
  const verseAt = 0.56;

  return (
    <section
      ref={(el) => {
        local.current = el;
        sectionRef(el);
      }}
      id={chapter.id}
      aria-labelledby={`${chapter.id}-title`}
      className="relative h-[250vh]"
    >
      {/* min-h, not h: on a short phone the narration + verse can be taller
          than the screen, and a fixed-height stage would clip the end of it. */}
      <div className="sticky top-0 flex min-h-[100svh] flex-col justify-end pb-8 pt-24 lg:justify-center lg:pb-0">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2">
          <div className="relative">
            {/* A feathered scrim: the sky runs from black void to blazing
                gold across this page, and the narration must read on both.
                `closest-side` so the ellipse reaches exactly zero at the box
                edges - the default farthest-corner left ~10% opacity at the
                edge midpoints, which drew a visible rectangle. Deep indigo
                rather than black so it reads as dusk, not a smudge. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-16 -inset-y-20 -z-10 bg-[radial-gradient(closest-side,rgba(8,10,30,0.66)_0%,rgba(8,10,30,0.5)_45%,rgba(8,10,30,0)_100%)]"
            />
            <Line progress={scrollYProgress} at={0}>
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-dawn">
                <span className="font-serif text-xl font-semibold tracking-normal text-white/60">{chapter.numeral}</span>
                <span className="h-px w-8 bg-dawn/60" />
                {chapter.kicker}
              </p>
              <h2
                id={`${chapter.id}-title`}
                className="mt-3 text-[clamp(2.4rem,6vw,4.75rem)] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
              >
                {chapter.title}
              </h2>
            </Line>

            <div className="mt-5 space-y-4">
              {chapter.lines.map((text, i) => (
                <Line key={i} progress={scrollYProgress} at={lineAt(i)}>
                  <p
                    className={clsx(
                      "copy text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]",
                      i === 0 ? "text-lg font-semibold sm:text-2xl" : "text-[15px] text-white/90 sm:text-lg",
                      // A one-line coda lands like a verdict.
                      text.length < 30 && i > 0 && "font-serif text-3xl italic text-dawn sm:text-4xl"
                    )}
                  >
                    {text}
                  </p>
                </Line>
              ))}
            </div>

            {chapter.extra === "fruit" && (
              <Line progress={scrollYProgress} at={0.46} className="mt-5">
                <p className="sr-only">The fruit of the Spirit:</p>
                <ul className="flex flex-wrap gap-2" aria-label="The fruit of the Spirit">
                  {FRUIT.map((w, i) => (
                    <FruitChip key={w} word={w} progress={scrollYProgress} at={0.46 + i * 0.035} />
                  ))}
                </ul>
              </Line>
            )}

            <Line progress={scrollYProgress} at={verseAt} className="mt-6 max-w-xl">
              <VerseCard passage={verse(chapter.verse)} tone="dark" size="sm" />
            </Line>

            {chapter.extra === "invitation" && (
              <Line progress={scrollYProgress} at={0.62} className="mt-6">
                <div className="flex flex-wrap gap-3">
                  <PillLink href="/begin" variant="dawn">
                    Take your first step
                  </PillLink>
                  <PillLink href="/scripture/made-new" variant="ghost">
                    Study what it means
                  </PillLink>
                  <PillLink href="/evidence" variant="ghost">
                    See the evidence
                  </PillLink>
                </div>
              </Line>
            )}
          </div>

          {/* The stage. Normally empty: the WebGL spirit is drawn here by the
              sky canvas. If WebGL has failed on this device, a still
              illustration of the chapter's shape takes its place. */}
          <div aria-hidden="true" className="hidden items-center justify-center lg:flex">
            {sky === "disabled" && <StoryGlyph kind={chapter.glyph} />}
          </div>
        </div>

        <p aria-hidden="true" className="pointer-events-none absolute bottom-4 right-6 font-display text-sm text-white/30 sm:right-16">
          {String(index + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}
        </p>
      </div>
    </section>
  );
}

export default function AscentStory() {
  const sections = useRef<(HTMLElement | null)[]>([]);
  useStoryDriver(sections);
  const sky = useSkyStatus();

  return (
    <>
      {/* Prelude */}
      <section
        aria-labelledby="ascent-title"
        className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 pb-24 pt-28 text-center sm:px-6"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(4,6,16,0.5)_0%,rgba(4,6,16,0)_70%)]"
        />
        <p className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.28em] text-dawn ring-1 ring-white/15 backdrop-blur">
          The Ascent · An interactive story
        </p>
        <h1 id="ascent-title" className="display-xl mt-6">
          <span className="block">
            <SplitText text="Made" className="text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]" />
          </span>
          <span className="block">
            <SplitText text="New." delay={0.2} className="text-dawn drop-shadow-[0_4px_40px_rgba(255,207,122,0.35)]" />
          </span>
        </h1>
        <p data-og="hide" className="copy mx-auto mt-8 max-w-xl text-lg text-white/85 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          A story about the wonders of God, and what His love makes of a human
          life. It moves as you scroll, so take it slowly. It begins, as most
          true stories do, in the dark.
        </p>
        <p data-og="hide" className="mt-3 text-sm text-white/55">About five minutes. Best in a quiet moment.</p>
        {sky === "disabled" && (
          <div aria-hidden="true" className="mt-8">
            <StoryGlyph kind="scatter" />
          </div>
        )}
        <a
          data-og="hide"
          href="#in-the-dark"
          className="mt-12 inline-flex flex-col items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-white/75 transition hover:text-white"
        >
          Scroll to begin
          <span aria-hidden="true" className="block h-10 w-px animate-pulse bg-gradient-to-b from-white/80 to-transparent" />
        </a>
      </section>

      {CHAPTERS.map((ch, i) => (
        <ChapterSection
          key={ch.id}
          chapter={ch}
          index={i}
          sectionRef={(el) => {
            sections.current[i] = el;
          }}
        />
      ))}
    </>
  );
}
