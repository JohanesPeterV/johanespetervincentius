import SectionShell from '@/app/_components/section-shell';
import ScrollContainer from '@/components/scroll-container';
import { WORK_EXPERIENCES } from './work-experiences';

const WorkExperience = (): React.JSX.Element => {
  return (
    <SectionShell
      eyebrow="Career log"
      title="Shipping through ambiguity."
      description="Most of my work sits at the intersection of product delivery, messy operations, and systems that need to keep working after launch."
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-[11px] uppercase tracking-[0.26em] text-zinc-500">
          <span>experience.log</span>
          <span>{WORK_EXPERIENCES.length} companies</span>
        </div>

        <ScrollContainer className="pr-2">
          <div className="space-y-4 pb-1">
            {WORK_EXPERIENCES.map((workExperience) => (
              <article
                key={workExperience.company}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary/85">
                  {workExperience.company}
                </p>

                <div className="mt-4 space-y-4">
                  {workExperience.positions.map((position) => (
                    <div
                      key={`${workExperience.company}-${position.name}`}
                      className="space-y-3 border-t border-white/10 pt-4 first:border-t-0 first:pt-0"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <h3 className="text-lg font-semibold text-zinc-100 sm:text-xl">
                          {position.name}
                        </h3>
                        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                          {position.workPeriod}
                        </span>
                      </div>

                      <p className="text-sm leading-7 text-zinc-300 sm:text-[15px]">
                        {position.description}
                      </p>

                      {position.highlights ? (
                        <ul className="space-y-2">
                          {position.highlights.map((highlight) => (
                            <li
                              key={highlight}
                              className="flex gap-3 text-sm leading-6 text-zinc-400 sm:text-[15px]"
                            >
                              <span className="font-mono text-primary">-</span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </ScrollContainer>
      </div>
    </SectionShell>
  );
};

export default WorkExperience;
