'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Color, Group, MathUtils, PerspectiveCamera } from 'three';

import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import {
  celestialVertex,
  moonFragment,
  paintedPlanetFragment,
} from './celestial-shader';
import SuspendedCelestial from './suspended-celestial';

type LightCelestialsParams = {
  palette: DivePalette;
  motionMode: MotionMode;
  gpuTier: number;
};

export default function LightCelestials({
  palette,
  motionMode,
  gpuTier,
}: LightCelestialsParams) {
  const groupRef = useRef<Group>(null);
  const moonRef = useRef<Group>(null);
  const planetRef = useRef<Group>(null);
  const [uniforms] = useState(() => ({
    uAccent: { value: new Color(palette.accent) },
    uHighlight: { value: new Color(palette.highlight) },
    uBackground: { value: new Color(palette.background) },
    uForeground: { value: new Color(palette.foreground) },
  }));
  const segments = gpuTier < 2 ? 32 : 64;

  // REASON: persistent shader colours must follow live palette switches.
  useEffect(() => {
    uniforms.uAccent.value.set(palette.accent);
    uniforms.uHighlight.value.set(palette.highlight);
    uniforms.uBackground.value.set(palette.background);
    uniforms.uForeground.value.set(palette.foreground);
  }, [
    palette.accent,
    palette.highlight,
    palette.background,
    palette.foreground,
    uniforms,
  ]);

  useFrame(({ camera, size }) => {
    const group = groupRef.current;
    if (!group || !(camera instanceof PerspectiveCamera)) {
      return;
    }
    const compact = size.width < 768;
    const halfHeight = Math.tan(MathUtils.degToRad(camera.fov * 0.5)) * 58;
    group.position.copy(camera.position);
    group.quaternion.copy(camera.quaternion);
    group.translateZ(-58);
    group.scale.setScalar(halfHeight);
    if (moonRef.current) {
      moonRef.current.position.set(
        -0.72 * camera.aspect,
        compact ? 0.67 : 0.48,
        0,
      );
      moonRef.current.scale.setScalar(compact ? 0.56 : 1);
    }
    if (planetRef.current) {
      planetRef.current.position.set(
        0.76 * camera.aspect,
        compact ? 0.64 : 0.66,
        0,
      );
      planetRef.current.scale.setScalar(compact ? 0.64 : 1);
    }
  }, -1);

  return (
    <group ref={groupRef}>
      <group ref={moonRef}>
        <SuspendedCelestial
          color={palette.foreground}
          radius={0.18}
          length={1.3}
          phase={0.4}
          motionMode={motionMode}
        >
          <mesh>
            <sphereGeometry args={[0.18, segments, segments / 2]} />
            <shaderMaterial
              uniforms={uniforms}
              vertexShader={celestialVertex}
              fragmentShader={moonFragment}
              toneMapped={false}
            />
          </mesh>
        </SuspendedCelestial>
      </group>
      <group ref={planetRef}>
        <SuspendedCelestial
          color={palette.foreground}
          radius={0.115}
          length={1.1}
          phase={2.8}
          motionMode={motionMode}
        >
          <mesh rotation={[0, 0, -0.22]}>
            <sphereGeometry args={[0.115, segments, segments / 2]} />
            <shaderMaterial
              uniforms={uniforms}
              vertexShader={celestialVertex}
              fragmentShader={paintedPlanetFragment}
              toneMapped={false}
            />
          </mesh>
        </SuspendedCelestial>
      </group>
    </group>
  );
}
