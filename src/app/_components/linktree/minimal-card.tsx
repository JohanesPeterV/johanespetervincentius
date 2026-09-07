import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function MinimalCard() {
  return (
    <div className="pointer-events-auto relative z-10 mx-auto w-full max-w-xl p-6 sm:p-10">
      <p className="identity-tag type-label w-fit px-2 py-1">
        Software engineer
      </p>
      <h2 className="mt-4 max-w-lg font-display text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
        Johanes Peter Vincentius
      </h2>
      <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
        Building thoughtful products for the web.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
        <Button asChild size="lg" className="h-11">
          <Link href="/portfolio">View portfolio</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-11">
          <a href="mailto:johanespeter.jp@gmail.com">Get in touch</a>
        </Button>
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
