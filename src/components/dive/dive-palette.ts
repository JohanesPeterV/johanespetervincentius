import { Color } from 'three';
import type { getFluidThemeColors } from '@/lib/theme-colors';

import type { DescentFrame } from './descent';
import { finaleBoost, seamBoost } from './descent';

type RgbColor = [number, number, number];

export type DivePalette = {
  accent: string;
  accentRgb: RgbColor;
  background: string;
  backgroundRgb: RgbColor;
  celestial: string;
  exposure: number;
  foreground: string;
  fogDensity: number;
  glow: string;
  metal: string;
  surface: string;
};

const toRgbColor = (value: string): RgbColor => {
  const color = new Color(value).convertLinearToSRGB();
  return [color.r, color.g, color.b];
};

export const getDivePalette = (
  theme: ReturnType<typeof getFluidThemeColors>,
): DivePalette => {
  const accent = new Color(theme.fluidColor);
  const background = new Color(theme.backgroundColor);
  const foreground = new Color(theme.textColor);
  const glow = accent.clone();
  const { h } = accent.getHSL({ h: 0, s: 0, l: 0 });
  // REASON: dim red-to-yellow light turns the sky brown. Its cool complement
  // carries the atmosphere while objects retain the selected accent colour.
  if (h <= 1 / 6) {
    glow.offsetHSL(0.5, 0, 0);
  }
  return {
    accent: accent.getStyle(),
    accentRgb: toRgbColor(accent.getStyle()),
    background: background.getStyle(),
    backgroundRgb: toRgbColor(background.getStyle()),
    celestial: accent.clone().lerp(foreground, 0.22).getStyle(),
    exposure: 0.9,
    foreground: foreground.getStyle(),
    fogDensity: 0.003,
    glow: glow.lerp(foreground, 0.18).getStyle(),
    metal: foreground.clone().lerp(background, 0.28).getStyle(),
    surface: background.clone().lerp(foreground, 0.025).getStyle(),
  };
};

const blendChannel = (from: number, to: number, amount: number): number => {
  return from + (to - from) * amount;
};

const SEAM_MIST_DENSITY = 0.003;

export const applyDivePalette = (
  frame: DescentFrame,
  palette: DivePalette,
  progress: number,
): void => {
  const seam = seamBoost(progress);
  const transition = Math.max(seam, finaleBoost(progress));
  const accentAmount = transition * 0.025 + frame.glow * 0.01;

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
  frame.veilColor[0] = palette.backgroundRgb[0];
  frame.veilColor[1] = palette.backgroundRgb[1];
  frame.veilColor[2] = palette.backgroundRgb[2];
  // REASON: the compositor owns the hero crossing. A full-screen veil would
  // obscure its etched edge; a small fog lift carries the later chapter seams.
  frame.veil *= 1 - seam;
  frame.fogDensity = palette.fogDensity + seam * SEAM_MIST_DENSITY;
  frame.glow = Math.max(frame.glow, transition * 0.16);
};
