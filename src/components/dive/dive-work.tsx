'use client';

import { WORK_EXPERIENCES } from '@/app/_components/work-experience/work-experiences';
import { WORK_SECTION } from './descent';
import { DiveProjects } from './dive-projects';
import { WorkExperienceCard } from './work-experience-card';

type DiveWorkProps = {
  sectionRef: (element: HTMLDivElement | null) => void;
};

export const DiveWork = ({ sectionRef }: DiveWorkProps) => (
  <div
    ref={sectionRef}
    data-visible="false"
    data-section-scroll
    tabIndex={0}
    role="region"
    aria-label={WORK_SECTION.title}
    className="dive-card-section pointer-events-auto invisible absolute inset-0 overflow-y-auto text-left opacity-0 scrollbar-thin"
  >
    <div className="mx-auto max-w-[1440px] px-6 pb-24 pt-20">
      <header className="px-4 pb-8">
        <h2 className="card-face-title font-display">{WORK_SECTION.title}</h2>
        <p className="type-meta text-muted-foreground">
          {WORK_SECTION.subtitle}
        </p>
      </header>
      <section aria-label="Work experience">
        <div className="work-card-spread relative">
          {WORK_EXPERIENCES.map((job, index) => (
            <WorkExperienceCard key={job.company} job={job} index={index} />
          ))}
        </div>
      </section>
      <section aria-labelledby="independent-projects" className="pt-8">
        <h3 id="independent-projects" className="identity-tag type-label mx-4">
          Independent projects
        </h3>
        <DiveProjects />
      </section>
    </div>
  </div>
);
