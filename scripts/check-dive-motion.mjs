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
  Color,
  Group,
  PerspectiveCamera,
  Scene,
  Vector2,
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
const motion = load(resolve(root, 'src/components/dive/camera-motion.ts'));
const cardLayout = load(
  resolve(root, 'src/components/dive/card-section-layout.ts'),
);
const input = load(resolve(root, 'src/components/dive/dive-input.ts'));
const palette = load(resolve(root, 'src/components/dive/dive-palette.ts'));
const themes = load(resolve(root, 'src/lib/theme-colors.ts'));
const { baseColors } = load(
  resolve(root, 'src/registry/registry-base-colors.ts'),
);
const world = load(resolve(root, 'src/components/dive/world-layout.ts'));
const starfieldTimeline = load(
  resolve(root, 'src/components/dive/starfield-timeline.ts'),
);
const labels = load(resolve(root, 'src/components/dive/galaxy-labels.ts'));
const handoff = load(resolve(root, 'src/components/dive/hero-handoff.ts'));
const overlay = load(
  resolve(root, 'src/components/dive/dive-overlay-motion.ts'),
);

const driveFrom = (current, target = current) => ({
  current,
  target,
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

const preparedHandoff = (t, sourceWorld) => {
  const state = handoff.createHeroHandoff();
  const texture = new CanvasTexture();
  t.after(() => texture.dispose());
  state.hero = { texture, width: 1440, height: 900 };
  state.work = { texture, width: 432, height: 585 };
  state.sourceWorld = sourceWorld;
  return state;
};

const { DIVE_START, DIVE_LENGTH, LOOP_START, LOOP_END } = descent;
const { HANDOFF_START, HANDOFF_END } = handoff;
const laps = [-100, -3, -2, -1, 0, 1, 2, 3, 100];
const crossingRanges = {
  work: [HANDOFF_START, HANDOFF_END],
  loop: [LOOP_START, DIVE_LENGTH + LOOP_END],
};
const crossingJourney = (crossing, phase, lap = 0) => {
  const [start, end] = crossingRanges[crossing];
  return descent.wrapProgress(
    start + phase * (end - start) + lap * DIVE_LENGTH,
  );
};
const sampleAt = (state, journey, mode = 'full') => {
  state.journey = descent.wrapProgress(journey);
  return handoff.sampleHeroHandoff(state, mode);
};
const assertNear = (actual, expected, tolerance = 1e-9) =>
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${actual} != ${expected} within ${tolerance}`,
  );
const assertHandoff = (state, expected) =>
  assert.deepEqual(
    [
      state.crossing,
      state.compositing,
      handoff.heroOverlayOpacity(state),
      handoff.workOverlayOpacity(state),
    ],
    expected,
  );
const combinations = (...axes) =>
  axes.reduce(
    (rows, axis) => rows.flatMap((row) => axis.map((value) => [...row, value])),
    [[]],
  );
const crossingFixture = (t, crossing, sourceWorld) => {
  const state = preparedHandoff(t, sourceWorld);
  const [start, end] = crossingRanges[crossing];
  const forwardWorld = crossing === 'work' ? 'hero' : 'orbital';
  const arriving = crossing === 'work' ? end : LOOP_END;
  if (crossing === 'loop') {
    state.work = null;
  }
  const at = (phase, strategy, mode = 'full') => {
    const active = phase > 0 && phase < 1;
    const source = state.sourceWorld;
    const rendered = sampleAt(state, crossingJourney(crossing, phase), mode);
    if (active) {
      assertNear(state.progress, phase);
    }
    let expected = state.journey;
    let hero = 1 - handoff.heroHandoffProgress(state.journey);
    let work = handoff.workSectionOpacity(state.journey);
    if (crossing === 'loop' && active) {
      // REASON: encoding the midpoint can round to either side of the sampled cutoff.
      hero = Number(state.progress >= 0.5);
      work = 0;
      expected = hero === 1 ? LOOP_END : LOOP_START;
      assert.equal(
        handoff.worldAtProgress(expected),
        hero === 1 ? 'hero' : 'orbital',
      );
    }
    const compositing = strategy === 'composite';
    if (compositing) {
      expected = source === forwardWorld ? arriving : start;
      hero = 0;
      work = 0;
      assert.notEqual(handoff.worldAtProgress(expected), source);
    }
    assert.equal(rendered, expected);
    assert.equal(state.sourceWorld, source);
    assertHandoff(state, [active ? crossing : null, compositing, hero, work]);
    return rendered;
  };
  return { state, at };
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

test('forward input cannot reverse a distant chapter destination', () => {
  assert.equal(
    motion.driveInputDelta({
      target: 1.95,
      progress: 1.05,
      step: 0.1,
    }),
    0,
  );
  assert.equal(
    motion.driveInputDelta({
      target: 3.15,
      progress: 0.95,
      step: 0.1,
    }),
    0,
  );
});

test('vertical travel never captures Work or selects an employer', () => {
  for (const target of [1.4, 1.7, 1.95, 2.1, 2.3, 6.05]) {
    for (const step of [-0.2, 0.2]) {
      assert.ok(
        Math.abs(
          motion.driveInputDelta({ target, progress: target, step }) - step,
        ) < 1e-9,
      );
    }
  }
});

test('one down-arrow can go straight from Work to Projects', () => {
  const drive = driveFrom(descent.WORK_STONE.center);
  motion.stepDriveToSection(drive, 1);
  assert.equal(drive.target, descent.PROJECT_STONE.center);
});

test('discrete commands reach every adjacent stop in either direction across laps', () => {
  const stops = descent.DIVE_SECTIONS.map(({ center }) => center);
  const cycle = [
    stops.at(-1) - DIVE_LENGTH,
    ...stops,
    DIVE_START + DIVE_LENGTH,
  ];
  for (const [lap, direction] of combinations(laps, [-1, 1])) {
    stops.forEach((stop, index) => {
      const current = stop + lap * DIVE_LENGTH;
      const expected = cycle[index + 1 + direction] + lap * DIVE_LENGTH;
      const drive = driveFrom(current);
      motion.stepDriveToSection(drive, direction);
      assert.equal(drive.current, current);
      assertNear(drive.target, expected);
      assert.ok((drive.target - current) * direction > 0);
      assertNear(settle(current, drive.target, 60, 3), expected, 0.001);
    });
  }
});

test('queued chapter commands advance the chosen destination rather than the camera', () => {
  const drive = driveFrom(descent.TECH_STONE.center);
  for (const { center } of descent.DIVE_SECTIONS) {
    motion.stepDriveToSection(drive, 1);
    assertNear(drive.target, center + DIVE_LENGTH);
    assert.equal(drive.current, descent.TECH_STONE.center);
  }
  motion.stepDriveToSection(drive, -1);
  assertNear(drive.target, descent.PROJECT_STONE.center + DIVE_LENGTH);
});

test('continuous caps widen only past the long loop midpoint without changing sensitivity', () => {
  assert.equal(descent.WHEEL_SENSITIVITY, 1 / 2000);
  assert.equal(descent.TOUCH_SENSITIVITY, 1 / 1000);
  for (const current of [descent.DIVE_START, descent.TECH_STONE.center]) {
    for (const direction of [-1, 1]) {
      const delta = motion.driveInputDelta({
        target: current,
        progress: current,
        step: direction * 20,
      });
      const longGap =
        current === DIVE_START ? direction === -1 : direction === 1;
      assertNear(delta, direction * (longGap ? 0.9504 : 0.85));
      if (longGap) {
        assert.ok(Math.abs(delta) > 0.95 && Math.abs(delta) <= 0.9504 + 1e-9);
      }
    }
    const drive = driveFrom(current);
    motion.stepDriveToSection(drive, 1);
    assert.ok(drive.target - current > 0.85);
  }
});

for (const direction of [1, -1]) {
  const title =
    direction === 1 ? 'forward Tech to Hero' : 'reverse Hero to Tech';
  const sourceWorld = direction === 1 ? 'orbital' : 'hero';
  const current = direction === 1 ? descent.TECH_STONE.center : DIVE_START;
  const destination =
    direction === 1
      ? DIVE_LENGTH + DIVE_START
      : descent.TECH_STONE.center - DIVE_LENGTH;
  for (const inputKind of ['discrete', 'continuous']) {
    test(`one ${inputKind} ${title} input settles at the adjacent stop through exactly one return`, (t) => {
      for (const lap of laps) {
        const offset = lap * DIVE_LENGTH;
        const state = preparedHandoff(t, sourceWorld);
        state.work = null;
        const drive = driveFrom(current + offset);
        if (inputKind === 'discrete') {
          motion.stepDriveToSection(drive, direction);
        } else {
          drive.target += motion.driveInputDelta({
            target: drive.target,
            progress: drive.current,
            step: direction * 20,
          });
          assertNear((drive.target - drive.current) * direction, 0.9504);
        }
        const target = destination + offset;
        const initialTarget = drive.target;
        if (inputKind === 'discrete') {
          assertNear(initialTarget, target);
        }
        let crossings = 0;
        let previousCrossing = null;
        let previousPhase = direction === 1 ? 0 : 1;
        for (let frame = 0; frame < 240; frame++) {
          const previousPosition = drive.current;
          motion.advanceDrive(drive, 1 / 60);
          if (inputKind === 'discrete') {
            assertNear(drive.target, target);
          }
          assert.ok((drive.current - previousPosition) * direction >= -1e-9);
          assert.ok((drive.target - initialTarget) * direction >= -1e-9);
          assert.ok((target - drive.target) * direction >= -1e-9);
          const rendered = sampleAt(state, drive.current);
          if (state.crossing !== null) {
            crossings += Number(previousCrossing === null);
            assertHandoff(state, ['loop', true, 0, 0]);
            assert.equal(state.sourceWorld, sourceWorld);
            assert.ok((state.progress - previousPhase) * direction >= -1e-9);
            assert.equal(rendered, direction === 1 ? LOOP_END : LOOP_START);
            previousPhase = state.progress;
          }
          previousCrossing = state.crossing;
        }
        assert.equal(crossings, 1);
        assertNear(drive.current, destination + offset, 0.001);
        assertNear(drive.target, target, 0.001);
        assertHandoff(state, [null, false, Number(direction === 1), 0]);
      }
    });
  }
}

for (const direction of [-1, 1]) {
  test(`direction ${direction} renders every Hero boundary without truncation or scroll lock`, (t) => {
    for (const [lap, extraLaps, delta] of combinations(
      laps,
      [0, 3],
      [0.1, 0.5, 2],
    )) {
      const boundary = DIVE_START + lap * DIVE_LENGTH;
      const stop =
        direction === 1
          ? descent.WORK_STONE.center
          : descent.TECH_STONE.center - DIVE_LENGTH;
      const target = stop + (lap + direction * extraLaps) * DIVE_LENGTH;
      const drive = driveFrom(boundary - direction * 0.2, target);
      const state = preparedHandoff(t, 'orbital');
      sampleAt(state, drive.current);
      assertHandoff(state, [direction === 1 ? 'loop' : 'work', true, 0, 0]);
      motion.advanceDrive(drive, delta);
      assertNear(drive.current, boundary, 1e-7);
      assert.equal(drive.target, target);
      assert.equal(sampleAt(state, drive.current), state.journey);
      assertHandoff(state, [null, false, 1, 0]);
      assert.equal(handoff.worldAtProgress(state.journey), 'hero');
      state.sourceWorld = 'hero';
      const rendered = [drive.current];
      for (let frame = 0; frame < 600; frame++) {
        const previous = drive.current;
        motion.advanceDrive(drive, delta);
        rendered.push(drive.current);
        assert.ok((drive.current - previous) * direction >= -1e-9);
        assertNear(drive.target, target);
        if (Math.abs(drive.current - target) < 1e-7) {
          break;
        }
      }
      assert.ok((rendered[1] - boundary) * direction > 1e-7);
      for (let index = 0; index <= extraLaps; index++) {
        const hero = boundary + direction * index * DIVE_LENGTH;
        assert.ok(
          rendered.some((value) => Math.abs(value - hero) < 1e-7),
          `missing Hero ${hero}: ${rendered}`,
        );
      }
      assertNear(drive.current, target, 1e-7);
    }
  });
  test(`a nearly settled ${direction === 1 ? 'forward' : 'reverse'} target beyond Hero cannot erase its boundary frame`, () => {
    for (const lap of laps) {
      const boundary = DIVE_START + lap * DIVE_LENGTH;
      const target = boundary + direction * 0.0002;
      const drive = driveFrom(boundary - direction * 0.2, target);
      motion.advanceDrive(drive, 1);
      assertNear(drive.current, boundary, 1e-7);
      assert.equal(drive.target, target);
      motion.advanceDrive(drive, 0.1);
      assert.ok((drive.current - boundary) * direction > 1e-7);
      assert.equal(drive.target, target);
    }
  });
}

test('Hero boundary tolerance allows departure and immediate reversal without a scroll lock', () => {
  for (const [lap, direction, noise] of combinations(
    laps,
    [-1, 1],
    [-5e-8, 0, 5e-8],
  )) {
    const boundary = DIVE_START + lap * DIVE_LENGTH;
    const drive = driveFrom(boundary + noise, boundary + direction * 0.6);
    motion.advanceDrive(drive, 1 / 60);
    assert.ok((drive.current - boundary) * direction > 1e-7);
    const previous = drive.current;
    drive.target = boundary - direction * 0.6;
    motion.advanceDrive(drive, 1 / 60);
    assert.ok((drive.current - previous) * direction < 0);
    assert.equal(drive.target, boundary - direction * 0.6);
  }
});

test('a reverse gesture can leave Work while it is arriving', () => {
  assert.equal(
    motion
      .driveInputDelta({
        target: 1.95,
        progress: 1.5,
        step: -0.1,
      })
      .toFixed(1),
    '-0.1',
  );
});

test('reading role details releases vertical input at either scroll edge', () => {
  const section = { scrollHeight: 400, clientHeight: 200, scrollTop: 100 };
  assert.equal(input.canScrollSection(section, 20), true);
  assert.equal(input.canScrollSection(section, -20), true);
  section.scrollTop = 200;
  assert.equal(input.canScrollSection(section, 20), false);
  section.scrollTop = 0;
  assert.equal(input.canScrollSection(section, -20), false);
  section.scrollHeight = 200;
  assert.equal(input.canScrollSection(section, 20), false);
  assert.equal(input.canScrollSection(null, 20), false);
});

test('card sections stay centered inside the viewport and clear of navigation', () => {
  for (const [width, height] of [
    [320, 568],
    [375, 667],
    [390, 844],
    [768, 1024],
    [1440, 900],
    [2560, 1440],
    [667, 375],
    [844, 390],
  ]) {
    const layout = cardLayout.getCardSectionLayout(width, height);
    assert.ok(layout.left >= 24);
    assert.ok(layout.left + layout.width <= width - 24);
    assert.equal(layout.left * 2 + layout.width, width);
    assert.ok(layout.width <= 1440);
    assert.ok(layout.top >= (height < 500 ? 64 : 80));
    assert.ok(layout.top + layout.height <= height - 88);
    assert.ok(layout.height >= 220);
    assert.ok(layout.height <= 760);
  }
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

test('all colourways have two distinct authored hues shared with the scene', () => {
  for (const base of baseColors) {
    const difference = Math.abs(
      parseFloat(base.primary) - parseFloat(base.secondary),
    );
    assert.ok(Math.min(difference, 360 - difference) >= 60, base.label);
    for (const mode of ['light', 'dark']) {
      const resolved = themes.getFluidThemeColors(base.name, mode);
      const { cssVars } = themes.getThemeColorValues(base.name, mode);
      assert.equal(cssVars.primary, base.primary);
      assert.equal(cssVars.secondary, base.secondary);
      assert.equal(
        resolved.fluidColor,
        `#${new Color(`hsl(${base.primary.split(' ').join(',')})`).getHexString()}`,
      );
      assert.equal(
        resolved.secondaryColor,
        `#${new Color(`hsl(${base.secondary.split(' ').join(',')})`).getHexString()}`,
      );
    }
  }
});

