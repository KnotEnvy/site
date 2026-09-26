import PageHero, { PillLink } from "@/components/ui/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import Panel from "@/components/ui/Panel";
import VerseCard from "@/components/ui/VerseCard";
import ContinueJourney from "@/components/ui/ContinueJourney";
import ScrollQuote from "@/components/ui/ScrollQuote";
import { Reveal } from "@/components/ui/Reveal";
import MindsConstellation from "@/components/minds/MindsConstellation";
import BigBangScrub from "@/components/minds/BigBangScrub";
import FineTuning from "@/components/minds/FineTuning";
import BreathPrayer from "@/components/minds/BreathPrayer";
import JsonLd from "@/components/seo/JsonLd";
import { COSMOLOGISTS, CONTEMPLATIVES, CONVERTS, FOUNDERS, TUNING_MINDS, type Mind } from "@/lib/content/minds";
import { verse } from "@/lib/content/bible";
import { pageFor } from "@/lib/pages";
import { pageMetadata, graph, articleLd, breadcrumbLd, entity, faqLd } from "@/lib/seo";

const PAGE = pageFor("/great-minds");

export const metadata = pageMetadata(PAGE, {
  keywords: [
    "scientists who believed in God",
    "famous scientists faith",
    "fine-tuning of the universe",
    "Big Bang Lemaître priest",
    "Max Planck God quote",
    "Isaac Newton God",
    "Francis Collins Language of God",
    "atheists who became Christians",
    "breath prayer",
  ],
});

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "Great Minds", path: PAGE.href },
];

const ALL: Mind[] = [...FOUNDERS, ...COSMOLOGISTS, ...TUNING_MINDS, ...CONVERTS];

const FAQ = [
  {
    q: "Did famous scientists believe in God?",
    a: "Many of the founders of modern science did, including Kepler, Pascal, Newton, Boyle, Faraday, Maxwell and Mendel, and they saw their work as studying God's creation. Max Planck, who originated quantum theory, wrote that both religion and science require a belief in God. Others, like Einstein, rejected a personal God but refused to call themselves atheists.",
  },
  {
    q: "Who first proposed the Big Bang theory?",
    a: "Georges Lemaître, a Belgian physicist who was also a Catholic priest, proposed the expanding universe in 1927 and a beginning from a \"primeval atom\" in 1931. The theory became the scientific consensus after Arno Penzias and Robert Wilson discovered the cosmic microwave background in 1965.",
  },
  {
    q: "What is the fine-tuning of the universe?",
    a: "Physicists have found that several fundamental constants, such as the strength of gravity, the strong nuclear force and the cosmological constant, fall within extremely narrow ranges that allow stars, chemistry and life. Scientists debate the explanation (a multiverse, a deeper law, or design), but the fine-tuning itself is widely acknowledged.",
  },
  {
    q: "Which famous atheists became believers?",
    a: "C. S. Lewis, the Oxford scholar, became a Christian in 1931. The philosopher Antony Flew, a leading atheist for fifty years, announced in 2004 that he had come to believe in God. Geneticist Francis Collins and journalist Lee Strobel were atheists who became Christians after investigating the evidence.",
  },
];

const ld = graph(
  articleLd({
    path: PAGE.href,
    headline: "Great Minds on God: Scientists, Philosophers and Mystics in Their Own Words",
    description: PAGE.description,
    image: PAGE.og,
    about: [
      entity("Thing", "Relationship between religion and science", "Relationship_between_religion_and_science"),
      entity("Thing", "Fine-tuned universe", "Fine-tuned_universe"),
      entity("Thing", "Big Bang", "Big_Bang"),
      entity("Thing", "Christian contemplation", "Christian_contemplation"),
    ],
    mentions: [...ALL.map((m) => entity("Person", m.name, m.wiki)), ...CONTEMPLATIVES.map((c) => entity("Person", c.name, c.wiki))],
  }),
  breadcrumbLd(TRAIL),
  faqLd(FAQ)
);

