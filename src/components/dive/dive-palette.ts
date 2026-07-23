import { Color } from 'three';

import type { DescentFrame } from './descent';
import { finaleBoost, seamBoost } from './descent';

export type DiveAppearance = 'igloo' | 'space';

type ThemeColors = {
  backgroundColor: string;
  fluidColor: string;
  textColor: string;
};

type RgbColor = [number, number, number];

export type DivePalette = {
  accent: string;
  accentRgb: RgbColor;
  appearance: DiveAppearance;
  background: string;
  backgroundRgb: RgbColor;
  exposure: number;
  foreground: string;
  foregroundRgb: RgbColor;
  fogDensity: number;
  loaderForeground: string;
  loaderTrack: string;
  rock: string;
};

const toRgbColor = (value: string): RgbColor => {
  const color = new Color(value);
  return [color.r, color.g, color.b];
};

const blendColor = (from: string, to: string, amount: number): string => {
  return new Color(from).lerp(new Color(to), amount).getStyle();
};

export const getDivePalette = (
  appearance: DiveAppearance,
  themeColors: ThemeColors,
): DivePalette => {
  if (appearance === 'igloo') {
    return {
      accent: '#9fd0ee',
      accentRgb: toRgbColor('#9fd0ee'),
      appearance,
      background: '#aeb5bf',
      backgroundRgb: toRgbColor('#aeb5bf'),
      exposure: 0.44,
      foreground: '#ffffff',
      foregroundRgb: toRgbColor('#ffffff'),
      fogDensity: 0.05,
      loaderForeground: '#29313a',
      loaderTrack: '#89919a',
      rock: '#7890a7',
    };
  }

  return {
    accent: themeColors.fluidColor,
    accentRgb: toRgbColor(themeColors.fluidColor),
    appearance,
    background: themeColors.backgroundColor,
    backgroundRgb: toRgbColor(themeColors.backgroundColor),
    exposure: 0.78,
    foreground: themeColors.textColor,
    foregroundRgb: toRgbColor(themeColors.textColor),
    fogDensity: 0.024,
    loaderForeground: themeColors.textColor,
    loaderTrack: blendColor(
      themeColors.backgroundColor,
      themeColors.textColor,
      0.24,
    ),
    rock: blendColor(themeColors.fluidColor, themeColors.textColor, 0.34),
  };
};

const blendChannel = (from: number, to: number, amount: number): number => {
  return from + (to - from) * amount;
};

export const applyDivePalette = (
  frame: DescentFrame,
  palette: DivePalette,
  progress: number,
): void => {
  if (palette.appearance === 'igloo') {
    return;
  }

  const transition = Math.max(seamBoost(progress), finaleBoost(progress));
  const accentAmount = 0.08 + transition * 0.3 + frame.glow * 0.2;
  const veilAmount = 0.42 + transition * 0.32;

  frame.fogColor[0] = blendChannel(
    palette.backgroundRgb[0],
    palette.accentRgb[0],
    accentAmount,
  );
  frame.fogColor[1] = blendChannel(
    palette.backgroundRgb[1],
    palette.accentRgb[1],
    accentAmount,
  );
  frame.fogColor[2] = blendChannel(
    palette.backgroundRgb[2],
    palette.accentRgb[2],
    accentAmount,
  );
  frame.veilColor[0] = blendChannel(
    palette.backgroundRgb[0],
    palette.foregroundRgb[0],
    veilAmount,
  );
  frame.veilColor[1] = blendChannel(
    palette.backgroundRgb[1],
    palette.foregroundRgb[1],
    veilAmount,
  );
  frame.veilColor[2] = blendChannel(
    palette.backgroundRgb[2],
    palette.foregroundRgb[2],
    veilAmount,
  );
  frame.fogDensity = Math.max(0.014, frame.fogDensity * 0.58);
  frame.glow = Math.max(frame.glow, transition * 0.16);
};
