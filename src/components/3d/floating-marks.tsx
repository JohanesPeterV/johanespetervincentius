import { Billboard, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

type FloatingMarkParams = {
  url: string;
  basePosition: readonly [number, number, number];
  phase: number;
};

const MARK_SIZE = 1.1;
const MARK_OPACITY = 0.85;

const FloatingMark = ({ url, basePosition, phase }: FloatingMarkParams) => {
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

  return (
    <group ref={groupRef}>
      <Billboard>
        <mesh>
          <planeGeometry args={[MARK_SIZE, MARK_SIZE]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={MARK_OPACITY}
            depthWrite={false}
          />
        </mesh>
      </Billboard>
    </group>
  );
};

export default function FloatingMarks() {
  return (
    <Suspense fallback={null}>
      <FloatingMark
        url="/logos/claude.svg"
        basePosition={[-1.3, 1.3, 0.4]}
        phase={0}
      />
      <FloatingMark
        url="/logos/codex.svg"
        basePosition={[-1.1, -1.6, 0.9]}
        phase={1.7}
      />
    </Suspense>
  );
}
