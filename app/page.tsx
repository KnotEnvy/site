import Hero from "@/components/sections/Hero";
import Purpose from "@/components/sections/Purpose";
import Playlists from "@/components/sections/Playlists";
import BibleRecommendations from "@/components/sections/BibleRecommendations";

export default function Home() {
  return (
    <>
      <Hero />
      <Purpose />
      <Playlists />
      <BibleRecommendations />
    </>
  );
}
