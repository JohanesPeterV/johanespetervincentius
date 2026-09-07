import { ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { LINKTREE_LINKS } from './links';

export default function LinkButtons() {
  return (
    <nav aria-label="Find me online" className="flex w-full flex-col">
      {LINKTREE_LINKS.map(({ icon: Icon, label, handle, url }) => (
        <Button key={url} asChild variant="destination" size="profile">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Icon aria-hidden />
            <span className="flex flex-1 flex-col items-start gap-0.5">
              <span>{label}</span>
              <span className="type-meta text-muted-foreground">{handle}</span>
            </span>
            <ArrowUpRight aria-hidden />
          </a>
        </Button>
      ))}
    </nav>
  );
}
