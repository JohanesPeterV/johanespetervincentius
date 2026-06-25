import { easeOutCubic } from '@/lib/intro';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type CardParticlesParams = {
  color: string;
  count: number;
};

const CARD_WIDTH = 2.4;
const CARD_HEIGHT = 3;
const CARD_DEPTH = 0.12;
const SCATTER_RADIUS = 9;
const ASSEMBLE_SECONDS = 1.6;
const STAGGER_SECONDS = 0.7;

const createCardTargets = (count: number): Float32Array => {
  const targets = new Float32Array(count * 3);

  for (let index = 0; index < count; index++) {
    targets[index * 3] = (Math.random() - 0.5) * CARD_WIDTH;
    targets[index * 3 + 1] = (Math.random() - 0.5) * CARD_HEIGHT;
    targets[index * 3 + 2] = (Math.random() - 0.5) * CARD_DEPTH;
  }

  return targets;
};

const createScatter = (count: number): Float32Array => {
  const scatter = new Float32Array(count * 3);

  for (let index = 0; index < count; index++) {
    const radius = SCATTER_RADIUS * (0.4 + Math.random() * 0.6);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    scatter[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    scatter[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    scatter[index * 3 + 2] = radius * Math.cos(phi);
  }

  return scatter;
};

export default function CardParticles({ color, count }: CardParticlesParams) {
  const attributeRef = useRef<THREE.BufferAttribute>(null);
  const targets = useRef(createCardTargets(count)).current;
  const scatter = useRef(createScatter(count)).current;
  const live = useRef(new Float32Array(scatter)).current;

  useFrame((state) => {
    if (!attributeRef.current) {
      return;
    }

    const time = state.clock.elapsedTime;

    for (let index = 0; index < count; index++) {
      const offset = index * 3;
      const delay = (index / count) * STAGGER_SECONDS;
      const progress = easeOutCubic(
        Math.min(Math.max((time - delay) / ASSEMBLE_SECONDS, 0), 1),
      );
      const shimmer = Math.sin(time * 2 + index) * 0.012 * progress;

      live[offset] =
        scatter[offset] + (targets[offset] - scatter[offset]) * progress;
      live[offset + 1] =
        scatter[offset + 1] +
        (targets[offset + 1] - scatter[offset + 1]) * progress +
        shimmer;
      live[offset + 2] =
        scatter[offset + 2] +
        (targets[offset + 2] - scatter[offset + 2]) * progress;
    }

    attributeRef.current.needsUpdate = true;
  });

  return (
    <points position={[0, 0.5, 0]}>
      <bufferGeometry>
        <bufferAttribute
          ref={attributeRef}
          attach="attributes-position"
          args={[live, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
