import { Technology } from './technologies';

type TechnologySectionProps = {
  title: string;
  description: string;
  contents: Technology['contents'];
};

const formatToolCount = (count: number): string => {
  const countLabel = count.toString().padStart(2, '0');

  return `${countLabel} tools`;
};

const TechnologySection = (
  props: TechnologySectionProps,
): React.JSX.Element => {
  const primaryContents = props.contents.slice(0, 4);
  const secondaryContents = props.contents.slice(4);

  return (
    <article className="grid gap-4 lg:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)] lg:gap-6">
      <div className="rounded-[28px] border border-border/60 bg-background/45 p-5 shadow-sm backdrop-blur-xl sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-medium tracking-tight text-foreground sm:text-[1.55rem]">
            {props.title}
          </h3>
          <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-primary/80">
            {formatToolCount(props.contents.length)}
          </span>
        </div>
        <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-[15px]">
          {props.description}
        </p>
      </div>

      <div className="rounded-[28px] border border-border/60 bg-background/30 p-4 shadow-sm backdrop-blur-xl sm:p-5">
        <div role="list" aria-label={`${props.title} primary technologies`}>
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {primaryContents.map((content) => (
              <a
                key={content.name}
                href={content.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary/35 hover:bg-primary/15 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/35 sm:px-5 sm:text-[15px]"
                role="listitem"
                aria-label={`Visit ${content.name} documentation`}
              >
                {content.name}
              </a>
            ))}
          </div>
        </div>

        {secondaryContents.length > 0 && (
          <div className="mt-5 border-t border-border/60 pt-5">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Also worked with
            </p>
            <div
              role="list"
              aria-label={`${props.title} supporting technologies`}
            >
              <div className="flex flex-wrap gap-2.5">
                {secondaryContents.map((content) => (
                  <a
                    key={content.name}
                    href={content.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center rounded-full border border-border/70 bg-background/55 px-3.5 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:border-primary/25 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/35 sm:text-[15px]"
                    role="listitem"
                    aria-label={`Visit ${content.name} documentation`}
                  >
                    {content.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default TechnologySection;
