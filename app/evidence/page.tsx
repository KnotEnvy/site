import PageHero, { PillLink } from "@/components/ui/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import Panel from "@/components/ui/Panel";
import Accordion from "@/components/ui/Accordion";
import VerseCard from "@/components/ui/VerseCard";
import ContinueJourney from "@/components/ui/ContinueJourney";
import ScrollLine from "@/components/ui/ScrollLine";
import ScrollQuote from "@/components/ui/ScrollQuote";
import { Reveal } from "@/components/ui/Reveal";
import FlatlineScrub from "@/components/evidence/FlatlineScrub";
import JsonLd from "@/components/seo/JsonLd";
import { CORE_ELEMENTS, FAQ, HARD_CASES, LANCET, OBJECTIONS, STUDIES } from "@/lib/content/evidence";
import { verse } from "@/lib/content/bible";
import { pageFor } from "@/lib/pages";
import { pageMetadata, graph, articleLd, breadcrumbLd, faqLd, entity } from "@/lib/seo";
import { clsx } from "@/lib/clsx";

const PAGE = pageFor("/evidence");

export const metadata = pageMetadata(PAGE, {
  keywords: [
    "near-death experience evidence",
    "NDE research",
    "AWARE study",
    "Pim van Lommel Lancet",
    "Pam Reynolds",
    "consciousness after death",
    "veridical NDE",
    "are near-death experiences real",
  ],
});

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "Evidence", path: PAGE.href },
];

const ld = graph(
  articleLd({
    path: PAGE.href,
    headline: "The Evidence for Life After Death: What Near-Death Experience Research Shows",
    description: PAGE.description,
    image: PAGE.og,
    about: [
      entity("Thing", "Near-death experience", "Near-death_experience"),
      entity("Thing", "Consciousness", "Consciousness"),
      entity("Thing", "Cardiac arrest", "Cardiac_arrest"),
    ],
    mentions: [
      entity("Person", "Pim van Lommel", "Pim_van_Lommel"),
      entity("Person", "Sam Parnia", "Sam_Parnia"),
      entity("Person", "Bruce Greyson", "Bruce_Greyson"),
      entity("Person", "Raymond Moody", "Raymond_Moody"),
      entity("Person", "Michael Sabom", "Michael_Sabom"),
      entity("Person", "Kenneth Ring", "Kenneth_Ring"),
      entity("Thing", "Pam Reynolds case", "Pam_Reynolds_case"),
    ],
    citation: STUDIES.filter((s) => s.url).map((s) => ({
      "@type": "ScholarlyArticle",
      name: s.title,
      author: s.who,
      datePublished: s.year,
      url: s.url,
    })),
  }),
  breadcrumbLd(TRAIL),
  faqLd(FAQ)
);

