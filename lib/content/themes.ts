/**
 * The Scripture study themes, as lightweight metadata only. Menus, the footer
 * and the sitemap import THIS file, not lib/content/scripture.ts, so the full
 * study text never gets pulled into a client bundle just to render a link.
 */
export type ThemeMeta = {
  slug: string;
  title: string;
  /** The question the study answers - also its H1 subtitle and SEO hook. */
  question: string;
  /** Short line for cards. */
  blurb: string;
  /** Meta description for the study page. */
  description: string;
  /** Glyph drawn on the theme card. */
  glyph: "gate" | "sun" | "flame" | "cross" | "wings" | "anchor";
};

export const THEMES: ThemeMeta[] = [
  {
    slug: "life-after-death",
    title: "Life After Death",
    question: "What happens when we die?",
    blurb: "Absent from the body, present with the Lord. What the Bible actually promises about the moment of death.",
    description:
      "What does the Bible say about life after death? A verse-by-verse study of what happens when we die, with context, meaning and questions for reflection.",
    glyph: "gate",
  },
  {
    slug: "heaven",
    title: "Heaven",
    question: "What is Heaven really like?",
    blurb: "No more tears, no need of the sun, a place prepared. Scripture's picture of home.",
    description:
      "Bible verses about Heaven, studied in context: what Jesus promised, what Paul saw, and what Revelation describes. With reflection questions and NDE parallels.",
    glyph: "sun",
  },
  {
    slug: "hell-and-judgment",
    title: "Hell & Judgment",
    question: "Is Hell real, and why would a loving God allow it?",
    blurb: "The hardest teaching in Scripture, read honestly, and the mercy that surrounds it.",
    description:
      "What does the Bible say about Hell and judgment? An honest study of the hardest verses in Scripture, and of the patience and mercy that surround them.",
    glyph: "flame",
  },
  {
    slug: "salvation",
    title: "Salvation",
    question: "How can anyone be made right with God?",
    blurb: "Grace, not grades. The gift at the center of the whole Bible, in its own words.",
    description:
      "Bible verses about salvation explained: grace, faith, and the gift of eternal life. A clear study of how the Bible says a person is made right with God.",
    glyph: "cross",
  },
  {
    slug: "made-new",
    title: "Made New",
    question: "Can a person really change?",
    blurb: "A new heart, a renewed mind, a new creation. What God's love does inside a life.",
    description:
      "Bible verses about transformation and becoming a new creation, studied in context: a new heart, a renewed mind, and the fruit of the Spirit.",
    glyph: "wings",
  },
  {
    slug: "hope",
    title: "Hope in Suffering",
    question: "Where is God when it hurts?",
    blurb: "For the grieving, the afraid and the exhausted. Promises that hold in the dark.",
    description:
      "Bible verses for hope in suffering, grief and fear, studied in context: God's presence in the valley, and the glory that outweighs the pain.",
    glyph: "anchor",
  },
];
