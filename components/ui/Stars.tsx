import { clsx } from "@/lib/clsx";

type Props = {
  /** Rating from 0–max, in half-star steps. */
  value: number;
  max?: number;
  className?: string;
};

function StarPath({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 18.9 6.1 21l1.2-6.5L2.5 9.9l6.6-.9L12 2.5z" />
    </svg>
  );
}

function Star({ fill }: { fill: "full" | "half" | "empty" }) {
  return (
    <span className="relative inline-block h-5 w-5">
      <StarPath className="absolute inset-0 h-5 w-5 opacity-25" />
      {fill !== "empty" && (
        <span
          className={clsx(
            "absolute inset-0 overflow-hidden",
            fill === "half" ? "w-1/2" : "w-full"
          )}
        >
          <StarPath className="h-5 w-5" />
        </span>
      )}
    </span>
  );
}

/** Accessible star rating, rounded to the nearest half. No render-time impurity. */
export default function Stars({ value, max = 5, className }: Props) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div
      className={clsx("flex items-center gap-0.5", className)}
      role="img"
      aria-label={`Rated ${rounded} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const pos = i + 1;
        const fill = rounded >= pos ? "full" : rounded >= pos - 0.5 ? "half" : "empty";
        return <Star key={i} fill={fill} />;
      })}
    </div>
  );
}
