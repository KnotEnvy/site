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
};

export default function BibleCard({ bible }: { bible: Bible }) {
  return (
    <article className="flex w-[80vw] max-w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-paper text-ink shadow-xl ring-1 ring-black/5">
      <Photo
        src={bible.cover}
        alt={`${bible.name}`}
        sizes="(max-width: 768px) 80vw, 300px"
        className="aspect-[3/4] w-full"
      />
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
