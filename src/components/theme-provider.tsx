'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Provider as JotaiProvider } from 'jotai';

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <JotaiProvider>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>Z
    </JotaiProvider>
  );
}
