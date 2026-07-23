"use client";

import Photo from "@/components/ui/Photo";
import { clsx } from "@/lib/clsx";

export type Video = {
  title: string;
  /** Omitted for real links whose runtime we don't control. */
  duration?: string;
  img: string;
  /** Real YouTube video/playlist URL; opens in the lightbox. */
  href?: string;
  /** Small chip over the thumbnail, e.g. "Start here" on a playlist's intro video. */
  badge?: string;
};

export default function VideoCard({
  video,
  onOpen,
}: {
  video: Video;
  /** Open the in-page lightbox. When omitted, an `href` opens in a new tab. */
  onOpen?: (video: Video) => void;
}) {
  const cardClass = clsx(
    "group relative flex w-[78vw] max-w-[320px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-white/95 text-left shadow-xl ring-1 ring-black/5 transition",
    (onOpen || video.href) && "hover:-translate-y-1 hover:shadow-2xl"
  );

  const inner = (
    <>
      <div className="relative aspect-video">
        <Photo
          src={video.img}
          alt={video.title}
          overlay
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white/85 text-ink shadow-lg transition group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
        {video.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
            {video.duration}
          </span>
        )}
        {video.badge && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-ink shadow-md">
            {video.badge}
          </span>
        )}
      </div>
      <div className="p-4">
        <h4 className="font-sans text-base font-semibold normal-case leading-snug tracking-normal text-ink">
          {video.title}
        </h4>
      </div>
    </>
  );

  if (onOpen) {
    return (
      <button type="button" onClick={() => onOpen(video)} className={cardClass}>
        {inner}
      </button>
    );
  }
  if (video.href) {
    return (
      <a href={video.href} target="_blank" rel="noopener noreferrer" className={cardClass}>
        {inner}
      </a>
    );
  }
  return <div className={cardClass}>{inner}</div>;
}