function MindCard({ m, tone = "dark" }: { m: Mind; tone?: "dark" | "light" }) {
  const dark = tone === "dark";
  return (
    <Panel tone={tone} as="article" id={`mind-${m.id}`} className="flex h-full scroll-mt-28 flex-col p-6">
      <p className={dark ? "text-xs font-bold uppercase tracking-[0.2em] text-dawn" : "text-xs font-bold uppercase tracking-[0.2em] text-blaze"}>
        {m.field}
      </p>
      <h3 className={dark ? "mt-2 text-3xl text-white" : "mt-2 text-3xl text-ink"}>{m.name}</h3>
      <p className={dark ? "text-sm font-semibold text-white/55" : "text-sm font-semibold text-ink/55"}>{m.years}</p>
      <p className={dark ? "copy mt-3 text-white/80" : "copy mt-3 text-ink/80"}>{m.known}</p>
      {m.quote && (
        <figure className="mt-4">
          <blockquote className={dark ? "verse text-xl text-white" : "verse text-xl text-ink"}>
            <span aria-hidden="true" className="text-dawn">“</span>
            {m.quote}
            <span aria-hidden="true" className="text-dawn">”</span>
          </blockquote>
          <figcaption className={dark ? "mt-2 text-xs text-white/55" : "mt-2 text-xs text-ink/55"}>
            <cite className="not-italic">{m.source}</cite>
          </figcaption>
        </figure>
      )}
      <p className={dark ? "copy mt-4 flex-1 border-t border-white/10 pt-4 text-sm text-white/70" : "copy mt-4 flex-1 border-t border-ink/10 pt-4 text-sm text-ink/70"}>
        {m.note}
      </p>
    </Panel>
  );
}

