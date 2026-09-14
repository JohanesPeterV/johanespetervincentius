import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { Color } from 'three';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const modules = new Map();

// REASON: exercise the actual TypeScript palette functions with the existing
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
const palette = load(resolve(root, 'src/components/dive/dive-palette.ts'));
const themes = load(resolve(root, 'src/lib/theme-colors.ts'));
const { baseColors, DEFAULT_BASE_COLOR } = load(
  resolve(root, 'src/registry/registry-base-colors.ts'),
);

test('authored accents reach UI and scene in both modes', () => {
  for (const base of baseColors) {
    for (const mode of ['light', 'dark']) {
      const authored = base[mode];
      const resolved = themes.getFluidThemeColors(base.name, mode);
      const { cssVars } = themes.getThemeColorValues(base.name, mode);
      assert.equal(cssVars.primary, authored.primary);
      assert.equal(cssVars.secondary, authored.secondary);
      assert.equal(
        resolved.fluidColor,
        `#${new Color(`hsl(${authored.primary.split(' ').join(',')})`).getHexString()}`,
      );
      assert.equal(
        resolved.secondaryColor,
        `#${new Color(`hsl(${authored.secondary.split(' ').join(',')})`).getHexString()}`,
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

test('theme changes carry their own surfaces into CSS and the scene', () => {
  const original = themes.getThemeColorValues(DEFAULT_BASE_COLOR.name, 'dark');
  for (const base of baseColors) {
    for (const mode of ['light', 'dark']) {
      const { cssVars } = themes.getThemeColorValues(base.name, mode);
      const scene = palette.getDivePalette(
        themes.getFluidThemeColors(base.name, mode),
      );
      for (const token of ['background', 'muted', 'border']) {
        assert.equal(cssVars[token], base[mode][token]);
      }
      assert.equal(cssVars.card, base[mode].surface);
      assert.equal(cssVars.popover, base[mode].surface);
      const background = new Color(
        `hsl(${base[mode].background.split(' ').join(',')})`,
      );
      assert.equal(new Color(scene.background).getHex(), background.getHex());
      assert.notEqual(scene.accent, scene.background);
    }
    assert.notEqual(base.light.background, base.dark.background);
  }
  assert.deepEqual(
    themes.getThemeColorValues(DEFAULT_BASE_COLOR.name, 'dark'),
    original,
  );
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

test('retired custom names fall back to a full theme and never enter shuffle', () => {
  const retired = [
    'red',
    'rose',
    'orange',
    'green',
    'blue',
    'cobalt',
    'yellow',
    'violet',
  ];
  const { pickRandomColorway } = load(resolve(root, 'src/hooks/use-config.ts'));
  for (const name of retired) {
    assert.ok(!baseColors.some((base) => base.name === name));
    for (const mode of ['light', 'dark']) {
      assert.deepEqual(
        themes.getThemeColorValues(name, mode),
        themes.getThemeColorValues(DEFAULT_BASE_COLOR.name, mode),
      );
    }
  }
  for (const base of baseColors) {
    const selected = pickRandomColorway(base.name).theme;
    assert.notEqual(selected, base.name);
    assert.ok(baseColors.some((candidate) => candidate.name === selected));
  }
});
