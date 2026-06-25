import { easeOutCubic } from '@/lib/intro';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type CardParticlesParams = {
  color: string;
};

const CARD_WIDTH = 2.4;
const CARD_HEIGHT = 3;
const CARD_RADIUS = 0.4;
const GRID_COLS = 64;
const GRID_ROWS = 80;
const SCATTER_RADIUS = 9;
const ASSEMBLE_SECONDS = 1.6;
const STAGGER_SECONDS = 0.7;
const PACK_START = 1.2;
const PACK_SECONDS = 1;
const SIZE_MIN = 0.012;
const SIZE_MAX = 0.06;

const isInsideRoundedCard = (x: number, y: number): boolean => {
  const cornerX = Math.abs(x) - (CARD_WIDTH / 2 - CARD_RADIUS);
  const cornerY = Math.abs(y) - (CARD_HEIGHT / 2 - CARD_RADIUS);

  if (cornerX <= 0 || cornerY <= 0) {
    return true;
  }

  return cornerX * cornerX + cornerY * cornerY <= CARD_RADIUS * CARD_RADIUS;
};

const buildCardGrid = (): Float32Array => {
  const points: number[] = [];

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const x = (col / (GRID_COLS - 1) - 0.5) * CARD_WIDTH;
      const y = (row / (GRID_ROWS - 1) - 0.5) * CARD_HEIGHT;

      if (isInsideRoundedCard(x, y)) {
        points.push(x, y, 0);
      }
    }
  }

  return new Float32Array(points);
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

export default function CardParticles({ color }: CardParticlesParams) {
  const attributeRef = useRef<THREE.BufferAttribute>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const targets = useRef(buildCardGrid()).current;
  const scatter = useRef(createScatter(targets.length / 3)).current;
  const live = useRef(new Float32Array(scatter)).current;

  useFrame((state) => {
    if (!attributeRef.current) {
      return;
    }

    const time = state.clock.elapsedTime;
    const count = targets.length / 3;

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
      const pack = easeOutCubic(
        Math.min(Math.max((time - PACK_START) / PACK_SECONDS, 0), 1),
      );
      materialRef.current.size = SIZE_MIN + (SIZE_MAX - SIZE_MIN) * pack;
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
        size={SIZE_MIN}
        sizeAttenuation
        depthWrite
      />
    </points>
  );
}
