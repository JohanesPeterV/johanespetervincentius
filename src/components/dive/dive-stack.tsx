'use client';

import { STACK_GROUPS } from '@/app/_components/stack';

export const DiveStack = () => (
  <>
    <header className="px-4 pb-6">
      <p className="identity-tag type-meta">What I build with</p>
      <h2 className="work-section-title font-display">Stack</h2>
    </header>
    <div className="px-4">
      {STACK_GROUPS.map((group) => (
        <section
          key={group.id}
          aria-labelledby={`stack-${group.id}`}
          data-group={group.id}
          className="stack-group grid gap-3 py-3 lg:grid-cols-[14rem_1fr] lg:gap-12"
        >
          <h3
            id={`stack-${group.id}`}
            className="stack-group-title font-display"
          >
            {group.title}
          </h3>
          <ul className="flex flex-wrap gap-x-7 gap-y-2">
            {group.technologies.map(({ name, icon: Icon }) => (
              <li
                key={name}
                className="stack-technology flex items-center gap-3"
              >
                <Icon aria-hidden="true" className="stack-icon shrink-0" />
                <span>{name}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  </>
);
