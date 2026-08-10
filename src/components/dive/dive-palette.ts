import { Color } from 'three';

import type { DescentFrame } from './descent';
import { finaleBoost, seamBoost } from './descent';

type RgbColor = [number, number, number];

export type DivePalette = {
  accent: string;
  accentRgb: RgbColor;
  background: string;
  backgroundRgb: RgbColor;
  exposure: number;
  foreground: string;
  foregroundRgb: RgbColor;
  fogDensity: number;
  rock: string;
  stone: string;
};

const toRgbColor = (value: string): RgbColor => {
  const color = new Color(value);
  return [color.r, color.g, color.b];
};

// REASON: the coffee world is hue-locked by design - its warm hue in a
// cold-dark frame should not react to the base-color theme
export const DIVE_PALETTE: DivePalette = {
  accent: '#d08a3e',
  accentRgb: toRgbColor('#d08a3e'),
  background: '#0d0805',
  backgroundRgb: toRgbColor('#0d0805'),
  exposure: 0.72,
  foreground: '#f3e7d3',
  foregroundRgb: toRgbColor('#f3e7d3'),
  fogDensity: 0.03,
  rock: '#3f2818',
  stone: '#b07c46',
};

const blendChannel = (from: number, to: number, amount: number): number => {
  return from + (to - from) * amount;
};

const SEAM_MIST_DENSITY = 0.055;

export const applyDivePalette = (
  frame: DescentFrame,
  palette: DivePalette,
  progress: number,
): void => {
  const seam = seamBoost(progress);
  const transition = Math.max(seam, finaleBoost(progress));
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
  // REASON: the shared descent keys flash a bright veil across the seam, which
  // strobes on this dark grade - the crossing reads as a breath of accent-lit
  // mist instead, so the veil is muted and fog density carries the handoff
  frame.veil *= 1 - seam;
  frame.fogDensity =
    Math.max(0.014, frame.fogDensity * 0.58) + seam * SEAM_MIST_DENSITY;
  frame.glow = Math.max(frame.glow, transition * 0.16);
};
