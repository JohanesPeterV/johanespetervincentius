'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { BriefcaseBusiness, Footprints, PawPrint, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { CONTACT_ICONS } from '../linktree/links';

import { mountMeibel } from './meibel-runtime';
import { MEIBEL_SHEET } from './meibel-engine';

type MeibelProps = {
  onShowWork: () => void;
};

export default function Meibel({ onShowWork }: MeibelProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<ReturnType<typeof mountMeibel> | null>(null);
  const panelId = useId();
  const titleId = useId();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [error, setError] = useState('');

  // REASON: sprite playback and document pointer tracking need a browser clock and cleanup on unmount.
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) {
      return;
    }
    const controls = mountMeibel(button, setError);
    controlsRef.current = controls;
    return () => {
      controls.dispose();
      controlsRef.current = null;
    };
  }, []);

  return (
    <div
      onKeyDown={(event) => event.stopPropagation()}
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] right-3 z-40 h-[104px] w-24 sm:right-8"
    >
      <button
        ref={buttonRef}
        type="button"
        className="meibel-companion block h-full w-full"
        aria-label="Play with Meibel, my cat"
        title="Meibel — play or let me show you around"
        popoverTarget={panelId}
      >
        <span
          className="meibel-sprite block h-full w-full"
          style={{
            backgroundImage: `url('${MEIBEL_SHEET.source}')`,
            backgroundSize: `${MEIBEL_SHEET.width / 2}px ${MEIBEL_SHEET.height / 2}px`,
          }}
          aria-hidden
        />
      </button>
      <div
        ref={panelRef}
        id={panelId}
        popover="auto"
        role="dialog"
        aria-labelledby={titleId}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerMove={(event) => event.stopPropagation()}
        onPointerUp={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
        className="appearance-panel fixed bottom-[calc(env(safe-area-inset-bottom)+12.5rem)] left-auto right-3 top-auto m-0 max-h-[calc(100svh-14rem)] w-64 max-w-[calc(100vw-1.5rem)] flex-col overflow-y-auto p-4 sm:right-8 [&:popover-open]:flex"
      >
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="type-label">
            Hi, I’m Meibel.
          </h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close Meibel’s menu"
            popoverTarget={panelId}
            popoverTargetAction="hide"
          >
            <X aria-hidden />
          </Button>
        </div>
        <p className="type-meta mb-3">Peter’s cat. Your little guide.</p>
        <Button
          variant="ghost"
          className="min-h-11 justify-start"
          onClick={() => {
            controlsRef.current?.play('jumping');
            panelRef.current?.hidePopover();
          }}
        >
          <PawPrint aria-hidden /> Pet Meibel
        </Button>
        <Button
          variant="ghost"
          className="min-h-11 justify-start"
          disabled={reducedMotion}
          title={
            reducedMotion ? 'Running is paused with reduced motion' : undefined
          }
          onClick={() => {
            controlsRef.current?.run();
            panelRef.current?.hidePopover();
          }}
        >
          <Footprints aria-hidden /> Run around
        </Button>
        <Button
          variant="ghost"
          className="min-h-11 justify-start"
          onClick={() => {
            panelRef.current?.hidePopover();
            onShowWork();
          }}
        >
          <BriefcaseBusiness aria-hidden /> Show me your work
        </Button>
        <p className="type-meta mb-2 mt-4">Contact Peter</p>
        <nav aria-label="Meibel’s contact links" className="flex gap-2">
          {CONTACT_ICONS.map(({ icon: Icon, label, url }) => (
            <Button
              key={label}
              asChild
              variant="destination"
              size="icon"
              className="h-11 w-11"
            >
              <a
                href={url}
                aria-label={label}
                target={url.startsWith('http') ? '_blank' : undefined}
                rel={url.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                <Icon aria-hidden />
              </a>
            </Button>
          ))}
        </nav>
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
  );
}
