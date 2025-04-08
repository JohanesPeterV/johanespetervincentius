import { cn } from '@/lib/utils';
import { SOCIAL_LINKS } from './social_links';

type LinkProps = {
  iconSize?: number;
  className?: string;
};

export default function Links({ iconSize = 15, className }: LinkProps) {
  return (
    <div className={cn('bg-transparent flex space-x-2 p-0 w-min', className)}>
      {SOCIAL_LINKS.map(({ icon: Icon, url }, i) => (
        <a
          href={url}
          key={i}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform duration-300 hover:scale-110"
        >
          <Icon
            className="text-primary transition-colors duration-300 hover:text-foreground hidden sm:block"
            size={iconSize}
          />
          <Icon
            className="text-primary transition-colors duration-300 hover:text-foreground sm:hidden block"
            size={iconSize * 0.75}
          />
        </a>
      ))}
    </div>
  );
}
