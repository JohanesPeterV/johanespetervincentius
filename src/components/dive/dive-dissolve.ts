import { BlendFunction, Effect } from 'postprocessing';
import { Color, Uniform } from 'three';

const fragmentShader = `
  uniform float transitionProgress;
  uniform float transitionStrength;
  uniform vec3 burnColor;

  float random(vec2 point) {
    point = fract(point * vec2(123.34, 345.45));
    point += dot(point, point + 34.345);
    return fract(point.x * point.y);
  }

  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);

    float bottom = mix(random(cell), random(cell + vec2(1.0, 0.0)), local.x);
    float top = mix(
      random(cell + vec2(0.0, 1.0)),
      random(cell + vec2(1.0, 1.0)),
      local.x
    );
    return mix(bottom, top, local.y);
  }

  void mainImage(
    const in vec4 inputColor,
    const in vec2 uv,
    out vec4 outputColor
  ) {
    float coarseNoise = noise(vec2(uv.x * 4.0 + time * 0.05, uv.y * 2.0));
    float fineNoise = noise(vec2(uv.x * 11.0 - time * 0.08, uv.y * 5.0));
    float threshold = uv.y + (coarseNoise - 0.5) * 0.12;
    threshold += (fineNoise - 0.5) * 0.035;

    float edge = transitionProgress - threshold;
    float sketchBand = 1.0 - smoothstep(0.025, 0.24, abs(edge));
    float luminance = dot(inputColor.rgb, vec3(0.299, 0.587, 0.114));
    float line = clamp(fwidth(luminance) * 9.0, 0.0, 1.0);
    vec3 sketch = burnColor * line + inputColor.rgb * 0.04;
    float sketchAmount = sketchBand * transitionStrength * 0.92;

    float antialias = max(fwidth(edge) * 3.0, 0.0025);
    float glow = 1.0 - smoothstep(0.0, antialias * 3.5, abs(edge));
    float flicker = 0.88 + 0.12 * sin(time * 8.0 + fineNoise * 18.0);
    vec3 color = mix(inputColor.rgb, sketch, sketchAmount);
    color += burnColor * glow * transitionStrength * flicker * 4.5;

    outputColor = vec4(color, inputColor.a);
  }
`;

export default class DiveDissolveEffect extends Effect {
  private readonly progressUniform: Uniform<number>;
  private readonly strengthUniform: Uniform<number>;

  constructor(color: string) {
    const progressUniform = new Uniform(0);
    const strengthUniform = new Uniform(0);
    const uniforms = new Map<string, Uniform<number | Color>>();
    uniforms.set('transitionProgress', progressUniform);
    uniforms.set('transitionStrength', strengthUniform);
    uniforms.set('burnColor', new Uniform(new Color(color)));
    super('DiveDissolveEffect', fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms,
    });
    this.progressUniform = progressUniform;
    this.strengthUniform = strengthUniform;
  }

  setTransition(progress: number, strength: number): void {
    this.progressUniform.value = progress;
    this.strengthUniform.value = strength;
  }
}
