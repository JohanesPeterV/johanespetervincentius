'use client';

import WorldTwo from '@/components/3d/world-two';
import { useConfig } from '@/hooks/use-config';
import { useWorldTwoActive, useWorldTwoTransitioning } from '@/hooks/use-wipe';
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
  const isActive = useWorldTwoActive();
  const isTransitioning = useWorldTwoTransitioning();

  return (
    <>
      {/* REASON: a turbulence baked into a mask-image data URI rasterises once and never moves; referencing this filter from CSS lets SMIL animate the noise so the fog edge actually churns */}
      <svg aria-hidden="true" className="pointer-events-none absolute h-0 w-0">
        <defs>
          <filter
            id="worldFogDisplace"
            x="-25%"
            y="-25%"
            width="150%"
            height="150%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.011 0.02"
              numOctaves={2}
              seed={7}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="13s"
                values="0.011 0.02;0.017 0.029;0.009 0.017;0.011 0.02"
                keyTimes="0;0.4;0.75;1"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={42}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <div
        data-active={isTransitioning}
        className="world-two-fog fixed -inset-12 z-[5]"
      >
        <div className="world-two-wipe absolute inset-0">
          <Canvas
            frameloop={isActive ? 'always' : 'never'}
            dpr={[1, 1.5]}
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
      </div>
    </>
  );
}
