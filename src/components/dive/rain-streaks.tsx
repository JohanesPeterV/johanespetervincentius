'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { AdditiveBlending, Color, ShaderMaterial } from 'three';

import { createSeededRandom } from './world-layout';

type StreakField = {
  corners: Float32Array;
  indices: Uint16Array;
  origins: Float32Array;
  seeds: Float32Array;
};

const RAIN_COUNT = 280;
const RAIN_COLOR = '#9db6cf';
const FALL_SPAN = 24;
const FALL_FLOOR = -4;
const FIELD_WIDTH = 84;
const FIELD_NEAR_Z = 18;
const FIELD_DEPTH = 56;

const CORNERS = [-1, 0, 1, 0, -1, 1, 1, 1];
const QUAD_INDICES = [0, 1, 2, 2, 1, 3];

const RAIN_UNIFORMS = {
  uTime: { value: 0 },
  uColor: { value: new Color(RAIN_COLOR) },
};

// REASON: width is set per depth rather than in world units so every streak
// keeps the same ~2px thickness a lens would record - world-sized quads either
// alias to nothing far away or smear into bars up close
const RAIN_VERTEX = `
attribute vec2 aCorner;
attribute float aSeed;
uniform float uTime;
varying vec2 vCorner;
varying float vFade;

const float FALL_SPAN = ${FALL_SPAN.toFixed(1)};
const float FALL_FLOOR = ${FALL_FLOOR.toFixed(1)};
const float WIDTH_PER_DEPTH = 0.0022;

void main() {
  float speed = 11.0 + aSeed * 9.0;
  float streakLength = 1.5 + aSeed * 2.4;
  float fall = mod(position.y - uTime * speed, FALL_SPAN);
  vec3 dropPosition = vec3(position.x, FALL_FLOOR + fall, position.z);

  float gust = sin(uTime * 0.23) * 0.5 + 0.5;
  vec3 fallAxis = normalize(vec3(0.08 + gust * 0.18, 1.0, 0.0));

  vec4 viewPosition = modelViewMatrix * vec4(dropPosition, 1.0);
  float viewDepth = -viewPosition.z;
  vec3 viewAxis = normalize((modelViewMatrix * vec4(fallAxis, 0.0)).xyz);
  vec3 viewSide = normalize(cross(viewAxis, normalize(-viewPosition.xyz)));
  float streakWidth = viewDepth * WIDTH_PER_DEPTH * (0.7 + aSeed * 0.6);
  viewPosition.xyz +=
    viewAxis * (aCorner.y * streakLength) + viewSide * (aCorner.x * streakWidth);

  vFade =
    smoothstep(1.0, 4.5, viewDepth) *
    (1.0 - smoothstep(34.0, 62.0, viewDepth)) *
    smoothstep(0.0, 2.5, fall) *
    (1.0 - smoothstep(FALL_SPAN - 5.0, FALL_SPAN, fall)) *
    (0.35 + aSeed * 0.65);

  vCorner = aCorner;
  gl_Position = projectionMatrix * viewPosition;
}
`;

const RAIN_FRAGMENT = `
uniform vec3 uColor;
varying vec2 vCorner;
varying float vFade;

void main() {
  float core = smoothstep(1.0, 0.35, abs(vCorner.x));
  float trail = 1.0 - vCorner.y;
  float alpha = core * trail * trail * vFade * 0.5;
  if (alpha < 0.003) {
    discard;
  }
  gl_FragColor = vec4(uColor, alpha);
}
`;

const buildStreakField = (): StreakField => {
  const random = createSeededRandom(113);
  const origins = new Float32Array(RAIN_COUNT * 12);
  const corners = new Float32Array(RAIN_COUNT * 8);
  const seeds = new Float32Array(RAIN_COUNT * 4);
  const indices = new Uint16Array(RAIN_COUNT * 6);
  for (let drop = 0; drop < RAIN_COUNT; drop++) {
    const x = (random() - 0.5) * FIELD_WIDTH;
    const y = random() * FALL_SPAN;
    const z = FIELD_NEAR_Z - random() * FIELD_DEPTH;
    const seed = random();
    for (let corner = 0; corner < 4; corner++) {
      const vertex = drop * 4 + corner;
      origins[vertex * 3] = x;
      origins[vertex * 3 + 1] = y;
      origins[vertex * 3 + 2] = z;
      corners[vertex * 2] = CORNERS[corner * 2];
      corners[vertex * 2 + 1] = CORNERS[corner * 2 + 1];
      seeds[vertex] = seed;
    }
    for (let step = 0; step < 6; step++) {
      indices[drop * 6 + step] = drop * 4 + QUAD_INDICES[step];
    }
  }
  return { corners, indices, origins, seeds };
};

export default function RainStreaks() {
  const fieldRef = useRef<StreakField | null>(null);
  if (fieldRef.current === null) {
    fieldRef.current = buildStreakField();
  }
  const field = fieldRef.current;
  const materialRef = useRef<ShaderMaterial>(null);
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });
  return (
    <mesh frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[field.origins, 3]}
        />
        <bufferAttribute
          attach="attributes-aCorner"
          args={[field.corners, 2]}
        />
        <bufferAttribute attach="attributes-aSeed" args={[field.seeds, 1]} />
        <bufferAttribute attach="index" args={[field.indices, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={RAIN_VERTEX}
        fragmentShader={RAIN_FRAGMENT}
        uniforms={RAIN_UNIFORMS}
        blending={AdditiveBlending}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
