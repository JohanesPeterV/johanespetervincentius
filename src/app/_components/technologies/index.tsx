import ScrollContainer from '@/components/scroll-container';
import { TECHNOLOGIES } from './technologies';
import TechnologySection from './technologies-section';

const Technologies = (): React.JSX.Element => {
  return (
    <section className="flex min-h-screen items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-5 px-1 sm:mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Technologies
          </h2>
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
