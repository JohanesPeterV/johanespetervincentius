import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { IcosahedronGeometry, Vector2 } from 'three';

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
  const localRequire = (name) =>
    name.startsWith('.')
      ? load(resolve(dirname(filename), `${name}.ts`))
      : require(name);
  runInNewContext(`(function(require, module, exports) { ${source}\n })`, {
    performance,
  })(localRequire, module, module.exports);
  return module.exports;
};

const descent = load(resolve(root, 'src/components/dive/descent.ts'));
const motion = load(resolve(root, 'src/components/dive/camera-motion.ts'));
const palette = load(resolve(root, 'src/components/dive/dive-palette.ts'));
const world = load(resolve(root, 'src/components/dive/world-layout.ts'));
const labels = load(resolve(root, 'src/components/dive/galaxy-labels.ts'));

const driveFrom = (current) => ({
  current,
  target: current,
  expectedTarget: NaN,
  idleTime: 0,
});
const settle = (current, target, fps, seconds) => {
  const drive = driveFrom(current);
  drive.target = target;
  for (let frame = 0; frame < fps * seconds; frame++) {
    motion.advanceDrive(drive, 1 / fps);
  }
  return drive.current;
};

test('all chapter destinations are reachable without truncating navigation', () => {
  for (const section of descent.DIVE_SECTIONS) {
    assert.ok(
      Math.abs(
        settle(descent.DIVE_START, section.center, 60, 3) - section.center,
      ) < 0.001,
    );
  }
});

test('settling is consistent at 30, 60, and 120 Hz', () => {
  const samples = [30, 60, 120].map((fps) => settle(1.7, 1.95, fps, 0.6));
  assert.ok(Math.max(...samples) - Math.min(...samples) < 0.002);
});

test('reversing input changes travel direction on the next frame', () => {
  const drive = driveFrom(1.35);
  drive.target = 1.6;
  motion.advanceDrive(drive, 1 / 60);
  const before = drive.current;
  drive.target = 1.1;
  motion.advanceDrive(drive, 1 / 60);
  assert.ok(drive.current < before);
});

test('wheel momentum is bounded across the looping seam', () => {
  const limited = motion.limitDriveTarget(5.95, 4.13);
  assert.ok(Math.abs(limited - 4.13) <= 0.85 + 1e-9);
  assert.ok(Math.abs(motion.limitDriveTarget(2.6, 0.95) - 1.8) < 1e-9);
});

test('forward input cannot reverse a captured or distant chapter destination', () => {
  motion.resetWorkMotion();
  assert.equal(
    motion.driveInputDelta({
      target: 1.95,
      progress: 1.05,
      step: 0.1,
      now: 1000,
    }),
    0,
  );
  assert.equal(
    motion.driveInputDelta({
      target: 3.15,
      progress: 0.95,
      step: 0.1,
      now: 1000,
    }),
    0,
  );
});

test('scroll catches Work before advancing its jobs', () => {
  motion.resetWorkMotion();
  const delta = motion.workLockedDelta({
    target: 1.4,
    progress: 1.4,
    step: 0.4,
    now: 1000,
  });
  assert.ok(Math.abs(1.4 + delta - descent.WORK_STONE.center) < 1e-9);
  assert.equal(motion.WORK_MOTION.job, 0);
});

test('a reverse gesture can leave Work while it is still arriving', () => {
  motion.resetWorkMotion();
  assert.equal(
    motion.workLockedDelta({
      target: 1.95,
      progress: 1.5,
      step: -0.1,
      now: 1000,
    }),
    -0.1,
  );
});

test('one gesture selects one job and its momentum tail is absorbed', () => {
  motion.resetWorkMotion();
  const input = { target: 1.95, progress: 1.95, step: 0.2, now: 1000 };
  assert.equal(motion.workLockedDelta(input), 0);
  assert.equal(motion.WORK_MOTION.job, 1);
  assert.equal(motion.workLockedDelta({ ...input, now: 1100 }), 0);
  assert.equal(motion.WORK_MOTION.job, 1);
  assert.equal(motion.workLockedDelta({ ...input, now: 1800 }), 0);
  assert.equal(motion.WORK_MOTION.job, 2);
});

test('Work releases travel only after its last job', () => {
  motion.resetWorkMotion();
  motion.WORK_MOTION.job = descent.WORK_JOBS.length - 1;
  const delta = motion.workLockedDelta({
    target: 1.95,
    progress: 1.95,
    step: 0.2,
    now: 1000,
  });
  assert.ok(Math.abs(1.95 + delta - 2.55) < 1e-9);
});

test('chapter composition is at rest at every reading stop', () => {
  for (const section of descent.DIVE_SECTIONS) {
    assert.equal(descent.sectionTravel(section.center), 0);
    assert.equal(descent.sectionMotion(section.center, section).opacity, 1);
  }
});

test('camera path is continuous through chapter handoffs', () => {
  const before = descent.createDescentFrame();
  const after = descent.createDescentFrame();
  for (const point of [1.28, 1.4, 1.55, 1.95, 2.25, 2.55, 2.85, 3.15]) {
    descent.writeDescentFrame(before, point - 0.0001);
    descent.writeDescentFrame(after, point + 0.0001);
    for (let axis = 0; axis < 3; axis++) {
      assert.ok(Math.abs(before.position[axis] - after.position[axis]) < 0.01);
    }
  }
});

test('palette samples preserve the sRGB contract of descent keyframes', () => {
  assert.ok(Math.abs(palette.DIVE_PALETTE.accentRgb[0] - 208 / 255) < 0.0001);
});

test('stone shaping stays bounded and stable when a geometry ref reattaches', () => {
  const geometry = new IcosahedronGeometry(1, 3);
  world.shapeNarrativeStone(geometry);
  const before = geometry.getAttribute('position').array.slice();
  world.shapeNarrativeStone(geometry);
  const after = geometry.getAttribute('position').array;
  for (let index = 0; index < after.length; index++) {
    assert.ok(Math.abs(before[index] - after[index]) < 0.000001);
    assert.ok(Number.isFinite(after[index]));
    assert.ok(Math.abs(after[index]) <= 1.120001);
  }
  geometry.dispose();
});

test('galaxy labels prioritize hovered tools and hide collisions or overflow', () => {
  const alphas = new Float32Array([0.9, 0.5, 1, 0.9]);
  labels.cullGalaxyLabels(
    [
      { kind: 'hub', label: 'Front End' },
      { kind: 'skill', label: 'React' },
      { kind: 'skill', label: 'Next.js' },
      { kind: 'hub', label: 'Cloud' },
    ],
    {
      alphas,
      screens: [
        new Vector2(100, 150),
        new Vector2(100, 150),
        new Vector2(100, 150),
        new Vector2(400, 150),
      ],
      scales: new Float32Array([1, 1, 1, 1]),
      width: 390,
      height: 844,
    },
  );
  assert.equal(alphas[0], 0);
  assert.equal(alphas[1], 0);
  assert.equal(alphas[2], 1);
  assert.equal(alphas[3], 0);
});
