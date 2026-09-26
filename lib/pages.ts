import type { JourneyId } from "@/lib/journeys";

/**
 * The single registry of top-level pages. Navigation (header, menu, footer),
 * the sitemap, llms.txt, per-page SEO and the WebGL sky's journey all read from
 * here, so a page added in one place shows up consistently everywhere.
 *
 * `journey` picks the sky the page lives in (see lib/journeys.ts): the home
 * page is the Descent (Heaven -> Hell); The Ascent is its mirror image, from
 * darkness up into light.
 */
export type SitePage = {
  href: string;
  /** Short label for nav. */
  nav: string;
  /** Chapter-style name shown in the menu and "continue" cards. */
  name: string;
  /** One-line hook used in menus and cross-links. */
  hook: string;
  /** <title> (the layout template appends the site name). */
  title: string;
  /** Meta description: ~150-160 characters, written for a human reader. */
  description: string;
  /** Sky journey for the WebGL canvas. */
  journey: JourneyId;
  /** Accent colour class for text, matching the page's mood. */
  accent: string;
  /** Social share card, captured from the live render by scripts/make-og.mjs. */
  og: string;
  /** Sitemap priority. */
  priority: number;
};

export const PAGES: SitePage[] = [
  {
    href: "/",
    nav: "The Descent",
    name: "Heaven or Hell. Real?",
    hook: "The testimony, the science and the videos. Where the journey starts.",
    title: "Eternal Truth | Evidence of Life After Death",
    description:
      "Millions of near-death experiences point to the same conclusion: God is real, and death is not the end. Watch the testimony, weigh the science, and decide for yourself.",
    journey: "descent",
    accent: "text-blaze",
    og: "/og.jpg",
    priority: 1,
  },
  {
    href: "/evidence",
    nav: "Evidence",
    name: "The Case File",
    hook: "What really happens when the heart stops, and what the research found.",
    title: "Near-Death Experience Evidence: The Science of Consciousness After Death",
    description:
      "The heart stops, the brain goes quiet, and people still report clear experiences. Landmark NDE studies, verified cases, and the skeptics' best answers, examined honestly.",
    journey: "passage",
    accent: "text-science",
    og: "/og/evidence.jpg",
    priority: 0.9,
  },
  {
    href: "/great-minds",
    nav: "Great Minds",
    name: "The Greatest Minds",
    hook: "Physicists, founders of science and lifelong skeptics who followed the evidence to God.",
    title: "Great Minds on God: Scientists, Philosophers and Mystics Who Believed",
    description:
      "Newton, Planck, Lemaître, Collins and more. The founders of modern science, the fine-tuning of the universe, skeptics who changed their minds, and the practice of stillness.",
    journey: "cosmos",
    accent: "text-sky-light",
    og: "/og/great-minds.jpg",
    priority: 0.9,
  },
  {
    href: "/scripture",
    nav: "The Word",
    name: "The Word: A Study Guide",
    hook: "What the Bible says about death, Heaven, Hell and becoming new. Verse by verse.",
    title: "Bible Study Guide: What Scripture Says About Life, Death and Eternity",
    description:
      "A free, verse-by-verse Bible study guide on life after death, Heaven, Hell, salvation, transformation and hope, with context, reflection questions and a 7-day reading plan.",
    journey: "sanctuary",
    accent: "text-scripture",
    og: "/og/scripture.jpg",
    priority: 0.9,
  },
  {
    href: "/the-ascent",
    nav: "The Ascent",
    name: "The Ascent: Made New",
    hook: "An interactive story of the wonders of God, and what His love makes of us.",
    title: "The Ascent: An Interactive Story of How God's Love Makes Us New",
    description:
      "From darkness into light. An immersive, animated story about the wonders of creation, being known by God, and the transformation His love brings.",
    journey: "ascent",
    accent: "text-scripture",
    og: "/og/the-ascent.jpg",
    priority: 0.9,
  },
  {
    href: "/begin",
    nav: "Begin",
    name: "Your Next Step",
    hook: "How to know God personally, with honest answers to the hard questions.",
    title: "How to Know God: Your Next Step, Honest Answers to Hard Questions",
    description:
      "If the evidence has moved you, here is how to begin: the message of the Bible in four movements, a simple prayer, next steps, and honest answers to common doubts.",
    journey: "dawn",
    accent: "text-blaze",
    og: "/og/begin.jpg",
    priority: 0.8,
  },
];

/** Pages shown in primary navigation (everything but the home page). */
export const NAV_PAGES = PAGES.filter((p) => p.href !== "/");

export function pageFor(href: string): SitePage {
  const page = PAGES.find((p) => p.href === href);
  if (!page) throw new Error(`No page registered for ${href}`);
  return page;
}

/**
 * Which journey a pathname lives in. Nested routes inherit their section's
 * journey (every /scripture/* study page lives in the Scripture sanctuary).
 * Unknown paths (the 404) fall back to the home descent.
 */
export function journeyForPath(pathname: string): JourneyId {
  if (pathname === "/") return "descent";
  const match = PAGES.filter((p) => p.href !== "/").find(
    (p) => pathname === p.href || pathname.startsWith(`${p.href}/`)
  );
  return match?.journey ?? "descent";
}

/**
 * The reading order through the site, used by the "continue the discovery"
 * card at the foot of each page.
 */
export const JOURNEY_ORDER = ["/", "/evidence", "/great-minds", "/scripture", "/the-ascent", "/begin"];

export function nextPage(href: string): SitePage {
  const i = JOURNEY_ORDER.indexOf(href);
  const next = JOURNEY_ORDER[(i + 1) % JOURNEY_ORDER.length];
  return pageFor(next === "/" ? "/the-ascent" : next);
}
