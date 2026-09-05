'use client';

import { RefObject } from 'react';

import { worldRise } from './descent';
import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import DiveAtmosphere from './dive-atmosphere';
import { NarrativeStones, RisingStones, RisingWorld } from './dive-world';

type CoffeeWorldParams = {
  palette: DivePalette;
  progressRef: RefObject<number>;
  motionMode: MotionMode;
};

const KEY_LIGHT_COLOR = '#ffb066';

export default function CoffeeWorld({
  palette,
  progressRef,
  motionMode,
}: CoffeeWorldParams) {
  return (
    <>
      <DiveAtmosphere
        palette={palette}
        progressRef={progressRef}
        motionMode={motionMode}
      />
      <ambientLight intensity={0.36} color={palette.foreground} />
      <directionalLight
        position={[-5, 3, -7]}
        intensity={2.8}
        color={palette.accent}
      />
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
      <RisingWorld progressRef={progressRef} rise={worldRise}>
        <RisingStones color={palette.rock} />
      </RisingWorld>
      <NarrativeStones
        accentColor={palette.accent}
        color={palette.stone}
        progressRef={progressRef}
        motionMode={motionMode}
      />
    </>
  );
}
