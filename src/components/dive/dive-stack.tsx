'use client';

import { STACK } from '@/app/_components/stack';
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
      <ul className="grid grid-cols-2 gap-x-8 gap-y-4 px-4 sm:grid-cols-3 lg:grid-cols-4">
        {STACK.map((technology) => (
          <li key={technology}>{technology}</li>
        ))}
      </ul>
    </div>
  </div>
);
