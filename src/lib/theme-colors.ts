import { hslCssToHex } from '@/lib/utils';
import {
  BaseColor,
  baseColors,
  DEFAULT_BASE_COLOR,
} from '@/registry/registry-base-colors';

type ThemeMode = 'light' | 'dark';

const neutralSurfaces = {
  light: {
    // REASON: light mode is riso on paper, so the ground is warm off-white
    // stock rather than screen white. The card surface stays pure white so it
    // lifts off the sheet, and every other neutral carries the same warmth so
    // nothing reads cold against it.
    background: '38 18% 94%',
    foreground: '30 8% 9%',
    surface: '0 0% 100%',
    muted: '38 14% 89%',
    mutedForeground: '38 6% 38%',
    border: '38 12% 83%',
  },
  dark: {
    background: '0 0% 0%',
    foreground: '0 0% 98%',
    surface: '240 10% 4%',
    muted: '240 8% 8%',
    mutedForeground: '240 6% 72%',
    border: '240 8% 24%',
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

  // REASON: small coloured text needs its own contrast adjustment. Applying
  // this to fills would turn cobalt pastel and citron olive.
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

const getColorForeground = (color: string): string => {
  const ink =
    getContrast(color, neutralSurfaces.light.foreground) >= 4.5
      ? neutralSurfaces.light.foreground
      : '0 0% 0%';
  const paper = neutralSurfaces.light.surface;
  return getContrast(color, ink) > getContrast(color, paper) ? ink : paper;
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
  const [hue, saturation] = base.primary.split(' ').map(parseFloat);
  const accent = `${hue} ${saturation * 0.3}% ${mode === 'light' ? 89 : 18}%`;
  const primaryText = getReadableColor(base.primary, [neutral.muted, accent]);
  const destructive = getReadableColor('0 72% 50%', [neutral.muted]);

  return {
    mode,
    cssVars: {
      background: neutral.background,
      foreground: neutral.foreground,
      card: neutral.surface,
      'card-foreground': neutral.foreground,
      popover: neutral.surface,
      'popover-foreground': neutral.foreground,
      primary: base.primary,
      'primary-foreground': getColorForeground(base.primary),
      'primary-text': primaryText,
      secondary: base.secondary,
      'secondary-foreground': getColorForeground(base.secondary),
      muted: neutral.muted,
      'muted-foreground': neutral.mutedForeground,
      accent,
      'accent-foreground': neutral.foreground,
      destructive,
      'destructive-foreground': getColorForeground(destructive),
      border: neutral.border,
      input: neutral.border,
      ring: primaryText,
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
