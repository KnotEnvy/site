/**
 * Central registry of the local, CC-licensed photography in /public/images
 * (fetched from Wikimedia Commons via scripts/fetch-images.mjs — see
 * /public/images/credits.json for attribution).
 */
export const IMG = {
  sky: "/images/sky-clouds.jpg",
  heaven: [
    "/images/heaven-1.jpg",
    "/images/heaven-2.jpg",
    "/images/heaven-3.jpg",
    "/images/heaven-4.jpg",
    "/images/heaven-5.jpg",
  ],
  science: [
    "/images/science-1.jpg",
    "/images/science-2.jpg",
    "/images/science-3.jpg",
    "/images/science-4.jpg",
    "/images/science-5.jpg",
  ],
  hell: [
    "/images/hell-1.jpg",
    "/images/hell-2.jpg",
    "/images/hell-3.jpg",
    "/images/hell-4.jpg",
    "/images/hell-5.jpg",
  ],
  bible: [
    "/images/bible-1.jpg",
    "/images/bible-2.jpg",
    "/images/bible-3.jpg",
    "/images/bible-4.jpg",
    "/images/bible-5.jpg",
  ],
} as const;
