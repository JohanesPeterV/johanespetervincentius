import { useTexture } from '@react-three/drei';
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
    height: 1,
    size: [0.42, 0.42],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/codex.png',
    angle: 1.9,
    height: -0.5,
    size: [0.46, 0.46],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/opencode.png',
    angle: 3.5,
    height: 0.2,
    size: [0.4, 0.473],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/conductor.png',
    angle: 5,
    height: 1.1,
    size: [0.34, 0.34],
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
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;

  useFrame((state) => {
    if (!meshRef.current) {
      return;
    }

    const time = state.clock.elapsedTime;
    const orbit = time * ORBIT_SPEED + angle;

    meshRef.current.position.x = Math.cos(orbit) * ORBIT_RADIUS;
    meshRef.current.position.z = Math.sin(orbit) * ORBIT_RADIUS;
    meshRef.current.position.y = height + Math.sin(time * 0.6 + angle) * 0.12;
    meshRef.current.rotation.x = Math.sin(time * 0.5 + angle) * 0.22;
    meshRef.current.rotation.y = Math.sin(time * 0.4 + angle) * 0.4;
    meshRef.current.rotation.z = Math.sin(time * 0.3 + angle) * 0.08;
  });

  const [width, planeHeight] = size;
  const isAdditive = blending === 'additive';

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[width, planeHeight]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.DoubleSide}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={isAdditive ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </mesh>
  );
};

const OrbitField = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    const aspect = state.size.width / Math.max(state.size.height, 1);
    const fit = THREE.MathUtils.clamp(aspect * 0.85, 0.55, 1);

    groupRef.current.scale.setScalar(fit);
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
