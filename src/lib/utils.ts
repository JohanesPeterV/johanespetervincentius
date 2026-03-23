import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hslCssToHex(hsl: string): number {
  const [h, s, l] = hsl
    .replace(/%/g, '')
    .split(' ')
    .map((val) => parseFloat(val));

  const rgb = hslToRgb(h / 360, s / 100, l / 100);

  return Number(
    '0x' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join(''),
  );
}
export function darkenHsl(hsl: string, amount: number): string {
  const [h, s, l] = hsl.replace(/%/g, '').split(' ').map(parseFloat);

  const darkenedL = Math.max(l - amount, 0);

  return `${h} ${s}% ${darkenedL}%`;
}

function hueToChannel(p: number, q: number, t: number): number {
  const normalizedT = (t + 1) % 1;

  if (normalizedT < 1 / 6) {
    return p + (q - p) * 6 * normalizedT;
  }
  if (normalizedT < 1 / 2) {
    return q;
  }
  if (normalizedT < 2 / 3) {
    return p + (q - p) * (2 / 3 - normalizedT) * 6;
  }
  return p;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    return [l * 255, l * 255, l * 255];
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return [
    hueToChannel(p, q, h + 1 / 3) * 255,
    hueToChannel(p, q, h) * 255,
    hueToChannel(p, q, h - 1 / 3) * 255,
  ];
}
