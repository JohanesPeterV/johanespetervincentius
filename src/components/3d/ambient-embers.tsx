import { CONVERGE_SECONDS, INTRO_SECONDS, easeOutCubic } from '@/lib/intro';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type AmbientEmbersParams = {
  color: string;
  count: number;
};

const FIELD_RADIUS = 9;
const CORE_SCALE = 0.08;
const WIDE_SCALE = 1.4;

const createEmberPositions = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index++) {
    const radius = Math.cbrt(Math.random()) * FIELD_RADIUS;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[index * 3 + 2] = radius * Math.cos(phi);
  }

  return positions;
};

const getCloudScale = (time: number): number => {
  if (time < CONVERGE_SECONDS) {
    const phase = easeOutCubic(time / CONVERGE_SECONDS);
    return WIDE_SCALE + (CORE_SCALE - WIDE_SCALE) * phase;
  }

  const disperse = Math.min(
    (time - CONVERGE_SECONDS) / (INTRO_SECONDS - CONVERGE_SECONDS),
    1,
  );

  return CORE_SCALE + (1 - CORE_SCALE) * easeOutCubic(disperse);
};

export default function AmbientEmbers({ color, count }: AmbientEmbersParams) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const positions = useRef(createEmberPositions(count)).current;

  useFrame((state) => {
    if (!pointsRef.current) {
      return;
    }

    const time = state.clock.elapsedTime;
    const coreBoost = Math.max(0, 1 - Math.abs(time - CONVERGE_SECONDS) / 0.6);

    pointsRef.current.scale.setScalar(getCloudScale(time));
    pointsRef.current.rotation.y = time * 0.03;
    pointsRef.current.position.y = Math.sin(time * 0.2) * 0.3;

    if (materialRef.current) {
      materialRef.current.size = 0.045 + coreBoost * 0.06;
      materialRef.current.opacity = 0.7 + coreBoost * 0.3;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        color={color}
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
