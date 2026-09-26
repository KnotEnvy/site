import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageHero, { PillLink } from "@/components/ui/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import Panel from "@/components/ui/Panel";
import VerseCard from "@/components/ui/VerseCard";
import ContinueJourney from "@/components/ui/ContinueJourney";
import { Reveal } from "@/components/ui/Reveal";
import ThemeGlyph from "@/components/scripture/ThemeGlyph";
import ReflectionNote from "@/components/scripture/ReflectionNote";
import JsonLd from "@/components/seo/JsonLd";
import { STUDY_THEMES, themeBySlug } from "@/lib/content/scripture";
import { TRANSLATION_NOTE, verse } from "@/lib/content/bible";
import { buildMetadata, graph, articleLd, breadcrumbLd, abs, entity } from "@/lib/seo";

/** Every study is known at build time: static pages, and any other slug 404s. */
export const dynamicParams = false;

export function generateStaticParams() {
  return STUDY_THEMES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/scripture/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const theme = themeBySlug(slug);
  if (!theme) return {};
  return buildMetadata({
    path: `/scripture/${theme.slug}`,
    title: `${theme.title}: ${theme.question} Bible Study`,
    description: theme.description,
    og: "/og/scripture.jpg",
    ogAlt: `Eternal Truth Bible study: ${theme.title}`,
    keywords: [
      `Bible verses about ${theme.title.toLowerCase()}`,
      `what does the Bible say about ${theme.title.toLowerCase()}`,
      theme.question,
      "Bible study",
    ],
  });
}

