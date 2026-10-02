'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Armchair, MousePointer2, PawPrint } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';

import { mountMeibel } from './meibel-runtime';
import { MEIBEL_SHEET, type MeibelFollowMode } from './meibel-engine';

export default function Meibel() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<ReturnType<typeof mountMeibel> | null>(null);
  const panelId = useId();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const mouseAvailable = useMediaQuery('(any-pointer: fine)');
  const [followMode, setFollowMode] = useState<MeibelFollowMode>('resting');
  const [error, setError] = useState('');

  // REASON: sprite playback and document pointer tracking need a browser clock and cleanup on unmount.
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) {
      return;
    }
    const controls = mountMeibel(button, setError, setFollowMode);
    controlsRef.current = controls;
    return () => {
      controls.dispose();
      controlsRef.current = null;
    };
  }, []);

  return (
    <>
      <div
        onKeyDown={(event) => {
          if (event.key !== 'Escape') {
            event.stopPropagation();
          }
        }}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] right-3 z-40 h-[104px] w-24 sm:right-8"
      >
        <button
          ref={buttonRef}
          type="button"
          className="meibel-companion relative block h-full w-full"
          aria-label="Play with Meibel, my cat"
          title="Meibel — tap to pet"
          popoverTarget={panelId}
        >
          <span
            className="meibel-sprite block h-full w-full"
            style={{
              backgroundImage: `url('${MEIBEL_SHEET.source}')`,
              backgroundSize: `${MEIBEL_SHEET.width / 2}px ${MEIBEL_SHEET.height / 2}px`,
              transformOrigin: '50% 85%',
            }}
            aria-hidden
          />
        </button>
        <div
          ref={panelRef}
          id={panelId}
          popover="auto"
          role="group"
          aria-label="Play with Meibel"
          className="meibel-actions fixed m-0 flex-col items-end [&:popover-open]:flex"
        >
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              controlsRef.current?.pet();
              panelRef.current?.hidePopover();
            }}
          >
            <PawPrint aria-hidden /> Pet Meibel
          </Button>
          <Button
            variant="link"
            size="sm"
            disabled={reducedMotion}
            onClick={() => {
              controlsRef.current?.lounge();
              panelRef.current?.hidePopover();
            }}
          >
            <Armchair aria-hidden /> Lounge
          </Button>
          <Button
            variant="link"
            size="sm"
            aria-pressed={followMode === 'following'}
            disabled={reducedMotion || !mouseAvailable}
            onClick={() => {
              controlsRef.current?.setFollowMode(
                followMode === 'following' ? 'resting' : 'following',
              );
              panelRef.current?.hidePopover();
            }}
          >
            <MousePointer2 aria-hidden />{' '}
            {followMode === 'following' ? 'Stop following' : 'Follow mouse'}
          </Button>
        </div>
        {error ? (
          <span
            role="status"
            className="absolute bottom-full right-0 w-40 text-xs text-muted-foreground"
          >
            {error}
          </span>
        ) : null}
      </div>
      {followMode === 'following' ? (
        <Button
          variant="link"
          size="sm"
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] right-3 z-40 sm:right-8"
          onClick={() => controlsRef.current?.setFollowMode('resting')}
        >
          Stop following
        </Button>
      ) : null}
    </>
  );
}
