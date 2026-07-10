'use client';

import {
  Bloom,
  BrightnessContrast,
  ChromaticAberration,
  EffectComposer,
  GodRays,
  HueSaturation,
  Noise,
  SMAA,
  Vignette,
  wrapEffect,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import type { ChromaticAberrationEffect } from 'postprocessing';
import { memo, RefObject } from 'react';
import { Mesh, Vector2 } from 'three';

import { DiveTransitionEffect } from './dive-transition-effect';

const DiveTransition = wrapEffect(DiveTransitionEffect);
const ABERRATION_OFFSET = new Vector2(0.0011, 0.0006);

type DivePostprocessingParams = {
  aberrationRef: RefObject<ChromaticAberrationEffect | null>;
  gpuTier: number;
  sun: Mesh;
  transitionRef: RefObject<DiveTransitionEffect | null>;
};

const DivePostprocessing = memo(function DivePostprocessing({
  aberrationRef,
  gpuTier,
  sun,
  transitionRef,
}: DivePostprocessingParams) {
  return (
    <EffectComposer enabled={gpuTier >= 2} multisampling={0}>
      <SMAA />
      <Bloom intensity={0.35} luminanceThreshold={0.85} mipmapBlur />
      <GodRays
        sun={sun}
        samples={36}
        density={0.85}
        decay={0.92}
        weight={0.25}
        exposure={0.18}
        clampMax={0.8}
      />
      <ChromaticAberration
        ref={aberrationRef}
        offset={ABERRATION_OFFSET}
        radialModulation
        modulationOffset={0.4}
      />
      <DiveTransition ref={transitionRef} />
      <HueSaturation saturation={-0.1} />
      <BrightnessContrast contrast={0.08} />
      <Noise opacity={0.22} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={0.25} darkness={0.5} />
    </EffectComposer>
  );
});

export default DivePostprocessing;
