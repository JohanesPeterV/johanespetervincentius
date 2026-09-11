'use client';

import {
  POMODORO_PLANTER,
  projects,
} from '@/app/_components/projects/projects';
import { PROJECTS_SECTION } from './descent';
import { ProjectCard } from './project-card';
import { ProjectShowcase } from './project-showcase';

type DiveProjectsProps = {
  sectionRef: (element: HTMLDivElement | null) => void;
};

const SIDE_PROJECTS = projects.filter(
  (project) => project !== POMODORO_PLANTER,
);

export const DiveProjects = ({ sectionRef }: DiveProjectsProps) => (
  <div
    ref={sectionRef}
    data-visible="false"
    role="region"
    aria-label={PROJECTS_SECTION.title}
    className="dive-card-section project-chapter pointer-events-auto invisible absolute left-0 top-0 flex text-left opacity-0"
  >
    <ProjectShowcase />
    <div className="project-card-grid">
      {SIDE_PROJECTS.map((project, index) => (
        <ProjectCard key={project.title} project={project} index={index + 2} />
      ))}
    </div>
  </div>
);
