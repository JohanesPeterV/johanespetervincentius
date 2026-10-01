import type { WorkExperience } from './work-experiences';

type WorkExperienceMetricsProps = {
  metrics: WorkExperience['metrics'];
};

export const WorkExperienceMetrics = ({
  metrics,
}: WorkExperienceMetricsProps) => {
  if (!metrics.length) {
    return null;
  }

  return (
    <span className="work-metrics" role="list" aria-label="Work impact">
      {metrics.map((metric) => (
        <span key={metric.label} className="work-metric" role="listitem">
          <span className="work-metric-value font-display">{metric.value}</span>
          <span className="type-meta text-muted-foreground">
            {metric.label}
          </span>
        </span>
      ))}
    </span>
  );
};
