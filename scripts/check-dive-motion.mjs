import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { CanvasTexture, Color, Vector2 } from 'three';

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
const story = load(resolve(root, 'src/components/dive/work-story.ts'));
const input = load(resolve(root, 'src/components/dive/dive-input.ts'));
const palette = load(resolve(root, 'src/components/dive/dive-palette.ts'));
const themes = load(resolve(root, 'src/lib/theme-colors.ts'));
const { baseColors } = load(
  resolve(root, 'src/registry/registry-base-colors.ts'),
);
const world = load(resolve(root, 'src/components/dive/world-layout.ts'));
const labels = load(resolve(root, 'src/components/dive/galaxy-labels.ts'));
const handoff = load(resolve(root, 'src/components/dive/hero-handoff.ts'));

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
  const target = descent.WORK_STONE.center;
  const delta = motion.driveInputDelta({
    target,
    progress: target,
    step: descent.sectionStepDelta(target, 1),
  });
  assert.equal(target + delta, descent.PROJECT_STONE.center);
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

test('one horizontal wheel gesture selects one chapter and absorbs its tail', () => {
  const gesture = { distance: 0, lastAt: 0, consumed: false };
  assert.equal(story.advanceWorkGesture(gesture, { delta: 24, now: 1000 }), 0);
  assert.equal(story.advanceWorkGesture(gesture, { delta: 25, now: 1010 }), 1);
  for (let now = 1020; now <= 1600; now += 10) {
    assert.equal(story.advanceWorkGesture(gesture, { delta: 80, now }), 0);
  }
  assert.equal(
    story.advanceWorkGesture(gesture, { delta: -60, now: 2000 }),
    -1,
  );
});

test('short horizontal gestures do not accumulate across unrelated swipes', () => {
  const gesture = { distance: 0, lastAt: 0, consumed: false };
  assert.equal(story.advanceWorkGesture(gesture, { delta: 30, now: 1000 }), 0);
  assert.equal(story.advanceWorkGesture(gesture, { delta: 30, now: 1300 }), 0);
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

test('work layout reserves mobile reading space and keeps exit controls on screen', () => {
  for (const [width, height] of [
    [320, 568],
    [375, 667],
    [390, 844],
    [768, 1024],
    [1440, 900],
  ]) {
    const layout = story.getWorkLayout(width, height);
    assert.ok(layout.left >= 24);
    assert.ok(layout.left + layout.width <= width - 24);
    assert.ok(layout.top + layout.height <= height - 80);
    assert.ok(layout.height > 250);
    if (width < 768) {
      assert.ok(layout.modelY + layout.modelWidth * 0.22 < layout.top);
    }
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

test('palette samples preserve the sRGB contract of descent keyframes', () => {
  for (const base of baseColors) {
    for (const mode of ['light', 'dark']) {
      const theme = themes.getFluidThemeColors(base.name, mode);
      const resolved = palette.getDivePalette(theme);
      assert.equal(
        new Color(resolved.highlight).getHexString(),
        new Color(theme.secondaryColor).getHexString(),
      );
      const encoded = new Color(theme.fluidColor).convertLinearToSRGB();
      [encoded.r, encoded.g, encoded.b].forEach((channel, index) => {
        assert.ok(Math.abs(resolved.accentRgb[index] - channel) < 0.005);
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

test('reduced star counts keep the same field and all stars behind the scene', () => {
  const full = world.buildStarField(1100);
  const reduced = world.buildStarField(450);
  assert.deepEqual(full.slice(0, reduced.length), reduced);
  for (let index = 0; index < full.length; index += 3) {
    assert.ok(Math.abs(full[index]) <= 75);
    assert.ok(Math.abs(full[index + 1]) <= 70);
    assert.ok(full[index + 2] >= -108 && full[index + 2] <= -8);
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
  assert.equal(handoff.heroHandoffProgress(descent.DIVE_START), 0);
  assert.equal(handoff.heroHandoffProgress(handoff.HANDOFF_START), 0);
  assert.equal(handoff.heroHandoffProgress(handoff.HANDOFF_END), 1);
  assert.equal(handoff.heroHandoffProgress(descent.WORK_STONE.center), 1);
});

test('handoff reveals an already composed Work scene, not the empty current frame', () => {
  const state = handoff.createHeroHandoff();
  const texture = new CanvasTexture();
  state.hero = { texture, width: 1440, height: 900 };
  state.work = { texture, width: 432, height: 585 };
  state.sourceReady = true;
  state.journey = (handoff.HANDOFF_START + handoff.HANDOFF_END) / 2;
  assert.equal(handoff.sampleHeroHandoff(state, 'full'), handoff.HANDOFF_END);
  assert.equal(state.compositing, true);
  assert.ok(Math.abs(state.progress - 0.5) < 1e-9);
  texture.dispose();
});

test('late snapshots never switch rendering strategy halfway through a crossing', () => {
  const state = handoff.createHeroHandoff();
  state.journey = 1.3;
  assert.equal(handoff.sampleHeroHandoff(state, 'full'), 1.3);
  const texture = new CanvasTexture();
  state.hero = { texture, width: 1440, height: 900 };
  state.work = { texture, width: 432, height: 585 };
  state.sourceReady = true;
  state.journey = 1.5;
  assert.equal(handoff.sampleHeroHandoff(state, 'full'), 1.5);
  assert.equal(state.compositing, false);
  state.journey = descent.DIVE_START;
  handoff.sampleHeroHandoff(state, 'full');
  state.journey = 1.3;
  assert.equal(handoff.sampleHeroHandoff(state, 'full'), handoff.HANDOFF_END);
  assert.equal(state.compositing, true);
  texture.dispose();
});

test('reversal retraces the same handoff without swapping source and destination', () => {
  const state = handoff.createHeroHandoff();
  const texture = new CanvasTexture();
  state.hero = { texture, width: 1440, height: 900 };
  state.work = { texture, width: 432, height: 585 };
  state.sourceReady = true;
  const phases = [1.25, 1.45, 1.6, 1.45, 1.25].map((journey) => {
    state.journey = journey;
    assert.equal(handoff.sampleHeroHandoff(state, 'full'), handoff.HANDOFF_END);
    return state.progress;
  });
  assert.equal(phases[0], phases[4]);
  assert.equal(phases[1], phases[3]);
  assert.ok(phases[2] > phases[1]);
  texture.dispose();
});

test('unprepared, reduced-motion, and later chapters retain the live scene', () => {
  const state = handoff.createHeroHandoff();
  state.journey = 1.45;
  assert.equal(handoff.sampleHeroHandoff(state, 'full'), 1.45);
  const texture = new CanvasTexture();
  state.hero = { texture, width: 1440, height: 900 };
  state.work = { texture, width: 432, height: 585 };
  state.sourceReady = true;
  assert.equal(handoff.sampleHeroHandoff(state, 'reduced'), 1.45);
  assert.equal(state.compositing, false);
  for (const journey of [
    handoff.HANDOFF_START,
    handoff.HANDOFF_END,
    2.55,
    3.15,
    4.05,
  ]) {
    state.journey = journey;
    assert.equal(handoff.sampleHeroHandoff(state, 'full'), journey);
    assert.equal(state.compositing, false);
  }
  texture.dispose();
});
