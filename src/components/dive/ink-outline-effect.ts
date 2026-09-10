import { BlendFunction, Effect, EffectAttribute } from 'postprocessing';
import { Color, Uniform } from 'three';

// REASON: a print is drawn before it is coloured. Silhouettes are depth jumps
// between neighbours; creases are where depth stops changing linearly.
const inkOutlineFragment = `
  uniform vec3 uInk;

  float inkDistance(vec2 uv) {
    return -getViewZ(readDepth(uv));
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 texel = texelSize * 1.5;
    float here = inkDistance(uv);
    float left = inkDistance(uv - vec2(texel.x, 0.0));
    float right = inkDistance(uv + vec2(texel.x, 0.0));
    float down = inkDistance(uv - vec2(0.0, texel.y));
    float up = inkDistance(uv + vec2(0.0, texel.y));
    float nearest = min(here, min(min(left, right), min(down, up)));
    float jump = max(max(here - left, here - right), max(here - down, here - up)) / nearest;
    float crease = (abs(left + right - 2.0 * here) + abs(down + up - 2.0 * here)) / nearest;
    float line = smoothstep(0.03, 0.08, jump) + smoothstep(0.02, 0.05, crease);
    // REASON: stars sit at the far plane; the sky is left blank, only bodies are drawn.
    line *= 1.0 - step(cameraFar * 0.9, nearest);
    outputColor = vec4(mix(inputColor.rgb, uInk, clamp(line, 0.0, 1.0)), inputColor.a);
  }
`;

export default class InkOutlineEffect extends Effect {
  readonly ink = new Color();

  constructor() {
    super('InkOutline', inkOutlineFragment, {
      blendFunction: BlendFunction.NORMAL,
      attributes: EffectAttribute.DEPTH,
    });
    this.uniforms.set('uInk', new Uniform(this.ink));
  }
}
