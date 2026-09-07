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
  {
    x: 0.61,
    y: 0.73,
    size: 0.07,
    depth: 32,
    tilt: 0.02,
    variant: 'violet',
  },
  {
    x: -0.7,
    y: -0.4,
    size: 0.066,
    depth: 35,
    tilt: 0.015,
    variant: 'cyan',
    mobile: [-0.74, -0.58],
  },
  {
    x: 0.13,
    y: -0.76,
    size: 0.055,
    depth: 30,
    tilt: -0.015,
    variant: 'cyan',
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
  uniform vec3 uColor;
  uniform vec3 uLight;
  uniform vec3 uDark;
  uniform float uCycle;
  varying vec2 vUv;

  vec3 cycleColor(float band) {
    float color = mod(band, 3.0);
    if (color < 1.0) {
      return uDark;
    }
    if (color < 2.0) {
      return uColor;
    }
    return uLight;
  }

  void main() {
    vec2 point = (vUv - 0.5) * vec2(2.0, 1.0);
    float opening = 0.48;
    float lid = opening * (1.0 - pow(abs(point.x), 1.35));
    float slope = opening * 1.35 * pow(abs(point.x), 0.35);
    float edge = (lid - abs(point.y)) / sqrt(1.0 + slope * slope);
    float aa = max(fwidth(edge), 0.001);
    float coverage = smoothstep(-aa, aa, edge);
    if (coverage < 0.001) {
      discard;
    }

    float interior = smoothstep(0.08 - aa, 0.08 + aa, edge);
    float cycle = uCycle - length(point) / 0.44;
    float band = floor(cycle);
    float blend = smoothstep(0.0, max(fwidth(cycle), 0.001), fract(cycle));
    vec3 inside = mix(cycleColor(band - 1.0), cycleColor(band), blend);
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
      uColor: { value: new Color() },
      uLight: { value: new Color() },
      uDark: { value: new Color() },
      uCycle: { value: 0.4 },
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
      eye.uColor.value.set(palette.accent);
      eye.uLight.value.copy(neutral);
      eye.uDark.value.copy(dark).lerp(neutral, 0.012);
      if (EYES[index].variant === 'violet') {
        eye.uColor.value.copy(lilac);
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
      eye.uCycle.value = (time * 0.48 + index * 0.67 + 0.4) % 3;
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
