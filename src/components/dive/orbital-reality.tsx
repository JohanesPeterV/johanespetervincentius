'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group, MathUtils, PerspectiveCamera } from 'three';

import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';

type OrbitalRealityParams = {
  palette: DivePalette;
  motionMode: MotionMode;
  gpuTier: number;
};

const DEBRIS = [
  { x: 0.87, y: 0.76, size: 0.044, depth: -0.18 },
  { x: 0.93, y: -0.55, size: 0.072, depth: -0.08 },
  { x: -0.7, y: -0.75, size: 0.037, depth: -0.12 },
  { x: 0.43, y: -0.9, size: 0.025, depth: -0.28 },
];

export default function OrbitalReality({
  palette,
  motionMode,
  gpuTier,
}: OrbitalRealityParams) {
  const groupRef = useRef<Group>(null);
  const debrisRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const segments = gpuTier < 2 ? 64 : 128;
  // REASON: orbit lines glow in the dark but are pigment on paper, which needs more coverage.
  const light = palette.mode === 'light';

  useFrame(({ camera }, delta) => {
    const group = groupRef.current;
    if (!group || !(camera instanceof PerspectiveCamera)) {
      return;
    }
    if (motionMode === 'full') {
      elapsedRef.current += Math.min(delta, 0.1);
    }
    const time = elapsedRef.current;
    const halfHeight = Math.tan(MathUtils.degToRad(camera.fov * 0.5)) * 58;
    group.position.copy(camera.position);
    group.quaternion.copy(camera.quaternion);
    group.translateZ(-58);
    group.scale.setScalar(halfHeight);
    debrisRef.current?.children.forEach((mesh, index) => {
      const placement = DEBRIS[index];
      mesh.position.set(
        placement.x * camera.aspect,
        placement.y + Math.sin(time * 0.1 + index) * 0.018,
        placement.depth,
      );
      mesh.rotation.set(index * 0.7 + time * 0.035, index + time * 0.025, 0.3);
    });
  }, -1);

  return (
    <group ref={groupRef}>
      <mesh position={[-0.8, 0.25, -0.4]} rotation={[0.9, -0.35, -0.6]}>
        <torusGeometry args={[1.63, 0.0025, 3, segments]} />
        <meshBasicMaterial
          color={palette.highlight}
          transparent
          opacity={light ? 0.75 : 0.18}
          toneMapped={false}
          fog={false}
        />
      </mesh>
      <mesh position={[0.95, -0.78, -0.7]} rotation={[0.92, 0.24, 0.48]}>
        <torusGeometry args={[1.25, 0.002, 3, segments]} />
        <meshBasicMaterial
          color={palette.accent}
          transparent
          opacity={light ? 0.6 : 0.12}
          toneMapped={false}
          fog={false}
        />
      </mesh>
      <group ref={debrisRef}>
        {DEBRIS.map((placement, index) => (
          <mesh key={placement.x} scale={placement.size}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? palette.accent : palette.highlight}
              roughness={1}
              metalness={0}
              flatShading
              toneMapped={false}
              fog={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
