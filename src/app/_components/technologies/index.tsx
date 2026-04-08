import ScrollContainer from '@/components/scroll-container';
import { TECHNOLOGIES } from './technologies';
import TechnologySection from './technologies-section';

export default function Technologies() {
  return (
    <section className="flex min-h-screen items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-12">
        <div className="flex items-center">
          <div className="max-w-md space-y-5 px-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary/70">
              Selected stack
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.8rem]">
              Tools I keep returning to.
            </h2>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              The mix changes with the product, but these are the technologies I
              tend to trust when the work needs to feel clear, stable, and well
              finished.
            </p>
            <p className="text-sm leading-7 text-muted-foreground/80 sm:text-[15px]">
              Less a checklist, more a working set shaped by real projects.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-white/15 bg-white/45 p-3 shadow-xl ring-1 ring-black/5 backdrop-blur-2xl dark:bg-black/45 sm:p-4">
          <ScrollContainer className="pr-1 sm:pr-2">
            <div className="grid grid-cols-1 gap-3 pb-1 sm:grid-cols-2">
              {TECHNOLOGIES.map((technology) => (
                <div
                  key={technology.category}
                  className="rounded-[24px] border border-black/5 bg-background/55 p-5 backdrop-blur-xl transition-colors duration-200 hover:bg-background/65 dark:border-white/10 sm:p-6"
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
}
