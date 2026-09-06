'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useAtom } from 'jotai';
import { ArrowDown, ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { WORK_EXPERIENCES } from '@/app/_components/work-experience/work-experiences';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { advanceWorkGesture, workChapterAtom } from './work-story';
import { normalizeWheelDelta } from './dive-input';
import { WORK_SECTION } from './descent';

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
    duration: reducedMotion ? 0 : 35,
    watchFocus: false,
    watchDrag: (_, event) =>
      !(
        event.target instanceof Element &&
        event.target.closest('a, button, summary')
      ),
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef({ distance: 0, lastAt: 0, consumed: false });

  // REASON: Embla owns swipe selection; publish its selected snap to both the
  // story and 3D scene, and only snapshot the DOM once its motion has settled.
  useEffect(() => {
    if (!carousel) {
      return;
    }
    const handleSelect = (): void => {
      const selected = carousel.selectedScrollSnap();
      setChapter(selected);
      carousel.slideNodes()[selected].scrollTop = 0;
    };
    const handleScroll = (): void => {
      if (rootRef.current) {
        rootRef.current.dataset.snapshotReady = 'false';
      }
    };
    const handleSettle = (): void => {
      if (rootRef.current) {
        rootRef.current.dataset.snapshotReady = 'true';
      }
    };
    handleSelect();
    carousel.on('select', handleSelect).on('reInit', handleSelect);
    carousel.on('scroll', handleScroll).on('settle', handleSettle);
    return () => {
      carousel.off('select', handleSelect).off('reInit', handleSelect);
      carousel.off('scroll', handleScroll).off('settle', handleSettle);
    };
  }, [carousel, setChapter]);

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
        <span className="identity-tag type-meta px-2 py-1">
          {WORK_SECTION.tag}
        </span>
        <h2 className="type-meta">
          {WORK_SECTION.title.replace('\n', ' ').toUpperCase()}
        </h2>
        <span className="type-meta ml-auto text-muted-foreground">
          {WORK_SECTION.subtitle}
        </span>
      </header>
      <div
        className="my-3 grid grid-cols-4 gap-1 md:my-5"
        aria-label="Choose an employer"
      >
        {WORK_EXPERIENCES.map((job, index) => (
          <button
            type="button"
            key={job.company}
            aria-pressed={chapter === index}
            aria-controls={`work-story-${index}`}
            onClick={() => carousel?.scrollTo(index)}
            className="dive-employer choice-control flex min-h-11 flex-col items-start justify-center gap-0.5 px-2 py-2"
          >
            <span className="work-chapter-number type-meta hidden md:block">
              0{index + 1}
            </span>
            <span className="type-label">{job.company}</span>
          </button>
        ))}
      </div>
      <div
        ref={carouselRef}
        data-horizontal-gesture
        className="min-h-0 flex-1 overflow-hidden"
      >
        <div className="flex h-full">
          {WORK_EXPERIENCES.map((job, index) => (
            <article
              key={job.company}
              id={`work-story-${index}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${WORK_EXPERIENCES.length}: ${job.company}`}
              aria-hidden={chapter !== index}
              inert={chapter !== index}
              data-active={chapter === index}
              data-section-scroll
              className="dive-work-slide min-w-0 shrink-0 grow-0 basis-full overflow-y-auto overscroll-contain pr-2 scrollbar-thin"
            >
              <p className="type-meta mb-2 text-primary-text">{job.chapter}</p>
              <h3 className="work-company font-display">{job.company}</h3>
              {job.positions.map((position) => (
                <p
                  key={position.name}
                  className="type-meta mt-2 text-muted-foreground md:mt-3"
                >
                  {position.name}
                  <br />
                  {position.workPeriod}
                </p>
              ))}
              <h4 className="work-headline font-display mb-3 mt-4 md:mt-6">
                {job.headline}
              </h4>
              <details className="work-details mt-3 md:mt-5">
                <summary className="choice-control type-label flex min-h-11 cursor-pointer items-center justify-between gap-3 px-2">
                  Inside the role <Plus size={16} aria-hidden />
                </summary>
                {job.positions.map((position) => (
                  <p
                    key={position.name}
                    className="work-description px-2 py-3 text-muted-foreground"
                  >
                    {position.description}
                  </p>
                ))}
                <ul className="mt-3 flex flex-col gap-4 px-2 pb-3">
                  {job.showcases.map((showcase) => (
                    <li key={showcase.title}>
                      <h5 className="type-label mb-1">{showcase.title}</h5>
                      <p className="work-description text-muted-foreground">
                        {showcase.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </details>
            </article>
          ))}
        </div>
      </div>
      <footer className="work-story-footer mt-4 flex flex-col gap-3 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11"
              aria-label="Previous employer"
              disabled={chapter === 0}
              onClick={() => carousel?.scrollPrev()}
            >
              <ArrowLeft size={17} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11"
              aria-label="Next employer"
              disabled={chapter === WORK_EXPERIENCES.length - 1}
              onClick={() => carousel?.scrollNext()}
            >
              <ArrowRight size={17} />
            </Button>
            <span
              className="type-meta ml-1 text-muted-foreground"
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
          </div>
          <Button variant="ghost" onClick={onContinue} className="h-11 gap-2">
            Projects <ArrowDown size={15} />
          </Button>
        </div>
        <p className="work-story-hint type-meta text-muted-foreground">
          Sideways for roles. Down for the next chapter.
        </p>
      </footer>
    </div>
  );
};
