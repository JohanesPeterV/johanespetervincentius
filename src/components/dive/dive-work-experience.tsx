'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useAtom } from 'jotai';
import { ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { WORK_EXPERIENCES } from '@/app/_components/work-experience/work-experiences';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  advanceWorkGesture,
  workChapterAtom,
  workStoryPosition,
} from './work-story';
import { normalizeWheelDelta } from './dive-input';
import { WORK_SECTION } from './descent';
import { WorkChapter } from './work-chapter';

type DiveWorkExperienceProps = {
  sectionRef: (element: HTMLDivElement | null) => void;
  onContinue: () => void;
};

export const DiveWorkExperience = ({
  sectionRef,
  onContinue,
}: DiveWorkExperienceProps) => {
  const [chapter, setChapter] = useAtom(workChapterAtom);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [carouselRef, carousel] = useEmblaCarousel({
    align: 'start',
    containScroll: false,
    duration: reducedMotion ? 0 : 30,
    watchFocus: false,
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef({ distance: 0, lastAt: 0, consumed: false });
  const nextJob = WORK_EXPERIENCES[chapter + 1];

  // REASON: Embla's continuous position drives the shot and copy
  // without React renders per frame; the selected snap owns reading/focus state.
  useEffect(() => {
    if (!carousel) {
      return;
    }
    const updateShot = (): void => {
      const progress = Math.max(0, Math.min(1, carousel.scrollProgress()));
      const position = progress * (WORK_EXPERIENCES.length - 1);
      workStoryPosition.current = position;
      carousel.slideNodes().forEach((slide, index) => {
        const focus = Math.max(0, 1 - Math.abs(position - index));
        slide.style.setProperty('--shot-focus', String(focus));
      });
    };
    const handleSelect = (): void => {
      const selected = carousel.selectedScrollSnap();
      setChapter(selected);
      if (document.activeElement?.closest('.work-shot')) {
        rootRef.current
          ?.querySelector<HTMLButtonElement>(
            `[aria-controls="work-story-${selected}"]`,
          )
          ?.focus({ preventScroll: true });
      }
      const copy = carousel
        .slideNodes()
        [selected].querySelector('[data-section-scroll]');
      if (copy instanceof HTMLElement) {
        copy.scrollTop = 0;
      }
    };
    const handleScroll = (): void => {
      updateShot();
      if (rootRef.current) {
        rootRef.current.dataset.snapshotReady = String(reducedMotion);
      }
    };
    const handleSettle = (): void => {
      updateShot();
      if (rootRef.current) {
        rootRef.current.dataset.snapshotReady = 'true';
      }
    };
    const handleInit = (): void => {
      handleSelect();
      handleSettle();
    };
    handleInit();
    carousel.on('select', handleSelect).on('reInit', handleInit);
    carousel.on('scroll', handleScroll).on('settle', handleSettle);
    return () => {
      carousel.off('select', handleSelect).off('reInit', handleInit);
      carousel.off('scroll', handleScroll).off('settle', handleSettle);
    };
  }, [carousel, reducedMotion, setChapter]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>): void => {
    if (
      event.ctrlKey ||
      (!event.shiftKey && Math.abs(event.deltaX) <= Math.abs(event.deltaY))
    ) {
      return;
    }
    event.stopPropagation();
    const delta = event.shiftKey ? event.deltaY : event.deltaX;
    const direction = advanceWorkGesture(wheelRef.current, {
      delta: normalizeWheelDelta({ deltaY: delta, deltaMode: event.deltaMode }),
      now: performance.now(),
    });
    if (direction > 0) {
      carousel?.scrollNext();
    } else if (direction < 0) {
      carousel?.scrollPrev();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      if (event.key === 'ArrowLeft') {
        carousel?.scrollPrev();
      } else {
        carousel?.scrollNext();
      }
    }
  };

  return (
    <div
      ref={(element) => {
        rootRef.current = element;
        sectionRef(element);
      }}
      data-work-story="true"
      data-visible="false"
      data-snapshot-ready="true"
      role="region"
      aria-label="Work experience"
      aria-roledescription="carousel"
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      className="dive-work-section pointer-events-auto invisible absolute left-0 top-0 flex flex-col text-left opacity-0"
    >
      <header className="flex items-center gap-3">
        <span className="identity-tag type-meta py-1">{WORK_SECTION.tag}</span>
        <h2 className="type-meta">
          {WORK_SECTION.title.replace('\n', ' ').toUpperCase()}
        </h2>
        <span className="type-meta ml-auto text-muted-foreground">
          {WORK_SECTION.subtitle}
        </span>
      </header>
      <nav
        className="work-employers mt-5 grid grid-cols-4 gap-1"
        aria-label="Work chapters"
      >
        {WORK_EXPERIENCES.map((job, index) => (
          <button
            key={job.company}
            type="button"
            aria-pressed={chapter === index}
            aria-controls={`work-story-${index}`}
            onClick={() => carousel?.scrollTo(index)}
            className="choice-control flex min-h-11 min-w-0 flex-col items-start justify-center gap-1 px-2 py-2 text-left"
          >
            <span className="work-employer-index type-meta">0{index + 1}</span>
            <span className="type-label">{job.company}</span>
          </button>
        ))}
      </nav>
      <div className="work-reel-stage relative min-h-0 flex-1">
        <div
          ref={carouselRef}
          data-horizontal-gesture
          className="h-full overflow-hidden"
        >
          <div className="flex h-full">
            {WORK_EXPERIENCES.map((job, index) => (
              <WorkChapter key={job.company} index={index} chapter={chapter} />
            ))}
          </div>
        </div>
      </div>
      <footer className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0"
          aria-label="Previous employer"
          disabled={chapter === 0}
          onClick={() => carousel?.scrollPrev()}
        >
          <ArrowLeft size={17} aria-hidden />
        </Button>
        <span
          className="type-meta shrink-0 whitespace-nowrap text-muted-foreground [@media(max-width:360px)]:sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          <span aria-hidden>
            0{chapter + 1} / 0{WORK_EXPERIENCES.length}
          </span>
          <span className="sr-only">
            {WORK_EXPERIENCES[chapter].company}, chapter {chapter + 1} of{' '}
            {WORK_EXPERIENCES.length}
          </span>
        </span>
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            if (nextJob) {
              carousel?.scrollNext();
            } else {
              onContinue();
            }
          }}
          className="h-11 gap-2"
        >
          {nextJob ? `Next: ${nextJob.company}` : 'Projects'}
          {nextJob ? <ArrowRight aria-hidden /> : <ArrowDown aria-hidden />}
        </Button>
      </footer>
    </div>
  );
};
