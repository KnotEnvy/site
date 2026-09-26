import Link from "next/link";
import PageHero, { PillLink } from "@/components/ui/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import Panel from "@/components/ui/Panel";
import VerseCard from "@/components/ui/VerseCard";
import Accordion from "@/components/ui/Accordion";
import ContinueJourney from "@/components/ui/ContinueJourney";
import ScrollLine from "@/components/ui/ScrollLine";
import { Reveal } from "@/components/ui/Reveal";
import PrayerResponse from "@/components/begin/PrayerResponse";
import JsonLd from "@/components/seo/JsonLd";
import { verse, type VerseKey } from "@/lib/content/bible";
import { pageFor } from "@/lib/pages";
import { pageMetadata, graph, articleLd, breadcrumbLd, faqLd, entity } from "@/lib/seo";

const PAGE = pageFor("/begin");

export const metadata = pageMetadata(PAGE, {
  keywords: [
    "how to know God",
    "how to be saved",
    "how to become a Christian",
    "prayer of salvation",
    "what is the gospel",
    "I have doubts about God",
    "can God forgive me",
  ],
});

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "Begin", path: PAGE.href },
];

const MOVEMENTS: { n: string; title: string; body: string; verses: VerseKey[] }[] = [
  {
    n: "1",
    title: "You are loved",
    body: "Before you did anything right or wrong, God loved you. Not the improved version of you. You. That is where the whole story starts.",
    verses: ["John 3:16"],
  },
  {
    n: "2",
    title: "We are separated",
    body: "Every one of us has fallen short. Sin isn't only breaking rules; it is turning away from the One who made us, and it leaves a distance we cannot close on our own.",
    verses: ["Romans 3:23", "Isaiah 59:2"],
  },
  {
    n: "3",
    title: "Jesus closed the distance",
    body: "Jesus died in our place and rose again. What we could never earn, God offers as a gift: forgiveness, a new heart, and eternal life with Him.",
    verses: ["Romans 5:8", "Romans 6:23"],
  },
  {
    n: "4",
    title: "You can receive Him",
    body: "Not by trying harder, but by trusting Him: turning to God, believing Jesus is who He said He is, and receiving His life as a gift. He is already knocking.",
    verses: ["John 1:12", "Revelation 3:20"],
  },
];

const NEXT_STEPS = [
  {
    title: "Read",
    body: "Start with the Gospel of John, a chapter a day. It was written \"that you may believe\" (John 20:31).",
    href: "https://www.bible.com/bible/111/JHN.1.NIV",
    cta: "Open John 1",
    external: true,
  },
  {
    title: "Talk with God",
    body: "Prayer is simply talking with God, honestly, in your own words. A few quiet minutes each day. Try the breath prayer if you don't know where to start.",
    href: "/great-minds#stillness-title",
    cta: "Try a breath prayer",
  },
  {
    title: "Find a church",
    body: "Look for a local church that teaches from the Bible and takes Jesus seriously. Visit a few. Ask questions. Faith is personal, but it was never meant to be lonely.",
    href: "/scripture/salvation",
    cta: "Study salvation first",
  },
  {
    title: "Tell someone",
    body: "Tell a Christian friend, or tell us. Saying it out loud matters (Romans 10:9–10), and you shouldn't have to walk this alone.",
    href: "mailto:Eternaltruth303@gmail.com",
    cta: "Email us",
    external: true,
  },
];

