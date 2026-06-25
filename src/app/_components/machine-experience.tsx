'use client';

import MachineScene from '@/components/3d/machine-scene';
import { useConfig } from '@/hooks/use-config';
import { getFluidThemeColors } from '@/lib/theme-colors';
import { useDetectGPU } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useTheme } from 'next-themes';
import { ReactNode } from 'react';

type MachineExperienceParams = {
  children: ReactNode;
};

export default function MachineExperience({
  children,
}: MachineExperienceParams) {
  const { resolvedTheme } = useTheme();
  const [{ theme }] = useConfig();
  const gpu = useDetectGPU();

  const isLowPerformanceDevice = gpu.tier < 2;
  const { fluidColor } = getFluidThemeColors(theme, resolvedTheme);

  return (
    <div className="fixed inset-0">
      <Canvas
        camera={{ fov: 40, near: 0.1, far: 100, position: [0, 3, 15] }}
        dpr={isLowPerformanceDevice ? 1 : [1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        performance={{ min: 0.5 }}
      >
        <MachineScene accentColor={fluidColor}>{children}</MachineScene>
        {isLowPerformanceDevice ? null : (
          <EffectComposer>
            <Bloom
              intensity={0.7}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
