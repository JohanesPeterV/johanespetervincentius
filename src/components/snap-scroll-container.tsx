import { cn } from '@/lib/utils';

interface SnapScrollContainerProps {
  children: React.ReactNode[];
  className?: string;
}

export default function SnapScrollContainer({
  children,
  className,
}: SnapScrollContainerProps) {
  return (
    <div className={cn('h-screen w-full overflow-y-auto', className)}>
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
