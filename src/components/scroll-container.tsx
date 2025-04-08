import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface ScrollContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function ScrollContainer({
  children,
  className,
}: ScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showTopIndicator, setShowTopIndicator] = useState(false);
  const [showBottomIndicator, setShowBottomIndicator] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkScrollable = () => {
      const hasOverflow = container.scrollHeight > container.clientHeight;
      setIsScrollable(hasOverflow);
      if (!hasOverflow) {
        setShowTopIndicator(false);
        setShowBottomIndicator(false);
        setScrollProgress(0);
      }
    };

    const handleScroll = () => {
      if (!isScrollable) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const maxScroll = scrollHeight - clientHeight;
      const progress = Math.min(scrollTop / maxScroll, 1);
      setScrollProgress(progress);

      setShowTopIndicator(scrollTop > 20);
      setShowBottomIndicator(scrollHeight - scrollTop - clientHeight > 20);
    };

    const resizeObserver = new ResizeObserver(() => {
      checkScrollable();
      handleScroll();
    });

    resizeObserver.observe(container);
    checkScrollable();
    handleScroll();

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [isScrollable]);

  return (
    <div className="relative group">
      {isScrollable && (
        <>
          <div
            className={cn(
              'absolute top-0 left-0 right-0 h-12 z-10 pointer-events-none transition-opacity duration-300',
              'bg-gradient-to-b from-background via-background/80 to-transparent',
              showTopIndicator ? 'opacity-100' : 'opacity-0',
            )}
          />

          <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary/5">
            <div
              className="w-full bg-gradient-to-b from-primary/10 to-primary/30 transition-all duration-200"
              style={{ height: `${scrollProgress * 100}%` }}
            />
          </div>

          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 h-12 z-10 pointer-events-none transition-opacity duration-300',
              'bg-gradient-to-t from-background via-background/80 to-transparent',
              showBottomIndicator ? 'opacity-100' : 'opacity-0',
            )}
          />
        </>
      )}

      <div
        ref={containerRef}
        className={cn(
          'max-h-[60vh] overflow-y-auto scrollbar-thin',
          isScrollable &&
            'scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40 scrollbar-track-transparent hover:pr-6',
          'transition-all duration-300',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
