import { useGLTF, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { getOrbitScale, getRingPosition, ORBIT_SPEED } from './orbit';

type MarkBlending = 'normal' | 'additive';

type MarkConfig = {
  url: string;
  angle: number;
  height: number;
  spin: number;
  size: readonly [number, number];
  opacity: number;
  blending: MarkBlending;
};

const MODEL_PATH = '/models/mac-transformed.glb';
const INTRO_SECONDS = 2.4;
const MAC_ANGLE = 5.63;
const MAC_HEIGHT = 0.3;
const MAC_SCALE = 0.22;

// REASON: marks lie flat on the ring so the top-down camera reads them face-on; spin only varies their in-plane angle
const MARKS: readonly MarkConfig[] = [
  {
    url: '/logos/claude.png',
    angle: 0.6,
    height: 0.2,
    spin: 0.3,
    size: [0.42, 0.42],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/codex.png',
    angle: 1.86,
    height: -0.1,
    spin: -0.4,
    size: [0.46, 0.46],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/opencode.png',
    angle: 3.11,
    height: 0.1,
    spin: 0.6,
    size: [0.4, 0.473],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/conductor.png',
    angle: 4.37,
    height: -0.05,
    spin: -0.2,
    size: [0.34, 0.34],
    opacity: 0.22,
    blending: 'additive',
  },
];

const easeOut = (value: number): number => {
  return 1 - Math.pow(1 - value, 3);
};

const OrbitMark = ({
  url,
  angle,
  height,
  spin,
  size,
  opacity,
  blending,
}: MarkConfig) => {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;

  const [width, planeHeight] = size;
  const isAdditive = blending === 'additive';

  return (
    <mesh
      position={getRingPosition(angle, height)}
      rotation={[-Math.PI / 2, 0, spin]}
    >
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

const OrbitMac = () => {
  const { scene } = useGLTF(MODEL_PATH);

  return (
    <primitive
      object={scene}
      position={getRingPosition(MAC_ANGLE, MAC_HEIGHT)}
      rotation={[-0.12, 0, 0]}
      scale={MAC_SCALE}
    />
  );
};

export default function OrbitSystem() {
  const ringRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ringRef.current) {
      return;
    }

    const time = state.clock.elapsedTime;
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const intro = easeOut(Math.min(time / INTRO_SECONDS, 1));

    ringRef.current.rotation.y = time * ORBIT_SPEED;
    ringRef.current.position.y = Math.sin(time * 0.2) * 0.12;
    ringRef.current.scale.setScalar(getOrbitScale(aspect) * intro);
  });

  return (
    <Suspense fallback={null}>
      <group ref={ringRef}>
        {MARKS.map((mark) => (
          <OrbitMark
            key={mark.url}
            url={mark.url}
            angle={mark.angle}
            height={mark.height}
            spin={mark.spin}
            size={mark.size}
            opacity={mark.opacity}
            blending={mark.blending}
          />
        ))}
        <OrbitMac />
      </group>
    </Suspense>
  );
}
