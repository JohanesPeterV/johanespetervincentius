'use client';

import { useTheme } from 'next-themes';

import { useConfig } from '@/hooks/use-config';
import { getFluidThemeColors } from '@/lib/theme-colors';
import { getDivePalette } from './dive-palette';

export const useDivePalette = () => {
  const [{ theme }] = useConfig();
  const { resolvedTheme } = useTheme();
  return getDivePalette(getFluidThemeColors(theme, resolvedTheme));
};
