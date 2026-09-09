'use client';

import { ArrowDown } from 'lucide-react';

import { projects } from '@/app/_components/projects/projects';
import { WORK_EXPERIENCES } from '@/app/_components/work-experience/work-experiences';
import { Button } from '@/components/ui/button';
import { WORK_SECTION } from './descent';
import { WorkCard } from './work-card';
import { ExperienceDetails, ProjectDetails } from './work-details';

type DiveWorkProps = {
  sectionRef: (element: HTMLDivElement | null) => void;
  onContinue: () => void;
};

export const DiveWork = ({ sectionRef, onContinue }: DiveWorkProps) => (
  <div
    ref={sectionRef}
    data-work-story="true"
    data-visible="false"
    role="region"
    aria-labelledby="work-title"
    className="dive-work-section pointer-events-auto invisible absolute left-0 top-0 flex flex-col text-left opacity-0"
  >
    <header>
      <p className="identity-tag type-meta mb-2">
        {WORK_SECTION.tag} / {WORK_SECTION.subtitle}
      </p>
      <h2 id="work-title" className="work-section-title font-display">
        Work.
      </h2>
    </header>
    <div className="work-card-spread relative min-h-0 flex-1">
      {projects.map((project) => (
        <WorkCard
          key={project.title}
          title={project.title}
          kind="Project"
          caption={project.technologies.join(' · ')}
        >
          <ProjectDetails project={project} />
        </WorkCard>
      ))}
      {WORK_EXPERIENCES.map((job) => (
        <WorkCard
          key={job.company}
          title={job.company}
          kind="Experience"
          caption={job.positions[0].workPeriod}
          status={job.status}
        >
          <ExperienceDetails job={job} />
        </WorkCard>
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
