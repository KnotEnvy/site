import Image from "next/image";
import { clsx } from "@/lib/clsx";

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** Dark bottom gradient for caption/text legibility over the photo. */
  overlay?: boolean;
  /** Eager-load above-the-fold imagery. */
  priority?: boolean;
  sizes?: string;
};

/**
 * Real photography rendered with next/image `fill`. The wrapper must define a
 * size (height / aspect ratio) via `className`. A deep-sky fallback colour
 * shows while the image decodes so there is never a flash of empty box.
 */
export default function Photo({
  src,
  alt,
  className,
  overlay = false,
  priority = false,
  sizes = "(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 33vw",
}: Props) {
  return (
    <div className={clsx("relative isolate overflow-hidden bg-sky-deep", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
      {overlay && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
      )}
    </div>
  );
}
