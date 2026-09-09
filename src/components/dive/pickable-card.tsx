'use client';

import { X } from 'lucide-react';
import { ReactNode, useId, useRef } from 'react';

import type { WorkExperience } from '@/app/_components/work-experience/work-experiences';
import { Button } from '@/components/ui/button';

type PickableCardProps = {
  title: string;
  variant: 'work' | 'project';
  status?: WorkExperience['status'];
  caption: string;
  face: ReactNode;
  children: ReactNode;
};

const cardClasses = {
  work: { slot: 'work-card-slot', button: 'work-card' },
  project: { slot: 'project-card-slot', button: 'project-card' },
};

const getPickupTransform = (
  card: HTMLButtonElement,
  dialog: HTMLDialogElement,
): string => {
  const source = card.getBoundingClientRect();
  const target = dialog.getBoundingClientRect();
  const x = source.left + source.width / 2 - target.left - target.width / 2;
  const y = source.top + source.height / 2 - target.top - target.height / 2;
  const matrix = new DOMMatrixReadOnly(getComputedStyle(card).transform);
  const angle = Math.atan2(matrix.b, matrix.a);
  const scale = Math.hypot(matrix.a, matrix.b);
  return `translate(${x}px, ${y}px) rotate(${angle}rad) scale(${(card.offsetWidth * scale) / target.width}, ${(card.offsetHeight * scale) / target.height})`;
};

export const PickableCard = ({
  title,
  variant,
  status,
  caption,
  face,
  children,
}: PickableCardProps) => {
  const cardRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const current = status === 'current';
  const titleId = useId();

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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
    <div className={cardClasses[variant].slot} data-current={current}>
      <button
        ref={cardRef}
        type="button"
        className={`${cardClasses[variant].button} surface-panel flex h-full w-full flex-col text-left`}
        aria-label={`Pick up ${title}${current ? ', current role' : ''}`}
        aria-haspopup="dialog"
        onClick={handlePick}
      >
        {face}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        data-card-details
        className="card-detail surface-panel text-left"
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
            <span className="whitespace-nowrap">{caption}</span>
            {current ? (
              <span className="work-current-label">Current role</span>
            ) : null}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-11 gap-2"
            onClick={handleReturn}
            aria-label={`Put ${title} card back`}
          >
            Put back <X aria-hidden />
          </Button>
        </header>
        <div
          className="card-detail-content min-h-0 overflow-y-auto overscroll-contain scrollbar-thin"
          data-section-scroll
          tabIndex={0}
          role="region"
          aria-label={`${title} details`}
        >
          <h3 id={titleId} className="card-detail-title font-display">
            {title}
          </h3>
          {children}
        </div>
      </dialog>
    </div>
  );
};
