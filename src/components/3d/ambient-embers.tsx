import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type AmbientEmbersParams = {
  color: string;
  count: number;
};

type EmberField = {
  positions: Float32Array;
  sizes: Float32Array;
  brights: Float32Array;
  embers: Float32Array;
  phases: Float32Array;
};

const FIELD_RADIUS = 11;
const EMBER_COLOR = '#ff8a4c';
const EMBER_RATIO = 0.16;

const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uScale;
  uniform vec3 uColorStar;
  uniform vec3 uColorEmber;
  attribute float aSize;
  attribute float aBright;
  attribute float aEmber;
  attribute float aPhase;
  varying vec3 vColor;
  varying float vBright;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    float twinkle = 0.65 + 0.35 * sin(uTime * 1.4 + aPhase);
    vBright = aBright * twinkle;
    vColor = mix(uColorStar, uColorEmber, aEmber);
    gl_PointSize = aSize * uScale / -mvPosition.z;
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vBright;

  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    float alpha = smoothstep(0.5, 0.05, dist);
    gl_FragColor = vec4(vColor * vBright, alpha);
  }
`;

const createEmberField = (count: number): EmberField => {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const brights = new Float32Array(count);
  const embers = new Float32Array(count);
  const phases = new Float32Array(count);

  for (let index = 0; index < count; index++) {
    const radius = Math.cbrt(Math.random()) * FIELD_RADIUS;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[index * 3 + 2] = radius * Math.cos(phi);

    const isEmber = Math.random() < EMBER_RATIO;
    embers[index] = isEmber ? 0.7 + Math.random() * 0.3 : 0;
    sizes[index] = isEmber
      ? 7 + Math.random() * 6
      : 2 + Math.pow(Math.random(), 2) * 8;
    brights[index] = isEmber
      ? 0.85 + Math.random() * 0.35
      : 0.4 + Math.random() * 0.6;
    phases[index] = Math.random() * Math.PI * 2;
  }

  return { positions, sizes, brights, embers, phases };
};

export default function AmbientEmbers({ color, count }: AmbientEmbersParams) {
  const pointsRef = useRef<THREE.Points>(null);
  const field = useRef(createEmberField(count)).current;
  const uniforms = useRef({
    uTime: { value: 0 },
    uScale: { value: 9 },
    uColorStar: { value: new THREE.Color(color) },
    uColorEmber: { value: new THREE.Color(EMBER_COLOR) },
  }).current;

  useFrame((state, delta) => {
    if (!pointsRef.current) {
      return;
    }

    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uColorStar.value.set(color);
    pointsRef.current.rotation.y += delta * 0.03;
    pointsRef.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[field.positions, 3]}
        />
        <bufferAttribute attach="attributes-aSize" args={[field.sizes, 1]} />
        <bufferAttribute
          attach="attributes-aBright"
          args={[field.brights, 1]}
        />
        <bufferAttribute attach="attributes-aEmber" args={[field.embers, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[field.phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
