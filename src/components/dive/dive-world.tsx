'use client';

import { useFrame } from '@react-three/fiber';
import { ReactNode, RefObject, useRef } from 'react';
import { Group } from 'three';

import { PROJECT_STONE, narrativeStoneY } from './descent';
import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import WorkKeyboardScene from './work-keyboard-scene';
import OrbitalInstrument from './orbital-instrument';
import type { HeroHandoff } from './hero-handoff';

type SectionObjectParams = {
  anchor: { center: number; x: number; z: number };
  progressRef: RefObject<number>;
  motionMode: MotionMode;
  children: ReactNode;
};

type SectionObjectsParams = {
  palette: DivePalette;
  progressRef: RefObject<number>;
  handoffRef: RefObject<HeroHandoff>;
  motionMode: MotionMode;
};

const SectionObject = ({
  anchor,
  progressRef,
  motionMode,
  children,
}: SectionObjectParams) => {
  const groupRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  useFrame(({ size }, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    group.visible = size.width >= 768;
    if (!group.visible) {
      return;
    }
    if (motionMode === 'full') {
      elapsedRef.current += Math.min(delta, 0.1);
    }
    const phase = elapsedRef.current * 0.08;
    group.position.set(
      anchor.x,
      narrativeStoneY(progressRef.current, anchor.center),
      anchor.z,
    );
    group.rotation.set(
      Math.sin(phase) * 0.06,
      Math.cos(phase * 0.7) * 0.12,
      Math.sin(phase * 0.8) * 0.035,
    );
    group.scale.setScalar(Math.min(1, (size.width / size.height) * 0.7));
  }, -1);
  return <group ref={groupRef}>{children}</group>;
};

export const SectionObjects = ({
  palette,
  progressRef,
  handoffRef,
  motionMode,
}: SectionObjectsParams) => (
  <>
    <WorkKeyboardScene
      palette={palette}
      progressRef={progressRef}
      handoffRef={handoffRef}
      motionMode={motionMode}
    />
    <SectionObject
      anchor={PROJECT_STONE}
      progressRef={progressRef}
      motionMode={motionMode}
    >
      <OrbitalInstrument palette={palette} />
    </SectionObject>
  </>
);
