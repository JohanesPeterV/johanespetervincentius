'use client';

import { ReactNode, RefObject } from 'react';

import { DIVE_SECTIONS } from './descent';
import { DiveWorkExperience } from './dive-work-experience';
import type { OverlayNodes } from './dive-overlay-motion';

type DiveOverlayParams = {
  children: ReactNode;
  overlayRef: RefObject<OverlayNodes>;
  onNavigate: (center: number) => void;
};

export default function DiveOverlay({
  children,
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
        {DIVE_SECTIONS.map((section, index) => {
          if (section.placement === 'center') {
            return (
              <div
                key={section.tag}
                data-visible="true"
                ref={(element) => {
                  overlayRef.current.sections[index] = element;
                }}
                className="absolute inset-0 flex items-center justify-center [will-change:transform,opacity] [&_a]:pointer-events-auto [&_button]:pointer-events-auto"
              >
                {children}
              </div>
            );
          }
          return (
            <DiveWorkExperience
              key={section.tag}
              sectionRef={(element) => {
                overlayRef.current.sections[index] = element;
              }}
            />
          );
        })}
      </div>
      <nav
        aria-label="Journey chapters"
        className="surface-panel absolute bottom-5 right-5 z-20 flex gap-1 p-1 sm:bottom-7 sm:right-8"
      >
        {DIVE_SECTIONS.map((section, index) => (
          <button
            key={section.tag}
            type="button"
            aria-label={`Go to ${section.title.replace('\n', ' ')}`}
            onClick={() => onNavigate(section.center)}
            ref={(element) => {
              overlayRef.current.chapters[index] = element;
            }}
            className="dive-chapter choice-control type-meta flex h-11 w-11 items-center justify-center"
          >
            {section.tag}
          </button>
        ))}
      </nav>
    </>
  );
}
