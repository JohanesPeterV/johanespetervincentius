import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import {
  CanvasTexture,
  Group,
  PerspectiveCamera,
  Scene,
  WebGLRenderTarget,
  type WebGLRenderer,
  type Camera,
} from 'three';
import {
  DIVE_START,
  LOOP_END,
  DiveRoute,
} from '../src/components/dive/dive-route';
import * as handoff from '../src/components/dive/hero-handoff';
import HeroHandoffEffect from '../src/components/dive/hero-handoff-effect';
import * as motion from '../src/components/dive/camera-motion';

const route = new DiveRoute('Hero', [
  { id: 'work', title: 'Work' },
  { id: 'stack', title: 'Stack' },
]);
const DIVE_LENGTH = route.length;
const LOOP_START = route.loopStart;

const preparedHandoff = (t: TestContext, sourceWorld: 'hero' | 'orbital') => {
  const state = handoff.createHeroHandoff(route);
  const texture = new CanvasTexture(new EventTarget());
  t.after(() => texture.dispose());
  state.hero = texture;
  state.entry = texture;
  state.last = texture;
  state.sourceWorld = sourceWorld;
  return state;
};
const crossingJourney = (crossing: 'entry' | 'loop', phase: number) => {
  const [start, end] =
    crossing === 'entry'
      ? [handoff.HANDOFF_START, handoff.HANDOFF_END]
      : [LOOP_START, DIVE_LENGTH + LOOP_END];
  return route.wrap(start + phase * (end - start));
};
const sampleAt = (state: handoff.HeroHandoff, journey: number) => {
  state.journey = journey;
  return handoff.sampleHeroHandoff(state, 'full');
};
for (const sourceWorld of ['hero', 'orbital'] as const) {
  for (const crossing of ['entry', 'loop'] as const) {
    test(`${sourceWorld} ${crossing}: crossing keeps Hero live without changing the orbital endpoint`, (t) => {
      const state = preparedHandoff(t, sourceWorld);
      const scene = new Scene();
      const hero = new Group();
      hero.name = 'world-1';
      const orbital = new Group();
      orbital.name = 'world-2';
      scene.add(hero, orbital);
      const camera = new PerspectiveCamera(58, 1.6, 0.2, 240);
      camera.position.set(1, 3, 16);
      camera.updateMatrixWorld();
      const effect = new HeroHandoffEffect(state, scene, camera);
      const input = new WebGLRenderTarget(1440, 900);
      t.after(() => {
        effect.dispose();
        input.dispose();
      });
      let target: WebGLRenderTarget | null = input;
      const frames: {
        hero: boolean;
        orbital: boolean;
        x: number;
        target: WebGLRenderTarget | null;
      }[] = [];
      let snapshots = 0;
      const renderer = {
        getRenderTarget: () => target,
        setRenderTarget: (next: WebGLRenderTarget | null) => {
          target = next;
        },
        clear: () => {},
        render: (renderedScene: Scene, renderedCamera: Camera) => {
          if (renderedScene === scene) {
            frames.push({
              hero: hero.visible,
              orbital: orbital.visible,
              x: renderedCamera.position.x,
              target,
            });
          } else {
            snapshots++;
          }
        },
      };
      state.journey = sourceWorld === 'hero' ? DIVE_START : route.entry.center;
      effect.update(renderer as WebGLRenderer, input);
      assert.equal(state.sourceWorld, sourceWorld);
      assert.equal(
        snapshots,
        sourceWorld === 'orbital' ? 1 : 0,
        'only the frozen orbital endpoint needs a snapshot before a crossing',
      );
      camera.position.x = 8;
      hero.visible = sourceWorld !== 'hero';
      orbital.visible = !hero.visible;
      const incoming = [hero.visible, orbital.visible];
      for (const phase of [0.2, 0.5, 0.5, 0.3, 0.1]) {
        sampleAt(state, crossingJourney(crossing, phase));
        renderer.setRenderTarget(input);
        effect.update(renderer as WebGLRenderer, input);
        assert.deepEqual([hero.visible, orbital.visible], incoming);
        assert.equal(target, input);
        assert.equal(state.sourceWorld, sourceWorld);
      }
      assert.equal(
        snapshots,
        sourceWorld === 'orbital' ? 1 : 0,
        'pausing or reversing a crossing must retain the original snapshot',
      );
      assert.equal(
        frames.length,
        sourceWorld === 'hero' ? 5 : 0,
        'Hero keeps rendering while the camera-bound orbital snapshot stays intact',
      );
      for (const frame of frames) {
        assert.equal(frame.hero, sourceWorld === 'hero');
        assert.equal(frame.orbital, sourceWorld === 'orbital');
        assert.equal(
          frame.x,
          1,
          'outgoing camera must not jump to the incoming viewpoint',
        );
        assert.equal(frame.target?.depthBuffer, true);
      }
    });
  }
}

