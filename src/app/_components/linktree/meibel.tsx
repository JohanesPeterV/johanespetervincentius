'use client';

import { useEffect, useRef, useState } from 'react';

import { mountMeibel } from './meibel-runtime';
import { MEIBEL_SHEET } from './meibel-engine';

export default function Meibel() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState('');

  // REASON: sprite playback and document pointer tracking need a browser clock and cleanup on unmount.
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) {
      return;
    }
    return mountMeibel(button, setError);
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="profile-meibel absolute -bottom-2 left-[calc(100%-1.25rem)] z-10 h-[104px] w-24"
        aria-label="Play with Meibel, my cat"
        title="Meibel — tap to play"
      >
        <span
          className="profile-meibel-sprite block h-full w-full"
          style={{
            backgroundImage: `url('${MEIBEL_SHEET.source}')`,
            backgroundSize: `${MEIBEL_SHEET.width / 2}px ${MEIBEL_SHEET.height / 2}px`,
          }}
          aria-hidden
        />
      </button>
      {error ? (
        <span
          role="status"
          className="absolute top-full text-xs text-muted-foreground"
        >
          {error}
        </span>
      ) : null}
    </>
  );
}
