'use client';

import BinaryField from '@/components/3d/binary-field';
import CommStreams from '@/components/3d/comm-streams';
import { ORBIT_CENTER } from '@/components/3d/orbit';
import OrbitSystem from '@/components/3d/orbit-system';
import { RefObject } from 'react';

import { worldARise, worldBRise } from './descent';
import {
  NarrativeStones,
  RisingStones,
  RisingWorld,
  RockDrift,
  SpaceRidges,
} from './dive-world';

type SpaceWorldParams = {
  accentColor: string;
  gpuTier: number;
  progressRef: RefObject<number>;
  rockColor: string;
};

export default function SpaceWorld({
  accentColor,
  gpuTier,
  progressRef,
  rockColor,
}: SpaceWorldParams) {
  const binaryCount = gpuTier < 2 ? 900 : 2400;

  return (
    <>
      <ambientLight intensity={0.32} />
      <spotLight
        position={[4, 12, 12]}
        intensity={96}
        angle={0.62}
        penumbra={0.82}
        color={accentColor}
      />
      <pointLight position={[-8, 2, 8]} intensity={54} color={accentColor} />
      <pointLight position={[0, 8, 14]} intensity={24} color="#ffffff" />
      <RisingWorld progressRef={progressRef} rise={worldARise}>
        <group position={[0, 3.4, 0]}>
          <group position={[ORBIT_CENTER[0], ORBIT_CENTER[1], ORBIT_CENTER[2]]}>
            <BinaryField color={accentColor} count={binaryCount} />
          </group>
          <CommStreams color={accentColor} />
          <OrbitSystem />
          <SpaceRidges color={rockColor} />
        </group>
      </RisingWorld>
      <RisingWorld progressRef={progressRef} rise={worldBRise}>
        <RisingStones color={rockColor} />
      </RisingWorld>
      <NarrativeStones
        accentColor={accentColor}
        color={rockColor}
        progressRef={progressRef}
      />
      <RockDrift color={rockColor} />
    </>
  );
}
