import {
  BlendFunction,
  CopyPass,
  Effect,
  EffectAttribute,
} from 'postprocessing';
import { Color, HalfFloatType, Uniform } from 'three';
import type { Texture, WebGLRenderer, WebGLRenderTarget } from 'three';

import { HANDOFF_START } from './hero-handoff';
import type { HeroHandoff } from './hero-handoff';
import { heroHandoffFragment } from './hero-handoff-shader';

export default class HeroHandoffEffect extends Effect {
  readonly ink = new Color();
  readonly paper = new Color();
  private readonly copy = new CopyPass();
  private readonly active = new Uniform(0);
  private readonly progress = new Uniform(0);
  private readonly aspect = new Uniform(1);
  private readonly hero = new Uniform<Texture | null>(null);
  private readonly work = new Uniform<Texture | null>(null);

  constructor(private readonly handoff: HeroHandoff) {
    super('HeroHandoff', heroHandoffFragment, {
      blendFunction: BlendFunction.NORMAL,
      // REASON: this kernel samples a saved frame and neighbouring UVs, so it
      // needs its own pass after the world's colour grade, not a merged effect.
      attributes: EffectAttribute.CONVOLUTION,
    });
    handoff.sourceReady = false;
    this.uniforms.set('uHeroScene', new Uniform(this.copy.texture));
    this.uniforms.set('uHeroContent', this.hero);
    this.uniforms.set('uWorkContent', this.work);
    this.uniforms.set('uWorkRect', new Uniform(handoff.workRect));
    this.uniforms.set('uProgress', this.progress);
    this.uniforms.set('uActive', this.active);
    this.uniforms.set('uAspect', this.aspect);
    this.uniforms.set('uInk', new Uniform(this.ink));
    this.uniforms.set('uPaper', new Uniform(this.paper));
  }

  initialize(renderer: WebGLRenderer): void {
    this.copy.initialize(renderer, false, HalfFloatType);
  }

  update(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget): void {
    const handoff = this.handoff;
    // REASON: retain the outgoing frame across the entire crossing, including
    // reversals. Capturing the incoming frame would turn the dissolve into a wipe
    // over itself. Resizing only here also preserves the source mid-gesture.
    if (handoff.journey <= HANDOFF_START) {
      this.copy.setSize(inputBuffer.width, inputBuffer.height);
      this.copy.render(renderer, inputBuffer, null);
      handoff.sourceReady = true;
    }
    this.active.value = Number(handoff.compositing);
    this.progress.value = handoff.progress;
    this.aspect.value = inputBuffer.width / inputBuffer.height;
    this.hero.value = handoff.hero?.texture ?? null;
    this.work.value = handoff.work?.texture ?? null;
  }

  dispose(): void {
    this.handoff.sourceReady = false;
    super.dispose();
  }
}
