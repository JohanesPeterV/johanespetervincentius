'use client';

import { useFrame } from '@react-three/fiber';
import { RefObject, useEffect, useRef, useState } from 'react';
import { Color, Group, MathUtils, PerspectiveCamera, Vector2 } from 'three';

import { DIVE_LENGTH, DIVE_START } from './descent';
import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';

type CosmicEyesParams = {
  palette: DivePalette;
  progressRef: RefObject<number>;
  motionMode: MotionMode;
};

type EyePlacement = {
  x: number;
  y: number;
  size: number;
  depth: number;
  tilt: number;
};

const EYES: EyePlacement[] = [
  { x: -0.79, y: 0.67, size: 0.14, depth: 28, tilt: -0.08 },
  { x: -0.27, y: 0.79, size: 0.11, depth: 37, tilt: 0.12 },
  { x: 0.38, y: 0.7, size: 0.13, depth: 33, tilt: -0.06 },
  { x: 0.83, y: 0.54, size: 0.15, depth: 25, tilt: 0.07 },
  { x: -0.85, y: 0.03, size: 0.12, depth: 32, tilt: 0.05 },
  { x: 0.86, y: -0.13, size: 0.13, depth: 35, tilt: -0.1 },
  { x: -0.73, y: -0.64, size: 0.15, depth: 25, tilt: -0.04 },
  { x: -0.25, y: -0.81, size: 0.1, depth: 40, tilt: 0.08 },
  { x: 0.32, y: -0.69, size: 0.12, depth: 36, tilt: 0.06 },
  { x: 0.78, y: -0.64, size: 0.14, depth: 29, tilt: -0.09 },
];

const eyeVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const eyeFragment = `
  uniform vec3 uOutline;
  uniform vec3 uIris;
  uniform vec3 uSclera;
  uniform vec2 uGaze;
  uniform float uBlink;
  varying vec2 vUv;

  void main() {
    vec2 point = (vUv - 0.5) * vec2(2.0, 1.0);
    float opening = mix(0.015, 0.46, uBlink);
    float lid = opening * (1.0 - point.x * point.x);
    float edge = (lid - abs(point.y)) / sqrt(1.0 + point.x * point.x);
    float aa = max(fwidth(edge), 0.001);
    float coverage = smoothstep(-aa, aa, edge);
    if (coverage < 0.001) {
      discard;
    }

    float interior = smoothstep(0.055 - aa, 0.055 + aa, edge);
    vec2 irisPoint = point - uGaze;
    float radius = length(irisPoint);
    float iris = 1.0 - smoothstep(0.31 - aa, 0.31 + aa, radius);
    float pupil = 1.0 - smoothstep(0.145 - aa, 0.145 + aa, radius);
    vec3 inside = mix(uSclera, uIris, iris);
    inside = mix(inside, vec3(0.003), pupil);
    float catchlight = 1.0 - smoothstep(
      0.025 - aa, 0.025 + aa, length(irisPoint - vec2(-0.045, 0.065))
    );
    inside = mix(inside, uSclera, catchlight * 0.8);
    gl_FragColor = vec4(mix(uOutline, inside, interior), coverage);
    #include <colorspace_fragment>
  }
`;

export default function CosmicEyes({
  palette,
  progressRef,
  motionMode,
}: CosmicEyesParams) {
  const groupRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const [uniforms] = useState(() =>
    EYES.map(() => ({
      uOutline: { value: new Color() },
      uIris: { value: new Color() },
      uSclera: { value: new Color() },
      uGaze: { value: new Vector2() },
      uBlink: { value: 1 },
    })),
  );

  // REASON: shader colours are persistent Three.js objects; theme changes
  // must update them without reparsing CSS colour strings every frame.
  useEffect(() => {
    const foreground = new Color(palette.foreground);
    const background = new Color(palette.background);
    const neutral =
      foreground.r + foreground.g + foreground.b >
      background.r + background.g + background.b
        ? foreground
        : background;
    uniforms.forEach((eye, index) => {
      eye.uOutline.value.set(palette.highlight);
      eye.uIris.value.set(palette.accent);
      eye.uSclera.value.copy(neutral).lerp(eye.uIris.value, 0.12);
      if (index % 3 === 1) {
        eye.uIris.value.set(palette.highlight).lerp(neutral, 0.28);
      }
    });
  }, [
    palette.accent,
    palette.background,
    palette.foreground,
    palette.highlight,
    uniforms,
  ]);

  useFrame(({ camera, pointer, size }, delta) => {
    const group = groupRef.current;
    if (!group || !(camera instanceof PerspectiveCamera)) {
      return;
    }
    if (motionMode === 'full') {
      elapsedRef.current += Math.min(delta, 0.1);
    }
    const time = elapsedRef.current;
    const phase =
      ((progressRef.current - DIVE_START) / DIVE_LENGTH) * Math.PI * 2;
    const compact = size.width < 768;
    const tangent = Math.tan(MathUtils.degToRad(camera.fov * 0.5));
    group.position.copy(camera.position);
    group.quaternion.copy(camera.quaternion);
    group.children.forEach((mesh, index) => {
      mesh.visible = !compact || index % 3 === 0;
      if (!mesh.visible) {
        return;
      }
      const placement = EYES[index];
      const eye = uniforms[index];
      const halfHeight = tangent * placement.depth;
      const halfWidth = halfHeight * camera.aspect;
      const drift = time * 0.12 + index * 1.7;
      const x = compact ? Math.sign(placement.x) * 0.81 : placement.x;
      const travel = Math.sin(phase + index) - Math.sin(index);
      mesh.position.set(
        (x + Math.sin(drift) * 0.012) * halfWidth,
        (placement.y + Math.cos(drift) * 0.013 + travel * 0.025) * halfHeight,
        -placement.depth + travel * 1.1,
      );
      mesh.rotation.set(
        Math.sin(drift) * 0.035,
        Math.cos(drift) * 0.09,
        placement.tilt + Math.sin(drift * 0.7) * 0.025,
      );
      mesh.scale.setScalar(Math.min(halfHeight, halfWidth) * placement.size);
      eye.uBlink.value = 1;
      eye.uGaze.value.set(0, 0);
      if (motionMode === 'full') {
        const blinkPhase = (time + index * 2.37) % (8 + index * 0.43);
        eye.uBlink.value = MathUtils.smoothstep(
          Math.abs(blinkPhase - 0.18),
          0.015,
          0.17,
        );
        eye.uGaze.value.set(pointer.x * 0.075, pointer.y * 0.055);
      }
    });
  }, -1);

  return (
    <group ref={groupRef}>
      {EYES.map((placement, index) => (
        <mesh key={placement.depth + placement.x} frustumCulled={false}>
          <planeGeometry args={[2, 1]} />
          <shaderMaterial
            uniforms={uniforms[index]}
            vertexShader={eyeVertex}
            fragmentShader={eyeFragment}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
