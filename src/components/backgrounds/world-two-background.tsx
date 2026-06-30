'use client';

import WorldTwo from '@/components/3d/world-two';
import { useConfig } from '@/hooks/use-config';
import {
  getWipeValue,
  useWorldTwoActive,
  useWorldTwoTransitioning,
} from '@/hooks/use-wipe';
import { getFluidThemeColors } from '@/lib/theme-colors';
import { Environment } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Bloom,
  EffectComposer,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import { useTheme } from 'next-themes';
import { BlendFunction, ChromaticAberrationEffect } from 'postprocessing';
import { useRef, type RefObject } from 'react';
import { Vector2 } from 'three';

const SKY_COLOR = '#9aa3b0';
const MAX_SEAM_ABERRATION = 0.0024;
const FROST_PEAK_SCALE = 50;
const TRANSITION_BAND_END = 0.92;

type FrostSeamProps = {
  mapRef: RefObject<SVGFEDisplacementMapElement | null>;
};

function FrostSeam({ mapRef }: FrostSeamProps) {
  // REASON: peak the fog displacement at the seam crossing and ease it to zero at the band edges by driving the SVG feDisplacementMap scale each frame from the live wipe; an SVG filter attribute cannot read a CSS variable and SMIL cannot bind to scroll, and reusing the canvas frame loop avoids a second always-on requestAnimationFrame
  useFrame(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const progress = Math.min(1, getWipeValue() / TRANSITION_BAND_END);
    const bandEnergy = 1 - Math.abs(2 * progress - 1);
    map.scale.baseVal = bandEnergy * FROST_PEAK_SCALE;
  });

  return null;
}

function SeamEffects() {
  const aberrationRef = useRef<ChromaticAberrationEffect | null>(null);
  if (!aberrationRef.current) {
    // REASON: own the effect instance directly so its offset uniform can be mutated each frame; the drei <ChromaticAberration> wrapper JSON.stringifies its props (including a populated ref) every render and throws on the circular effect graph
    aberrationRef.current = new ChromaticAberrationEffect({
      offset: new Vector2(),
      radialModulation: false,
      modulationOffset: 0,
    });
  }

  // REASON: drive the chromatic-aberration offset each frame from the scroll wipe so the seam shimmers hardest mid-transition and settles clean on arrival — imperative per-frame uniform mutation that React props cannot express
  useFrame(() => {
    const effect = aberrationRef.current;
    if (!effect) {
      return;
    }
    const energy = 1 - Math.abs(2 * getWipeValue() - 1);
    const strength = energy * energy * MAX_SEAM_ABERRATION;
    effect.offset.set(strength, strength * 0.6);
  });

  return (
    <EffectComposer>
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.3}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <primitive object={aberrationRef.current} dispose={null} />
      <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={0.25} darkness={0.75} />
    </EffectComposer>
  );
}

export default function WorldTwoBackground() {
  const { resolvedTheme } = useTheme();
  const [{ theme }] = useConfig();
  const { fluidColor } = getFluidThemeColors(theme, resolvedTheme);
  const isActive = useWorldTwoActive();
  const isTransitioning = useWorldTwoTransitioning();
  const frostMapRef = useRef<SVGFEDisplacementMapElement | null>(null);

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
              ref={frostMapRef}
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
            <FrostSeam mapRef={frostMapRef} />
            <SeamEffects />
          </Canvas>
        </div>
      </div>
    </>
  );
}
