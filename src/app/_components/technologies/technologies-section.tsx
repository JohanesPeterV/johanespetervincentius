import { cn } from '@/lib/utils';
import { Technology } from './technologies';

type TechnologySectionProps = {
  title: string;
  description: string;
  contents: Technology['contents'];
};

export default function TechnologySection(props: TechnologySectionProps) {
  const primaryContents = props.contents.slice(0, 4);
  const secondaryContents = props.contents.slice(4);

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-medium tracking-tight text-foreground sm:text-[1.35rem]">
            {props.title}
          </h2>
          <p className="pt-1 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            {props.contents.length} tools
          </p>
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
          {props.description}
        </p>
      </div>

      <div className="space-y-4">
        <div role="list" aria-label={`${props.title} primary technologies`}>
          <div className="flex flex-wrap gap-2.5">
            {primaryContents.map((content) => (
              <a
                key={content.name}
                href={content.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex items-center rounded-full border px-3 py-1.5 text-sm',
                  'border-black/8 bg-background/80 text-foreground dark:border-white/10',
                  'transition-colors duration-200 hover:border-primary/20 hover:text-primary',
                  'focus:outline-none focus:ring-2 focus:ring-primary/35',
                )}
                role="listitem"
                aria-label={`Visit ${content.name} documentation`}
              >
                {content.name}
              </a>
            ))}
          </div>
        </div>

        {secondaryContents.length > 0 && (
          <div
            role="list"
            aria-label={`${props.title} supporting technologies`}
          >
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {secondaryContents.map((content) => (
                <a
                  key={content.name}
                  href={content.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'inline-flex items-center text-sm text-muted-foreground',
                    'transition-colors duration-200 hover:text-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/35 focus:ring-offset-2 focus:ring-offset-transparent',
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
