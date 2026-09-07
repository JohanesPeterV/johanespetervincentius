import { ArrowRight, Plus } from 'lucide-react';
import { useRef } from 'react';
import type { SyntheticEvent } from 'react';

import { WORK_EXPERIENCES } from '@/app/_components/work-experience/work-experiences';

type WorkChapterProps = {
  index: number;
  chapter: number;
  onSelect: (index: number) => void;
};

export const WorkChapter = ({ index, chapter, onSelect }: WorkChapterProps) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const job = WORK_EXPERIENCES[index];
  const active = chapter === index;
  const upcoming = index === chapter + 1;

  const handleOpen = (event: SyntheticEvent<HTMLButtonElement>): void => {
    event.currentTarget.blur();
    onSelect(index);
    requestAnimationFrame(() =>
      titleRef.current?.focus({ preventScroll: true }),
    );
  };

  return (
    <article
      id={`work-story-${index}`}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${WORK_EXPERIENCES.length}: ${job.company}`}
      aria-hidden={!active && !upcoming}
      data-active={active}
      className="work-shot relative h-full min-w-0 shrink-0"
    >
      <div
        className="work-shot-copy h-full overflow-y-auto overscroll-contain pr-3 scrollbar-thin"
        data-section-scroll
        inert={!active}
        aria-hidden={!active}
      >
        <div className="work-shot-eyebrow flex items-center gap-3">
          <span className="type-meta text-primary-text">0{index + 1}</span>
          <span className="work-shot-rule" aria-hidden />
          <p className="type-label">{job.company}</p>
        </div>
        <h3
          ref={titleRef}
          tabIndex={-1}
          className="work-shot-title font-display my-3 md:mb-5 md:mt-4"
        >
          {job.chapter}
        </h3>
        {job.positions.map((position) => (
          <p key={position.name} className="type-meta text-muted-foreground">
            {position.name}
            <br />
            {position.workPeriod}
          </p>
        ))}
        <h4 className="work-headline font-display mb-4 mt-5">{job.headline}</h4>
        <details className="work-details mt-4">
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
      </div>
      <button
        type="button"
        className="work-shot-preview absolute inset-y-0 left-0 flex flex-col items-start justify-end text-left"
        aria-label={`Continue to ${job.company}`}
        aria-hidden={!upcoming}
        tabIndex={upcoming ? 0 : -1}
        onClick={handleOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleOpen(event);
          }
        }}
      >
        <span className="work-preview-arrow mb-4 flex items-center justify-center">
          <ArrowRight size={20} aria-hidden />
        </span>
      </button>
    </article>
  );
};
