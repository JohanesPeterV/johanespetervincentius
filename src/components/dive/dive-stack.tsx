'use client';

import { STACK_GROUPS } from '@/app/_components/stack';
import type { SectionHeading } from './dive-sections';

export const DiveStack = ({ title, subtitle }: SectionHeading) => (
  <>
    <header className="px-4 pb-10">
      <p className="identity-tag type-meta">{subtitle}</p>
      <h2 className="work-section-title font-display">{title}</h2>
    </header>
    <div className="px-4">
      {STACK_GROUPS.map((group) => (
        <section
          key={group.id}
          aria-labelledby={`stack-${group.id}`}
          data-group={group.id}
          className="stack-group grid gap-6 py-8 lg:grid-cols-[14rem_1fr] lg:gap-12"
        >
          <header>
            <h3
              id={`stack-${group.id}`}
              className="stack-group-title font-display"
            >
              {group.title}
            </h3>
            <p className="type-label mt-2 max-w-[36ch] text-muted-foreground">
              {group.description}
            </p>
          </header>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-6 self-start sm:grid-cols-3 xl:grid-cols-4">
            {group.technologies.map(({ name, icon: Icon }) => (
              <li
                key={name}
                className="stack-technology flex items-center gap-3"
              >
                <Icon aria-hidden="true" className="stack-icon shrink-0" />
                <span className="min-w-0 break-words">{name}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  </>
);
