import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import {
  CRYSTAL_FRAGMENT_SHADER,
  CRYSTAL_VERTEX_SHADER,
} from './crystal-field.shaders';

type CrystalFieldProps = {
  color: string;
};

const POINT_COUNT = 7000;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

type FieldGeometry = {
  positions: Float32Array;
  scales: Float32Array;
};

const buildField = (): FieldGeometry => {
  const positions = new Float32Array(POINT_COUNT * 3);
  const scales = new Float32Array(POINT_COUNT);
  for (let index = 0; index < POINT_COUNT; index++) {
    const y = 1 - (index / (POINT_COUNT - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN_ANGLE * index;
    const radius = 1 + (Math.random() - 0.5) * 0.12;
    positions[index * 3] = Math.cos(theta) * ring * radius;
    positions[index * 3 + 1] = y * radius;
    positions[index * 3 + 2] = Math.sin(theta) * ring * radius;
    scales[index] = 26 + Math.random() * 40;
  }
  return { positions, scales };
};

export default function CrystalField({ color }: CrystalFieldProps) {
  const field = useRef(buildField()).current;
  const groupRef = useRef<THREE.Group>(null);
  const uniforms = useRef({
    uTime: { value: 0 },
    uSize: { value: 1 },
    uColor: { value: new THREE.Color(color) },
  }).current;

  // REASON: advance the shader time uniform and slowly spin the mass every frame so the crystalline form churns and rotates continuously — imperative animation that React props cannot drive per frame
  useFrame((state, delta) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uColor.value.set(color);
    const group = groupRef.current;
    if (!group) {
      return;
    }
    group.rotation.y += delta * 0.06;
    group.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.12;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[field.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-aScale"
            args={[field.scales, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={CRYSTAL_VERTEX_SHADER}
          fragmentShader={CRYSTAL_FRAGMENT_SHADER}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
