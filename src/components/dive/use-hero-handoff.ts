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
    if (!hero || !entry) {
      return;
    }
    const snapshots = new HandoffSnapshots(
      handoffRef.current,
      createHandoffCapture(hero, entry),
      setError,
    );
    // REASON: only theme, size and carousel changes alter the chapter snapshot.
    // Dialogs are excluded from it, so opening a card must not recapture it.
    const observer = new MutationObserver(snapshots.invalidate);
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
    // REASON: card scatter can change scrollbars without resizing the section.
    // Border-box changes also schedule the initial capture once on mount.
    resizeObserver.observe(hero, { box: 'border-box' });
    resizeObserver.observe(entry, { box: 'border-box' });
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      snapshots.dispose();
    };
  }, [overlayRef, entryId, motionMode]);

  return { handoffRef, error };
};
