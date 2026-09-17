'use client';

import { ReactNode, RefObject } from 'react';

import type { DiveRoute } from './dive-route';
import type { DiveChapter } from './dive-route';
import type { OverlayNodes } from './dive-overlay-motion';

export type DiveContent = DiveChapter & { content: ReactNode };

type DiveOverlayParams = {
  hero: ReactNode;
  chapters: readonly DiveContent[];
  route: DiveRoute;
  overlayRef: RefObject<OverlayNodes>;
  onNavigate: (center: number) => void;
};

export default function DiveOverlay({
  hero,
  chapters,
  route,
  overlayRef,
  onNavigate,
}: DiveOverlayParams) {
  return (
    <>
      <div
        ref={(element) => {
          overlayRef.current.veil = element;
        }}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-0"
      />
      <div className="pointer-events-none absolute inset-0">
        {[
          { id: 'hero', title: route.sections[0].title, content: hero },
          ...chapters,
        ].map((section) => {
          const sectionRef = (element: HTMLDivElement | null) => {
            overlayRef.current.sections.set(section.id, element);
          };
          if (section.id === 'hero') {
            return (
              <div
                key={section.id}
                data-dive-section={section.id}
                data-visible="true"
                ref={sectionRef}
                className="absolute inset-0 flex items-center justify-center opacity-0 [will-change:transform] [&_a]:pointer-events-auto [&_button]:pointer-events-auto"
              >
                {section.content}
              </div>
            );
          }
          return (
            <div
              key={section.id}
              ref={sectionRef}
              data-dive-section={section.id}
              data-visible="false"
              data-section-scroll
              tabIndex={0}
              role="region"
              aria-label={section.title}
              className="dive-card-section pointer-events-auto invisible absolute inset-0 overflow-y-auto text-left opacity-0 scrollbar-thin"
            >
              <div className="mx-auto max-w-[1440px] px-6 pb-24 pt-20">
                {section.content}
              </div>
            </div>
          );
        })}
      </div>
      <nav
        aria-label="Journey chapters"
        className="dive-chrome surface-panel absolute bottom-5 right-5 z-20 flex gap-1 p-1 sm:bottom-7 sm:right-8"
      >
        {route.sections.map((section, index) => (
          <button
            key={section.id}
            type="button"
            aria-label={`Go to ${section.title.replace('\n', ' ')}`}
            onClick={() => onNavigate(section.center)}
            ref={(element) => {
              overlayRef.current.chapters.set(section.id, element);
            }}
            className="dive-chapter choice-control type-meta flex h-11 w-11 items-center justify-center"
          >
            {String(index + 1).padStart(2, '0')}
          </button>
        ))}
      </nav>
    </>
  );
}
