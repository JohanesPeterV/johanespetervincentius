import { LINKTREE_LINKS } from './links';
import { ArrowUpRight } from 'lucide-react';

export default function LinkButtons() {
  return (
    <div className="flex w-full flex-col">
      {LINKTREE_LINKS.map(({ icon: Icon, label, handle, url }) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="profile-link flex items-center gap-4 py-3 sm:py-4"
        >
          <Icon className="shrink-0 text-lg" />
          <span className="flex flex-1 flex-col gap-1">
            <span className="font-display text-sm">{label}</span>
            <span className="text-xs text-muted-foreground">{handle}</span>
          </span>
          <ArrowUpRight size={14} aria-hidden />
        </a>
      ))}
    </div>
  );
}
