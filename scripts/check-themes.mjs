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
const { baseColors } = load(
  resolve(root, 'src/registry/registry-base-colors.ts'),
);

test('authored accents reach UI and scene in both modes', () => {
  for (const base of baseColors) {
    if ('primary' in base) {
      const difference = Math.abs(
        parseFloat(base.primary) - parseFloat(base.secondary),
      );
      assert.ok(Math.min(difference, 360 - difference) >= 60, base.label);
    }
    for (const mode of ['light', 'dark']) {
      const authored = themes.getBaseColorPalette(base, mode);
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

test('full themes carry their surfaces into CSS and the scene without leaking into accent pairs', () => {
  const original = themes.getThemeColorValues('blue', 'dark');
  for (const base of baseColors.filter((base) => 'dark' in base)) {
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
  assert.deepEqual(themes.getThemeColorValues('blue', 'dark'), original);
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

test('accent pairs retain the shared neutral surfaces', () => {
  for (const mode of ['light', 'dark']) {
    const reference = palette.getDivePalette(
      themes.getFluidThemeColors('blue', mode),
    );
    for (const base of baseColors.filter((base) => 'primary' in base)) {
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
