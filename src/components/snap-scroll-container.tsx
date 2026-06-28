'use client';

import { useRef } from 'react';

interface SnapScrollContainerProps {
  children: React.ReactNode[];
  className?: string;
}

export default function SnapScrollContainer({
  children,
  className,
}: SnapScrollContainerProps) {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>): void => {
    const element = event.currentTarget;
    const scrollable = element.scrollHeight - element.clientHeight;
    if (scrollable <= 0) {
      return;
    }
    const progress = Math.min(1, Math.max(0, element.scrollTop / scrollable));
    const root = document.documentElement;
    root.style.setProperty('--wipe', String(progress));
    root.style.setProperty('--wipe-edge', String(Math.sin(progress * Math.PI)));
  };

  return (
    <div
      onScroll={handleScroll}
      className={`${className} h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide`}
    >
      {children.map((child, index) => (
        <div
          key={index}
          ref={(el) => {
            sectionRefs.current[index] = el;
          }}
          data-index={index}
          className={`h-screen snap-center flex items-center justify-center`}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
