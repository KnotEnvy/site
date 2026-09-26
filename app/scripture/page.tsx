import Link from "next/link";
import PageHero, { PillLink } from "@/components/ui/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import Panel from "@/components/ui/Panel";
import VerseCard from "@/components/ui/VerseCard";
import ContinueJourney from "@/components/ui/ContinueJourney";
import { Reveal } from "@/components/ui/Reveal";
import ThemeGlyph from "@/components/scripture/ThemeGlyph";
import VerseExplorer, { type ExplorerItem } from "@/components/scripture/VerseExplorer";
import ReadingPlan from "@/components/scripture/ReadingPlan";
import MemoryVerse from "@/components/scripture/MemoryVerse";
import JsonLd from "@/components/seo/JsonLd";
import { MEMORY_VERSES, READING_PLAN, STUDY_THEMES } from "@/lib/content/scripture";
import { TRANSLATION_NOTE, chapterUrl, verse } from "@/lib/content/bible";
import { pageFor } from "@/lib/pages";
import { pageMetadata, graph, articleLd, breadcrumbLd, abs } from "@/lib/seo";

const PAGE = pageFor("/scripture");

export const metadata = pageMetadata(PAGE, {
  keywords: [
    "Bible study guide",
    "Bible verses about heaven",
    "Bible verses about death",
    "what does the Bible say about hell",
    "Bible verses about salvation",
    "free Bible study",
    "7 day Bible reading plan",
    "memorize Bible verses",
  ],
});

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "The Word", path: PAGE.href },
];

const STEPS = [
  { n: "01", title: "Read", body: "Read the verse, then the whole passage around it. Slowly. Out loud if you can." },
  { n: "02", title: "Understand", body: "Who wrote it, to whom, and why? Context is what keeps a verse from being twisted." },
  { n: "03", title: "Reflect", body: "What does it say about God? About you? Sit with one question rather than rushing to the next." },
  { n: "04", title: "Respond", body: "Turn it into a prayer, and one small, concrete step. That's where reading becomes living." },
];

const EXPLORER: ExplorerItem[] = STUDY_THEMES.flatMap((t) =>
  t.studies.map((s) => {
    const p = verse(s.key);
    return {
      ref: p.ref,
      text: p.text,
      heading: s.heading,
      theme: t.slug,
      themeTitle: t.title,
      chapterUrl: chapterUrl(p),
    };
  })
);

const ld = graph(
  {
    ...articleLd({
      path: PAGE.href,
      headline: "What the Bible Says About Eternity: A Free Bible Study Guide",
      description: PAGE.description,
      image: PAGE.og,
      type: "LearningResource",
    }),
    learningResourceType: "Bible study guide",
    educationalLevel: "Beginner",
    isAccessibleForFree: true,
    hasPart: STUDY_THEMES.map((t) => ({
      "@type": "LearningResource",
      name: `${t.title}: ${t.question}`,
      url: abs(`/scripture/${t.slug}`),
    })),
  },
  breadcrumbLd(TRAIL),
  {
    "@type": "ItemList",
    name: "Bible study themes",
    itemListElement: STUDY_THEMES.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.title,
      url: abs(`/scripture/${t.slug}`),
    })),
  }
);

