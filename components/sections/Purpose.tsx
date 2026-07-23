import { Reveal } from "@/components/ui/Reveal";
import SplitText from "@/components/ui/SplitText";
import Photo from "@/components/ui/Photo";
import EvidenceStats from "@/components/ui/EvidenceStats";
import { IMG } from "@/lib/media";

/**
 * Section 2 — no longer a solid coloured band. It floats over the continuous
 * descent sky; body copy lives in frosted-glass panels so it stays legible no
 * matter what colour the sky is at that scroll depth.
 */
export default function Purpose() {
  return (
    <section id="purpose" className="relative z-10">
      <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-36">
        <h2 className="display-lg">
          <span className="block">
            <SplitText
              text="The Truth."
              className="text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.45)]"
            />
          </span>
          <span className="block">
            <SplitText
              text="The Evidence."
              delay={0.18}
              className="text-ink drop-shadow-[0_2px_16px_rgba(255,255,255,0.6)]"
            />
          </span>
        </h2>

        <Reveal delay={0.2}>
          <p className="mt-8 max-w-3xl rounded-2xl bg-paper/85 p-5 font-sans text-lg normal-case leading-relaxed tracking-normal text-ink/85 backdrop-blur sm:text-xl">
            Our purpose is simple. Near-death experiences do more than hint at
            an afterlife; taken together, they build a serious, evidence-based
            case for God. Millions of accounts{" "}
            <span className="font-semibold text-ink">independently describe</span>{" "}
            what Scripture has described for thousands of years, often from
            people who had never read a word of it. If that is true, then where
            we spend eternity is the most practical question there is.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_1fr_0.9fr] lg:items-start">
          <Reveal className="space-y-3 rounded-2xl bg-paper/85 p-6 backdrop-blur">
            <h3 className="font-display text-2xl text-blaze">
              What is a near-death experience?
            </h3>
            <p className="font-sans text-base normal-case leading-relaxed tracking-normal text-ink/80">
              An NDE occurs when a person is revived from clinical death and
              returns with vivid, structured memories. Millions describe the
              same things: leaving the body, watching the room from above,
              meeting a presence of overwhelming love, and coming back changed
              for good.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="space-y-3 rounded-2xl bg-paper/85 p-6 backdrop-blur">
            <h3 className="font-display text-2xl text-blaze">
              The scientific case for God
            </h3>
            <p className="font-sans text-base normal-case leading-relaxed tracking-normal text-ink/80">
              Dismissing religion as inherited bias is easy. Dismissing
              thousands of surgeons, scientists, and lifelong skeptics who
              flatlined on an operating table and came back changed is much
              harder. Somewhere between the medical data and the testimony, a
              larger truth takes shape. Our job is to show it to you plainly.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <Photo
              src={IMG.science[2]}
              alt="Intensive care, the moment the heart stops"
              overlay
              sizes="(max-width: 1024px) 90vw, 30vw"
              className="aspect-[4/5] w-full rounded-2xl shadow-2xl ring-1 ring-white/20"
            />
          </Reveal>
        </div>

        {/* The evidence, at a glance: counters tick up as they scroll into view */}
        <EvidenceStats className="mt-24" />

        {/* "This Source" — now reads over the living sky, no competing gradient */}
        <div className="mt-28 max-w-3xl">
          <h2 className="display-lg">
            <SplitText
              text="This Source"
              className="text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.45)]"
            />
          </h2>
          <Reveal delay={0.15}>
            <p className="mt-8 rounded-2xl bg-paper/85 p-5 font-sans text-lg normal-case leading-relaxed tracking-normal text-ink/85 backdrop-blur sm:text-xl">
              No topic stirs more debate than religion, so set the labels aside
              for a moment. Near-death experiences carry none of the baggage of
              tradition or pulpit rhetoric. They are first-hand reports from
              ordinary people, collected and cross-checked by researchers for
              decades, and they keep agreeing with each other. That is rare,
              and it deserves your attention.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mt-4 rounded-2xl bg-paper/85 p-5 font-sans text-lg normal-case leading-relaxed tracking-normal text-ink/85 backdrop-blur sm:text-xl">
              We&apos;re not asking you to adopt a religion. We&apos;re asking
              you to look at the evidence and consider, honestly, where it
              points.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
