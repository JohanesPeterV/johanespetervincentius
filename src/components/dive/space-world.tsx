'use client';

import { useFrame } from '@react-three/fiber';
import { RefObject, useRef } from 'react';
import { Group } from 'three';

import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import DiveAtmosphere from './dive-atmosphere';
import CosmicEyes from './cosmic-eyes';
import OrbitalReality from './orbital-reality';
import { SectionObjects } from './dive-world';
import { HANDOFF_END, HANDOFF_START } from './hero-handoff';
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
  const firstWorldRef = useRef<Group>(null);
  const secondWorldRef = useRef<Group>(null);

  useFrame(() => {
    // REASON: the compositor renders the incoming endpoint while retaining
    // world 1's saved frame. Visibility follows that rendered progress, so an
    // etched edge separates two complete scenes instead of shared decoration.
    const secondWorld =
      progressRef.current >= (HANDOFF_START + HANDOFF_END) / 2;
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
      <directionalLight position={[-4, 8, 8]} intensity={1.4} />
      <directionalLight position={[5, 2, -4]} intensity={1} />
      <group ref={firstWorldRef} name="world-1">
        <DiveAtmosphere
          reality="watchers"
          palette={palette}
          gpuTier={gpuTier}
          motionMode={motionMode}
        />
        <CosmicEyes palette={palette} motionMode={motionMode} />
      </group>
      <group ref={secondWorldRef} name="world-2" visible={false}>
        <DiveAtmosphere
          reality="orbital"
          palette={palette}
          gpuTier={gpuTier}
          motionMode={motionMode}
        />
        <OrbitalReality
          palette={palette}
          progressRef={progressRef}
          motionMode={motionMode}
          gpuTier={gpuTier}
        />
        <SectionObjects
          palette={palette}
          progressRef={progressRef}
          handoffRef={handoffRef}
          motionMode={motionMode}
        />
      </group>
    </>
  );
}