export default async function StudyPage({ params }: PageProps<"/scripture/[slug]">) {
  const { slug } = await params;
  const theme = themeBySlug(slug);
  if (!theme) notFound();

  const i = STUDY_THEMES.findIndex((t) => t.slug === theme.slug);
  const prev = STUDY_THEMES[(i - 1 + STUDY_THEMES.length) % STUDY_THEMES.length];
  const next = STUDY_THEMES[(i + 1) % STUDY_THEMES.length];
  const path = `/scripture/${theme.slug}`;
  const trail = [
    { name: "Home", path: "/" },
    { name: "The Word", path: "/scripture" },
    { name: theme.title, path },
  ];

  const ld = graph(
    {
      ...articleLd({
        path,
        headline: `${theme.title}: ${theme.question}`,
        description: theme.description,
        image: "/og/scripture.jpg",
        type: "LearningResource",
        about: [entity("Book", "Bible", "Bible")],
      }),
      learningResourceType: "Bible study",
      educationalLevel: "Beginner",
      isAccessibleForFree: true,
      teaches: theme.question,
      isPartOf: { "@type": "LearningResource", name: "The Word: A Study Guide", url: abs("/scripture") },
      // The passages studied, as quotations from the (public domain) WEB.
      hasPart: theme.studies.map((s) => {
        const p = verse(s.key);
        return {
          "@type": "Quotation",
          text: p.text,
          name: `${p.ref}: ${s.heading}`,
          isPartOf: { "@type": "Book", name: "World English Bible" },
        };
      }),
    },
    breadcrumbLd(trail)
  );

  return (
    <>
      <JsonLd data={ld} />

      <PageHero
        eyebrow={`Bible study · ${theme.title}`}
        trail={trail}
        tone="light"
        lines={[{ text: theme.question }]}
        lede={<p>{theme.intro}</p>}
        aside={
          // Size by length: a long key passage (Revelation 21:3-4) at "lg"
          // ran past the bottom of the viewport.
          <VerseCard
            passage={verse(theme.keyVerse)}
            tone="light"
            size={verse(theme.keyVerse).text.length > 180 ? "sm" : verse(theme.keyVerse).text.length > 110 ? "md" : "lg"}
          />
        }
        titleSize="lg"
      >
        <div className="flex flex-wrap items-center gap-3">
          <PillLink href="#study-1" variant="primary">
            Begin the study
          </PillLink>
          <span className="rounded-full bg-paper/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ink/70 backdrop-blur">
            {theme.studies.length} passages · about 15 minutes
          </span>
        </div>
      </PageHero>

      {/* The studies */}
      <section aria-label={`${theme.title} passages`} className="relative z-10 overflow-x-clip px-4 pb-10 sm:px-6">
        <ol className="mx-auto max-w-6xl space-y-10">
          {theme.studies.map((s, n) => {
            const p = verse(s.key);
            return (
              <li key={s.key} id={`study-${n + 1}`} className="scroll-mt-24">
                <Reveal from={n % 2 === 0 ? "left" : "right"}>
                  <article className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                    <header className="lg:sticky lg:top-28 lg:self-start">
                      <div className="rounded-2xl bg-ink/70 p-6 text-white ring-1 ring-white/10 backdrop-blur-md">
                        <p className="font-display text-6xl leading-none text-dawn">{String(n + 1).padStart(2, "0")}</p>
                        <h2 className="mt-3 text-3xl text-white sm:text-4xl">{s.heading}</h2>
                        <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-white/60">{p.ref}</p>
                      </div>
                    </header>
                    <div className="space-y-4">
                      <VerseCard passage={p} tone="light" size="md" />
                      <Panel tone="light" className="p-6">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-scripture-deep">Context</p>
                        <p className="copy mt-1 text-ink/85">{s.context}</p>
                        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-scripture-deep">What it means</p>
                        <p className="copy mt-1 text-ink/85">{s.meaning}</p>
                        {s.echo && (
                          <div className="mt-5 rounded-xl bg-sky-light/40 p-4 ring-1 ring-sky/30">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-deep">NDE echo</p>
                            <p className="copy mt-1 text-sm text-ink/80">{s.echo}</p>
                          </div>
                        )}
                        <div className="mt-5 rounded-xl bg-scripture/10 p-4 ring-1 ring-scripture/30">
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-scripture-deep">Reflect</p>
                          <p className="copy mt-1 font-semibold text-ink">{s.reflect}</p>
                          <ReflectionNote noteKey={`${theme.slug}-${n + 1}`} prompt={s.reflect} />
                        </div>
                      </Panel>
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Summary + discussion */}
      <section aria-labelledby="together-title" className="relative z-10 overflow-x-clip px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div>
            <SectionTitle id="together-title" eyebrow="Putting it together" title="What we have seen" accent="text-dawn" />
            <Reveal from="left" className="mt-6">
              <Panel tone="light" className="p-6">
                <p className="copy text-lg text-ink/85">{theme.summary}</p>
              </Panel>
            </Reveal>
          </div>
          <div>
            <SectionTitle eyebrow="For a group, or a friend" title="Talk it over" accent="text-dawn" as="h2" />
            <Reveal from="right" className="mt-6">
              <Panel tone="light" className="p-6">
                <ol className="copy list-decimal space-y-3 pl-5 text-ink/85 marker:font-bold marker:text-scripture-deep">
                  {theme.discuss.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ol>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-ink/60">Keep reading</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {theme.further.map((f) => (
                    <li key={f.chapter}>
                      <a
                        href={`https://www.bible.com/bible/111/${f.chapter}.NIV`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-full bg-ink px-3.5 py-1.5 text-xs font-bold tracking-[0.06em] text-paper transition hover:bg-ink/85"
                      >
                        {f.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </Panel>
            </Reveal>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-6xl text-xs text-white/75 drop-shadow">{TRANSLATION_NOTE}</p>
      </section>

      {/* Other studies */}
      <nav aria-label="More studies" className="relative z-10 overflow-x-clip px-4 pb-10 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2">
          {[
            { t: prev, dir: "Previous study" },
            { t: next, dir: "Next study" },
          ].map(({ t, dir }) => (
            <Reveal key={dir} from={dir.startsWith("Prev") ? "left" : "right"}>
              <Link
                href={`/scripture/${t.slug}`}
                className="group flex items-center gap-5 rounded-2xl bg-paper/90 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur-md transition hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-scripture"
              >
                <span className="text-scripture">
                  <ThemeGlyph kind={t.glyph} className="h-10 w-10" />
                </span>
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[0.2em] text-ink/55">{dir}</span>
                  <span className="block font-display text-3xl leading-none text-ink">{t.title}</span>
                  <span className="copy block text-sm text-ink/65">{t.question}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </nav>

      <ContinueJourney from="/scripture" heading="Continue the discovery" />
    </>
  );
}
