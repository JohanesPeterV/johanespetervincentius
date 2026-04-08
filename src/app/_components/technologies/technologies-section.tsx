import { Technology } from './technologies';

type TechnologySectionProps = {
  title: string;
  description: string;
  contents: Technology['contents'];
};

const TechnologySection = (
  props: TechnologySectionProps,
): React.JSX.Element => {
  const primaryContents = props.contents.slice(0, 4);
  const secondaryContents = props.contents.slice(4);

  return (
    <div className="grid gap-5 sm:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)] sm:gap-8">
      <div className="space-y-3 pr-2">
        <div className="space-y-1.5">
          <h2 className="text-xl font-medium tracking-tight text-zinc-100 sm:text-[1.4rem]">
            {props.title}
          </h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
            {props.contents.length} tools
          </p>
        </div>
        <p className="max-w-xl text-sm leading-6 text-zinc-400 sm:text-[15px]">
          {props.description}
        </p>
      </div>

      <div className="space-y-4 sm:pt-0.5">
        <div role="list" aria-label={`${props.title} primary technologies`}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[15px] leading-7 text-zinc-100 sm:text-base">
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
                  <span className="text-zinc-600">/</span>
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
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm leading-7 text-zinc-400 sm:text-[15px]">
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
                    className="transition-colors duration-200 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/35"
                    aria-label={`Visit ${content.name} documentation`}
                  >
                    {content.name}
                  </a>
                  {index < secondaryContents.length - 1 && (
                    <span className="text-zinc-700">/</span>
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
