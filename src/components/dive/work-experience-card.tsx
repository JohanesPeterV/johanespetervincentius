import { ArrowUpRight } from 'lucide-react';

import type { WorkExperience } from '@/app/_components/work-experience/work-experiences';
import { PickableCard } from './pickable-card';

type WorkExperienceCardProps = {
  job: WorkExperience;
  index: number;
};

export const WorkExperienceCard = ({ job, index }: WorkExperienceCardProps) => {
  const current = job.status === 'current';
  return (
    <PickableCard
      title={job.company}
      variant="work"
      status={job.status}
      caption={`0${index + 1} / WORK`}
      face={
        <>
          <span className="type-meta flex w-full items-center justify-between gap-2">
            <span className="text-muted-foreground">0{index + 1}</span>
            {current ? (
              <span className="work-current-label">Current role</span>
            ) : (
              <ArrowUpRight size={16} aria-hidden />
            )}
          </span>
          <span className="card-face-title font-display">{job.company}</span>
          <span className="work-card-role type-label text-muted-foreground">
            {job.positions.map((position) => position.name).join(' · ')}
          </span>
          {job.summary ? (
            <span className="work-card-summary">{job.summary}</span>
          ) : (
            <span className="work-card-proof type-label">
              {job.showcases.map((showcase) => (
                <span key={showcase.title}>{showcase.title}</span>
              ))}
            </span>
          )}
          <span className="work-card-period type-meta mt-auto text-muted-foreground">
            {job.positions[0].workPeriod}
          </span>
        </>
      }
    >
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
      <ul className="work-contributions mt-7 grid gap-6 sm:grid-cols-2">
        {job.showcases.map((showcase) => (
          <li key={showcase.title}>
            <h4 className="type-label mb-2">{showcase.title}</h4>
            <p className="work-description text-muted-foreground">
              {showcase.description}
            </p>
          </li>
        ))}
      </ul>
      {job.products ? (
        <ul className="work-product-links mt-7 grid gap-3 sm:grid-cols-3 sm:gap-6">
          {job.products.map((product) => (
            <li key={product.href}>
              <a
                className="work-product-link flex items-center justify-between gap-4"
                href={product.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="grid gap-1">
                  <span className="type-label">{product.name}</span>
                  <span className="type-meta text-muted-foreground">
                    {product.description}
                  </span>
                </span>
                <ArrowUpRight size={18} aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </PickableCard>
  );
};
