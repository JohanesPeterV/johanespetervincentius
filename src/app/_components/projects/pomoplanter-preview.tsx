'use client';

import Image from 'next/image';
import { useState } from 'react';

import { POMODORO_PLANTER } from './projects';

export const PomoplanterPreview = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <figure className="project-preview w-full">
      <a
        href={POMODORO_PLANTER.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open Pomodoro Planter live site"
        className="project-preview-stage pointer-events-auto relative block w-full"
      >
        {POMODORO_PLANTER.screenshots.map((screenshot, index) => (
          <div
            key={screenshot.label}
            data-active={activeIndex === index}
            aria-hidden={activeIndex !== index}
            className="project-preview-window absolute w-[90%] overflow-hidden"
          >
            <div className="project-preview-toolbar flex items-center gap-1.5 px-3 py-2">
              <span aria-hidden className="project-preview-dot" />
              <span aria-hidden className="project-preview-dot" />
              <span aria-hidden className="project-preview-dot" />
              <span className="ml-2">pomoplanter.com</span>
              <span className="ml-auto">↗</span>
            </div>
            <Image
              src={screenshot.src}
              alt={screenshot.alt}
              width={1067}
              height={800}
              sizes="(min-width: 1024px) 520px, (min-width: 768px) 45vw, 85vw"
              className="h-auto w-full"
            />
          </div>
        ))}
      </a>
      <figcaption className="flex items-center justify-between gap-3">
        <span className="text-[0.6rem] tracking-widest opacity-60">
          LIVE PRODUCT
        </span>
        <div className="flex" aria-label="Preview appearance">
          {POMODORO_PLANTER.screenshots.map((screenshot, index) => (
            <button
              key={screenshot.label}
              type="button"
              aria-pressed={activeIndex === index}
              aria-label={`Show ${screenshot.label.toLowerCase()} screenshot`}
              onClick={() => setActiveIndex(index)}
              className="project-preview-toggle pointer-events-auto min-h-11 px-3"
            >
              {screenshot.label}
            </button>
          ))}
        </div>
      </figcaption>
    </figure>
  );
};