test('theme text, buttons, links, and hover surfaces meet AA in both modes', () => {
  const pairs = [
    ['foreground', 'background'],
    ['card-foreground', 'card'],
    ['popover-foreground', 'popover'],
    ['muted-foreground', 'muted'],
    ['primary-foreground', 'primary'],
    ['secondary-foreground', 'secondary'],
    ['accent-foreground', 'accent'],
    ['destructive-foreground', 'destructive'],
    ...['background', 'card', 'muted', 'accent'].map((surface) => [
      'primary-text',
      surface,
    ]),
  ];
  const luminance = (hsl) => {
    const color = new Color(`hsl(${hsl.split(' ').join(',')})`);
    return color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;
  };
  for (const base of baseColors) {
    for (const mode of ['light', 'dark']) {
      const { cssVars } = themes.getThemeColorValues(base.name, mode);
      for (const [text, surface] of pairs) {
        const values = [luminance(cssVars[text]), luminance(cssVars[surface])];
        const contrast =
          (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
        assert.ok(
          contrast >= 4.5,
          `${base.name} ${mode}: ${text} on ${surface} = ${contrast}`,
        );
      }
    }
  }
});

test('scene mode comes from the resolved theme rather than color brightness', () => {
  for (const base of baseColors) {
    for (const mode of ['light', 'dark']) {
      const theme = themes.getFluidThemeColors(base.name, mode);
      assert.equal(palette.getDivePalette(theme).mode, theme.mode);
      assert.equal(
        palette.getDivePalette({
          ...theme,
          backgroundColor: mode === 'light' ? '#000000' : '#ffffff',
        }).mode,
        mode,
      );
    }
  }
});

test('palette samples preserve the sRGB contract of descent keyframes', () => {
  for (const base of baseColors) {
    for (const mode of ['light', 'dark']) {
      const theme = themes.getFluidThemeColors(base.name, mode);
      const resolved = palette.getDivePalette(theme);
      assert.equal(
        new Color(resolved.highlight).getHexString(),
        new Color(theme.secondaryColor).getHexString(),
      );
      assert.equal(
        new Color(resolved.accent).getHexString(),
        new Color(theme.fluidColor).getHexString(),
      );
      const encoded = new Color(theme.backgroundColor).convertLinearToSRGB();
      const frame = descent.createDescentFrame();
      palette.applyDivePalette(frame, resolved, descent.WORK_STONE.center);
      [encoded.r, encoded.g, encoded.b].forEach((channel, index) => {
        assert.ok(Math.abs(resolved.backgroundRgb[index] - channel) < 0.005);
        assert.ok(Math.abs(frame.fogColor[index] - channel) < 0.005);
        assert.ok(Math.abs(frame.veilColor[index] - channel) < 0.005);
      });
      const foreground = new Color(resolved.foreground);
      const background = new Color(resolved.background);
      const luminance = (color) =>
        color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;
      const values = [luminance(foreground), luminance(background)].sort(
        (a, b) => a - b,
      );
      assert.ok(
        (values[1] + 0.05) / (values[0] + 0.05) > 7,
        `${base.name} ${mode} text contrast`,
      );
    }
  }
});

test('small click drift leaves the camera still until a drag begins', () => {
  const drag = { x: 100, y: 100, axis: 'pending-vertical' };
  for (const [clientX, clientY] of [
    [101, 101],
    [98, 103],
    [100, 100],
  ]) {
    assert.equal(input.dragInputDelta(drag, { clientX, clientY }), 0);
    assert.equal(drag.y, 100);
    assert.equal(drag.axis, 'pending-vertical');
  }
  assert.equal(input.dragInputDelta(drag, { clientX: 101, clientY: 90 }), 10);
  assert.equal(drag.axis, 'vertical');
  assert.equal(input.dragInputDelta(drag, { clientX: 101, clientY: 92 }), -2);
});

test('horizontal gestures keep their axis while scene drags remain vertical', () => {
  const horizontal = { x: 100, y: 100, axis: 'pending' };
  assert.equal(
    input.dragInputDelta(horizontal, { clientX: 120, clientY: 98 }),
    0,
  );
  assert.equal(horizontal.axis, 'horizontal');
  assert.equal(
    input.dragInputDelta(horizontal, { clientX: 120, clientY: 70 }),
    0,
  );
  const scene = { x: 100, y: 100, axis: 'pending-vertical' };
  assert.equal(input.dragInputDelta(scene, { clientX: 120, clientY: 98 }), 2);
  assert.equal(scene.axis, 'vertical');
});

test('every configured star shape is reached and every seam stays continuous', () => {
  for (const count of [1, 2, 3, 4]) {
    const timing = { hold: 20, morph: 2.4 };
    const timeline = starfieldTimeline.createStarfieldTimeline(count, timing);
    const reached = new Set();
    let start = 0;
    for (let index = 0; index < count; index += 1) {
      starfieldTimeline.sampleStarfieldTimeline(
        timeline,
        start + timing.hold / 2,
      );
      assert.equal(timeline.from, index);
      assert.equal(timeline.to, (index + 1) % count);
      assert.ok(Number.isFinite(timeline.morph));
      assert.ok(timeline.morph >= 0 && timeline.morph <= 1);
      if (count > 1) {
        assert.equal(timeline.morph, 0);
      }
      reached.add(timeline.from);

      const end = start + timing.hold + timing.morph;
      starfieldTimeline.sampleStarfieldTimeline(timeline, end - 0.000001);
      assert.equal(timeline.from, index);
      const destination = timeline.to;
      if (count > 1) {
        assert.ok(timeline.morph > 0.9999 && timeline.morph <= 1);
      }
      starfieldTimeline.sampleStarfieldTimeline(timeline, end);
      assert.equal(timeline.from, destination);
      assert.equal(timeline.morph, 0);
      start = end;
    }
    assert.equal(reached.size, count);
    assert.equal(timeline.from, 0);
  }
});

test('every star shape shares the authored hold and morph duration', () => {
  const timeline = starfieldTimeline.createStarfieldTimeline(3, {
    hold: 20,
    morph: 2.4,
  });
  for (let index = 0; index < 3; index += 1) {
    const start = index * 22.4;
    starfieldTimeline.sampleStarfieldTimeline(timeline, start + 19.9);
    assert.equal(timeline.from, index);
    assert.equal(timeline.morph, 0);
    assert.equal(timeline.transitioning, false);
    starfieldTimeline.sampleStarfieldTimeline(timeline, start + 21.2);
    assert.equal(timeline.to, (index + 1) % 3);
    assert.ok(Math.abs(timeline.morph - 0.5) < 1e-9);
  }
});

test('star shape sampling survives long-running tabs and nonsequential samples', () => {
  const timeline = starfieldTimeline.createStarfieldTimeline(3, {
    hold: 1,
    morph: 2,
  });
  starfieldTimeline.sampleStarfieldTimeline(timeline, 7.5);
  const expected = {
    from: timeline.from,
    to: timeline.to,
    morph: timeline.morph,
  };
  starfieldTimeline.sampleStarfieldTimeline(timeline, 9 * 1000000 + 7.5);
  assert.equal(timeline.from, expected.from);
  assert.equal(timeline.to, expected.to);
  assert.ok(Math.abs(timeline.morph - expected.morph) < 1e-9);
  starfieldTimeline.sampleStarfieldTimeline(timeline, 0.5);
  assert.equal(timeline.from, 0);
  assert.equal(timeline.morph, 0);
});

test('manual star changes skip the wait without slowing the morph or next hold', () => {
  const timeline = starfieldTimeline.createStarfieldTimeline(2, {
    hold: 12.25,
    morph: 2.4,
  });
  const clickedAt = 3.125;
  starfieldTimeline.sampleStarfieldTimeline(timeline, clickedAt);
  starfieldTimeline.advanceStarfieldTimeline(timeline, 'animate');
  starfieldTimeline.sampleStarfieldTimeline(timeline, clickedAt);
  assert.equal(timeline.from, 0);
  assert.equal(timeline.to, 1);
  assert.ok(Math.abs(timeline.morph) < 1e-9);
  assert.equal(timeline.transitioning, true);

  starfieldTimeline.sampleStarfieldTimeline(timeline, clickedAt + 1.2);
  assert.ok(Math.abs(timeline.morph - 0.5) < 1e-9);
  const arrivedAt = clickedAt + 2.4;
  starfieldTimeline.sampleStarfieldTimeline(timeline, arrivedAt);
  assert.equal(timeline.from, 1);
  assert.equal(timeline.morph, 0);
  assert.equal(timeline.transitioning, false);
  starfieldTimeline.sampleStarfieldTimeline(timeline, arrivedAt + 12.249);
  assert.equal(timeline.from, 1);
  assert.equal(timeline.morph, 0);
  assert.equal(timeline.transitioning, false);
  starfieldTimeline.sampleStarfieldTimeline(timeline, arrivedAt + 13.45);
  assert.equal(timeline.to, 0);
  assert.ok(Math.abs(timeline.morph - 0.5) < 1e-9);
});

test('repeated star requests cannot restart a morph at or inside its boundary', () => {
  for (const sampledAt of [12.25 - 1e-10, 12.25, 13.45]) {
    const timeline = starfieldTimeline.createStarfieldTimeline(2, {
      hold: 12.25,
      morph: 2.4,
    });
    starfieldTimeline.sampleStarfieldTimeline(timeline, sampledAt);
    assert.equal(timeline.transitioning, true);
    const morph = timeline.morph;
    for (let request = 0; request < 5; request += 1) {
      starfieldTimeline.advanceStarfieldTimeline(timeline, 'animate');
      starfieldTimeline.sampleStarfieldTimeline(timeline, sampledAt);
      assert.equal(timeline.from, 0);
      assert.equal(timeline.morph, morph);
    }
    starfieldTimeline.sampleStarfieldTimeline(timeline, 14.65);
    assert.equal(timeline.from, 1);
    assert.equal(timeline.morph, 0);
    assert.equal(timeline.transitioning, false);
  }
});

test('instant star requests cycle at a frozen fractional time without residual motion', () => {
  const timing = { hold: 12.1, morph: 2.4 };
  const timeline = starfieldTimeline.createStarfieldTimeline(3, timing);
  const frozenAt = 12.75;
  starfieldTimeline.sampleStarfieldTimeline(timeline, frozenAt);
  assert.ok(timeline.morph > 0);
  for (let request = 1; request <= 256; request += 1) {
    starfieldTimeline.advanceStarfieldTimeline(timeline, 'instant');
    const expected = request % timeline.frameCount;
    assert.equal(timeline.from, expected);
    assert.equal(timeline.to, (expected + 1) % timeline.frameCount);
    assert.equal(timeline.morph, 0);
    starfieldTimeline.sampleStarfieldTimeline(timeline, frozenAt);
    assert.equal(timeline.from, expected);
    assert.equal(timeline.morph, 0);
    assert.equal(timeline.transitioning, false);
  }
  const { hold } = timing;
  starfieldTimeline.sampleStarfieldTimeline(timeline, frozenAt + hold - 0.001);
  assert.equal(timeline.morph, 0);
  assert.equal(timeline.transitioning, false);
  starfieldTimeline.sampleStarfieldTimeline(timeline, frozenAt + hold + 0.1);
  assert.ok(timeline.morph > 0);
});

test('manual star requests leave single-shape sequences unchanged', () => {
  for (const elapsed of [0.625, 13.2]) {
    const timeline = starfieldTimeline.createStarfieldTimeline(1, {
      hold: 12,
      morph: 2.4,
    });
    starfieldTimeline.sampleStarfieldTimeline(timeline, elapsed);
    const before = { ...timeline };
    for (const motion of ['animate', 'instant']) {
      starfieldTimeline.advanceStarfieldTimeline(timeline, motion);
      assert.deepEqual({ ...timeline }, before);
      starfieldTimeline.sampleStarfieldTimeline(timeline, elapsed);
      assert.deepEqual({ ...timeline }, before);
    }
  }
});

test('invalid star shape schedules fail at creation', () => {
  assert.throws(() =>
    starfieldTimeline.createStarfieldTimeline(0, { hold: 1, morph: 1 }),
  );
  for (const hold of [-1, NaN, Infinity, -Infinity]) {
    assert.throws(() =>
      starfieldTimeline.createStarfieldTimeline(1, { hold, morph: 1 }),
    );
  }
  for (const morph of [0, -1, NaN, Infinity, -Infinity]) {
    assert.throws(() =>
      starfieldTimeline.createStarfieldTimeline(1, { hold: 1, morph }),
    );
  }
  assert.doesNotThrow(() =>
    starfieldTimeline.createStarfieldTimeline(1, { hold: 0, morph: 1 }),
  );
});

test('lower GPU star counts preserve particle identities in every formation', () => {
  for (const reality of ['watchers', 'orbital']) {
    for (const aspect of [390 / 844, 1440 / 900]) {
      const full = world.buildStarfield(reality, 1100, aspect);
      const reduced = world.buildStarfield(reality, 450, aspect);
      assert.deepEqual(
        full.frames.map(({ id }) => id),
        reduced.frames.map(({ id }) => id),
      );
      for (const [index, frame] of full.frames.entries()) {
        const reducedFrame = reduced.frames[index];
        assert.deepEqual(
          frame.positions.slice(0, reducedFrame.positions.length),
          reducedFrame.positions,
        );
      }
      for (const stream of ['seeds', 'scatter']) {
        assert.equal(full[stream].length / 1100, reduced[stream].length / 450);
        assert.deepEqual(
          full[stream].slice(0, reduced[stream].length),
          reduced[stream],
        );
      }
    }
  }
});

test('all authored star formations remain finite and distinct at both viewport shapes', () => {
  for (const aspect of [390 / 844, 1440 / 900]) {
    const configurations = [];
    for (const reality of ['watchers', 'orbital']) {
      const layout = world.buildStarfield(reality, 400, aspect);
      assert.ok(layout.frames.length > 1);
      assert.equal(
        new Set(layout.frames.map(({ id }) => id)).size,
        layout.frames.length,
      );
      for (const frame of layout.frames) {
        assert.equal(frame.positions.length, 1200);
        assert.ok(frame.positions.every(Number.isFinite));
        assert.ok(
          Number.isFinite(frame.appearance.size) && frame.appearance.size > 0,
        );
        assert.ok(
          Number.isFinite(frame.appearance.glow) && frame.appearance.glow >= 0,
        );
        assert.ok(
          Number.isFinite(frame.appearance.tint) && frame.appearance.tint >= 0,
        );
      }
      for (const stream of ['seeds', 'scatter']) {
        assert.ok(layout[stream].length > 0);
        assert.ok(layout[stream].every(Number.isFinite));
      }
      const signatures = layout.frames.map(({ positions }) =>
        Array.from(positions).join(','),
      );
      assert.equal(new Set(signatures).size, layout.frames.length);
      configurations.push(signatures.join(';'));
    }
    assert.notEqual(configurations[0], configurations[1]);
  }
});

test('changing colourway never introduces a warm cast into neutral surfaces', () => {
  for (const mode of ['light', 'dark']) {
    const reference = palette.getDivePalette(
      themes.getFluidThemeColors('blue', mode),
    );
    for (const base of baseColors) {
      const resolved = palette.getDivePalette(
        themes.getFluidThemeColors(base.name, mode),
      );
      assert.equal(resolved.background, reference.background);
      assert.equal(resolved.surface, reference.surface);
      assert.equal(resolved.foreground, reference.foreground);
      if (mode === 'dark') {
        const color = new Color(resolved.background);
        assert.ok(color.b >= color.r && color.b >= color.g);
      }
    }
  }
});

test('space grading stays finite through every seam for all colourways', () => {
  for (const base of baseColors) {
    for (const mode of ['light', 'dark']) {
      const resolved = palette.getDivePalette(
        themes.getFluidThemeColors(base.name, mode),
      );
      const frame = descent.createDescentFrame();
      for (let progress = 0; progress < descent.DIVE_LENGTH; progress += 0.01) {
        descent.writeDescentFrame(frame, progress);
        palette.applyDivePalette(frame, resolved, progress);
        assert.ok(frame.fogDensity >= 0 && frame.fogDensity <= 0.006);
        for (const channel of [...frame.fogColor, ...frame.veilColor]) {
          assert.ok(Number.isFinite(channel) && channel >= 0 && channel <= 1);
        }
      }
    }
  }
});

test('each colourway has a distinct sky glow and celestial material', () => {
  for (const mode of ['light', 'dark']) {
    const palettes = baseColors.map((base) =>
      palette.getDivePalette(themes.getFluidThemeColors(base.name, mode)),
    );
    for (const property of ['glow', 'highlight']) {
      const colours = palettes.map((entry) => entry[property]);
      assert.equal(new Set(colours).size, baseColors.length);
      palettes.forEach((entry) => {
        assert.notEqual(entry[property], entry.background);
        assert.notEqual(entry[property], entry.metal);
      });
    }
  }
});

test('warm accents retain cool ambient light instead of a brown sky', () => {
  for (const mode of ['light', 'dark']) {
    for (const name of ['red', 'orange', 'yellow']) {
      const resolved = palette.getDivePalette(
        themes.getFluidThemeColors(name, mode),
      );
      const glow = new Color(resolved.glow);
      assert.ok(glow.b > glow.r, `${name} ${mode} atmosphere stays cool`);
    }
  }
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

test('hero handoff progress covers exactly its two endpoints', () => {
  assert.equal(handoff.HANDOFF_START, descent.DIVE_START + 0.1);
  assert.equal(handoff.HANDOFF_END, descent.WORK_STONE.center - 0.1);
  assert.equal(handoff.heroHandoffProgress(descent.DIVE_START), 0);
  assert.equal(handoff.heroHandoffProgress(handoff.HANDOFF_START), 0);
  assert.equal(handoff.heroHandoffProgress(handoff.HANDOFF_END), 1);
  assert.equal(handoff.heroHandoffProgress(descent.WORK_STONE.center), 1);
});

test('Work artwork and copy share one exit boundary in both scroll directions', () => {
  const state = handoff.createHeroHandoff();
  for (const journey of [
    0.95, 1.45, 1.85, 1.95, 2.2, 2.3, 2.55, 3.15, 4.05, 2.3, 2.2, 1.95,
  ]) {
    state.journey = journey;
    const opacity = handoff.workSectionOpacity(journey);
    assert.equal(handoff.workOverlayOpacity(state), opacity);
    if (journey > handoff.HANDOFF_END) {
      assert.equal(
        opacity,
        descent.stoneSectionOpacity(journey, descent.WORK_STONE.center),
      );
    }
    if (journey >= 2.3) {
      assert.equal(opacity, 0);
    }
  }
});

test('Work DOM status cannot leak over the hero while the incoming model is prepared', (t) => {
  const state = preparedHandoff(t, 'hero');
  state.work.width = 560;
  state.work.height = 608;
  state.journey = 1.45;
  const visual = handoff.sampleHeroHandoff(state, 'full');
  assert.equal(handoff.workSectionOpacity(visual), 1);
  assert.equal(handoff.workOverlayOpacity(state), 0);
  handoff.sampleHeroHandoff(state, 'reduced');
  assert.equal(
    handoff.workOverlayOpacity(state),
    handoff.heroHandoffProgress(state.journey),
  );
});

test('handoff reveals an already composed Work scene, not the empty current frame', (t) => {
  const state = preparedHandoff(t, 'hero');
  state.journey = (handoff.HANDOFF_START + handoff.HANDOFF_END) / 2;
  assert.equal(handoff.sampleHeroHandoff(state, 'full'), handoff.HANDOFF_END);
  assert.equal(state.crossing, 'work');
  assert.equal(state.compositing, true);
  assert.ok(Math.abs(state.progress - 0.5) < 1e-9);
});

test('late snapshots never switch rendering strategy halfway through a crossing', (t) => {
  const state = handoff.createHeroHandoff();
  state.journey = 1.3;
  assert.equal(handoff.sampleHeroHandoff(state, 'full'), 1.3);
  const ready = preparedHandoff(t, 'hero');
  state.hero = ready.hero;
  state.work = ready.work;
  state.sourceWorld = ready.sourceWorld;
  state.journey = 1.5;
  assert.equal(handoff.sampleHeroHandoff(state, 'full'), 1.5);
  assert.equal(state.compositing, false);
  state.journey = descent.DIVE_START;
  handoff.sampleHeroHandoff(state, 'full');
  state.journey = 1.3;
  assert.equal(handoff.sampleHeroHandoff(state, 'full'), handoff.HANDOFF_END);
  assert.equal(state.compositing, true);
});

test('reversal retraces the same handoff without swapping source and destination', (t) => {
  const state = preparedHandoff(t, 'hero');
  const phases = [1.25, 1.45, 1.6, 1.45, 1.25].map((journey) => {
    state.journey = journey;
    assert.equal(handoff.sampleHeroHandoff(state, 'full'), handoff.HANDOFF_END);
    return state.progress;
  });
  assert.equal(phases[0], phases[4]);
  assert.equal(phases[1], phases[3]);
  assert.ok(phases[2] > phases[1]);
});

test('unprepared original handoffs, reduced motion, and inactive chapters retain the live scene', (t) => {
  const state = handoff.createHeroHandoff();
  state.journey = 1.45;
  assert.equal(handoff.sampleHeroHandoff(state, 'full'), 1.45);
  const ready = preparedHandoff(t, 'hero');
  state.hero = ready.hero;
  state.work = ready.work;
  state.sourceWorld = ready.sourceWorld;
  assert.equal(handoff.sampleHeroHandoff(state, 'reduced'), 1.45);
  assert.equal(state.compositing, false);
  for (const journey of [
    handoff.HANDOFF_START,
    handoff.HANDOFF_END,
    2.55,
    3.15,
    descent.LOOP_START,
  ]) {
    state.journey = journey;
    assert.equal(handoff.sampleHeroHandoff(state, 'full'), journey);
    assert.equal(state.crossing, null);
    assert.equal(state.compositing, false);
  }
});

test('handoff starts at live Hero and the return waits for Tech to depart', () => {
  const state = handoff.createHeroHandoff();
  assert.equal(state.hero, null);
  assert.equal(state.work, null);
  assert.deepEqual(state.workRect.toArray(), [0, 0, 0, 1]);
  assert.equal(state.sourceWorld, null);
  assert.equal(state.crossing, null);
  assert.equal(state.compositing, false);
  assert.equal(state.progress, 0);
  assert.equal(state.journey, DIVE_START);
  assert.equal(handoff.sampleHeroHandoff(state, 'full'), DIVE_START);
  assertHandoff(state, [null, false, 1, 0]);
  assert.equal(LOOP_START, descent.TECH_STONE.center + 0.3 + 0.18);
  assert.equal(LOOP_END, DIVE_START - 0.1);
  assert.equal(handoff.loopHandoffProgress(LOOP_END), 1);
  assert.equal(
    descent.sectionMotion(LOOP_END, descent.DIVE_SECTIONS[0]).opacity,
    1,
  );
  assert.ok(descent.techSectionOpacity(LOOP_START - 0.001) > 0);
  assert.equal(descent.techSectionOpacity(LOOP_START), 0);
  assert.equal(handoff.loopHandoffProgress(LOOP_START), 0);
  assert.ok(handoff.loopHandoffProgress(LOOP_START + 0.001) > 0);
});

test('return progress is monotonic through 4.1 to zero with exact endpoints on every lap', () => {
  const [start, end] = crossingRanges.loop;
  const samples = [
    start,
    3.8,
    4.05,
    DIVE_LENGTH - 0.00001,
    DIVE_LENGTH,
    DIVE_LENGTH + 0.00001,
    DIVE_LENGTH + 0.2,
    DIVE_LENGTH + 0.8,
    end,
  ];
  for (const lap of laps) {
    let previous = -1;
    for (const journey of samples) {
      const progress = journey + lap * DIVE_LENGTH;
      const actual = handoff.loopHandoffProgress(progress);
      assert.ok(Number.isFinite(actual) && actual >= 0 && actual <= 1);
      assert.ok(actual > previous, `lap ${lap}, journey ${journey}`);
      assertNear(actual, (journey - start) / (end - start));
      assertNear(
        actual,
        handoff.loopHandoffProgress(descent.wrapProgress(progress)),
      );
      previous = actual;
    }
  }
});

for (const [crossing, [start, end]] of Object.entries(crossingRanges)) {
  const forwardWorld = crossing === 'work' ? 'hero' : 'orbital';
  const progress =
    crossing === 'work'
      ? handoff.heroHandoffProgress
      : handoff.loopHandoffProgress;
  const at = (state, phase, mode) =>
    sampleAt(state, crossingJourney(crossing, phase), mode);
  test(`${crossing} snaps endpoint noise, preserves active fractions, and releases across laps`, (t) => {
    const state = preparedHandoff(t, 'hero');
    for (const lap of laps) {
      for (const [phase, expected] of [
        [-5e-7, 0],
        [0, 0],
        [5e-7, 0],
        [2e-6, 2e-6],
        [0.999998, 0.999998],
        [0.9999995, 1],
        [1, 1],
        [1.0000005, 1],
      ]) {
        const journey = crossingJourney(crossing, phase, lap);
        const active = expected > 0 && expected < 1;
        if (active) {
          assertNear(progress(journey), expected);
          assert.ok(progress(journey) > 0 && progress(journey) < 1);
        } else {
          assert.equal(progress(journey), expected);
        }
        at(state, 0.5);
        const rendered = sampleAt(state, journey);
        assert.equal(state.crossing, active ? crossing : null);
        assert.equal(state.compositing, active);
        if (!active) {
          assert.equal(rendered, state.journey);
        }
      }
    }
  });

  test(`${crossing} preserves the scene pair through both entry sides and reversals`, (t) => {
    for (const sourceWorld of ['hero', 'orbital']) {
      const { state, at } = crossingFixture(t, crossing, sourceWorld);
      const { hero, work } = state;
      const forward = sourceWorld === forwardWorld;
      const phases = forward
        ? [0.1, 0.4, 0.85, 0.4, 0.1]
        : [0.9, 0.6, 0.15, 0.6, 0.9];
      at(Math.round(phases[0]), 'live');
      for (const phase of phases) {
        at(phase, 'composite');
        assert.equal(state.sourceWorld, sourceWorld);
        assert.equal(state.hero, hero);
        assert.equal(state.work, work);
        assertNear(state.progress, phase);
      }
      if (crossing === 'loop') {
        at((4.05 - start) / (end - start), 'composite');
        assert.ok(state.progress > 0 && state.progress < 1);
      }
    }
  });

  test(`${crossing} latches late/lost prerequisites and reduced motion until either recovery boundary`, (t) => {
    const required = [
      'sourceWorld',
      'hero',
      ...(crossing === 'work' ? ['work'] : []),
      'reduced',
    ];
    for (const [sourceWorld, missing, when, endpoint] of combinations(
      ['hero', 'orbital'],
      required,
      ['entry', 'midway'],
      [0, 1],
    )) {
      const { state, at } = crossingFixture(t, crossing, sourceWorld);
      const saved = state[missing];
      const phases =
        sourceWorld === forwardWorld
          ? [0.2, 0.25, 0.4, 0.5, 0.7, 0.8, 0.4]
          : [0.8, 0.75, 0.6, 0.5, 0.3, 0.2, 0.6];
      if (when === 'midway') {
        at(phases[0], 'composite');
      }
      if (missing !== 'reduced') {
        state[missing] = null;
      }
      for (const [index, phase] of phases.entries()) {
        if (index === 1 && missing !== 'reduced') {
          state[missing] = saved;
        }
        const mode = index === 0 && missing === 'reduced' ? 'reduced' : 'full';
        at(phase, 'live', mode);
      }
      assert.equal(at(endpoint, 'live'), state.journey);
      state.sourceWorld = handoff.worldAtProgress(state.journey);
      at(endpoint === 0 ? 0.1 : 0.9, 'composite');
    }
  });
}

test('the two crossings never overlap and ordinary wrapped chapters remain live', (t) => {
  const state = preparedHandoff(t, 'hero');
  const journeys = Array.from(
    { length: 410 },
    (_, index) => (index + 0.5) / 100,
  );
  for (const journey of [
    ...journeys,
    LOOP_END,
    DIVE_START,
    HANDOFF_START,
    HANDOFF_END,
    2.55,
    3.15,
  ]) {
    state.journey = journey;
    let expected = null;
    if (journey < LOOP_END || journey > LOOP_START) {
      expected = 'loop';
    } else if (journey > HANDOFF_START && journey < HANDOFF_END) {
      expected = 'work';
    }
    const loop = handoff.loopHandoffProgress(journey);
    const work = handoff.heroHandoffProgress(journey);
    assert.ok(!(loop > 0 && loop < 1 && work > 0 && work < 1));
    const rendered = handoff.sampleHeroHandoff(state, 'full');
    assert.equal(state.crossing, expected, `journey ${journey}`);
    if (expected === null) {
      assert.ok(loop === 0 || loop === 1);
      assertHandoff(state, [
        null,
        false,
        1 - work,
        handoff.workSectionOpacity(journey),
      ]);
      assert.equal(rendered, journey);
      state.sourceWorld = handoff.worldAtProgress(rendered);
    }
  }
});

test('the shared world classifier recognizes rendered endpoints across positive and negative laps', () => {
  for (const lap of laps) {
    for (const [progress, expected] of [
      [0, 'hero'],
      [LOOP_END, 'hero'],
      [DIVE_START, 'hero'],
      [HANDOFF_START, 'hero'],
      [HANDOFF_END, 'orbital'],
      [descent.WORK_STONE.center, 'orbital'],
      [descent.PROJECT_STONE.center, 'orbital'],
      [descent.TECH_STONE.center, 'orbital'],
      [LOOP_START, 'orbital'],
      [4.05, 'orbital'],
    ]) {
      assert.equal(
        handoff.worldAtProgress(progress + lap * DIVE_LENGTH),
        expected,
        `progress ${progress}, lap ${lap}`,
      );
    }
  }
});

test('Hero opacity uses the exact half-return cutoff unless compositing', () => {
  const state = handoff.createHeroHandoff();
  state.crossing = 'loop';
  state.journey = crossingJourney('loop', 0.5);
  for (const progress of [0, 0.499999, 0.5, 0.500001, 1]) {
    state.progress = progress;
    for (const compositing of [false, true]) {
      state.compositing = compositing;
      const hero = compositing ? 0 : Number(progress >= 0.5);
      assertHandoff(state, ['loop', compositing, hero, 0]);
    }
  }
});

test('return cuts stay exclusive and curtain-free, with Hero interactive from LOOP_END onward', (t) => {
  const profiles = [
    ['full', 'ready'],
    ['full', 'missing'],
    ['reduced', 'ready'],
  ];
  for (const [[mode, snapshot], direction] of combinations(profiles, [1, -1])) {
    const { state, at } = crossingFixture(
      t,
      'loop',
      direction === 1 ? 'orbital' : 'hero',
    );
    if (snapshot === 'missing') {
      state.hero = null;
    }
    const hero = {
      dataset: {},
      style: {
        setProperty(name, value) {
          this[name] = value;
        },
      },
    };
    const nodes = {
      sections: [hero],
      chapters: [],
      skillLayer: null,
      veil: { style: {} },
    };
    const frame = {
      descent: descent.createDescentFrame(),
      motionMode: mode,
      handoff: state,
    };
    const phases = [0.00001, 0.1, 0.3, 0.49999, 0.50001, 0.7, 0.9, 0.99999];
    if (direction === -1) {
      phases.reverse();
    }
    if (direction === 1) {
      const span = DIVE_LENGTH + LOOP_END - LOOP_START;
      phases.push(
        ...[
          LOOP_END,
          LOOP_END + 0.02,
          LOOP_END + 0.05,
          DIVE_START,
          DIVE_START + 0.02,
          DIVE_START + 0.05,
          HANDOFF_START,
        ].map((journey) => 1 + (journey - LOOP_END) / span),
      );
    }
    for (const phase of phases) {
      const active = phase < 1;
      const compositing = active && mode === 'full' && snapshot === 'ready';
      const rendered = at(phase, compositing ? 'composite' : 'live', mode);
      if (!active) {
        assert.equal(handoff.loopHandoffProgress(state.journey), 1);
        assertHandoff(state, [null, false, 1, 0]);
      }
      const opacity = compositing ? 0 : Number(phase >= 0.5);
      frame.progress = state.journey;
      descent.writeDescentFrame(frame.descent, rendered);
      overlay.applyOverlay(nodes, frame);
      assert.equal(hero.style.opacity, String(opacity));
      assert.equal(hero.style['--reveal'], String(opacity));
      assert.equal(hero.inert, opacity === 0);
      assert.equal(hero.style.visibility, opacity === 0 ? 'hidden' : 'visible');
      assert.equal(hero.style.transform, '');
      assert.equal(Number(nodes.veil.style.opacity), 0);
    }
  }
});

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
        }
      },
    };
    state.journey =
      sourceWorld === 'hero' ? DIVE_START : descent.WORK_STONE.center;
    effect.update(renderer, input);
    assert.equal(state.sourceWorld, sourceWorld);
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
