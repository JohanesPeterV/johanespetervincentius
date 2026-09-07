'use client';

import { useFrame } from '@react-three/fiber';
import { RefObject, useEffect, useRef, useState } from 'react';
import { Color, DoubleSide, Group, MathUtils, PerspectiveCamera } from 'three';

import type { MotionMode } from './descent';
import { PROJECT_STONE, TECH_STONE } from './descent';
import type { DivePalette } from './dive-palette';

type OrbitalRealityParams = {
  palette: DivePalette;
  progressRef: RefObject<number>;
  motionMode: MotionMode;
  gpuTier: number;
};

const planetVertex = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const planetFragment = `
  uniform vec3 uAccent;
  uniform vec3 uHighlight;
  uniform vec3 uBackground;
  uniform vec3 uForeground;
  varying vec3 vPosition;
  varying vec3 vNormal;
  void main() {
    vec3 normal = normalize(vNormal);
    float latitude = vPosition.y + 0.045 * sin(vPosition.x * 12.0);
    float band = step(0.76, fract(latitude * 4.0));
    vec3 color = mix(uHighlight, uAccent, band);
    float stripe = 1.0 - step(0.012, abs(latitude + 0.06));
    color = mix(color, uForeground, stripe * 0.9);
    float light = dot(normal, normalize(vec3(-0.72, 0.48, 0.5)));
    float shadow = 1.0 - smoothstep(-0.07, -0.035, light);
    color = mix(color, mix(uBackground, uHighlight, 0.08), shadow);
    float rim = 1.0 - smoothstep(0.04, 0.095, normal.z);
    color = mix(color, uHighlight, rim);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

const ringFragment = `
  uniform vec3 uAccent;
  uniform vec3 uHighlight;
  uniform vec3 uForeground;
  varying vec3 vPosition;
  void main() {
    float radius = length(vPosition.xy);
    float gap = step(0.713, radius) * (1.0 - step(0.737, radius));
    if (gap > 0.5) {
      discard;
    }
    float bands = step(0.76, fract(radius * 18.0));
    vec3 color = mix(uHighlight, uAccent, bands);
    color = mix(color, uForeground, step(0.869, radius) * 0.82);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

const DEBRIS = [
  { x: 0.87, y: 0.76, size: 0.044, depth: -0.18 },
  { x: 0.93, y: -0.55, size: 0.072, depth: -0.08 },
  { x: -0.7, y: -0.75, size: 0.037, depth: -0.12 },
  { x: 0.43, y: -0.9, size: 0.025, depth: -0.28 },
];

export default function OrbitalReality({
  palette,
  progressRef,
  motionMode,
  gpuTier,
}: OrbitalRealityParams) {
  const groupRef = useRef<Group>(null);
  const planetRef = useRef<Group>(null);
  const debrisRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const [uniforms] = useState(() => ({
    uAccent: { value: new Color(palette.accent) },
    uHighlight: { value: new Color(palette.highlight) },
    uBackground: { value: new Color(palette.background) },
    uForeground: { value: new Color(palette.foreground) },
  }));
  const segments = gpuTier < 2 ? 64 : 128;

  // REASON: the persistent shader uniforms must follow palette changes
  // without reparsing CSS colours inside the animation loop.
  useEffect(() => {
    uniforms.uAccent.value.set(palette.accent);
    uniforms.uHighlight.value.set(palette.highlight);
    uniforms.uBackground.value.set(palette.background);
    uniforms.uForeground.value.set(palette.foreground);
  }, [
    palette.accent,
    palette.highlight,
    palette.background,
    palette.foreground,
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
    const halfHeight = Math.tan(MathUtils.degToRad(camera.fov * 0.5)) * 58;
    group.position.copy(camera.position);
    group.quaternion.copy(camera.quaternion);
    group.translateZ(-58);
    group.scale.set(halfHeight, halfHeight, halfHeight * 0.35);
    if (planetRef.current) {
      // REASON: work and project copy occupy the right side. Cross above the
      // reading area into a cropped edge, leaving the central skill labels clear.
      const travel = MathUtils.smoothstep(
        progressRef.current,
        PROJECT_STONE.center,
        TECH_STONE.center - 0.2,
      );
      const compact = size.width < 768;
      const rightEdge = 0.72 + 0.88 / camera.aspect;
      const x = compact ? 0.78 : MathUtils.lerp(-0.88, rightEdge, travel);
      const y = compact
        ? 1.18
        : MathUtils.lerp(0.65, 0.2, travel) + Math.sin(travel * Math.PI) * 1.15;
      planetRef.current.position.set(x * camera.aspect, y, 0);
      planetRef.current.scale.setScalar(compact ? 0.5 : 1);
      planetRef.current.rotation.z = -0.25 + Math.sin(time * 0.06) * 0.025;
    }
    debrisRef.current?.children.forEach((mesh, index) => {
      const debris = DEBRIS[index];
      mesh.position.set(
        debris.x * camera.aspect,
        debris.y + Math.sin(time * 0.1 + index) * 0.018,
        debris.depth,
      );
      mesh.rotation.set(index * 0.7 + time * 0.035, index + time * 0.025, 0.3);
    });
  }, -1);

  return (
    <group ref={groupRef}>
      <group ref={planetRef}>
        <mesh>
          <sphereGeometry args={[0.51, segments, segments / 2]} />
          <shaderMaterial
            uniforms={uniforms}
            vertexShader={planetVertex}
            fragmentShader={planetFragment}
            toneMapped={false}
          />
        </mesh>
        <mesh rotation={[1.12, 0.16, -0.16]}>
          <ringGeometry args={[0.62, 0.88, segments]} />
          <shaderMaterial
            uniforms={uniforms}
            vertexShader={planetVertex}
            fragmentShader={ringFragment}
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>
      </group>
      <mesh position={[-0.8, 0.25, -0.4]} rotation={[0.9, -0.35, -0.6]}>
        <torusGeometry args={[1.63, 0.0025, 3, segments]} />
        <meshBasicMaterial
          color={palette.highlight}
          transparent
          opacity={0.42}
          toneMapped={false}
          fog={false}
        />
      </mesh>
      <mesh position={[0.95, -0.78, -0.7]} rotation={[0.92, 0.24, 0.48]}>
        <torusGeometry args={[1.25, 0.002, 3, segments]} />
        <meshBasicMaterial
          color={palette.accent}
          transparent
          opacity={0.32}
          toneMapped={false}
          fog={false}
        />
      </mesh>
      <group ref={debrisRef}>
        {DEBRIS.map((debris, index) => (
          <mesh key={debris.x} scale={debris.size}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? palette.accent : palette.highlight}
              roughness={1}
              metalness={0}
              flatShading
              toneMapped={false}
              fog={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
