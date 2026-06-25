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
          className="group relative flex items-center justify-center rounded-2xl border border-white/10 bg-card/60 px-5 py-4 shadow-xl ring-1 ring-white/5 backdrop-blur-xl transition-all hover:scale-[1.02] hover:bg-secondary/70 hover:shadow-2xl"
        >
          <Icon className="absolute left-5 shrink-0 text-2xl text-primary transition-colors group-hover:text-foreground" />
          <span className="flex flex-col items-center">
            <span className="text-sm font-semibold text-foreground">
              {label}
            </span>
            <span className="text-xs text-muted-foreground">{handle}</span>
          </span>
        </a>
      ))}
    </div>
  );
}
