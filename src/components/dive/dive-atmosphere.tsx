'use client';

import { useFrame } from '@react-three/fiber';
import { RefObject, useEffect, useState } from 'react';
import { Color } from 'three';

import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import { buildStarField } from './world-layout';

type DiveAtmosphereParams = {
  palette: DivePalette;
  progressRef: RefObject<number>;
  motionMode: MotionMode;
  gpuTier: number;
};

const STAR_POSITIONS = buildStarField(1100);

const backdropVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const backdropFragment = `
  uniform vec3 uBackground;
  uniform vec3 uStarlight;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - vec2(0.74, 0.65);
    float glow = exp(-length(p * vec2(2.0, 2.8)) * 7.0) * 0.035;
    vec2 q = vUv - vec2(0.22, 0.2);
    glow += exp(-length(q * vec2(3.0, 2.0)) * 8.0) * 0.012;
    float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    vec3 color = mix(uBackground, uStarlight, glow * 0.22);
    gl_FragColor = vec4(max(color + (grain - 0.5) / 1800.0, 0.0), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const starVertex = `
  uniform float uTime;
  uniform float uProgress;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y = mod(p.y + uProgress * 7.0 + uTime * 0.06 + 70.0, 140.0) - 70.0;
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * view;
    float seed = fract(sin(position.x * 12.9898 + position.z) * 43758.5453);
    gl_PointSize = clamp((0.9 + seed * 1.1) * 34.0 / -view.z, 0.85, 2.6) * uPixelRatio;
    vAlpha = (0.24 + seed * 0.5) * (0.85 + 0.15 * sin(uTime * 0.35 + seed * 20.0));
  }
`;

const starFragment = `
  uniform vec3 uStarlight;
  varying float vAlpha;
  void main() {
    float radius = length(gl_PointCoord - 0.5) * 2.0;
    float alpha = (1.0 - smoothstep(0.15, 1.0, radius)) * vAlpha;
    gl_FragColor = vec4(uStarlight, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default function DiveAtmosphere({
  palette,
  progressRef,
  motionMode,
  gpuTier,
}: DiveAtmosphereParams) {
  const [uniforms] = useState(() => ({
    uBackground: { value: new Color(palette.background) },
    uAccent: { value: new Color(palette.accent) },
    uStarlight: { value: new Color(palette.foreground) },
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uPixelRatio: { value: 1 },
  }));

  // REASON: shader uniforms retain their initial Color objects. Sync theme
  // changes into those objects without parsing CSS colours on every frame.
  useEffect(() => {
    uniforms.uBackground.value.set(palette.background);
    uniforms.uAccent.value.set(palette.accent);
    uniforms.uStarlight.value
      .set(palette.foreground)
      .lerp(uniforms.uAccent.value, 0.16);
  }, [palette.background, palette.accent, palette.foreground, uniforms]);

  useFrame(({ gl }, delta) => {
    if (motionMode === 'full') {
      uniforms.uTime.value += Math.min(delta, 0.1);
    }
    uniforms.uProgress.value = progressRef.current;
    uniforms.uPixelRatio.value = gl.getPixelRatio();
  }, -1);

  return (
    <>
      <mesh position={[0, 5, -120]} scale={[320, 260, 1]} renderOrder={-10}>
        <planeGeometry />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={backdropVertex}
          fragmentShader={backdropFragment}
          depthWrite={false}
        />
      </mesh>
      <points frustumCulled={false}>
        <bufferGeometry
          drawRange={{ start: 0, count: gpuTier < 2 ? 450 : 1100 }}
        >
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
          depthWrite={false}
        />
      </points>
    </>
  );
}
