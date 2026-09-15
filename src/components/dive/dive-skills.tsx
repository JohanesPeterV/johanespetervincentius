'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { STACK_GROUPS } from '@/app/_components/stack';

const SKILLS = [
  {
    group: 'main',
    title: 'Product engineering',
    description:
      'From the first interface to the business logic behind it. I build complete web products with shared components and a typed foundation.',
    placement: 'lg:col-start-1 lg:row-start-1',
  },
  {
    group: 'backend',
    title: 'Backend systems',
    description:
      'APIs, real-time updates, and the workflows that keep a product moving. I connect the interface to reliable application logic.',
    placement: 'lg:col-start-3 lg:row-start-1',
  },
  {
    group: 'integrations',
    title: 'Connected products',
    description:
      'Payments, authentication, and AI-assisted workflows. I bring services together with validation, reconciliation, and recoverable retries.',
    placement: 'lg:col-start-1 lg:row-start-3',
  },
  {
    group: 'creative',
    title: 'Creative development',
    description:
      'Interactive 3D, tactile materials, and motion on the web. I bring visual ideas to life while keeping the experience responsive.',
    placement: 'lg:col-start-3 lg:row-start-3',
  },
];

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

export const DiveSkills = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = SKILLS[selectedIndex];
  const technologies = STACK_GROUPS.find(
    (group) => group.id === selected.group,
  )?.technologies;

  // REASON: chapter visibility is owned by the imperative journey renderer;
  // observing its signal avoids loading or rendering a second canvas offscreen.
  useEffect(() => {
    const chapter = sectionRef.current?.closest('[data-dive-section]');
    if (!chapter) {
      return;
    }
    const updateVisibility = () => {
      setActive(chapter.getAttribute('data-visible') === 'true');
    };
    updateVisibility();
    const observer = new MutationObserver(updateVisibility);
    observer.observe(chapter, {
      attributes: true,
      attributeFilter: ['data-visible'],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="px-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="identity-tag type-meta">What I bring to the build</p>
          <h2 className="work-section-title font-display">
            Skills in practice
          </h2>
        </div>
        <p className="type-meta max-w-52 text-muted-foreground">
          Explore a skill. Drag the ice to look closer.
        </p>
      </header>
      <div className="relative mt-8 grid grid-cols-2 gap-3 lg:min-h-[54svh] lg:grid-cols-[14rem_1fr_14rem] lg:grid-rows-[auto_1fr_auto] lg:gap-y-12 lg:py-8">
        <div
          className="relative col-span-2 row-start-2 h-[42svh] min-h-64 lg:absolute lg:inset-0 lg:col-auto lg:row-auto lg:h-full"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerMove={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
        >
          <IceModelBoundary>{active ? <IceModel /> : null}</IceModelBoundary>
        </div>
        <svg
          viewBox="0 0 1000 500"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden h-full w-full text-muted-foreground lg:block"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
        >
          <path d="M 160 80 H 290 L 385 165 M 840 80 H 710 L 615 165 M 160 420 H 290 L 385 335 M 840 420 H 710 L 615 335" />
          <path d="M 380 165 H 390 M 385 160 V 170 M 610 165 H 620 M 615 160 V 170 M 380 335 H 390 M 385 330 V 340 M 610 335 H 620 M 615 330 V 340" />
        </svg>
        {SKILLS.map((skill, index) => (
          <button
            key={skill.group}
            type="button"
            aria-pressed={selectedIndex === index}
            aria-controls="skill-detail"
            onClick={() => setSelectedIndex(index)}
            className={`choice-control type-meta relative flex min-h-16 flex-col items-start justify-center gap-1 px-3 py-3 text-left ${skill.placement}`}
          >
            <span className="text-muted-foreground">
              {String(index + 1).padStart(2, '0')} / SKILL
            </span>
            <span>{skill.title}</span>
          </button>
        ))}
      </div>
      <section
        id="skill-detail"
        aria-live="polite"
        aria-atomic="true"
        className="stack-group mt-8 grid gap-6 py-6 lg:grid-cols-[1fr_1fr] lg:gap-16"
      >
        <div>
          <h3 className="stack-group-title font-display">{selected.title}</h3>
          <p className="type-label mt-3 max-w-[54ch] text-muted-foreground">
            {selected.description}
          </p>
        </div>
        <div>
          <p className="type-meta mb-4 text-muted-foreground">SELECTED TOOLS</p>
          {technologies ? (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              {technologies.slice(0, 4).map(({ name, icon: Icon }) => (
                <li
                  key={name}
                  className="stack-technology flex items-center gap-3"
                >
                  <Icon aria-hidden="true" className="stack-icon shrink-0" />
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p role="alert">The tools for this skill could not be found.</p>
          )}
        </div>
      </section>
    </div>
  );
};
