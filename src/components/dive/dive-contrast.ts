import { BlendFunction, Effect } from 'postprocessing';
import { SRGBColorSpace } from 'three';

const fragment = `
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 graded = (inputColor.rgb - 0.015 - 0.5) / 0.88 + 0.5;
  outputColor = vec4(max(graded, 0.0), inputColor.a);
}
`;

export default class DiveContrastEffect extends Effect {
  constructor() {
    super('DiveContrast', fragment, { blendFunction: BlendFunction.NORMAL });
    // REASON: contrast pushes the black floor negative. Clamp in display space
    // before the compositor converts it to linear, or fractional powers produce
    // NaN channels that contaminate the saved frame and its outline derivatives.
    this.inputColorSpace = SRGBColorSpace;
    this.outputColorSpace = SRGBColorSpace;
  }
}
