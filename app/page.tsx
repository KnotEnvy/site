import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import Purpose from "@/components/sections/Purpose";
import Playlists from "@/components/sections/Playlists";
import BibleRecommendations from "@/components/sections/BibleRecommendations";
import TheWayUp from "@/components/sections/TheWayUp";
import JsonLd from "@/components/seo/JsonLd";
import { pageFor } from "@/lib/pages";
import { pageMetadata, graph, entity, abs, WEBSITE_ID, ORG_ID } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

const HOME = pageFor("/");
const base = pageMetadata(HOME, {
  keywords: [
    "eternal truth",
    "near-death experience",
    "NDE",
    "life after death",
    "heaven",
    "hell",
    "afterlife evidence",
    "NDE testimonies",
    "consciousness after death",
  ],
});

// The share card keeps the hook the captured og.jpg actually shows.
const SHARE_TITLE = `${SITE_NAME} — Heaven or Hell. Real?`;
const SHARE_DESC =
  "Evidence of life after death, scientifically examined through near-death experiences.";

export const metadata: Metadata = {
  ...base,
  openGraph: {
    ...base.openGraph,
    title: SHARE_TITLE,
    description: SHARE_DESC,
    type: "website",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Eternal Truth: the headline 'Heaven or Hell. Real?' over sunlit clouds at the start of the descent.",
      },
    ],
  },
  twitter: { ...base.twitter, title: SHARE_TITLE, description: SHARE_DESC },
};

const homeLd = graph({
  "@type": "WebPage",
  "@id": `${abs("/")}#webpage`,
  url: abs("/"),
  name: HOME.title,
  description: HOME.description,
  isPartOf: { "@id": WEBSITE_ID },
  publisher: { "@id": ORG_ID },
  inLanguage: "en",
  about: [
    entity("Thing", "Near-death experience", "Near-death_experience"),
    entity("Thing", "Afterlife", "Afterlife"),
    entity("Thing", "Heaven", "Heaven_in_Christianity"),
    entity("Thing", "Hell", "Hell_in_Christianity"),
  ],
});

export default function Home() {
  return (
    <>
      <JsonLd data={homeLd} />
      <Hero />
      <Purpose />
      <Playlists />
      <BibleRecommendations />
      <TheWayUp />
    </>
  );
}
