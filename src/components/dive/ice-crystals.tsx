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
          samples={3}
          resolution={320}
          thickness={1.4}
          ior={1.31}
          chromaticAberration={0.05}
          anisotropicBlur={0.18}
          roughness={0.12}
          distortion={0.16}
          distortionScale={0.28}
          temporalDistortion={0.025}
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
