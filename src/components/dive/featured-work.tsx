import { ArrowUpRight } from 'lucide-react';

import type { WorkExperience } from '@/app/_components/work-experience/work-experiences';

type FeaturedWorkProps = {
  job: WorkExperience;
};

export const FeaturedWork = ({ job }: FeaturedWorkProps) => (
  <article className="work-feature">
    <header className="grid gap-4 md:grid-cols-[1fr_2fr] md:gap-12">
      <div>
        <p className="work-current-label type-meta">Current role</p>
        <h3 className="work-feature-title font-display">{job.company}</h3>
      </div>
      <div className="grid gap-5">
        {job.positions.map((position) => (
          <div key={position.name}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <h4 className="type-label">{position.name}</h4>
              <p className="type-meta text-muted-foreground">
                {position.workPeriod}
              </p>
            </div>
            <p className="work-feature-summary mt-4">{position.description}</p>
          </div>
        ))}
      </div>
    </header>
    <ul className="work-contributions grid gap-6 md:grid-cols-3 md:gap-10">
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
      <ul className="work-product-links grid gap-3 sm:grid-cols-3 sm:gap-6">
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
  </article>
);
