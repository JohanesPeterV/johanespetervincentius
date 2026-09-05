import { LINKTREE_LINKS } from './links';

export default function LinkButtons() {
  return (
    <div className="flex w-full flex-col gap-3">
      {LINKTREE_LINKS.map(({ icon: Icon, label, handle, url }) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-background/25 px-5 py-3 transition-[transform,background-color,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none motion-reduce:transition-none sm:py-4"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
          <Icon className="absolute left-5 shrink-0 text-xl text-muted-foreground transition-colors group-hover:text-primary" />
          <span className="flex flex-col items-center">
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span className="text-xs text-muted-foreground">{handle}</span>
          </span>
        </a>
      ))}
    </div>
  );
}
