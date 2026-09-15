'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import type { StackGroup } from '@/app/_components/stack';

type StackIceExhibitProps = {
  group: StackGroup;
  index: number;
};

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

export const StackIceExhibit = ({ group, index }: StackIceExhibitProps) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // REASON: measure within the chapter so offscreen ancestors do not defer
  // loading until entry. Only nearby exhibits in a nearby chapter need a canvas.
  useEffect(() => {
    const stage = stageRef.current;
    const chapter = stage?.closest('[data-dive-section]');
    if (!stage || !chapter) {
      return;
    }
    let nearby = false;
    const updateVisibility = () => {
      setActive(nearby && chapter.getAttribute('data-nearby') === 'true');
    };
    const intersection = new IntersectionObserver(
      ([entry]) => {
        nearby = entry.isIntersecting;
        updateVisibility();
      },
      { root: chapter, rootMargin: '50% 0px' },
    );
    intersection.observe(stage);
    const visibility = new MutationObserver(updateVisibility);
    visibility.observe(chapter, {
      attributes: true,
      attributeFilter: ['data-nearby'],
    });
    return () => {
      intersection.disconnect();
      visibility.disconnect();
    };
  }, []);

  return (
    <section
      aria-labelledby={`skill-${group.id}`}
      className="grid min-h-svh grid-cols-1 items-center gap-8 py-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,1fr)] lg:gap-16"
    >
      <div
        ref={stageRef}
        className="pointer-events-none relative h-[38svh] min-h-56 lg:h-[65svh]"
      >
        <IceModelBoundary>{active ? <IceModel /> : null}</IceModelBoundary>
      </div>
      <div>
        <p className="identity-tag type-meta">
          {String(index + 1).padStart(2, '0')} / STACK
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
        <ul className="stack-group mt-6 grid grid-cols-2 gap-x-4 gap-y-4 pt-6">
          {group.technologies.map(({ name, icon: Icon }) => (
            <li key={name} className="stack-technology flex items-center gap-3">
              <Icon aria-hidden="true" className="stack-icon shrink-0" />
              <span className="min-w-0 break-words">{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
