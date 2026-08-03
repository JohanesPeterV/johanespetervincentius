'use client';

import { RefObject } from 'react';
import { DoubleSide } from 'three';

import { worldARise, worldBRise } from './descent';
import { NarrativeStones, RisingStones, RisingWorld } from './dive-world';
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
            {/* REASON: the unveiled seam lifts this disc past the lens - a
                single-sided floor pops out of existence at the crossing */}
            <meshBasicMaterial color={FLOOR_COLOR} side={DoubleSide} />
          </mesh>
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
    </>
  );
}
