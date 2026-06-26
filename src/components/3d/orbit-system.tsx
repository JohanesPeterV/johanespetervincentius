import { useGLTF, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { ORBIT_CENTER, ORBIT_SPEED } from './orbit';

type MarkBlending = 'normal' | 'additive';

type MarkConfig = {
  url: string;
  phase: number;
  height: number;
  radius: number;
  size: readonly [number, number];
  opacity: number;
  blending: MarkBlending;
};

const MODEL_PATH = '/models/mac-transformed.glb';
const MAC_PHASE = 5.03;
const MAC_HEIGHT = 0;
const MAC_RADIUS = 6.2;
const MAC_SCALE = 0.22;

// REASON: each body circles the camera at its own phase and radius, so they drift past the centred card one after another
const MARKS: readonly MarkConfig[] = [
  {
    url: '/logos/claude.png',
    phase: 0,
    height: 0.7,
    radius: 6,
    size: [0.52, 0.52],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/codex.png',
    phase: 1.26,
    height: -0.6,
    radius: 5.3,
    size: [0.56, 0.56],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/opencode.png',
    phase: 2.51,
    height: 0.3,
    radius: 6.4,
    size: [0.5, 0.59],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/conductor.png',
    phase: 3.77,
    height: -0.85,
    radius: 5.6,
    size: [0.44, 0.44],
    opacity: 0.22,
    blending: 'additive',
  },
];

const PassingMark = ({
  url,
  phase,
  height,
  radius,
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

    const angle = phase + state.clock.elapsedTime * ORBIT_SPEED;
    meshRef.current.position.set(
      ORBIT_CENTER[0] + Math.sin(angle) * radius,
      ORBIT_CENTER[1] + height,
      ORBIT_CENTER[2] - Math.cos(angle) * radius,
    );
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

const PassingMac = () => {
  const { scene } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    const time = state.clock.elapsedTime;
    const angle = MAC_PHASE + time * ORBIT_SPEED;
    groupRef.current.position.set(
      ORBIT_CENTER[0] + Math.sin(angle) * MAC_RADIUS,
      ORBIT_CENTER[1] + MAC_HEIGHT,
      ORBIT_CENTER[2] - Math.cos(angle) * MAC_RADIUS,
    );
    groupRef.current.rotation.y = time * 0.2;
    groupRef.current.rotation.x = -0.1 + Math.sin(time * 0.4) * 0.05;
    groupRef.current.rotation.z = Math.sin(time * 0.35) * 0.05;
  });

  return (
    <group ref={groupRef} scale={MAC_SCALE}>
      <primitive object={scene} />
    </group>
  );
};

export default function OrbitSystem() {
  return (
    <Suspense fallback={null}>
      {MARKS.map((mark) => (
        <PassingMark
          key={mark.url}
          url={mark.url}
          phase={mark.phase}
          height={mark.height}
          radius={mark.radius}
          size={mark.size}
          opacity={mark.opacity}
          blending={mark.blending}
        />
      ))}
      <PassingMac />
    </Suspense>
  );
}
