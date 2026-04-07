import { darkenHsl, hslCssToHex } from '@/lib/utils';
import {
  BaseColor,
  baseColors,
  DEFAULT_BASE_COLOR,
} from '@/registry/registry-base-colors';

type ThemeMode = 'light' | 'dark';
type ThemeCssVars = {
  background: string;
  foreground: string;
  card: string;
  'card-foreground': string;
  popover: string;
  'popover-foreground': string;
  primary: string;
  'primary-foreground': string;
  secondary: string;
  'secondary-foreground': string;
  muted: string;
  'muted-foreground': string;
  accent: string;
  'accent-foreground': string;
  destructive: string;
  'destructive-foreground': string;
  border: string;
  input: string;
  ring: string;
  radius?: string;
  'chart-1': string;
  'chart-2': string;
  'chart-3': string;
  'chart-4': string;
  'chart-5': string;
};

type ThemeColorValues = {
  mode: ThemeMode;
  activeColor: string;
  cssVars: ThemeCssVars;
};

type FluidThemeColors = {
  backgroundColor: string;
  fluidColor: string;
  textColor: string;
};

const isThemeMode = (
  resolvedTheme: string | undefined,
): resolvedTheme is ThemeMode => {
  return resolvedTheme === 'light' || resolvedTheme === 'dark';
};

export const getThemeMode = (resolvedTheme: string | undefined): ThemeMode => {
  if (isThemeMode(resolvedTheme)) {
    return resolvedTheme;
  }

  return 'dark';
};

export const getBaseColor = (themeName: BaseColor['name']) => {
  return (
    baseColors.find(({ name }) => name === themeName) ?? DEFAULT_BASE_COLOR
  );
};

export const getThemeColorValues = (
  themeName: BaseColor['name'],
  resolvedTheme: string | undefined,
): ThemeColorValues => {
  const mode = getThemeMode(resolvedTheme);
  const baseColor = getBaseColor(themeName);

  return {
    mode,
    activeColor: baseColor.activeColor[mode],
    cssVars: baseColor.cssVars[mode],
  };
};

export const getThemeHexColor = (hsl: string): string => {
  return `#${hslCssToHex(hsl).toString(16).padStart(6, '0')}`;
};

export const getFluidThemeColors = (
  themeName: BaseColor['name'],
  resolvedTheme: string | undefined,
): FluidThemeColors => {
  const { mode, activeColor, cssVars } = getThemeColorValues(
    themeName,
    resolvedTheme,
  );

  return {
    backgroundColor: getThemeHexColor(
      darkenHsl(cssVars.background, mode === 'dark' ? 0 : 5),
    ),
    fluidColor: getThemeHexColor(activeColor),
    textColor: getThemeHexColor(cssVars.foreground),
  };
};
