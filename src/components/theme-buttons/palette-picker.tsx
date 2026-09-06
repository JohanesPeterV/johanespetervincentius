'use client';

import { Moon, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useId, useState } from 'react';

import { useConfig } from '@/hooks/use-config';
import { BaseColor, baseColors } from '@/registry/registry-base-colors';

type SwatchStyle = React.CSSProperties & {
  '--swatch-light': string;
  '--swatch-dark': string;
};

const getSwatchStyle = (
  activeColor: BaseColor['activeColor'],
): SwatchStyle => ({
  '--swatch-light': `hsl(${activeColor.light})`,
  '--swatch-dark': `hsl(${activeColor.dark})`,
});

export default function PalettePicker() {
  const [config, setConfig] = useConfig();
  const { resolvedTheme, setTheme } = useTheme();
  const panelId = useId();
  const titleId = useId();
  const [hydrated, setHydrated] = useState(false);

  // REASON: the server cannot read the saved mode. Wait for hydration before
  // exposing selected mode attributes so the initial markup agrees.
  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <div className="fixed right-4 top-4 z-30 sm:right-7 sm:top-7">
      <button
        type="button"
        aria-label="Change theme"
        title="Change theme"
        popoverTarget={panelId}
        onKeyDown={(event) => event.stopPropagation()}
        className="appearance-trigger flex h-11 items-center justify-center gap-2 px-3"
      >
        <span aria-hidden className="appearance-orb" />
        <span className="type-label">Theme</span>
      </button>
      <div
        id={panelId}
        popover="auto"
        role="dialog"
        aria-labelledby={titleId}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerMove={(event) => event.stopPropagation()}
        onPointerUp={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        className="appearance-panel fixed bottom-auto left-auto right-4 top-[4.75rem] m-0 w-72 max-w-[calc(100vw-2rem)] p-5 sm:right-7 sm:top-[5.5rem]"
      >
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="font-display text-sm font-medium">
            Appearance
          </h2>
          <button
            type="button"
            aria-label="Close appearance"
            popoverTarget={panelId}
            popoverTargetAction="hide"
            className="appearance-close -mr-3 flex h-11 w-11 items-center justify-center"
          >
            <X size={14} aria-hidden />
          </button>
        </div>
        <div className="mb-2 mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Colour</span>
          <span className="capitalize">{config.theme}</span>
        </div>
        <div role="group" aria-label="Colour" className="flex justify-between">
          {baseColors.map((baseColor) => (
            <button
              key={baseColor.name}
              type="button"
              aria-label={baseColor.label}
              title={baseColor.label}
              aria-pressed={baseColor.name === config.theme}
              onClick={() => setConfig({ ...config, theme: baseColor.name })}
              style={getSwatchStyle(baseColor.activeColor)}
              className="appearance-swatch flex h-11 w-8 items-center justify-center"
            >
              <span aria-hidden />
            </button>
          ))}
        </div>
        <div role="group" aria-label="Mode" className="mt-5 flex gap-2">
          <button
            type="button"
            aria-pressed={hydrated && resolvedTheme === 'light'}
            onClick={() => setTheme('light')}
            className="appearance-mode flex h-11 flex-1 items-center justify-center gap-2"
          >
            <Sun size={14} aria-hidden />
            Light
          </button>
          <button
            type="button"
            aria-pressed={hydrated && resolvedTheme === 'dark'}
            onClick={() => setTheme('dark')}
            className="appearance-mode flex h-11 flex-1 items-center justify-center gap-2"
          >
            <Moon size={14} aria-hidden />
            Dark
          </button>
        </div>
      </div>
    </div>
  );
}