export default function ScripturePage() {
  return (
    <>
      <JsonLd data={ld} />

      <PageHero
        eyebrow="The Word · A free study guide"
        trail={TRAIL}
        tone="light"
        lines={[
          { text: "What the Bible" },
          { text: "says about" },
          { text: "forever.", className: "text-blaze" },
        ]}
        lede={
          <>
            The near-death research raises the questions. Scripture answered them
            long before. This guide walks through what the Bible actually says
            about death, Heaven, Hell, grace and becoming new, verse by verse and{" "}
            <strong className="font-semibold text-ink">in context</strong>. Free,
            and for anyone, whether you have read the Bible for years or never
            opened one.
          </>
        }
        aside={<VerseCard passage={verse("Psalm 119:105")} tone="light" size="lg" />}
      >
        <div className="flex flex-wrap gap-3">
          <PillLink href="#themes-title" variant="primary">
            Choose a study
          </PillLink>
          <PillLink href="#plan-title" variant="outline">
            7-day plan
          </PillLink>
        </div>
      </PageHero>

      {/* How to study */}
      <section aria-labelledby="method-title" className="relative z-10 overflow-x-clip px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionTitle id="method-title" eyebrow="How to use this guide" title="Four steps, any passage" accent="text-dawn" />
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.n}>
                <Reveal from="up" delay={i * 0.08} className="h-full">
                  <Panel tone="light" className="h-full p-6">
                    <p className="font-display text-5xl leading-none text-scripture">{s.n}</p>
                    <h3 className="mt-4 text-3xl text-ink">{s.title}</h3>
                    <p className="copy mt-2 text-ink/75">{s.body}</p>
                  </Panel>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Themes */}
      <section aria-labelledby="themes-title" className="relative z-10 overflow-x-clip px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionTitle id="themes-title" eyebrow="Six studies" title="Start with a question" accent="text-dawn" />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {STUDY_THEMES.map((t, i) => {
              const key = verse(t.keyVerse);
              return (
                <li key={t.slug}>
                  <Reveal from={i % 2 === 0 ? "tilt-left" : "tilt-right"} delay={(i % 3) * 0.06} className="h-full">
                    <Link
                      href={`/scripture/${t.slug}`}
                      className="group flex h-full flex-col rounded-3xl bg-paper/90 p-7 shadow-xl ring-1 ring-black/5 backdrop-blur-md transition hover:-translate-y-1 hover:bg-paper hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-scripture"
                    >
                      <span className="block w-fit text-scripture transition-transform duration-500 group-hover:scale-110">
                        <ThemeGlyph kind={t.glyph} />
                      </span>
                      <span className="mt-5 font-display text-4xl leading-none text-ink">{t.title}</span>
                      <span className="copy mt-2 font-semibold text-ink/80">{t.question}</span>
                      <span className="copy mt-3 flex-1 text-sm text-ink/65">{t.blurb}</span>
                      <span className="verse mt-5 border-t border-ink/10 pt-4 text-lg text-ink/80">
                        &ldquo;{key.text.length > 110 ? `${key.text.slice(0, 107).trimEnd()}…` : key.text}&rdquo;
                        <span className="mt-1 block text-xs font-bold uppercase tracking-[0.18em] text-ink/50">{key.ref}</span>
                      </span>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-scripture-deep">
                        {t.studies.length} passages · Begin
                        <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
                      </span>
                    </Link>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Explorer */}
      <section aria-labelledby="explorer-title" className="relative z-10 overflow-x-clip px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionTitle id="explorer-title" eyebrow="Every passage in the guide" title="Search the verses" accent="text-dawn" />
          <Reveal from="up" className="mt-10">
            <VerseExplorer items={EXPLORER} themes={STUDY_THEMES.map((t) => ({ slug: t.slug, title: t.title }))} />
          </Reveal>
        </div>
      </section>

      {/* Reading plan + memory */}
      <section aria-labelledby="plan-title" className="relative z-10 overflow-x-clip px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle id="plan-title" eyebrow="Seven days" title="A reading journey" accent="text-dawn" />
            <Reveal from="left" className="mt-8">
              <ReadingPlan days={READING_PLAN} />
            </Reveal>
          </div>
          <div>
            <SectionTitle id="memory-title" eyebrow="Psalm 119:11" title="Hide it in your heart" accent="text-dawn" />
            <Reveal from="right" className="mt-8">
              <MemoryVerse passages={MEMORY_VERSES.map((k) => verse(k))} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Translations */}
      <section aria-labelledby="translations-title" className="relative z-10 overflow-x-clip px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <Reveal from="up">
            <Panel tone="light" className="p-6 sm:p-8">
              <h2 id="translations-title" className="text-3xl text-ink">
                About the translation
              </h2>
              <p className="copy mt-3 text-ink/80">
                {TRANSLATION_NOTE} Every passage links to its full chapter on
                Bible.com, where you can read it free in the NIV, ESV, NLT, KJV
                and hundreds of other translations. Looking for a Bible of your
                own? See our{" "}
                <Link href="/#bibles" className="font-semibold text-blaze underline-offset-4 hover:underline">
                  Bible recommendations
                </Link>
                .
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="https://www.bible.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold uppercase tracking-[0.14em] text-paper transition hover:bg-ink/85"
                >
                  Read free at Bible.com ↗
                </a>
              </div>
            </Panel>
          </Reveal>
        </div>
      </section>

      <ContinueJourney from={PAGE.href} />
    </>
  );
}
