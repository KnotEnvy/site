import Photo from "@/components/ui/Photo";
import Stars from "@/components/ui/Stars";

export type Bible = {
  name: string;
  style: string; // e.g. "Word-for-word" / "Thought-for-thought"
  publisher: string;
  price: string;
  rating: number;
  blurb: string;
  cover: string;
  /** Optional outbound link (used by the free Bible app card). */
  href?: string;
  /** Text for the outbound link, e.g. "Read free at Bible.com". */
  hrefLabel?: string;
  /** Corner ribbon, e.g. "Free". */
  badge?: string;
};

export default function BibleCard({ bible }: { bible: Bible }) {
  return (
    <article className="flex w-[80vw] max-w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-paper text-ink shadow-xl ring-1 ring-black/5">
      <div className="relative">
        <Photo
          src={bible.cover}
          alt={`${bible.name}`}
          sizes="(max-width: 768px) 80vw, 300px"
          className="aspect-[3/4] w-full"
        />
        {bible.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-blaze px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white shadow-lg">
            {bible.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h4 className="font-display text-2xl leading-none">{bible.name}</h4>
          <Stars value={bible.rating} className="mt-2 text-amber-500" />
        </div>

        <p className="font-sans text-sm normal-case leading-relaxed tracking-normal text-ink/70">
          {bible.blurb}
        </p>

        <dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-2 border-t border-ink/10 pt-3 text-xs">
          <Meta term="Style" value={bible.style} />
          <Meta term="Publisher" value={bible.publisher} />
          <Meta term="Avg. cost" value={bible.price} />
          <Meta term="Our rating" value={`${bible.rating} / 5`} />
        </dl>

        {bible.href && (
          <a
            href={bible.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-blaze px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-sky-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blaze"
          >
            {bible.hrefLabel ?? "Open"}
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
}

function Meta({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold uppercase tracking-wide text-ink/45">{term}</dt>
      <dd className="font-medium text-ink/80">{value}</dd>
    </div>
  );
}
