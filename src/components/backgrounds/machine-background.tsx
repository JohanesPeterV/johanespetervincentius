'use client';

import MachineScene from '@/components/3d/machine-scene';
import { ORBIT_CENTER } from '@/components/3d/orbit';
import TransitionEffects from '@/components/3d/transition-effects';
import { useConfig } from '@/hooks/use-config';
import { getFluidThemeColors } from '@/lib/theme-colors';
import { useDetectGPU } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
} from '@react-three/postprocessing';
import { useTheme } from 'next-themes';
import { ChromaticAberrationEffect } from 'postprocessing';
import { useRef } from 'react';
import * as THREE from 'three';

const INITIAL_OFFSET = new THREE.Vector2(0, 0);

export default function MachineBackground() {
  const { resolvedTheme } = useTheme();
  const [{ theme }] = useConfig();
  const gpu = useDetectGPU();
  const aberrationRef = useRef<ChromaticAberrationEffect>(null);

  const isLowPerformanceDevice = gpu.tier < 2;
  const { fluidColor } = getFluidThemeColors(theme, resolvedTheme);

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{
          fov: 40,
          near: 0.1,
          far: 100,
          position: [ORBIT_CENTER[0], ORBIT_CENTER[1], ORBIT_CENTER[2]],
        }}
        dpr={isLowPerformanceDevice ? 1 : [1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        performance={{ min: 0.5 }}
      >
        <MachineScene accentColor={fluidColor} />
        {isLowPerformanceDevice ? null : (
          <>
            <TransitionEffects effectRef={aberrationRef} />
            <EffectComposer>
              <Bloom
                intensity={0.7}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                mipmapBlur
              />
              <ChromaticAberration
                ref={aberrationRef}
                offset={INITIAL_OFFSET}
              />
            </EffectComposer>
          </>
        )}
      </Canvas>
    </div>
  );
}
