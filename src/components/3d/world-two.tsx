import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

type WorldTwoParams = {
  color: string;
};

const MOTE_COUNT = 600;
const MOTE_SPREAD = 16;
const TERRAIN_PATH = '/models/snowy_terain.glb';
const TERRAIN_SCALE = 3;
const TERRAIN_TILT = 0.85;

const createMotes = (): Float32Array => {
  const positions = new Float32Array(MOTE_COUNT * 3);
  for (let index = 0; index < MOTE_COUNT; index++) {
    positions[index * 3] = (Math.random() - 0.5) * MOTE_SPREAD;
    positions[index * 3 + 1] = (Math.random() - 0.5) * MOTE_SPREAD;
    positions[index * 3 + 2] = (Math.random() - 0.5) * MOTE_SPREAD;
  }
  return positions;
};

const SnowyTerrain = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(TERRAIN_PATH);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const time = state.clock.elapsedTime;
    group.rotation.y = time * 0.12;
    group.rotation.x = TERRAIN_TILT + Math.sin(time * 0.25) * 0.05;
    group.position.y = -0.4 + Math.sin(time * 0.4) * 0.12;
  });

  return (
    <group ref={groupRef} scale={TERRAIN_SCALE}>
      <primitive object={scene} />
    </group>
  );
};

export default function WorldTwo({ color }: WorldTwoParams) {
  const motes = useRef(createMotes()).current;

  return (
    <>
      <Suspense fallback={null}>
        <SnowyTerrain />
      </Suspense>
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

useGLTF.preload(TERRAIN_PATH);
