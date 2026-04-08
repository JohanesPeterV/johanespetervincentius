import SectionShell from '@/app/_components/section-shell';
import ScrollContainer from '@/components/scroll-container';
import { TECHNOLOGIES } from './technologies';
import TechnologySection from './technologies-section';

const Technologies = (): React.JSX.Element => {
  return (
    <SectionShell
      eyebrow="Primary skills"
      title={
        <>
          <span className="text-primary/95">React</span>,{' '}
          <span className="text-primary/95">Next.js</span>,{' '}
          <span className="text-primary/95">TypeScript</span>,{' '}
          <span className="text-primary/95">Node.js</span>, and{' '}
          <span className="text-primary/95">PostgreSQL</span>.
        </>
      }
      description="Primary depth across product frontend, typed APIs, and relational data."
      panelClassName="overflow-hidden sm:px-7 sm:py-6"
    >
      <div className="space-y-4">
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
