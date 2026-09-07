'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import { Shuffle } from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  nextStarfieldFormationAtom,
  starfieldStatusAtom,
} from './starfield-controls';

export default function StarfieldNextButton() {
  const status = useAtomValue(starfieldStatusAtom);
  const nextFormation = useSetAtom(nextStarfieldFormationAtom);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="absolute bottom-5 left-6 h-11 w-11 p-0 sm:bottom-7 sm:w-auto sm:px-3"
      aria-label="Next star formation"
      title="Next star formation"
      disabled={status !== 'ready'}
      onClick={() => nextFormation()}
    >
      <Shuffle aria-hidden />
      <span className="hidden sm:inline">Next formation</span>
    </Button>
  );
}
