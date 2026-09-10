'use client';

import { useEffect, useState } from 'react';

import { STACK } from '@/app/_components/stack';
import { useMediaQuery } from '@/hooks/use-media-query';

const VISIBLE_SECONDARY = 4;
const ROTATE_MS = 2600;

export const StackStrip = () => {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [offset, setOffset] = useState(0);

  // REASON: the secondary tags rotate on a clock, and only a lifecycle hook
  // can advance state over time without user input
  useEffect(() => {
    if (reducedMotion) {
      return;
    }
    const timer = window.setInterval(() => {
      setOffset((current) => (current + 1) % STACK.secondary.length);
    }, ROTATE_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [reducedMotion]);

  const secondary = reducedMotion
    ? STACK.secondary
    : Array.from(
        { length: VISIBLE_SECONDARY },
        (_, index) =>
          STACK.secondary[(offset + index) % STACK.secondary.length],
      );

  return (
    <footer className="stack-strip type-meta" aria-label="Stack">
      <span className="identity-tag">Stack</span>
      <ul className="stack-list">
        {STACK.primary.map((name) => (
          <li key={name} className="stack-tag" data-tier="primary">
            {name}
          </li>
        ))}
      </ul>
      <ul className="stack-list" aria-live="off">
        {secondary.map((name) => (
          <li key={name} className="stack-tag stack-tag-enter">
            {name}
          </li>
        ))}
      </ul>
    </footer>
  );
};
