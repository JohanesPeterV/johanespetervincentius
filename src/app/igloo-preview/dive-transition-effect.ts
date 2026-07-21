import { BlendFunction, Effect } from 'postprocessing';
import { Uniform } from 'three';

const FRAGMENT = `
uniform float uIntensity;
uniform float uProgress;

float diveGlitchHash(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
}

float diveGlitchNoise(float value, float seed) {
  float cell = floor(value);
  float blend = fract(value);
  blend = blend * blend * (3.0 - 2.0 * blend);
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
  float flow = phase * 10.0;
  float fracture = (diveGlitchNoise(uv.x * 14.0 + flow, 0.37) - 0.5) * 0.055;
  fracture += (diveGlitchNoise(uv.x * 34.0 - flow * 0.7, 0.61) - 0.5) * 0.018;
  front += fracture;
  float envelope = 1.0 - smoothstep(0.015, 0.12, abs(uv.y - front));
  float column = floor(uv.x * 30.0);
  float facet = diveGlitchNoise(column + phase * 4.5, 1.7);
  float slice = smoothstep(0.25, 0.82, facet) * envelope * amount;
  uv.x += (facet - 0.5) * slice * 0.05;
  uv.y += (diveGlitchNoise(column * 0.31 + phase * 3.0, 2.4) - 0.5) * slice * 0.006;
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
  float flow = phase * 10.0;
  float fracture = (diveGlitchNoise(uv.x * 14.0 + flow, 0.37) - 0.5) * 0.055;
  fracture += (diveGlitchNoise(uv.x * 34.0 - flow * 0.7, 0.61) - 0.5) * 0.018;
  front += fracture;
  float distanceToFront = abs(uv.y - front);
  float envelope = 1.0 - smoothstep(0.015, 0.12, distanceToFront);
  float core = 1.0 - smoothstep(0.0, 0.009, distanceToFront);
  float column = floor(uv.x * 30.0);
  float facet = diveGlitchNoise(column + phase * 4.5, 1.7);
  float verticalFacet = diveGlitchNoise(column * 0.31 + phase * 3.0, 2.4);
  vec2 refraction = vec2(
    (facet - 0.5) * envelope * amount * 0.038,
    (verticalFacet - 0.5) * envelope * amount * 0.006
  );
  vec3 glass = vec3(
    texture2D(inputBuffer, uv + refraction * 1.06).r,
    texture2D(inputBuffer, uv + refraction).g,
    texture2D(inputBuffer, uv + refraction * 0.94).b
  );
  float facetLight = smoothstep(0.7, 0.98, facet) * envelope * amount;
  glass = mix(glass, glass * vec3(0.72, 0.86, 1.08), 0.22);
  glass += vec3(0.58, 0.8, 1.0) * (core * 0.34 + facetLight * 0.08);
  float blend = clamp(envelope * amount * 0.58 + core * amount * 0.16, 0.0, 0.74);
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
  outputColor = vec4(mix(regimeColor, glass, blend), inputColor.a);
}
`;

export class DiveTransitionEffect extends Effect {
  constructor() {
    super('DiveTransitionEffect', FRAGMENT, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ['uIntensity', new Uniform(0)],
        ['uProgress', new Uniform(0)],
      ]),
    });
  }

  setDriveState(intensity: number, progress: number): void {
    const intensityUniform = this.uniforms.get('uIntensity');
    if (intensityUniform) {
      intensityUniform.value = intensity;
    }
    const progressUniform = this.uniforms.get('uProgress');
    if (progressUniform) {
      progressUniform.value = progress;
    }
  }
}
