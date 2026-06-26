import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type AmbientEmbersParams = {
  color: string;
  count: number;
};

const FIELD_RADIUS = 11;

const createCircleTexture = (): THREE.CanvasTexture => {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (context) {
    const center = size / 2;
    const gradient = context.createRadialGradient(
      center,
      center,
      0,
      center,
      center,
      center,
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.85)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(center, center, center, 0, Math.PI * 2);
    context.fill();
  }

  return new THREE.CanvasTexture(canvas);
};

const createEmberPositions = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index++) {
    const radius = Math.cbrt(Math.random()) * FIELD_RADIUS;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[index * 3 + 2] = radius * Math.cos(phi);
  }

  return positions;
};

export default function AmbientEmbers({ color, count }: AmbientEmbersParams) {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useRef(createEmberPositions(count)).current;
  const circleTexture = useRef(createCircleTexture()).current;

  useFrame((state, delta) => {
    if (!pointsRef.current) {
      return;
    }

    pointsRef.current.rotation.y += delta * 0.03;
    pointsRef.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.045}
        sizeAttenuation
        map={circleTexture}
        alphaMap={circleTexture}
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
