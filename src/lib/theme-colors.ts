import { hslCssToHex } from '@/lib/utils';
import {
  BaseColor,
  baseColors,
  DEFAULT_BASE_COLOR,
} from '@/registry/registry-base-colors';

type ThemeMode = 'light' | 'dark';

const neutralSurfaces = {
  light: {
    // REASON: Latte's base and mantle set light-mode brightness without
    // importing its accent palette or changing the portfolio's dark surfaces.
    background: '220 23% 95%',
    foreground: '224 28% 11%',
    surface: '0 0% 100%',
    muted: '220 22% 92%',
    mutedForeground: '220 12% 37%',
    border: '220 12% 86%',
  },
  dark: {
    background: '224 22% 9%',
    foreground: '220 16% 92%',
    surface: '224 20% 11%',
    muted: '224 18% 15%',
    mutedForeground: '220 10% 66%',
    border: '224 14% 21%',
  },
};

const getLuminance = (hsl: string): number => {
  const hex = hslCssToHex(hsl);
  const [red, green, blue] = [hex >> 16, (hex >> 8) & 255, hex & 255].map(
    (channel) => {
      const value = channel / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    },
  );
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
};

const getContrast = (color: string, background: string): number => {
  const first = getLuminance(color);
  const second = getLuminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
};

const getReadableColor = (color: string, backgrounds: string[]): string => {
  const [hue, saturation, lightness] = color.split(' ').map(parseFloat);
  const direction = getLuminance(backgrounds[0]) < 0.5 ? 1 : -1;

  // REASON: primary also colours small links. Adjust only lightness until
  // contrast exceeds AA, keeping the authored hue and a margin above 4.5:1.
  for (let step = 0; step <= 100; step += 1) {
    const level = Math.max(0, Math.min(100, lightness + step * direction));
    const candidate = `${hue} ${saturation}% ${level}%`;
    if (
      backgrounds.every((background) => getContrast(candidate, background) >= 5)
    ) {
      return candidate;
    }
  }
  throw new Error(`Cannot derive a readable theme colour from ${color}`);
};

const getBaseColor = (themeName: BaseColor['name']): BaseColor => {
  return (
    baseColors.find(({ name }) => name === themeName) ?? DEFAULT_BASE_COLOR
  );
};

export const getThemeColorValues = (
  themeName: BaseColor['name'],
  resolvedTheme: string | undefined,
) => {
  const mode: ThemeMode = resolvedTheme === 'light' ? 'light' : 'dark';
  const base = getBaseColor(themeName);
  const neutral = neutralSurfaces[mode];
  const [hue, saturation] = base.secondary.split(' ').map(parseFloat);
  const secondary = `${hue} ${saturation * 0.55}% ${mode === 'light' ? 90 : 18}%`;
  const primary = getReadableColor(base.primary, [neutral.muted, secondary]);
  const ink = neutralSurfaces.light.foreground;
  const paper = neutralSurfaces.light.surface;

  return {
    mode,
    cssVars: {
      background: neutral.background,
      foreground: neutral.foreground,
      card: neutral.surface,
      'card-foreground': neutral.foreground,
      popover: neutral.surface,
      'popover-foreground': neutral.foreground,
      primary,
      'primary-foreground':
        getContrast(primary, ink) > getContrast(primary, paper) ? ink : paper,
      secondary,
      'secondary-foreground': neutral.foreground,
      muted: neutral.muted,
      'muted-foreground': neutral.mutedForeground,
      accent: secondary,
      'accent-foreground': neutral.foreground,
      destructive: getReadableColor('0 72% 50%', [neutral.muted]),
      'destructive-foreground': mode === 'light' ? paper : ink,
      border: neutral.border,
      input: neutral.border,
      ring: primary,
      radius: '0.5rem',
    },
  };
};

// REASON: server CSS and client theme switching share one token builder, so
// first paint and no-JavaScript rendering cannot drift from the registry.
export const DEFAULT_THEME_CSS = ['light', 'dark']
  .map((mode) => {
    const { cssVars } = getThemeColorValues(DEFAULT_BASE_COLOR.name, mode);
    const declarations = Object.entries(cssVars)
      .map(([key, value]) => `--${key}:${value}`)
      .join(';');
    return `${mode === 'light' ? ':root' : '.dark'}{${declarations}}`;
  })
  .join('');

const getThemeHexColor = (hsl: string): string => {
  return `#${hslCssToHex(hsl).toString(16).padStart(6, '0')}`;
};

export const getFluidThemeColors = (
  themeName: BaseColor['name'],
  resolvedTheme: string | undefined,
) => {
  const base = getBaseColor(themeName);
  const { mode, cssVars } = getThemeColorValues(themeName, resolvedTheme);

  return {
    mode,
    backgroundColor: getThemeHexColor(cssVars.background),
    fluidColor: getThemeHexColor(base.primary),
    secondaryColor: getThemeHexColor(base.secondary),
    textColor: getThemeHexColor(cssVars.foreground),
  };
};
