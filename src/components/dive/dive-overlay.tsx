'use client';

import { RefObject, useState } from 'react';

import { DIVE_SECTIONS, TECH_STONE } from './descent';
import type { DiveAppearance } from './dive-palette';
import type { OverlayNodes } from './dive-overlay-motion';
import { SKILL_DIAL_CATEGORIES, SKILL_DIAL_ENTRIES } from './skill-dial';
import { toggleWindAudio } from './wind-audio';

type DiveOverlayParams = {
  appearance: DiveAppearance;
  overlayRef: RefObject<OverlayNodes>;
};

type HeadlineLinesParams = {
  title: string;
};

const CHAR_STAGGER_MS = 26;

const HeadlineLines = ({ title }: HeadlineLinesParams) => {
  let charOffset = 0;
  return (
    <>
      {title.split('\n').map((line) => {
        const lineStart = charOffset;
        charOffset += line.length;
        return (
          <span
            key={line}
            className="-mb-[0.22em] block overflow-hidden pb-[0.22em]"
          >
            {[...line].map((char, index) => (
              <span
                key={`${line}-${index}`}
                className="inline-block translate-y-[120%] transition-transform duration-700 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] group-data-[visible=true]:translate-y-0"
                style={{
                  transitionDelay: `${(lineStart + index) * CHAR_STAGGER_MS}ms`,
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>
        );
      })}
    </>
  );
};

export default function DiveOverlay({
  appearance,
  overlayRef,
}: DiveOverlayParams) {
  const [sound, setSound] = useState<'on' | 'off'>('off');

  const handleToggleSound = (): void => {
    setSound(toggleWindAudio());
  };

  return (
    <>
      <div
        ref={(element) => {
          overlayRef.current.veil = element;
        }}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-[#e9edf2] opacity-0"
      />
      <div
        ref={(element) => {
          overlayRef.current.skillLayer = element;
        }}
        className="pointer-events-none absolute inset-0 opacity-0"
      >
        {SKILL_DIAL_ENTRIES.map((entry, index) => (
          <span
            key={`${entry.category}-${entry.label}`}
            ref={(element) => {
              overlayRef.current.skillWords[index] = element;
            }}
            className="absolute left-0 top-0 whitespace-nowrap text-xs tracking-[0.04em] sm:text-sm"
          >
            {entry.label}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0">
        {DIVE_SECTIONS.map((section, index) => (
          <div
            key={section.tag}
            data-visible="false"
            ref={(element) => {
              overlayRef.current.sections[index] = element;
            }}
            className={
              section.placement === 'stone'
                ? 'group absolute left-0 top-0 flex w-[min(24rem,70vw)] flex-col items-start gap-3 text-left opacity-0 [will-change:transform,opacity]'
                : 'group absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 [will-change:transform,opacity]'
            }
          >
            <span className="text-[0.65rem] font-medium tracking-[0.28em] opacity-50">
              {section.tag}
            </span>
            <h2
              className={
                section.placement === 'stone'
                  ? 'font-display text-4xl leading-[1.04] tracking-[-0.04em] sm:text-5xl'
                  : 'text-center font-display text-4xl leading-[1.04] tracking-[-0.04em] sm:text-5xl'
              }
            >
              <HeadlineLines title={section.title} />
            </h2>
            <span className="text-xs tracking-[0.16em] opacity-50">
              {section.subtitle}
            </span>
            {section.details ? (
              <ul className="mt-2 space-y-2 text-sm leading-relaxed opacity-60">
                {section.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ) : null}
            {section.links ? (
              <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                {section.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="pointer-events-auto opacity-70 underline-offset-4 transition-opacity hover:opacity-100 hover:underline"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            ) : null}
            {section.center === TECH_STONE.center ? (
              <div className="mt-4 flex flex-col gap-2">
                {SKILL_DIAL_CATEGORIES.map((category, categoryIndex) => (
                  <div
                    key={category.name}
                    data-active="false"
                    ref={(element) => {
                      overlayRef.current.skillRail[categoryIndex] = element;
                    }}
                    className="flex items-baseline gap-3 text-xs tracking-[0.14em] opacity-30 transition-[opacity,transform] duration-500 data-[active=true]:translate-x-2 data-[active=true]:opacity-100"
                  >
                    <span className="text-[0.6rem] opacity-60">
                      {String(categoryIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="font-medium">{category.name}</span>
                    <span className="text-[0.65rem] opacity-60">
                      {category.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.65rem] tracking-[0.18em] opacity-50">
        Scroll or drag to explore
      </div>
      {appearance === 'igloo' ? (
        <button
          type="button"
          onClick={handleToggleSound}
          aria-pressed={sound === 'on'}
          aria-label={`Turn ambient wind ${sound === 'on' ? 'off' : 'on'}`}
          className="absolute bottom-6 right-6 z-20 flex items-center gap-2 text-[0.6rem] tracking-[0.26em] text-white/65 mix-blend-difference transition-colors hover:text-white sm:bottom-8 sm:right-10"
        >
          <span className="flex h-3 items-end gap-[2px]">
            {[0, 1, 2].map((bar) => (
              <span
                key={bar}
                className={`w-px bg-current ${sound === 'on' ? 'animate-pulse' : ''}`}
                style={{
                  height: `${(bar + 1) * 4}px`,
                  animationDelay: `${bar * 160}ms`,
                }}
              />
            ))}
          </span>
          SOUND {sound === 'on' ? 'ON' : 'OFF'}
        </button>
      ) : null}
    </>
  );
}
