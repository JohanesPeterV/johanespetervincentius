import {
  BlendFunction,
  CopyPass,
  Effect,
  EffectAttribute,
} from 'postprocessing';
import { Color, HalfFloatType, Uniform, WebGLRenderTarget } from 'three';
import type { Camera, Scene, Texture, WebGLRenderer } from 'three';

import { arrivalReveal } from './arrival';
import { worldAtProgress } from './hero-handoff';
import type { HeroHandoff } from './hero-handoff';
import { heroHandoffFragment } from './hero-handoff-shader';

export default class HeroHandoffEffect extends Effect {
  readonly ink = new Color();
  readonly paper = new Color();
  readonly prism = new Color();
  private readonly source: { camera: Camera; target: WebGLRenderTarget };
  private readonly copy: CopyPass;
  private readonly active = new Uniform(0);
  private readonly opening = new Uniform(0);
  private readonly progress = new Uniform(0);
  private readonly returning = new Uniform(0);
  private readonly sourceIsHero = new Uniform(0);
  private readonly aspect = new Uniform(1);
  private readonly hero = new Uniform<Texture | null>(null);
  private readonly work = new Uniform<Texture | null>(null);

  constructor(
    private readonly handoff: HeroHandoff,
    private readonly scene: Scene,
    private readonly camera: Camera,
  ) {
    super('HeroHandoff', heroHandoffFragment, {
      blendFunction: BlendFunction.NORMAL,
      // REASON: this kernel samples a second world and neighbouring UVs, so it
      // needs its own pass after the world's colour grade, not a merged effect.
      attributes: EffectAttribute.CONVOLUTION,
    });
    this.source = {
      camera: camera.clone(),
      target: new WebGLRenderTarget(1, 1, { type: HalfFloatType }),
    };
    this.copy = new CopyPass(this.source.target);
    handoff.sourceWorld = null;
    this.uniforms.set('uSavedScene', new Uniform(this.copy.texture));
    this.uniforms.set('uHeroContent', this.hero);
    this.uniforms.set('uWorkContent', this.work);
    this.uniforms.set('uProgress', this.progress);
    this.uniforms.set('uReturning', this.returning);
    this.uniforms.set('uSourceIsHero', this.sourceIsHero);
    this.uniforms.set('uActive', this.active);
    this.uniforms.set('uOpening', this.opening);
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
    // REASON: retain the outgoing viewpoint. Hero animations keep rendering
    // during a crossing; orbital artwork depends on the other endpoint's pose.
    if (handoff.crossing === null) {
      this.copy.setSize(inputBuffer.width, inputBuffer.height);
      this.source.camera.copy(this.camera, false);
      this.copy.render(renderer, inputBuffer, null);
      handoff.sourceWorld = worldAtProgress(handoff.journey);
    } else if (handoff.compositing && handoff.sourceWorld === 'hero') {
      this.copy.setSize(inputBuffer.width, inputBuffer.height);
      this.renderHero(renderer);
    }
    // REASON: the opening is the first crossing, from the void into Hero; the
    // same etched edge reveals the live scene over the background.
    const opening = handoff.crossing === null && handoff.arrival < 1;
    this.active.value = Number(handoff.compositing || opening);
    this.opening.value = Number(opening);
    this.progress.value = opening
      ? arrivalReveal(handoff.arrival)
      : handoff.progress;
    this.returning.value = Number(handoff.crossing === 'loop');
    this.sourceIsHero.value = Number(handoff.sourceWorld === 'hero');
    this.aspect.value = inputBuffer.width / inputBuffer.height;
    this.hero.value = handoff.hero;
    this.work.value = handoff.work;
  }

  private renderHero(renderer: WebGLRenderer): void {
    const hero = this.scene.getObjectByName('world-1');
    const orbital = this.scene.getObjectByName('world-2');
    if (!hero || !orbital) {
      throw new Error('Both worlds must be mounted before their crossing.');
    }
    const heroVisible = hero.visible;
    const orbitalVisible = orbital.visible;
    const target = renderer.getRenderTarget();
    this.source.camera.projectionMatrix.copy(this.camera.projectionMatrix);
    this.source.camera.projectionMatrixInverse.copy(
      this.camera.projectionMatrixInverse,
    );
    try {
      hero.visible = true;
      orbital.visible = false;
      renderer.setRenderTarget(this.source.target);
      renderer.clear();
      renderer.render(this.scene, this.source.camera);
    } finally {
      hero.visible = heroVisible;
      orbital.visible = orbitalVisible;
      renderer.setRenderTarget(target);
    }
  }

  dispose(): void {
    this.handoff.sourceWorld = null;
    super.dispose();
  }
}
