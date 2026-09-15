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
  const progressRef = useRef(0);
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

  // REASON: the journey owns native chapter scrolling. Share its position
  // with the render loop, updating React only when the active skill changes.
  useEffect(() => {
    const section = sectionRef.current;
    const chapter = section?.closest<HTMLElement>('[data-section-scroll]');
    if (!section || !chapter) {
      return;
    }
    const updateProgress = () => {
      const distance = chapter.scrollHeight - chapter.clientHeight;
      const progress = distance > 0 ? chapter.scrollTop / distance : 0;
      progressRef.current = Math.min(1, Math.max(0, progress));
      setSelectedIndex(
        Math.min(
          SKILLS.length - 1,
          Math.floor(progressRef.current * SKILLS.length),
        ),
      );
    };
    updateProgress();
    chapter.addEventListener('scroll', updateProgress, { passive: true });
    const observer = new ResizeObserver(updateProgress);
    observer.observe(chapter);
    observer.observe(section);
    return () => {
      chapter.removeEventListener('scroll', updateProgress);
      observer.disconnect();
    };
  }, []);

  const handleSkillSelect = (index: number) => {
    const chapter = sectionRef.current?.closest<HTMLElement>(
      '[data-section-scroll]',
    );
    if (chapter) {
      chapter.scrollTop =
        (index / (SKILLS.length - 1)) *
        (chapter.scrollHeight - chapter.clientHeight);
    }
  };

  return (
    <div ref={sectionRef} className="relative min-h-[400svh] px-4">
      <div className="sticky top-20">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="identity-tag type-meta">What I bring to the build</p>
            <h2 className="work-section-title font-display">
              Skills in practice
            </h2>
          </div>
          <p className="type-meta max-w-52 text-muted-foreground">
            Scroll to rotate and explore.
          </p>
        </header>
        <div className="relative mt-4 grid grid-cols-4 gap-2 lg:min-h-[42svh] lg:grid-cols-[14rem_1fr_14rem] lg:grid-rows-[auto_1fr_auto] lg:gap-y-12 lg:py-6">
          <div className="pointer-events-none relative col-span-4 row-start-1 h-[22svh] min-h-32 lg:absolute lg:inset-0 lg:col-auto lg:row-auto lg:h-full">
            <IceModelBoundary>
              {active ? <IceModel progressRef={progressRef} /> : null}
            </IceModelBoundary>
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
              aria-label={`Explore ${skill.title}`}
              onClick={() => handleSkillSelect(index)}
              className={`choice-control type-meta relative flex min-h-11 flex-col items-center justify-center gap-1 px-3 py-2 text-left lg:min-h-16 lg:items-start ${skill.placement}`}
            >
              <span className="text-muted-foreground">
                {String(index + 1).padStart(2, '0')}
                <span className="hidden lg:inline"> / SKILL</span>
              </span>
              <span className="hidden lg:inline">{skill.title}</span>
            </button>
          ))}
        </div>
        <section
          id="skill-detail"
          aria-live="polite"
          aria-atomic="true"
          className="stack-group mt-4 grid gap-2 py-2 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:py-4"
        >
          <div>
            <h3 className="stack-group-title font-display">{selected.title}</h3>
            <p className="type-label mt-2 max-w-[54ch] text-muted-foreground">
              {selected.description}
            </p>
          </div>
          <div>
            <p className="type-meta mb-2 text-muted-foreground">
              SELECTED TOOLS
            </p>
            {technologies ? (
              <ul className="flex flex-wrap gap-x-4 gap-y-2 lg:grid lg:grid-cols-2">
                {technologies.slice(0, 4).map(({ name, icon: Icon }) => (
                  <li
                    key={name}
                    className="type-meta lg:stack-technology flex items-center gap-3"
                  >
                    <Icon
                      aria-hidden="true"
                      className="stack-icon hidden shrink-0 lg:block"
                    />
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
    </div>
  );
};
