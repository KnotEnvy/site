import { clsx } from "@/lib/clsx";

/**
 * CSS-driven reveals. Content is VISIBLE by default — the hidden/animated state
 * is only applied once <RevealController> confirms JS is running and arms the
 * `reveal-ready` class on <html>. If JS fails to run for any reason, everything
 * stays fully visible. Nothing can get stuck invisible.
 */

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger offset in seconds. */
  delay?: number;
  /** Wipe up from a clipped baseline (place inside an overflow-hidden parent). */
  wipe?: boolean;
};

export function Reveal({ children, className, delay = 0, wipe = false }: RevealProps) {
  return (
    <div
      className={clsx("reveal", wipe && "reveal--wipe", className)}
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
}: RevealProps) {
  return (
    <div
      className={clsx("reveal", wipe && "reveal--wipe", className)}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
