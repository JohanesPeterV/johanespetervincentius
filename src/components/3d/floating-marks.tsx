import { Billboard, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

type MarkBlending = 'normal' | 'additive';

type MarkConfig = {
  url: string;
  angle: number;
  height: number;
  size: readonly [number, number];
  opacity: number;
  blending: MarkBlending;
};

const ORBIT_RADIUS = 1.9;
const ORBIT_SPEED = 0.06;
const ORBIT_CENTER_Y = 0.4;

const MARKS: readonly MarkConfig[] = [
  {
    url: '/logos/claude.png',
    angle: 0.4,
    height: 1.1,
    size: [1, 1],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/codex.png',
    angle: 1.9,
    height: -0.6,
    size: [1.1, 1.1],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/opencode.png',
    angle: 3.5,
    height: 0.2,
    size: [0.9, 1.05],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/conductor.png',
    angle: 5,
    height: 1.3,
    size: [0.7, 0.7],
    opacity: 0.22,
    blending: 'additive',
  },
];

const OrbitMark = ({
  url,
  angle,
  height,
  size,
  opacity,
  blending,
}: MarkConfig) => {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;

  const [width, planeHeight] = size;
  const x = Math.cos(angle) * ORBIT_RADIUS;
  const z = Math.sin(angle) * ORBIT_RADIUS;
  const isAdditive = blending === 'additive';

  return (
    <Billboard position={[x, height, z]}>
      <mesh>
        <planeGeometry args={[width, planeHeight]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={isAdditive ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </mesh>
    </Billboard>
  );
};

const OrbitField = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) {
      return;
    }

    const aspect = state.size.width / Math.max(state.size.height, 1);
    const fit = THREE.MathUtils.clamp(aspect * 0.85, 0.55, 1);

    groupRef.current.scale.setScalar(fit);
    groupRef.current.rotation.y += delta * ORBIT_SPEED;
    groupRef.current.position.y =
      ORBIT_CENTER_Y + Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
  });

  return (
    <group ref={groupRef}>
      {MARKS.map((mark) => (
        <OrbitMark
          key={mark.url}
          url={mark.url}
          angle={mark.angle}
          height={mark.height}
          size={mark.size}
          opacity={mark.opacity}
          blending={mark.blending}
        />
      ))}
    </group>
  );
};

export default function FloatingMarks() {
  return (
    <Suspense fallback={null}>
      <OrbitField />
    </Suspense>
  );
}
