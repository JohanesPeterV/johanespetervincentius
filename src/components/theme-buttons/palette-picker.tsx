'use client';

import { SunMoon } from 'lucide-react';
import { useTheme } from 'next-themes';

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

  return (
    <div
      role="group"
      aria-label="Appearance"
      className="fixed right-4 top-4 z-30 flex items-center rounded-full border border-border/60 bg-background/65 p-1 shadow-lg ring-1 ring-foreground/5 backdrop-blur-2xl sm:right-7 sm:top-7"
    >
      <span
        aria-hidden
        className="hidden min-w-20 pl-3 pr-2 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground sm:block"
      >
        {config.theme}
      </span>
      {baseColors.map((baseColor) => {
        const isSelected = baseColor.name === config.theme;

        return (
          <button
            key={baseColor.name}
            type="button"
            aria-label={baseColor.label}
            title={`${baseColor.label} colourway`}
            aria-pressed={isSelected}
            onClick={() => {
              setConfig({ ...config, theme: baseColor.name });
            }}
            style={getSwatchStyle(baseColor.activeColor)}
            className="group flex h-9 w-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-9"
          >
            <span
              className={`h-2.5 w-2.5 rounded-full bg-[--swatch-light] transition-[opacity,transform,box-shadow] duration-300 group-hover:scale-125 group-hover:opacity-100 motion-reduce:transition-none dark:bg-[--swatch-dark] ${
                isSelected
                  ? 'scale-110 opacity-100 ring-1 ring-foreground/40 ring-offset-4 ring-offset-background'
                  : 'opacity-40'
              }`}
            />
          </button>
        );
      })}
      <button
        type="button"
        aria-label="Toggle light/dark mode"
        title="Toggle light/dark mode"
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border-l border-border/60 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <SunMoon size={15} aria-hidden />
      </button>
    </div>
  );
}
