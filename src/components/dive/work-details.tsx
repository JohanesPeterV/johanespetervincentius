import { ArrowUpRight, Github } from 'lucide-react';

import { PomoplanterPreview } from '@/app/_components/projects/pomoplanter-preview';
import { POMODORO_PLANTER, Project } from '@/app/_components/projects/projects';
import type { WorkExperience } from '@/app/_components/work-experience/work-experiences';
import { Button } from '@/components/ui/button';

export const ProjectDetails = ({ project }: { project: Project }) => (
  <div className="flex flex-col gap-5 pt-5">
    <p className="work-description text-muted-foreground">
      {project.description}
    </p>
    <p className="type-meta text-muted-foreground">
      {project.technologies.join(' · ')}
    </p>
    <div className="flex flex-wrap gap-2">
      {project.link ? (
        <Button asChild className="h-11 gap-2">
          <a href={project.link} target="_blank" rel="noopener noreferrer">
            Open project <ArrowUpRight aria-hidden />
          </a>
        </Button>
      ) : null}
      {project.repoLink ? (
        <Button asChild variant="outline" className="h-11 gap-2">
          <a href={project.repoLink} target="_blank" rel="noopener noreferrer">
            View source <Github aria-hidden />
          </a>
        </Button>
      ) : null}
    </div>
    {project === POMODORO_PLANTER ? (
      <div className="work-project-preview">
        <PomoplanterPreview />
      </div>
    ) : null}
  </div>
);

export const ExperienceDetails = ({ job }: { job: WorkExperience }) => (
  <>
    {job.positions.map((position) => (
      <div key={position.name} className="mt-5">
        <h4 className="type-label">{position.name}</h4>
        <p className="type-meta mt-1 text-muted-foreground">
          {position.workPeriod}
        </p>
        <p className="work-description mt-5 text-muted-foreground">
          {position.description}
        </p>
      </div>
    ))}
    <ul className="work-contributions mt-7 grid gap-5 sm:grid-cols-3">
      {job.showcases.map((showcase) => (
        <li key={showcase.title}>
          <h4 className="type-label mb-2">{showcase.title}</h4>
          <p className="work-description text-muted-foreground">
            {showcase.description}
          </p>
        </li>
      ))}
    </ul>
  </>
);
