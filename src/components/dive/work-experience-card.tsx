'use client';

import { ArrowUpRight, X } from 'lucide-react';
import { useRef } from 'react';

import type { WorkExperience } from '@/app/_components/work-experience/work-experiences';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';

type WorkExperienceCardProps = {
  job: WorkExperience;
  index: number;
};

const getPickupTransform = (
  card: HTMLButtonElement,
  dialog: HTMLDialogElement,
): string => {
  const source = card.getBoundingClientRect();
  const target = dialog.getBoundingClientRect();
  const x = source.left + source.width / 2 - target.left - target.width / 2;
  const y = source.top + source.height / 2 - target.top - target.height / 2;
  const angle = getComputedStyle(card).getPropertyValue('--card-angle');
  return `translate(${x}px, ${y}px) rotate(${angle}) scale(${card.offsetWidth / target.width}, ${card.offsetHeight / target.height})`;
};

export const WorkExperienceCard = ({ job, index }: WorkExperienceCardProps) => {
  const cardRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const current = job.status === 'current';
  const titleId = `work-card-${index}-title`;

  const handlePick = (): void => {
    const card = cardRef.current;
    const dialog = dialogRef.current;
    if (!card || !dialog) {
      return;
    }
    dialog.showModal();
    const details = dialog.querySelector<HTMLDivElement>(
      '[data-section-scroll]',
    );
    if (details) {
      details.scrollTop = 0;
    }
    if (reducedMotion) {
      return;
    }
    animationRef.current = dialog.animate(
      [
        { transform: getPickupTransform(card, dialog) },
        {
          transform: 'translateY(-18px) rotate(-1deg) scale(1.025)',
          offset: 0.75,
        },
        { transform: 'none' },
      ],
      { duration: 560, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
  };

  const handleReturn = (): void => {
    const card = cardRef.current;
    const dialog = dialogRef.current;
    if (!card || !dialog || dialog.dataset.closing === 'true') {
      return;
    }
    if (reducedMotion) {
      dialog.close();
      return;
    }
    const from = getComputedStyle(dialog).transform;
    animationRef.current?.cancel();
    dialog.dataset.closing = 'true';
    animationRef.current = dialog.animate(
      [{ transform: from }, { transform: getPickupTransform(card, dialog) }],
      { duration: 320, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    );
    animationRef.current.onfinish = () => {
      dialog.close();
      delete dialog.dataset.closing;
    };
  };

  return (
    <div className="work-card-slot" data-current={current}>
      <button
        ref={cardRef}
        type="button"
        className="work-card surface-panel flex h-full w-full flex-col text-left"
        aria-label={`Pick up ${job.company}${current ? ', current role' : ''}`}
        aria-haspopup="dialog"
        onClick={handlePick}
      >
        <span className="type-meta flex w-full items-center justify-between gap-2">
          <span className="text-muted-foreground">0{index + 1}</span>
          {current ? (
            <span className="work-current-label">Current role</span>
          ) : (
            <ArrowUpRight size={16} aria-hidden />
          )}
        </span>
        <span className="work-card-company font-display">{job.company}</span>
        <span className="work-card-role type-label text-muted-foreground">
          {job.positions.map((position) => position.name).join(' · ')}
        </span>
        <span className="work-card-period type-meta mt-auto text-muted-foreground">
          {job.positions[0].workPeriod}
        </span>
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        data-work-details
        className="work-detail surface-panel text-left"
        onCancel={(event) => {
          event.preventDefault();
          handleReturn();
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) {
            return;
          }
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          ) {
            handleReturn();
          }
        }}
        onKeyDown={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-4">
          <span className="type-meta flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
            <span className="whitespace-nowrap">0{index + 1} / WORK</span>
            {current ? (
              <span className="work-current-label">Current role</span>
            ) : null}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-11 gap-2"
            onClick={handleReturn}
            aria-label={`Put ${job.company} card back`}
          >
            Put back <X aria-hidden />
          </Button>
        </header>
        <div
          className="work-detail-content min-h-0 overflow-y-auto overscroll-contain scrollbar-thin"
          data-section-scroll
          tabIndex={0}
          role="region"
          aria-label={`${job.company} role details`}
        >
          <h3 id={titleId} className="work-detail-title font-display">
            {job.company}
          </h3>
          {job.positions.map((position) => (
            <div key={position.name} className="mt-5">
              <h4 className="type-label">{position.name}</h4>
              <p className="type-meta mt-1 text-muted-foreground">
                {position.workPeriod}
              </p>
              <p className="work-description mt-5 text-muted-foreground">
                {position.description}
              </p>
            </div>
          ))}
          <ul className="work-contributions mt-7 grid gap-5 sm:grid-cols-3">
            {job.showcases.map((showcase) => (
              <li key={showcase.title}>
                <h4 className="type-label mb-2">{showcase.title}</h4>
                <p className="work-description text-muted-foreground">
                  {showcase.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </div>
  );
};
