'use client';

import { useState } from 'react';

import AtmosphereCompass from './atmosphere-compass';
import type { DiveAppearance } from './dive-palette';
import DiveScene from './dive-scene';

type DiveExperienceParams = {
  initialAppearance: DiveAppearance;
};

export default function DiveExperience({
  initialAppearance,
}: DiveExperienceParams) {
  const [appearance, setAppearance] =
    useState<DiveAppearance>(initialAppearance);

  const handleSelectAppearance = (selectedAppearance: DiveAppearance): void => {
    if (selectedAppearance === appearance) {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('world', selectedAppearance);
    window.history.replaceState(null, '', url);
    setAppearance(selectedAppearance);
  };

  return (
    <>
      <DiveScene appearance={appearance} tierOverride={null} />
      <div
        key={appearance}
        aria-hidden
        className="atmosphere-reveal pointer-events-none fixed inset-0 z-[25] bg-background"
      />
      <AtmosphereCompass
        appearance={appearance}
        onSelect={handleSelectAppearance}
      />
    </>
  );
}
