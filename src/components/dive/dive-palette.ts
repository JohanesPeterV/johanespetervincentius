import { Color } from 'three';
import type { getFluidThemeColors } from '@/lib/theme-colors';

import type { DescentFrame } from './descent';
import { finaleBoost, seamBoost } from './descent';

type RgbColor = [number, number, number];

export type DivePalette = {
  mode: ReturnType<typeof getFluidThemeColors>['mode'];
  accent: string;
  background: string;
  backgroundRgb: RgbColor;
  exposure: number;
  etch: string;
  foreground: string;
  fogDensity: number;
  highlight: string;
  litInk: string;
  metal: string;
  shadowInk: string;
  sunlight: string;
  surface: string;
};

const luminance = (color: Color): number =>
  color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;

const toRgbColor = (value: string): RgbColor => {
  const color = new Color(value).convertLinearToSRGB();
  return [color.r, color.g, color.b];
};

export const getDivePalette = (
  theme: ReturnType<typeof getFluidThemeColors>,
): DivePalette => {
  const accent = new Color(theme.fluidColor);
  const secondary = new Color(theme.secondaryColor);
  const background = new Color(theme.backgroundColor);
  const foreground = new Color(theme.textColor);
  // REASON: in the dark, surfaces shade from white light to black shadow. On
  // paper a print has no grey: highlights are paper and shading is remapped to
  // the two authored colours, the lighter one lit and the darker one in shadow.
  const sunlight = theme.mode === 'dark' ? foreground : background;
  const [litInk, shadowInk] =
    theme.mode === 'dark'
      ? [foreground, background]
      : [accent, secondary].sort((a, b) => luminance(b) - luminance(a));
  // REASON: on paper the engraving is the raw second ink. In the dark that
  // pigment glares and every wrinkle of the etch shows, so it thins to a
  // faintly tinted grey.
  const etch =
    theme.mode === 'dark'
      ? foreground.clone().lerp(secondary, 0.25).lerp(background, 0.6)
      : secondary;
  return {
    mode: theme.mode,
    accent: accent.getStyle(),
    background: background.getStyle(),
    backgroundRgb: toRgbColor(background.getStyle()),
    etch: etch.getStyle(),
    exposure: 0.9,
    foreground: foreground.getStyle(),
    fogDensity: 0,
    highlight: secondary.getStyle(),
    litInk: litInk.getStyle(),
    metal: foreground.clone().lerp(background, 0.28).getStyle(),
    shadowInk: shadowInk.getStyle(),
    sunlight: sunlight.getStyle(),
    surface: background.clone().lerp(foreground, 0.025).getStyle(),
  };
};

export const applyDivePalette = (
  frame: DescentFrame,
  palette: DivePalette,
  progress: number,
): void => {
  const seam = seamBoost(progress);
  const transition = Math.max(seam, finaleBoost(progress));
  frame.fogColor[0] = palette.backgroundRgb[0];
  frame.fogColor[1] = palette.backgroundRgb[1];
  frame.fogColor[2] = palette.backgroundRgb[2];
  frame.veilColor[0] = palette.backgroundRgb[0];
  frame.veilColor[1] = palette.backgroundRgb[1];
  frame.veilColor[2] = palette.backgroundRgb[2];
  // REASON: the compositor owns the crossing; the sky keeps its clean void
  // instead of washing the stars and eye silhouettes out with coloured mist.
  frame.veil *= 1 - seam;
  frame.fogDensity = palette.fogDensity;
  frame.glow = Math.max(frame.glow, transition * 0.16);
};
