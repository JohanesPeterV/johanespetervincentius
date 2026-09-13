'use client';

import { WORK_EXPERIENCES } from '@/app/_components/work-experience/work-experiences';
import { WORK_SECTION } from './descent';
import { DiveProjects } from './dive-projects';
import { FeaturedWork } from './featured-work';
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
      <section aria-labelledby="work-experience">
        <header className="px-4 pb-6">
          <p className="identity-tag type-meta">Professional experience</p>
          <h2 id="work-experience" className="work-section-title font-display">
            Work
          </h2>
        </header>
        {WORK_EXPERIENCES.filter((job) => job.status === 'current').map(
          (job) => (
            <FeaturedWork key={job.company} job={job} />
          ),
        )}
        <div className="work-card-spread relative">
          {WORK_EXPERIENCES.filter((job) => job.status === 'past').map(
            (job, index) => (
              <WorkExperienceCard key={job.company} job={job} index={index} />
            ),
          )}
        </div>
      </section>
      <section aria-labelledby="independent-projects" className="pt-12">
        <header className="px-4">
          <p className="identity-tag type-meta">Independent builds</p>
          <h2
            id="independent-projects"
            className="work-section-title font-display"
          >
            Projects
          </h2>
        </header>
        <DiveProjects />
      </section>
    </div>
  </div>
);
