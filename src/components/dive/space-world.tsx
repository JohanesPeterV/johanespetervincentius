'use client';

import { useFrame } from '@react-three/fiber';
import { RefObject, useRef } from 'react';
import { Group } from 'three';

import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import DiveAtmosphere from './dive-atmosphere';
import CosmicEyes from './cosmic-eyes';
import LunarSurface from './lunar-surface';
import AsteroidField from './asteroid-field';
import { SPACE_KEY_LIGHT } from './space-lighting';
import OrbitalReality from './orbital-reality';
import { SectionObjects } from './dive-world';
import { worldAtProgress } from './hero-handoff';
import type { HeroHandoff } from './hero-handoff';
import { useStarfieldInteraction } from './use-starfield-interaction';

type SpaceWorldParams = {
  palette: DivePalette;
  progressRef: RefObject<number>;
  handoffRef: RefObject<HeroHandoff>;
  motionMode: MotionMode;
  gpuTier: number;
};

export default function SpaceWorld({
  palette,
  progressRef,
  handoffRef,
  motionMode,
  gpuTier,
}: SpaceWorldParams) {
  const firstWorldRef = useRef<Group>(null);
  const secondWorldRef = useRef<Group>(null);
  const interactionRef = useStarfieldInteraction();

  useFrame(() => {
    // REASON: the compositor keeps Hero live on either side of a crossing.
    // Main-pass visibility follows rendered progress, so an
    // etched edge separates two complete scenes instead of shared decoration.
    const secondWorld = worldAtProgress(progressRef.current) === 'orbital';
    if (firstWorldRef.current) {
      firstWorldRef.current.visible = !secondWorld;
    }
    if (secondWorldRef.current) {
      secondWorldRef.current.visible = secondWorld;
    }
  }, -1);

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 2, -4]} intensity={1} />
      <group ref={firstWorldRef} name="world-1">
        <directionalLight position={SPACE_KEY_LIGHT} intensity={1.4} />
        <DiveAtmosphere
          reality="watchers"
          handoffRef={handoffRef}
          progressRef={progressRef}
          interactionRef={interactionRef}
          palette={palette}
          gpuTier={gpuTier}
          motionMode={motionMode}
        />
        <LunarSurface palette={palette} gpuTier={gpuTier} />
        <AsteroidField
          reality="watchers"
          palette={palette}
          motionMode={motionMode}
          gpuTier={gpuTier}
        />
        <CosmicEyes palette={palette} motionMode={motionMode} />
      </group>
      <group ref={secondWorldRef} name="world-2" visible={false}>
        <directionalLight position={[-4, 8, 8]} intensity={1.4} />
        <OrbitalReality
          palette={palette}
          progressRef={progressRef}
          motionMode={motionMode}
          gpuTier={gpuTier}
        />
        <AsteroidField
          reality="orbital"
          palette={palette}
          motionMode={motionMode}
          gpuTier={gpuTier}
        />
        <SectionObjects
          palette={palette}
          progressRef={progressRef}
          motionMode={motionMode}
        />
      </group>
    </>
  );
}
