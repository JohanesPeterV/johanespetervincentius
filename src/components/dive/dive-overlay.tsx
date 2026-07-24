'use client';

import { RefObject, useState } from 'react';

import { DIVE_SECTIONS } from './descent';
import type { DiveAppearance } from './dive-palette';
import type { OverlayNodes } from './dive-overlay-motion';
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
  const measureLabel = appearance === 'space' ? 'ALT' : 'RISE';
  const gestureLabel =
    appearance === 'space'
      ? 'wheel / arrows / drag to move through orbit'
      : 'wheel / arrows / drag to lift the world';

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
                ? "group absolute left-0 top-0 flex w-[min(22rem,46vw)] flex-col items-start gap-3 text-left opacity-0 [will-change:transform,opacity] before:absolute before:right-full before:top-1/2 before:h-px before:w-12 before:-translate-y-1/2 before:bg-white/30 before:content-['']"
                : 'group absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-0 [text-shadow:0_1px_18px_rgba(30,40,52,0.55)] [will-change:transform,opacity]'
            }
          >
            <span className="text-[0.6rem] tracking-[0.4em] text-white/55">
              {section.tag}
            </span>
            <h2
              className={
                section.placement === 'stone'
                  ? 'font-display text-4xl leading-[1.04] sm:text-5xl'
                  : 'text-center font-display text-5xl leading-[1.04] sm:text-6xl'
              }
            >
              <HeadlineLines title={section.title} />
            </h2>
            <span className="text-[0.6rem] tracking-[0.28em] text-white/45">
              {section.subtitle}
            </span>
            {section.details ? (
              <ul className="space-y-1.5 text-[0.62rem] leading-relaxed tracking-[0.16em] text-white/62">
                {section.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ) : null}
            {section.links ? (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.64rem] tracking-[0.18em]">
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
      <div className="pointer-events-none absolute left-6 top-6 mix-blend-difference text-[0.58rem] leading-relaxed tracking-[0.18em] text-white/65 sm:left-10 sm:top-9">
        <div className="font-display text-xl tracking-[0.2em] text-white sm:text-2xl">
          JOHANES
        </div>
        <div className="mt-2">{'// Portfolio © 2026'}</div>
        <div>All Rights Reserved.</div>
      </div>
      <div className="pointer-events-none absolute bottom-6 left-6 mix-blend-difference text-[0.6rem] tracking-[0.26em] text-white/65 sm:bottom-8 sm:left-10">
        {measureLabel}{' '}
        <span
          ref={(element) => {
            overlayRef.current.rise = element;
          }}
        >
          0000M
        </span>
      </div>
      <div className="pointer-events-none absolute right-5 top-1/2 flex -translate-y-1/2 flex-col items-end gap-3 mix-blend-difference sm:right-9">
        {DIVE_SECTIONS.map((section, index) => (
          <div
            key={section.tag}
            ref={(element) => {
              overlayRef.current.rail[index] = element;
            }}
            className="h-px w-6 origin-right bg-white opacity-20 [will-change:transform,opacity]"
          />
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 mix-blend-difference text-[0.56rem] tracking-[0.26em] text-white/45 md:block">
        {gestureLabel}
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
