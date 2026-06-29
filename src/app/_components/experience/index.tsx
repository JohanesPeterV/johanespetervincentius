import { WORK_EXPERIENCES } from '../work-experience/work-experiences';

export default function ExperienceSection() {
  return (
    <section className="flex w-full justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {'// Experience'}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Work Experience
          </h2>
        </div>
        <div className="relative mt-6 overflow-hidden rounded-3xl border border-white/15 bg-black/60 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl sm:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />
          <ol className="flex max-h-[55vh] flex-col gap-6 overflow-y-auto pr-1">
            {WORK_EXPERIENCES.map((experience) => (
              <li key={experience.company} className="flex flex-col gap-3">
                <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  {experience.company}
                </h3>
                <div className="flex flex-col gap-3">
                  {experience.positions.map((position) => (
                    <div key={position.name} className="flex flex-col gap-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-medium text-foreground/90">
                          {position.name}
                        </span>
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">
                          {position.workPeriod}
                        </span>
                      </div>
                      <p className="text-xs leading-5 text-muted-foreground">
                        {position.description}
                      </p>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