test('Hero and Stack are adjacent across a return gap equal to the opening', () => {
  const opening = route.entry.center - DIVE_START;
  const returning = DIVE_LENGTH + DIVE_START - route.last.center;
  assert.ok(Math.abs(returning - opening) < 1e-9);
  for (const lap of [-100, -1, 0, 1, 100]) {
    const offset = lap * DIVE_LENGTH;
    assert.ok(
      Math.abs(
        route.jumpDelta(DIVE_START + offset, route.last.center) + opening,
      ) < 1e-9,
    );
    assert.ok(
      Math.abs(route.stepDelta(route.last.center + offset, 1) - opening) < 1e-9,
    );
    for (const pose of [
      LOOP_END,
      DIVE_START,
      route.entry.center,
      route.last.center,
      LOOP_START,
    ]) {
      assert.ok(Math.abs(route.wrap(pose + offset) - pose) < 1e-9);
    }
    assert.equal(
      handoff.worldAtProgress(LOOP_START + offset, route),
      'orbital',
    );
    assert.equal(handoff.worldAtProgress(LOOP_END + offset, route), 'hero');
  }
});

test('chapter gestures settle monotonically at exactly one adjacent destination in both directions', () => {
  for (const lap of [-3, 0, 3]) {
    for (const section of route.sections) {
      for (const direction of [-1, 1] as const) {
        const current = section.center + lap * DIVE_LENGTH;
        const drive = {
          route,
          current,
          target: current,
          expectedTarget: NaN,
          idleTime: 0,
        };
        const destination = current + route.stepDelta(current, direction);
        motion.stepDriveToSection(drive, direction);
        for (let frame = 0; frame < 180; frame++) {
          const previous = drive.current;
          motion.advanceDrive(drive, 1 / 60);
          assert.ok((drive.current - previous) * direction >= -1e-9);
          assert.ok(Math.abs(drive.target - destination) < 1e-9);
          const journey = route.wrap(drive.current);
          const state = handoff.createHeroHandoff(route);
          state.journey = journey;
          const rendered = handoff.sampleHeroHandoff(state, 'reduced');
          assert.ok(Number.isFinite(rendered));
          if (state.crossing === 'loop') {
            assert.ok(rendered === LOOP_START || rendered === LOOP_END);
          }
        }
        assert.ok(Math.abs(drive.current - destination) < 0.001);
      }
    }
  }
});

test('the final chapter stays opaque until the loop wave takes over, including reversal', (t) => {
  const state = preparedHandoff(t, 'orbital');
  for (const journey of [
    route.last.center,
    route.last.center + 0.2,
    route.loopStart,
  ]) {
    sampleAt(state, journey);
    assert.equal(handoff.lastOverlayOpacity(state), 1);
  }
  for (const phase of [0.1, 0.5, 0.9, 0.5, 0.1]) {
    sampleAt(state, crossingJourney('loop', phase));
    assert.equal(state.compositing, true);
    assert.equal(
      handoff.lastOverlayOpacity(state),
      0,
      'only the wave compositor draws the chapter during a crossing',
    );
  }
  sampleAt(state, route.loopStart);
  assert.equal(handoff.lastOverlayOpacity(state), 1);
  state.last = null;
  sampleAt(state, crossingJourney('loop', 0.25));
  assert.equal(state.compositing, false);
  assert.equal(
    handoff.lastOverlayOpacity(state),
    1,
    'without a snapshot keep the chapter solid until the fallback cut',
  );
  sampleAt(state, crossingJourney('loop', 0.75));
  assert.equal(handoff.lastOverlayOpacity(state), 0);
});
