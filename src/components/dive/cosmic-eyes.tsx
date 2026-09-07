'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Color, Group } from 'three';

import { createCosmicEyeGeometry } from './cosmic-eye-geometry';
import { cosmicEyeFragment, cosmicEyeVertex } from './cosmic-eye-shader';
import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import { createSpaceOrigin } from './space-origin';

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
  variant: 'primary' | 'secondary';
  mobile?: [number, number];
};

const EYES: EyePlacement[] = [
  {
    x: -0.78,
    y: 0.66,
    size: 0.06,
    depth: 28,
    tilt: -0.025,
    variant: 'primary',
    mobile: [0.76, 0.58],
  },
  {
    x: 0.76,
    y: -0.56,
    size: 0.05,
    depth: 38,
    tilt: -0.02,
    variant: 'secondary',
  },
  {
    x: 0.14,
    y: 0.86,
    size: 0.07,
    depth: 32,
    tilt: 0.02,
    variant: 'secondary',
  },
  {
    x: -0.7,
    y: -0.4,
    size: 0.066,
    depth: 35,
    tilt: 0.015,
    variant: 'secondary',
    mobile: [-0.74, -0.58],
  },
  {
    x: 0.13,
    y: -0.76,
    size: 0.055,
    depth: 30,
    tilt: -0.015,
    variant: 'primary',
  },
];

export default function CosmicEyes({ palette, motionMode }: CosmicEyesParams) {
  const groupRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const [origin] = useState(createSpaceOrigin);
  const [geometry] = useState(createCosmicEyeGeometry);
  const [uniforms] = useState(() =>
    EYES.map(() => ({
      uOutline: { value: new Color() },
      uColor: { value: new Color() },
      uLight: { value: new Color() },
      uDark: { value: new Color() },
      uCycle: { value: 0.4 },
    })),
  );

  // REASON: five meshes share this GPU geometry, so its owner must dispose it once on unmount.
  useEffect(() => () => geometry.dispose(), [geometry]);

  // REASON: persistent Three.js uniforms need theme updates without reparsing CSS colours every frame.
  useEffect(() => {
    const foreground = new Color(palette.foreground);
    const background = new Color(palette.background);
    const foregroundIsLight =
      foreground.r + foreground.g + foreground.b >
      background.r + background.g + background.b;
    const neutral = foregroundIsLight ? foreground : background;
    const dark = foregroundIsLight ? background : foreground;
    uniforms.forEach((eye, index) => {
      const primaryFill = EYES[index].variant === 'primary';
      eye.uOutline.value.set(primaryFill ? palette.highlight : palette.accent);
      eye.uColor.value.set(primaryFill ? palette.accent : palette.highlight);
      eye.uLight.value.copy(neutral);
      eye.uDark.value.copy(dark).lerp(neutral, 0.012);
    });
  }, [
    palette.accent,
    palette.background,
    palette.foreground,
    palette.highlight,
    uniforms,
  ]);

  useFrame(({ size }, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    if (motionMode === 'full') {
      elapsedRef.current += Math.min(delta, 0.1);
    }
    const time = elapsedRef.current;
    const compact = size.width < 768;
    const tangent = Math.tan((58 * Math.PI) / 360);
    group.children.forEach((mesh, index) => {
      const placement = EYES[index];
      mesh.visible = !compact || placement.mobile !== undefined;
      if (!mesh.visible) {
        return;
      }
      const eye = uniforms[index];
      const halfHeight = tangent * placement.depth;
      const halfWidth = halfHeight * (size.width / size.height);
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
      mesh.rotation.set(
        0.24 + Math.sin(drift * 0.7) * 0.14,
        Math.sin(index * 1.7) * 0.35 + Math.cos(drift * 0.55) * 0.25,
        placement.tilt + Math.sin(drift * 0.7) * 0.01,
      );
      mesh.scale.setScalar(Math.min(halfHeight, halfWidth) * placement.size);
      eye.uCycle.value = (time * 0.48 + index * 0.67 + 0.4) % 3;
    });
  }, -1);

  return (
    <group
      ref={groupRef}
      name="cosmic-eyes"
      position={origin.position}
      quaternion={origin.quaternion}
    >
      {EYES.map((placement, index) => (
        <mesh
          key={placement.depth + placement.x}
          name={`cosmic-eye-${index}`}
          geometry={geometry}
          frustumCulled={false}
        >
          <shaderMaterial
            uniforms={uniforms[index]}
            vertexShader={cosmicEyeVertex}
            fragmentShader={cosmicEyeFragment}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
