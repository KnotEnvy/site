"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import Photo from "@/components/ui/Photo";
import { IMG } from "@/lib/media";

export default function Purpose() {
  const sourceRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sourceRef,
    offset: ["start end", "end start"],
  });
  // Slow vertical drift of the dawn gradient as the panel passes through view.
  const gradientY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section id="purpose" className="relative z-10">
      {/* Solid sky band — the thesis */}
      <div className="bg-sky text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
          <StaggerGroup>
            <h2 className="display-lg">
              <span className="block overflow-hidden">
                <StaggerItem wipe>The Truth.</StaggerItem>
              </span>
              <span className="block overflow-hidden text-ink">
                <StaggerItem wipe delay={0.1}>The Bible.</StaggerItem>
              </span>
            </h2>
          </StaggerGroup>

          <Reveal delay={0.2}>
            <p className="mt-8 max-w-3xl font-sans text-lg normal-case leading-relaxed tracking-normal text-white/90 sm:text-xl">
              Our purpose is simple: to show that near-death experiences don&apos;t
              merely hint at an afterlife — they{" "}
              <span className="font-semibold text-white">factually align</span>{" "}
              with what Scripture has said for thousands of years. And that where
              we spend eternity depends on how we understand and live out the
              Bible, day to day.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1fr_0.9fr] lg:items-start">
            <Reveal className="space-y-3">
              <h3 className="font-display text-2xl text-ink">
                What is a near-death experience?
              </h3>
              <p className="font-sans text-base normal-case leading-relaxed tracking-normal text-white/90">
                An NDE occurs when a person is clinically dead — heart and brain
                activity ceased — yet retains vivid, structured consciousness.
                Millions report strikingly similar realities: leaving the body,
                meeting a divine presence, and returning forever changed.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="space-y-3">
              <h3 className="font-display text-2xl text-ink">
                Why evidence over tradition?
              </h3>
              <p className="font-sans text-base normal-case leading-relaxed tracking-normal text-white/90">
                It&apos;s easy to dismiss religion as inherited bias. It&apos;s
                far harder to ignore consistent, eyewitness testimony from
                thousands of modern people — scientists, atheists, skeptics —
                who flatlined on an operating table and came back. We bridge
                medical phenomenon and eternal truth.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <Photo
                src={IMG.science[2]}
                alt="Intensive care — the moment the heart stops"
                overlay
                sizes="(max-width: 1024px) 90vw, 30vw"
                className="aspect-[4/5] w-full rounded-2xl shadow-2xl ring-1 ring-white/20"
              />
            </Reveal>
          </div>
        </div>
      </div>

      {/* "This Source" — dawn/dusk gradient essay */}
      <div ref={sourceRef} className="relative overflow-hidden">
        <motion.div
          aria-hidden="true"
          style={{
            y: gradientY,
            backgroundImage:
              "linear-gradient(160deg, #ffd9a8 0%, #f5a9c4 30%, #c9a7f0 60%, #8fb8f5 85%, #4aa3f0 100%)",
          }}
          className="absolute inset-0 -z-10 scale-125"
        />
        <div className="mx-auto max-w-5xl px-4 py-28 sm:px-6 sm:py-36">
          <Reveal>
            <h2 className="display-lg text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.18)]">
              This Source
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-3xl font-sans text-lg normal-case leading-relaxed tracking-normal text-ink/85 sm:text-xl">
              If there&apos;s one topic in the world that stirs more debate than
              anything else, it&apos;s religion. So set the labels aside. NDEs
              strip away the baggage of theological tradition and aggressive
              rhetoric, and deliver something genuinely rare: falsifiable,
              first-hand evidence — cross-checked and consistent across cultures
              and centuries.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mt-6 max-w-3xl font-sans text-lg normal-case leading-relaxed tracking-normal text-ink/85 sm:text-xl">
              We&apos;re not asking you to adopt a religion. We&apos;re asking you
              to look at the data — and to consider where it points.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
