'use client';

import { ArrowDown } from 'lucide-react';

import { WORK_EXPERIENCES } from '@/app/_components/work-experience/work-experiences';
import { Button } from '@/components/ui/button';
import { DiveProjects } from './dive-projects';
import { WORK_SECTION } from './descent';
import { WorkExperienceCard } from './work-experience-card';

type DiveWorkExperienceProps = {
  sectionRef: (element: HTMLDivElement | null) => void;
  onContinue: () => void;
};

export const DiveWorkExperience = ({
  sectionRef,
  onContinue,
}: DiveWorkExperienceProps) => (
  <div
    ref={sectionRef}
    data-work-story="true"
    data-visible="false"
    role="region"
    aria-label={WORK_SECTION.title}
    className="dive-work-section pointer-events-auto invisible absolute left-0 top-0 flex flex-col text-left opacity-0"
  >
    <DiveProjects />
    <div className="work-card-spread relative min-h-0 flex-1">
      {WORK_EXPERIENCES.map((job, index) => (
        <WorkExperienceCard key={job.company} job={job} index={index} />
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
