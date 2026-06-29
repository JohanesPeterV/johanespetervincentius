'use client';

import { cn } from '@/lib/utils';

interface SnapScrollContainerProps {
  children: React.ReactNode[];
  className?: string;
}

export default function SnapScrollContainer({
  children,
  className,
}: SnapScrollContainerProps) {
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
      className={cn('h-screen w-full overflow-y-auto', className)}
    >
      {children.map((child, index) => (
        <div
          key={index}
          data-index={index}
          className="flex min-h-screen items-center justify-center"
        >
          {child}
        </div>
      ))}
    </div>
  );
}
