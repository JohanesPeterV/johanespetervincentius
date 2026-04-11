import ScrollContainer from '@/components/scroll-container';
import { CORE_STACK, TECHNOLOGIES } from './technologies';
import TechnologySection from './technologies-section';

const Technologies = (): React.JSX.Element => {
  const totalTools = TECHNOLOGIES.reduce(
    (count, technology) => count + technology.contents.length,
    0,
  );

  return (
    <section className="flex min-h-screen items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 lg:gap-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <div className="max-w-2xl space-y-5 px-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary/70">
              Technology
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.9rem]">
              TypeScript-first product work, with a stack that stays practical.
            </h2>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              I mostly ship with React, Next.js, Node.js, PostgreSQL, and
              Vercel. That is where the strongest depth is across frontend
              systems, typed APIs, delivery speed, and maintainable product
              decisions.
            </p>
            <p className="text-sm leading-7 text-muted-foreground/80 sm:text-[15px]">
              Everything else below is real working range, but the top stack is
              what I would want to be judged on.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-black/5 bg-white/35 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-black/30">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Default mode
              </p>
              <p className="mt-2 text-lg font-medium text-foreground">
                Full-stack web products
              </p>
            </div>
            <div className="rounded-[24px] border border-black/5 bg-white/35 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-black/30">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Categories
              </p>
              <p className="mt-2 text-lg font-medium text-foreground">
                {TECHNOLOGIES.length} working lanes
              </p>
            </div>
            <div className="rounded-[24px] border border-black/5 bg-white/35 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-black/30">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Coverage
              </p>
              <p className="mt-2 text-lg font-medium text-foreground">
                {totalTools} tools across delivery
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white/30 px-5 py-5 shadow-lg ring-1 ring-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-black/30 sm:px-7 sm:py-6">
          <div className="border-b border-black/5 pb-6 dark:border-white/10">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary/70">
              Default build stack
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {CORE_STACK.map((item) => (
                <a
                  key={item.name}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[24px] border border-primary/15 bg-primary/10 px-4 py-3 transition-colors duration-200 hover:border-primary/30 hover:bg-primary/15 focus:outline-none focus:ring-2 focus:ring-primary/35"
                  aria-label={`Visit ${item.name} documentation`}
                >
                  <p className="text-base font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.detail}
                  </p>
                </a>
              ))}
            </div>
          </div>

          <ScrollContainer className="pt-6 pr-1 sm:pr-2">
            <div className="grid gap-4 pb-1 md:grid-cols-2">
              {TECHNOLOGIES.map((technology) => (
                <TechnologySection
                  key={technology.category}
                  description={technology.description}
                  contents={technology.contents}
                  title={technology.category}
                />
              ))}
            </div>
          </ScrollContainer>
        </div>
      </div>
    </section>
  );
};

export default Technologies;
