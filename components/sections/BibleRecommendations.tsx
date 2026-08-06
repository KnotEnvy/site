import { Reveal } from "@/components/ui/Reveal";
import SplitText from "@/components/ui/SplitText";
import HorizontalScroller from "@/components/ui/HorizontalScroller";
import BibleCard, { type Bible } from "@/components/ui/BibleCard";
import { IMG } from "@/lib/media";

const BIBLES: Bible[] = [
  // Placed first on purpose: it costs nothing, so nobody is blocked from
  // starting. Replaces the KJV Classic card per stakeholder feedback.
  {
    name: "Bible.com App",
    style: "Any translation",
    publisher: "YouVersion",
    price: "Free",
    rating: 5,
    cover: IMG.bible[2],
    badge: "Free",
    href: "https://www.bible.com/",
    hrefLabel: "Read free at Bible.com",
    blurb:
      "Start here if you own nothing yet. The whole Bible, free, on any phone or browser, with audio if you would rather listen and short reading plans if you do not know where to begin. Over a billion installs.",
  },
  {
    name: "ESV Study Bible",
    style: "Word-for-word",
    publisher: "Crossway",
    price: "$35–55",
    rating: 5,
    cover: IMG.bible[3],
    blurb:
      "Our top pick for going deep. Faithful to the original wording, with study notes that finally make the hard passages click. This is the one we reach for most.",
  },
  {
    name: "NLT Life Application",
    style: "Thought-for-thought",
    publisher: "Tyndale House",
    price: "$25–40",
    rating: 4.5,
    cover: IMG.bible[4],
    blurb:
      "The easiest to actually live by. Plain, modern English with notes that turn Scripture into practical daily steps. Perfect for first-time readers.",
  },
  {
    name: "NIV Thinline",
    style: "Balanced",
    publisher: "Zondervan",
    price: "$20–35",
    rating: 4,
    cover: IMG.bible[0],
    blurb:
      "The dependable middle ground, readable yet accurate. Slim enough to carry everywhere, which means you actually will.",
  },
  {
    name: "CSB Reader’s Bible",
    style: "Optimal equivalence",
    publisher: "Holman",
    price: "$30–45",
    rating: 4.5,
    cover: IMG.bible[1],
    blurb:
      "Verse numbers and clutter stripped away, so you can read it like the story it is. Beautiful for long, immersive sittings.",
  },
];

export default function BibleRecommendations() {
  return (
    <section id="bibles" className="relative z-10 py-28 sm:py-36">
      <div className="mx-auto mb-12 max-w-7xl px-6">
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/80 drop-shadow">
            Where to start reading
          </p>
          <h2 className="display-lg mt-3">
            <SplitText
              text="Bible Recommendations"
              className="text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.55)]"
            />
          </h2>
          <p className="mt-6 max-w-2xl rounded-2xl bg-ink/55 p-5 font-sans text-lg normal-case leading-relaxed tracking-normal text-paper/90 backdrop-blur">
            You do not have to buy anything to start: the first card is the free
            Bible app, complete and readable today. The rest are our personal
            favorites in print, the translations that genuinely helped us
            understand Scripture and live it out.
          </p>
        </Reveal>
      </div>

      <Reveal>
        <HorizontalScroller label="Recommended Bible translations" className="mx-auto max-w-7xl">
          {BIBLES.map((b) => (
            <BibleCard key={b.name} bible={b} />
          ))}
        </HorizontalScroller>
      </Reveal>
    </section>
  );
}