export default function EvidencePage() {
  return (
    <>
      <JsonLd data={ld} />

      <PageHero
        eyebrow="The Case File · Evidence"
        trail={TRAIL}
        lines={[
          { text: "What happens" },
          { text: "when the heart" },
          { text: "stops?", className: "text-[#7fe9ff]" },
        ]}
        lede={
          <>
            Since the 1970s, cardiologists, psychiatrists and neuroscientists have
            interviewed thousands of people revived from clinical death. Here is
            what they found, the cases that are hardest to explain, and the
            skeptics&apos; best answers,{" "}
            <strong className="font-semibold text-white">side by side</strong>.
            Then decide for yourself.
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <PillLink href="#flatline-title" variant="dawn">
            Start the timeline
          </PillLink>
          <PillLink href="#skeptics" variant="ghost">
            Jump to the skeptics
          </PillLink>
        </div>
      </PageHero>

      <FlatlineScrub />

      {/* The core elements */}
      <section aria-labelledby="core-title" className="relative z-10 overflow-x-clip px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            id="core-title"
            eyebrow="Chapter 02 · The pattern"
            title="The same journey, again and again"
            accent="text-dawn"
          />
          <Reveal from="left" delay={0.1}>
            <p className="copy mt-6 max-w-2xl rounded-2xl bg-night/55 p-5 text-lg text-white/85 ring-1 ring-white/10 backdrop-blur-md">
              In 2001 a Dutch cardiologist followed every cardiac-arrest survivor
              in ten hospitals, not just the ones with a story to tell. Of 344
              patients, 62 reported an NDE. This is what they described.
            </p>
          </Reveal>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CORE_ELEMENTS.map((el, i) => (
              <li key={el.label}>
                <Reveal from="up" delay={(i % 5) * 0.06} className="h-full">
                  <Panel tone="dark" className="flex h-full flex-col p-5">
                    <span className="font-display text-5xl leading-none text-white">
                      {el.pct}
                      <span className="text-2xl text-white/60">%</span>
                    </span>
                    <span className="mt-3 block font-semibold text-white">{el.label}</span>
                    <span className="copy mt-1 block flex-1 text-sm text-white/65">{el.note}</span>
                    <span className="mt-4 block h-1.5 overflow-hidden rounded-full bg-white/10">
                      <span
                        className="fill-bar block h-full rounded-full bg-gradient-to-r from-[#7fe9ff] to-dawn"
                        style={{ "--v": el.pct / 60 } as React.CSSProperties}
                      />
                    </span>
                    <span className="mt-2 text-[11px] text-white/45">
                      {el.n} of 62 patients
                    </span>
                  </Panel>
                </Reveal>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-white/60 drop-shadow">
            Source:{" "}
            <a href={LANCET.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
              {LANCET.authors}, &ldquo;{LANCET.title},&rdquo; <cite>{LANCET.journal}</cite>, {LANCET.year}
            </a>
            .
          </p>
        </div>
      </section>

      <ScrollQuote
        kicker="The question at the center"
        text="How could a clear consciousness outside one's body be experienced at the moment the brain no longer functions?"
        support="Paraphrasing the question Pim van Lommel's team put in the discussion of their Lancet paper. Every study below is, one way or another, an attempt to answer it."
        accent="text-[#7fe9ff]"
      />

      {/* Landmark studies */}
      <section aria-labelledby="studies-title" className="relative z-10 overflow-x-clip px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <SectionTitle id="studies-title" eyebrow="Chapter 03 · The research" title="Fifty years of study" accent="text-dawn" />

          <div className="relative mt-14">
            <ScrollLine className="bottom-0 left-4 top-0 sm:left-1/2" />
            <ol className="space-y-8">
              {STUDIES.map((s, i) => {
                const left = i % 2 === 0;
                return (
                  <li key={s.title} className="relative pl-12 sm:grid sm:grid-cols-2 sm:gap-12 sm:pl-0">
                    <span
                      aria-hidden="true"
                      className="absolute left-4 top-6 h-3 w-3 -translate-x-1/2 rounded-full bg-dawn shadow-[0_0_14px_4px_rgba(255,207,122,0.55)] sm:left-1/2"
                    />
                    <Reveal
                      from={left ? "tilt-left" : "tilt-right"}
                      exit={left ? "left" : "right"}
                      className={clsx(!left && "sm:col-start-2")}
                    >
                      <Panel tone="dark" as="article" className="p-6">
                        <p className="font-display text-4xl leading-none text-dawn">{s.year}</p>
                        <h3 className="mt-3 text-2xl text-white">{s.title}</h3>
                        <p className="mt-1 text-sm font-semibold text-white/60">{s.who}</p>
                        <p className="copy mt-3 text-white/80">{s.finding}</p>
                        {s.url && (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-block text-xs font-bold uppercase tracking-[0.16em] text-[#7fe9ff] underline-offset-4 hover:underline"
                          >
                            Read the paper ↗
                          </a>
                        )}
                      </Panel>
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* The hard cases */}
      <section aria-labelledby="cases-title" className="relative z-10 overflow-x-clip px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionTitle id="cases-title" eyebrow="Chapter 04 · The hard cases" title="The ones that are hardest to explain" accent="text-dawn" />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {HARD_CASES.map((c, i) => (
              <Reveal key={c.title} from={i % 2 === 0 ? "left" : "right"} delay={0.05}>
                <Panel tone="dark" as="article" className="h-full p-6 sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7fe9ff]">{c.kicker}</p>
                  <h3 className="mt-2 text-3xl text-white">{c.title}</h3>
                  <p className="copy mt-4 text-white/85">{c.what}</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-dawn">Why it matters</p>
                      <p className="copy mt-1 text-sm text-white/80">{c.why}</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">The honest caveat</p>
                      <p className="copy mt-1 text-sm text-white/70">{c.caveat}</p>
                    </div>
                  </div>
                </Panel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* The skeptics' ledger */}
      <section id="skeptics" aria-labelledby="skeptics-title" className="relative z-10 scroll-mt-24 overflow-x-clip px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <SectionTitle id="skeptics-title" eyebrow="Chapter 05 · The skeptics" title="The best objections, answered fairly" accent="text-dawn" />
          <Reveal from="left" delay={0.1}>
            <p className="copy mt-6 rounded-2xl bg-night/55 p-5 text-lg text-white/85 ring-1 ring-white/10 backdrop-blur-md">
              A case is only as strong as the objections it survives. These are
              the serious scientific explanations, stated as their proponents
              would state them, with what the research shows in reply.
            </p>
          </Reveal>
          <div className="mt-8 space-y-3">
            {OBJECTIONS.map((o, i) => (
              <Reveal key={o.claim} from="up" delay={i * 0.04}>
                <Accordion tone="dark" kicker={`Objection ${i + 1}`} summary={`“${o.claim}”`}>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">The explanation</p>
                  <p className="mt-1">{o.explanation}</p>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[#7fe9ff]">What the research shows</p>
                  <p className="mt-1">{o.response}</p>
                  <p className="mt-4 rounded-xl bg-white/5 p-3 font-semibold text-dawn ring-1 ring-white/10">{o.take}</p>
                </Accordion>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* What it does and doesn't prove */}
      <section aria-labelledby="limits-title" className="relative z-10 overflow-x-clip px-4 py-24 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionTitle id="limits-title" eyebrow="Chapter 06 · Honest limits" title="Evidence, not proof" accent="text-dawn" />
            <Reveal from="left" delay={0.1}>
              <div className="copy mt-6 space-y-4 rounded-2xl bg-paper/90 p-6 text-lg text-ink/85 shadow-xl backdrop-blur-md">
                <p>
                  No study has proven that consciousness survives death, and a
                  2021 study of 101 patients whose hearts were deliberately
                  stopped during surgery found none who reported an NDE. Honest
                  evidence has to include that.
                </p>
                <p>
                  What the research has shown is this: clear, structured,
                  life-changing experiences are reported during clinical death,
                  across every culture and belief; some include accurate
                  perception of events the person should not have been able to
                  perceive; and no physical explanation yet accounts for all of it.
                </p>
                <p className="font-semibold text-ink">
                  Scientists can measure the experience. What it points to is the
                  question every person has to answer for themselves.
                </p>
              </div>
            </Reveal>
          </div>
          <Reveal from="right" delay={0.15}>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-white/80 drop-shadow">
                Written nearly 2,000 years ago
              </p>
              <VerseCard passage={verse("2 Corinthians 12:2-4")} tone="dark" size="md" />
              <div className="mt-5">
                <PillLink href="/scripture/heaven" variant="dawn">
                  What Scripture says about Heaven
                </PillLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="relative z-10 overflow-x-clip px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <SectionTitle id="faq-title" eyebrow="Questions people ask" title="Near-death experiences: FAQ" accent="text-dawn" />
          <div className="mt-8 space-y-3">
            {FAQ.map((f) => (
              <Reveal key={f.q} from="up">
                <Accordion tone="light" summary={f.q}>
                  <p>{f.a}</p>
                </Accordion>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ContinueJourney from={PAGE.href} />
    </>
  );
}
