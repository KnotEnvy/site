"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { clsx } from "@/lib/clsx";

export type ExplorerItem = {
  ref: string;
  text: string;
  heading: string;
  theme: string;
  themeTitle: string;
  chapterUrl: string;
};

/**
 * Search and filter every passage in the study guide. Everything filters on
 * the client from data the server already rendered into the page, so it is
 * instant and needs no API.
 */
export default function VerseExplorer({
  items,
  themes,
}: {
  items: ExplorerItem[];
  themes: { slug: string; title: string }[];
}) {
  const [q, setQ] = useState("");
  const [theme, setTheme] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const query = useDeferredValue(q.trim().toLowerCase());

  const results = useMemo(
    () =>
      items.filter(
        (it) =>
          (!theme || it.theme === theme) &&
          (!query ||
            it.text.toLowerCase().includes(query) ||
            it.ref.toLowerCase().includes(query) ||
            it.heading.toLowerCase().includes(query))
      ),
    [items, theme, query]
  );

  const copy = async (it: ExplorerItem) => {
    try {
      await navigator.clipboard.writeText(`“${it.text}” — ${it.ref} (WEB)`);
      setCopied(it.ref);
      window.setTimeout(() => setCopied((c) => (c === it.ref ? null : c)), 1800);
    } catch {
      // Clipboard blocked (permissions / insecure context): nothing to do.
    }
  };

  return (
    <div className="rounded-3xl bg-paper/90 p-5 shadow-2xl ring-1 ring-black/5 backdrop-blur-md sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search verses</span>
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a word or reference: light, fear, John 3…"
            className="w-full rounded-full bg-white py-3 pl-11 pr-4 text-base text-ink shadow-inner ring-1 ring-ink/10 placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-scripture"
          />
        </label>
        <p className="text-sm font-semibold text-ink/60" aria-live="polite">
          {results.length} {results.length === 1 ? "passage" : "passages"}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by theme">
        {[{ slug: null as string | null, title: "All" }, ...themes].map((t) => (
          <button
            key={t.title}
            type="button"
            aria-pressed={theme === t.slug}
            onClick={() => setTheme(t.slug)}
            className={clsx(
              "rounded-full px-3.5 py-1.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-scripture",
              theme === t.slug ? "bg-ink text-paper" : "bg-ink/5 text-ink/75 hover:bg-ink/10"
            )}
          >
            {t.title}
          </button>
        ))}
      </div>

      <ul className="mt-6 grid max-h-[36rem] gap-3 overflow-y-auto pr-1 md:grid-cols-2" data-lenis-prevent>
        {results.map((it) => (
          <li key={`${it.theme}-${it.ref}`} className="flex flex-col rounded-2xl bg-white p-5 ring-1 ring-ink/8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-scripture-deep">{it.ref}</p>
            <p className="verse mt-2 flex-1 text-lg text-ink">{it.text}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.12em]">
              <Link href={`/scripture/${it.theme}`} className="text-ink/60 underline-offset-4 hover:text-ink hover:underline">
                Study: {it.themeTitle}
              </Link>
              <a href={it.chapterUrl} target="_blank" rel="noopener noreferrer" className="text-ink/60 underline-offset-4 hover:text-ink hover:underline">
                Read chapter ↗
              </a>
              <button type="button" onClick={() => copy(it)} className="text-ink/60 underline-offset-4 hover:text-ink hover:underline">
                {copied === it.ref ? "Copied ✓" : "Copy"}
              </button>
            </div>
          </li>
        ))}
        {results.length === 0 && (
          <li className="copy col-span-full rounded-2xl bg-white p-6 text-center text-ink/70">
            No passages match that yet. Try a simpler word, like &ldquo;love&rdquo; or &ldquo;death&rdquo;.
          </li>
        )}
      </ul>
    </div>
  );
}
