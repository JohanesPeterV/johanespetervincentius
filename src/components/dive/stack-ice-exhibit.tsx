'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { AI_TOOLS, MAIN_STACK } from '@/app/_components/stack';
import type { StackTechnology } from '@/app/_components/stack';

import { AiUsageBadge } from './ai-usage-badge';
import { AiUsageChart } from './ai-usage-chart';
import { AiUsageSummary } from './ai-usage-summary';

const IceModel = dynamic(() => import('./ice-model'), {
  ssr: false,
  loading: () => <p role="status">Loading frozen MacBook…</p>,
});

class IceModelBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <p role="alert" className="type-label px-4">
          The 3D model could not load. Please reload to try again.
        </p>
      );
    }
    return this.props.children;
  }
}

const StackTechnologyList = ({
  technologies,
}: {
  technologies: StackTechnology[];
}) => (
  <ul className="stack-group mt-6 grid grid-cols-2 gap-x-4 gap-y-4 pt-6">
    {technologies.map(({ name, icon: Icon, usage }) => (
      <li
        key={name}
        className="stack-technology flex flex-wrap items-center gap-x-3 gap-y-1"
      >
        <Icon aria-hidden="true" className="stack-icon shrink-0" />
        <span className="min-w-0 break-words">{name}</span>
        {usage ? <AiUsageBadge provider={usage} /> : null}
      </li>
    ))}
  </ul>
);

export const StackIceExhibit = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  // REASON: preload near the chapter, then keep this one demand canvas alive.
  // Recreating its WebGL context on return makes the ice disappear during entry.
  useEffect(() => {
    const chapter = sectionRef.current?.closest('[data-dive-section]');
    if (!chapter) {
      return;
    }
    const updateVisibility = () => {
      if (chapter.getAttribute('data-nearby') === 'true') {
        setActive(true);
      }
    };
    updateVisibility();
    const visibility = new MutationObserver(updateVisibility);
    visibility.observe(chapter, {
      attributes: true,
      attributeFilter: ['data-nearby'],
    });
    return () => {
      visibility.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby={`skill-${MAIN_STACK.id}`}
      className="grid min-h-svh grid-cols-1 items-center gap-8 py-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,1fr)] lg:gap-16"
    >
      <div className="pointer-events-none relative h-[38svh] min-h-56 lg:h-[65svh]">
        <IceModelBoundary>{active ? <IceModel /> : null}</IceModelBoundary>
      </div>
      <div className="min-w-0">
        <p className="identity-tag type-meta">My core stack</p>
        <h3
          id={`skill-${MAIN_STACK.id}`}
          className="work-section-title font-display"
        >
          {MAIN_STACK.title}
        </h3>
        <p className="type-label mt-4 max-w-[40ch] text-muted-foreground">
          {MAIN_STACK.description}
        </p>
        <StackTechnologyList technologies={MAIN_STACK.technologies} />
        <StackTechnologyList technologies={AI_TOOLS} />
        <div className="mt-10 grid gap-10">
          <AiUsageSummary />
          <AiUsageChart />
        </div>
      </div>
    </section>
  );
};
