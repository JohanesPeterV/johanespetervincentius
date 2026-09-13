import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import {
  CanvasTexture,
  Group,
  PerspectiveCamera,
  Scene,
  WebGLRenderTarget,
} from 'three';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const modules = new Map();

// REASON: exercise the actual TypeScript motion functions with the existing
// compiler, without introducing a second application bundler or test dependency.
const load = (filename) => {
  if (modules.has(filename)) {
    return modules.get(filename);
  }
  const module = { exports: {} };
  modules.set(filename, module.exports);
  const source = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const localRequire = (name) => {
    if (name.startsWith('@/')) {
      return load(resolve(root, 'src', `${name.slice(2)}.ts`));
    }
    if (name.startsWith('.')) {
      return load(resolve(dirname(filename), `${name}.ts`));
    }
    return require(name);
  };
  runInNewContext(`(function(require, module, exports) { ${source}\n })`, {
    performance,
  })(localRequire, module, module.exports);
  return module.exports;
};

const descent = load(resolve(root, 'src/components/dive/descent.ts'));
const handoff = load(resolve(root, 'src/components/dive/hero-handoff.ts'));
const { DIVE_START, DIVE_LENGTH, LOOP_START, LOOP_END } = descent;
const preparedHandoff = (t, sourceWorld) => {
  const state = handoff.createHeroHandoff();
  const texture = new CanvasTexture();
  t.after(() => texture.dispose());
  state.hero = texture;
  state.work = texture;
  state.sourceWorld = sourceWorld;
  return state;
};
const crossingJourney = (crossing, phase) => {
  const [start, end] =
    crossing === 'work'
      ? [handoff.HANDOFF_START, handoff.HANDOFF_END]
      : [LOOP_START, DIVE_LENGTH + LOOP_END];
  return descent.wrapProgress(start + phase * (end - start));
};
const sampleAt = (state, journey) => {
  state.journey = journey;
  return handoff.sampleHeroHandoff(state, 'full');
};
const combinations = (...axes) =>
  axes.reduce(
    (rows, axis) => rows.flatMap((row) => axis.map((value) => [...row, value])),
    [[]],
  );

for (const [sourceWorld, crossing] of combinations(
  ['hero', 'orbital'],
  ['work', 'loop'],
)) {
  test(`${sourceWorld} ${crossing}: crossing keeps Hero live without changing the orbital endpoint`, (t) => {
    const { default: HeroHandoffEffect } = load(
      resolve(root, 'src/components/dive/hero-handoff-effect.ts'),
    );
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
    let target = input;
    const frames = [];
    let snapshots = 0;
    const renderer = {
      getRenderTarget: () => target,
      setRenderTarget: (next) => {
        target = next;
      },
      clear: () => {},
      render: (renderedScene, renderedCamera) => {
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
    state.journey =
      sourceWorld === 'hero' ? DIVE_START : descent.WORK_STONE.center;
    effect.update(renderer, input);
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
      effect.update(renderer, input);
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
      assert.equal(frame.target.depthBuffer, true);
    }
  });
}
