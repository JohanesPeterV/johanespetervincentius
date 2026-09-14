'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

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

export const DiveIce = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

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
    <div ref={sectionRef}>
      <header className="px-4 pb-4">
        <p className="identity-tag type-meta">MacBook in ice</p>
        <h2 className="work-section-title font-display">Frozen in time</h2>
        <p className="type-label mt-3 text-muted-foreground">
          Drag to explore.
        </p>
      </header>
      <div
        className="relative h-[60svh] min-h-80 w-full"
        onPointerDown={(event) => event.stopPropagation()}
        onPointerMove={(event) => event.stopPropagation()}
        onPointerUp={(event) => event.stopPropagation()}
      >
        <IceModelBoundary>{active ? <IceModel /> : null}</IceModelBoundary>
      </div>
    </div>
  );
};
