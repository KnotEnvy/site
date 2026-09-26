import AscentStory from "@/components/ascent/AscentStory";
import ContinueJourney from "@/components/ui/ContinueJourney";
import JsonLd from "@/components/seo/JsonLd";
import { pageFor } from "@/lib/pages";
import { pageMetadata, graph, articleLd, breadcrumbLd, entity } from "@/lib/seo";

const PAGE = pageFor("/the-ascent");

export const metadata = pageMetadata(PAGE, {
  keywords: [
    "how God transforms lives",
    "new creation",
    "2 Corinthians 5:17",
    "wonders of God",
    "God's love",
    "Christian testimony",
    "interactive story",
  ],
});

const ld = graph(
  articleLd({
    path: PAGE.href,
    headline: "The Ascent: Made New",
    description: PAGE.description,
    image: PAGE.og,
    type: "CreativeWork",
    about: [
      entity("Thing", "God in Christianity", "God_in_Christianity"),
      entity("Thing", "Grace in Christianity", "Grace_in_Christianity"),
      entity("Thing", "Born again", "Born_again"),
      entity("Thing", "Fruit of the Holy Spirit", "Fruit_of_the_Holy_Spirit"),
    ],
  }),
  breadcrumbLd([
    { name: "Home", path: "/" },
    { name: "The Ascent", path: PAGE.href },
  ])
);

export default function TheAscentPage() {
  return (
    <>
      <JsonLd data={ld} />
      <AscentStory />
      <ContinueJourney from={PAGE.href} heading="Where to next" />
    </>
  );
}
