'use client';

import WorldTwo from '@/components/3d/world-two';
import { useConfig } from '@/hooks/use-config';
import { getFluidThemeColors } from '@/lib/theme-colors';
import { Environment } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import {
  Bloom,
  EffectComposer,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import { useTheme } from 'next-themes';
import { BlendFunction } from 'postprocessing';

const SKY_COLOR = '#9aa3b0';

export default function WorldTwoBackground() {
  const { resolvedTheme } = useTheme();
  const [{ theme }] = useConfig();
  const { fluidColor } = getFluidThemeColors(theme, resolvedTheme);

  return (
    <div className="world-two-fade fixed inset-0 z-[5]">
      <Canvas
        camera={{ fov: 42, near: 0.1, far: 100, position: [0, 0, 6] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[SKY_COLOR]} />
        <ambientLight intensity={0.6} />
        <pointLight position={[3, 4, 5]} intensity={45} color={fluidColor} />
        <pointLight position={[-3, -2, -2]} intensity={20} color="#ffffff" />
        <Environment preset="city" />
        <WorldTwo color={fluidColor} />
        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
          <Vignette offset={0.25} darkness={0.75} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
