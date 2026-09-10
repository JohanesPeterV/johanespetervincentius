'use client';

import { WORK_EXPERIENCES } from '@/app/_components/work-experience/work-experiences';
import { DiveProjects } from './dive-projects';
import { StackField } from './stack-field';
import { WORK_SECTION } from './descent';
import { WorkExperienceCard } from './work-experience-card';

type DiveWorkExperienceProps = {
  sectionRef: (element: HTMLDivElement | null) => void;
};

export const DiveWorkExperience = ({ sectionRef }: DiveWorkExperienceProps) => (
  <div
    ref={sectionRef}
    data-work-story="true"
    data-visible="false"
    role="region"
    aria-label={WORK_SECTION.title}
    className="dive-work-section pointer-events-auto invisible absolute left-0 top-0 flex flex-col text-left opacity-0"
  >
    <DiveProjects />
    <StackField />
    <div className="work-card-spread relative min-h-0 flex-1">
      {WORK_EXPERIENCES.map((job, index) => (
        <WorkExperienceCard key={job.company} job={job} index={index} />
      ))}
    </div>
  </div>
);
