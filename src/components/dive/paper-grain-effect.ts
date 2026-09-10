import { BlendFunction, Effect } from 'postprocessing';

// REASON: paper is a static substrate, so the grain never animates and is
// keyed to device pixels: a mottle of fibres under a fine speckle of tooth.
const paperGrainFragment = `
  float paperHash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float paperNoise(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(paperHash(cell), paperHash(cell + vec2(1.0, 0.0)), f.x),
               mix(paperHash(cell + vec2(0.0, 1.0)), paperHash(cell + 1.0), f.x), f.y);
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 pixel = uv * resolution;
    float fibre = paperNoise(pixel * vec2(0.09, 0.35)) - 0.5;
    float tooth = paperHash(floor(pixel)) - 0.5;
    float grain = 1.0 + fibre * 0.10 + tooth * 0.06;
    outputColor = vec4(inputColor.rgb * grain, inputColor.a);
  }
`;

export default class PaperGrainEffect extends Effect {
  constructor() {
    super('PaperGrain', paperGrainFragment, {
      blendFunction: BlendFunction.NORMAL,
    });
  }
}
