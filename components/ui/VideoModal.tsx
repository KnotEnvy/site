"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import Photo from "@/components/ui/Photo";
import type { Video } from "@/components/ui/VideoCard";

/**
 * Turn a YouTube watch / share / playlist URL into an embeddable URL.
 * Returns null for anything we can't confidently embed, so the modal falls
 * back to the thumbnail + "coming soon" state.
 */
function toEmbedUrl(href?: string): string | null {
  if (!href) return null;
  try {
    const u = new URL(href);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname.startsWith("/embed/")) return href;
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      const list = u.searchParams.get("list");
      if (list) return `https://www.youtube.com/embed/videoseries?list=${list}`;
    }
  } catch {
    /* not a URL we can parse */
  }
  return null;
}

export default function VideoModal({
  video,
  onClose,
}: {
  video: Video | null;
  onClose: () => void;
}) {
  const lenis = useLenis();
  const open = !!video;

  // While open: pause smooth-scroll, lock the body, and close on Escape.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis, onClose]);

  const embed = toEmbedUrl(video?.href);

  return (
    <AnimatePresence>
      {video && (
        <motion.div
          key="video-modal"
          className="fixed inset-0 z-[100] grid place-items-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={video.title}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" />

          {/* Dialog */}
          <motion.div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-ink shadow-2xl ring-1 ring-white/10"
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white/90 backdrop-blur transition hover:bg-black/70 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>

            <div className="relative aspect-video w-full bg-black">
              {embed ? (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={embed}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <>
                  <Photo
                    src={video.img}
                    alt={video.title}
                    overlay
                    sizes="(max-width: 768px) 92vw, 768px"
                    className="h-full w-full"
                  />
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/20 backdrop-blur">
                      Full video coming soon
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-start justify-between gap-4 p-5">
              <div>
                <h3 className="font-sans text-lg font-semibold leading-snug text-white">
                  {video.title}
                </h3>
                <p className="mt-1 text-sm text-white/55">{video.duration}</p>
              </div>
              {video.href && (
                <a
                  href={video.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white/90"
                >
                  Watch on YouTube
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
