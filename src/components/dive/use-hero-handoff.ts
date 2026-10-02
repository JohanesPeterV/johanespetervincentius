'use client';

import { RefObject, useEffect, useRef, useState } from 'react';

import { createHandoffCapture } from './capture-handoff';
import type { MotionMode } from './descent';
import type { DiveRoute } from './dive-route';
import type { OverlayNodes } from './dive-overlay-motion';
import { createHeroHandoff } from './hero-handoff';
import { HandoffSnapshots } from './handoff-snapshots';

export const useHeroHandoff = (
  overlayRef: RefObject<OverlayNodes>,
  route: DiveRoute,
  motionMode: MotionMode,
) => {
  const handoffRef = useRef(createHeroHandoff(route));
  handoffRef.current.route = route;
  const entryId = route.entry.id;
  const lastId = route.last.id;
  const [error, setError] = useState<string | null>(null);

  // REASON: bind DOM changes to the shader's snapshot lifecycle; reduced
  // motion never composites these textures and must not start rasterization.
  useEffect(() => {
    setError(null);
    if (motionMode === 'reduced') {
      return;
    }
    const hero = overlayRef.current.sections.get('hero');
    const entry = overlayRef.current.sections.get(entryId);
    const last = overlayRef.current.sections.get(lastId);
    if (!hero || !entry || !last) {
      return;
    }
    const snapshots = new HandoffSnapshots(
      handoffRef.current,
      createHandoffCapture(hero, entry, last),
      setError,
    );
    // REASON: keep the final canvas pose and reading position current at rest,
    // then retain that endpoint while the wave crosses or reverses.
    const invalidateLast = () => {
      if (
        last.dataset.visible === 'true' &&
        handoffRef.current.crossing === null
      ) {
        snapshots.invalidate();
      }
    };
    last.addEventListener('dive-canvas-change', invalidateLast);
    last.addEventListener('scroll', invalidateLast);
    // REASON: observe content and theme changes, not animation style writes.
    const observer = new MutationObserver(snapshots.invalidate);
    observer.observe(hero, {
      attributes: true,
      attributeFilter: ['d'],
      subtree: true,
    });
    observer.observe(entry, {
      attributes: true,
      attributeFilter: ['data-active'],
      subtree: true,
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    const resizeObserver = new ResizeObserver(snapshots.invalidate);
    // REASON: border-box changes schedule the initial capture once on mount
    // and ignore scrollbar toggles inside a section.
    resizeObserver.observe(hero, { box: 'border-box' });
    resizeObserver.observe(entry, { box: 'border-box' });
    resizeObserver.observe(last, { box: 'border-box' });
    return () => {
      last.removeEventListener('dive-canvas-change', invalidateLast);
      last.removeEventListener('scroll', invalidateLast);
      observer.disconnect();
      resizeObserver.disconnect();
      snapshots.dispose();
    };
  }, [overlayRef, entryId, lastId, motionMode]);

  return { handoffRef, error };
};
