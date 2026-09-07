'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Color, Group, MathUtils, PerspectiveCamera } from 'three';

import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';

type CosmicEyesParams = {
  palette: DivePalette;
  motionMode: MotionMode;
};

type EyePlacement = {
  x: number;
  y: number;
  size: number;
  depth: number;
  tilt: number;
  variant: 'cyan' | 'violet';
  mobile?: [number, number];
};

const EYES: EyePlacement[] = [
  {
    x: -0.78,
    y: 0.66,
    size: 0.06,
    depth: 28,
    tilt: -0.025,
    variant: 'cyan',
    mobile: [0.76, 0.58],
  },
  {
    x: 0.76,
    y: -0.56,
    size: 0.05,
    depth: 38,
    tilt: -0.02,
    variant: 'violet',
  },
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
  uniform vec3 uPupil;
  uniform float uBlink;
  varying vec2 vUv;

  void main() {
    vec2 point = (vUv - 0.5) * vec2(2.0, 1.0);
    float opening = mix(0.015, 0.48, uBlink);
    float lid = opening * (1.0 - pow(abs(point.x), 1.35));
    float slope = opening * 1.35 * pow(abs(point.x), 0.35);
    float edge = (lid - abs(point.y)) / sqrt(1.0 + slope * slope);
    float aa = max(fwidth(edge), 0.001);
    float coverage = smoothstep(-aa, aa, edge);
    if (coverage < 0.001) {
      discard;
    }

    float interior = smoothstep(0.08 - aa, 0.08 + aa, edge);
    float radius = length(point);
    float iris = 1.0 - smoothstep(0.54 - aa, 0.54 + aa, radius);
    float pupil = 1.0 - smoothstep(0.175 - aa, 0.175 + aa, radius);
    vec3 inside = mix(uSclera, uIris, iris);
    inside = mix(inside, uPupil, pupil);
    gl_FragColor = vec4(mix(uOutline, inside, interior), coverage);
    #include <colorspace_fragment>
  }
`;

export default function CosmicEyes({ palette, motionMode }: CosmicEyesParams) {
  const groupRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const [uniforms] = useState(() =>
    EYES.map(() => ({
      uOutline: { value: new Color() },
      uIris: { value: new Color() },
      uSclera: { value: new Color() },
      uPupil: { value: new Color() },
      uBlink: { value: 1 },
    })),
  );

  // REASON: shader colours are persistent Three.js objects; theme changes
  // must update them without reparsing CSS colour strings every frame.
  useEffect(() => {
    const foreground = new Color(palette.foreground);
    const background = new Color(palette.background);
    const foregroundIsLight =
      foreground.r + foreground.g + foreground.b >
      background.r + background.g + background.b;
    const neutral = foregroundIsLight ? foreground : background;
    const dark = foregroundIsLight ? background : foreground;
    const lilac = new Color(palette.highlight).lerp(neutral, 0.45);
    uniforms.forEach((eye, index) => {
      eye.uOutline.value.set(palette.highlight);
      eye.uIris.value.set(palette.accent);
      eye.uSclera.value.copy(neutral);
      eye.uPupil.value.copy(dark).lerp(neutral, 0.012);
      if (EYES[index].variant === 'violet') {
        eye.uIris.value.copy(lilac);
      }
    });
  }, [
    palette.accent,
    palette.background,
    palette.foreground,
    palette.highlight,
    uniforms,
  ]);

  useFrame(({ camera, size }, delta) => {
    const group = groupRef.current;
    if (!group || !(camera instanceof PerspectiveCamera)) {
      return;
    }
    if (motionMode === 'full') {
      elapsedRef.current += Math.min(delta, 0.1);
    }
    const time = elapsedRef.current;
    const compact = size.width < 768;
    const tangent = Math.tan(MathUtils.degToRad(camera.fov * 0.5));
    group.position.copy(camera.position);
    group.quaternion.copy(camera.quaternion);
    group.children.forEach((mesh, index) => {
      const placement = EYES[index];
      mesh.visible = !compact || placement.mobile !== undefined;
      if (!mesh.visible) {
        return;
      }
      const eye = uniforms[index];
      const halfHeight = tangent * placement.depth;
      const halfWidth = halfHeight * camera.aspect;
      const drift = time * 0.08 + index * 1.7;
      let x = placement.x;
      let y = placement.y;
      if (compact && placement.mobile) {
        [x, y] = placement.mobile;
      }
      mesh.position.set(
        (x + Math.sin(drift) * 0.006) * halfWidth,
        (y + Math.cos(drift) * 0.006) * halfHeight,
        -placement.depth,
      );
      mesh.rotation.set(0, 0, placement.tilt + Math.sin(drift * 0.7) * 0.01);
      mesh.scale.setScalar(Math.min(halfHeight, halfWidth) * placement.size);
      eye.uBlink.value = 1;
      if (motionMode === 'full') {
        const blinkPhase = (time + index * 3.7) % (16 + index * 0.83);
        eye.uBlink.value = MathUtils.smoothstep(
          Math.abs(blinkPhase - 0.18),
          0.015,
          0.17,
        );
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
