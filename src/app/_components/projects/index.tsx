import SectionShell from '@/app/_components/section-shell';
import ScrollContainer from '@/components/scroll-container';
import { projects } from './projects';

export const Projects = (): React.JSX.Element => {
  return (
    <SectionShell
      eyebrow="Selected work"
      title="Products, not just demos."
      description="The common thread is operational usefulness. I care more about whether a system helps a team move faster than whether it looks clever in isolation."
      panelClassName="sm:p-5"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-[11px] uppercase tracking-[0.26em] text-zinc-500">
          <span>selected_work</span>
          <span>{projects.length} projects</span>
        </div>

        <ScrollContainer className="pr-2">
          <div className="grid grid-cols-1 gap-4 pb-1 xl:grid-cols-2">
            {projects.map((project, index) => (
              <article
                key={project.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors duration-200 hover:border-primary/40 sm:p-5"
              >
                <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                  <span>{`project_${String(index + 1).padStart(2, '0')}`}</span>
                  <span>{project.technologies.length} tech</span>
                </div>

                <h3 className="mt-4 text-xl font-semibold text-zinc-100 sm:text-2xl">
                  {project.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-zinc-300 sm:text-[15px]">
                  {project.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {project.technologies.map((technology) => (
                    <span
                      key={technology}
                      className="rounded-full border border-white/10 bg-zinc-900/80 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300"
                    >
                      {technology}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.24em]">
                  {project.link ? (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/10 px-3 py-1.5 text-zinc-200 transition-colors duration-200 hover:border-primary/50 hover:text-primary"
                    >
                      open
                    </a>
                  ) : null}
                  <a
                    href={project.repoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/10 px-3 py-1.5 text-zinc-200 transition-colors duration-200 hover:border-primary/50 hover:text-primary"
                  >
                    source
                  </a>
                </div>
              </article>
            ))}
          </div>
        </ScrollContainer>
      </div>
    </SectionShell>
  );
};
