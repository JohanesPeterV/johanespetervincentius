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
  float amount = pow(uIntensity, 0.6);
  float frame = floor(uTime * 12.0);
  vec2 coarseCell = floor(uv * vec2(9.0, 14.0));
  float coarseGate = step(1.0 - amount * 0.55, diveGlitchHash(coarseCell + frame));
  vec2 coarseShift = vec2(
    diveGlitchHash(coarseCell * 1.7 + frame) - 0.5,
    (diveGlitchHash(coarseCell * 2.3 + frame) - 0.5) * 0.35
  );
  vec2 fineCell = floor(uv * vec2(42.0, 64.0));
  float fineGate = step(1.0 - amount * 0.4, diveGlitchHash(fineCell + frame * 1.31));
  float fineShift = diveGlitchHash(fineCell * 3.1 + frame) - 0.5;
  uv += coarseShift * coarseGate * amount * 0.16;
  uv.x += fineShift * fineGate * amount * 0.07;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (uIntensity < 0.01) {
    outputColor = inputColor;
    return;
  }
  float amount = pow(uIntensity, 0.6);
  vec2 fromCenter = uv - vec2(0.5);
  float radial = smoothstep(0.08, 0.62, length(fromCenter));
  vec2 streakDirection = normalize(fromCenter + vec2(0.0001));
  float reach = amount * radial * 0.3;
  vec3 streaked = inputColor.rgb;
  float weightTotal = 1.0;
  for (int tap = 1; tap <= 7; tap++) {
    float along = float(tap) / 7.0;
    float weight = 1.0 - along * 0.65;
    streaked += texture2D(inputBuffer, uv + streakDirection * along * reach).rgb * weight;
    weightTotal += weight;
  }
  streaked /= weightTotal;
  vec2 split = streakDirection * amount * (0.005 + radial * 0.022);
  vec3 fringed = vec3(
    texture2D(inputBuffer, uv + split).r,
    streaked.g,
    texture2D(inputBuffer, uv - split).b
  );
  vec3 torn = mix(streaked, fringed, 0.65);
  float blend = clamp(amount * (0.45 + radial * 0.95), 0.0, 1.0);
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
