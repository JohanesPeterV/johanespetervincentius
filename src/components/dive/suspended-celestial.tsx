'use client';

import { useFrame } from '@react-three/fiber';
import { ReactNode, useRef } from 'react';
import { Group } from 'three';

import type { MotionMode } from './descent';

type SuspendedCelestialParams = {
  children: ReactNode;
  color: string;
  radius: number;
  length: number;
  phase: number;
  motionMode: MotionMode;
};

const STRING_POSITIONS = new Float32Array([0, 0, 0, 0, -1, 0]);

export default function SuspendedCelestial({
  children,
  color,
  radius,
  length,
  phase,
  motionMode,
}: SuspendedCelestialParams) {
  const pivotRef = useRef<Group>(null);
  const elapsedRef = useRef(0);

  useFrame((_state, delta) => {
    if (motionMode === 'full') {
      elapsedRef.current += Math.min(delta, 0.1);
    }
    if (pivotRef.current) {
      const angle =
        (elapsedRef.current * 0.65) / Math.sqrt(length + radius) + phase;
      pivotRef.current.rotation.z = Math.sin(angle) * 0.028;
    }
  }, -1);

  return (
    <group position={[0, length + radius, 0]}>
      <group ref={pivotRef}>
        <lineSegments scale={[1, length, 1]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[STRING_POSITIONS, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color={color} toneMapped={false} fog={false} />
        </lineSegments>
        <mesh position={[0, -length + 0.003, 0]}>
          <torusGeometry args={[0.008, 0.0015, 4, 12]} />
          <meshBasicMaterial color={color} toneMapped={false} fog={false} />
        </mesh>
        <group position={[0, -length - radius, 0]}>{children}</group>
      </group>
    </group>
  );
}
