import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type ScrollEmbersParams = {
  color: string;
  count: number;
};

const FIELD_RADIUS = 9;

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

export default function ScrollEmbers({ color, count }: ScrollEmbersParams) {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useRef(createEmberPositions(count)).current;

  useFrame((state, delta) => {
    if (!pointsRef.current) {
      return;
    }

    pointsRef.current.rotation.y += delta * 0.03;
    pointsRef.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
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
