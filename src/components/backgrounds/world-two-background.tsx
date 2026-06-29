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
    <>
      <svg
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 h-0 w-0"
      >
        <filter
          id="world-crumble"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.017 0.023"
            numOctaves={3}
            seed={9}
            result="cracks"
          >
            <animate
              attributeName="baseFrequency"
              dur="13s"
              values="0.017 0.023;0.022 0.018;0.017 0.023"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="cracks"
            scale={96}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <div className="world-crumble-layer fixed inset-0 z-[5]">
        <div className="world-two-wipe absolute inset-0">
          <Canvas
            camera={{ fov: 42, near: 0.1, far: 100, position: [0, 0, 6] }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
          >
            <color attach="background" args={[SKY_COLOR]} />
            <ambientLight intensity={0.6} />
            <pointLight
              position={[3, 4, 5]}
              intensity={45}
              color={fluidColor}
            />
            <pointLight
              position={[-3, -2, -2]}
              intensity={20}
              color="#ffffff"
            />
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
        <div
          aria-hidden
          className="world-wipe-fog pointer-events-none absolute inset-x-0 h-32 -translate-y-1/2 bg-gradient-to-t from-transparent via-white/35 to-transparent"
        />
      </div>
    </>
  );
}
