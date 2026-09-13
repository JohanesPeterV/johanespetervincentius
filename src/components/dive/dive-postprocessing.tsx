'use client';

import { EffectComposer, SMAA } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import { ChromaticAberrationEffect } from 'postprocessing';
import type { EffectComposer as PostprocessingComposer } from 'postprocessing';
import { memo, RefObject, useEffect, useRef, useState } from 'react';
import { Vector2 } from 'three';

import HeroHandoffEffect from './hero-handoff-effect';
import InkOutlineEffect from './ink-outline-effect';
import type { HeroHandoff } from './hero-handoff';

const ABERRATION_OFFSET = new Vector2();

type DivePostprocessingParams = {
  background: string;
  foreground: string;
  glow: string;
  print: boolean;
  aberrationRef: RefObject<ChromaticAberrationEffect | null>;
  handoffRef: RefObject<HeroHandoff>;
  gpuTier: number;
};

const DivePostprocessing = memo(function DivePostprocessing({
  background,
  foreground,
  glow,
  print,
  aberrationRef,
  handoffRef,
  gpuTier,
}: DivePostprocessingParams) {
  const scene = useThree(({ scene }) => scene);
  const camera = useThree(({ camera }) => camera);
  const composerRef = useRef<PostprocessingComposer>(null);
  const renderDprRef = useRef(0);
  const [handoff] = useState(
    () => new HeroHandoffEffect(handoffRef.current, scene, camera),
  );
  const [outline] = useState(() => new InkOutlineEffect());
  const [aberration] = useState(
    () =>
      new ChromaticAberrationEffect({
        offset: ABERRATION_OFFSET,
        radialModulation: true,
        modulationOffset: 0.4,
      }),
  );
  // REASON: the composer only watches CSS size; adaptive DPR otherwise leaves
  // its full-screen render targets at the original, expensive resolution.
  useFrame(({ gl, size }) => {
    const dpr = gl.getPixelRatio();
    if (composerRef.current && dpr !== renderDprRef.current) {
      composerRef.current.setSize(size.width, size.height);
      renderDprRef.current = dpr;
    }
  });
  // REASON: primitive effects are not disposed by R3F. Release the saved GPU
  // frame when reduced-motion removes the composer or the route unmounts.
  useEffect(
    () => () => {
      handoff.dispose();
      aberration.dispose();
      outline.dispose();
    },
    [handoff, aberration, outline],
  );
  return (
    <EffectComposer ref={composerRef} multisampling={0}>
      {gpuTier >= 2 ? (
        <>
          <SMAA />
          <primitive ref={aberrationRef} object={aberration} />
        </>
      ) : (
        <></>
      )}
      <primitive
        object={handoff}
        ink={foreground}
        paper={background}
        prism={glow}
      />
      {print ? <primitive object={outline} ink={foreground} /> : <></>}
    </EffectComposer>
  );
});

export default DivePostprocessing;
