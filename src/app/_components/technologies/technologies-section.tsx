import { cn } from '@/lib/utils';
import { Technology } from './technologies';

type TechnologySectionProps = {
  title: string;
  description: string;
  contents: Technology['contents'];
  tone: 'default' | 'featured';
};

export default function TechnologySection(props: TechnologySectionProps) {
  const featuredCount = props.tone === 'featured' ? 4 : 3;
  const featuredContents = props.contents.slice(0, featuredCount);
  const remainingContents = props.contents.slice(featuredCount);

  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary/70">
            {props.tone === 'featured' ? 'Core surface' : 'Capability lane'}
          </p>
          <h2
            className={cn(
              'font-semibold tracking-tight text-foreground',
              props.tone === 'featured'
                ? 'text-2xl sm:text-3xl'
                : 'text-xl sm:text-2xl',
            )}
          >
            {props.title}
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
          {props.description}
        </p>
      </div>

      <div className="space-y-3">
        <div role="list" aria-label={`${props.title} featured technologies`}>
          <div className="flex flex-wrap gap-2.5">
            {featuredContents.map((content) => (
              <a
                key={content.name}
                href={content.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium',
                  'border-primary/10 bg-white/65 text-foreground shadow-sm backdrop-blur-xl',
                  'transition-colors duration-200 hover:border-primary/30 hover:text-primary',
                  'focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-black/45',
                )}
                role="listitem"
                aria-label={`Visit ${content.name} documentation`}
              >
                {content.name}
              </a>
            ))}
          </div>
        </div>

        {remainingContents.length > 0 && (
          <div
            role="list"
            aria-label={`${props.title} supporting technologies`}
          >
            <div className="flex flex-wrap gap-2">
              {remainingContents.map((content) => (
                <a
                  key={content.name}
                  href={content.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'inline-flex items-center rounded-full border px-3 py-1 text-xs sm:text-sm',
                    'border-transparent bg-muted/70 text-muted-foreground',
                    'transition-colors duration-200 hover:border-primary/20 hover:bg-primary/10 hover:text-primary',
                    'focus:outline-none focus:ring-2 focus:ring-primary/40',
                  )}
                  role="listitem"
                  aria-label={`Visit ${content.name} documentation`}
                >
                  {content.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
