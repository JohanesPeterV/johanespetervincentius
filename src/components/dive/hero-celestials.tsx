'use client';

import { useFrame, useLoader } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import {
  Color,
  Group,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
} from 'three';

import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import {
  celestialVertex,
  frontierPlanetFragment,
  moonFragment,
} from './celestial-shader';
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
  const moonRef = useRef<Group>(null);
  const planetRef = useRef<Group>(null);
  const distantRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const [albedo, heightMap] = useLoader(TextureLoader, [
    '/textures/lunar-albedo.jpg',
    '/textures/lunar-height.jpg',
  ]);
  const [origin] = useState(createSpaceOrigin);
  const [uniforms] = useState(() => ({
    uAccent: { value: new Color(palette.accent) },
    uHighlight: { value: new Color(palette.highlight) },
    uSunlight: { value: new Color(palette.sunlight) },
    uLitInk: { value: new Color(palette.litInk) },
    uShadowInk: { value: new Color(palette.shadowInk) },
    uLuminous: { value: Number(palette.mode === 'dark') },
    uAlbedo: { value: albedo },
    bumpMap: { value: heightMap },
    bumpScale: { value: 1.2 },
  }));
  const segments = gpuTier < 2 ? 48 : 96;

  // REASON: loader-cached colour and height data need different GPU sampling semantics.
  useEffect(() => {
    albedo.colorSpace = SRGBColorSpace;
    for (const texture of [albedo, heightMap]) {
      texture.wrapS = RepeatWrapping;
      texture.anisotropy = 4;
      texture.needsUpdate = true;
    }
  }, [albedo, heightMap]);

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
    const compact = size.width < 768;
    if (moonRef.current) {
      const height = VIEW_TANGENT * 34;
      const x = compact ? -0.9 : -0.95;
      const y = compact ? -0.78 : -0.67;
      moonRef.current.position.set(x * aspect * height, y * height, -34);
      moonRef.current.scale.setScalar(height * (compact ? 1.12 : 2.94));
      moonRef.current.rotation.set(0, 1.2 + time * 0.003, -0.24);
    }
    if (planetRef.current) {
      const height = VIEW_TANGENT * 94;
      const y = compact ? 0.78 : 0.04;
      planetRef.current.position.set(0.78 * aspect * height, y * height, -94);
      planetRef.current.scale.setScalar(height * (compact ? 0.74 : 1.9));
      planetRef.current.rotation.set(0.12, time * 0.008, -0.22);
    }
    if (distantRef.current) {
      const height = VIEW_TANGENT * 120;
      distantRef.current.visible = !compact;
      distantRef.current.position.set(
        -0.43 * aspect * height,
        0.78 * height,
        -120,
      );
      distantRef.current.scale.setScalar(height);
    }
  }, -1);

  return (
    <group
      name="hero-celestials"
      position={origin.position}
      quaternion={origin.quaternion}
    >
      <group ref={moonRef}>
        <mesh name="hero-moon">
          <sphereGeometry args={[0.18, segments, segments / 2]} />
          <shaderMaterial
            uniforms={uniforms}
            vertexShader={celestialVertex}
            fragmentShader={moonFragment}
            toneMapped={false}
          />
        </mesh>
      </group>
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
