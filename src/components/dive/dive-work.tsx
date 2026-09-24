'use client';

import { useEffect, useRef, useState } from 'react';

import { WORK_EXPERIENCES } from '@/app/_components/work-experience/work-experiences';
import { WorkExperienceCard } from './work-experience-card';
import { WorkExperienceDetail } from './work-experience-detail';

const CURRENT_JOB =
  WORK_EXPERIENCES.find((job) => job.status === 'current') ??
  WORK_EXPERIENCES[0];

const REVEAL_MARGIN = 160;
// REASON: leaves room for the fixed theme pill above the revealed display.
const REVEAL_GAP = 96;

// REASON: stacked layouts put the display below every card, so a pick would
// otherwise swap content off-screen; scroll only when it is out of view.
const revealDetails = (details: HTMLElement | null): void => {
  const section = details?.closest('[data-section-scroll]');
  if (!details || !section) {
    return;
  }
  const offset =
    details.getBoundingClientRect().top - section.getBoundingClientRect().top;
  if (offset < section.clientHeight - REVEAL_MARGIN) {
    return;
  }
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  section.scrollBy({
    top: offset - REVEAL_GAP,
    behavior: reducedMotion ? 'auto' : 'smooth',
  });
};

export const DiveWork = () => {
  const spreadRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const [selectedCompany, setSelectedCompany] = useState(CURRENT_JOB.company);

  // REASON: the section scrolls and its header changes height across viewports;
  // measure the card drop so each cord stays attached to the screen's top edge.
  useEffect(() => {
    const spread = spreadRef.current;
    const section = spread?.closest('[data-dive-section="work"]');
    if (!spread || !section) {
      return;
    }

    const slots = spread.querySelectorAll<HTMLElement>('.work-card-slot');
    const updateDrops = (): void => {
      const sectionTop = section.getBoundingClientRect().top;
      slots.forEach((slot) => {
        const hanger = slot.querySelector<HTMLElement>('.work-card-hanger');
        hanger?.style.setProperty(
          '--cord-length',
          `${Math.max(0, slot.getBoundingClientRect().top - sectionTop)}px`,
        );
      });
    };

    const observer = new ResizeObserver(updateDrops);
    observer.observe(spread);
    if (spread.previousElementSibling) {
      observer.observe(spread.previousElementSibling);
    }
    section.addEventListener('scroll', updateDrops, { passive: true });
    window.addEventListener('resize', updateDrops);
    updateDrops();

    return () => {
      observer.disconnect();
      section.removeEventListener('scroll', updateDrops);
      window.removeEventListener('resize', updateDrops);
    };
  }, []);

  const showJob = (company: string): void => {
    setSelectedCompany(company);
    revealDetails(detailsRef.current);
  };

  return (
    <>
      <span className="work-screen-edge" aria-hidden="true" />
      <header className="px-4 pb-6">
        <p className="identity-tag type-meta">Professional experience</p>
        <h2 className="work-section-title font-display">Work</h2>
      </header>
      <div
        ref={spreadRef}
        role="group"
        aria-label="Jobs"
        className="work-card-spread relative"
      >
        {WORK_EXPERIENCES.map((job, index) => (
          <WorkExperienceCard
            key={job.company}
            job={job}
            index={index}
            selectedCompany={selectedCompany}
            onSelect={showJob}
          />
        ))}
      </div>
      <div ref={detailsRef} className="work-details grid">
        {WORK_EXPERIENCES.map((job, index) => {
          const hidden = job.company !== selectedCompany;
          return (
            <div
              key={job.company}
              id={`work-detail-${index}`}
              aria-hidden={hidden}
              inert={hidden}
              className={`work-detail-slot col-start-1 row-start-1 ${hidden ? 'invisible pointer-events-none' : ''}`}
            >
              <WorkExperienceDetail job={job} index={index} />
            </div>
          );
        })}
      </div>
    </>
  );
};
