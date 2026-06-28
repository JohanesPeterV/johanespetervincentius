import { useGLTF, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { AGENT_ORBIT_PATHS, getOrbitPosition, type OrbitPath } from './orbit';

type MarkBlending = 'normal' | 'additive';

type MarkConfig = {
  path: OrbitPath;
  url: string;
  size: readonly [number, number];
  opacity: number;
  blending: MarkBlending;
};

const MODEL_PATH = '/models/mac-transformed.glb';
const MAC_PATH: OrbitPath = { phase: 5.03, radius: 9.2, height: 0.2 };
const MAC_SCALE = 0.22;

// REASON: each body circles the camera at its own phase and radius, so they drift past the centred card one after another
const MARKS: readonly MarkConfig[] = [
  {
    path: AGENT_ORBIT_PATHS[0],
    url: '/logos/claude.png',
    size: [0.52, 0.52],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    path: AGENT_ORBIT_PATHS[1],
    url: '/logos/codex.png',
    size: [0.56, 0.56],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    path: AGENT_ORBIT_PATHS[2],
    url: '/logos/opencode.png',
    size: [0.5, 0.59],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    path: AGENT_ORBIT_PATHS[3],
    url: '/logos/conductor.png',
    size: [0.44, 0.44],
    opacity: 0.22,
    blending: 'additive',
  },
];

const PassingMark = ({ path, url, size, opacity, blending }: MarkConfig) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;

  useFrame((state) => {
    if (!meshRef.current) {
      return;
    }

    meshRef.current.position.set(
      ...getOrbitPosition(path, state.clock.elapsedTime),
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
    groupRef.current.position.set(...getOrbitPosition(MAC_PATH, time));
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
          path={mark.path}
          url={mark.url}
          size={mark.size}
          opacity={mark.opacity}
          blending={mark.blending}
        />
      ))}
      <PassingMac />
    </Suspense>
  );
}
