'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { Color } from 'three';

import type { DivePalette } from './dive-palette';
import type { MotionMode } from './descent';
import { buildOrbitalField, buildStarField } from './world-layout';

type DiveAtmosphereParams = {
  reality: 'watchers' | 'orbital';
  palette: DivePalette;
  gpuTier: number;
  motionMode: MotionMode;
};

const STAR_POSITIONS = buildStarField(650);
const ORBITAL_POSITIONS = buildOrbitalField(1800);

const starVertex = `
  uniform float uPixelRatio;
  uniform float uTime;
  uniform float uOrbital;
  varying float vAlpha;
  varying float vSparkle;
  varying float vTint;
  void main() {
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * view;
    float seed = fract(sin(position.x * 12.9898 + position.z) * 43758.5453);
    vSparkle = step(0.955, seed) * (1.0 - uOrbital);
    float size = mix(1.2 + seed * 2.0, 16.0 + seed * 12.0, vSparkle);
    size = mix(size, 0.85 + seed * 1.2, uOrbital);
    gl_PointSize = size * uPixelRatio;
    vAlpha = (0.5 + seed * 0.5) * (0.9 + 0.1 * sin(uTime * 0.6 + seed * 20.0));
    vTint = seed;
  }
`;

const starFragment = `
  uniform vec3 uStarlight;
  uniform vec3 uAccent;
  uniform vec3 uHighlight;
  uniform float uOrbital;
  varying float vAlpha;
  varying float vSparkle;
  varying float vTint;
  void main() {
    vec2 p = abs(gl_PointCoord - 0.5);
    float point = 1.0 - smoothstep(0.25, 0.48, length(p));
    float rays = min(p.x / 0.055 + p.y / 0.49, p.y / 0.055 + p.x / 0.49);
    float sparkle = 1.0 - smoothstep(0.85, 1.05, rays);
    float core = 1.0 - smoothstep(0.025, 0.09, length(p));
    float alpha = mix(point, max(sparkle, core), vSparkle) * vAlpha;
    vec3 dust = mix(uAccent, uHighlight, vTint);
    gl_FragColor = vec4(mix(uStarlight, dust, uOrbital), alpha);
    #include <colorspace_fragment>
  }
`;

export default function DiveAtmosphere({
  reality,
  palette,
  gpuTier,
  motionMode,
}: DiveAtmosphereParams) {
  const [uniforms] = useState(() => ({
    uStarlight: { value: new Color(palette.foreground) },
    uAccent: { value: new Color(palette.accent) },
    uHighlight: { value: new Color(palette.highlight) },
    uOrbital: { value: Number(reality === 'orbital') },
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
  }));

  // REASON: shader uniforms retain their initial Color object. Sync palette
  // changes without parsing CSS colours on every animation frame.
  useEffect(() => {
    uniforms.uStarlight.value.set(palette.foreground);
    uniforms.uAccent.value.set(palette.accent);
    uniforms.uHighlight.value.set(palette.highlight);
    uniforms.uOrbital.value = Number(reality === 'orbital');
  }, [
    palette.accent,
    palette.foreground,
    palette.highlight,
    reality,
    uniforms,
  ]);

  useFrame(({ gl }, delta) => {
    if (motionMode === 'full') {
      uniforms.uTime.value += Math.min(delta, 0.1);
    }
    uniforms.uPixelRatio.value = gl.getPixelRatio();
  }, -1);

  const positions = reality === 'watchers' ? STAR_POSITIONS : ORBITAL_POSITIONS;
  const count = positions.length / 3;

  return (
    <points frustumCulled={false}>
      <bufferGeometry
        drawRange={{ start: 0, count: gpuTier < 2 ? count / 2 : count }}
      >
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={starVertex}
        fragmentShader={starFragment}
        transparent
        toneMapped={false}
        depthWrite={false}
      />
    </points>
  );
}
