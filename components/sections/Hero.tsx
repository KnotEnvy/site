"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import HorizontalScroller from "@/components/ui/HorizontalScroller";
import Photo from "@/components/ui/Photo";
import { IMG } from "@/lib/media";

const INTRO = [
  {
    title: "What is an NDE?",
    body: "A near-death experience happens when someone is revived from clinical death. The heart has stopped, the brain has gone quiet, and yet the person returns with vivid memories of what happened while they were gone. Many call it the most real thing they have ever lived through.",
  },
  {
    title: "Why it matters to everyone",
    body: "Death is the one appointment nobody cancels. Whatever you believe about what comes next, you will find out, and so will everyone you love. That makes this worth an honest look now, while the question is still yours to ask.",
  },
  {
    title: "A scientific case for God",
    body: "These reports surface in every culture, every generation, and every belief system, including from people who expected nothing at all. When testimony agrees that consistently, at that scale, science pays attention. So should we.",
  },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[100svh] flex-col justify-center px-4 pb-24 pt-28 sm:px-6"
    >
      <motion.div
        style={{ y, opacity }}
        className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center"
      >
        {/* Headline */}
        <div>
          <StaggerGroup className="space-y-2">
            <p className="mb-4 inline-block rounded-full bg-paper/85 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-ink/70 backdrop-blur">
              Evidence of life after death
            </p>

            <h1 className="display-xl text-blaze drop-shadow-[0_2px_20px_rgba(255,255,255,0.5)]">
              <span className="block overflow-hidden">
                <StaggerItem wipe>Heaven</StaggerItem>
              </span>
              <span className="block overflow-hidden">
                <StaggerItem wipe delay={0.1}>or Hell.</StaggerItem>
              </span>
              <span className="block overflow-hidden text-ink">
                <StaggerItem wipe delay={0.2}>Real?</StaggerItem>
              </span>
            </h1>
          </StaggerGroup>

          <Reveal delay={0.5} className="mt-8 max-w-xl">
            <p className="rounded-2xl bg-paper/85 p-5 font-sans text-base normal-case leading-relaxed tracking-normal text-ink/80 backdrop-blur sm:text-lg">
              Millions of people have died, been revived, and returned
              describing the same journey. Their accounts line up across
              cultures, ages, and beliefs, and together they make a serious
              case that God is real and death is not the end. We gathered the
              strongest of that evidence,{" "}
              <span className="font-semibold text-ink">
                without bias or agenda
              </span>
              . What you do with it is up to you.
            </p>
          </Reveal>
        </div>

        {/* Image collage */}
        <Reveal delay={0.3} className="relative hidden h-[60vh] max-h-[520px] lg:block">
          <Photo
            src={IMG.bible[0]}
            alt="Open Bible scripture"
            priority
            sizes="40vw"
            className="absolute left-0 top-6 h-[58%] w-[62%] -rotate-3 rounded-2xl shadow-2xl ring-1 ring-white/40"
          />
          <Photo
            src={IMG.science[0]}
            alt="Surgeons mid-operation in the operating room"
            priority
            sizes="30vw"
            className="absolute right-0 top-0 h-[46%] w-[52%] rotate-2 rounded-2xl shadow-2xl ring-1 ring-white/40"
          />
          <Photo
            src={IMG.heaven[0]}
            alt="Sunbeams breaking through the clouds"
            priority
            sizes="34vw"
            className="absolute bottom-0 right-6 h-[44%] w-[58%] -rotate-1 rounded-2xl shadow-2xl ring-1 ring-white/40"
          />
        </Reveal>
      </motion.div>

      {/* Horizontal swipe: intro panels (swipe before scrolling on, per the brief) */}
      <div className="mx-auto mt-16 w-full max-w-7xl">
        <Reveal>
          <HorizontalScroller label="Introduction panels">
            {INTRO.map((card) => (
              <article
                key={card.title}
                className="flex w-[82vw] max-w-[420px] shrink-0 snap-start flex-col gap-3 rounded-2xl bg-paper/90 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur"
              >
                <h3 className="font-display text-2xl text-blaze">{card.title}</h3>
                <p className="font-sans text-base normal-case leading-relaxed tracking-normal text-ink/80">
                  {card.body}
                </p>
              </article>
            ))}
          </HorizontalScroller>
        </Reveal>
      </div>

      {/* scroll cue */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 sm:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90"
        >
          Begin the descent ↓
        </motion.div>
      </motion.div>
    </section>
  );
}
