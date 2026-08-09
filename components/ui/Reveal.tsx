import { clsx } from "@/lib/clsx";

/**
 * CSS-driven reveals. Content is VISIBLE by default — the hidden/animated state
 * is only applied once <RevealController> confirms JS is running and arms the
 * `reveal-ready` class on <html>. If JS fails to run for any reason, everything
 * stays fully visible. Nothing can get stuck invisible.
 */

/**
 * Which direction a block travels in from. Purely a CSS class - no JS and no
 * hydration surface, so server components can choreograph without going client.
 * Under prefers-reduced-motion the global rule in globals.css neutralises every
 * variant, so directional travel is never forced on anyone.
 */
export type RevealFrom =
  | "up"
  | "down"
  | "left"
  | "right"
  | "in"
  | "out"
  | "tilt-left"
  | "tilt-right";

/** How a block leaves the viewport. Mirror the entrance for a coherent pass. */
export type RevealExit = "up" | "left" | "right" | "in" | "out";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger offset in seconds. */
  delay?: number;
  /** Wipe up from a clipped baseline (place inside an overflow-hidden parent). */
  wipe?: boolean;
  /** Direction the block enters from. Defaults to the house "up" rise. */
  from?: RevealFrom;
  /**
   * How the block leaves as it scrolls off the top. Defaults to a gentle
   * upward drift. Disabled entirely under prefers-reduced-motion.
   */
  exit?: RevealExit;
};

export function Reveal({
  children,
  className,
  delay = 0,
  wipe = false,
  from = "up",
  exit,
}: RevealProps) {
  return (
    <div
      className={clsx(
        "reveal",
        wipe && "reveal--wipe",
        from !== "up" && `reveal--${from}`,
        exit && `reveal--exit-${exit}`,
        className
      )}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

/** Simple layout container; its <StaggerItem> children carry explicit delays. */
export function StaggerGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({
  children,
  className,
  delay = 0,
  wipe = false,
  from = "up",
  exit,
}: RevealProps) {
  return (
    <div
      className={clsx(
        "reveal",
        wipe && "reveal--wipe",
        from !== "up" && `reveal--${from}`,
        exit && `reveal--exit-${exit}`,
        className
      )}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
