import ScrollContainer from '@/components/scroll-container';
import { cn } from '@/lib/utils';
import { TECHNOLOGIES } from './technologies';
import TechnologySection from './technologies-section';

type StackStat = {
  label: string;
  value: string;
};

export default function Technologies() {
  const totalTechnologies = TECHNOLOGIES.reduce(
    (count, technology) => count + technology.contents.length,
    0,
  );

  const stackStats: StackStat[] = [
    { label: 'Capability lanes', value: `${TECHNOLOGIES.length}` },
    { label: 'Tools', value: `${totalTechnologies}` },
    { label: 'Focus', value: 'UI to cloud' },
  ];

  return (
    <section className="flex min-h-screen items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-10">
        <div className="flex items-center">
          <div className="w-full rounded-[32px] border border-white/20 bg-white/60 p-6 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl dark:bg-black/55 sm:p-8 lg:p-10">
            <div className="inline-flex rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-primary/80">
              Stack
            </div>
            <div className="mt-5 space-y-4">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Built for polished interfaces and boring production.
              </h2>
              <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                I gravitate toward tools that keep the surface refined, the
                system understandable, and delivery fast without feeling rushed.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {stackStats.map((stackStat) => (
                <div
                  key={stackStat.label}
                  className="rounded-2xl border border-primary/10 bg-background/70 p-4 backdrop-blur-xl"
                >
                  <p className="text-2xl font-semibold tracking-tight text-foreground">
                    {stackStat.value}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {stackStat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-white/20 bg-white/60 p-3 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl dark:bg-black/55 sm:p-4">
          <ScrollContainer className="pr-1 sm:pr-2">
            <div className="grid grid-cols-1 gap-3 pb-1 sm:grid-cols-2">
              {TECHNOLOGIES.map((technology, index) => (
                <div
                  key={technology.category}
                  className={cn(
                    'rounded-[28px] border border-primary/10 bg-background/60 p-5 backdrop-blur-xl transition-colors duration-200 hover:border-primary/25 sm:p-6',
                    index === 0 ? 'sm:col-span-2' : '',
                  )}
                >
                  <TechnologySection
                    description={technology.description}
                    contents={technology.contents}
                    title={technology.category}
                    tone={index === 0 ? 'featured' : 'default'}
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
