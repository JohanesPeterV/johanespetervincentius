'use client';

import { ArrowDown } from 'lucide-react';

import { projects } from '@/app/_components/projects/projects';
import { Button } from '@/components/ui/button';
import { ProjectCard } from './project-card';
import { PROJECT_SECTION } from './descent';

type DiveProjectsProps = {
  sectionRef: (element: HTMLDivElement | null) => void;
  onContinue: () => void;
};

export const DiveProjects = ({ sectionRef, onContinue }: DiveProjectsProps) => (
  <div
    ref={sectionRef}
    data-project-deck="true"
    data-visible="false"
    role="region"
    aria-labelledby="project-deck-title"
    className="dive-project-section pointer-events-auto invisible absolute left-0 top-0 flex flex-col text-left opacity-0"
  >
    <header>
      <p className="identity-tag type-meta mb-2">
        {PROJECT_SECTION.tag} / {PROJECT_SECTION.title}
      </p>
      <h2 id="project-deck-title" className="work-section-title font-display">
        {PROJECT_SECTION.title}.
      </h2>
    </header>
    <div className="project-card-deck min-h-0 flex-1">
      {projects.map((project, index) => (
        <ProjectCard key={project.title} project={project} index={index} />
      ))}
    </div>
    <footer className="flex justify-end">
      <Button
        size="icon"
        onClick={onContinue}
        aria-label="Explore Tech Stack"
        className="h-11 w-11"
      >
        <ArrowDown aria-hidden />
      </Button>
    </footer>
  </div>
);
