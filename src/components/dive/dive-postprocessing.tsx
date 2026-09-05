'use client';

import {
  Bloom,
  EffectComposer,
  SMAA,
  Vignette,
} from '@react-three/postprocessing';
import { ChromaticAberrationEffect } from 'postprocessing';
import { memo, RefObject, useEffect, useState } from 'react';
import { Vector2 } from 'three';

import HeroHandoffEffect from './hero-handoff-effect';
import type { HeroHandoff } from './hero-handoff';

const ABERRATION_OFFSET = new Vector2();

type DivePostprocessingParams = {
  foreground: string;
  aberrationRef: RefObject<ChromaticAberrationEffect | null>;
  handoffRef: RefObject<HeroHandoff>;
  gpuTier: number;
};

const DivePostprocessing = memo(function DivePostprocessing({
  foreground,
  aberrationRef,
  handoffRef,
  gpuTier,
}: DivePostprocessingParams) {
  const [handoff] = useState(() => new HeroHandoffEffect(handoffRef.current));
  const [aberration] = useState(
    () =>
      new ChromaticAberrationEffect({
        offset: ABERRATION_OFFSET,
        radialModulation: true,
        modulationOffset: 0.4,
      }),
  );
  // REASON: primitive effects are not disposed by R3F. Release the saved GPU
  // frame when reduced-motion removes the composer or the route unmounts.
  useEffect(
    () => () => {
      handoff.dispose();
      aberration.dispose();
    },
    [handoff, aberration],
  );
  return (
    <EffectComposer multisampling={0}>
      {gpuTier >= 2 ? (
        <>
          <SMAA />
          <Bloom intensity={0.22} luminanceThreshold={1} mipmapBlur />
          <primitive ref={aberrationRef} object={aberration} />
          <Vignette offset={0.3} darkness={0.16} />
        </>
      ) : (
        <></>
      )}
      <primitive object={handoff} ink={foreground} />
    </EffectComposer>
  );
});

export default DivePostprocessing;
