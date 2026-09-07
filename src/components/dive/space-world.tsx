'use client';

import type { RefObject } from 'react';

import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import DiveAtmosphere from './dive-atmosphere';
import CosmicEyes from './cosmic-eyes';
import { SectionObjects } from './dive-world';
import type { HeroHandoff } from './hero-handoff';

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
  return (
    <>
      <DiveAtmosphere
        palette={palette}
        gpuTier={gpuTier}
        motionMode={motionMode}
      />
      <ambientLight intensity={0.8} />
      <directionalLight position={[-4, 8, 8]} intensity={1.4} />
      <directionalLight position={[5, 2, -4]} intensity={1} />
      <CosmicEyes
        palette={palette}
        progressRef={progressRef}
        motionMode={motionMode}
      />
      <SectionObjects
        palette={palette}
        progressRef={progressRef}
        handoffRef={handoffRef}
        motionMode={motionMode}
      />
    </>
  );
}
