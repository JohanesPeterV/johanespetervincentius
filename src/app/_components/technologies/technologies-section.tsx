import { Technology } from './technologies';

type TechnologySectionProps = {
  title: string;
  contents: Technology['contents'];
};

const TechnologySection = (
  props: TechnologySectionProps,
): React.JSX.Element => {
  const primaryContents = props.contents.slice(0, 4);
  const secondaryContents = props.contents.slice(4);

  return (
    <div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-6 lg:grid-cols-[140px_minmax(0,1fr)] lg:gap-8">
      <div className="sm:pt-2">
        <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground sm:text-[13px]">
          {props.title}
        </h2>
      </div>

      <div className="space-y-2.5">
        <div role="list" aria-label={`${props.title} primary technologies`}>
          <div className="flex flex-wrap gap-2">
            {primaryContents.map((content) => (
              <div key={content.name} role="listitem">
                <a
                  href={content.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full border border-black/5 bg-background/70 px-3 py-1.5 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary/20 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/35 dark:border-white/10 dark:bg-white/5"
                  aria-label={`Visit ${content.name} documentation`}
                >
                  {content.name}
                </a>
              </div>
            ))}
          </div>
        </div>

        {secondaryContents.length > 0 && (
          <div
            role="list"
            aria-label={`${props.title} supporting technologies`}
          >
            <div className="flex flex-wrap gap-2">
              {secondaryContents.map((content) => (
                <div key={content.name} role="listitem">
                  <a
                    href={content.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-full border border-transparent bg-transparent px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:border-black/5 hover:bg-background/40 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/35 dark:hover:border-white/10 dark:hover:bg-white/5"
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
    </div>
  );
};

export default TechnologySection;
