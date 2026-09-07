'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Color, Group } from 'three';

import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import { celestialVertex, frontierPlanetFragment } from './celestial-shader';
import LunarSurface from './lunar-surface';
import type { LunarView } from './lunar-terrain';
import { createSpaceOrigin } from './space-origin';

type HeroCelestialsParams = {
  palette: DivePalette;
  motionMode: MotionMode;
  gpuTier: number;
};

const VIEW_TANGENT = Math.tan((58 * Math.PI) / 360);

export default function HeroCelestials({
  palette,
  motionMode,
  gpuTier,
}: HeroCelestialsParams) {
  const view: LunarView = useThree(({ size }) =>
    size.width < 768 ? 'compact' : 'wide',
  );
  const planetRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const [origin] = useState(createSpaceOrigin);
  const [uniforms] = useState(() => ({
    uAccent: { value: new Color(palette.accent) },
    uHighlight: { value: new Color(palette.highlight) },
    uSunlight: { value: new Color(palette.sunlight) },
    uLitInk: { value: new Color(palette.litInk) },
    uShadowInk: { value: new Color(palette.shadowInk) },
    uLuminous: { value: Number(palette.mode === 'dark') },
  }));
  const segments = gpuTier < 2 ? 48 : 96;

  // REASON: persistent shader colours must follow live palette switches.
  useEffect(() => {
    uniforms.uAccent.value.set(palette.accent);
    uniforms.uHighlight.value.set(palette.highlight);
    uniforms.uSunlight.value.set(palette.sunlight);
    uniforms.uLitInk.value.set(palette.litInk);
    uniforms.uShadowInk.value.set(palette.shadowInk);
    uniforms.uLuminous.value = Number(palette.mode === 'dark');
  }, [
    palette.accent,
    palette.highlight,
    palette.litInk,
    palette.mode,
    palette.shadowInk,
    palette.sunlight,
    uniforms,
  ]);

  useFrame(({ size }, delta) => {
    if (motionMode === 'full') {
      elapsedRef.current += Math.min(delta, 0.1);
    }
    const time = elapsedRef.current;
    const aspect = size.width / size.height;
    const compact = view === 'compact';
    if (planetRef.current) {
      const height = VIEW_TANGENT * 94;
      const y = compact ? 0.72 : 0.24;
      const x = compact ? 0.6 : 0.64;
      planetRef.current.position.set(x * aspect * height, y * height, -94);
      planetRef.current.scale.setScalar(height * (compact ? 0.65 : 1.3));
      planetRef.current.rotation.set(0.12, time * 0.008, -0.22);
    }
  }, -1);

  return (
    <group
      name="hero-celestials"
      position={origin.position}
      quaternion={origin.quaternion}
    >
      <LunarSurface
        key={view}
        palette={palette}
        gpuTier={gpuTier}
        view={view}
      />
      <group ref={planetRef}>
        <mesh name="hero-distant-planet">
          <sphereGeometry args={[0.115, segments, segments / 2]} />
          <shaderMaterial
            uniforms={uniforms}
            vertexShader={celestialVertex}
            fragmentShader={frontierPlanetFragment}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}
