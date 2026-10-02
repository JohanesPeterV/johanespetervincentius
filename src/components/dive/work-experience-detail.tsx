import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

import type { WorkExperience } from '@/app/_components/work-experience/work-experiences';
import { WorkExperienceMetrics } from '@/app/_components/work-experience/work-experience-metrics';

type WorkExperienceDetailProps = {
  job: WorkExperience;
  index: number;
};

export const WorkExperienceDetail = ({
  job,
  index,
}: WorkExperienceDetailProps) => (
  <article className="work-detail surface-panel grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-x-12">
    <div>
      <p className="type-meta flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
        <span className="whitespace-nowrap">0{index + 1} / WORK</span>
        {job.status === 'current' ? (
          <span className="work-current-label">Current role</span>
        ) : null}
      </p>
      <h3 className="card-detail-title mt-4 font-display">{job.company}</h3>
      {job.positions.map((position) => (
        <div key={position.name} className="mt-5">
          <h4 className="type-label">{position.name}</h4>
          <p className="type-meta mt-1 text-muted-foreground">
            {position.workPeriod}
          </p>
          <p className="work-description mt-5 text-muted-foreground">
            {position.description}
          </p>
        </div>
      ))}
      <div className="mt-6">
        <WorkExperienceMetrics metrics={job.metrics} />
        {job.metricsPeriod ? (
          <p className="type-meta mt-3 text-muted-foreground">
            {job.metricsPeriod}
          </p>
        ) : null}
      </div>
    </div>
    {job.deliverables ? (
      <ul className="work-deliverables grid content-start gap-6 sm:grid-cols-2">
        {job.deliverables.map((deliverable) => (
          <li key={deliverable.screenshot.src}>
            <a
              className="work-deliverable grid gap-3"
              href={deliverable.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={deliverable.screenshot.src}
                alt={deliverable.screenshot.alt}
                width={1200}
                height={750}
                sizes="(min-width: 1024px) 26rem, (min-width: 640px) 45vw, 90vw"
                className="work-deliverable-shot h-auto w-full"
              />
              <span className="flex items-center justify-between gap-4">
                <span className="grid gap-1">
                  <span className="type-label">{deliverable.name}</span>
                  <span className="type-meta text-muted-foreground">
                    {deliverable.description}
                  </span>
                </span>
                <ArrowUpRight size={18} aria-hidden />
              </span>
            </a>
          </li>
        ))}
      </ul>
    ) : null}
    <ul className="work-contributions grid gap-6 sm:grid-cols-2">
      {job.showcases.map((showcase) => (
        <li key={showcase.title}>
          <h4 className="type-label mb-2">{showcase.title}</h4>
          {showcase.metrics ? (
            <div className="my-3">
              <WorkExperienceMetrics metrics={showcase.metrics} />
            </div>
          ) : null}
          <p className="work-description text-muted-foreground">
            {showcase.description}
          </p>
        </li>
      ))}
    </ul>
  </article>
);
