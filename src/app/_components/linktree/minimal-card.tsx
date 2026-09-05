import Link from 'next/link';

export default function MinimalCard() {
  return (
    <div className="pointer-events-auto relative z-10 mx-auto w-full max-w-xl rounded-[2rem] border border-border/60 bg-background/65 px-6 py-6 text-foreground shadow-2xl ring-1 ring-foreground/5 backdrop-blur-2xl sm:px-10 sm:py-10">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
        Software engineer
      </p>
      <h2 className="mt-4 max-w-lg font-display text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">
        Johanes Peter Vincentius
      </h2>
      <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
        Building thoughtful products for the web.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
        <Link
          href="/portfolio"
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          View portfolio
        </Link>
        <a
          href="mailto:johanespeter.jp@gmail.com"
          className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background/50 px-5 text-sm font-medium transition-colors hover:bg-muted"
        >
          Get in touch
        </a>
      </div>

      <nav
        aria-label="Social links"
        className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-border/60 pt-5 text-sm text-muted-foreground sm:mt-8 sm:pt-6"
      >
        <a
          href="https://github.com/JohanesPeterV"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          GitHub ↗
        </a>
        <a
          href="https://www.linkedin.com/in/johanes-vincentius-714b311a4"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          LinkedIn ↗
        </a>
        <a
          href="https://www.instagram.com/johanespeterv"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          Instagram ↗
        </a>
      </nav>
    </div>
  );
}
