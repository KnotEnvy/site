"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import Magnetic from "@/components/ui/Magnetic";
import MenuOverlay from "@/components/layout/MenuOverlay";
import { NAV_PAGES, journeyForPath } from "@/lib/pages";
import { clsx } from "@/lib/clsx";

/** Journeys that spend most of their length in the dark get a dark header. */
const DARK_JOURNEYS = new Set(["ascent", "cosmos", "passage"]);

/** Links shown inline on wide screens; everything is in the menu. Three, not
 *  four: with the centred wordmark, four crowded into it at 1440px. The Ascent
 *  gets its own pill on the right instead. */
const INLINE = ["/evidence", "/great-minds", "/scripture"];

export default function Header() {
  const lenis = useLenis();
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const dark = DARK_JOURNEYS.has(journeyForPath(pathname));

  // Close the menu whenever the route changes (a link inside it was used).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Freeze smooth scroll behind the open menu.
  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [open, lenis]);

  /** Same-page anchors scroll smoothly; cross-page ones navigate normally. */
  const onAnchor = (hash: string) => (e: React.MouseEvent) => {
    if (pathname !== "/") return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(hash, { offset: -80 });
    else document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
  };

  const onHome = (e: React.MouseEvent) => {
    if (pathname !== "/") return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeMenu = () => {
    setOpen(false);
    menuButton.current?.focus();
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex flex-1 items-center gap-6">
            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="site-menu"
              className={clsx(
                "group inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-xs font-bold uppercase tracking-[0.18em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                dark ? "text-white/85 hover:text-white focus-visible:outline-white" : "text-ink/75 hover:text-ink focus-visible:outline-ink"
              )}
            >
              <span aria-hidden="true" className="flex w-5 flex-col gap-[5px]">
                <span className="h-[2px] w-full rounded bg-current transition group-hover:w-4/5" />
                <span className="h-[2px] w-3/4 rounded bg-current transition group-hover:w-full" />
              </span>
              <span className="hidden sm:inline">Menu</span>
              <span className="sr-only sm:hidden">Open menu</span>
            </button>

            <nav className="hidden gap-6 lg:flex" aria-label="Primary">
              {NAV_PAGES.filter((p) => INLINE.includes(p.href)).map((p) => {
                const active = pathname === p.href || pathname.startsWith(`${p.href}/`);
                return (
                  <Link
                    key={p.href}
                    href={p.href}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "relative text-xs font-semibold uppercase tracking-[0.18em] transition",
                      dark ? "text-white/70 hover:text-white" : "text-ink/70 hover:text-ink",
                      active && (dark ? "text-white" : "text-ink")
                    )}
                  >
                    {p.nav}
                    {active && (
                      <span className="absolute -bottom-1.5 left-0 h-[2px] w-full rounded bg-current" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <Link
            href="/"
            onClick={onHome}
            className={clsx("font-display text-base tracking-tight sm:text-lg", dark ? "text-white" : "text-ink")}
          >
            Eternal&nbsp;<span className={dark ? "text-dawn" : "text-blaze"}>Truth</span>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-3">
            <Link
              href="/the-ascent"
              aria-current={pathname === "/the-ascent" ? "page" : undefined}
              className={clsx(
                "hidden items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] ring-1 transition lg:inline-flex",
                dark
                  ? "text-dawn ring-dawn/50 hover:bg-dawn/10"
                  : "text-ink/80 ring-ink/20 hover:bg-ink/5 hover:text-ink"
              )}
            >
              <span aria-hidden="true">✦</span> The Ascent
            </Link>
            <Magnetic className="inline-block">
              <Link
                href="/#playlists"
                onClick={onAnchor("#playlists")}
                className="inline-block rounded-full bg-blaze px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-blaze/30 transition hover:bg-sky-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span className="sm:hidden">Watch</span>
                <span className="hidden sm:inline">Watch Stories</span>
              </Link>
            </Magnetic>
          </div>
        </div>

        {/* Backing bar: cream glass over the light journeys, night glass over
            the dark ones, so the header never fights the sky beneath it. */}
        <div
          className={clsx(
            "absolute inset-0 -z-10 backdrop-blur-md transition-colors duration-700",
            dark ? "bg-night/60 ring-1 ring-white/10" : "bg-paper/80 ring-1 ring-black/5"
          )}
        />
      </header>

      <MenuOverlay open={open} onClose={closeMenu} pathname={pathname} />
    </>
  );
}
