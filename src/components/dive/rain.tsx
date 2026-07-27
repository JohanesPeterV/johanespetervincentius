'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { AdditiveBlending, Color, DoubleSide, ShaderMaterial } from 'three';

import { createSeededRandom } from './world-layout';

type StreakField = {
  corners: Float32Array;
  indices: Uint16Array;
  origins: Float32Array;
  seeds: Float32Array;
};

const RAIN_COUNT = 150;
const RAIN_COLOR = '#9db6cf';
const FALL_SPAN = 24;
const FALL_FLOOR = -4;
const FIELD_WIDTH = 84;
const FIELD_NEAR_Z = 18;
const FIELD_DEPTH = 56;

const RIPPLE_COUNT = 16;
const RIPPLE_COLOR = '#c9c3bb';
const RIPPLE_MIN_RADIUS = 3.5;
const RIPPLE_RADIUS_SPREAD = 17;
const RIPPLE_SURFACE_Y = 0.1;

const QUAD_CORNERS = [-1, -1, 1, -1, -1, 1, 1, 1];
const QUAD_INDICES = [0, 1, 2, 2, 1, 3];

const RAIN_UNIFORMS = {
  uTime: { value: 0 },
  uColor: { value: new Color(RAIN_COLOR) },
};

const RIPPLE_UNIFORMS = {
  uTime: { value: 0 },
  uColor: { value: new Color(RIPPLE_COLOR) },
};

const buildQuadField = (
  seed: number,
  count: number,
  placeDrop: (random: () => number) => [number, number, number],
): StreakField => {
  const random = createSeededRandom(seed);
  const origins = new Float32Array(count * 12);
  const corners = new Float32Array(count * 8);
  const seeds = new Float32Array(count * 4);
  const indices = new Uint16Array(count * 6);
  for (let quad = 0; quad < count; quad++) {
    const [x, y, z] = placeDrop(random);
    const quadSeed = random();
    for (let corner = 0; corner < 4; corner++) {
      const vertex = quad * 4 + corner;
      origins[vertex * 3] = x;
      origins[vertex * 3 + 1] = y;
      origins[vertex * 3 + 2] = z;
      corners[vertex * 2] = QUAD_CORNERS[corner * 2];
      corners[vertex * 2 + 1] = QUAD_CORNERS[corner * 2 + 1];
      seeds[vertex] = quadSeed;
    }
    for (let step = 0; step < 6; step++) {
      indices[quad * 6 + step] = quad * 4 + QUAD_INDICES[step];
    }
  }
  return { corners, indices, origins, seeds };
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
  float speed = 5.5 + aSeed * 4.0;
  float streakLength = 0.8 + aSeed * 1.3;
  float fall = mod(position.y - uTime * speed, FALL_SPAN);
  float gust = sin(uTime * 0.19) * 0.5 + 0.5;
  float slant = 0.07 + gust * 0.1;

  vec3 dropPosition = vec3(
    position.x - slant * (FALL_SPAN - fall),
    FALL_FLOOR + fall,
    position.z
  );
  vec3 fallAxis = normalize(vec3(slant, 1.0, 0.0));

  vec4 viewPosition = modelViewMatrix * vec4(dropPosition, 1.0);
  float viewDepth = -viewPosition.z;
  vec3 viewAxis = normalize((modelViewMatrix * vec4(fallAxis, 0.0)).xyz);
  vec3 viewSide = normalize(cross(viewAxis, normalize(-viewPosition.xyz)));
  float streakWidth = viewDepth * WIDTH_PER_DEPTH * (0.7 + aSeed * 0.6);
  float alongStreak = aCorner.y * 0.5 + 0.5;
  viewPosition.xyz +=
    viewAxis * (alongStreak * streakLength) +
    viewSide * (aCorner.x * streakWidth);

  vFade =
    smoothstep(1.0, 4.5, viewDepth) *
    (1.0 - smoothstep(34.0, 62.0, viewDepth)) *
    smoothstep(0.0, 1.2, fall) *
    (1.0 - smoothstep(FALL_SPAN - 5.0, FALL_SPAN, fall)) *
    (0.35 + aSeed * 0.65);

  vCorner = vec2(aCorner.x, alongStreak);
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

const RAIN_FIELD = buildQuadField(113, RAIN_COUNT, (random) => [
  (random() - 0.5) * FIELD_WIDTH,
  random() * FALL_SPAN,
  FIELD_NEAR_Z - random() * FIELD_DEPTH,
]);

export const RainStreaks = () => {
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
          args={[RAIN_FIELD.origins, 3]}
        />
        <bufferAttribute
          attach="attributes-aCorner"
          args={[RAIN_FIELD.corners, 2]}
        />
        <bufferAttribute
          attach="attributes-aSeed"
          args={[RAIN_FIELD.seeds, 1]}
        />
        <bufferAttribute attach="index" args={[RAIN_FIELD.indices, 1]} />
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
};

// REASON: the ring grows in the quad's own plane, so the seeded corner offsets
// double as the ring's local coordinates - no per-ripple matrix on the CPU
const RIPPLE_VERTEX = `
attribute vec2 aCorner;
attribute float aSeed;
uniform float uTime;
varying vec2 vCorner;
varying float vFade;

void main() {
  float phase = fract(uTime * (0.5 + aSeed * 0.35) + aSeed * 7.31);
  float radius = 0.25 + phase * (0.55 + aSeed * 0.55);
  vec3 ringPosition =
    position + vec3(aCorner.x * radius, 0.0, aCorner.y * radius);

  vec4 viewPosition = modelViewMatrix * vec4(ringPosition, 1.0);
  vFade =
    smoothstep(0.0, 0.12, phase) *
    (1.0 - phase) *
    (1.0 - phase) *
    (1.0 - smoothstep(24.0, 44.0, -viewPosition.z));
  vCorner = aCorner;
  gl_Position = projectionMatrix * viewPosition;
}
`;

const RIPPLE_FRAGMENT = `
uniform vec3 uColor;
varying vec2 vCorner;
varying float vFade;

void main() {
  float band = 1.0 - smoothstep(0.0, 0.16, abs(length(vCorner) - 0.78));
  float alpha = band * band * vFade * 0.3;
  if (alpha < 0.003) {
    discard;
  }
  gl_FragColor = vec4(uColor, alpha);
}
`;

const RIPPLE_FIELD = buildQuadField(59, RIPPLE_COUNT, (random) => {
  const angle = random() * Math.PI * 2;
  const radius = RIPPLE_MIN_RADIUS + random() * RIPPLE_RADIUS_SPREAD;
  return [Math.cos(angle) * radius, RIPPLE_SURFACE_Y, Math.sin(angle) * radius];
});

export const RainRipples = () => {
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
          args={[RIPPLE_FIELD.origins, 3]}
        />
        <bufferAttribute
          attach="attributes-aCorner"
          args={[RIPPLE_FIELD.corners, 2]}
        />
        <bufferAttribute
          attach="attributes-aSeed"
          args={[RIPPLE_FIELD.seeds, 1]}
        />
        <bufferAttribute attach="index" args={[RIPPLE_FIELD.indices, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={RIPPLE_VERTEX}
        fragmentShader={RIPPLE_FRAGMENT}
        uniforms={RIPPLE_UNIFORMS}
        blending={AdditiveBlending}
        side={DoubleSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
};
