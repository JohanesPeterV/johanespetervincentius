'use client';

import { ReactNode, Suspense, useRef } from 'react';

import { useMediaQuery } from '@/hooks/use-media-query';
import PalettePicker from '@/components/theme-buttons/palette-picker';
import Meibel from '@/app/_components/meibel/meibel';

import { DiveRoute } from './dive-route';
import type { PointerState } from './dive-input';
import DiveNavigation from './dive-navigation';
import { createDrive } from './camera-motion';
import DiveCanvas from './dive-canvas';
import { jumpDriveToSection } from './camera-motion';
import { useDivePalette } from './use-dive-palette';
import DiveOverlay from './dive-overlay';
import type { DiveContent } from './dive-overlay';
import type { OverlayNodes } from './dive-overlay-motion';
import { useHeroHandoff } from './use-hero-handoff';

type DiveSceneProps = {
  hero: ReactNode;
  heroTitle: string;
  chapters: readonly [DiveContent, ...DiveContent[]];
};

export default function DiveScene({
  hero,
  heroTitle,
  chapters,
}: DiveSceneProps) {
  const route = new DiveRoute(heroTitle, chapters);
  const workSection = route.sections.find(({ id }) => id === 'work');
  const driveRef = useRef(createDrive(route));
  driveRef.current.route = route;
  const pointerRef = useRef<PointerState>({ x: 0, y: 0 });
  const overlayRef = useRef<OverlayNodes>({
    chapters: new Map(),
    root: null,
    sections: new Map(),
    veil: null,
  });
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const motionMode = reducedMotion ? 'reduced' : 'full';
  const { handoffRef, error: handoffError } = useHeroHandoff(
    overlayRef,
    route,
    motionMode,
  );
  const palette = useDivePalette();

  return (
    <DiveNavigation
      driveRef={driveRef}
      pointerRef={pointerRef}
      onMount={(element) => {
        overlayRef.current.root = element;
      }}
    >
      <Suspense fallback={null}>
        <DiveCanvas
          palette={palette}
          driveRef={driveRef}
          pointerRef={pointerRef}
          overlayRef={overlayRef}
          handoffRef={handoffRef}
          motionMode={motionMode}
        />
      </Suspense>
      <div
        aria-hidden
        className="dive-loader pointer-events-none absolute inset-0 z-20"
      />
      <div className="dive-chrome relative z-30">
        <PalettePicker />
      </div>
      <DiveOverlay
        hero={hero}
        chapters={chapters}
        route={route}
        overlayRef={overlayRef}
        onNavigate={(center) => jumpDriveToSection(driveRef.current, center)}
      />
      {workSection ? (
        <Meibel
          onShowWork={() =>
            jumpDriveToSection(driveRef.current, workSection.center)
          }
        />
      ) : null}
      {handoffError ? (
        <p
          role="status"
          className="absolute left-6 right-6 top-4 text-center text-xs"
        >
          Transisi sederhana aktif: {handoffError}
        </p>
      ) : null}
    </DiveNavigation>
  );
}
