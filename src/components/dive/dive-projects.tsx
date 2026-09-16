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
  <>
    <header className="px-4">
      <p className="identity-tag type-meta">Independent builds</p>
      <h2 className="work-section-title font-display">Projects</h2>
    </header>
    <div className="project-chapter flex">
      <ProjectShowcase />
      <div className="project-card-grid">
        {SIDE_PROJECTS.map((project, index) => (
          <ProjectCard
            key={project.title}
            project={project}
            index={index + 2}
          />
        ))}
      </div>
    </div>
  </>
);
