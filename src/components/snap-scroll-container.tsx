'use client';

import { useInertialWipe } from '@/hooks/use-wipe';
import { cn } from '@/lib/utils';

interface SnapScrollContainerProps {
  children: React.ReactNode[];
  className?: string;
}

export default function SnapScrollContainer({
  children,
  className,
}: SnapScrollContainerProps) {
  const handleScroll = useInertialWipe();

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
