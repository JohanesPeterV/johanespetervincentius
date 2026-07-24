import { useGLTF, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { AGENT_ORBIT_PATHS, writeOrbitPosition, type OrbitPath } from './orbit';

// REASON: conductor's mark ships on an opaque dark plate, so it is keyed to alpha by luminance; the others already carry their own transparency
type MarkPlate = 'alpha' | 'keyed';

type MarkConfig = {
  path: OrbitPath;
  url: string;
  size: readonly [number, number];
  opacity: number;
  plate: MarkPlate;
};

const MODEL_PATH = '/models/mac-transformed.glb';
const MAC_PATH: OrbitPath = {
  phase: 5.6,
  radius: 9,
  height: 0.2,
  speed: 0.073,
};
const MAC_SCALE = 0.22;

// REASON: each body circles the camera on its own lane and speed, so they drift past the centred card in clusters rather than one at a time
const MARKS: readonly MarkConfig[] = [
  {
    path: AGENT_ORBIT_PATHS[0],
    url: '/logos/claude.png',
    size: [0.52, 0.52],
    opacity: 0.9,
    plate: 'alpha',
  },
  {
    path: AGENT_ORBIT_PATHS[1],
    url: '/logos/codex.png',
    size: [0.56, 0.56],
    opacity: 0.9,
    plate: 'alpha',
  },
  {
    path: AGENT_ORBIT_PATHS[2],
    url: '/logos/opencode.png',
    size: [0.5, 0.59],
    opacity: 0.9,
    plate: 'alpha',
  },
  {
    path: AGENT_ORBIT_PATHS[3],
    url: '/logos/conductor.png',
    size: [0.44, 0.44],
    opacity: 0.75,
    plate: 'keyed',
  },
];

const PassingMark = ({ path, url, size, opacity, plate }: MarkConfig) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;

  useFrame((state) => {
    if (!meshRef.current) {
      return;
    }

    writeOrbitPosition(path, state.clock.elapsedTime, meshRef.current.position);
    meshRef.current.quaternion.copy(state.camera.quaternion);
  });

  const [width, planeHeight] = size;
  // REASON: a keyed plate reuses its own art as the alpha map so the opaque dark background drops to a matte cut-out instead of an additive glow
  const isKeyed = plate === 'keyed';

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[width, planeHeight]} />
      <meshBasicMaterial
        map={texture}
        alphaMap={isKeyed ? texture : null}
        side={THREE.DoubleSide}
        transparent
        opacity={opacity}
        depthWrite={false}
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
    writeOrbitPosition(MAC_PATH, time, groupRef.current.position);
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
          plate={mark.plate}
        />
      ))}
      <PassingMac />
    </Suspense>
  );
}
