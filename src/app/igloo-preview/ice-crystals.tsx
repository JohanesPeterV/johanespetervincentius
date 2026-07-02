'use client';

import { MeshTransmissionMaterial } from '@react-three/drei';

import { applyBlockInstances } from './dive-world';
import { buildCrystalShards } from './world-layout';

const CRYSTAL_SHARDS = buildCrystalShards();

type IceCrystalsParams = {
  gpuTier: number;
};

export default function IceCrystals({ gpuTier }: IceCrystalsParams) {
  return (
    <instancedMesh
      args={[undefined, undefined, CRYSTAL_SHARDS.length]}
      ref={(mesh) => {
        applyBlockInstances(mesh, CRYSTAL_SHARDS, '#dceefb');
      }}
    >
      <octahedronGeometry args={[1, 0]} />
      {gpuTier >= 2 ? (
        <MeshTransmissionMaterial
          samples={5}
          resolution={384}
          thickness={1.4}
          ior={1.31}
          chromaticAberration={0.12}
          anisotropicBlur={0.3}
          roughness={0.12}
          distortion={0.25}
          distortionScale={0.4}
          temporalDistortion={0.08}
          color="#cfe6f5"
          attenuationColor="#9fd0ee"
          attenuationDistance={2.5}
        />
      ) : (
        <meshPhysicalMaterial
          transparent
          opacity={0.55}
          roughness={0.18}
          color="#bcd8ee"
        />
      )}
    </instancedMesh>
  );
}