export default function GreatMindsPage() {
  return (
    <>
      <JsonLd data={ld} />

      <PageHero
        eyebrow="Great Minds · Science & faith"
        trail={TRAIL}
        tone="dark"
        lines={[{ text: "They followed" }, { text: "the evidence" }, { text: "all the way up.", className: "text-dawn" }]}
        lede={
          <>
            The founders of modern science believed they were reading a book God
            wrote. Some of the last century&apos;s greatest physicists, not
            believers at all, still found themselves staring at design. And the
            contemplatives found Him in stillness. Here is what they actually
            said, <strong className="font-semibold text-white">in their own words, with sources</strong>.
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <PillLink href="#founders-title" variant="dawn">
            Meet the founders
          </PillLink>
          <PillLink href="#tuning-title" variant="ghost">
            Tune the universe
          </PillLink>
          <PillLink href="#stillness-title" variant="ghost">
            Try a breath prayer
          </PillLink>
        </div>
      </PageHero>

      {/* The founders */}
      <section aria-labelledby="founders-title" className="relative z-10 overflow-x-clip px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionTitle id="founders-title" eyebrow="I · The founders" title="The laws of nature had an Author" accent="text-dawn" />
          <Reveal from="left" delay={0.1}>
            <p className="copy mt-6 max-w-2xl rounded-2xl bg-night/55 p-5 text-lg text-white/85 ring-1 ring-white/10 backdrop-blur-md">
              Modern science grew up inside a conviction: that the universe is
              orderly because a rational God made it, and that studying it is a
              way of honoring Him. The people who built the foundations
              believed it. Touch a star to meet them.
            </p>
          </Reveal>
          <Reveal from="in" className="mt-10">
            <MindsConstellation minds={FOUNDERS} />
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FOUNDERS.map((m, i) => (
              <Reveal key={m.id} from="up" delay={(i % 3) * 0.06} className="h-full">
                <MindCard m={m} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ScrollQuote
        kicker="Proverbs 25:2"
        text="It is the glory of God to conceal a thing, but the glory of kings is to search out a matter."
        support="Science, on this view, is not a threat to faith. It is one of the ways we accept God's invitation to search."
        accent="text-dawn"
      />

      {/* The beginning */}
      <section aria-labelledby="beginning-title" className="relative z-10 overflow-x-clip px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionTitle id="beginning-title" eyebrow="II · The beginning" title="The universe had a beginning" accent="text-dawn" />
          <Reveal from="left" delay={0.1}>
            <p className="copy mt-6 max-w-2xl rounded-2xl bg-night/55 p-5 text-lg text-white/85 ring-1 ring-white/10 backdrop-blur-md">
              For most of history, many thinkers assumed the universe was
              eternal. Then, in the twentieth century, the evidence turned: space
              itself is expanding, and it had a beginning. The first person to
              say so was a priest. Scroll to run the clock.
            </p>
          </Reveal>
          <div className="mt-10">
            <BigBangScrub />
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {COSMOLOGISTS.map((m, i) => (
              <Reveal key={m.id} from={i % 2 === 0 ? "left" : "right"} className="h-full">
                <MindCard m={m} />
              </Reveal>
            ))}
          </div>
          <Reveal from="up" className="mt-8 max-w-2xl">
            <VerseCard passage={verse("Genesis 1:1")} tone="dark" size="md" />
          </Reveal>
        </div>
      </section>

      {/* Fine-tuning */}
      <section aria-labelledby="tuning-title" className="relative z-10 overflow-x-clip px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionTitle id="tuning-title" eyebrow="III · The fine-tuning" title="Tune the universe" accent="text-dawn" />
          <Reveal from="left" delay={0.1}>
            <p className="copy mt-6 max-w-2xl rounded-2xl bg-night/55 p-5 text-lg text-white/85 ring-1 ring-white/10 backdrop-blur-md">
              The laws of physics contain numbers nobody can derive, only
              measure. Change almost any of them even slightly and you get a
              universe with no stars, no chemistry, no life. Try it: bring all
              three dials into the green.
            </p>
          </Reveal>
          <div className="mt-10">
            <FineTuning />
          </div>

          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                n: "10¹²⁰",
                label: "The mismatch between the measured energy of empty space and the simplest quantum estimate: about 120 orders of magnitude, often called the worst prediction in physics.",
              },
              {
                n: "1 in 10^(10^123)",
                label: "Roger Penrose's estimate of the odds against the universe's extremely ordered, low-entropy beginning arising by chance (The Emperor's New Mind, 1989).",
              },
              {
                n: "7.65 MeV",
                label: "The energy level Fred Hoyle predicted carbon must have for stars to make it - later confirmed in the lab. Without it, no carbon, and no us.",
              },
            ].map((s, i) => (
              <li key={s.n}>
                <Reveal from="up" delay={i * 0.07} className="h-full">
                  <Panel tone="dark" className="h-full p-6">
                    <p className="font-display text-4xl leading-none text-dawn">{s.n}</p>
                    <p className="copy mt-3 text-sm text-white/75">{s.label}</p>
                  </Panel>
                </Reveal>
              </li>
            ))}
          </ul>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TUNING_MINDS.map((m, i) => (
              <Reveal key={m.id} from="up" delay={i * 0.06} className="h-full">
                <MindCard m={m} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Mind behind matter */}
      <section aria-labelledby="mind-title" className="relative z-10 overflow-x-clip px-4 py-24 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionTitle id="mind-title" eyebrow="IV · The mind" title="Mind behind matter" accent="text-dawn" />
            <Reveal from="left" delay={0.1}>
              <div className="copy mt-6 space-y-4 rounded-2xl bg-paper/90 p-6 text-lg text-ink/85 shadow-xl backdrop-blur-md">
                <p>
                  Science can map which brain regions light up when you see red.
                  It cannot yet say why there is <em>something it is like</em> to
                  see red at all. The philosopher David Chalmers named this the
                  &ldquo;hard problem of consciousness&rdquo; in 1995. It remains
                  unsolved.
                </p>
                <p>
                  Planck and Eddington, two of the founders of modern physics,
                  suspected the answer ran the other way: that mind is not a late
                  accident of matter, but closer to its source. That is also
                  where the near-death research keeps pointing.
                </p>
                <PillLink href="/evidence" variant="primary">
                  See the consciousness evidence
                </PillLink>
              </div>
            </Reveal>
          </div>
          <Reveal from="right" delay={0.15}>
            <VerseCard passage={verse("Colossians 1:17")} tone="dark" size="lg" />
          </Reveal>
        </div>
      </section>

      {/* Converts */}
      <section aria-labelledby="converts-title" className="relative z-10 overflow-x-clip px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionTitle id="converts-title" eyebrow="V · The skeptics" title="The skeptics who changed their minds" accent="text-dawn" />
          <Reveal from="left" delay={0.1}>
            <p className="copy mt-6 max-w-2xl rounded-2xl bg-night/55 p-5 text-lg text-white/85 ring-1 ring-white/10 backdrop-blur-md">
              Some of the most compelling voices for God belonged to people who
              spent years arguing against Him, and changed their minds because
              of where the evidence led.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CONVERTS.map((m, i) => (
              <Reveal key={m.id} from={i % 2 === 0 ? "tilt-left" : "tilt-right"} delay={i * 0.05} className="h-full">
                <MindCard m={m} tone="light" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stillness */}
      <section aria-labelledby="stillness-title" className="relative z-10 overflow-x-clip px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionTitle id="stillness-title" eyebrow="VI · The contemplatives" title="The oldest laboratory: stillness" accent="text-dawn" />
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
            <div className="space-y-4">
              <Reveal from="left">
                <p className="copy rounded-2xl bg-night/55 p-5 text-lg text-white/85 ring-1 ring-white/10 backdrop-blur-md">
                  Long before telescopes, seekers in every age went looking for
                  God in silence. Mystics, monks and one of history&apos;s great
                  mathematicians describe the same thing the near-death
                  survivors do: a Presence, overwhelming love, certainty. Brain
                  scans of praying Franciscan nuns at the University of
                  Pennsylvania even show the sense of self quieting as prayer
                  deepens. A scanner can show what prayer does to the brain. It
                  cannot tell you whether Someone is listening.
                </p>
              </Reveal>
              <ol className="space-y-3">
                {CONTEMPLATIVES.map((c, i) => (
                  <li key={c.name}>
                    <Reveal from="left" delay={i * 0.05}>
                      <Panel tone="dark" as="article" className="p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-dawn">
                          {c.name} · {c.years}
                        </p>
                        <blockquote className="verse mt-2 text-xl text-white">{c.words}</blockquote>
                        <p className="mt-1 text-xs text-white/50">
                          <cite className="not-italic">{c.source}</cite>
                        </p>
                        <p className="copy mt-3 text-sm text-white/70">{c.note}</p>
                      </Panel>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>
            <Reveal from="right" className="lg:sticky lg:top-24">
              <BreathPrayer />
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="minds-faq-title" className="relative z-10 overflow-x-clip px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <SectionTitle id="minds-faq-title" eyebrow="Questions people ask" title="Science and God: FAQ" accent="text-dawn" />
          <div className="mt-8 space-y-3">
            {FAQ.map((f) => (
              <Reveal key={f.q} from="up">
                <Panel tone="dark" className="p-6">
                  <h3 className="copy text-lg font-semibold leading-snug text-white">{f.q}</h3>
                  <p className="copy mt-2 text-white/80">{f.a}</p>
                </Panel>
              </Reveal>
            ))}
          </div>
          <Reveal from="up" className="mt-10">
            <VerseCard passage={verse("Romans 1:20")} tone="dark" size="md" />
          </Reveal>
        </div>
      </section>

      <ContinueJourney from={PAGE.href} />
    </>
  );
}
