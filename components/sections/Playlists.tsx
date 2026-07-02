"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import SplitText from "@/components/ui/SplitText";
import HorizontalScroller from "@/components/ui/HorizontalScroller";
import VideoCard, { type Video } from "@/components/ui/VideoCard";
import VideoModal from "@/components/ui/VideoModal";
import { clsx } from "@/lib/clsx";
import { IMG } from "@/lib/media";

type Category = {
  id: string;
  kicker: string;
  title: string;
  blurb: string;
  accent: string; // text color class
  bar: string; // bg color class
  videos: Video[];
};

const CATEGORIES: Category[] = [
  {
    id: "heaven",
    kicker: "Playlist 01",
    title: "Heavenly Experiences",
    accent: "text-heaven",
    bar: "bg-heaven",
    blurb:
      "A sudden release from pain. A tunnel of brilliant light. A love so complete it rearranges a whole life. These are the testimonies of people who touched Heaven and were sent back.",
    videos: [
      { title: "Pronounced dead for 20 minutes: what she saw", duration: "18:42", img: IMG.heaven[0] },
      { title: "“I didn’t want to come back”: a surgeon’s account", duration: "24:10", img: IMG.heaven[1] },
      { title: "The life review: every moment, felt at once", duration: "12:55", img: IMG.heaven[2] },
      { title: "Meeting relatives he never knew had died", duration: "31:07", img: IMG.heaven[4] },
      { title: "A light that was somehow a person", duration: "16:30", img: IMG.heaven[3] },
    ],
  },
  {
    id: "science",
    kicker: "Playlist 02",
    title: "The Science: Fact vs. Myth",
    accent: "text-science",
    bar: "bg-science",
    blurb:
      "Cardiac-arrest timelines, verified out-of-body observations, and the stubborn question at the center of it all: how does consciousness keep working after the heart has stopped?",
    videos: [
      { title: "Verified out-of-body observations under flatline", duration: "27:18", img: IMG.science[0] },
      { title: "What the AWARE study actually found", duration: "21:44", img: IMG.science[2] },
      { title: "Does the dying-brain hypothesis hold up?", duration: "33:02", img: IMG.science[1] },
      { title: "Cardiologists on consistency across thousands of cases", duration: "19:51", img: IMG.science[4] },
      { title: "Skeptic vs researcher: a fair debate", duration: "45:12", img: IMG.science[3] },
    ],
  },
  {
    id: "hell",
    kicker: "Playlist 03",
    title: "Hellish Experiences",
    accent: "text-hell",
    bar: "bg-hell",
    blurb:
      "Not every crossing is peaceful. These accounts come from people who met something terrifying on the other side, and who came back grateful for a second chance.",
    videos: [
      { title: "“I was falling and it never stopped”", duration: "22:09", img: IMG.hell[2] },
      { title: "An atheist’s terrifying crossing, and his return", duration: "29:33", img: IMG.hell[0] },
      { title: "The void: absence as its own torment", duration: "15:20", img: IMG.hell[3] },
      { title: "Brought back on the table, changed for good", duration: "26:47", img: IMG.hell[1] },
      { title: "Warning, redemption, and a second chance", duration: "20:58", img: IMG.hell[4] },
    ],
  },
];

export default function Playlists() {
  const [active, setActive] = useState<Video | null>(null);

  return (
    <section id="playlists" className="relative z-10 py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/90">
            Watch &amp; decide for yourself
          </p>
          <h2 className="display-lg mt-3">
            <SplitText
              text="Video Playlists"
              className="text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.35)]"
            />
          </h2>
        </Reveal>
      </div>

      <div className="mt-16 space-y-20">
        {CATEGORIES.map((cat) => (
          <div key={cat.id}>
            <div className="mx-auto mb-6 max-w-7xl px-6">
              <Reveal>
                <div className="max-w-2xl rounded-2xl bg-paper/85 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur">
                  <span className={clsx("text-xs font-bold uppercase tracking-[0.22em]", cat.accent)}>
                    {cat.kicker}
                  </span>
                  <div className="mt-2 flex items-center gap-3">
                    <span className={clsx("h-7 w-1.5 rounded-full", cat.bar)} />
                    <h3 className={clsx("font-display text-3xl sm:text-4xl", cat.accent)}>
                      {cat.title}
                    </h3>
                  </div>
                  <p className="mt-3 font-sans text-base normal-case leading-relaxed tracking-normal text-ink/75">
                    {cat.blurb}
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal>
              <HorizontalScroller label={`${cat.title} videos`} className="mx-auto max-w-7xl">
                {cat.videos.map((v) => (
                  <VideoCard key={v.title} video={v} onOpen={setActive} />
                ))}
              </HorizontalScroller>
            </Reveal>
          </div>
        ))}
      </div>

      <VideoModal video={active} onClose={() => setActive(null)} />
    </section>
  );
}
