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
    <div className="grid gap-4 sm:grid-cols-[minmax(0,0.28fr)_minmax(0,0.72fr)] sm:gap-8">
      <div className="pr-2">
        <h2 className="text-xl font-medium tracking-tight text-foreground sm:text-[1.4rem]">
          {props.title}
        </h2>
      </div>

      <div className="space-y-4 sm:pt-0.5">
        <div role="list" aria-label={`${props.title} primary technologies`}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[15px] leading-7 text-foreground sm:text-base">
            {primaryContents.map((content, index) => (
              <div
                key={content.name}
                className="flex items-center gap-3"
                role="listitem"
              >
                <a
                  href={content.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/35"
                  aria-label={`Visit ${content.name} documentation`}
                >
                  {content.name}
                </a>
                {index < primaryContents.length - 1 && (
                  <span className="text-muted-foreground/50">/</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {secondaryContents.length > 0 && (
          <div
            role="list"
            aria-label={`${props.title} supporting technologies`}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm leading-7 text-muted-foreground sm:text-[15px]">
              {secondaryContents.map((content, index) => (
                <div
                  key={content.name}
                  className="flex items-center gap-3"
                  role="listitem"
                >
                  <a
                    href={content.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-200 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/35"
                    aria-label={`Visit ${content.name} documentation`}
                  >
                    {content.name}
                  </a>
                  {index < secondaryContents.length - 1 && (
                    <span className="text-muted-foreground/40">/</span>
                  )}
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
