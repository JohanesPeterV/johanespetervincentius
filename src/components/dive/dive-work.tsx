'use client';

import { WORK_EXPERIENCES } from '@/app/_components/work-experience/work-experiences';
import { DiveProjects } from './dive-projects';
import { WorkExperienceCard } from './work-experience-card';

export const DiveWork = () => (
  <>
    <section aria-labelledby="work-experience">
      <header className="px-4 pb-6">
        <p className="identity-tag type-meta">Professional experience</p>
        <h2 id="work-experience" className="work-section-title font-display">
          Work
        </h2>
      </header>
      <div className="work-card-spread relative">
        {WORK_EXPERIENCES.map((job, index) => (
          <WorkExperienceCard key={job.company} job={job} index={index} />
        ))}
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
  </>
);
