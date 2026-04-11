import ScrollContainer from '@/components/scroll-container';
import { TECHNOLOGIES } from './technologies';
import TechnologySection from './technologies-section';

const Technologies = (): React.JSX.Element => {
  return (
    <section className="flex min-h-screen items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-14">
        <div className="flex items-center lg:pr-6">
          <div className="max-w-md space-y-5 px-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary/70">
              Primary stack
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.9rem]">
              React, Next.js, TypeScript, Node.js, PostgreSQL.
            </h2>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              Default stack for shipping web products with typed APIs, clear
              boundaries, and fast iteration.
            </p>
            <p className="text-sm leading-7 text-muted-foreground/80 sm:text-[15px]">
              Everything else is supporting range. This is the baseline.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white/30 px-5 py-4 shadow-lg ring-1 ring-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-black/30 sm:px-7 sm:py-6">
          <ScrollContainer className="pr-1 sm:pr-2">
            <div className="divide-y divide-black/5 pb-1 dark:divide-white/10">
              {TECHNOLOGIES.map((technology) => (
                <div
                  key={technology.category}
                  className="py-6 first:pt-1 last:pb-2 sm:py-7"
                >
                  <TechnologySection
                    description={technology.description}
                    contents={technology.contents}
                    title={technology.category}
                  />
                </div>
              ))}
            </div>
          </ScrollContainer>
        </div>
      </div>
    </section>
  );
};

export default Technologies;
