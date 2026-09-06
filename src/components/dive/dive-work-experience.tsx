import type { RefObject } from 'react';

import { WORK_EXPERIENCES } from '@/app/_components/work-experience/work-experiences';
import { selectWorkJob } from './camera-motion';
import type { OverlayNodes } from './dive-overlay-motion';

type DiveWorkExperienceProps = {
  overlayRef: RefObject<OverlayNodes>;
};

export const DiveWorkExperience = ({ overlayRef }: DiveWorkExperienceProps) => (
  <div className="mt-1 flex w-full flex-col gap-4">
    <div className="flex flex-wrap gap-1" aria-label="Employers">
      {WORK_EXPERIENCES.map((job, index) => (
        <button
          type="button"
          key={job.company}
          data-active="false"
          aria-pressed="false"
          onClick={() => selectWorkJob(index)}
          ref={(element) => {
            overlayRef.current.workRail[index] = element;
          }}
          className="dive-employer choice-control pointer-events-auto min-h-11 px-3 text-left text-xs"
        >
          {job.company}
        </button>
      ))}
    </div>
    <div className="grid overflow-hidden">
      {WORK_EXPERIENCES.map((job, index) => (
        <div
          key={job.company}
          data-active="false"
          ref={(element) => {
            overlayRef.current.workPanels[index] = element;
          }}
          className="dive-work-panel col-start-1 row-start-1 flex flex-col gap-3"
        >
          <p className="type-meta text-muted-foreground">
            {job.positions[0].name}
            <br />
            {job.positions[0].workPeriod}
          </p>
          <h3 className="font-display text-xl font-medium leading-tight tracking-tight sm:text-2xl">
            {job.headline}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {job.positions[0].description}
          </p>
          <ul className="flex flex-col gap-2 text-xs leading-relaxed">
            {job.showcases.map((showcase) => (
              <li key={showcase.title}>
                <span className="font-semibold">{showcase.title}. </span>
                <span className="text-muted-foreground">
                  {showcase.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);
