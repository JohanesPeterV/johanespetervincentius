'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { ReactNode, RefObject, useRef } from 'react';
import { Group } from 'three';

import { PROJECT_STONE, WORK_STONE, narrativeStoneY } from './descent';
import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import MechanicalKeyboard from './mechanical-keyboard';
import OrbitalInstrument from './orbital-instrument';
import { ORBIT_PATH } from './world-layout';

type OrbitalBackdropParams = {
  palette: DivePalette;
  motionMode: MotionMode;
};

type SectionObjectParams = {
  anchor: { center: number; x: number; z: number };
  progressRef: RefObject<number>;
  motionMode: MotionMode;
  children: ReactNode;
};

type SectionObjectsParams = OrbitalBackdropParams & {
  progressRef: RefObject<number>;
};

export const OrbitalBackdrop = ({
  palette,
  motionMode,
}: OrbitalBackdropParams) => {
  const orbitRef = useRef<Group>(null);
  const compact = useThree(({ size }) => size.width < 768);
  useFrame((_, delta) => {
    if (orbitRef.current && motionMode === 'full') {
      orbitRef.current.rotation.z += Math.min(delta, 0.1) * 0.012;
    }
  }, -1);
  return (
    <group ref={orbitRef} position={[0, 4, -14]} rotation={[0.3, -0.3, -0.45]}>
      <lineLoop rotation={[0.8, 0.3, 0]} scale={12}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[ORBIT_PATH, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={palette.accent} transparent opacity={0.22} />
      </lineLoop>
      <lineLoop rotation={[0.8, 0.3, 0]} scale={12.2}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[ORBIT_PATH, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={palette.metal} transparent opacity={0.18} />
      </lineLoop>
      <mesh position={[10, 6, -6]} visible={!compact}>
        <sphereGeometry args={[2.1, 48, 32]} />
        <meshStandardMaterial
          color={palette.surface}
          roughness={0.48}
          metalness={0.35}
        />
      </mesh>
    </group>
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
    const phase = elapsedRef.current * 0.24;
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
      <group scale={0.5} rotation={[0.7, -0.2, -0.18]}>
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
