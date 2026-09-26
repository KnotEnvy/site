import SplitText from "@/components/ui/SplitText";
import { Reveal } from "@/components/ui/Reveal";
import { clsx } from "@/lib/clsx";

/**
 * Eyebrow chip + big display heading, the house pattern for a section opener.
 * The eyebrow sits on a dark chip so its accent colour stays legible on any
 * part of any sky (criticalLessons #12). The heading renders as plain text on
 * the server - SplitText only animates it after hydration.
 */
export default function SectionTitle({
  eyebrow,
  title,
  accent = "text-white",
  id,
  align = "left",
  as: Tag = "h2",
  size = "display-lg",
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  /** Colour class for the eyebrow text. */
  accent?: string;
  id?: string;
  align?: "left" | "center";
  as?: "h2" | "h3";
  size?: "display-lg" | "display-md";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={clsx(align === "center" && "text-center", className)}>
      {eyebrow && (
        <Reveal from="down">
          <p
            className={clsx(
              "inline-block rounded-full bg-ink/60 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.24em] ring-1 ring-white/15 backdrop-blur",
              accent
            )}
          >
            {eyebrow}
          </p>
        </Reveal>
      )}
      <Tag id={id} className={clsx(size, "mt-4 scroll-mt-24")}>
        <SplitText
          text={title}
          className="text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)] [text-shadow:0_2px_12px_rgba(0,0,0,0.35)]"
        />
      </Tag>
      {children}
    </div>
  );
}
