import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found | Heaven or Hell. Real?",
  robots: { index: false, follow: true },
};

/**
 * On-brand 404. Renders over the same living sky as everything else (the
 * canvas is mounted in the root layout), so a wrong URL still lands the
 * visitor inside the experience rather than on a system-font error page.
 */
export default function NotFound() {
  return (
    <section className="relative z-10 flex min-h-[100svh] flex-col justify-center px-4 py-28 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <p className="mb-4 inline-block rounded-full bg-paper/85 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-ink/70 backdrop-blur">
          404
        </p>

        <h1 className="display-lg text-blaze drop-shadow-[0_2px_20px_rgba(255,255,255,0.5)]">
          <span className="block">This page</span>
          <span className="block text-ink">crossed over.</span>
        </h1>

        <div className="mt-8 rounded-2xl bg-paper/85 p-5 backdrop-blur">
          <p className="font-sans text-base normal-case leading-relaxed tracking-normal text-ink/80 sm:text-lg">
            Whatever you were looking for is not here. The testimonies,
            the science, and the rest of the descent still are.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full bg-blaze px-5 py-2.5 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-blaze/90"
            >
              Back to the top
            </Link>
            <Link
              href="/#playlists"
              className="rounded-full bg-ink/10 px-5 py-2.5 text-sm font-bold uppercase tracking-[0.14em] text-ink transition hover:bg-ink/20"
            >
              Watch the stories
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
