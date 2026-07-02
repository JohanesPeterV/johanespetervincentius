import { BlendFunction, Effect } from 'postprocessing';
import { Uniform } from 'three';

const FRAGMENT = `
uniform float uIntensity;
uniform float uTime;

float diveHash(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
}

float diveValueNoise(vec2 point) {
  vec2 cell = floor(point);
  vec2 fraction = fract(point);
  vec2 smoothed = fraction * fraction * (3.0 - 2.0 * fraction);
  float a = diveHash(cell);
  float b = diveHash(cell + vec2(1.0, 0.0));
  float c = diveHash(cell + vec2(0.0, 1.0));
  float d = diveHash(cell + vec2(1.0, 1.0));
  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

void mainUv(inout vec2 uv) {
  float row = floor(uv.y * 28.0);
  float frame = floor(uTime * 14.0);
  float jitter = diveHash(vec2(row, frame)) - 0.5;
  float gate = step(0.72, diveHash(vec2(frame, row * 0.37)));
  uv.x += jitter * gate * uIntensity * 0.12;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float edge = smoothstep(0.32, 0.86, distance(uv, vec2(0.5)));
  float crystals = diveValueNoise(uv * 26.0 + vec2(0.0, uTime * 0.4));
  crystals += diveValueNoise(uv * 90.0) * 0.35;
  float grow = smoothstep(0.45, 1.1, crystals + edge * 0.55);
  float frostMask = clamp(edge * uIntensity * grow * 1.6, 0.0, 0.85);
  vec3 frostColor = vec3(0.87, 0.93, 1.0);
  outputColor = vec4(mix(inputColor.rgb, frostColor, frostMask), inputColor.a);
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
