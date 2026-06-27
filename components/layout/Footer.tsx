import SplitText from "@/components/ui/SplitText";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-gradient-to-b from-transparent via-ink/85 to-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <p className="font-display text-4xl leading-none sm:text-6xl">
          <SplitText text="Death is not the end." />
        </p>
        <p className="mt-4 max-w-xl font-sans text-base normal-case tracking-normal text-paper/70">
          Near-death experiences, examined without bias — and what they reveal
          about the truth of Scripture.
        </p>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-paper/15 pt-6 text-sm text-paper/60 sm:flex-row">
          <span>© {new Date().getFullYear()} Heaven or Hell?</span>
          <span className="font-medium">
            No biases · No opinions · Rooted in reality
          </span>
        </div>
        <p className="mt-4 text-xs text-paper/40">
          Photography from Wikimedia Commons (Creative Commons / public domain);
          full attribution in <code>/public/images/credits.json</code>. Placeholder
          imagery — swap for original/AI art before launch.
        </p>
      </div>
    </footer>
  );
}
