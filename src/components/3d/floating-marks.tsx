import { Billboard, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

type MarkBlending = 'normal' | 'additive';

type MarkConfig = {
  url: string;
  basePosition: readonly [number, number, number];
  size: readonly [number, number];
  phase: number;
  opacity: number;
  blending: MarkBlending;
};

const MARKS: readonly MarkConfig[] = [
  {
    url: '/logos/claude.png',
    basePosition: [-1.3, 1.4, 0.3],
    size: [1, 1],
    phase: 0,
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/codex.png',
    basePosition: [-1.25, -1.5, 0.9],
    size: [1.1, 1.1],
    phase: 1.6,
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/opencode.png',
    basePosition: [1.2, -1.5, 0.6],
    size: [0.9, 1.05],
    phase: 3.1,
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/conductor.png',
    basePosition: [1.45, 0.15, 1.2],
    size: [1, 1],
    phase: 4.5,
    opacity: 0.4,
    blending: 'additive',
  },
];

const FloatingMark = ({
  url,
  basePosition,
  size,
  phase,
  opacity,
  blending,
}: MarkConfig) => {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    const time = state.clock.elapsedTime;
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const spread = THREE.MathUtils.clamp(aspect * 1.1, 0.8, 1.8);
    const [baseX, baseY, baseZ] = basePosition;

    groupRef.current.position.x =
      baseX * spread + Math.sin(time * 0.3 + phase) * 0.18;
    groupRef.current.position.y = baseY + Math.sin(time * 0.6 + phase) * 0.16;
    groupRef.current.position.z = baseZ;
  });

  const [width, height] = size;
  const isAdditive = blending === 'additive';

  return (
    <group ref={groupRef}>
      <Billboard>
        <mesh>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={opacity}
            depthWrite={false}
            blending={
              isAdditive ? THREE.AdditiveBlending : THREE.NormalBlending
            }
          />
        </mesh>
      </Billboard>
    </group>
  );
};

export default function FloatingMarks() {
  return (
    <Suspense fallback={null}>
      {MARKS.map((mark) => (
        <FloatingMark
          key={mark.url}
          url={mark.url}
          basePosition={mark.basePosition}
          size={mark.size}
          phase={mark.phase}
          opacity={mark.opacity}
          blending={mark.blending}
        />
      ))}
    </Suspense>
  );
}
