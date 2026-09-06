'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { ReactNode, RefObject, useRef } from 'react';
import { Group, Mesh, MeshStandardMaterial } from 'three';

import { PROJECT_STONE, WORK_STONE, narrativeStoneY } from './descent';
import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import MechanicalKeyboard from './mechanical-keyboard';
import OrbitalInstrument from './orbital-instrument';

type OrbitalBackdropParams = {
  palette: DivePalette;
  progressRef: RefObject<number>;
};

type SectionObjectParams = {
  anchor: { center: number; x: number; z: number };
  progressRef: RefObject<number>;
  motionMode: MotionMode;
  children: ReactNode;
};

type SectionObjectsParams = OrbitalBackdropParams & {
  motionMode: MotionMode;
};

export const OrbitalBackdrop = ({
  palette,
  progressRef,
}: OrbitalBackdropParams) => {
  const moonRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const compact = useThree(({ size }) => size.width < 768);
  useFrame(() => {
    if (moonRef.current && materialRef.current) {
      const opacity = Math.max(
        0,
        Math.min(1, (1.35 - progressRef.current) * 3),
      );
      moonRef.current.visible = !compact && opacity > 0;
      materialRef.current.opacity = opacity;
    }
  }, -1);
  return (
    <mesh ref={moonRef} position={[11, 8, -18]} visible={!compact}>
      <sphereGeometry args={[1.15, 48, 32]} />
      <meshStandardMaterial
        ref={materialRef}
        color={palette.highlight}
        emissive={palette.highlight}
        emissiveIntensity={0.2}
        roughness={0.6}
        metalness={0}
        toneMapped={false}
        transparent
      />
    </mesh>
  );
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
  motionMode,
}: SectionObjectsParams) => (
  <>
    <SectionObject
      anchor={WORK_STONE}
      progressRef={progressRef}
      motionMode={motionMode}
    >
      <group scale={0.44} rotation={[0.7, -0.2, -0.18]}>
        <MechanicalKeyboard palette={palette} />
      </group>
    </SectionObject>
    <SectionObject
      anchor={PROJECT_STONE}
      progressRef={progressRef}
      motionMode={motionMode}
    >
      <OrbitalInstrument palette={palette} />
    </SectionObject>
  </>
);
