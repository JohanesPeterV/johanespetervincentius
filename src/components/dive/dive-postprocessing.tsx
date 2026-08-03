'use client';

import {
  Bloom,
  BrightnessContrast,
  ChromaticAberration,
  EffectComposer,
  GodRays,
  HueSaturation,
  SMAA,
  Vignette,
} from '@react-three/postprocessing';
import type { ChromaticAberrationEffect } from 'postprocessing';
import { memo, RefObject } from 'react';
import { Mesh, Vector2 } from 'three';

const ABERRATION_OFFSET = new Vector2();

type DivePostprocessingParams = {
  aberrationRef: RefObject<ChromaticAberrationEffect | null>;
  sun: Mesh;
};

const DivePostprocessing = memo(function DivePostprocessing({
  aberrationRef,
  sun,
}: DivePostprocessingParams) {
  return (
    <EffectComposer multisampling={0}>
      <SMAA />
      <Bloom intensity={0.3} luminanceThreshold={0.88} mipmapBlur />
      <GodRays
        sun={sun}
        samples={20}
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
      <Vignette offset={0.24} darkness={0.42} />
    </EffectComposer>
  );
});

export default DivePostprocessing;
