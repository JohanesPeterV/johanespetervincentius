'use client';

import { useConfig } from '@/hooks/use-config';
import { baseColors } from '@/registry/registry-base-colors';
import { useTheme } from 'next-themes';

export function ThemeSwitcher() {
  const [config] = useConfig();
  const { resolvedTheme } = useTheme();

  if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') return null;

  const color = baseColors.find((color) => color.name === config.theme)
    ?.cssVars[resolvedTheme];

  if (!color) return null;

  for (const [key, value] of Object.entries(color)) {
    document.documentElement.style.setProperty(`--${key}`, value);
  }

  return null;
}
