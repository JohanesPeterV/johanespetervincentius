import { MeshTransmissionMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { createNoise3D } from 'simplex-noise';
import * as THREE from 'three';

type WorldTwoParams = {
  color: string;
};

const MOTE_COUNT = 600;
const MOTE_SPREAD = 16;
const SHARD_DETAIL = 6;

const createMotes = (): Float32Array => {
  const positions = new Float32Array(MOTE_COUNT * 3);
  for (let index = 0; index < MOTE_COUNT; index++) {
    positions[index * 3] = (Math.random() - 0.5) * MOTE_SPREAD;
    positions[index * 3 + 1] = (Math.random() - 0.5) * MOTE_SPREAD;
    positions[index * 3 + 2] = (Math.random() - 0.5) * MOTE_SPREAD;
  }
  return positions;
};

// REASON: displace an icosahedron along its radius with two noise octaves so the silhouette reads as a fractured, eroded stone rather than a primitive
const buildShardGeometry = (): THREE.BufferGeometry => {
  const geometry = new THREE.IcosahedronGeometry(1.5, SHARD_DETAIL);
  const position = geometry.getAttribute('position');
  if (!(position instanceof THREE.BufferAttribute)) {
    return geometry;
  }

  const noise3d = createNoise3D();
  const vertex = new THREE.Vector3();
  for (let index = 0; index < position.count; index++) {
    vertex.fromBufferAttribute(position, index);
    const base = noise3d(vertex.x * 0.9, vertex.y * 0.9, vertex.z * 0.9);
    const detail =
      noise3d(vertex.x * 2.6, vertex.y * 2.6, vertex.z * 2.6) * 0.35;
    vertex.multiplyScalar(1 + base * 0.26 + detail);
    position.setXYZ(index, vertex.x, vertex.y, vertex.z);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
};

const Shard = ({ color }: WorldTwoParams) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useRef(buildShardGeometry()).current;

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    const time = state.clock.elapsedTime;
    mesh.rotation.y = time * 0.18;
    mesh.rotation.x = Math.sin(time * 0.3) * 0.22;
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <MeshTransmissionMaterial
        color={color}
        transmission={1}
        thickness={1.6}
        roughness={0.16}
        ior={1.45}
        chromaticAberration={0.55}
        distortion={0.45}
        distortionScale={0.4}
        temporalDistortion={0.18}
        samples={6}
        resolution={512}
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
