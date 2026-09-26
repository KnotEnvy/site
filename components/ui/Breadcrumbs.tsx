import Link from "next/link";
import { clsx } from "@/lib/clsx";

/**
 * Visible breadcrumb trail. The same trail is emitted as BreadcrumbList JSON-LD
 * by each page (lib/seo.ts), so what people see and what search engines read
 * always agree.
 */
export default function Breadcrumbs({
  trail,
  tone = "light",
}: {
  trail: { name: string; path: string }[];
  tone?: "light" | "dark";
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol
        className={clsx(
          "inline-flex flex-wrap items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur",
          tone === "light" ? "bg-paper/85 text-ink/60" : "bg-night/55 text-white/60 ring-1 ring-white/10"
        )}
      >
        {trail.map((t, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={t.path} className="inline-flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className={tone === "light" ? "text-ink/85" : "text-white/90"}>
                  {t.name}
                </span>
              ) : (
                <>
                  <Link href={t.path} className="transition hover:underline">
                    {t.name}
                  </Link>
                  <span aria-hidden="true">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
