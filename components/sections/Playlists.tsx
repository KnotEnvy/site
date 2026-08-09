"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import SplitText from "@/components/ui/SplitText";
import ScrollQuote from "@/components/ui/ScrollQuote";
import HorizontalScroller from "@/components/ui/HorizontalScroller";
import VideoCard, { type Video } from "@/components/ui/VideoCard";
import VideoModal from "@/components/ui/VideoModal";
import { clsx } from "@/lib/clsx";

// The three curated playlists ("vaults") on YouTube. IDs verified via oEmbed:
// HEAVENLY NDE VAULT / SCIENTIFIC NDE VAULT / HELLISH NDE VAULT.
const LIST = {
  heaven: "PLQ5vRAVqoE8g",
  science: "PLGiV6gNcerXY",
  hell: "PLCL4ntHncnUw",
} as const;

/**
 * A real YouTube video: when a playlist is given the watch URL carries it, so
 * the lightbox embed offers the rest of the vault. Thumbnail comes straight
 * from YouTube. Pass `null` for a curated video that isn't in a vault playlist.
 */
function yt(id: string, list: string | null, title: string, badge?: string): Video {
  return {
    title,
    badge,
    href: list
      ? `https://www.youtube.com/watch?v=${id}&list=${list}`
      : `https://www.youtube.com/watch?v=${id}`,
    img: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

type Category = {
  id: string;
  kicker: string;
  title: string;
  blurb: string;
  accent: string; // text color class
  bar: string; // bg color class
  /** The real YouTube playlist behind this category, when there is one. */
  playlist?: string;
  /** Chapter interstitial shown on the descent into this category. */
  meaning: { kicker: string; text: string; support: string };
  videos: Video[];
};

// Order matters: the Science vault leads (stakeholder feedback, 2026-08-06) so a
// skeptical visitor meets the evidence before the testimony. Vault/chapter
// numbers below follow this array — renumber them if you reorder again.
const CATEGORIES: Category[] = [
  {
    id: "science",
    kicker: "Vault 01 · 11 investigations",
    title: "The Science: Fact vs. Myth",
    accent: "text-science",
    bar: "bg-science",
    blurb:
      "Cardiac-arrest timelines, verified out-of-body observations, 4,000 documented cases. Doctors, neuroscientists, and researchers keep circling the stubborn question at the center of it all: how does consciousness keep working after the heart has stopped?",
    playlist: `https://www.youtube.com/playlist?list=${LIST.science}`,
    meaning: {
      kicker: "Chapter 01 · The Evidence",
      text: "The heart stops. The brain goes dark. And 4,000 case files say the story keeps going.",
      support:
        "Neurosurgeons and NDE researchers put the dying-brain theory up against the record: the same journey across every culture and faith, and a blind 8-year-old who describes Heaven the way sighted people do.",
    },
    videos: [
      yt("QVGA6xeQhOs", LIST.science, "Science, Doctors and 4,000 NDEs: Proof of Life After Death?", "Start here"),
      yt("9gMYyRcE6DA", LIST.science, "Different Religions Encounter the Same God in Near Death Experiences"),
      yt("vxnmDhs6Nrg", LIST.science, "3 Incredible Proofs of Heaven: What Global Near Death Experiences Reveal"),
      yt("WsGpFc79O0k", LIST.science, "NDEs, Neuroscience, and the Soul, with Dr. Lee Warren"),
      yt("_TsOqTRUL3c", LIST.science, "20 Near Death Experience Commonalities That Align with the Bible"),
      yt("ragcEDleVcU", LIST.science, "The Dark Side of NDEs: Terror, Rescue, and Redemption"),
      yt("tTc0ZDp2k_k", LIST.science, "Debunking the 'Brain Hallucination' Theory of NDEs, with Dr. Jeff Long"),
      yt("54MWYwJZ_yc", LIST.science, "Warning! If You See These Signs, It's a Fake NDE"),
      yt("tH3eVf0C1QY", LIST.science, "John Burke on the Shawn Ryan Show: What Happens When We Die?"),
      yt("J7u2nHmclrs", LIST.science, "Blind 8-Year-Old Describes Heaven the Same as Sighted People"),
      yt("4ihBYcNIFV4", LIST.science, "Devout Muslim Died, and Saw Something He Couldn't Explain"),
    ],
  },
  {
    id: "heaven",
    kicker: "Vault 02 · 13 testimonies",
    title: "Heavenly Experiences",
    accent: "text-heaven",
    bar: "bg-heaven",
    blurb:
      "A sudden release from pain. A tunnel of brilliant light. A love so complete it rearranges a whole life. Thirteen real testimonies, from a Hindu engineer to a Marine, of people who touched Heaven and were sent back.",
    playlist: `https://www.youtube.com/playlist?list=${LIST.heaven}`,
    meaning: {
      kicker: "Chapter 02 · The Light",
      text: "They all describe the same place. The light. The gate. A love that feels like coming home.",
      support:
        "A pilot, a Marine, a Hindu engineer, an 18-year-old girl. Strangers who died in different decades, on different continents, and came back telling one story. Watch them tell it themselves.",
    },
    videos: [
      yt("WpY69O4fiZM", LIST.heaven, "The Incredible Reality of Heaven, with Chad Fisher and John Burke", "Start here"),
      yt("FRz3o-u4mIg", LIST.heaven, "Hindu Engineer Dies and Encounters Something Unexpected in the Afterlife"),
      yt("GDhvK6VHAN0", LIST.heaven, "Pilot Dies in Crash… The Date Heaven Showed Him"),
      yt("0VGKZ01qPPE", LIST.heaven, "I Died in a Horse Accident… Then I Saw the Narrow Gate to Heaven"),
      yt("pgBd5Z38ITE", LIST.heaven, "I Died 3 Times in 1 Day… And Saw 2 Angels"),
      yt("CjN3pzrEkTQ", LIST.heaven, "Marine Died. What He Saw Changed Everything"),
      yt("rNiFOyjnP8I", LIST.heaven, "She Died at 18… What God Did Next Shocked Her"),
      yt("5KvU3ZiwL0M", LIST.heaven, "Heaven Was Full… But Not Just People"),
      yt("rEAVVyG2-IQ", LIST.heaven, "I Died, Met Jesus, and Spoke with My Friend in Heaven"),
      yt("P7IoktK7s1c", LIST.heaven, "I Left My Body and Met Jesus. What He Said Shook Me Forever"),
      yt("PrtVtfKwWk4", LIST.heaven, "I Died and Saw Earth's Timeline. We Are This Close to the End"),
      yt("nZZHhG9udvw", LIST.heaven, "Doctor Gave Him 2 Years to Live... Then He Died and Came Back"),
      yt("ZeRLxVo9kBM", LIST.heaven, "The Unbelievable NDE That Erased 30 Years of Memory"),
    ],
  },
  {
    id: "hell",
    kicker: "Vault 03 · 17 warnings",
    title: "Hellish Experiences",
    accent: "text-hell",
    bar: "bg-hell",
    blurb:
      "Not every crossing is peaceful. Seventeen accounts from people who met something terrifying on the other side, and who came back grateful for a second chance.",
    playlist: `https://www.youtube.com/playlist?list=${LIST.hell}`,
    meaning: {
      kicker: "Chapter 03 · The Warning",
      text: "Not every crossing ends in light. Some come back shaking, with a warning.",
      support:
        "A nurse, a mortician, a Wiccan high priest. Seventeen people met the other destination, and every one of them came back to say the same thing: it is real, and it can be avoided.",
    },
    videos: [
      yt("UH3i8_UHXXU", LIST.hell, "The Terrifying Truth About Hell, with Chad Fisher and John Burke", "Start here"),
      yt("ZNFxbopaUxs", LIST.hell, "I Saw Hell's Torment. Then God Spoke to Me"),
      yt("v8EYudRnDqA", LIST.hell, "He Left His Body in His Gaming Chair and Went to Hell"),
      yt("JjlasF3pJks", LIST.hell, "God Let Me See Hell, and It Changed Everything"),
      yt("p1I7hfazEiY", LIST.hell, "I Died as a Christian, but My Secret Sin Sent Me to Hell: Marcil's Testimony"),
      yt("nG2rKPe34YA", LIST.hell, "Nurse Dies, Goes to Hell, and Suffers Horrific Acts by Demons: Bridgette's NDE"),
      yt("A_eoadbIHBI", LIST.hell, "I Saw Hell, and Jesus Told Me Why Only 2.5% Make Heaven"),
      yt("QERrCbOT8tA", LIST.hell, "I Went to Hell and Saw Children (Near Death Experience)"),
      yt("UPjqNA9t1xc", LIST.hell, "Wiccan High Priest Dies… Has a Shocking Hell Encounter"),
      yt("TMQG2aA330Q", LIST.hell, "I Died. What Jesus Showed Me in Hell Shocked Me"),
      yt("RNooA4tlBmU", LIST.hell, "I Overdosed, and What Happened Next Will Terrify You: Tristian's Testimony"),
      yt("Mie01MG0Q_s", LIST.hell, "Diabetic Overdoses and Sees the Horrors of Hell: Michael's Testimony"),
      yt("ybi7vdtOAfM", LIST.hell, "Mortician Dies, Sees Hell, and Returns with a Message for Humanity"),
      yt("78QEtegZ90g", LIST.hell, "The Scariest and Most Intense Description of Hell You Will Ever Hear: R. Cook's Testimony"),
      yt("RjrwQaBpR_o", LIST.hell, "I Died in a Motorcycle Accident and Fell into Hell, Then an Angel Took Me to Heaven: Diamond's NDE"),
      yt("M67k5a3F1qs", LIST.hell, "I Never Believed Hell Existed, Until My Near Death Experience: Constantine's Story"),
      yt("EGcrupM6W-Q", LIST.hell, "I Thought I Was Saved… Until I Died"),
    ],
  },
  {
    // Vault 04 has no stakeholder playlist yet — these 16 videos were curated
    // for the brief's four themes (the global flood, biblical archaeology,
    // spiritual warfare, healing through the Holy Spirit) and every ID was
    // verified embeddable via the YouTube oEmbed endpoint. Two strong
    // candidates were dropped because their owners disable embedding.
    id: "scripture",
    kicker: "Vault 04 · 16 evidences",
    title: "Proof the Bible Is True",
    accent: "text-scripture",
    bar: "bg-scripture",
    blurb:
      "Near-death experiences are not the only place the Bible keeps being confirmed. Geologists reading the flood in the rock, archaeologists digging up cities Scripture named, people delivered from the occult, and blind eyes opening after prayer — with doctors on record.",
    meaning: {
      kicker: "Chapter 04 · The Record",
      text: "If the book is true about the next life, it should be true about this one. It is.",
      support:
        "The flood written into the world's rock layers. Jericho's walls found fallen. Demons that answer to a name. Sight returning to eyes medicine had given up on. Four different fields, one Book, and it keeps holding up.",
    },
    videos: [
      yt("Z7L6wbhv93o", null, "Mind-Blowing Archaeological Discoveries That Confirm the Bible", "Start here"),
      yt("NwRDJmlCNLQ", null, "Ancient Jericho Discovered: The Walls Really Did Fall Down"),
      yt("iig775e1nCw", null, "The Greatest Archaeological Discovery in History, and It Proves the Bible Is True"),
      yt("gf2yEAPBU7o", null, "Geology Finally Makes Sense, Thanks to Noah's Flood"),
      yt("Tma__c-jFSM", null, "Incredible New Evidence That Noah's Flood Really Happened"),
      yt("d_ZvzDuWyis", null, "Watch Scientists Collect New Evidence of Noah's Flood"),
      yt("882fmumdm9A", null, "90 Minutes of Geological Evidence for Noah's Flood, with Dr. Kurt Wise"),
      yt("EI2Xb6feZQk", null, "Ex-Satanic High Priest Exposes the Occult: John Ramirez"),
      yt("196JFgugn6A", null, "Demons, Spiritual Warfare, and Evil: The Truth Some Churches Don't Discuss"),
      yt("oeQz2j2qDjs", null, "Spiritual Warfare: Christians, Demonization, and Deliverance, with Dr. Karl Payne"),
      yt("F3350Gt_HLU", null, "Demons, Deliverance, and Spiritual Warfare: Stand on the Word"),
      yt("73xrYh-AiOs", null, "Skeptical Doctor Shocked After Blind Son's Miracle Healing"),
      yt("bYkCiKUmnvg", null, "Surprising Miracles Doctors Couldn't Explain, with Lee Strobel"),
      yt("gxkU3M5GsWk", null, "'This Cannot Be Explained by Science': Doctors Confirm an Amazing Healing"),
      yt("Qwq3CNc4YGw", null, "Miraculous Cataract Healing, Doctor Confirmed"),
      yt("a2oaJ15iLX4", null, "Blind Eye Instantly Healed"),
    ],
  },
];

export default function Playlists() {
  const [active, setActive] = useState<Video | null>(null);

  return (
    <section id="playlists" className="relative z-10 overflow-x-clip py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <Reveal from="down">
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

      <div className="mt-4 space-y-12 sm:space-y-16">
        {CATEGORIES.map((cat, i) => (
          <div key={cat.id}>
            <ScrollQuote
              kicker={cat.meaning.kicker}
              text={cat.meaning.text}
              support={cat.meaning.support}
              accent={cat.accent}
            />

            <div className="mx-auto mb-6 max-w-7xl px-6">
              <Reveal
                from={i % 2 === 0 ? "tilt-left" : "tilt-right"}
                exit={i % 2 === 0 ? "left" : "right"}
              >
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
                  {cat.playlist && (
                    <a
                      href={cat.playlist}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={clsx(
                        "mt-4 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.14em] underline-offset-4 transition hover:underline",
                        cat.accent
                      )}
                    >
                      Watch the full playlist
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  )}
                </div>
              </Reveal>
            </div>

            <Reveal
              from={i % 2 === 0 ? "right" : "left"}
              exit={i % 2 === 0 ? "right" : "left"}
            >
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
