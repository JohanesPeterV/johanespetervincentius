import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

type MarkBlending = 'normal' | 'additive';

type MarkConfig = {
  url: string;
  angle: number;
  size: readonly [number, number];
  opacity: number;
  blending: MarkBlending;
};

// REASON: the card sits at the camera look target, so the ring revolves around this point and the card is its centre
const ORBIT_CENTER_Y = 0.4;
// REASON: world half-height the camera frames at z=0, kept in sync with machine-scene's VISIBLE_HALF_HEIGHT
const VISIBLE_HALF_HEIGHT = 3.27;
// REASON: hold the ring inside the frame so marks never clip off the screen edge
const EDGE_GAP = 0.55;
const MIN_RADIUS_X = 1.95;
const MAX_RADIUS_X = 3.4;
const MIN_RADIUS_Y = 1.7;
const MAX_RADIUS_Y = 2.5;
// REASON: marks stay at or in front of the card plane so perspective only pushes them outward, never inward across the card
const ORBIT_DEPTH = 0.5;
const ORBIT_SPEED = 0.06;

const MARKS: readonly MarkConfig[] = [
  {
    url: '/logos/claude.png',
    angle: 0.6,
    size: [0.42, 0.42],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/codex.png',
    angle: 2.17,
    size: [0.46, 0.46],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/opencode.png',
    angle: 3.74,
    size: [0.4, 0.473],
    opacity: 0.9,
    blending: 'normal',
  },
  {
    url: '/logos/conductor.png',
    angle: 5.31,
    size: [0.34, 0.34],
    opacity: 0.22,
    blending: 'additive',
  },
];

const OrbitMark = ({ url, angle, size, opacity, blending }: MarkConfig) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;

  useFrame((state) => {
    if (!meshRef.current) {
      return;
    }

    const time = state.clock.elapsedTime;
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const radiusX = THREE.MathUtils.clamp(
      VISIBLE_HALF_HEIGHT * aspect - EDGE_GAP,
      MIN_RADIUS_X,
      MAX_RADIUS_X,
    );
    const radiusY = THREE.MathUtils.clamp(
      VISIBLE_HALF_HEIGHT - EDGE_GAP,
      MIN_RADIUS_Y,
      MAX_RADIUS_Y,
    );
    const orbit = time * ORBIT_SPEED + angle;

    meshRef.current.position.x = Math.cos(orbit) * radiusX;
    meshRef.current.position.y = ORBIT_CENTER_Y + Math.sin(orbit) * radiusY;
    meshRef.current.position.z =
      ORBIT_DEPTH * (0.5 + 0.5 * Math.sin(time * 0.5 + angle));
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
            size={mark.size}
            opacity={mark.opacity}
            blending={mark.blending}
          />
        ))}
      </group>
    </Suspense>
  );
}
