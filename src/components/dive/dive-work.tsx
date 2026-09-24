'use client';

import { useEffect, useRef } from 'react';

import { WORK_EXPERIENCES } from '@/app/_components/work-experience/work-experiences';
import { WorkExperienceCard } from './work-experience-card';

export const DiveWork = () => {
  const spreadRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      <span className="work-screen-edge" aria-hidden="true" />
      <header className="px-4 pb-6">
        <p className="identity-tag type-meta">Professional experience</p>
        <h2 className="work-section-title font-display">Work</h2>
      </header>
      <div ref={spreadRef} className="work-card-spread relative">
        {WORK_EXPERIENCES.map((job, index) => (
          <WorkExperienceCard key={job.company} job={job} index={index} />
        ))}
      </div>
    </>
  );
};
