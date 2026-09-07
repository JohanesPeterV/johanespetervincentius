'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { Color } from 'three';

import type { DivePalette } from './dive-palette';
import type { MotionMode } from './descent';
import { buildStarField } from './world-layout';

type DiveAtmosphereParams = {
  palette: DivePalette;
  gpuTier: number;
  motionMode: MotionMode;
};

const STAR_POSITIONS = buildStarField(900);

const starVertex = `
  uniform float uPixelRatio;
  uniform float uTime;
  varying float vAlpha;
  varying float vSparkle;
  void main() {
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * view;
    float seed = fract(sin(position.x * 12.9898 + position.z) * 43758.5453);
    vSparkle = step(0.955, seed);
    float size = mix(1.2 + seed * 2.0, 16.0 + seed * 12.0, vSparkle);
    gl_PointSize = size * uPixelRatio;
    vAlpha = (0.5 + seed * 0.5) * (0.9 + 0.1 * sin(uTime * 0.6 + seed * 20.0));
  }
`;

const starFragment = `
  uniform vec3 uStarlight;
  varying float vAlpha;
  varying float vSparkle;
  void main() {
    vec2 p = abs(gl_PointCoord - 0.5);
    float point = 1.0 - smoothstep(0.25, 0.48, length(p));
    float rays = min(p.x / 0.055 + p.y / 0.49, p.y / 0.055 + p.x / 0.49);
    float sparkle = 1.0 - smoothstep(0.85, 1.05, rays);
    float core = 1.0 - smoothstep(0.025, 0.09, length(p));
    float alpha = mix(point, max(sparkle, core), vSparkle) * vAlpha;
    gl_FragColor = vec4(uStarlight, alpha);
    #include <colorspace_fragment>
  }
`;

export default function DiveAtmosphere({
  palette,
  gpuTier,
  motionMode,
}: DiveAtmosphereParams) {
  const [uniforms] = useState(() => ({
    uStarlight: { value: new Color(palette.foreground) },
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
  }));

  // REASON: shader uniforms retain their initial Color object. Sync palette
  // changes without parsing CSS colours on every animation frame.
  useEffect(() => {
    uniforms.uStarlight.value.set(palette.foreground);
  }, [palette.foreground, uniforms]);

  useFrame(({ gl }, delta) => {
    if (motionMode === 'full') {
      uniforms.uTime.value += Math.min(delta, 0.1);
    }
    uniforms.uPixelRatio.value = gl.getPixelRatio();
  }, -1);

  return (
    <points frustumCulled={false}>
      <bufferGeometry drawRange={{ start: 0, count: gpuTier < 2 ? 360 : 900 }}>
        <bufferAttribute
          attach="attributes-position"
          args={[STAR_POSITIONS, 3]}
        />
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
