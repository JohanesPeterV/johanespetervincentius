'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { STACK_GROUPS } from '@/app/_components/stack';

import { AiConsumption } from './ai-consumption';

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

export const StackIceExhibit = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const [groupIndex, setGroupIndex] = useState(0);

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
      aria-labelledby={`skill-${STACK_GROUPS[groupIndex].id}`}
      className="grid min-h-svh grid-cols-1 items-center gap-8 py-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,1fr)] lg:gap-16"
    >
      <div className="pointer-events-none relative h-[38svh] min-h-56 lg:h-[65svh]">
        <IceModelBoundary>
          {active ? <IceModel turn={groupIndex / STACK_GROUPS.length} /> : null}
        </IceModelBoundary>
      </div>
      <div className="grid min-w-0 gap-8">
        <div
          role="group"
          aria-label="Stack groups"
          className="grid grid-cols-2 gap-1"
        >
          {STACK_GROUPS.map((group, index) => (
            <button
              key={group.id}
              type="button"
              aria-pressed={index === groupIndex}
              aria-controls={`skill-${group.id}-detail`}
              onClick={() => setGroupIndex(index)}
              className="choice-control type-meta flex min-h-11 items-center gap-3 px-3 py-2 text-left"
            >
              <span className="text-muted-foreground">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{group.title}</span>
            </button>
          ))}
        </div>
        <div aria-live="polite" className="grid">
          {STACK_GROUPS.map((group, index) => (
            <div
              key={group.id}
              id={`skill-${group.id}-detail`}
              aria-hidden={index !== groupIndex}
              inert={index !== groupIndex}
              className={`col-start-1 row-start-1 ${index !== groupIndex ? 'invisible pointer-events-none' : ''}`}
            >
              <p className="identity-tag type-meta">
                {group.id === 'main' ? 'My main stack' : 'Also work with'}
              </p>
              <h3
                id={`skill-${group.id}`}
                className="work-section-title font-display"
              >
                {group.title}
              </h3>
              <p className="type-label mt-4 max-w-[40ch] text-muted-foreground">
                {group.description}
              </p>
              {group.id === 'main' ? <AiConsumption /> : null}
              <ul className="stack-group mt-6 grid grid-cols-2 gap-x-4 gap-y-4 pt-6">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
