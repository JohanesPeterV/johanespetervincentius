'use client';

import { Monitor, Moon, Shuffle, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useId, useState } from 'react';

import { pickRandomColorway, useConfig } from '@/hooks/use-config';
import { Button } from '@/components/ui/button';
import {
  baseColors,
  DEFAULT_BASE_COLOR,
} from '@/registry/registry-base-colors';

const THEME_MODES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function PalettePicker() {
  const [config, setConfig] = useConfig();
  const { theme, setTheme } = useTheme();
  const panelId = useId();
  const titleId = useId();
  const [hydrated, setHydrated] = useState(false);
  const selected =
    baseColors.find(({ name }) => name === config.theme) ?? DEFAULT_BASE_COLOR;

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
        className="appearance-panel fixed bottom-auto left-auto right-4 top-[4.75rem] m-0 max-h-[calc(100svh-6rem)] w-72 max-w-[calc(100vw-2rem)] flex-col p-5 sm:right-7 sm:top-[5.5rem] [&:popover-open]:flex"
      >
        <div className="flex shrink-0 items-center justify-between">
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
        <div className="-m-1.5 min-h-0 overflow-y-auto overscroll-contain p-1.5">
          <div className="mb-2 mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Colourway</span>
            <span>{selected.label}</span>
          </div>
          <div
            role="group"
            aria-label="Colour"
            className="grid grid-cols-4 gap-1"
          >
            {baseColors.map((baseColor) => (
              <button
                key={baseColor.name}
                type="button"
                aria-label={baseColor.label}
                title={baseColor.label}
                aria-pressed={baseColor.name === config.theme}
                onClick={() => setConfig({ theme: baseColor.name })}
                className="appearance-swatch flex h-11 items-center justify-center"
              >
                <span
                  aria-hidden
                  style={{
                    background: `linear-gradient(135deg, hsl(${baseColor.primary}) 60%, hsl(${baseColor.secondary}) 60%)`,
                  }}
                />
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="type-meta text-muted-foreground">
              Your colour is saved.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-11"
              onClick={() =>
                setConfig((current) => pickRandomColorway(current.theme))
              }
            >
              <Shuffle aria-hidden />
              Shuffle
            </Button>
          </div>
          <div
            role="group"
            aria-label="Mode"
            className="mt-5 grid grid-cols-3 gap-2"
          >
            {THEME_MODES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-pressed={hydrated && theme === value}
                onClick={() => setTheme(value)}
                className="appearance-mode choice-control flex h-11 items-center justify-center gap-1.5"
              >
                <Icon size={14} aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
