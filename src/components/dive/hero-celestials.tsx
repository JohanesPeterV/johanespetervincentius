'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Color, Group } from 'three';

import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import {
  celestialVertex,
  frontierPlanetFragment,
  moonFragment,
  paintedPlanetFragment,
} from './celestial-shader';
import { createSpaceOrigin } from './space-origin';
import SuspendedCelestial from './suspended-celestial';

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
  const moonRef = useRef<Group>(null);
  const planetRef = useRef<Group>(null);
  const distantRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const [origin] = useState(createSpaceOrigin);
  const [uniforms] = useState(() => ({
    uAccent: { value: new Color(palette.accent) },
    uHighlight: { value: new Color(palette.highlight) },
    uBackground: { value: new Color(palette.background) },
    uForeground: { value: new Color(palette.foreground) },
    uMatte: { value: Number(palette.mode === 'light') },
  }));
  const segments = gpuTier < 2 ? 48 : 96;
  const light = palette.mode === 'light';

  // REASON: persistent shader colours must follow live palette switches.
  useEffect(() => {
    uniforms.uAccent.value.set(palette.accent);
    uniforms.uHighlight.value.set(palette.highlight);
    uniforms.uBackground.value.set(palette.background);
    uniforms.uForeground.value.set(palette.foreground);
    uniforms.uMatte.value = Number(light);
  }, [
    palette.accent,
    palette.highlight,
    palette.background,
    palette.foreground,
    light,
    uniforms,
  ]);

  useFrame(({ size }, delta) => {
    if (motionMode === 'full') {
      elapsedRef.current += Math.min(delta, 0.1);
    }
    const time = elapsedRef.current;
    const aspect = size.width / size.height;
    const compact = size.width < 768;
    if (moonRef.current) {
      const depth = light ? 58 : 34;
      const height = VIEW_TANGENT * depth;
      let x = -0.95;
      let y = -0.67;
      let scale = 2.94;
      if (compact) {
        x = -0.9;
        y = -0.78;
        scale = 1.12;
      }
      if (light) {
        x = -0.72;
        y = compact ? 0.67 : 0.48;
        scale = compact ? 0.56 : 1;
        if (compact && size.height < 650) {
          x = -0.94;
          y = 0.85;
          scale = 0.42;
        }
      }
      moonRef.current.position.set(x * aspect * height, y * height, -depth);
      moonRef.current.scale.setScalar(height * scale);
      moonRef.current.rotation.set(
        0,
        light ? 0 : time * 0.015,
        light ? 0 : -0.24,
      );
    }
    if (planetRef.current) {
      const depth = light ? 58 : 94;
      const height = VIEW_TANGENT * depth;
      let x = 0.6;
      let y = compact ? 0.78 : 0.62;
      let scale = compact ? 0.74 : 1.4;
      if (light) {
        x = 0.76;
        y = compact ? 0.64 : 0.66;
        scale = compact ? 0.64 : 1;
        if (compact && size.height < 650) {
          x = 0.92;
          y = 0.85;
          scale = 0.5;
        }
      }
      planetRef.current.position.set(x * aspect * height, y * height, -depth);
      planetRef.current.scale.setScalar(height * scale);
      planetRef.current.rotation.set(0.12, light ? 0 : time * 0.025, -0.22);
    }
    if (distantRef.current) {
      const height = VIEW_TANGENT * 120;
      distantRef.current.visible = !light && !compact;
      distantRef.current.position.set(
        -0.43 * aspect * height,
        0.78 * height,
        -120,
      );
      distantRef.current.scale.setScalar(height);
    }
  }, -1);

  const moon = (
    <mesh name="hero-moon">
      <sphereGeometry args={[0.18, segments, segments / 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={celestialVertex}
        fragmentShader={moonFragment}
        toneMapped={false}
      />
    </mesh>
  );
  const planet = (
    <mesh name="hero-distant-planet">
      <sphereGeometry args={[0.115, segments, segments / 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={celestialVertex}
        fragmentShader={light ? paintedPlanetFragment : frontierPlanetFragment}
        toneMapped={false}
      />
    </mesh>
  );

  return (
    <group
      name="hero-celestials"
      position={origin.position}
      quaternion={origin.quaternion}
    >
      <group ref={moonRef}>
        {light ? (
          <SuspendedCelestial
            color={palette.foreground}
            radius={0.18}
            length={1.3}
            phase={0.4}
            motionMode={motionMode}
          >
            {moon}
          </SuspendedCelestial>
        ) : (
          moon
        )}
      </group>
      <group ref={planetRef}>
        {light ? (
          <SuspendedCelestial
            color={palette.foreground}
            radius={0.115}
            length={1.1}
            phase={2.8}
            motionMode={motionMode}
          >
            {planet}
          </SuspendedCelestial>
        ) : (
          planet
        )}
      </group>
      <group ref={distantRef}>
        <mesh name="hero-distant-moon">
          <sphereGeometry args={[0.045, segments / 2, segments / 4]} />
          <shaderMaterial
            uniforms={uniforms}
            vertexShader={celestialVertex}
            fragmentShader={moonFragment}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}
