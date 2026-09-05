'use client';

import type { RefObject } from 'react';

import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import DiveAtmosphere from './dive-atmosphere';
import { OrbitalBackdrop, SectionObjects } from './dive-world';

type SpaceWorldParams = {
  palette: DivePalette;
  progressRef: RefObject<number>;
  motionMode: MotionMode;
  gpuTier: number;
};

export default function SpaceWorld({
  palette,
  progressRef,
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
      <ambientLight intensity={0.6} />
      <directionalLight position={[-4, 8, 8]} intensity={1.6} />
      <directionalLight
        position={[5, 2, -4]}
        intensity={0.8}
        color={palette.accent}
      />
      <OrbitalBackdrop palette={palette} progressRef={progressRef} />
      <SectionObjects
        palette={palette}
        progressRef={progressRef}
        motionMode={motionMode}
      />
    </>
  );
}
