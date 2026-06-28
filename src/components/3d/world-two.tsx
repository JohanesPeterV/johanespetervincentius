import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type WorldTwoParams = {
  color: string;
};

const MOTE_COUNT = 600;
const MOTE_SPREAD = 16;

const createMotes = (): Float32Array => {
  const positions = new Float32Array(MOTE_COUNT * 3);
  for (let index = 0; index < MOTE_COUNT; index++) {
    positions[index * 3] = (Math.random() - 0.5) * MOTE_SPREAD;
    positions[index * 3 + 1] = (Math.random() - 0.5) * MOTE_SPREAD;
    positions[index * 3 + 2] = (Math.random() - 0.5) * MOTE_SPREAD;
  }
  return positions;
};

const Shard = ({ color }: WorldTwoParams) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    const time = state.clock.elapsedTime;
    mesh.rotation.y = time * 0.25;
    mesh.rotation.x = Math.sin(time * 0.35) * 0.25;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.6, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.15}
        metalness={0.2}
        flatShading
      />
    </mesh>
  );
};

export default function WorldTwo({ color }: WorldTwoParams) {
  const motes = useRef(createMotes()).current;

  return (
    <>
      <Shard color={color} />
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[motes, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.05}
          transparent
          opacity={0.6}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </>
  );
}
