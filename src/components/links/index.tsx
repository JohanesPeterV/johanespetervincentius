import { cn } from '@/lib/utils';
import { SOCIAL_LINKS } from './social_links';

type LinkProps = {
  className?: string;
};

export default function Links({ className }: LinkProps) {
  return (
    <div className={cn('flex w-max gap-3', className)}>
      {SOCIAL_LINKS.map(({ icon: Icon, label, url }) => (
        <a
          href={url}
          key={url}
          aria-label={label}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-link flex h-11 w-11 items-center justify-center"
        >
          <Icon size={20} />
        </a>
      ))}
    </div>
  );
}
