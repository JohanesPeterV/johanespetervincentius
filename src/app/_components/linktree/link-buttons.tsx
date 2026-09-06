import { Button } from '@/components/ui/button';
import { LINKTREE_LINKS } from './links';

export default function LinkButtons() {
  return (
    <div className="flex w-full flex-col gap-3">
      {LINKTREE_LINKS.map(({ icon: Icon, label, handle, url }, index) => (
        <Button
          key={url}
          asChild
          variant={index === 0 ? 'default' : 'outline'}
          size="profile"
          className="relative"
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Icon className="absolute left-5 shrink-0" />
            <span className="flex flex-col items-center gap-0.5">
              <span>{label}</span>
              <span className="text-xs font-normal">{handle}</span>
            </span>
          </a>
        </Button>
      ))}
    </div>
  );
}
