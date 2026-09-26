"use client";

import { useLocalStore } from "@/lib/useLocalStore";
import { clsx } from "@/lib/clsx";

type Day = { day: number; title: string; read: string; chapter: string; prompt: string };

/**
 * The 7-day reading journey. Ticks are remembered on this device only
 * (localStorage, guarded) - a convenience, never required: the plan works the
 * same with storage blocked.
 */
export default function ReadingPlan({ days }: { days: Day[] }) {
  const [raw, setRaw] = useLocalStore("et-reading-plan", "");
  const done = new Set(raw.split(",").filter(Boolean).map(Number));
  const count = days.filter((d) => done.has(d.day)).length;

  const toggle = (day: number) => {
    const next = new Set(done);
    if (next.has(day)) next.delete(day);
    else next.add(day);
    setRaw([...next].sort((a, b) => a - b).join(",") || null);
  };

  return (
    <div className="rounded-3xl bg-paper/90 p-5 shadow-2xl ring-1 ring-black/5 backdrop-blur-md sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-scripture-deep">Seven days · one chapter a day</p>
          <p className="copy mt-1 text-ink/70">Tick each day as you finish it. Your progress stays on this device.</p>
        </div>
        <p className="font-display text-4xl leading-none text-ink">
          {count}
          <span className="text-xl text-ink/40"> / {days.length}</span>
        </p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
        <div
          className="h-full rounded-full bg-gradient-to-r from-scripture to-dawn transition-[width] duration-700"
          style={{ width: `${(count / days.length) * 100}%` }}
        />
      </div>

      <ol className="mt-6 space-y-3">
        {days.map((d) => {
          const checked = done.has(d.day);
          return (
            <li
              key={d.day}
              className={clsx(
                "flex items-start gap-4 rounded-2xl p-4 ring-1 transition",
                checked ? "bg-scripture/10 ring-scripture/30" : "bg-white ring-ink/8"
              )}
            >
              <input
                id={`plan-day-${d.day}`}
                type="checkbox"
                checked={checked}
                onChange={() => toggle(d.day)}
                className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[#e8a72c]"
              />
              <div className="min-w-0 flex-1">
                <label htmlFor={`plan-day-${d.day}`} className="flex cursor-pointer flex-wrap items-baseline gap-x-3">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-ink/50">Day {d.day}</span>
                  <span className={clsx("font-semibold text-ink", checked && "line-through decoration-scripture/60")}>
                    {d.title}
                  </span>
                </label>
                <p className="copy mt-1 text-sm text-ink/70">{d.prompt}</p>
              </div>
              <a
                href={`https://www.bible.com/bible/111/${d.chapter}.NIV`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-full bg-ink px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-paper transition hover:bg-ink/80"
              >
                {d.read} ↗
              </a>
            </li>
          );
        })}
      </ol>
      {count === days.length && (
        <p className="copy mt-5 rounded-2xl bg-scripture/15 p-4 text-center font-semibold text-ink">
          You finished all seven days. Well done. Keep going with the Gospel of John, one chapter a day.
        </p>
      )}
    </div>
  );
}
