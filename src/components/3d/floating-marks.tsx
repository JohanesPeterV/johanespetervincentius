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

// REASON: marks circle the origin on the ground plane; the top-down camera turns this into a ring around the centred card
const ORBIT_RADIUS = 2.5;
const ORBIT_SPEED = 0.06;
// REASON: world half-height the top-down camera frames at the orbit plane; used to shrink the ring on narrow viewports
const VISIBLE_HALF_HEIGHT = 3.75;
const EDGE_GAP = 0.5;

const MARKS: readonly MarkConfig[] = [
  {
    url: '/logos/claude.png',
    angle: 0.6,
    height: 0.2,
    size: [0.42, 0.42],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/codex.png',
    angle: 2.17,
    height: -0.25,
    size: [0.46, 0.46],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/opencode.png',
    angle: 3.74,
    height: 0.1,
    size: [0.4, 0.473],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/conductor.png',
    angle: 5.31,
    height: -0.15,
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
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const maxRadius = VISIBLE_HALF_HEIGHT * aspect - EDGE_GAP;
    const radius = Math.min(ORBIT_RADIUS, maxRadius);
    const orbit = time * ORBIT_SPEED + angle;

    meshRef.current.position.x = Math.cos(orbit) * radius;
    meshRef.current.position.z = Math.sin(orbit) * radius;
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

export default function FloatingMarks() {
  return (
    <Suspense fallback={null}>
      <group>
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
    </Suspense>
  );
}
