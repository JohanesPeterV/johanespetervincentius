'use client';

import { useFrame } from '@react-three/fiber';
import { RefObject, useRef } from 'react';
import { Color, ShaderMaterial } from 'three';

import { worldARise } from './descent';
import { DROP_MOTION, RAIN_FIELD } from './rain-field';
import { WORLD_A_FLOOR_Y } from './world-layout';

type RainStreaksParams = {
  color: string;
  progressRef: RefObject<number>;
};

const RAIN_UNIFORMS = {
  uTime: { value: 0 },
  uImpactY: { value: 0 },
  uColor: { value: new Color() },
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

const float WIDTH_PER_DEPTH = 0.0016;

// REASON: a rain streak IS motion blur, so its length is the distance the drop
// covers while the shutter is open - a length picked independently of speed
// draws a slow solid object instead, which is exactly a meteor
const float SHUTTER = 0.055;

void main() {
  float speed = dropSpeed(aSeed);
  float slant = dropSlant(uTime);
  float fall = dropFall(position.y, uTime, speed);
  float streakLength = speed * SHUTTER;

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
    (0.62 + aSeed * 0.38);

  vCorner = vec2(aCorner.x, alongStreak);
  gl_Position = projectionMatrix * viewPosition;
}
`;

const RAIN_FRAGMENT = `
uniform vec3 uColor;
varying vec2 vCorner;
varying float vFade;

// REASON: motion blur is even along its path and soft at BOTH ends - any
// head-to-tail gradient hands the streak a direction and a nose, and that is
// what the eye classifies as a meteor rather than water
void main() {
  float core = smoothstep(1.0, 0.25, abs(vCorner.x));
  float ends =
    smoothstep(0.0, 0.2, vCorner.y) * (1.0 - smoothstep(0.8, 1.0, vCorner.y));
  float alpha = core * ends * vFade * 0.3;
  if (alpha < 0.003) {
    discard;
  }
  gl_FragColor = vec4(uColor, alpha);
}
`;

export default function RainStreaks({ color, progressRef }: RainStreaksParams) {
  const materialRef = useRef<ShaderMaterial>(null);
  const appliedColorRef = useRef('');
  useFrame((state) => {
    const material = materialRef.current;
    if (!material) {
      return;
    }
    if (appliedColorRef.current !== color) {
      material.uniforms.uColor.value.set(color);
      appliedColorRef.current = color;
    }
    material.uniforms.uTime.value = state.clock.elapsedTime;
    // REASON: the impact height tracks the floor with no ceiling on purpose -
    // at the seam the departing world carries its whole rain curtain up and
    // out of frame, which is what keeps rain existing only in the opening
    material.uniforms.uImpactY.value =
      WORLD_A_FLOOR_Y + worldARise(progressRef.current);
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
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
