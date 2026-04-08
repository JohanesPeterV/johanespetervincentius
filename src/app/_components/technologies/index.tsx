import SectionShell from '@/app/_components/section-shell';
import ScrollContainer from '@/components/scroll-container';
import { TECHNOLOGIES } from './technologies';
import TechnologySection from './technologies-section';

const Technologies = (): React.JSX.Element => {
  return (
    <SectionShell
      eyebrow="Stack"
      title="Current tools."
      description="Mostly React, Next.js, TypeScript, Node.js, and PostgreSQL."
      panelClassName="overflow-hidden sm:px-7 sm:py-6"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/10 pb-4 text-sm tracking-tight text-primary/80 sm:text-[15px]">
          <span>React</span>
          <span className="text-zinc-600">/</span>
          <span>Next.js</span>
          <span className="text-zinc-600">/</span>
          <span>TypeScript</span>
          <span className="text-zinc-600">/</span>
          <span>Node.js</span>
          <span className="text-zinc-600">/</span>
          <span>PostgreSQL</span>
        </div>

        <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-[11px] uppercase tracking-[0.26em] text-zinc-500">
          <span>stack.index</span>
          <span>{TECHNOLOGIES.length} groups</span>
        </div>

        <ScrollContainer className="pr-1 sm:pr-2">
          <div className="divide-y divide-white/10 pb-1">
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
    </SectionShell>
  );
};

export default Technologies;
