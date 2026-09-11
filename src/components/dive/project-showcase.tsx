import { ArrowUpRight } from 'lucide-react';

import { PomoplanterPreview } from '@/app/_components/projects/pomoplanter-preview';
import { POMODORO_PLANTER } from '@/app/_components/projects/projects';

export const ProjectShowcase = () => (
  <article className="project-showcase surface-panel flex flex-col">
    <span className="type-meta flex w-full items-center justify-between gap-2 text-muted-foreground">
      <span className="truncate">
        01 · {POMODORO_PLANTER.technologies.join(' · ')}
      </span>
      <ArrowUpRight size={16} aria-hidden />
    </span>
    <h3 className="card-face-title font-display">{POMODORO_PLANTER.title}</h3>
    <p className="work-description project-showcase-description text-muted-foreground">
      {POMODORO_PLANTER.description}
    </p>
    <div className="dive-project mt-auto">
      <PomoplanterPreview />
    </div>
  </article>
);
