'use client';

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

  return (
    <div
      role="group"
      aria-label="Accent colour"
      className="fixed right-4 top-4 z-30 flex items-center gap-2.5 rounded-full border border-border/60 bg-background/75 px-3.5 py-2.5 shadow-2xl ring-1 ring-foreground/5 backdrop-blur-2xl sm:right-7 sm:top-7"
    >
      {baseColors.map((baseColor) => {
        const isSelected = baseColor.name === config.theme;

        return (
          <button
            key={baseColor.name}
            type="button"
            aria-label={baseColor.label}
            aria-pressed={isSelected}
            onClick={() => {
              setConfig({ ...config, theme: baseColor.name });
            }}
            style={getSwatchStyle(baseColor.activeColor)}
            className={`h-2.5 w-2.5 rounded-full bg-[--swatch-light] transition-[opacity,transform] duration-300 ease-out hover:scale-125 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none dark:bg-[--swatch-dark] ${
              isSelected ? 'scale-150 opacity-100' : 'opacity-35'
            }`}
          />
        );
      })}
    </div>
  );
}
