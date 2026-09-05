'use client';

import {
  Bloom,
  BrightnessContrast,
  ChromaticAberration,
  EffectComposer,
  HueSaturation,
  SMAA,
  Vignette,
} from '@react-three/postprocessing';
import type { ChromaticAberrationEffect } from 'postprocessing';
import { memo, RefObject } from 'react';
import { Vector2 } from 'three';

const ABERRATION_OFFSET = new Vector2();

type DivePostprocessingParams = {
  aberrationRef: RefObject<ChromaticAberrationEffect | null>;
};

const DivePostprocessing = memo(function DivePostprocessing({
  aberrationRef,
}: DivePostprocessingParams) {
  return (
    <EffectComposer multisampling={0}>
      <SMAA />
      <Bloom intensity={0.35} luminanceThreshold={1} mipmapBlur />
      <ChromaticAberration
        ref={aberrationRef}
        offset={ABERRATION_OFFSET}
        radialModulation
        modulationOffset={0.4}
      />
      <HueSaturation saturation={-0.18} />
      <BrightnessContrast brightness={-0.015} contrast={0.12} />
      <Vignette offset={0.24} darkness={0.34} />
    </EffectComposer>
  );
});

export default DivePostprocessing;
