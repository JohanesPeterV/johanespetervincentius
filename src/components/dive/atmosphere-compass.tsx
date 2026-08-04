'use client';

import type { MouseEvent } from 'react';

import type { DiveAppearance } from './dive-palette';

type AtmosphereCompassParams = {
  appearance: DiveAppearance;
  onSelect: (appearance: DiveAppearance) => void;
};

type AtmosphereOption = {
  appearance: DiveAppearance;
  description: string;
};

const APPEARANCE_LABELS: Record<DiveAppearance, string> = {
  coffee: 'Coffee',
  igloo: 'Igloo',
  space: 'Space',
};

const ATMOSPHERES: AtmosphereOption[] = [
  { appearance: 'coffee', description: 'Warm earth' },
  { appearance: 'space', description: 'Deep orbit' },
  { appearance: 'igloo', description: 'Polar light' },
];

export default function AtmosphereCompass({
  appearance,
  onSelect,
}: AtmosphereCompassParams) {
  const handleSelect = (
    event: MouseEvent<HTMLButtonElement>,
    selectedAppearance: DiveAppearance,
  ): void => {
    onSelect(selectedAppearance);
    event.currentTarget.closest('details')?.removeAttribute('open');
  };

  return (
    <details className="group pointer-events-auto fixed right-4 top-4 z-30 font-mono sm:right-7 sm:top-7">
      <summary
        aria-label={`Choose atmosphere. Current atmosphere: ${APPEARANCE_LABELS[appearance]}`}
        className="flex cursor-pointer list-none items-center gap-3 rounded-full border border-border/60 bg-background/75 py-2 pl-2 pr-4 text-foreground shadow-2xl ring-1 ring-foreground/5 backdrop-blur-2xl transition-colors hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"
      >
        <span
          aria-hidden
          className="relative flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-muted/60"
        >
          <span className="absolute h-5 w-5 rounded-full border border-foreground/25" />
          <span className="absolute left-1/2 top-1 h-1 w-1 -translate-x-1/2 rounded-full bg-foreground/60" />
          <span className="h-2 w-2 rounded-full bg-primary ring-4 ring-primary/15" />
        </span>
        <span className="flex flex-col text-left leading-none">
          <span className="text-[0.55rem] font-medium tracking-[0.24em] text-muted-foreground">
            WORLD
          </span>
          <span className="mt-1 text-xs font-medium tracking-[0.12em]">
            {APPEARANCE_LABELS[appearance]}
          </span>
        </span>
        <span
          aria-hidden
          className="ml-1 h-1.5 w-1.5 rotate-45 border-b border-r border-muted-foreground transition-transform group-open:-rotate-135"
        />
      </summary>

      <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-3xl border border-border/60 bg-background/80 p-2 text-foreground shadow-2xl ring-1 ring-foreground/5 backdrop-blur-2xl motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95">
        <div className="px-3 pb-2 pt-3">
          <p className="text-[0.6rem] font-medium tracking-[0.24em] text-muted-foreground">
            CHOOSE A WORLD
          </p>
        </div>
        <div role="group" aria-label="Atmosphere">
          {ATMOSPHERES.map((option, index) => {
            const isSelected = option.appearance === appearance;
            return (
              <button
                key={option.appearance}
                type="button"
                aria-pressed={isSelected}
                onClick={(event) => {
                  handleSelect(event, option.appearance);
                }}
                className="group/option flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="w-5 text-[0.6rem] tabular-nums tracking-[0.14em] text-muted-foreground">
                  0{index + 1}
                </span>
                <span className="flex flex-1 flex-col gap-1">
                  <span className="text-sm font-medium">
                    {APPEARANCE_LABELS[option.appearance]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="flex h-4 w-4 items-center justify-center rounded-full border border-border"
                >
                  {isSelected ? (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </details>
  );
}
