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
const ABERRATION_OFFSET = new Vector2(0.00055, 0.0003);

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
      <Bloom intensity={0.42} luminanceThreshold={0.78} mipmapBlur />
      <GodRays
        sun={sun}
        samples={24}
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
      <HueSaturation saturation={-0.46} />
      <BrightnessContrast brightness={-0.045} contrast={0.19} />
      <DiveTransition ref={transitionRef} />
      <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={0.24} darkness={0.42} />
    </EffectComposer>
  );
});

export default DivePostprocessing;
