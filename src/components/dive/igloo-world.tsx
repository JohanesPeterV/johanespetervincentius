'use client';

import { Environment, Lightformer } from '@react-three/drei';
import { RefObject } from 'react';

import { worldARise, worldBRise } from './descent';
import {
  IceRidges,
  NarrativeStones,
  RisingStones,
  RisingWorld,
  SnowDrift,
  SnowTerrain,
} from './dive-world';
import IceCrystals from './ice-crystals';
import SnowGpu from './snow-gpu';

type IglooWorldParams = {
  gpuTier: number;
  progressRef: RefObject<number>;
};

export default function IglooWorld({ gpuTier, progressRef }: IglooWorldParams) {
  return (
    <>
      <hemisphereLight args={['#e3e7ec', '#525b66', 0.68]} />
      <directionalLight
        position={[18, 32, 14]}
        intensity={0.74}
        color="#ffffff"
      />
      <pointLight
        position={[0, -10, 10]}
        intensity={10}
        distance={28}
        color="#e6f1ff"
      />
      <RisingWorld progressRef={progressRef} rise={worldARise}>
        <SnowTerrain />
        <IceRidges />
      </RisingWorld>
      <RisingWorld progressRef={progressRef} rise={worldBRise}>
        <RisingStones />
        <IceCrystals gpuTier={gpuTier} />
      </RisingWorld>
      <NarrativeStones progressRef={progressRef} />
      {gpuTier < 2 ? <SnowDrift /> : <SnowGpu />}
      <Environment resolution={64} frames={1}>
        <Lightformer
          form="rect"
          intensity={1.7}
          color="#eaf4ff"
          position={[0, 30, 0]}
          rotation-x={-Math.PI / 2}
          scale={40}
        />
        <Lightformer
          form="rect"
          intensity={0.62}
          color="#b9d4ea"
          position={[-18, 4, -12]}
          scale={12}
        />
        <Lightformer
          form="rect"
          intensity={0.48}
          color="#8fb4d4"
          position={[16, -6, 10]}
          rotation-y={Math.PI}
          scale={10}
        />
      </Environment>
    </>
  );
}
