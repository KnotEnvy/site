"use client";

import { useState } from "react";

/**
 * "I prayed this." A gentle, private acknowledgement: pressing it only reveals
 * a response on this page. Nothing is recorded or sent. If the visitor wants
 * to tell someone, the email link opens their own mail app.
 */
export default function PrayerResponse() {
  const [prayed, setPrayed] = useState(false);

  if (!prayed) {
    return (
      <button
        type="button"
        onClick={() => setPrayed(true)}
        className="rounded-full bg-dawn px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-ink shadow-lg shadow-dawn/30 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        I prayed this
      </button>
    );
  }

  return (
    <div role="status" className="page-enter rounded-2xl bg-white/10 p-6 text-left ring-1 ring-dawn/40">
      <p className="font-display text-4xl leading-none text-dawn">Welcome home.</p>
      <p className="copy mt-3 text-white/90">
        If you meant it, something real just happened, whether or not you feel
        different yet. Jesus said there is joy in heaven over one person who
        turns to God (Luke 15:7). That joy is about you.
      </p>
      <p className="copy mt-3 text-white/80">
        You don&apos;t have to figure out what comes next alone. We would be glad
        to hear from you and to pray for you. No one sees this but us.
      </p>
      <a
        href="mailto:Eternaltruth303@gmail.com?subject=I%20prayed%20the%20prayer"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-dawn px-5 py-2.5 text-sm font-bold uppercase tracking-[0.14em] text-ink transition hover:bg-white"
      >
        Tell us
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
          <path d="m3 6.5 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  );
}
