import { ArrowUpRight, Github } from 'lucide-react';

import { Project } from '@/app/_components/projects/projects';
import { Button } from '@/components/ui/button';
import { PickableCard } from './pickable-card';

type ProjectCardProps = {
  project: Project;
  index: number;
};

export const ProjectCard = ({ project, index }: ProjectCardProps) => (
  <PickableCard
    title={project.title}
    variant="project"
    caption={`0${index} / PROJECT`}
    face={
      <>
        <span className="type-meta flex w-full items-center justify-between text-muted-foreground">
          <span>0{index}</span>
          <ArrowUpRight size={14} aria-hidden />
        </span>
        <span className="project-card-title font-display">{project.title}</span>
        <span className="project-card-stack type-meta text-muted-foreground">
          {project.technologies.join(' · ')}
        </span>
      </>
    }
  >
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
            <a
              href={project.repoLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              View source <Github aria-hidden />
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  </PickableCard>
);
