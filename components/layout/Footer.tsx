import Link from "next/link";
import SplitText from "@/components/ui/SplitText";
import { PAGES } from "@/lib/pages";
import { THEMES } from "@/lib/content/themes";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-gradient-to-b from-transparent via-ink/85 to-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <p className="font-display text-4xl leading-none sm:text-6xl">
          <SplitText text="Death is not the end." />
        </p>
        <p className="mt-4 max-w-xl font-sans text-base normal-case tracking-normal text-paper/70">
          Near-death experiences, examined without bias, and what they reveal
          about the truth of Scripture.
        </p>

        {/* Site map. Every page reachable from every page: good for readers
            who reach the bottom wanting more, and for search engines, which
            weigh a page by how the rest of the site links to it. */}
        <nav aria-label="Footer" className="mt-12 grid gap-10 border-t border-paper/15 pt-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-paper/70">Explore</p>
            <ul className="mt-4 space-y-2">
              {PAGES.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className="group inline-flex flex-col text-paper/85 transition hover:text-white">
                    <span className="font-semibold">{p.nav}</span>
                    <span className="text-sm text-paper/55 group-hover:text-paper/75">{p.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-paper/70">Scripture studies</p>
            <ul className="mt-4 space-y-2">
              {THEMES.map((t) => (
                <li key={t.slug}>
                  <Link href={`/scripture/${t.slug}`} className="text-paper/85 transition hover:text-white">
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-paper/70">If you are struggling</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/70">
              If you are thinking about ending your life, please reach out now. In the US,
              call or text <a href="tel:988" className="font-semibold text-paper underline underline-offset-2">988</a>{" "}
              (Suicide &amp; Crisis Lifeline). Elsewhere, find a local line at{" "}
              <a
                href="https://findahelpline.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-paper underline underline-offset-2"
              >
                findahelpline.com
              </a>
              .
            </p>
          </div>
        </nav>

        {/* Contact / socials. The whole site is a one-way argument until this
            block; it is the only place a visitor can answer back. Links sit on
            frosted pills so they read as affordances against the near-black
            end of the descent (criticalLessons #12). */}
        <div className="mt-12 border-t border-paper/15 pt-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-paper/70">
            Keep the conversation going
          </p>
          <p className="mt-3 max-w-xl font-sans text-base normal-case tracking-normal text-paper/70">
            Questions, doubts, or a story of your own? Reach out — we read
            everything.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="mailto:Eternaltruth303@gmail.com"
              className="inline-flex items-center gap-2.5 rounded-full bg-paper/10 px-4 py-2.5 text-sm font-medium text-paper ring-1 ring-paper/25 transition hover:bg-paper/20 hover:ring-paper/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blaze"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
                <path d="m3 6.5 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Eternaltruth303@gmail.com
            </a>

            <a
              href="https://www.instagram.com/theeternaltruth.official/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-paper/10 px-4 py-2.5 text-sm font-medium text-paper ring-1 ring-paper/25 transition hover:bg-paper/20 hover:ring-paper/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blaze"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
              </svg>
              <span>
                Instagram
                <span className="text-paper/60"> · @theeternaltruth.official</span>
              </span>
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-paper/15 pt-6 text-sm text-paper/60 sm:flex-row">
          <span>© {new Date().getFullYear()} Eternal Truth</span>
          <span className="font-medium">
            No biases · No opinions · Rooted in reality
          </span>
        </div>
        <p className="mt-4 text-xs text-paper/40">
          Photography from Wikimedia Commons (Creative Commons / public domain);
          full attribution in <code>/public/images/credits.json</code>. Scripture
          quotations are from the World English Bible (public domain), with
          God&apos;s covenant name rendered &ldquo;the LORD&rdquo; as in most
          English translations.
        </p>
      </div>
    </footer>
  );
}
