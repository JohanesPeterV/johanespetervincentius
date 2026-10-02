import type { WorkExperience } from '@/app/_components/work-experience/work-experiences';
import { WorkExperienceMetrics } from '@/app/_components/work-experience/work-experience-metrics';

type WorkExperienceCardProps = {
  job: WorkExperience;
  index: number;
  selectedCompany: string;
  onSelect: (company: string) => void;
};

export const WorkExperienceCard = ({
  job,
  index,
  selectedCompany,
  onSelect,
}: WorkExperienceCardProps) => {
  const current = job.status === 'current';
  return (
    <div className="work-card-slot">
      <div className="work-card-hanger">
        <button
          type="button"
          className="work-card surface-panel flex w-full flex-col text-left"
          aria-label={`${job.company}${current ? ', current role' : ''}`}
          aria-pressed={job.company === selectedCompany}
          aria-controls={`work-detail-${index}`}
          onClick={() => onSelect(job.company)}
        >
          <span className="type-meta flex w-full items-center justify-between gap-2">
            <span className="text-muted-foreground">0{index + 1}</span>
            {current ? (
              <span className="work-current-label">Current role</span>
            ) : null}
          </span>
          <span className="card-face-title font-display">{job.company}</span>
          <span className="work-card-role type-label text-muted-foreground">
            {job.positions.map((position) => position.name).join(' · ')}
          </span>
          <WorkExperienceMetrics metrics={job.metrics} />
          <span className="work-card-period type-meta mt-auto text-muted-foreground">
            {job.positions[0].workPeriod}
          </span>
        </button>
        <svg
          className="work-card-strings"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M 50 0 L 18 100 M 50 0 L 82 100" />
          <circle cx="18" cy="100" r="1.25" />
          <circle cx="82" cy="100" r="1.25" />
        </svg>
        <span className="work-card-pivot" aria-hidden="true" />
      </div>
    </div>
  );
};
