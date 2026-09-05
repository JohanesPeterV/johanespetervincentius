'use client';

import { useFrame } from '@react-three/fiber';
import { RefObject, useState } from 'react';
import { AdditiveBlending, Color } from 'three';

import type { MotionMode } from './descent';
import { sectionTravel } from './descent';
import type { DivePalette } from './dive-palette';
import { createSeededRandom } from './world-layout';

type DiveAtmosphereParams = {
  palette: DivePalette;
  progressRef: RefObject<number>;
  motionMode: MotionMode;
};

const DUST_POSITIONS = (() => {
  const random = createSeededRandom(71);
  const positions = new Float32Array(220 * 3);
  for (let index = 0; index < positions.length; index += 3) {
    positions[index] = (random() - 0.5) * 42;
    positions[index + 1] = (random() - 0.5) * 60;
    positions[index + 2] = random() * 38 - 26;
  }
  return positions;
})();

const backdropVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const backdropFragment = `
  uniform vec3 uBackground;
  uniform vec3 uAccent;
  uniform float uTime;
  uniform float uTravel;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - vec2(0.6, 0.68);
    float haze = exp(-length(p * vec2(2.2, 1.3)) * 5.0);
    float slant = vUv.x + vUv.y * 0.38;
    float shafts = pow(0.5 + 0.5 * sin(slant * 43.0 + sin(slant * 17.0 + uTime * 0.035)), 12.0);
    float light = haze * (0.22 + shafts * 0.24) * (1.0 + uTravel * 0.45);
    float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    vec3 color = uBackground + uAccent * light;
    gl_FragColor = vec4(color + (grain - 0.5) / 255.0, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const dustVertex = `
  uniform float uTime;
  uniform float uProgress;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y = mod(p.y + uProgress * 14.0 + uTime * 0.12 + 30.0, 60.0) - 30.0;
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * view;
    gl_PointSize = clamp(52.0 / -view.z, 0.8, 3.5);
    vAlpha = (0.4 + 0.2 * sin(position.x * 3.0 + uTime * 0.4)) * smoothstep(1.0, 5.0, -view.z);
  }
`;

const dustFragment = `
  uniform vec3 uAccent;
  varying float vAlpha;
  void main() {
    float radius = length(gl_PointCoord - 0.5) * 2.0;
    float alpha = (1.0 - smoothstep(0.0, 1.0, radius)) * vAlpha;
    gl_FragColor = vec4(uAccent * 1.8, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default function DiveAtmosphere({
  palette,
  progressRef,
  motionMode,
}: DiveAtmosphereParams) {
  const [uniforms] = useState(() => ({
    uBackground: { value: new Color(palette.background) },
    uAccent: { value: new Color(palette.accent) },
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uTravel: { value: 0 },
  }));

  useFrame((_, delta) => {
    if (motionMode === 'full') {
      uniforms.uTime.value += Math.min(delta, 0.1);
    }
    uniforms.uProgress.value = progressRef.current;
    uniforms.uTravel.value = sectionTravel(progressRef.current);
  }, -1);

  return (
    <>
      <mesh position={[0, 5, -36]} scale={[100, 70, 1]} renderOrder={-10}>
        <planeGeometry />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={backdropVertex}
          fragmentShader={backdropFragment}
          depthWrite={false}
        />
      </mesh>
      <points frustumCulled={false} visible={motionMode === 'full'}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[DUST_POSITIONS, 3]}
          />
        </bufferGeometry>
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={dustVertex}
          fragmentShader={dustFragment}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </>
  );
}
