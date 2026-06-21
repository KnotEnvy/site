"use client";

import { useLenis } from "lenis/react";

const NAV = [
  { label: "The Truth", target: "#purpose" },
  { label: "Playlists", target: "#playlists" },
  { label: "Bibles", target: "#bibles" },
];

export default function Header() {
  const lenis = useLenis();

  const go = (target: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: -80 });
    else document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex-1">
          <nav className="hidden gap-6 md:flex" aria-label="Primary">
            {NAV.map((item) => (
              <a
                key={item.target}
                href={item.target}
                onClick={go(item.target)}
                className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/70 transition hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <a
          href="#top"
          onClick={go("#top")}
          className="font-display text-base tracking-tight text-ink sm:text-lg"
        >
          Heaven<span className="text-blaze">or</span>Hell?
        </a>

        <div className="flex flex-1 justify-end">
          <a
            href="#playlists"
            onClick={go("#playlists")}
            className="rounded-full bg-blaze px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-blaze/30 transition hover:bg-sky-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Watch Stories
          </a>
        </div>
      </div>

      {/* cream backing bar with a soft blur, behind the row */}
      <div className="absolute inset-0 -z-10 bg-paper/80 backdrop-blur-md ring-1 ring-black/5" />
    </header>
  );
}
