'use client';

import {
  POMODORO_PLANTER,
  projects,
} from '@/app/_components/projects/projects';
import { ProjectCard } from './project-card';
import { ProjectShowcase } from './project-showcase';

const SIDE_PROJECTS = projects.filter(
  (project) => project !== POMODORO_PLANTER,
);

export const DiveProjects = () => (
  <div className="project-chapter flex">
    <ProjectShowcase />
    <div className="project-card-grid">
      {SIDE_PROJECTS.map((project, index) => (
        <ProjectCard key={project.title} project={project} index={index + 2} />
      ))}
    </div>
  </div>
);
