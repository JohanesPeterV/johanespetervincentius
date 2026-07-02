import {
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  FloatType,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  PlaneGeometry,
  Points,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  WebGLRenderTarget,
  WebGLRenderer,
} from 'three';

import { createSeededRandom } from './world-layout';

export type SnowSimulation = {
  simScene: Scene;
  simCamera: OrthographicCamera;
  simMaterial: ShaderMaterial;
  drawMaterial: ShaderMaterial;
  initialTexture: DataTexture;
  targets: [WebGLRenderTarget, WebGLRenderTarget];
  points: Points;
  frame: number;
};

export type SnowFrameInput = {
  gl: WebGLRenderer;
  time: number;
  delta: number;
  cameraY: number;
  rush: number;
};

export const SNOW_TEXTURE_SIZE = 128;

const SIM_VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const SIM_FRAGMENT = `
uniform sampler2D uPositions;
uniform float uTime;
uniform float uDelta;
uniform float uCameraY;
uniform float uRush;
varying vec2 vUv;

void main() {
  vec4 data = texture2D(uPositions, vUv);
  vec3 particle = data.xyz;
  float seed = data.w;
  float fall = 1.2 + seed * 2.2;
  particle.y -= fall * uDelta;
  float sway = uTime * (0.35 + seed * 0.4) + seed * 40.0;
  float agitation = 0.6 + uRush * 3.0;
  particle.x += sin(sway) * uDelta * agitation;
  particle.z += cos(sway * 0.8) * uDelta * agitation;
  if (particle.y < uCameraY - 45.0) {
    particle.y += 90.0;
  }
  if (particle.y > uCameraY + 45.0) {
    particle.y -= 90.0;
  }
  if (particle.x > 48.0) {
    particle.x -= 96.0;
  }
  if (particle.x < -48.0) {
    particle.x += 96.0;
  }
  if (particle.z > 64.0) {
    particle.z -= 96.0;
  }
  if (particle.z < -32.0) {
    particle.z += 96.0;
  }
  gl_FragColor = vec4(particle, seed);
}
`;

const DRAW_VERTEX = `
uniform sampler2D uPositions;
uniform float uSize;
attribute vec2 aReference;
varying float vSeed;

void main() {
  vec4 data = texture2D(uPositions, aReference);
  vSeed = data.w;
  vec4 mvPosition = modelViewMatrix * vec4(data.xyz, 1.0);
  gl_PointSize = uSize * (0.5 + data.w * 0.8) * (24.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const DRAW_FRAGMENT = `
varying float vSeed;

void main() {
  vec2 offset = gl_PointCoord - vec2(0.5);
  float distanceToCenter = length(offset);
  float alpha = smoothstep(0.5, 0.12, distanceToCenter) * 0.75;
  if (alpha < 0.02) {
    discard;
  }
  gl_FragColor = vec4(0.92, 0.96, 1.0, alpha);
}
`;

const buildInitialTexture = (): DataTexture => {
  const random = createSeededRandom(53);
  const count = SNOW_TEXTURE_SIZE * SNOW_TEXTURE_SIZE;
  const data = new Float32Array(count * 4);
  for (let index = 0; index < count; index++) {
    data[index * 4] = (random() - 0.5) * 96;
    data[index * 4 + 1] = -85 + random() * 130;
    data[index * 4 + 2] = 16 + (random() - 0.5) * 96;
    data[index * 4 + 3] = random();
  }
  const texture = new DataTexture(
    data,
    SNOW_TEXTURE_SIZE,
    SNOW_TEXTURE_SIZE,
    RGBAFormat,
    FloatType,
  );
  texture.needsUpdate = true;
  return texture;
};

const buildTarget = (): WebGLRenderTarget => {
  return new WebGLRenderTarget(SNOW_TEXTURE_SIZE, SNOW_TEXTURE_SIZE, {
    type: FloatType,
    format: RGBAFormat,
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
  });
};

const buildDrawGeometry = (): BufferGeometry => {
  const count = SNOW_TEXTURE_SIZE * SNOW_TEXTURE_SIZE;
  const geometry = new BufferGeometry();
  const references = new Float32Array(count * 2);
  for (let index = 0; index < count; index++) {
    references[index * 2] = (index % SNOW_TEXTURE_SIZE) / SNOW_TEXTURE_SIZE;
    references[index * 2 + 1] =
      Math.floor(index / SNOW_TEXTURE_SIZE) / SNOW_TEXTURE_SIZE;
  }
  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(count * 3), 3),
  );
  geometry.setAttribute('aReference', new BufferAttribute(references, 2));
  return geometry;
};

export const createSnowSimulation = (): SnowSimulation => {
  const initialTexture = buildInitialTexture();
  const simMaterial = new ShaderMaterial({
    uniforms: {
      uPositions: { value: initialTexture },
      uTime: { value: 0 },
      uDelta: { value: 0 },
      uCameraY: { value: 0 },
      uRush: { value: 0 },
    },
    vertexShader: SIM_VERTEX,
    fragmentShader: SIM_FRAGMENT,
    depthTest: false,
    depthWrite: false,
  });
  const simScene = new Scene();
  simScene.add(new Mesh(new PlaneGeometry(2, 2), simMaterial));
  const simCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const drawMaterial = new ShaderMaterial({
    uniforms: {
      uPositions: { value: initialTexture },
      uSize: { value: 3 },
    },
    vertexShader: DRAW_VERTEX,
    fragmentShader: DRAW_FRAGMENT,
    transparent: true,
    depthWrite: false,
  });
  const points = new Points(buildDrawGeometry(), drawMaterial);
  points.frustumCulled = false;
  return {
    simScene,
    simCamera,
    simMaterial,
    drawMaterial,
    initialTexture,
    targets: [buildTarget(), buildTarget()],
    points,
    frame: 0,
  };
};

export const stepSnowSimulation = (
  simulation: SnowSimulation,
  input: SnowFrameInput,
): void => {
  const readIndex = simulation.frame % 2;
  const writeIndex = (simulation.frame + 1) % 2;
  const source =
    simulation.frame === 0
      ? simulation.initialTexture
      : simulation.targets[readIndex].texture;
  simulation.simMaterial.uniforms.uPositions.value = source;
  simulation.simMaterial.uniforms.uTime.value = input.time;
  simulation.simMaterial.uniforms.uDelta.value = input.delta;
  simulation.simMaterial.uniforms.uCameraY.value = input.cameraY;
  simulation.simMaterial.uniforms.uRush.value = input.rush;
  const previousTarget = input.gl.getRenderTarget();
  input.gl.setRenderTarget(simulation.targets[writeIndex]);
  input.gl.render(simulation.simScene, simulation.simCamera);
  input.gl.setRenderTarget(previousTarget);
  simulation.drawMaterial.uniforms.uPositions.value =
    simulation.targets[writeIndex].texture;
  simulation.frame += 1;
};
