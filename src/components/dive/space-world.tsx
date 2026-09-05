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
        progressRef={progressRef}
        motionMode={motionMode}
        gpuTier={gpuTier}
      />
      <ambientLight intensity={0.7} />
      <directionalLight position={[-4, 8, 8]} intensity={3.2} />
      <directionalLight
        position={[5, 2, -4]}
        intensity={4}
        color={palette.accent}
      />
      <pointLight
        position={[-6, 3, 6]}
        intensity={90}
        distance={35}
        color={palette.accent}
      />
      <OrbitalBackdrop palette={palette} motionMode={motionMode} />
      <SectionObjects
        palette={palette}
        progressRef={progressRef}
        motionMode={motionMode}
      />
    </>
  );
}