const FAQ = [
  {
    q: "What if I still have doubts?",
    a: "Doubt is not the opposite of faith. Jesus' own disciple Thomas refused to believe the resurrection until he had seen for himself, and Jesus met him with evidence, not rejection (John 20:24–29). Keep asking honest questions. Read the Gospel of John, look at the evidence, and ask God to show you what is true.",
  },
  {
    q: "Do I have to clean up my life first?",
    a: "No. \"While we were yet sinners, Christ died for us\" (Romans 5:8). You come as you are. Change is what God does in you after you come, not the price of coming.",
  },
  {
    q: "What if I've done something unforgivable?",
    a: "The Bible says the blood of Jesus cleanses us from all sin (1 John 1:7). The apostle Paul had helped persecute and kill Christians, and called himself the worst of sinners (1 Timothy 1:15), and God made him new. No one is beyond His reach.",
  },
  {
    q: "If God is loving, why would Hell exist?",
    a: "It is the hardest question in Christianity, and it deserves a real answer rather than a slogan. At its core, the Bible describes Hell as separation from God, the source of every good thing, and it describes a God who is patient, \"not wishing that any should perish\" (2 Peter 3:9). Our study on Hell and Judgment walks through it honestly.",
  },
  {
    q: "What about people of other religions, or people who never hear?",
    a: "The Bible says God wants all people to be saved (1 Timothy 2:4) and that Jesus is the way to the Father (John 14:6). Christians have held different views about those who never hear the gospel, and they trust God to be perfectly just. What is clear is what it means for you, now that you have heard.",
  },
  {
    q: "Do near-death experiences prove Christianity?",
    a: "No single experience proves a belief system, and we don't claim that. We believe the evidence from NDEs, science and history points strongly to God and to life after death. Scripture is where we learn who that God is: the One who showed Himself in Jesus.",
  },
];

const ld = graph(
  articleLd({
    path: PAGE.href,
    headline: "How to Know God: Your Next Step",
    description: PAGE.description,
    image: PAGE.og,
    about: [
      entity("Thing", "Salvation in Christianity", "Salvation_in_Christianity"),
      entity("Thing", "Gospel", "Gospel"),
      entity("Thing", "Prayer", "Prayer"),
    ],
  }),
  breadcrumbLd(TRAIL),
  faqLd(FAQ)
);

