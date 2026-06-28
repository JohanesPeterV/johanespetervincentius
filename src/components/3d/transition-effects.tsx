import { getScrollEased } from '@/components/scroll-progress';
import { useFrame } from '@react-three/fiber';
import { ChromaticAberrationEffect } from 'postprocessing';
import { RefObject } from 'react';

type TransitionEffectsParams = {
  effectRef: RefObject<ChromaticAberrationEffect | null>;
};

const MAX_OFFSET = 0.01;

export default function TransitionEffects({
  effectRef,
}: TransitionEffectsParams) {
  // REASON: ramps the chromatic-aberration uniform from the imperative R3F loop in step with scroll progress; the effect mutates per frame, not per render
  useFrame(() => {
    const effect = effectRef.current;
    if (!effect) {
      return;
    }
    const veil = Math.sin(Math.min(getScrollEased(), 1) * Math.PI);
    effect.offset.set(veil * MAX_OFFSET, veil * MAX_OFFSET);
  });

  return null;
}
