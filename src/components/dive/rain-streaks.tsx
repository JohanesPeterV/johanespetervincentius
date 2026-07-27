'use client';

import { useFrame } from '@react-three/fiber';
import { RefObject, useRef } from 'react';
import { AdditiveBlending, Color, ShaderMaterial } from 'three';

import { worldARise } from './descent';
import { DROP_MOTION, RAIN_FIELD } from './rain-field';
import { WORLD_A_FLOOR_Y } from './world-layout';

type RainStreaksParams = {
  progressRef: RefObject<number>;
};

const RAIN_COLOR = '#9db6cf';

// REASON: once the world lifts out of frame the floor races upward - the rain
// column has to stop following it or the whole curtain flies off with it
const IMPACT_CEILING = 0.4;

const RAIN_UNIFORMS = {
  uTime: { value: 0 },
  uImpactY: { value: 0 },
  uColor: { value: new Color(RAIN_COLOR) },
};

// REASON: width is set per depth rather than in world units so every streak
// keeps the same ~2px thickness a lens would record - world-sized quads either
// alias to nothing far away or smear into bars up close
const RAIN_VERTEX = `
${DROP_MOTION}
attribute vec2 aCorner;
attribute float aSeed;
uniform float uTime;
uniform float uImpactY;
varying vec2 vCorner;
varying float vFade;

const float WIDTH_PER_DEPTH = 0.0022;

void main() {
  float speed = dropSpeed(aSeed);
  float slant = dropSlant(uTime);
  float fall = dropFall(position.y, uTime, speed);
  float streakLength = 0.8 + aSeed * 1.3;

  vec3 dropPosition = vec3(
    position.x - slant * (FALL_SPAN - fall),
    uImpactY + fall,
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

  // REASON: no fade-out near the floor - the head has to stay lit right down
  // to the impact or it dies before its ring blooms and the two read as
  // unrelated effects; the floor plane is what hides the drop from there
  vFade =
    smoothstep(1.0, 4.5, viewDepth) *
    (1.0 - smoothstep(34.0, 62.0, viewDepth)) *
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

export default function RainStreaks({ progressRef }: RainStreaksParams) {
  const materialRef = useRef<ShaderMaterial>(null);
  useFrame((state) => {
    const material = materialRef.current;
    if (!material) {
      return;
    }
    const floorY = WORLD_A_FLOOR_Y + worldARise(progressRef.current);
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uImpactY.value = Math.min(floorY, IMPACT_CEILING);
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
}
