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
const CARD_DEPTH = 0.18;
const SCATTER_RADIUS = 9;
const ASSEMBLE_SECONDS = 1.5;
const STAGGER_SECONDS = 0.6;
const HARDEN_START = 1.5;
const HARDEN_SECONDS = 0.8;
const PEAK_OPACITY = 0.9;

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
  const materialRef = useRef<THREE.PointsMaterial>(null);
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
      const assemble = easeOutCubic(
        Math.min(Math.max((time - delay) / ASSEMBLE_SECONDS, 0), 1),
      );

      for (let axis = 0; axis < 3; axis++) {
        const from = scatter[offset + axis];
        const to = targets[offset + axis];
        live[offset + axis] = from + (to - from) * assemble;
      }
    }

    attributeRef.current.needsUpdate = true;

    if (materialRef.current) {
      const harden = Math.min(
        Math.max((time - HARDEN_START) / HARDEN_SECONDS, 0),
        1,
      );
      materialRef.current.opacity = PEAK_OPACITY * (1 - harden);
    }
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
        ref={materialRef}
        color={color}
        size={0.03}
        sizeAttenuation
        transparent
        opacity={PEAK_OPACITY}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
