import { Reveal } from "@/components/ui/Reveal";
import SplitText from "@/components/ui/SplitText";
import Photo from "@/components/ui/Photo";
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
            Our purpose is simple: to show that near-death experiences don&apos;t
            merely hint at an afterlife — they build a real, evidence-based case
            for God. Studied across millions of accounts, they{" "}
            <span className="font-semibold text-ink">factually align</span> with
            what Scripture has said for thousands of years. And where we spend
            eternity depends on how we understand and live out the Bible, day to
            day.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_1fr_0.9fr] lg:items-start">
          <Reveal className="space-y-3 rounded-2xl bg-paper/85 p-6 backdrop-blur">
            <h3 className="font-display text-2xl text-blaze">
              What is a near-death experience?
            </h3>
            <p className="font-sans text-base normal-case leading-relaxed tracking-normal text-ink/80">
              An NDE occurs when a person is clinically dead — heart and brain
              activity ceased — yet retains vivid, structured consciousness.
              Millions report strikingly similar realities: leaving the body,
              meeting a divine presence, and returning forever changed.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="space-y-3 rounded-2xl bg-paper/85 p-6 backdrop-blur">
            <h3 className="font-display text-2xl text-blaze">
              The scientific case for God
            </h3>
            <p className="font-sans text-base normal-case leading-relaxed tracking-normal text-ink/80">
              It&apos;s easy to dismiss religion as inherited bias. It&apos;s far
              harder to ignore consistent, eyewitness testimony from thousands of
              modern people — scientists, atheists, skeptics — who flatlined on an
              operating table and came back. We bridge medical phenomenon and
              eternal truth.
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
              If there&apos;s one topic in the world that stirs more debate than
              anything else, it&apos;s religion. So set the labels aside. NDEs
              strip away the baggage of theological tradition and aggressive
              rhetoric, and deliver something genuinely rare: falsifiable,
              first-hand evidence — cross-checked and consistent across cultures
              and centuries.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mt-4 rounded-2xl bg-paper/85 p-5 font-sans text-lg normal-case leading-relaxed tracking-normal text-ink/85 backdrop-blur sm:text-xl">
              We&apos;re not asking you to adopt a religion. We&apos;re asking you
              to look at the data — and to consider where it points.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
