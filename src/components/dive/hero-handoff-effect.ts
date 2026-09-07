import {
  BlendFunction,
  CopyPass,
  Effect,
  EffectAttribute,
} from 'postprocessing';
import { Color, HalfFloatType, Uniform } from 'three';
import type { Texture, WebGLRenderer, WebGLRenderTarget } from 'three';

import { DIVE_LENGTH, worldLoopClosure } from './descent';
import { HANDOFF_START } from './hero-handoff';
import type { HeroHandoff } from './hero-handoff';
import { heroHandoffFragment } from './hero-handoff-shader';

export default class HeroHandoffEffect extends Effect {
  readonly ink = new Color();
  readonly paper = new Color();
  readonly prism = new Color();
  private readonly copy = new CopyPass();
  private readonly active = new Uniform(0);
  private readonly progress = new Uniform(0);
  private readonly loopClosure = new Uniform(0);
  private previousJourney: number;
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
    this.previousJourney = handoff.journey;
    handoff.sourceReady = false;
    this.uniforms.set('uHeroScene', new Uniform(this.copy.texture));
    this.uniforms.set('uHeroContent', this.hero);
    this.uniforms.set('uWorkContent', this.work);
    this.uniforms.set('uWorkRect', new Uniform(handoff.workRect));
    this.uniforms.set('uProgress', this.progress);
    this.uniforms.set('uLoopClosure', this.loopClosure);
    this.uniforms.set('uActive', this.active);
    this.uniforms.set('uAspect', this.aspect);
    this.uniforms.set('uInk', new Uniform(this.ink));
    this.uniforms.set('uPaper', new Uniform(this.paper));
    this.uniforms.set('uPrism', new Uniform(this.prism));
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
    const closure = worldLoopClosure(handoff.journey);
    // REASON: a slow frame can skip the closed interval. Cover the first frame
    // across the numeric wrap so the camera reset is never shown mid-reveal.
    const crossedLoop =
      (closure > 0 || worldLoopClosure(this.previousJourney) > 0) &&
      Math.abs(handoff.journey - this.previousJourney) > DIVE_LENGTH / 2;
    this.loopClosure.value = crossedLoop ? 1 : closure;
    this.previousJourney = handoff.journey;
    this.aspect.value = inputBuffer.width / inputBuffer.height;
    this.hero.value = handoff.hero?.texture ?? null;
    this.work.value = handoff.work?.texture ?? null;
  }

  dispose(): void {
    this.handoff.sourceReady = false;
    super.dispose();
  }
}
