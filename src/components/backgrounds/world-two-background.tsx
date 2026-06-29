'use client';

import WorldTwo from '@/components/3d/world-two';
import { useConfig } from '@/hooks/use-config';
import { getFluidThemeColors } from '@/lib/theme-colors';
import { Canvas } from '@react-three/fiber';
import { useTheme } from 'next-themes';

const SKY_COLOR = '#0b0f17';

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
          x="-15%"
          y="-15%"
          width="130%"
          height="130%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.011 0.016"
            numOctaves={2}
            seed={11}
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="17s"
              values="0.011 0.016;0.015 0.010;0.011 0.016"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={72}
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
            <ambientLight intensity={0.5} />
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
            <WorldTwo color={fluidColor} />
          </Canvas>
        </div>
        <div
          aria-hidden
          className="world-wipe-divider pointer-events-none absolute inset-x-0 h-40 -translate-y-1/2 bg-gradient-to-t from-transparent via-white/20 to-transparent"
        />
      </div>
    </>
  );
}
