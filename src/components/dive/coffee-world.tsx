'use client';

import { RefObject } from 'react';

import { worldARise, worldBRise } from './descent';
import { NarrativeStones, RisingStones, RisingWorld } from './dive-world';
import RainRipples from './rain-ripples';
import RainStreaks from './rain-streaks';
import { WORLD_A_FLOOR_Y } from './world-layout';

type CoffeeWorldParams = {
  accentColor: string;
  progressRef: RefObject<number>;
  rockColor: string;
  stoneColor: string;
};

const KEY_LIGHT_COLOR = '#ffb066';
const FLOOR_COLOR = '#080604';
const FLOOR_RADIUS = 46;

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
      <RisingWorld progressRef={progressRef} rise={worldARise}>
        <group position={[0, WORLD_A_FLOOR_Y, 0]}>
          <mesh rotation-x={-Math.PI / 2}>
            <circleGeometry args={[FLOOR_RADIUS, 64]} />
            <meshBasicMaterial color={FLOOR_COLOR} />
          </mesh>
          <RainRipples />
        </group>
      </RisingWorld>
      <RisingWorld progressRef={progressRef} rise={worldBRise}>
        <RisingStones color={rockColor} />
      </RisingWorld>
      <NarrativeStones
        accentColor={accentColor}
        color={stoneColor}
        progressRef={progressRef}
      />
      <RainStreaks progressRef={progressRef} />
    </>
  );
}
