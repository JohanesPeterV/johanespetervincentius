import { ArrowUpRight } from 'lucide-react';

import type { WorkExperience } from '@/app/_components/work-experience/work-experiences';
import { PickableCard } from './pickable-card';
import { StackList } from './stack-list';

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
          <span className="work-card-company font-display">{job.company}</span>
          <span className="work-card-role type-label text-muted-foreground">
            {job.positions.map((position) => position.name).join(' · ')}
          </span>
          <span className="work-card-stack type-meta text-muted-foreground">
            {job.stack.primary.join(' · ')}
          </span>
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
      <div className="mt-5">
        <StackList stack={job.stack} />
      </div>
      <ul className="work-contributions mt-7 grid gap-5 sm:grid-cols-3">
        {job.showcases.map((showcase) => (
          <li key={showcase.title}>
            <h4 className="type-label mb-2">{showcase.title}</h4>
            <p className="work-description text-muted-foreground">
              {showcase.description}
            </p>
          </li>
        ))}
      </ul>
    </PickableCard>
  );
};
