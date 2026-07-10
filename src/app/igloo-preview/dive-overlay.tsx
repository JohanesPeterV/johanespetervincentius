'use client';

import { RefObject, useState } from 'react';

import { DIVE_SECTIONS } from './descent';
import type { OverlayNodes } from './dive-overlay-motion';
import { toggleWindAudio } from './wind-audio';

type DiveOverlayParams = {
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
            className="-mb-[0.12em] block overflow-hidden pb-[0.12em]"
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

export default function DiveOverlay({ overlayRef }: DiveOverlayParams) {
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
        className="pointer-events-none absolute inset-0 bg-[#e9edf2] opacity-0"
      />
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
                ? 'group absolute left-0 top-0 flex w-[min(24rem,48vw)] flex-col items-start gap-4 text-left opacity-0 [text-shadow:0_1px_18px_rgba(30,40,52,0.55)]'
                : 'group absolute inset-0 flex flex-col items-center justify-center gap-5 opacity-0 [text-shadow:0_1px_18px_rgba(30,40,52,0.55)]'
            }
          >
            <span className="text-xs tracking-[0.4em] text-white/60">
              {section.tag}
            </span>
            <h2
              className={
                section.placement === 'stone'
                  ? 'font-sans text-3xl font-semibold leading-[1.05] sm:text-5xl'
                  : 'text-center font-sans text-5xl font-semibold leading-[1.05] sm:text-7xl'
              }
            >
              <HeadlineLines title={section.title} />
            </h2>
            <span className="text-xs tracking-[0.3em] text-white/50">
              {section.subtitle}
            </span>
            {section.details ? (
              <ul className="space-y-1.5 text-[0.68rem] tracking-[0.2em] text-white/65">
                {section.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ) : null}
            {section.links ? (
              <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-[0.7rem] tracking-[0.22em]">
                {section.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="pointer-events-auto text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute left-8 top-8 text-[0.65rem] leading-relaxed tracking-[0.2em] text-white/70 [text-shadow:0_1px_10px_rgba(30,40,52,0.5)]">
        <div className="font-sans text-2xl font-bold tracking-[0.08em] text-white">
          JOHANES
        </div>
        <div className="mt-2">{'// Portfolio © 2026'}</div>
        <div>All Rights Reserved.</div>
      </div>
      <div className="pointer-events-none absolute bottom-8 left-8 text-[0.7rem] tracking-[0.3em] text-white/70 [text-shadow:0_1px_10px_rgba(30,40,52,0.5)]">
        DEPTH{' '}
        <span
          ref={(element) => {
            overlayRef.current.depth = element;
          }}
        >
          0000M
        </span>
      </div>
      <div className="pointer-events-none absolute right-6 top-1/2 flex -translate-y-1/2 flex-col items-end gap-3">
        {DIVE_SECTIONS.map((section, index) => (
          <div
            key={section.tag}
            ref={(element) => {
              overlayRef.current.rail[index] = element;
            }}
            className="h-px w-6 origin-right bg-white opacity-20"
          />
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-[0.65rem] tracking-[0.3em] text-white/50">
        wheel / arrows / drag to descend
      </div>
      <button
        type="button"
        onClick={handleToggleSound}
        className="absolute bottom-8 right-8 flex items-center gap-2 text-[0.7rem] tracking-[0.3em] text-white/70 transition-colors hover:text-white [text-shadow:0_1px_10px_rgba(30,40,52,0.5)]"
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
    </>
  );
}
