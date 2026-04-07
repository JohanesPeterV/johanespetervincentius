'use client';

import { useConfig } from '@/hooks/use-config';
import { getThemeColorValues } from '@/lib/theme-colors';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export function ThemeSwitcher() {
  const [config] = useConfig();
  const { resolvedTheme } = useTheme();

  // REASON: inline render mutation writes CSS variables during render — move documentElement updates to an effect so render stays pure
  useEffect(() => {
    if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') {
      return;
    }

    const { cssVars } = getThemeColorValues(config.theme, resolvedTheme);

    for (const [key, value] of Object.entries(cssVars)) {
      document.documentElement.style.setProperty(`--${key}`, value);
    }
  }, [config.theme, resolvedTheme]);

  return null;
}
