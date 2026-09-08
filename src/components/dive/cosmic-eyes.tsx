'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Color, Group, MathUtils, Vector3 } from 'three';

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
  yaw: number;
  variant: 'primary' | 'secondary';
  mobile: [number, number];
};

const EYES: EyePlacement[] = [
  {
    x: -0.78,
    y: 0.66,
    size: 0.05,
    depth: 28,
    tilt: -0.025,
    yaw: 0.18,
    variant: 'primary',
    mobile: [0.8, 0.77],
  },
  {
    x: 0.86,
    y: -0.12,
    size: 0.034,
    depth: 54,
    tilt: -0.02,
    yaw: -0.22,
    variant: 'secondary',
    mobile: [0.76, -0.77],
  },
  {
    x: 0.14,
    y: 0.86,
    size: 0.074,
    depth: 25,
    tilt: 0.02,
    yaw: 0.12,
    variant: 'secondary',
    mobile: [-0.14, 0.77],
  },
  {
    x: -0.8,
    y: -0.08,
    size: 0.052,
    depth: 35,
    tilt: 0.015,
    yaw: 0.2,
    variant: 'secondary',
    mobile: [-0.9, -0.25],
  },
  {
    x: -0.4,
    y: 0.85,
    size: 0.028,
    depth: 62,
    tilt: -0.015,
    yaw: -0.18,
    variant: 'primary',
    mobile: [-0.76, 0.8],
  },
  {
    x: 0.72,
    y: 0.52,
    size: 0.032,
    depth: 46,
    tilt: 0.04,
    yaw: -0.16,
    variant: 'primary',
    mobile: [0.92, 0.05],
  },
];

export default function CosmicEyes({ palette, motionMode }: CosmicEyesParams) {
  const groupRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const cameraTargetRef = useRef(new Vector3());
  const [origin] = useState(createSpaceOrigin);
  const [geometry] = useState(createCosmicEyeGeometry);
  const [uniforms] = useState(() =>
    EYES.map(() => ({
      uOutline: { value: new Color() },
      uColor: { value: new Color() },
      uLight: { value: new Color() },
      uDark: { value: new Color() },
      uCycle: { value: 0.4 },
      uBlink: { value: 0 },
    })),
  );

  // REASON: the eyes share this GPU geometry, so its owner must dispose it once on unmount.
  useEffect(() => () => geometry.dispose(), [geometry]);

  // REASON: persistent Three.js uniforms need theme updates without reparsing CSS colours every frame.
  useEffect(() => {
    uniforms.forEach((eye, index) => {
      const primaryFill = EYES[index].variant === 'primary';
      eye.uOutline.value.set(primaryFill ? palette.highlight : palette.accent);
      eye.uColor.value.set(primaryFill ? palette.accent : palette.highlight);
      eye.uLight.value.set(palette.sunlight);
      eye.uDark.value.set(palette.shadowInk).lerp(eye.uLight.value, 0.012);
    });
  }, [
    palette.accent,
    palette.highlight,
    palette.shadowInk,
    palette.sunlight,
    uniforms,
  ]);

  useFrame(({ camera, size }, delta) => {
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
    camera.getWorldPosition(cameraTargetRef.current);
    group.children.forEach((mesh, index) => {
      const placement = EYES[index];
      const eye = uniforms[index];
      const halfHeight = tangent * placement.depth;
      const halfWidth = halfHeight * (size.width / size.height);
      const drift = time * 0.08 + index * 1.7;
      let x = placement.x;
      let y = placement.y;
      if (compact) {
        [x, y] = placement.mobile;
      }
      mesh.position.set(
        (x + Math.sin(drift) * 0.006) * halfWidth,
        (y + Math.cos(drift) * 0.006) * halfHeight,
        -placement.depth,
      );
      mesh.lookAt(cameraTargetRef.current);
      mesh.rotateY(placement.yaw + Math.sin(drift * 0.65) * 0.035);
      mesh.rotateX(-0.12 + Math.cos(drift * 0.5) * 0.025);
      mesh.rotateZ(placement.tilt + Math.sin(drift * 0.7) * 0.01);
      const scale = Math.min(halfHeight, halfWidth) * placement.size;
      mesh.scale.setScalar(scale * (compact ? 1.25 : 1));
      // REASON: dark and coloured centres linger; the bright disk passes quickly without interrupting expansion.
      const cycleTime = (time + index * 1.79 + 0.92) % 8;
      let band = 0;
      let expansion = cycleTime / 3.2;
      if (cycleTime >= 7) {
        band = 2;
        expansion = cycleTime - 7;
      } else if (cycleTime >= 3.2) {
        band = 1;
        expansion = (cycleTime - 3.2) / 3.8;
      }
      const radius =
        0.38 * MathUtils.smoothstep(expansion, 0, 0.7) +
        0.62 * MathUtils.smoothstep(expansion, 0.7, 1);
      eye.uCycle.value = band + radius;
      const blinkInterval = 6.2 + index * 1.13;
      const blinkTime = time + 1 + index * 1.73;
      const blinkPhase = blinkTime % blinkInterval;
      let blink =
        MathUtils.smoothstep(blinkPhase, 0, 0.075) -
        MathUtils.smoothstep(blinkPhase, 0.11, 0.32);
      if ((Math.floor(blinkTime / blinkInterval) + index) % 4 === 3) {
        blink +=
          MathUtils.smoothstep(blinkPhase, 0.42, 0.49) -
          MathUtils.smoothstep(blinkPhase, 0.52, 0.76);
      }
      eye.uBlink.value = motionMode === 'reduced' ? 0 : blink;
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
