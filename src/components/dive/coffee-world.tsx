'use client';

import { RefObject } from 'react';

import { worldBRise } from './descent';
import { NarrativeStones, RisingStones, RisingWorld } from './dive-world';

type CoffeeWorldParams = {
  accentColor: string;
  progressRef: RefObject<number>;
  rockColor: string;
  stoneColor: string;
};

const KEY_LIGHT_COLOR = '#ffb066';

export default function CoffeeWorld({
  accentColor,
  progressRef,
  rockColor,
  stoneColor,
}: CoffeeWorldParams) {
  return (
    <>
      <ambientLight intensity={0.24} color="#ffe2c4" />
      <spotLight
        position={[8, 9, 6]}
        intensity={640}
        angle={0.85}
        penumbra={0.9}
        color={KEY_LIGHT_COLOR}
      />
      <pointLight
        position={[0, 2.6, 3]}
        intensity={10}
        distance={26}
        color="#ffbf78"
      />
      <RisingWorld progressRef={progressRef} rise={worldBRise}>
        <RisingStones color={rockColor} />
      </RisingWorld>
      <NarrativeStones
        accentColor={accentColor}
        color={stoneColor}
        progressRef={progressRef}
      />
    </>
  );
}
