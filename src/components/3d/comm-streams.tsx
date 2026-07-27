import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import {
  AGENT_ORBIT_PATHS,
  ORBIT_CENTER,
  writeOrbitPosition,
  type OrbitPath,
} from './orbit';

type CommStreamsParams = {
  color: string;
};

type Packet = {
  pathIndex: number;
  progress: number;
  speed: number;
  flow: number;
  glow: number;
};

type PacketField = {
  packets: Packet[];
  positions: Float32Array;
  sizes: Float32Array;
  brights: Float32Array;
};

const PACKETS_PER_PATH = 5;
const WHITE = new THREE.Color('#ffffff');

const VERTEX_SHADER = `
  uniform float uScale;
  attribute float aSize;
  attribute float aBright;
  varying float vBright;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    vBright = aBright;
    gl_PointSize = aSize * uScale / -mvPosition.z;
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 uColorDim;
  uniform vec3 uColorBright;
  varying float vBright;

  void main() {
    vec2 offset = gl_PointCoord - vec2(0.5);
    float dist = length(offset);
    float halo = smoothstep(0.5, 0.0, dist);
    if (halo < 0.02) {
      discard;
    }
    float core = smoothstep(0.22, 0.0, dist);
    vec3 col = mix(uColorDim, uColorBright, clamp(vBright + core, 0.0, 1.0));
    gl_FragColor = vec4(col, (halo * 0.55 + core) * vBright);
  }
`;

// REASON: packets alternate travel direction per slot so each lane reads as data flowing both into and out of the core
const createPacketField = (paths: readonly OrbitPath[]): PacketField => {
  const total = paths.length * PACKETS_PER_PATH;
  const packets: Packet[] = [];
  const positions = new Float32Array(total * 3);
  const sizes = new Float32Array(total);
  const brights = new Float32Array(total);

  for (let pathIndex = 0; pathIndex < paths.length; pathIndex++) {
    for (let slot = 0; slot < PACKETS_PER_PATH; slot++) {
      const index = pathIndex * PACKETS_PER_PATH + slot;
      const size = 16 + Math.random() * 26;
      const flow = slot % 2 === 0 ? 1 : -1;

      packets.push({
        pathIndex,
        progress: Math.random(),
        speed: 0.12 + Math.random() * 0.2,
        flow,
        glow: 0.45 + Math.random() * 0.55,
      });
      sizes[index] = size;
    }
  }

  return { packets, positions, sizes, brights };
};

export default function CommStreams({ color }: CommStreamsParams) {
  const pointsRef = useRef<THREE.Points>(null);
  const field = useRef(createPacketField(AGENT_ORBIT_PATHS)).current;
  const uniforms = useRef({
    uScale: { value: 9 },
    uColorDim: { value: new THREE.Color(color) },
    uColorBright: { value: new THREE.Color(color) },
  }).current;
  const bodyPositions = useRef(
    AGENT_ORBIT_PATHS.map(() => new THREE.Vector3()),
  ).current;

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) {
      return;
    }

    const time = state.clock.elapsedTime;
    uniforms.uColorDim.value.set(color);
    uniforms.uColorBright.value.set(color).lerp(WHITE, 0.4);

    const { packets, positions, brights } = field;
    for (let p = 0; p < AGENT_ORBIT_PATHS.length; p++) {
      writeOrbitPosition(AGENT_ORBIT_PATHS[p], time, bodyPositions[p]);
    }

    for (let i = 0; i < packets.length; i++) {
      const packet = packets[i];
      const body = bodyPositions[packet.pathIndex];

      packet.progress += packet.speed * delta;
      if (packet.progress > 1) {
        packet.progress -= 1;
      }

      let frac = packet.progress;
      if (packet.flow < 0) {
        frac = 1 - packet.progress;
      }

      positions[i * 3] = ORBIT_CENTER[0] + (body.x - ORBIT_CENTER[0]) * frac;
      positions[i * 3 + 1] =
        ORBIT_CENTER[1] + (body.y - ORBIT_CENTER[1]) * frac;
      positions[i * 3 + 2] =
        ORBIT_CENTER[2] + (body.z - ORBIT_CENTER[2]) * frac;

      const fade = Math.sin(packet.progress * Math.PI);
      const twinkle =
        0.74 + 0.26 * Math.sin(time * 1.8 + packet.glow * Math.PI * 2);
      brights[i] = packet.glow * fade * twinkle;
    }

    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.aBright.needsUpdate = true;
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
