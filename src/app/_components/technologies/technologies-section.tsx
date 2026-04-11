import { Technology } from './technologies';

type TechnologySectionProps = {
  title: string;
  description: string;
  contents: Technology['contents'];
};

const TechnologySection = (
  props: TechnologySectionProps,
): React.JSX.Element => {
  const primaryContents = props.contents.filter(
    (content) => content.level === 'primary',
  );
  const secondaryContents = props.contents.filter(
    (content) => content.level === 'supporting',
  );

  return (
    <article className="rounded-[28px] border border-black/5 bg-background/45 p-5 shadow-sm ring-1 ring-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <h2 className="text-xl font-medium tracking-tight text-foreground sm:text-[1.35rem]">
              {props.title}
            </h2>
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              {props.contents.length} tools
            </p>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
            {props.description}
          </p>
        </div>
        <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {primaryContents.length} go-to
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div className="space-y-2.5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-primary/70">
            Go-to stack
          </p>
          <div
            role="list"
            aria-label={`${props.title} primary technologies`}
            className="flex flex-wrap gap-2.5"
          >
            {primaryContents.map((content) => (
              <div key={content.name} role="listitem">
                <a
                  href={content.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full border border-primary/15 bg-primary/10 px-3.5 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary/30 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/35"
                  aria-label={`Visit ${content.name} documentation`}
                >
                  {content.name}
                </a>
              </div>
            ))}
          </div>
        </div>

        {secondaryContents.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Also used
            </p>
            <div
              role="list"
              aria-label={`${props.title} supporting technologies`}
              className="flex flex-wrap gap-2"
            >
              {secondaryContents.map((content) => (
                <div key={content.name} role="listitem">
                  <a
                    href={content.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-full border border-black/5 bg-background/60 px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:border-primary/20 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/35 dark:border-white/10 dark:bg-black/20"
                    aria-label={`Visit ${content.name} documentation`}
                  >
                    {content.name}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default TechnologySection;
