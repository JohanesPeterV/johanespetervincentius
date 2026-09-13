'use client';

import { STACK_GROUPS } from '@/app/_components/stack';
import { STACK_SECTION } from './descent';

type DiveStackProps = {
  sectionRef: (element: HTMLDivElement | null) => void;
};

export const DiveStack = ({ sectionRef }: DiveStackProps) => (
  <div
    ref={sectionRef}
    data-visible="false"
    data-section-scroll
    tabIndex={0}
    role="region"
    aria-label={STACK_SECTION.title}
    className="dive-card-section pointer-events-auto invisible absolute inset-0 overflow-y-auto text-left opacity-0 scrollbar-thin"
  >
    <div className="mx-auto max-w-[1440px] px-6 pb-24 pt-20">
      <header className="px-4 pb-10">
        <p className="identity-tag type-meta">{STACK_SECTION.subtitle}</p>
        <h2 className="work-section-title font-display">
          {STACK_SECTION.title}
        </h2>
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
    </div>
  </div>
);
