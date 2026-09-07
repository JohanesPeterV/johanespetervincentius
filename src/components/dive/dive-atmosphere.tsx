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

const STAR_POSITIONS = buildStarField(900);
const ORBITAL_POSITIONS = buildOrbitalField(1800);

const starVertex = `
  uniform float uPixelRatio;
  uniform float uTime;
  uniform float uOrbital;
  varying float vAlpha;
  varying float vGlow;
  varying float vTint;
  void main() {
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * view;
    float seed = fract(sin(position.x * 12.9898 + position.z) * 43758.5453);
    float depth = clamp(62.0 / max(24.0, -view.z), 0.45, 1.65);
    vGlow = pow(seed, 14.0);
    float size = mix(2.2, 11.0, vGlow);
    size *= mix(1.0, 0.7, uOrbital);
    gl_PointSize = max(1.0, size * depth) * uPixelRatio;
    float phase = fract(seed * 31.7);
    float twinkle = 0.87 + 0.13 * sin(uTime * (0.4 + phase * 0.6) + phase * 40.0);
    vAlpha = (0.24 + seed * 0.66) * min(depth, 1.0) * twinkle;
    vTint = phase;
  }
`;

const starFragment = `
  uniform vec3 uStarlight;
  uniform vec3 uAccent;
  uniform vec3 uHighlight;
  uniform float uOrbital;
  varying float vAlpha;
  varying float vGlow;
  varying float vTint;
  void main() {
    float radius = length(gl_PointCoord - 0.5);
    float coreRadius = mix(0.24, 0.105, vGlow);
    float aa = max(fwidth(radius) * 0.5, 0.015);
    float core = 1.0 - smoothstep(coreRadius - aa, coreRadius + aa, radius);
    float halo = exp(-radius * radius * 22.0) * (1.0 - smoothstep(0.35, 0.5, radius));
    float alpha = (core + halo * vGlow * 0.38) * vAlpha;
    vec3 dust = mix(uAccent, uHighlight, step(0.5, vTint));
    vec3 starlight = mix(uStarlight, dust, 0.12 + vTint * 0.18);
    gl_FragColor = vec4(mix(starlight, dust, uOrbital), min(alpha, 1.0));
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
