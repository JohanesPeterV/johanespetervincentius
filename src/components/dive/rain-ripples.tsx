'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { AdditiveBlending, Color, DoubleSide, ShaderMaterial } from 'three';

import { DROP_MOTION, RIPPLE_FIELD } from './rain-field';

const RIPPLE_COLOR = '#c9c3bb';

const RIPPLE_UNIFORMS = {
  uTime: { value: 0 },
  uColor: { value: new Color(RIPPLE_COLOR) },
};

// REASON: the ring is keyed off the drop that lands here - age counts from the
// instant that drop's fall wrapped, so the splash cannot drift out of step
const RIPPLE_VERTEX = `
${DROP_MOTION}
attribute vec2 aCorner;
attribute float aSeed;
uniform float uTime;
varying vec2 vCorner;
varying float vFade;

const float RIPPLE_LIFE = 0.8;
const float RIPPLE_RADIUS = 0.95;
const float RIPPLE_LIFT = 0.02;

void main() {
  float speed = dropSpeed(aSeed);
  float fall = dropFall(position.y, uTime, speed);
  float phase = (FALL_SPAN - fall) / speed / RIPPLE_LIFE;
  float settled = min(phase, 1.0);
  float radius = 0.1 + RIPPLE_RADIUS * (1.0 - (1.0 - settled) * (1.0 - settled));

  vec3 ringPosition = vec3(
    position.x - dropSlant(uTime) * FALL_SPAN + aCorner.x * radius,
    RIPPLE_LIFT,
    position.z + aCorner.y * radius
  );
  vec4 viewPosition = modelViewMatrix * vec4(ringPosition, 1.0);

  vFade =
    step(phase, 1.0) *
    (1.0 - settled) *
    (1.0 - settled) *
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
  float alpha = band * band * vFade * 0.34;
  if (alpha < 0.003) {
    discard;
  }
  gl_FragColor = vec4(uColor, alpha);
}
`;

export default function RainRipples() {
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
}
