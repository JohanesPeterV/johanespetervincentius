import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hslCssToHex(hsl: string): number {
  const [h, s, l] = hsl
    .replace(/%/g, '')
    .split(' ')
    .map((val) => parseFloat(val)); // ✅ Fix parseFloat issue

  const rgb = hslToRgb(h / 360, s / 100, l / 100);

  return Number(
    '0x' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join(''),
  );
}
export function darkenHsl(hsl: string, amount: number): string {
  const [h, s, l] = hsl.replace(/%/g, '').split(' ').map(parseFloat); // Parse H, S, L values

  const darkenedL = Math.max(l - amount, 0); // Reduce lightness but keep ≥ 0

  return `${h} ${s}% ${darkenedL}%`; // Keep the original format
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l * 255, l * 255, l * 255];

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t: number) => {
    t = (t + 1) % 1;
    return (
      (t < 1 / 6
        ? p + (q - p) * 6 * t
        : t < 1 / 2
          ? q
          : t < 2 / 3
            ? p + (q - p) * (2 / 3 - t) * 6
            : p) * 255
    );
  };

  return [hue(h + 1 / 3), hue(h), hue(h - 1 / 3)];
}
