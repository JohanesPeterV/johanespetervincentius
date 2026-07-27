import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type BinaryFieldParams = {
  color: string;
  count: number;
};

type DigitField = {
  positions: Float32Array;
  sizes: Float32Array;
  brights: Float32Array;
  glyphs: Float32Array;
  phases: Float32Array;
};

const FIELD_RADIUS = 11;
const WHITE = new THREE.Color('#ffffff');

const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uScale;
  uniform vec3 uColorDim;
  uniform vec3 uColorBright;
  attribute float aSize;
  attribute float aBright;
  attribute float aGlyph;
  attribute float aPhase;
  varying vec3 vColor;
  varying float vBright;
  varying float vGlyph;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    float shift = 0.5 + 0.5 * sin(uTime * 0.8 + aPhase * 3.0);
    vColor = mix(uColorDim, uColorBright, shift);
    float twinkle = 0.72 + 0.28 * sin(uTime * 1.0 + aPhase);
    vBright = aBright * twinkle;
    vGlyph = aGlyph;
    gl_PointSize = aSize * uScale / -mvPosition.z;
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uGlyphMap;
  varying vec3 vColor;
  varying float vBright;
  varying float vGlyph;

  void main() {
    vec2 uv = vec2(gl_PointCoord.x * 0.5 + vGlyph * 0.5, gl_PointCoord.y);
    float mask = texture2D(uGlyphMap, uv).a;
    if (mask < 0.15) {
      discard;
    }
    gl_FragColor = vec4(vColor * vBright, mask);
  }
`;

const createGlyphTexture = (): THREE.CanvasTexture => {
  const cell = 64;
  const canvas = document.createElement('canvas');
  canvas.width = cell * 2;
  canvas.height = cell;

  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#ffffff';
    context.font = `bold ${cell * 0.8}px "Courier New", monospace`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('0', cell * 0.5, cell * 0.52);
    context.fillText('1', cell * 1.5, cell * 0.52);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = false;
  return texture;
};

const createDigitField = (count: number): DigitField => {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const brights = new Float32Array(count);
  const glyphs = new Float32Array(count);
  const phases = new Float32Array(count);

  for (let index = 0; index < count; index++) {
    const radius = Math.cbrt(Math.random()) * FIELD_RADIUS;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[index * 3 + 2] = radius * Math.cos(phi);

    glyphs[index] = Math.random() < 0.5 ? 0 : 1;
    sizes[index] = 4 + Math.pow(Math.random(), 1.6) * 7;
    brights[index] = 0.16 + Math.random() * 0.24;
    phases[index] = Math.random() * Math.PI * 2;
  }

  return { positions, sizes, brights, glyphs, phases };
};

export default function BinaryField({ color, count }: BinaryFieldParams) {
  const pointsRef = useRef<THREE.Points>(null);
  const field = useRef(createDigitField(count)).current;
  const glyphTexture = useRef(createGlyphTexture()).current;
  const uniforms = useRef({
    uTime: { value: 0 },
    uScale: { value: 10 },
    uColorDim: { value: new THREE.Color(color) },
    uColorBright: { value: new THREE.Color(color) },
    uGlyphMap: { value: glyphTexture },
  }).current;

  useFrame((state, delta) => {
    if (!pointsRef.current) {
      return;
    }

    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uColorDim.value.set(color);
    uniforms.uColorBright.value.set(color).lerp(WHITE, 0.4);
    pointsRef.current.rotation.y += delta * 0.03;
    pointsRef.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
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
        <bufferAttribute attach="attributes-aGlyph" args={[field.glyphs, 1]} />
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
