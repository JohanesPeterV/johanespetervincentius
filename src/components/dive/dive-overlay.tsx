'use client';

import { ReactNode, RefObject } from 'react';

import { DIVE_SECTIONS, TECH_STONE, WORK_STONE } from './descent';
import { DiveWorkExperience } from './dive-work-experience';
import type { OverlayNodes } from './dive-overlay-motion';
import { GALAXY_CATEGORIES, GALAXY_NODES } from './skill-galaxy';

export type DiveMode = 'dive' | 'explore';

type DiveOverlayParams = {
  children: ReactNode;
  overlayRef: RefObject<OverlayNodes>;
  mode: DiveMode;
  onEngage: (category: number | null) => void;
  onToggleExplore: () => void;
  onNavigate: (center: number) => void;
};

type HeadlineLinesParams = {
  title: string;
};

const HeadlineLines = ({ title }: HeadlineLinesParams) => {
  return (
    <>
      {title.split('\n').map((line) => (
        <span
          key={line}
          className="-mb-[0.22em] block overflow-hidden pb-[0.22em]"
        >
          <span className="block [transform:translateY(calc((1_-_var(--reveal,0))*105%))] motion-reduce:transform-none">
            {line}
          </span>
        </span>
      ))}
    </>
  );
};

export default function DiveOverlay({
  children,
  overlayRef,
  mode,
  onEngage,
  onToggleExplore,
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
      <div
        ref={(element) => {
          overlayRef.current.skillLayer = element;
        }}
        className="pointer-events-none absolute inset-0 opacity-0"
      >
        {GALAXY_NODES.map((node, index) => (
          <span
            key={`${node.category}-${node.label}`}
            ref={(element) => {
              overlayRef.current.skillWords[index] = element;
            }}
            className={
              node.kind === 'hub'
                ? 'absolute left-0 top-0 whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.3em] transition-opacity duration-150 motion-reduce:transition-none'
                : 'absolute left-0 top-0 whitespace-nowrap text-xs tracking-[0.04em] transition-opacity duration-150 motion-reduce:transition-none'
            }
          >
            {node.label}
          </span>
        ))}
      </div>
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
          if (section.center === WORK_STONE.center) {
            return (
              <DiveWorkExperience
                key={section.tag}
                sectionRef={(element) => {
                  overlayRef.current.sections[index] = element;
                }}
                onContinue={() => onNavigate(TECH_STONE.center)}
              />
            );
          }
          const dimStyle =
            mode === 'explore' && section.center === TECH_STONE.center
              ? { opacity: 0.15 }
              : undefined;
          return (
            <div
              key={section.tag}
              data-visible="false"
              ref={(element) => {
                overlayRef.current.sections[index] = element;
              }}
              data-section-scroll
              className="group pointer-events-auto invisible absolute -m-1 box-content left-0 top-0 flex max-h-[calc(100svh-13rem)] w-[min(27rem,calc(100vw-3rem))] flex-col items-start gap-3 overflow-y-auto overscroll-contain p-1 text-left opacity-0 [will-change:transform,opacity] scrollbar-thin"
            >
              <span
                style={dimStyle}
                className="identity-tag type-meta py-1 transition-opacity duration-500"
              >
                {section.tag}
              </span>
              <h2
                style={dimStyle}
                className="font-display text-4xl font-medium leading-[1.04] tracking-[-0.045em] transition-opacity duration-500 sm:text-6xl motion-reduce:transition-none"
              >
                <HeadlineLines title={section.title} />
              </h2>
              <span
                style={dimStyle}
                className="type-meta text-muted-foreground transition-opacity duration-500"
              >
                {section.subtitle}
              </span>
              {section.center === TECH_STONE.center ? (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mt-4 sm:flex-col sm:items-start sm:gap-2">
                  {GALAXY_CATEGORIES.map((category, categoryIndex) => (
                    <button
                      type="button"
                      key={category}
                      data-active="false"
                      onClick={() => onEngage(categoryIndex)}
                      ref={(element) => {
                        overlayRef.current.skillRail[categoryIndex] = element;
                      }}
                      className="dive-skill choice-control pointer-events-auto min-h-11 px-3 text-left text-xs font-medium tracking-[0.14em]"
                    >
                      {category}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={onToggleExplore}
                    className="pointer-events-auto mt-3 w-full text-left text-[0.62rem] tracking-[0.3em] opacity-70 transition-opacity hover:opacity-100"
                  >
                    {mode === 'explore' ? '✕ EXIT' : '◉ EXPLORE'}
                  </button>
                </div>
              ) : null}
            </div>
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
      {mode === 'explore' ? (
        <div className="dive-hint type-label pointer-events-none absolute bottom-20 left-6 right-6 text-center text-muted-foreground sm:bottom-10 sm:left-8 sm:right-60 sm:text-left">
          drag to orbit · scroll to zoom · click a tool to open its docs · esc
          to exit
        </div>
      ) : null}
    </>
  );
}
