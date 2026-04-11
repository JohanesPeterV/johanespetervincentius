import ScrollContainer from '@/components/scroll-container';
import { TECHNOLOGIES } from './technologies';
import TechnologySection from './technologies-section';

const Technologies = (): React.JSX.Element => {
  return (
    <section className="flex min-h-screen items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 px-1 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Technologies
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Tools I reach for when building product interfaces, platform
              services, and polished user experiences.
            </p>
          </div>
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            {TECHNOLOGIES.length} focus areas
          </p>
        </div>
        <div className="overflow-hidden rounded-[36px] border border-border/60 bg-background/40 p-3 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl dark:ring-white/10 sm:p-4 lg:p-5">
          <ScrollContainer className="pr-1 sm:pr-2">
            <div className="space-y-4 pb-1 sm:space-y-5">
              {TECHNOLOGIES.map((technology) => (
                <div key={technology.category} className="first:pt-1 last:pb-2">
                  <TechnologySection
                    contents={technology.contents}
                    description={technology.description}
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
