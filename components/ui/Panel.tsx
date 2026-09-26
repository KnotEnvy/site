import { clsx } from "@/lib/clsx";

export type Tone = "light" | "dark";

/**
 * A frosted-glass panel that floats over the living sky. The sky runs from
 * near-white to near-black on every journey, so body copy never sits on it
 * bare (handoff.json criticalLessons #12): light panels are cream glass with
 * ink text, dark panels are night glass with white text.
 */
export default function Panel({
  children,
  tone = "light",
  className,
  as: Tag = "div",
  id,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  as?: "div" | "article" | "section" | "aside" | "figure" | "li";
  id?: string;
}) {
  return (
    <Tag
      id={id}
      className={clsx(
        "rounded-2xl backdrop-blur-md",
        tone === "light"
          ? "bg-paper/88 text-ink shadow-xl ring-1 ring-black/5"
          : "bg-night/70 text-white shadow-2xl ring-1 ring-white/12",
        className
      )}
    >
      {children}
    </Tag>
  );
}
