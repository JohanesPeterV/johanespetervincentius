'use client';

import { Monitor, Moon, SlidersHorizontal, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useId, useState } from 'react';

import { pickRandomColorway, useConfig } from '@/hooks/use-config';
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
    baseColors.find(({ name }) => hydrated && name === config.theme) ??
    DEFAULT_BASE_COLOR;

  // REASON: saved appearance can load before a Suspense boundary hydrates.
  // Keep preference-dependent markup deterministic until this control mounts.
  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <div className="fixed right-4 top-4 z-30 sm:right-7 sm:top-7">
      <div className="appearance-control flex items-center p-1">
        <button
          type="button"
          aria-label="Shuffle colourway"
          title="Shuffle colourway"
          onClick={() =>
            setConfig((current) => pickRandomColorway(current.theme))
          }
          onKeyDown={(event) => event.stopPropagation()}
          className="appearance-trigger appearance-shuffle flex h-11 items-center gap-2 pl-0.5 pr-3"
        >
          <span aria-hidden className="appearance-dial">
            <span key={selected.name} className="appearance-orb" />
          </span>
          <span className="block w-32 text-left">
            <span className="type-label block text-foreground">Shuffle</span>
            <span aria-live="polite" aria-atomic className="type-meta block">
              {selected.label}
            </span>
          </span>
        </button>
        <span aria-hidden className="appearance-divider h-5 w-px" />
        <button
          type="button"
          aria-label="Appearance settings"
          title="Appearance settings"
          popoverTarget={panelId}
          onKeyDown={(event) => event.stopPropagation()}
          className="appearance-trigger flex h-11 w-11 items-center justify-center"
        >
          <SlidersHorizontal size={16} aria-hidden />
        </button>
      </div>
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
                aria-pressed={hydrated && baseColor.name === selected.name}
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
          <p className="type-meta mt-2 text-muted-foreground">
            Your colour is saved.
          </p>
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
