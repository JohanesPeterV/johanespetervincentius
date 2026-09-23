'use client';

import { WORK_EXPERIENCES } from '@/app/_components/work-experience/work-experiences';
import { WorkExperienceCard } from './work-experience-card';

export const DiveWork = () => (
  <>
    <header className="px-4 pb-6">
      <p className="identity-tag type-meta">Professional experience</p>
      <h2 className="work-section-title font-display">Work</h2>
    </header>
    <div className="work-card-spread relative">
      <span className="work-card-rail" aria-hidden="true" />
      {WORK_EXPERIENCES.map((job, index) => (
        <WorkExperienceCard key={job.company} job={job} index={index} />
      ))}
    </div>
  </>
);
