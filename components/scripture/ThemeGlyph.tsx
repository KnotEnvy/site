import type { ThemeMeta } from "@/lib/content/themes";

/** Line-art glyph for each study theme (cards, headers). Decorative. */
export default function ThemeGlyph({ kind, className = "h-12 w-12" }: { kind: ThemeMeta["glyph"]; className?: string }) {
  const p = {
    viewBox: "0 0 48 48",
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (kind) {
    case "gate": // an open doorway with light beyond
      return (
        <svg {...p}>
          <path d="M12 42V18a12 12 0 0124 0v24" />
          <path d="M18 42V20a6 6 0 0112 0v22" opacity="0.5" />
          <path d="M6 42h36" />
        </svg>
      );
    case "sun":
      return (
        <svg {...p}>
          <circle cx="24" cy="24" r="7" />
          <path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.5 10.5l4.2 4.2M33.3 33.3l4.2 4.2M10.5 37.5l4.2-4.2M33.3 14.7l4.2-4.2" />
        </svg>
      );
    case "flame":
      return (
        <svg {...p}>
          <path d="M24 43c-8 0-13-5.5-13-12.5C11 22 19 18 20 8c6 4 9 10 8.5 15 2-1.5 3.5-4 3.5-6.5 4 3.5 5 8.5 5 13.5C37 37.5 32 43 24 43z" />
          <path d="M24 43c-3.5 0-5.5-2.5-5.5-5.5 0-4 3.5-6 4.5-10 3 2.5 6.5 6 6.5 10 0 3-2 5.5-5.5 5.5z" opacity="0.6" />
        </svg>
      );
    case "cross":
      return (
        <svg {...p}>
          <path d="M24 5v38M13 16h22" strokeWidth="2.6" />
          <circle cx="24" cy="16" r="13" opacity="0.35" />
        </svg>
      );
    case "wings":
      return (
        <svg {...p}>
          <path d="M24 16c-3-7-12-11-18-8 1 9 7 14 18 14 11 0 17-5 18-14-6-3-15 1-18 8z" />
          <path d="M24 22c-2 5-8 10-13 9M24 22c2 5 8 10 13 9M24 14v24" opacity="0.6" />
        </svg>
      );
    case "anchor":
      return (
        <svg {...p}>
          <circle cx="24" cy="9" r="4" />
          <path d="M24 13v29M16 20h16M8 28c0 8 7 14 16 14s16-6 16-14M8 28l-3 4M8 28l4 3M40 28l3 4M40 28l-4 3" />
        </svg>
      );
  }
}
