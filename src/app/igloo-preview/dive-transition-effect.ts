import { BlendFunction, Effect } from 'postprocessing';
import { Uniform } from 'three';

const FRAGMENT = `
uniform float uIntensity;
uniform float uTime;
uniform float uProgress;

float diveGlitchHash(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
}

float diveGlitchNoise(float value, float seed) {
  float cell = floor(value);
  float blend = fract(value);
  return mix(
    diveGlitchHash(vec2(cell, seed)),
    diveGlitchHash(vec2(cell + 1.0, seed)),
    blend
  );
}

void mainUv(inout vec2 uv) {
  if (uIntensity < 0.01) {
    return;
  }
  float amount = smoothstep(0.02, 0.92, uIntensity);
  float phase = uProgress < 3.5
    ? clamp((uProgress - 1.92) / 0.76, 0.0, 1.0)
    : clamp((uProgress - 4.18) / 0.8, 0.0, 1.0);
  float front = mix(-0.14, 1.14, phase);
  float fractureFrame = floor(uTime * 10.0);
  float fracture = (diveGlitchNoise(uv.x * 18.0, fractureFrame * 0.37) - 0.5) * 0.07;
  fracture += (diveGlitchNoise(uv.x * 47.0, fractureFrame * 0.61) - 0.5) * 0.022;
  front += fracture;
  float envelope = 1.0 - smoothstep(0.02, 0.16, abs(uv.y - front));
  float frame = floor(uTime * 16.0);
  float row = floor(uv.y * 38.0);
  float rowNoise = diveGlitchHash(vec2(row, frame));
  float slice = step(0.38, rowNoise) * envelope * amount;
  uv.x += (rowNoise - 0.5) * slice * 0.11;
  uv.y += (diveGlitchHash(vec2(row * 0.37, frame)) - 0.5) * slice * 0.012;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (uIntensity < 0.01) {
    outputColor = inputColor;
    return;
  }
  float amount = smoothstep(0.02, 0.92, uIntensity);
  float phase = uProgress < 3.5
    ? clamp((uProgress - 1.92) / 0.76, 0.0, 1.0)
    : clamp((uProgress - 4.18) / 0.8, 0.0, 1.0);
  float front = mix(-0.14, 1.14, phase);
  float fractureFrame = floor(uTime * 10.0);
  float fracture = (diveGlitchNoise(uv.x * 18.0, fractureFrame * 0.37) - 0.5) * 0.07;
  fracture += (diveGlitchNoise(uv.x * 47.0, fractureFrame * 0.61) - 0.5) * 0.022;
  front += fracture;
  float distanceToFront = abs(uv.y - front);
  float envelope = 1.0 - smoothstep(0.018, 0.16, distanceToFront);
  float core = 1.0 - smoothstep(0.0, 0.022, distanceToFront);
  float frame = floor(uTime * 16.0);
  float row = floor(uv.y * 38.0);
  float rowNoise = diveGlitchHash(vec2(row, frame));
  float reach = envelope * amount * (0.012 + rowNoise * 0.045);
  vec3 shredded = inputColor.rgb * 0.42;
  float weightTotal = 0.42;
  for (int tap = -3; tap <= 3; tap++) {
    float along = float(tap) / 3.0;
    float weight = 1.0 - abs(along) * 0.68;
    vec2 offset = vec2(along * reach, along * reach * 0.08);
    shredded += texture2D(inputBuffer, uv + offset).rgb * weight;
    weightTotal += weight;
  }
  shredded /= weightTotal;
  vec2 split = vec2(reach * 0.16 + core * 0.008, core * 0.002);
  vec3 fringed = vec3(
    texture2D(inputBuffer, uv + split).r,
    shredded.g,
    texture2D(inputBuffer, uv - split).b
  );
  float sparkle = step(0.92, diveGlitchHash(vec2(floor(uv.x * 28.0), row + frame)));
  vec3 torn = mix(shredded, fringed, 0.78);
  torn += vec3(0.58, 0.8, 1.0) * core * amount * (0.64 + sparkle * 0.32);
  float blend = clamp(envelope * amount * 0.84 + core * amount * 0.16, 0.0, 0.92);
  float revealed = 1.0 - smoothstep(front - 0.045, front + 0.045, uv.y);
  vec3 regimeColor = inputColor.rgb;
  if (uProgress < 3.5) {
    regimeColor = mix(
      inputColor.rgb,
      inputColor.rgb * vec3(0.5, 0.64, 0.82),
      revealed * amount * 0.56
    );
  } else {
    regimeColor = mix(
      inputColor.rgb,
      vec3(0.84, 0.93, 1.0),
      revealed * amount * 0.24
    );
  }
  outputColor = vec4(mix(regimeColor, torn, blend), inputColor.a);
}
`;

export class DiveTransitionEffect extends Effect {
  constructor() {
    super('DiveTransitionEffect', FRAGMENT, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ['uIntensity', new Uniform(0)],
        ['uTime', new Uniform(0)],
        ['uProgress', new Uniform(0)],
      ]),
    });
  }

  setDriveState(intensity: number, time: number, progress: number): void {
    const intensityUniform = this.uniforms.get('uIntensity');
    if (intensityUniform) {
      intensityUniform.value = intensity;
    }
    const timeUniform = this.uniforms.get('uTime');
    if (timeUniform) {
      timeUniform.value = time;
    }
    const progressUniform = this.uniforms.get('uProgress');
    if (progressUniform) {
      progressUniform.value = progress;
    }
  }
}
