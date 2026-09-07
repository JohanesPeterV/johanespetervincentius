'use client';

import { useLoader } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { Color, RepeatWrapping, SRGBColorSpace, TextureLoader } from 'three';

import type { DivePalette } from './dive-palette';
import { createLunarTerrain, LUNAR_SURFACE_TILT } from './lunar-terrain';
import type { LunarView } from './lunar-terrain';
import {
  lunarSurfaceFragment,
  lunarSurfaceVertex,
} from './lunar-surface-shader';

type LunarSurfaceParams = {
  palette: DivePalette;
  gpuTier: number;
  view: LunarView;
};

export default function LunarSurface({
  palette,
  gpuTier,
  view,
}: LunarSurfaceParams) {
  const regolith = useLoader(TextureLoader, '/textures/lunar-regolith.jpg');
  const [terrain] = useState(() => createLunarTerrain(gpuTier, view));
  const [uniforms] = useState(() => ({
    uAccent: { value: new Color(palette.accent) },
    uSunlight: { value: new Color(palette.sunlight) },
    uLitInk: { value: new Color(palette.litInk) },
    uShadowInk: { value: new Color(palette.shadowInk) },
    uLuminous: { value: Number(palette.mode === 'dark') },
    uRegolith: { value: regolith },
  }));

  // REASON: the ground texture repeats across world coordinates and needs grazing-angle filtering.
  useEffect(() => {
    regolith.colorSpace = SRGBColorSpace;
    regolith.wrapS = RepeatWrapping;
    regolith.wrapT = RepeatWrapping;
    regolith.anisotropy = 8;
    regolith.needsUpdate = true;
  }, [regolith]);

  // REASON: shader uniforms must track live theme changes without regenerating the terrain.
  useEffect(() => {
    uniforms.uAccent.value.set(palette.accent);
    uniforms.uSunlight.value.set(palette.sunlight);
    uniforms.uLitInk.value.set(palette.litInk);
    uniforms.uShadowInk.value.set(palette.shadowInk);
    uniforms.uLuminous.value = Number(palette.mode === 'dark');
  }, [
    palette.accent,
    palette.litInk,
    palette.mode,
    palette.shadowInk,
    palette.sunlight,
    uniforms,
  ]);

  // REASON: externally created geometry has an imperative GPU lifetime owned by this surface.
  useEffect(
    () => () => {
      terrain.ground.dispose();
      terrain.rocks.dispose();
    },
    [terrain],
  );

  return (
    <group name="hero-lunar-surface" rotation-x={LUNAR_SURFACE_TILT[view]}>
      {[terrain.ground, terrain.rocks].map((geometry) => (
        <mesh key={geometry.uuid} name={geometry.name}>
          <primitive object={geometry} attach="geometry" />
          <shaderMaterial
            uniforms={uniforms}
            vertexShader={lunarSurfaceVertex}
            fragmentShader={lunarSurfaceFragment}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