export default function BeginPage() {
  return (
    <>
      <JsonLd data={ld} />

      <PageHero
        eyebrow="Begin · Your next step"
        trail={TRAIL}
        tone="dark"
        lines={[{ text: "How to" }, { text: "know God.", className: "text-dawn" }]}
        lede={
          <>
            If something in the testimonies, the science or the Scripture has
            stirred you, you are not alone, and it is not too late. Here is the
            heart of the message as simply as we can put it, a prayer if you
            want one, and{" "}
            <strong className="font-semibold text-white">honest answers</strong> to
            the questions people ask.
          </>
        }
        aside={<VerseCard passage={verse("Jeremiah 29:13")} tone="dark" size="lg" />}
      >
        <div className="flex flex-wrap gap-3">
          <PillLink href="#message-title" variant="dawn">
            The message
          </PillLink>
          <PillLink href="#prayer-title" variant="ghost">
            A prayer
          </PillLink>
          <PillLink href="#questions-title" variant="ghost">
            Hard questions
          </PillLink>
        </div>
      </PageHero>

      {/* The message, in four movements */}
      <section aria-labelledby="message-title" className="relative z-10 overflow-x-clip px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <SectionTitle id="message-title" eyebrow="The whole Bible in four movements" title="The message" accent="text-dawn" />
          <div className="relative mt-12">
            <ScrollLine className="bottom-6 left-6 top-6 hidden sm:block" />
            <ol className="space-y-10">
              {MOVEMENTS.map((m, i) => (
                <li key={m.n} className="relative sm:pl-20">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 hidden h-12 w-12 place-items-center rounded-full bg-dawn font-display text-2xl text-ink shadow-[0_0_24px_4px_rgba(255,207,122,0.45)] sm:grid"
                  >
                    {m.n}
                  </span>
                  <Reveal from={i % 2 === 0 ? "left" : "right"}>
                    <Panel tone="dark" as="article" className="p-6 sm:p-8">
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-dawn sm:hidden">Movement {m.n}</p>
                      <h3 className="text-4xl text-white sm:text-5xl">{m.title}</h3>
                      <p className="copy mt-3 max-w-2xl text-lg text-white/85">{m.body}</p>
                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {m.verses.map((k) => (
                          <VerseCard key={k} passage={verse(k)} tone="dark" size="sm" className="bg-white/5" />
                        ))}
                      </div>
                    </Panel>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* A prayer */}
      <section aria-labelledby="prayer-title" className="relative z-10 overflow-x-clip px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle id="prayer-title" eyebrow="If you're ready" title="A prayer" accent="text-dawn" align="center" />
          <Reveal from="in" className="mt-10">
            <div className="relative overflow-hidden rounded-3xl bg-night/70 p-8 ring-1 ring-white/15 backdrop-blur-md sm:p-12">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(255,207,122,0.35),rgba(255,207,122,0)_65%)]"
              />
              <p className="copy relative text-white/75">
                There are no magic words. God hears your heart, not your
                vocabulary. But if it helps, you could pray something like this:
              </p>
              <blockquote className="verse relative mt-6 text-2xl leading-relaxed text-white sm:text-3xl">
                God, I have been looking for You, maybe longer than I knew. I
                believe You love me. I know I have fallen short, and I can&apos;t
                fix that on my own. Thank You for sending Jesus, who died for me
                and rose again. I turn to You now. I receive Your forgiveness and
                Your life. Make me new, and lead me from here. In Jesus&apos;
                name, amen.
              </blockquote>
              <div className="relative mt-8 flex justify-center">
                <PrayerResponse />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* What now */}
      <section aria-labelledby="now-title" className="relative z-10 overflow-x-clip px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionTitle id="now-title" eyebrow="Where to go from here" title="What now?" accent="text-dawn" />
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {NEXT_STEPS.map((s, i) => (
              <li key={s.title}>
                <Reveal from="up" delay={i * 0.07} className="h-full">
                  <Panel tone="light" className="flex h-full flex-col p-6">
                    <p className="font-display text-5xl leading-none text-blaze">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="mt-4 text-3xl text-ink">{s.title}</h3>
                    <p className="copy mt-2 flex-1 text-ink/75">{s.body}</p>
                    {s.external ? (
                      <a
                        href={s.href}
                        {...(s.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="mt-5 inline-flex w-fit rounded-full bg-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-paper transition hover:bg-ink/85"
                      >
                        {s.cta}
                        {s.href.startsWith("http") ? " ↗" : ""}
                      </a>
                    ) : (
                      <Link
                        href={s.href}
                        className="mt-5 inline-flex w-fit rounded-full bg-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-paper transition hover:bg-ink/85"
                      >
                        {s.cta} →
                      </Link>
                    )}
                  </Panel>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Hard questions */}
      <section aria-labelledby="questions-title" className="relative z-10 overflow-x-clip px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <SectionTitle id="questions-title" eyebrow="Honest answers" title="The hard questions" accent="text-dawn" />
          <div className="mt-8 space-y-3">
            {FAQ.map((f) => (
              <Reveal key={f.q} from="up">
                <Accordion tone="light" summary={f.q}>
                  <p>{f.a}</p>
                  {f.q.startsWith("If God is loving") && (
                    <Link href="/scripture/hell-and-judgment" className="mt-3 inline-block font-semibold text-blaze underline-offset-4 hover:underline">
                      Read the study on Hell and Judgment →
                    </Link>
                  )}
                </Accordion>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Crisis */}
      <section aria-labelledby="crisis-title" className="relative z-10 overflow-x-clip px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <Reveal from="up">
            <Panel tone="light" className="p-6 sm:p-8">
              <h2 id="crisis-title" className="text-3xl text-ink">
                If you are in a dark place right now
              </h2>
              <p className="copy mt-3 text-ink/85">
                If you are thinking about ending your life, please reach out to
                someone today. You matter, and help is real. In the US, call or
                text{" "}
                <a href="tel:988" className="font-bold text-blaze underline underline-offset-2">
                  988
                </a>{" "}
                to reach the Suicide &amp; Crisis Lifeline, any time. Outside the
                US, find a free, confidential helpline near you at{" "}
                <a
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-blaze underline underline-offset-2"
                >
                  findahelpline.com
                </a>
                . If you are in immediate danger, call your local emergency number.
              </p>
              <div className="mt-6">
                <VerseCard passage={verse("Psalm 34:18")} tone="light" size="sm" bare />
              </div>
            </Panel>
          </Reveal>
        </div>
      </section>

      <section aria-label="Closing verse" className="relative z-10 overflow-x-clip px-4 py-16 sm:px-6">
        <Reveal from="in" className="mx-auto max-w-3xl">
          <VerseCard passage={verse("Lamentations 3:22-23")} tone="dark" size="lg" />
        </Reveal>
      </section>

      <ContinueJourney from={PAGE.href} />
    </>
  );
}
