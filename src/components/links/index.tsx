import { cn } from '@/lib/utils';
import { SOCIAL_LINKS } from './social_links';

type LinkVariant = 'icon' | 'label';

type LinkProps = {
  iconSize?: number;
  className?: string;
  linkClassName?: string;
  variant?: LinkVariant;
};

const Links = ({
  iconSize = 15,
  className,
  linkClassName,
  variant = 'icon',
}: LinkProps): React.JSX.Element => {
  if (variant === 'label') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {SOCIAL_LINKS.map((link) => {
          const isExternalLink = link.url.startsWith('http');

          return (
            <a
              href={link.url}
              key={link.label}
              target={isExternalLink ? '_blank' : undefined}
              rel={isExternalLink ? 'noopener noreferrer' : undefined}
              className={cn(
                'rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.26em] text-zinc-200 transition-colors duration-200 hover:border-primary/50 hover:text-primary',
                linkClassName,
              )}
            >
              {link.label}
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('bg-transparent flex space-x-2 p-0 w-min', className)}>
      {SOCIAL_LINKS.map((link) => {
        const isExternalLink = link.url.startsWith('http');
        const Icon = link.icon;

        return (
          <a
            href={link.url}
            key={link.label}
            target={isExternalLink ? '_blank' : undefined}
            rel={isExternalLink ? 'noopener noreferrer' : undefined}
            className={cn(
              'transition-transform duration-300 hover:scale-110',
              linkClassName,
            )}
          >
            <Icon
              className="hidden text-primary transition-colors duration-300 hover:text-foreground sm:block"
              size={iconSize}
            />
            <Icon
              className="block text-primary transition-colors duration-300 hover:text-foreground sm:hidden"
              size={iconSize * 0.75}
            />
          </a>
        );
      })}
    </div>
  );
};

export default Links;
