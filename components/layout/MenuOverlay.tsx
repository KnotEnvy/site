"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { PAGES } from "@/lib/pages";
import { THEMES } from "@/lib/content/themes";
import { clsx } from "@/lib/clsx";

/**
 * Full-screen site menu. The sky stays visible through night glass behind it,
 * so opening the menu feels like stepping back to look at the whole journey
 * rather than leaving the experience.
 *
 * A proper modal dialog: focus moves in on open, Tab is trapped inside, Escape
 * closes, and the header returns focus to the menu button on close. Lenis is
 * stopped by the header while this is open so the page can't scroll beneath.
 */
export default function MenuOverlay({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const focusable = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu"
          id="site-menu"
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          data-lenis-prevent
          className="fixed inset-0 z-[60] overflow-y-auto bg-night/85 text-white backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* A slow wash of dawn light in the corner - the way up. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 -top-40 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(255,207,122,0.28),rgba(255,207,122,0)_65%)]"
          />

          <div className="relative mx-auto flex min-h-full max-w-7xl flex-col px-4 pb-12 pt-4 sm:px-6">
            <div className="flex items-center justify-between py-1">
              <p className="font-display text-base tracking-tight sm:text-lg">
                Eternal&nbsp;<span className="text-dawn">Truth</span>
              </p>
              <button
                ref={closeBtn}
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ring-1 ring-white/20 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Close
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav aria-label="Site" className="mt-10 grid flex-1 gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
              <ol className="space-y-1">
                {PAGES.map((p, i) => {
                  const active = p.href === "/" ? pathname === "/" : pathname === p.href || pathname.startsWith(`${p.href}/`);
                  return (
                    <motion.li
                      key={p.href}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        href={p.href}
                        onClick={active ? onClose : undefined}
                        aria-current={active ? "page" : undefined}
                        className="group flex items-baseline gap-4 rounded-2xl px-3 py-3 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:gap-6"
                      >
                        <span className="w-8 shrink-0 font-display text-sm text-white/40 tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span
                            className={clsx(
                              "block font-display text-4xl leading-none tracking-tight transition sm:text-6xl",
                              active ? "text-dawn" : "text-white group-hover:text-dawn"
                            )}
                          >
                            {p.nav}
                          </span>
                          <span className="copy mt-2 block text-sm text-white/65 sm:text-base">{p.hook}</span>
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ol>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8 lg:pt-4"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-dawn">Scripture studies</p>
                  <ul className="mt-4 grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
                    {THEMES.map((t) => (
                      <li key={t.slug}>
                        <Link
                          href={`/scripture/${t.slug}`}
                          className="copy block rounded-xl px-3 py-2 text-white/80 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                        >
                          <span className="font-semibold">{t.title}</span>
                          <span className="block text-sm text-white/55">{t.question}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">Talk to us</p>
                  <p className="copy mt-2 text-sm text-white/75">
                    Questions, doubts, or a story of your own. We read everything.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href="mailto:Eternaltruth303@gmail.com"
                      className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium ring-1 ring-white/20 transition hover:bg-white/20"
                    >
                      Email us
                    </a>
                    <a
                      href="https://www.instagram.com/theeternaltruth.official/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium ring-1 ring-white/20 transition hover:bg-white/20"
                    >
                      Instagram
                    </a>
                  </div>
                </div>
              </motion.div>
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
