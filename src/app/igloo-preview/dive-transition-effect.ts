import { BlendFunction, Effect } from 'postprocessing';
import { Uniform } from 'three';

const FRAGMENT = `
uniform float uIntensity;
uniform float uTime;

float diveGlitchHash(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
}

void mainUv(inout vec2 uv) {
  if (uIntensity < 0.01) {
    return;
  }
  float amount = smoothstep(0.02, 0.92, uIntensity);
  float frame = floor(uTime * 18.0);
  float band = floor(uv.y * 34.0);
  float bandNoise = diveGlitchHash(vec2(band, frame));
  float bandGate = step(1.0 - amount * 0.72, bandNoise);
  float bandShift = (bandNoise - 0.5) * amount * 0.34;
  vec2 shardCell = floor(uv * vec2(13.0, 22.0));
  float shardNoise = diveGlitchHash(shardCell + vec2(frame, -frame * 0.37));
  float shardGate = step(1.0 - amount * 0.58, shardNoise);
  float direction = step(0.5, diveGlitchHash(vec2(band * 0.17, frame * 0.31))) * 2.0 - 1.0;
  uv.x += bandShift * bandGate;
  uv.x += direction * shardGate * amount * 0.09;
  uv.y += (shardNoise - 0.5) * shardGate * amount * 0.045;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (uIntensity < 0.01) {
    outputColor = inputColor;
    return;
  }
  float amount = smoothstep(0.02, 0.92, uIntensity);
  float frame = floor(uTime * 18.0);
  float band = floor(uv.y * 34.0);
  float bandNoise = diveGlitchHash(vec2(band, frame));
  float bandGate = step(1.0 - amount * 0.72, bandNoise);
  float reach = amount * (0.025 + bandGate * 0.16);
  vec3 shredded = inputColor.rgb * 0.28;
  float weightTotal = 0.28;
  for (int tap = -4; tap <= 4; tap++) {
    float along = float(tap) / 4.0;
    float weight = 1.0 - abs(along) * 0.62;
    vec2 offset = vec2(along * reach, along * reach * 0.08);
    shredded += texture2D(inputBuffer, uv + offset).rgb * weight;
    weightTotal += weight;
  }
  shredded /= weightTotal;
  vec2 split = vec2(amount * (0.006 + bandGate * 0.024), amount * 0.002);
  vec3 fringed = vec3(
    texture2D(inputBuffer, uv + split).r,
    shredded.g,
    texture2D(inputBuffer, uv - split).b
  );
  vec2 grid = fract(uv * vec2(13.0, 22.0));
  float edge = 1.0 - smoothstep(0.0, 0.085, min(min(grid.x, 1.0 - grid.x), min(grid.y, 1.0 - grid.y)));
  float shardNoise = diveGlitchHash(floor(uv * vec2(13.0, 22.0)) + frame);
  float shardGate = step(1.0 - amount * 0.52, shardNoise);
  float fracture = edge * shardGate * amount;
  vec3 torn = mix(shredded, fringed, 0.76);
  torn += vec3(0.56, 0.78, 0.94) * fracture * 0.72;
  float whiteFlash = step(0.965, diveGlitchHash(vec2(band, frame * 1.71))) * bandGate;
  torn = mix(torn, vec3(0.82, 0.92, 1.0), whiteFlash * amount * 0.36);
  float blend = clamp(amount * (0.42 + bandGate * 0.5 + shardGate * 0.28), 0.0, 1.0);
  outputColor = vec4(mix(inputColor.rgb, torn, blend), inputColor.a);
}
`;

export class DiveTransitionEffect extends Effect {
  constructor() {
    super('DiveTransitionEffect', FRAGMENT, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ['uIntensity', new Uniform(0)],
        ['uTime', new Uniform(0)],
      ]),
    });
  }

  setDriveState(intensity: number, time: number): void {
    const intensityUniform = this.uniforms.get('uIntensity');
    if (intensityUniform) {
      intensityUniform.value = intensity;
    }
    const timeUniform = this.uniforms.get('uTime');
    if (timeUniform) {
      timeUniform.value = time;
    }
  }
}
