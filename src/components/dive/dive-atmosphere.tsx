'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { Color } from 'three';

import type { DivePalette } from './dive-palette';
import { buildStarField } from './world-layout';

type DiveAtmosphereParams = {
  palette: DivePalette;
  gpuTier: number;
};

const STAR_POSITIONS = buildStarField(180);

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
    float glow = exp(-length((vUv - vec2(0.68, 0.65)) * vec2(2.0, 2.8)) * 6.0);
    vec3 color = mix(uBackground, uStarlight, glow * 0.006);
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const starVertex = `
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * view;
    float seed = fract(sin(position.x * 12.9898 + position.z) * 43758.5453);
    gl_PointSize = (0.8 + seed * 0.9) * uPixelRatio;
    vAlpha = 0.16 + seed * 0.24;
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
  gpuTier,
}: DiveAtmosphereParams) {
  const [uniforms] = useState(() => ({
    uBackground: { value: new Color(palette.background) },
    uStarlight: { value: new Color(palette.foreground) },
    uPixelRatio: { value: 1 },
  }));

  // REASON: shader uniforms retain their initial Color objects. Sync theme
  // changes into those objects without parsing CSS colours on every frame.
  useEffect(() => {
    uniforms.uBackground.value.set(palette.background);
    uniforms.uStarlight.value.set(palette.foreground);
  }, [palette.background, palette.foreground, uniforms]);

  useFrame(({ gl }) => {
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
        <bufferGeometry drawRange={{ start: 0, count: gpuTier < 2 ? 80 : 180 }}>
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
