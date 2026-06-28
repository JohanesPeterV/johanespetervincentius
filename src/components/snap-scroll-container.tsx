'use client';

import { setScrollTarget } from '@/components/scroll-progress';
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
    setScrollTarget(element.scrollTop / scrollable);
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
